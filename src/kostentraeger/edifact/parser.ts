import { parseDate, parseTimeOfDay } from "../../edifact/parse_utils"
import { Interchange, Message } from "../../edifact/types"
import { 
    abrechnungscodeSchluessel, AbrechnungscodeSchluessel,
    anschriftartSchluessel, AnschriftartSchluessel,
    bundeslandSchluessel, BundeslandSchluessel,
    datenlieferungsArtSchluessel, DatenlieferungsartSchluessel,
    dfuProtokollSchluessel, DFUProtokollSchluessel,
    ikVerknuepfungsartSchluessel, IKVerknuepfungsartSchluessel, 
    kvBezirkSchluessel, KVBezirkSchluessel, 
    leistungserbringergruppeSchluessel, LeistungserbringergruppeSchluessel, 
    pflegeLeistungsartSchluessel, PflegeLeistungsartSchluessel, 
    uebermittlungsmediumParameterSchluessel, UebermittlungsmediumParameterSchluessel, 
    uebermittlungsmediumSchluessel, UebermittlungsmediumSchluessel,
    uebermittlungszeichensatzSchluessel, UebermittlungszeichensatzSchluessel,
    uebertragungstageSchluessel, UebertragungstageSchluessel,
    verarbeitungskennzeichenSchluessel, VerarbeitungskennzeichenSchluessel
} from "./keys"
import { KTORInterchange, KTORMessage, ANS, ASP, DFU, FKT, IDK, KTO, NAM, UEM, VDT, VKG } from "./segments"

/** 
 *  Parses a Kostenträgerdatei (payer file) which provides information how to send invoices to the
 *  statutory health insurance as a health care service provider.
 * 
 *  The implementation is based on ....
 *  
 *  Anhang 5 zur Anlage 1 - Kostenträgerdatei,
 *  Regelung der Datenübermittlung nach § 105 Abs. 2 SGB XI Technische Anlage (Anlage 1),
 *  Version 3.3, Effective starting 01.10.2021
 *  
 *  https://gkv-datenaustausch.de/media/dokumente/leistungserbringer_1/pflege/technische_anlagen_aktuell_2/TA1_ANH5_20170907_105_oA.pdf
 * 
 *  and
 * 
 *  Anhang 3 zur Anlage 1 - Kapitel 10 "Kostenträgerdatei",
 *  zu den Richtlinien der Spitzenverbände der Krankenkassen nach § 302 Abs. 2 SGB V über Form und 
 *  Inhalt des Abrechnungsverfahrens mit "Sonstigen Leistungserbringern" sowie mit Hebammen und 
 *  Entbindungspflegern (§ 301a SGB V)
 *  Version 07, Effective starting 01.10.2021
 * 
 *  https://gkv-datenaustausch.de/media/dokumente/leistungserbringer_1/sonstige_leistungserbringer/technische_anlagen_aktuell_4/Anhang_03_Anlage_1_TP5_20200616.pdf
 * 
 *  ...and thus only covers Pflegedienstleistungen (care providers) and Sonstige Leistungserbringer
 *  (miscellaneous providers of health care services)
 */

/** Parse a Kostenträger EDIFACT interchange. It only parses the interchange into a legible non-
 *  serialized form but does not divorce the data structure from (the limitations of) the
 *  EDIFACT message format yet.
*/
export default function parse(interchange: Interchange): KTORInterchange {
    const header = interchange.header
    return {
        spitzenverbandIK: parseInt(header[1][0]),
        creationDate: parseDate(header[3][0], header[3][1]),
        kostentraeger: interchange.messages.map((message) => parseMessage(message))
        // header[6] would contain the file name. Though there is probably no meaning in parsing that
    }
}

/** Parse only one message of the interchange */
function parseMessage(message: Message): KTORMessage {
    const messageId = parseInt(message.header[0][0])
    const messageTxt = `Message ${messageId} -`
    const messageType = message.header[1][0]
    if (messageType != "KOTR") {
        throw new Error(`${messageTxt} Unknown message type ${messageType}`)
    }
    // ASK documentation is not inconsistent! Sometimes mentions version 1, sometimes version 2!
    const messageTypeVersion = parseInt(message.header[1][1])
    if (messageTypeVersion != 2) {
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
    const uemList = new Array<UEM>() 
    const vkgList = new Array<VKG>()

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
                    vkgList.push(readVKG(elements))
                    break
                case "NAM": // Name
                    nam = readNAM(elements)
                    break
                case "ANS": // Anschrift
                    ansList.push(readANS(elements))
                    break
                case "ASP": // Ansprechpartner
                    aspList.push(readASP(elements))
                    break
                case "UEM": // Übermittlungsmedium
                    uemList.push(readUEM(elements))
                    break
                case "DFU": // Datenfernübertragung
                    dfuList.push(readDFU(elements))
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

    aspList.sort((a, b) => a.index - b.index)
    dfuList.sort((a, b) => a.index - b.index)

    return {
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
    }
}

const readIDK = (e: string[]): IDK => ({
    ik: parseInt(e[0]),
    institutionsart: parseInt(e[1]), 
    abbreviatedName: e[2],
    vertragskassennummer: e.length > 3 ? parseInt(e[3]) : undefined
})

const readVDT = (e: string[]): VDT => ({
    from: parseDate(e[0]),
    to: e[1] ? parseDate(e[1]) : undefined
})

const readFKT = (e: string[]): FKT => {
    const k = e[0]
    if (!verarbeitungskennzeichenSchluessel.hasOwnProperty(k)) {
        throw new Error(`Unknown VerarbeitungskennzeichenSchluessel "${k}"`)
    }
    return { verarbeitungskennzeichenSchluessel: k as VerarbeitungskennzeichenSchluessel }
}

const readKTO = (e: string[]): KTO => {
    const accountNumber = e[0] ? parseInt(e[0]) : undefined
    const bankCode = e[1] ? parseInt(e[1]) : undefined
    const iban = e[4] ?? undefined
    const bic = e[5] ?? undefined

    if (!(accountNumber && bankCode || iban && bic)) {
        throw new Error("Bank account information is incomplete")
    }

    return {
        bankName: e[2],
        accountOwner: e[3] ?? undefined,
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
        throw new Error(`Data inconsistency: Link links to data acceptance office but that office does not accept data`)
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
    let pflegeLeistungsart: PflegeLeistungsartSchluessel | undefined
    let abrechnungscode: AbrechnungscodeSchluessel | undefined
    if (e8) {
        if (e2 == "6") { // Pflege 
            if (!pflegeLeistungsartSchluessel.hasOwnProperty(e8)) {
                throw new Error(`Unknown PflegeLeistungsartSchluessel "${e8}"`)
            }
            pflegeLeistungsart = e8 as PflegeLeistungsartSchluessel
        }
        else if (e2 == "5") { // Sonstige
            if (!abrechnungscodeSchluessel.hasOwnProperty(e8)) {
                throw new Error(`Unknown AbrechnungscodeSchluessel "${e8}"`)
            }
            abrechnungscode = e8 as AbrechnungscodeSchluessel
        }
        else {
            throw new Error(`Unexpected value for leistungserbringergruppeSchluessel: "${e2}"`)
        }
    }

    return {
        ikVerknuepfungsartSchluessel: e0 as IKVerknuepfungsartSchluessel,
        verknuepfungspartnerIK: parseInt(e[1]),
        leistungserbringergruppeSchluessel: e2 ? e2 as LeistungserbringergruppeSchluessel : undefined,
        abrechnungsstelleIK: e[3] ? parseInt(e[3]) : undefined,
        datenlieferungsartSchluessel: e4 ? e4 as DatenlieferungsartSchluessel : undefined,
        uebermittlungsmediumSchluessel: e5 ? e5 as UebermittlungsmediumSchluessel : undefined,
        standortLeistungserbringerBundeslandSchluessel: e6 ? e6 as BundeslandSchluessel : undefined,
        standortLeistungserbringerKVBezirkSchluessel: e7 ? e7 as KVBezirkSchluessel : undefined,
        pflegeLeistungsartSchluessel: pflegeLeistungsart,
        abrechnungscodeSchluessel: abrechnungscode,
        tarifkennzeichen: e[9] ?? undefined
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
        address: e[3] ?? undefined
    }
}

const readASP = (e: string[]): ASP => ({
    index: parseInt(e[0]),
    phone: e[1] ?? undefined,
    fax: e[2] ?? undefined,
    name: e[3] ?? undefined,
    fieldOfWork: e[4] ?? undefined
})

const readUEM = (e: string[]): UEM => {
    const e0 = e[0]
    if (!uebermittlungsmediumSchluessel.hasOwnProperty(e0)) {
        throw new Error(`Unknown UebermittlungsmediumSchluessel "${e0}"`)
    }
    const e1 = e[1]
    if (!uebermittlungsmediumParameterSchluessel.hasOwnProperty(e1)) {
        throw new Error(`Unknown UebermittlungsmediumParameterSchluessel "${e1}"`)
    }
    const e2 = e[2]
    if (!uebermittlungszeichensatzSchluessel.hasOwnProperty(e2)) {
        throw new Error(`Unknown UebermittlungszeichensatzSchluessel "${e2}"`)
    }
    return {
        uebermittlungsmediumSchluessel: e0 as UebermittlungsmediumSchluessel,
        uebermittlungsmediumParameterSchluessel: e1 as UebermittlungsmediumParameterSchluessel,
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
        benutzerkennung: e[2] ?? undefined,
        // What is this?! Are the German health insurances located on Mars?
        allowedTransmissionTimeStart: e[3] ? parseTimeOfDay(e[3]) : undefined,
        allowedTransmissionTimeEnd: e[4] ? parseTimeOfDay(e[4]) : undefined,
        // ... or does the server not work on Sunday? Equal rights for robots! ✊
        allowedTransmissionDays: e5 ? e5 as UebertragungstageSchluessel : undefined,
        address: e[6]
    }
}

// TODO tests