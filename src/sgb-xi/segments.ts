/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import { 
    Amounts, 
    BillingData, 
    Leistungserbringer, 
    Leistung, 
    Versicherter,
    Pflegehilfsmittel,
    Zuschlag,
    Abrechnungsfall,
    Institution,
    Umsatzsteuer
} from "../types"
import {
    PflegegradSchluessel,
    TarifbereichSchluessel, 
    VerarbeitungskennzeichenSchluessel,
} from "./codes"
import { day, month, date, time, varchar, decimal, int } from "../edifact/formatter"
import { segment } from "../edifact/builder"

const DefaultCurrency = "EUR";

/** Funktion */
export const FKT = (
    /** identical in PLGA.FKT and PLAA.FKT */
    verarbeitungskennzeichen: VerarbeitungskennzeichenSchluessel,
    {
        absender, // PLGA: Absender der Datei, identisch zu Absender in UNB; PLAA: wie RechnungsstellerIK (?)
        rechnungssteller, // Leistungserbringer oder Abrechnungsstelle mit Inkassovollmacht bei Sammelrechnung; PLAA == PLGA
    }: {
        absender: Institution,
        rechnungssteller: Institution,
    },
    {
        kostentraegerIK, // Institution die die Rechnung begleicht laut Kostenträgerdatei; PLAA == PLGA
        pflegekasseIK, // Pflegekasse des Leistungs- bzw. Bewilligungsbescheids; falls angegeben gilt: PLAA == PLGA
    }: Versicherter,
    sammelrechnung?: boolean, // only for PLGA, undefined for PLAA
) => segment(
    "FKT",
    verarbeitungskennzeichen,
    sammelrechnung === undefined
        ? undefined
        : sammelrechnung
        ? "J"
        : undefined,
    rechnungssteller.ik,
    kostentraegerIK,
    sammelrechnung !== true ? pflegekasseIK : undefined,
    sammelrechnung !== undefined ? absender.ik : rechnungssteller.ik
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
    l: Leistungserbringer,
    a: Abrechnungsfall
) => segment(
    "SRD",
    [
        l.abrechnungscode,
        l.tarifbereich + (l.sondertarifJeKostentraegerIK[a.versicherter.kostentraegerIK] || "000")
    ],
    a.einsaetze[0].leistungen[0].leistungsart
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

/** Einzelleistungen 
 * 
 *  This is insanely complex: leistung and several parameters depend on verguetungsart
*/
export const ELS = (l: Leistung) => {

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
    let details = "00"
    if (l.verguetungsart == "01") {
        details = l.leistungsEnde ? time(l.leistungsEnde) : "00"
    } else if (l.verguetungsart == "02" && l.leistungsEnde) {
        details = time(l.leistungsEnde)
    } else if (l.verguetungsart == "03" && l.leistungsEnde) {
        details = time(l.leistungsEnde)
    } else if (l.verguetungsart == "04" && l.leistungsBeginn && l.leistungsEnde) {
        details = day(l.leistungsBeginn) + day(l.leistungsEnde)
    } else if (l.verguetungsart == "06" && l.leistung == "04" && l.gefahreneKilometer != undefined) {
        details = Math.round(l.gefahreneKilometer).toString()
    }

    return segment(
        "ELS",
        [
            l.leistungsart,
            l.verguetungsart,
            l.qualifikationsabhaengigeVerguetung,
            l.leistung
        ],
        decimal(l.einzelpreis, 10, 2),
        decimal(l.punktwert, 1, 5),
        int(l.punktzahl, 0, 9999),
        details,
        decimal(l.anzahl, 4, 2)
    )
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
