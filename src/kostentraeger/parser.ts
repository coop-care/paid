import parseEdifact from "../edifact/parser"
import { parseDate, parseTimeOfDay } from "../edifact/parse_utils"
import { Interchange, Message, Segment, Element } from "../edifact/types"

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

function parse(edifact: string) {
    const interchange = parseEdifact(edifact)
    const header = interchange.header

    const spitzenverbandIK = parseInt(header[1][0])
    const creationDate = parseDate(header[3][0], header[3][1]) // != validity date!

    interchange.messages.forEach((message) => {
        parseMessage(message)
    })
}

function parseMessage(message: Message) {
    const messageType = message.header[1][0]
    if (messageType != "KOTR") {
        throw new Error(`Unknown message type ${messageType}`)
    }
    // ASK documentation is not inconsistent! Sometimes mentions version 1, sometimes version 2!
    const messageTypeVersion = parseInt(message.header[1][1])
    if (messageTypeVersion != 2) {
        throw new Error(`Unsupported message type version ${messageTypeVersion}`)
    }

    message.segments.forEach((segment) => {
        const tag = segment.tag
        /* the Kostenträger file does not use components at all (i.e. one element consists of 
           exactly one component), so let's make a shortcut */
        const elements = segment.elements.map((e) => e[0])

        switch(tag) {
            case "IDK": // 1 Identifikation
                readIDK(elements)
                break
            case "VDT": // (1) Verwaltungsdaten 
                readVDT(elements)
                break
            case "FKT": // 1 Funktion
                readFKT(elements)
                break
            case "KTO": // (1) Kontoverbindung
                readKTO(elements)
                break
            case "VKG": // X Verknüpfung
                readVKG(elements)
                break
            case "NAM": // 1 Name
                readNAM(elements)
                break
            case "ANS": // 1..3 Anschrift
                readANS(elements)
                break
            case "ASP": // X Ansprechpartner
                readASP(elements)
                break
            case "UEM": // X Übermittlungsmedium
                readUEM(elements)
                break
            case "DFU": // X (bedingt) Datenfernübertragung
                readDFU(elements)
                break
        }
    })
}

const readVKG = (e: string[]) => ({
    linkType: parseInt(e[0]), // Art der Verknüpfung
    linkPartnerIK: parseInt(e[1]), // IK des Verknüpfungspartners
    leistungserbringergruppe: e[2] ? parseInt(e[2]) : undefined, // LE-Gruppe
    clearingOfficeIK: e[3] ? parseInt(e[3]) : undefined, // IK der Abrechnungsstelle
    datenlieferungsart: e[4] ? parseInt(e[4]) : undefined,
    uebermittlungsmediumsart: e[5] ? parseInt(e[5]) : undefined,
    standortLeistungserbringerBundesland: e[6] ? parseInt(e[6]) : undefined,
    standortLeistungserbringerKVBezirk: e[7] ? parseInt(e[7]) : undefined,
    leistungsart: e[8], // TODO: DIFF - "Abrechnungscpde" / Leistungserbringerart - Schlüssel Abrechnungscode! mehr docs...
    tarifkennzeichen: e[9] // TODO: DIFF nur TP5?! Schlüssel Tarifkennzeichen
})

const readDFU = (e: string[]) => ({
    index: parseInt(e[0]),
    transmissionProtocol: parseInt(e[1]),
    userId: e[2] ? e[2] : undefined, // Benutzerkennung, optional - undefined if different from IK
    // What is this?! Are the German health insurances located on Mars?
    allowedTransmissionTimeStart: e[3] ? parseTimeOfDay(e[3]) : undefined,
    allowedTransmissionTimeEnd: e[4] ? parseTimeOfDay(e[4]) : undefined,
    // ... or does the server not work on Sunday? Equal rights for robots! ✊
    allowedTransmissionDays: e[5] ? e[5] : undefined,
    /* IPv4-Adressen wer-den mit Punkt angegeben und von der Port-Angabe mit Doppelpunkt getrennt, z.B.
       203.0.113.195:49999
       
       IPv6-Adressen werden innerhalb eckiger Klammern und mit Doppelpunkt angeben sowie von der 
       Port-Angabe mit Doppelpunkt getrennt, z.B.
       [2001:0db8:85a3:0000:0000:8a2e:0370:7344]:49999
       
       Bei der Angabe von Domainnamen erfolgt die Port-Angabe ebenfalls nach einem Doppelpunkt als 
       Trennzeichen, z.B.
       www.beispieldatenannahme.de:49999
    */
    communicationChannel: e[6] // DFÜ-Adresse / -Kennung / Telefon-nummer / E-Mail-Adresse
})

const readUEM = (e: string[]) => ({
    transmissionType: parseInt(e[0]), // Übermittlungsmedium
    transmissionTypeParameter: parseInt(e[1]),
    characterSet: e[2],
    // e[3] is type of compression - not used
    // TODO DIFF: hinweis dass compression nicht genutzt wird fehlt bei TP5
})

const readASP = (e: string[]) => ({
    index: parseInt(e[0]),
    phone: e[1] ? parseInt(e[1]) : undefined, // Format: Vorwahl und Tel per "/" getrennt
    fax: e[2] ? parseInt(e[2]) : undefined, // Format: Vorwahl und Tel per "/" getrennt
    name: e[3] ? e[3] : undefined,
    fieldOfWork: e[4] ? e[4] : undefined // Klartext, z. B.Datenaustausch
})

const readANS = (e: string[]) => ({
    addressType: parseInt(e[0]), // Art der Anschrift
    postcode: parseInt(e[1]),
    place: e[2],
    address: e[3] // Street & housenumber or P.O. box
})

const readNAM = (e: string[]) => ({
    index: parseInt(e[0]),
    names: e.slice(1) // 1..4
})

const readIDK = (e: string[]) => ({
    ik: parseInt(e[0]), // Institutionskennzeichen
    institutionType: parseInt(e[1]), // Art der Institution. 99 = dummy gilt nur für TP5, da alle Informationen zum IK aus dem VKG-Segment abzuleiten sind.
    abbreviatedName: e[2], // Kurzbezeichnung
    /* Angabe ist nicht erforderlich, auch, wenn es sich bei der Institution um eine Krankenkasse handelt  */
    vertragskassennummer: e.length > 3 ? parseInt(e[3]) : undefined // optional: Vertragskassennummer
})

const readVDT = (e: string[]) => ({
    from: parseDate(e[0]),
    to: e[1] ? parseDate(e[1]) : undefined
})

const readFKT = (e: string[]) => ({
    verarbeitungskennzeichen: e[0]
})

const readKTO = (e: string[]): {
    bankName: string,
    accountOwner: string | undefined, // undefined if same as IDK.abbreviatedName
    accountNumbers: { account: number, bankCode: number } | { iban: string, bic: string }
} => ({
    bankName: e[2],
    accountOwner: e[3] ? e[3] : undefined,
    accountNumbers: e[0] ? 
    {
        account: parseInt(e[0]),
        bankCode: parseInt(e[1])
    } : {
        iban: e[4],
        bic: e[5]
    }
})

// TODO verknüpfungsstuff
// TODO construct result + how many times a segment may occur within one message
// TODO check german names / english names

// TODO tests
