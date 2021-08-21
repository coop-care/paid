/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import { 
    Amounts, 
    BillingData, 
    Versicherter,
    Institution,
    Umsatzsteuer
} from "../types"
import {
    LeistungsartSchluessel,
    PflegegradSchluessel,
    TarifbereichSchluessel, 
    VerarbeitungskennzeichenSchluessel
} from "./codes"
import { day, month, date, time, varchar, decimal, int, char } from "../edifact/formatter"
import { segment } from "../edifact/builder"
import { 
    createLeistungserbringergruppe,
    Leistung, 
    Leistungserbringer,
    leistungserbringergruppeCode,
    Pflegehilfsmittel,
    Zuschlag
} from "./types"

const DefaultCurrency = "EUR"

/** Funktion */
export const FKT = (
    verarbeitungskennzeichen: VerarbeitungskennzeichenSchluessel,
    leistungserbringerIK: string,
    kostentraegerIK: string,
    pflegekasseIK: string,
    absenderIK: string
) => segment(
    "FKT",
    verarbeitungskennzeichen,
    undefined,
    char(leistungserbringerIK, 9), 
    char(kostentraegerIK, 9),
    char(pflegekasseIK, 9),
    char(absenderIK, 9)
)

export const FKT_Sammelrechnung = (
    verarbeitungskennzeichen: VerarbeitungskennzeichenSchluessel,
    /** For rechnungsart == 3: the Abrechnungsstelle.
     *  Otherwise: The Leistungserbringer */
    rechnungsstellerIK: string,
    kostentraegerIK: string,
    absenderIK: string,
) => segment(
    "FKT",
    verarbeitungskennzeichen,
    "J",
    char(rechnungsstellerIK, 9),
    char(kostentraegerIK, 9),
    undefined,
    char(absenderIK, 9)
)

/** Rechnung / Zahlung */
export const REC = (
    {
        rechnungsdatum = new Date(),
        rechnungsart,
        rechnungsnummerprefix
    }: BillingData,
    invoiceIndex: number,
    leistungserbringerIndex: number,
    sammelrechnung: boolean,
    currency = DefaultCurrency
) => segment(
    "REC",
    [
        rechnungsnummerprefix + "-" + (invoiceIndex + 1),
        sammelrechnung || rechnungsart == "1" ? "0" : (leistungserbringerIndex + 1).toString()
    ],
    date(rechnungsdatum),
    rechnungsart,
    currency
)

/** Rechnungsdaten */
export const SRD = (
    le: Leistungserbringer,
    kostentraegerIK: string,
    leistungsart: LeistungsartSchluessel
) => segment(
    "SRD",
    leistungserbringergruppeCode(createLeistungserbringergruppe(le, kostentraegerIK)),
    leistungsart
)

/** Umsatzsteuer */
export const UST = (u: Umsatzsteuer) => segment(
    "UST",
    varchar(u.identifikationsnummer, 20),
    u.befreiung ? "J" : "",
    u.befreiung
);

/** Rechnungssummen  */
export const GES = (a: Amounts) => segment(
    "GES",
    decimal(a.gesamtbruttobetrag, 10, 2),
    decimal(a.zuzahlungsbetrag || undefined, 10, 2),
    decimal(a.beihilfebetrag || undefined, 10, 2),
    decimal(a.rechnungsbetrag, 10, 2),
    decimal(a.mehrwertsteuerbetrag || undefined, 10, 2)
)

/** Namen */
export const NAM = ({
    name,
    ansprechpartner
}: Institution) => segment(
    "NAM",
    name.substr(0, 30),
    ...ansprechpartner.slice(0, 3).map(ansprechpartner =>
        // f.e. {name: "John", phone: "123"} becomes "John, 123"
        Object.values(ansprechpartner).filter(Boolean).join(", ").substr(0, 30)
    )
)

/** Information des Pflegebedürftigen */
export const INV = (
    versichertennummer: string | undefined,
    belegnummer: number
) => segment(
    "INV",
    varchar(versichertennummer, 20),
    varchar((belegnummer + 1).toString(), 10)
)

/** Name und Adresse Versicherter
 * 
 *  Contains additional information about the insuree */
export const NAD = (v: Versicherter) => segment(
    "NAD",
    v.firstName.substr(0, 45),
    v.lastName.substr(0, 45),
    date(v.birthday),
    v.address?.street?.substr(0, 46),
    v.address?.houseNumber?.substr(0, 9),
    v.address?.postalCode?.substr(0, 10),
    v.address?.city?.substr(0, 40)
)

/** Monatskopf-Segment */
export const MAN = (
    monatLeistungserbringung: Date,
    pflegegrad: PflegegradSchluessel
) => segment(
    "MAN",
    monatLeistungserbringung.getFullYear() + month(monatLeistungserbringung),
    undefined, // "Pflegestufe", obsolete
    undefined, // "Pflegeklasse", obsolete
    pflegegrad
)

/** Einsatzkopf-Segment */
export const ESK = (
    /** Day of month and time when health care service was provided.
     * 
     *  Undefined only for fixed per-month fixed rates (Monatspauschale), f.e. "stationär"
     */
    leistungsBeginn?: Date
) => segment(
    "ESK",
    leistungsBeginn ? day(leistungsBeginn) : "99",
    leistungsBeginn ? time(leistungsBeginn) : undefined
)

/** Einzelleistungen */
export const ELS = (l: Leistung) => segment(
    "ELS",
    [
        l.leistungsart,
        l.verguetungsart,
        l.qualifikationsabhaengigeVerguetung,
        getLeistungSchluessel(l)
    ],
    decimal(l.einzelpreis, 10, 2),
    decimal(l.punktwert, 1, 5),
    int(l.punktzahl, 0, 9999),
    getLeistungDetails(l),
    decimal(l.anzahl, 4, 2)
)

/** see codes.ts - 2.7 Schlüssel Leistung */
const getLeistungSchluessel = (l: Leistung): string | undefined => {
    switch(l.verguetungsart) {
        case "01": 
            return char(l.leistungskomplex, 3)
        case "02":
            return l.zeiteinheit + l.zeitart
        case "03":
        case "04":
            return l.pflegesatz
        case "05":
            return varchar(l.positionsnummer, 10)
        case "06":
            return l.wegegebuehren
        case "08":
            return "1" // see codes.ts - 2.7.7
        case "99":
            return "99" // see codes.ts - 2.7.8
    }
}

/** documentation reads:
 * 
 *  Einzutragen ist bei Vergütungsart s. Schlüsselverzeichnis Anlage 3, Abschnitt 2.5. 
 * 
 *  01 => 00 bzw. Uhrzeit der Beendigung der Leistungserbringung (Uhrzeit), in der Form: hhmm
 *  02 => die Uhrzeit der Beendigung der Leistungserbringung (Uhrzeit), in der Form: hhmm
 *  03 => der Bis-Zeitraum (Uhrzeit). In der Form: hhmm
 *  04 => der Vom/Bis-Zeitraum (Von/Tag und Bis/Tag). In der Form: TTTT
 *  05 => 00
 *  06 => Wegegebühren-/Beförderungsentgeltart = 04 nach Schlüssel 2.7.5, die Anzahl der gefahrenen Kilometer, (es sind nur ganze Kilometer zu melden und kaufmännisch zu runden z. B. 3,40 Km, zu melden 3), sonst = 00 (bei SC 01-03),
 *  07 => frei
 *  08 => 00
 *  99 => 00
 */
const getLeistungDetails = (l: Leistung): string | undefined => {
    switch(l.verguetungsart) {
        case "01": 
            return l.leistungsEnde ? time(l.leistungsEnde) : "00"
        case "02":
        case "03":
            return time(l.leistungsEnde)
        case "04":
            return day(l.leistungsBeginn) + day(l.leistungsEnde)
        case "06":
            if (l.wegegebuehren == "04") {
                return int(Math.round(l.gefahreneKilometer), 0, 9999)
            } else {
                return "00"
            }
        default:
            return "00"
    }
}

/** Zuschläge/Abzüge */
export const ZUS = (
    /** Whether this is the last ZUS belonging to a previous ELS segment */
    isLast: boolean,
    tarifbereich: TarifbereichSchluessel,
    z: Zuschlag,
    /** "Betrag, wie er sich zum Basispreis verhält (Zwischenbetr., wenn Ende-Kennzeichen=0, 
     *  Endergebnis, wenn Ende-Kennzeichen = 1, und Berechnung 05, 06, 07, 13, 15, 16)"" */
    ergebnis: number,
) => segment(
    "ZUS",
    [tarifbereich, z.zuschlagsart, z.zuschlag],
    z.beschreibungZuschlagsart?.substr(0, 50),
    z.zuschlagszuordnung,
    z.zuschlagsberechnung,
    z.istAbzugStattZuschlag ? "0" : "1",
    decimal(z.wert, 4, 5),
    decimal(ergebnis, 5, 2),
    isLast? "1" : "0"
)

/** Hilfsmittel */
export const HIL = (
    h: Pflegehilfsmittel,
    mehrwertsteuerbetrag?: number
) => segment(
    "HIL",
    h.mehrwertsteuerart,
    decimal(mehrwertsteuerbetrag, 10, 2),
    decimal(h.gesetzlicheZuzahlungBetrag, 10, 2),
    varchar(h.genehmigungskennzeichen, 15),
    h.genehmigungsDatum ? date(h.genehmigungsDatum) : undefined,
    h.kennzeichenPflegehilfsmittel,
    h.bezeichnungPflegehilfsmittel?.substr(0, 30),
    varchar(h.produktbesonderheitenPflegehilfsmittel, 10),
    varchar(h.inventarnummerPflegehilfsmittel, 20),
)

/** Abrechnungsfall-Endesegment 
 *  
 *  is calculcated from all ELS / ZUS / HIL segments for one INV segment
 */
export const IAF = (a: Amounts) => segment(
    "IAF",
    decimal(a.gesamtbruttobetrag, 10, 2),
    decimal(a.zuzahlungsbetrag || undefined, 10, 2),
    decimal(a.beihilfebetrag || undefined, 10, 2),
    decimal(a.rechnungsbetrag, 10, 2),
)
