/** based on documents: 
 *  - Pflege, Technische Anlage 1, Anhang 5: Kostenträgerdatei
 *  - Sonstige Leistungserbringer, Anlage 1, Anhang 3, Kapitel 10: Kostenträgerdatei
 * 
 * (see /docs/documents.md for more info)
 */
import parseFilename from "../filename/parser"
import { parseDate } from "../../edifact/parse_utils"
import { Interchange, Message } from "../../edifact/types"
import { 
    sgbvAbrechnungscodeSonderschluessel, KostentraegerSGBVAbrechnungscodeSchluessel,
    anschriftartSchluessel, AnschriftartSchluessel,
    bundeslandSchluessel, BundeslandSchluessel,
    datenlieferungsArtSchluessel, DatenlieferungsartSchluessel,
    dfuProtokollSchluessel, DFUProtokollSchluessel,
    ikVerknuepfungsartSchluessel, IKVerknuepfungsartSchluessel, 
    kvBezirkSchluessel, KVBezirkSchluessel, 
    leistungserbringergruppeSchluessel, LeistungserbringergruppeSchluessel, 
    sgbxiLeistungsartSonderschluessel, KostentraegerSGBXILeistungsartSchluessel, 
    uebermittlungsmediumParameterSchluessel, UebermittlungsmediumParameterSchluessel, 
    uebermittlungsmediumSchluessel, UebermittlungsmediumSchluessel,
    uebermittlungszeichensatzSchluessel, UebermittlungszeichensatzSchluessel,
    uebertragungstageSchluessel, UebertragungstageSchluessel,
    verarbeitungskennzeichenSchluessel, VerarbeitungskennzeichenSchluessel
} from "./codes"
import {
    abrechnungscodeSchluessel as sgbvAbrechnungscodeSchluessel
} from "../../sgb-v/codes"
import {
    leistungsartSchluessel as sgbxiLeistungsartSchluessel
} from "../../sgb-xi/codes"
import { 
    KOTRInterchangeParseResult, KOTRMessageParseResult, KOTRMessage, 
    ANS, ASP, DFU, FKT, IDK, KTO, NAM, UEM, VDT, VKG
} from "./segments"

/** 
 *  Parses a Kostenträgerdatei (payer file) which provides information how to send invoices to the
 *  statutory health insurance as a health care service provider.
 * 
 *  The implementation only covers Pflegedienstleistungen (care providers) and Sonstige Leistungserbringer
 *  (miscellaneous providers of health care services)
 */

/* Transforms the serial data (array of arrays) from a Kostenträger EDIFACT-interchange into legible
 * messages with labelled typesafe segments. It does however not divorce the data structure from 
 * (the limitations of) the EDIFACT message format yet. */
export default function parse(interchange: Interchange): KOTRInterchangeParseResult {
    const header = interchange.header

    const warnings: string[] = []
    const institutions = interchange.messages
        .map((message) => { 
            try {
                const parseResult = parseMessage(message)
                warnings.push(...parseResult.warnings)
                return parseResult.message
            } catch(e) {
                warnings.push("skipped invalid " + e.message)
            }
         })
        .filter((msg): msg is KOTRMessage => !!msg)

    let fname = header[6][0]
    const filenameElements = parseFilename(fname.substring(0, 8) + '.' + fname.substring(8, 11))

    warnings.push(...validateLinks(institutions))

    return {
        interchange: {
            issuerIK: header[1][0],
            /* creation date and time would be in header[3][0] and header[3][1], but date format is 
               sometimes YYYYMMDD, sometimes YYMMDD and the info is not really needed anyway. So
               no need to parse it, it only increases the complexity of this parser */
            institutions: institutions,
            filename: filenameElements
        },
        warnings: warnings
    }
}

/** Validate if all the VKG-links given in each KOTRMessage actually lead anywhere and also are
 *  not contradictory
*/
function validateLinks(institutions: KOTRMessage[]): string[] {
    const errors: string[] = []
    const institutionsByIK = new Map<string, KOTRMessage>()
    institutions.forEach((msg) => {
        institutionsByIK.set(msg.idk.ik, msg)
    })

    institutions.forEach((msg) => {
        msg.vkgList.forEach((vkg) => {
            const errMsg = `IK ${msg.idk.ik} (${msg.idk.abbreviatedName}) links to IK ${vkg.verknuepfungspartnerIK}`
            // every linked verknuepfungspartner must exist
            if (!institutionsByIK.has(vkg.verknuepfungspartnerIK)) {
                errors.push(`${errMsg} but that IK does not exist`)
            } else {
                const institution = institutionsByIK.get(vkg.verknuepfungspartnerIK)!
                const acceptsData = isInstitutionAcceptingData(institution)
                /* the link target to every link to a Datenannahmestelle without decrypt capacity 
                   must actually accept data */
                if (vkg.ikVerknuepfungsartSchluessel == "02") {
                    if (!acceptsData) {
                        errors.push(`${errMsg} for data but that IK does not accept data`)
                    }
                }
                /* the link target to every link to a Datenannahme with capacity to decrypt must 
                   either accept data themselves or lead to one that does in one link-step */
                if (vkg.ikVerknuepfungsartSchluessel == "03") {
                    if (!acceptsData) {
                        const butALinkAcceptsData = institution.vkgList.some((vkg) => {
                            if (vkg.ikVerknuepfungsartSchluessel == "02") {
                                const datenannahmestelle = institutionsByIK.get(vkg.verknuepfungspartnerIK)
                                if (datenannahmestelle && isInstitutionAcceptingData(datenannahmestelle)) {
                                    return true
                                }
                            }
                            return false
                        })
                        if (!butALinkAcceptsData) {
                            errors.push(`${errMsg} for data but neither that IK nor an IK it links to accepts data`)
                        }
                    }
                }
            }
        })
    })
    return errors
}

function isInstitutionAcceptingData(institution: KOTRMessage): boolean {
    return institution.uemList.some(uem => 
        ["1","2","3","4","7","9"].includes(uem.uebermittlungsmediumSchluessel)
    )
}

/** Parse only one message of the interchange */
function parseMessage(message: Message): KOTRMessageParseResult {
    const messageId = parseInt(message.header[0][0])
    const messageTxt = `message ${messageId} -`
    const messageType = message.header[1][0]
    if (messageType != "KOTR") {
        throw new Error(`${messageTxt} Unknown message type ${messageType}`)
    }
    const messageTypeVersion = parseInt(message.header[1][1])
    if (messageTypeVersion > 2) {
        throw new Error(`${messageTxt} Unsupported message type version ${messageTypeVersion}`)
    }

    let idk: IDK | undefined
    let vdt: VDT | undefined
    let nam: NAM | undefined
    let fkt: FKT | undefined
    let kto: KTO | undefined
    const ansList = new Array<ANS>()
    const aspList = new Array<ASP>()
    const dfuList = new Array<DFU>()
    let uemList = new Array<UEM>() 
    const vkgList = new Array<VKG>()

    const warnings: string[] = []

    let vkgCount = 0
    let uemCount = 0
    let ansCount = 0

    message.segments.forEach((segment) => {
        const tag = segment.tag
        /* the Kostenträger file does not use components at all (i.e. one element consists of 
           exactly one component), so let's make a shortcut */
        const elements = segment.elements.map((e) => e[0])

        try {
            switch(tag) {
                case "IDK": // Identifikation
                    idk = readIDK(elements)
                    break
                case "VDT": // Verwaltungsdaten 
                    /* Simplification:
                       Actually, a VDT segment may follow ANY segment within a message, attaching
                       a validity date range to it. This would complicate the data model quite a bit
                       and it seems that this is not used, so let's skip this.
                     */
                    if (vdt) {
                        throw new Error("This parser does not support multiple VDT segments in one message")
                    }
                    vdt = readVDT(elements)
                    break
                case "FKT": // Funktion
                    fkt = readFKT(elements)
                    break
                case "KTO": // Kontoverbindung
                    kto = readKTO(elements)
                    break
                case "VKG": // Verknüpfung
                    try {
                        ++vkgCount
                        vkgList.push(readVKG(elements))
                    } catch(e) {
                        warnings.push(messageTxt + " skipped invalid VKG " + vkgCount + ": " + e.message)
                    }
                    break
                case "NAM": // Name
                    nam = readNAM(elements)
                    break
                case "ANS": // Anschrift
                    try {
                        ++ansCount
                        ansList.push(readANS(elements))
                    } catch(e) {
                        warnings.push(messageTxt + " skipped invalid ANS " + ansCount + ": " + e.message)
                    }
                    break
                case "ASP": // Ansprechpartner
                    aspList.push(readASP(elements))
                    break
                case "UEM": // Übermittlungsmedium
                    try {
                        ++uemCount
                        uemList.push(readUEM(elements))
                    } catch(e) {
                        warnings.push(messageTxt + " skipped invalid UEM " + uemCount + ": " + e.message)
                    }
                    break
                case "DFU": // Datenfernübertragung
                    try {
                        dfuList.push(readDFU(elements))
                    } catch(e) {
                        const index = parseInt(elements[0])
                        warnings.push(messageTxt + " skipped invalid DFU " + index + ": " + e.message)
                    }
                    break
            }
        } catch (error) {
            error.message = messageTxt + " " + error.message
            throw error
        }
    })

    if (!idk) {
        throw new Error(`${messageTxt} The mandatory segment "IDK" is missing`)
    }
    if (!vdt) {
        throw new Error(`${messageTxt} The mandatory segment "VDT" is missing`)
    }
    if (!nam) {
        throw new Error(`${messageTxt} The mandatory segment "NAM" is missing`)
    }
    if (!fkt) {
        throw new Error(`${messageTxt} The mandatory segment "FKT" is missing`)
    }
    if (ansList.length == 0) {
        throw new Error(`${messageTxt} At least one "ANS" element is required`)
    }
    uemList = uemList.filter((uem, index) => {
        if (uem.uebermittlungsmediumSchluessel == "1" && dfuList.length == 0) {
            warnings.push(`${messageTxt} skipped invalid UEM ${index+1}: Refers to a non-existing DFU`)
            return false
        } else {
            return true
        }
    })

    aspList.sort((a, b) => a.index - b.index)
    dfuList.sort((a, b) => a.index - b.index)

    return {
        message: {
            id: messageId,
            idk: idk,
            vdt: vdt,
            fkt: fkt,
            nam: nam,
            kto: kto,
            vkgList: vkgList,
            ansList: ansList,
            aspList: aspList,
            dfuList: dfuList,
            uemList: uemList
        },
        warnings: warnings
    }
}

const readIDK = (e: string[]): IDK => ({
    ik: e[0],
    institutionsart: e[1], 
    abbreviatedName: e[2],
    vertragskassennummer: e.length > 3 ? parseInt(e[3]) : undefined
})

const readVDT = (e: string[]): VDT => ({
    validityFrom: parseDate(e[0]),
    validityTo: e[1] ? parseDate(e[1]) : undefined
})

const readFKT = (e: string[]): FKT => {
    const k = e[0]
    if (!verarbeitungskennzeichenSchluessel.hasOwnProperty(k)) {
        throw new Error(`Unknown VerarbeitungskennzeichenSchluessel "${k}"`)
    }
    return { verarbeitungskennzeichenSchluessel: k as VerarbeitungskennzeichenSchluessel }
}

const readKTO = (e: string[]): KTO => {
    const accountNumber = e[0] || undefined
    const bankCode = e[1] || undefined
    const iban = e[4] || undefined
    const bic = e[5] || undefined

    if (!(accountNumber && bankCode || iban && bic)) {
        throw new Error("Bank account information is incomplete")
    }

    return {
        bankName: e[2],
        accountOwner: e[3] || undefined,
        accountNumber: accountNumber,
        bankCode: bankCode,
        iban: iban,
        bic: bic
    }
}

const readVKG = (e: string[]): VKG => {
    const e0 = e[0]
    if (!ikVerknuepfungsartSchluessel.hasOwnProperty(e0)) {
        throw new Error(`Unknown IKVerknuepfungsartSchluessel "${e0}"`)
    }
    const e2 = e[2]
    if (e2 && !leistungserbringergruppeSchluessel.hasOwnProperty(e2)) {
        throw new Error(`Unknown LeistungserbringergruppeSchluessel "${e2}"`)
    }
    const e4 = e[4]
    if (e4 && !datenlieferungsArtSchluessel.hasOwnProperty(e4)) {
        throw new Error(`Unknown DatenlieferungsartSchluessel "${e4}"`)
    }
    if ((e0 == "02" || e0 == "03") && e4 != "07") {
        throw new Error(`Links to data acceptance office that does not accept data`)
    }
    if (e0 == "09" && e4 == "07") {
        throw new Error(`Links to paper acceptance office that does not accept paper`)
    }
    const e5 = e[5]
    if (e5 && !uebermittlungsmediumSchluessel.hasOwnProperty(e5)) {
        throw new Error(`Unknown UebermittlungsmediumSchluessel "${e5}"`)
    }
    const e6 = e[6]
    if (e6 && !bundeslandSchluessel.hasOwnProperty(e6)) {
        throw new Error(`Unknown BundeslandSchluessel "${e6}"`)
    }
    const e7 = e[7]
    if (e7 && !kvBezirkSchluessel.hasOwnProperty(e7)) {
        throw new Error(`Unknown KVBezirkSchluessel "${e7}"`)
    }
    const e8 = e[8]
    let sgbxiLeistungsart: KostentraegerSGBXILeistungsartSchluessel | undefined
    let sgbvAbrechnungscode: KostentraegerSGBVAbrechnungscodeSchluessel | undefined
    if (e8) {
        if (e2 == "6") { // Pflege 
            if (!sgbxiLeistungsartSchluessel.hasOwnProperty(e8) && 
                !sgbxiLeistungsartSonderschluessel.hasOwnProperty(e8)) {
                throw new Error(`Unknown KostentraegerPflegeLeistungsartSchluessel "${e8}"`)
            }
            sgbxiLeistungsart = e8 as KostentraegerSGBXILeistungsartSchluessel
        }
        else if (e2 == "5") { // Sonstige
            if (!sgbvAbrechnungscodeSchluessel.hasOwnProperty(e8) && 
                !sgbvAbrechnungscodeSonderschluessel.hasOwnProperty(e8)) {
                throw new Error(`Unknown KostentraegerAbrechnungscodeSchluessel "${e8}"`)
            }
            sgbvAbrechnungscode = e8 as KostentraegerSGBVAbrechnungscodeSchluessel
        }
        else {
            throw new Error(`Unexpected value "${e2}" for leistungserbringergruppeSchluessel`)
        }
    }

    return {
        ikVerknuepfungsartSchluessel: e0 as IKVerknuepfungsartSchluessel,
        verknuepfungspartnerIK: e[1],
        leistungserbringergruppeSchluessel: e2 ? e2 as LeistungserbringergruppeSchluessel : undefined,
        abrechnungsstelleIK: e[3] || undefined,
        datenlieferungsartSchluessel: e4 ? e4 as DatenlieferungsartSchluessel : undefined,
        uebermittlungsmediumSchluessel: e5 ? e5 as UebermittlungsmediumSchluessel : undefined,
        standortLeistungserbringerBundeslandSchluessel: e6 ? e6 as BundeslandSchluessel : undefined,
        standortLeistungserbringerKVBezirkSchluessel: e7 ? e7 as KVBezirkSchluessel : undefined,
        sgbxiLeistungsartSchluessel: sgbxiLeistungsart,
        sgbvAbrechnungscodeSchluessel: sgbvAbrechnungscode,
        tarifkennzeichen: e[9] || undefined
    }
}

const readNAM = (e: string[]): NAM => ({
    index: parseInt(e[0]),
    /* up to 4 name elements of max 30 characters. Apparently 30 characters is the maximum, so 
       the workaround was to put the whole name (up to 120 characters) into consecutive segments */
    names: e.slice(1)
})

const readANS = (e: string[]): ANS => {
    const e0 = e[0]
    if (!anschriftartSchluessel.hasOwnProperty(e0)) {
        throw new Error(`Unknown AnschriftartSchluessel "${e0}"`)
    }
    return {
        anschriftartSchluessel: e0 as AnschriftartSchluessel,
        postcode: parseInt(e[1]),
        place: e[2],
        address: e[3] || undefined
    }
}

const readASP = (e: string[]): ASP => ({
    index: parseInt(e[0]),
    phone: e[1] || undefined,
    fax: e[2] || undefined,
    name: e[3] || undefined,
    fieldOfWork: e[4] || undefined
})

const readUEM = (e: string[]): UEM => {
    const e0 = e[0]
    if (!uebermittlungsmediumSchluessel.hasOwnProperty(e0)) {
        throw new Error(`Unknown UebermittlungsmediumSchluessel "${e0}"`)
    }
    const e1 = e[1]
    // is documented to be mandatory, but not all health insurances specify this
    if (e1 && !uebermittlungsmediumParameterSchluessel.hasOwnProperty(e1)) {
        throw new Error(`Unknown UebermittlungsmediumParameterSchluessel "${e1}"`)
    }
    const e2 = e[2]
    if (!uebermittlungszeichensatzSchluessel.hasOwnProperty(e2)) {
        throw new Error(`Unknown UebermittlungszeichensatzSchluessel "${e2}"`)
    }
    return {
        uebermittlungsmediumSchluessel: e0 as UebermittlungsmediumSchluessel,
        uebermittlungsmediumParameterSchluessel: e1 ? e1 as UebermittlungsmediumParameterSchluessel : undefined,
        uebermittlungszeichensatzSchluessel: e2 as UebermittlungszeichensatzSchluessel,
        // e[3] is type of compression - not used
    }
}

const readDFU = (e: string[]): DFU => {
    const e1 = e[1]
    if (!dfuProtokollSchluessel.hasOwnProperty(e1)) {
        throw new Error(`Unknown DFUProtokollSchluessel "${e1}"`)
    }
    const e5 = e[5]
    if (e5 && !uebertragungstageSchluessel.hasOwnProperty(e5)) {
        throw new Error(`Unknown UebertragungstageSchluessel "${e5}"`)
    }

    return {
        index: parseInt(e[0]),
        dfuProtokollSchluessel: e1 as DFUProtokollSchluessel,
        benutzerkennung: e[2] || undefined,
        // What is this?! Are the German health insurances located on Mars?
        allowedTransmissionTimeStart: e[3] || undefined,
        allowedTransmissionTimeEnd: e[4] || undefined,
        // ... or does the server not work on Sunday? Equal rights for robots! ✊
        allowedTransmissionDays: e5 ? e5 as UebertragungstageSchluessel : undefined,
        address: e[6]
    }
}
