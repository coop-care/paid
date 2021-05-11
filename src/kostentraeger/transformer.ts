import { 
    BundeslandSchluessel,
    KostentraegerSGBVAbrechnungscodeSchluessel,
    KostentraegerSGBXILeistungsartSchluessel,
    KVBezirkSchluessel, 
    LeistungserbringergruppeSchluessel
} from "./edifact/codes"
import { KOTRInterchange, KOTRMessage, ANS, ASP, DFU, KTO, UEM, VKG } from "./edifact/segments"
import { VerfahrenSchluessel } from "./filename/codes"
import { 
    Address, 
    Contact, 
    DatenannahmestelleLink, 
    Institution, 
    InstitutionLink, 
    InstitutionListParseResult,
    KostentraegerLink,
    KVLocationSchluessel,
    PapierannahmestelleLink,
    ReceiptTransmissionMethods
} from "./types"

export default function transform(interchange: KOTRInterchange): InstitutionListParseResult {

    const validityStartDate = interchange.filename.validityStartDate

    const warnings: string[] = []
    const institutions = interchange.institutions.map((msg) => {
        try {
            return transformMessage(msg, validityStartDate)
        } catch(e) {
            warnings.push(e.message)
        }
    }).filter((msg): msg is Institution => !!msg)

    return {
        institutionList: {
            issuerIK: interchange.issuerIK,
            institutions: institutions,
            leistungserbringerGruppeSchluessel: verfahrenToLeistungserbringergruppeSchluessel(interchange.filename.verfahren),
        },
        warnings: warnings
    }
}

function verfahrenToLeistungserbringergruppeSchluessel(verfahren: VerfahrenSchluessel): LeistungserbringergruppeSchluessel {
    switch(verfahren) {
        case "05": return "5"
        case "06": return "6"
    }
    throw new Error(`Expected Kostenträger file Verfahren to be "05" or "06" but was "${verfahren}"`)
}


function transformMessage(msg: KOTRMessage, interchangeValidityStartDate: Date): Institution | null {

    /* in practice, this doesn't really seem to be used and usage of this field is inconsistent for the
       different umbrella organizations that issue the Kostenträger-file. "03" however seems to mean
       "delete this entry" */
    if (msg.fkt.verarbeitungskennzeichenSchluessel == "03") {
        return null
    }

    /* no need to include institutions that are not valid anymore when this kostenträger file
       becomes valid */
    const msgValidityStartDate = msg.vdt.validityFrom
    const msgValidityEndDate = msg.vdt.validityTo
    if (msgValidityEndDate && msgValidityEndDate < interchangeValidityStartDate) {
        return null
    }

    /* Simplification: Certain data is documented that it could be different, but de-facto it's not.
       Let's assert that it is never a value so that our data model and application logic can be 
       simpler
     */

    const messageTxt = `Message ${msg.id} -`

    if (msg.idk.institutionsart != "99") {
        throw new Error(`${messageTxt} Expected that "institutionsart" is always 99`)
    }

    msg.dfuList.forEach((dfu) => {
        if (dfu.allowedTransmissionDays && dfu.allowedTransmissionDays != "1") {
            throw new Error(`${messageTxt} Expected that transmission is allowed on any day but was "${dfu.allowedTransmissionDays}"`)
        }
        // some health insurances specify "0000" as end time, means supposedly the same as "2400"
        if (dfu.allowedTransmissionTimeEnd == "0000") {
            dfu.allowedTransmissionTimeEnd = "2400"
        }
        if (
            dfu.allowedTransmissionTimeStart && dfu.allowedTransmissionTimeStart != "0000"
            || dfu.allowedTransmissionTimeEnd && dfu.allowedTransmissionTimeEnd != "2400"
        ) {
            const start = dfu.allowedTransmissionTimeStart
            const end = dfu.allowedTransmissionTimeEnd
            throw new Error(`${messageTxt} Expected that transmission is allowed at any time but was ${start}-${end}`)
        }

        if (dfu.benutzerkennung) {
            throw new Error(`${messageTxt} Expected that "benutzerkennung" is empty`)
        }
    })

    if (msg.uemList.length > 0) {
        const acceptsInternetOrPaperReceipts = msg.uemList.some((uem) => ["1","5","6"].includes(uem.uebermittlungsmediumSchluessel))
        if (!acceptsInternetOrPaperReceipts) {
            throw new Error(`${messageTxt} Expected that institution at least accepts either paper receipts or receipts sent over internet`)
        }
    }

    msg.vkgList.forEach((vkg) => {
        if (vkg.ikVerknuepfungsartSchluessel == "00") {
            throw new Error (`Expected that ikVerknuepfungsartSchluessel is never "00"`)
        }
    })

    const kostentraegerLinks = msg.vkgList
        .filter((vkg) => vkg.ikVerknuepfungsartSchluessel == "01")
        .map((vkg) => createKostentraegerLink(vkg))

    const datenannahmestelleLinks = msg.vkgList
        .filter((vkg) => ["02", "03"].includes(vkg.ikVerknuepfungsartSchluessel))
        .map((vkg) => createDatenannahmestelleLink(vkg))
    
    const papierannahmestelleLinks = msg.vkgList
        .filter((vkg) => vkg.ikVerknuepfungsartSchluessel == "09")
        .map((vkg) => createPapierannahmestelleLink(vkg))

    return {
        ik: msg.idk.ik,
        name: msg.nam.names.join(" "),
        abbreviatedName: msg.idk.abbreviatedName,
        
        vertragskassennummer: msg.idk.vertragskassennummer,

        validityFrom: msgValidityStartDate > interchangeValidityStartDate ? msgValidityStartDate : undefined,
        validityTo: msgValidityEndDate,

        contacts: msg.aspList.map((asp) => createContact(asp)),
        addresses: msg.ansList.map((ans) => createAddress(ans)),
        transmissionMethods: createReceiptTransmissionMethods(msg.uemList, msg.dfuList),
        kostentraegerLinks: kostentraegerLinks,
        datenannahmestelleLinks: datenannahmestelleLinks,
        papierannahmestelleLinks: papierannahmestelleLinks
    }
}

function createPapierannahmestelleLink(vkg: VKG): PapierannahmestelleLink {
    const institutionLink = createInstitutionLink(vkg)
    
    const lieferungsartSchluessel = vkg.datenlieferungsartSchluessel
    let paperReceipt = false
    let machineReadablePaperReceipt = false
    let prescription = false
    let costEstimate = false
    switch(lieferungsartSchluessel) {
        case "21": 
            paperReceipt = true
            break
        case "24": 
            machineReadablePaperReceipt = true
            break
        case "26":
            prescription = true
            break
        case "27":
            costEstimate = true
            break
        case "28":
            paperReceipt = true
            prescription = true
            costEstimate = true
            break
        case "29":
            machineReadablePaperReceipt = true
            prescription = true
            costEstimate = true
            break
    }

    return { ...institutionLink,
        paperReceipt: paperReceipt,
        machineReadablePaperReceipt: machineReadablePaperReceipt,
        prescription: prescription,
        costEstimate: costEstimate
    }
}

function createDatenannahmestelleLink(vkg: VKG): DatenannahmestelleLink {
    const institutionLink = createInstitutionLink(vkg)
    const verknuepfungsart = vkg.ikVerknuepfungsartSchluessel
    let canDecrypt: boolean
    if (verknuepfungsart == "02") {
        canDecrypt = false
    } else if (verknuepfungsart == "03") {
        canDecrypt = true
    } else {
        throw new Error(`Unexpected value "${verknuepfungsart}" for ikVerknuepfungsartSchluessel`)
    }
    return { ...institutionLink, canDecrypt: canDecrypt }
}
    
function createKostentraegerLink(vkg: VKG): KostentraegerLink {
    return createInstitutionLink(vkg)
}

const bundeslandSchluesselToKVLocation = 
    new Map<BundeslandSchluessel, KVLocationSchluessel>([
        ["01", "SH"],
        ["02", "HH"],
        ["03", "NI"],
        ["04", "HB"],
        ["05", "NW"],
        ["06", "HE"],
        ["07", "RP"],
        ["08", "BW"],
        ["09", "BY"],
        ["10", "SL"],
        ["11", "BE"],
        ["12", "BB"],
        ["13", "MV"],
        ["14", "SN"],
        ["15", "ST"],
        ["16", "TH"]
    ])

const kvBezirkSchluesselToKVLocation = 
    new Map<KVBezirkSchluessel, KVLocationSchluessel>([
        ["01", "SH"],
        ["02", "HH"],
        ["03", "HB"],
        ["17", "NI"],
        ["20", "Westfalen-Lippe"],
        ["38", "Nordrhein"],
        ["46", "HE"],
        ["71", "BY"],
        ["72", "BE"],
        ["73", "SL"],
        ["78", "MV"],
        ["83", "BB"],
        ["88", "ST"],
        ["93", "TH"],
        ["98", "SN"]
    ])

function createInstitutionLink(vkg: VKG): InstitutionLink {
    if (vkg.abrechnungsstelleIK) {
        throw new Error(`Expected that abrechnungsstelleIK is never set, but was "${vkg.abrechnungsstelleIK}"`)
    }

    let kvLocationSchluessel: KVLocationSchluessel | undefined

    const bundesland = vkg.standortLeistungserbringerBundeslandSchluessel
    const bezirk = vkg.standortLeistungserbringerKVBezirkSchluessel
    if (bezirk) {
        kvLocationSchluessel = kvBezirkSchluesselToKVLocation.get(bezirk)
        if (!kvLocationSchluessel) {
            throw new Error(`Unexpected value "${bezirk}" for standortLeistungserbringerKVBezirkSchluessel `)
        }
    } else if (bundesland == "99") {
        kvLocationSchluessel = undefined
    } else if (bundesland) {
        kvLocationSchluessel = bundeslandSchluesselToKVLocation.get(bundesland)
        if (!kvLocationSchluessel) {
            throw new Error(`Unexpected value "${bundesland}" for standortLeistungserbringerBundeslandSchluessel`)
        }
    } else {
        kvLocationSchluessel = undefined
    }

    if (vkg.tarifkennzeichen) {
        throw new Error(`Expected that tarifkennzeichen is never set, but was "${vkg.tarifkennzeichen}"`)
    }
    
    const leGruppeSchluessel = vkg.leistungserbringergruppeSchluessel
    let sgbvAbrechnungscode: KostentraegerSGBVAbrechnungscodeSchluessel | undefined
    let sgbxiLeistungsart: KostentraegerSGBXILeistungsartSchluessel | undefined
    if (leGruppeSchluessel == "5") {
        const schluessel = vkg.sgbvAbrechnungscodeSchluessel
        sgbvAbrechnungscode = schluessel ?? "00"
    } else if (leGruppeSchluessel == "6") {
        const schluessel = vkg.sgbxiLeistungsartSchluessel
        sgbxiLeistungsart = schluessel ?? "00"
    }

    return {
        ik: vkg.verknuepfungspartnerIK,
        location: kvLocationSchluessel,
        sgbvAbrechnungscode: sgbvAbrechnungscode,
        sgbxiLeistungsart: sgbxiLeistungsart
    }
}

function createReceiptTransmissionMethods(uemList: UEM[], dfuList: DFU[]): ReceiptTransmissionMethods | undefined {
    if (uemList.length == 0) return undefined

    const machineReadablePaperReceipt = uemList.some((uem) => uem.uebermittlungsmediumSchluessel == "5")
    const paperReceipt = uemList.some((uem) => uem.uebermittlungsmediumSchluessel == "6")

    let zeichensatzSchluessel, email, ftam
    if (dfuList.length > 0) {
        zeichensatzSchluessel = uemList.find((uem) => uem.uebermittlungsmediumSchluessel == "1")?.uebermittlungszeichensatzSchluessel
        email = dfuList.find((dfu) => dfu.dfuProtokollSchluessel == "070")?.address
        ftam = dfuList.find((dfu) => dfu.dfuProtokollSchluessel == "016")?.address
    }

    if(!paperReceipt && !machineReadablePaperReceipt && !email && !ftam) {
        throw new Error(`Expected that institution accepts either paper receipts or sent via email or ftam`)
    }

    return {
        paperReceipt: paperReceipt,
        machineReadablePaperReceipt: machineReadablePaperReceipt,
        email: email,
        ftam: ftam,
        zeichensatz: zeichensatzSchluessel
    }
}

function createContact(asp: ASP): Contact {
    return {
        phone: asp.phone,
        fax: asp.fax,
        name: asp.name,
        fieldOfWork: asp.fieldOfWork
    }
}

function createAddress(ans: ANS): Address {
    const { place, postcode, address } = ans

    switch(ans.anschriftartSchluessel) {
        case "1": return { place: place, postcode: postcode, streetAndHousenumber: address }
        case "2": return { place: place, postcode: postcode, poBox: address }
        case "3": return { place: place, postcode: postcode }
    }
}
