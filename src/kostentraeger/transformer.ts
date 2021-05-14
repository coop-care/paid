import { 
    BundeslandSchluessel,
    DatenlieferungsartSchluessel,
    KostentraegerSGBVAbrechnungscodeSchluessel,
    KostentraegerSGBXILeistungsartSchluessel,
    KVBezirkSchluessel, 
    LeistungserbringergruppeSchluessel
} from "./edifact/codes"
import { KOTRInterchange, KOTRMessage, ANS, ASP, DFU, UEM, VKG } from "./edifact/segments"
import { VerfahrenSchluessel } from "./filename/codes"
import { 
    Address, 
    Contact, 
    Institution, 
    InstitutionLink, 
    InstitutionListParseResult,
    KVLocationSchluessel,
    PaperDataType,
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
            leistungserbringerGruppeSchluessel: verfahrenToLeistungserbringergruppeSchluessel(interchange.filename.verfahren),
            kassenart: interchange.filename.kassenart,
            validityStartDate: validityStartDate,
            institutions: institutions
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
        .map((vkg) => createInstitutionLink(vkg))

    const datenannahmestelleLinks = msg.vkgList
        .filter((vkg) => vkg.ikVerknuepfungsartSchluessel == "03")
        .map((vkg) => createInstitutionLink(vkg))
    
    const untrustedDatenannahmestelleLinks = msg.vkgList
        .filter((vkg) => vkg.ikVerknuepfungsartSchluessel == "02")
        .map((vkg) => createInstitutionLink(vkg))

    const papierannahmestelleLinks = msg.vkgList
        .filter((vkg) => vkg.ikVerknuepfungsartSchluessel == "09")
        .map((vkg) => createPapierannahmestelleLink(vkg))

    const contacts = msg.aspList.map((asp) => createContact(asp))

    return {
        ik: msg.idk.ik,
        name: msg.nam.names.join(" "),
        abbreviatedName: msg.idk.abbreviatedName,
        
        vertragskassennummer: msg.idk.vertragskassennummer,

        validityFrom: msgValidityStartDate > interchangeValidityStartDate ? msgValidityStartDate : undefined,
        validityTo: msgValidityEndDate,

        contacts: contacts.length > 0 ? contacts : undefined,
        addresses: msg.ansList.map((ans) => createAddress(ans)),
        transmissionMethods: createReceiptTransmissionMethods(msg.uemList, msg.dfuList),
        kostentraegerLinks: kostentraegerLinks.length > 0 ? kostentraegerLinks : undefined,
        datenannahmestelleLinks: datenannahmestelleLinks.length > 0 ? datenannahmestelleLinks : undefined,
        untrustedDatenannahmestelleLinks: untrustedDatenannahmestelleLinks.length > 0 ? untrustedDatenannahmestelleLinks : undefined,
        papierannahmestelleLinks: papierannahmestelleLinks.length > 0 ? papierannahmestelleLinks : undefined
    }
}

function createPapierannahmestelleLink(vkg: VKG): PapierannahmestelleLink {
    const institutionLink = createInstitutionLink(vkg)
    const paperType = datenlieferungsartSchluesselToPaperType(vkg.datenlieferungsartSchluessel!)

    return { ...institutionLink, types: paperType }
}

function datenlieferungsartSchluesselToPaperType(schluessel: DatenlieferungsartSchluessel): PaperDataType {
    switch(schluessel) {
        case "21": 
            return PaperDataType.Receipt
        case "24": 
            return PaperDataType.MachineReadableReceipt
        case "26":
            return PaperDataType.Prescription
        case "27":
            return PaperDataType.CostEstimate
        case "28":
            return PaperDataType.Receipt | PaperDataType.Prescription | PaperDataType.CostEstimate
        case "29":
            return PaperDataType.MachineReadableReceipt | PaperDataType.Prescription | PaperDataType.CostEstimate
    }
    return 0
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
    if (uemList.length == 0 || dfuList.length == 0) return undefined

    let zeichensatzSchluessel, email, ftam
    zeichensatzSchluessel = uemList.find((uem) => uem.uebermittlungsmediumSchluessel == "1")?.uebermittlungszeichensatzSchluessel
    email = dfuList.find((dfu) => dfu.dfuProtokollSchluessel == "070")?.address
    ftam = dfuList.find((dfu) => dfu.dfuProtokollSchluessel == "016")?.address

    return {
        email: email,
        ftam: ftam,
        zeichensatz: zeichensatzSchluessel!
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
