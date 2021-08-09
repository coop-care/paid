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
import { PublicKeyInfo } from "./pki/types"
import { 
    Address, 
    Contact, 
    Institution, 
    InstitutionLink, 
    InstitutionListParseResult,
    KVLocationSchluessel,
    PaperDataType,
    PapierannahmestelleLink,
    ReceiptTransmission
} from "./types"


const datenlieferungsartSchluesselToPaperType = 
    new Map<DatenlieferungsartSchluessel, PaperDataType>([
        ["21", PaperDataType.Receipt],
        ["24", PaperDataType.MachineReadableReceipt],
        ["26", PaperDataType.Prescription],
        ["27", PaperDataType.CostEstimate],
        ["28", PaperDataType.Receipt | PaperDataType.Prescription | PaperDataType.CostEstimate],
        ["29", PaperDataType.MachineReadableReceipt | PaperDataType.Prescription | PaperDataType.CostEstimate]
    ])

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


export default function transform(pkeys: Map<string, PublicKeyInfo[]>, interchange: KOTRInterchange): InstitutionListParseResult {

    const validityStartDate = interchange.filename.validityStartDate

    const warnings: string[] = []
    const institutions = interchange.institutions.map((msg) => {
        try {
            return transformMessage(pkeys, msg, validityStartDate)
        } catch(e) {
            warnings.push(e.message)
        }
    }).filter((msg): msg is Institution => !!msg)

    warnings.push(...validateLinks(institutions))

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

function validateLinks(institutions: Institution[]): string[] {
    const errors: string[] = []
    const institutionsByIK = new Map<string, Institution>()
    institutions.forEach((institution) => {
        institutionsByIK.set(institution.ik, institution)
    })

    institutions.forEach((institution) => {
        const errMsg = `IK ${institution.ik} (${institution.abbreviatedName})`
        /* the link target to every link to a Datenannahme with capacity to decrypt must 
            either accept email themselves or lead to one that does in one link-step */
        institution.datenannahmestelleLinks?.forEach((link) => {
            const da = institutionsByIK.get(link.ik)
            if (!da?.transmission) {
                const butALinkAcceptsData = da?.untrustedDatenannahmestelleLinks?.some((link2) => {
                    const uda = institutionsByIK.get(link2.ik)
                    return !!(uda?.transmission)
                })
                if (!butALinkAcceptsData) {
                    errors.push(`${errMsg} links to IK ${link.ik} for data but neither that IK nor an IK it links to accepts SMTP (email)`)
                }
            }
            /** each Datenannahme with capacity to decrypt must have a public key */
            if (!da?.publicKeys) {
                errors.push(`${errMsg} links to IK ${link.ik} for data but there is not any public key for encryption`)
            }
        })
    })
    return errors
}


function verfahrenToLeistungserbringergruppeSchluessel(verfahren: VerfahrenSchluessel): LeistungserbringergruppeSchluessel {
    switch(verfahren) {
        case "05": return "5"
        case "06": return "6"
    }
    throw new Error(`Expected Kostenträger file Verfahren to be "05" or "06" but was "${verfahren}"`)
}


function transformMessage(pkeys: Map<string, PublicKeyInfo[]>, msg: KOTRMessage, interchangeValidityStartDate: Date): Institution | null {
    /* Since the use of this field was unclear to us, we asked GKV-Spitzenverband.
       
       They answered that this field marks whether an entry was added, changed, not changed or 
       deleted. Since the Kostenträger-file is always published as a complete directory (and not a 
       diff of sorts), they are of no relevance here, because we also produce a complete directory
       and not a diff.
       
       > Mit Hilfe des Verarbeitungskennzeichens kann ein Nutzer erkennen, ob und wenn ja, welche 
       > Art von Veränderung in der Kostenträgerdatei enthalten ist. Da die Kostenträgerdateien
       > immer als Gesamtverzeichnis aller IK und aller Datenannahmestellen je Kassenart 
       > bereitgestellt werden, liegt dem Nutzer aber unabhängig vom Verarbeitungskennzeichen aber
       > immer ein vollständiges Verzeichnis vor. 

       But to be on the same side, we will not include "03" in the parse result as it means 
       "this entry was deleted".
    */
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

    const papierannahmestelleLinks = createPapierannahmestelleLinks(msg.vkgList)

    const contacts = msg.aspList.map((asp) => createContact(asp))

    const publicKeys = pkeys.get(msg.idk.ik)

    return {
        ik: msg.idk.ik,
        name: msg.nam.names.join(" "),
        abbreviatedName: msg.idk.abbreviatedName,
        
        vertragskassennummer: msg.idk.vertragskassennummer,

        validityFrom: msgValidityStartDate > interchangeValidityStartDate ? msgValidityStartDate : undefined,
        validityTo: msgValidityEndDate,

        contacts: contacts.length > 0 ? contacts : undefined,
        addresses: msg.ansList.map((ans) => createAddress(ans)),
        transmission: createReceiptTransmission(msg.uemList, msg.dfuList),
        publicKeys: publicKeys,
        kostentraegerLinks: kostentraegerLinks.length > 0 ? kostentraegerLinks : undefined,
        datenannahmestelleLinks: datenannahmestelleLinks.length > 0 ? datenannahmestelleLinks : undefined,
        untrustedDatenannahmestelleLinks: untrustedDatenannahmestelleLinks.length > 0 ? untrustedDatenannahmestelleLinks : undefined,
        papierannahmestelleLinks: papierannahmestelleLinks.length > 0 ? papierannahmestelleLinks : undefined
    }
}

/** Due to the limitations of the EDIFACT format, a link to a Papierannahmestelle that accepts 
 *  any paper may result in 2 - 6 links. Let's merge them here as well... */
function createPapierannahmestelleLinks(vkgs: VKG[]): PapierannahmestelleLink[] {
    const result: PapierannahmestelleLink[] = []
    vkgs.forEach((vkg) => {
        if (vkg.ikVerknuepfungsartSchluessel == "09") {
            const paperType = datenlieferungsartSchluesselToPaperType.get(vkg.datenlieferungsartSchluessel!) ?? 0
            const institutionLink = { ...createInstitutionLink(vkg), paperTypes: paperType }

            const existingInstitutionLink = result.find(link => isInstitutionLinkEqual(link, institutionLink))
            if (existingInstitutionLink) {
                existingInstitutionLink.paperTypes |= paperType
            } else {
                result.push(institutionLink)
            }
        }
    })
    return result
}

function isInstitutionLinkEqual(a: InstitutionLink, b: InstitutionLink): boolean {
    return a.ik == b.ik && 
           a.location == a.location && 
           a.sgbvAbrechnungscode == b.sgbvAbrechnungscode && 
           a.sgbxiLeistungsart == b.sgbxiLeistungsart
}

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

function createReceiptTransmission(uemList: UEM[], dfuList: DFU[]): ReceiptTransmission | undefined {
    if (uemList.length == 0 || dfuList.length == 0) return undefined

    const zeichensatzSchluessel = uemList.find((uem) => uem.uebermittlungsmediumSchluessel == "1")?.uebermittlungszeichensatzSchluessel
    const email = dfuList.find((dfu) => dfu.dfuProtokollSchluessel == "070")?.address

    if (!email) return undefined

    return {
        email: email,
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
