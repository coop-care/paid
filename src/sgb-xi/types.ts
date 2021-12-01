import { 
    Institution, 
    TestIndicator, 
    Versicherter
} from "../types"
import { 
    AbrechnungscodeSchluessel,
    LeistungsartSchluessel,
    MehrwertsteuerSchluessel,
    WegegebuehrenSchluessel,
    PflegehilfsmittelSchluessel,
    PflegesatzSchluessel,
    QualifikationsabhaengigeVerguetungSchluessel,
    RechnungsartSchluessel,
    TarifbereichSchluessel,
    UmsatzsteuerBefreiungSchluessel,
    VerguetungsartSchluessel,
    ZeitartSchluessel,
    ZeiteinheitSchluessel,
    ZuschlagsartSchluessel,
    ZuschlagsberechnungSchluessel,
    ZuschlagSchluessel,
    ZuschlagszuordnungSchluessel
} from "./codes"

export const messageIdentifiers = {
    "PLGA": "Pflegeleistungserbringer Gesamtaufstellung der Abrechnung",
    "PLAA": "Pflegeleistungserbringer Abrechnungsdaten je Abrechnungsfall",
}
export const messageIdentifierVersions = {
    "PLGA": "PLGA:2",
    "PLAA": "PLAA:3",
}
export type MessageIdentifiers = keyof typeof messageIdentifiers

export type BillingData = {
    /** Running number per recipient for each bill transmitted */
    datenaustauschreferenzJeEmpfaengerIK: Record<string, number>
    /** Indicate whether this bill is a test or if it is real data */
    testIndicator: TestIndicator
    /** Kind of bill, see documentation of RechnungsartSchluessel */
    rechnungsart: RechnungsartSchluessel

    rechnungsnummerprefix: string
    /** Date the bill was created. If not specified, the date is "now" */
    rechnungsdatum?: Date
    /** For which month this bill is. Bills are transmitted by month. */
    abrechnungsmonat: Date
    /** An ascending number indicating a correction of an earlier version of this same bill.
     *  0 or undefined if this is not a correction. */
    korrekturlieferung?: number
    /** Mandatory if rechnungsart != "1" */
    abrechnungsstelle?: Institution
    laufendeDatenannahmeImJahrJeEmpfaengerIK: Record<string, number>
}

export type BillingFile = {
    dateiname: string
    /** Sender of this bill. This would either be an Abrechnungszentrum or a Leistungserbringer */
    absenderIK: string
    empfaengerIK: string
    datenaustauschreferenz: number
    anwendungsreferenz: string
    testIndicator: string
    nutzdaten: string
    rechnungsbetrag: number
}

export type Invoice = {
    leistungserbringer: Leistungserbringer
    faelle: Abrechnungsfall[]
}

export type Leistungserbringer = Institution & {
    abrechnungscode: AbrechnungscodeSchluessel
    tarifbereich: TarifbereichSchluessel

    /** Per Kostenträger IK a 3-character id for the SGB XI Sondertarif, see sgb-xi/codes.ts */
    sondertarifJeKostentraegerIK: Record<string, string>

    /** Steuernummer (according to §14 Abs. 1a) OR Umsatzsteuer-Identifikationsnummer.
     *  Mandatory if not VAT excempt. */
    umsatzsteuerOrdnungsnummer?: string
    /** specified if income tax excempt */
    umsatzsteuerBefreiung?: UmsatzsteuerBefreiungSchluessel
}

export type Abrechnungsfall = {
    versicherter: Versicherter
    einsaetze: Einsatz[]
}

export type Einsatz = {
    /** Date and time at which the health care service started. 
     *  Mandatory for billing with Vergütungsart 01, 02, 03 and 06. */
    leistungsBeginn?: Date
    leistungen: Leistung[]
}

/** A Leistung is subdivided into the following different subtypes, each told apart by the 
 *  "verguetungsart" field. Each Leistung requires a different set of fields to be specified.
 */
export type Leistung = 
    LeistungskomplexverguetungLeistung |
    ZeitverguetungLeistung |
    TeilstationaerLeistung |
    VollstationaerOderKurzzeitpflegeLeistung |
    PflegehilfsmittelLeistung |
    WegegebuehrenLeistung |
    PauschaleLeistung |
    SonstigeLeistung

type BaseLeistung = {
    leistungsart: LeistungsartSchluessel
    verguetungsart: VerguetungsartSchluessel
    qualifikationsabhaengigeVerguetung: QualifikationsabhaengigeVerguetungSchluessel

    /** Price of one service provided */
    einzelpreis: number
    /** Number of things done, f.e. 3x check blood pressure, 3x 15 minutes etc. */
    anzahl: number
    punktwert?: number
    punktzahl?: number

    /** only mandatory for verguetungsart 04 */
    leistungsBeginn?: Date
    /** mandatory for verguetungsart 01, 02, 03, 04 */
    leistungsEnde?: Date

    zuschlaege: Zuschlag[]
}

export type LeistungskomplexverguetungLeistung = BaseLeistung & {
    verguetungsart: "01"
    /** 3-character current number of Leistungskomplex */
    leistungskomplex: string
}

export type ZeitverguetungLeistung = BaseLeistung & {
    verguetungsart: "02"
    zeiteinheit: ZeiteinheitSchluessel
    zeitart: ZeitartSchluessel
}

export type TeilstationaerLeistung = BaseLeistung & {
    verguetungsart: "03"
    pflegesatz: PflegesatzSchluessel
}

export type VollstationaerOderKurzzeitpflegeLeistung = BaseLeistung & {
    verguetungsart: "04"
    pflegesatz: PflegesatzSchluessel
}

export type PflegehilfsmittelLeistung = BaseLeistung & {
    verguetungsart: "05"
    hilfsmittel: Pflegehilfsmittel
    /** Hilfsmittelpositionsnummer, see /hilfsmittelverzeichnis/types.ts  */
    positionsnummer: string
}

export type WegegebuehrenLeistung = BaseLeistung & {
    verguetungsart: "06"
    wegegebuehren: WegegebuehrenSchluessel
    /** mandatory if wegegebuehren == "04"; omitted for all other values of wegegebuehren */
    gefahreneKilometer?: number
}

export type PauschaleLeistung = BaseLeistung & {
    verguetungsart: "08"
    // there is only one code for Pauschale: "Einsatzspauschale" = "1", see codes.ts 2.7.7
}

export type SonstigeLeistung = BaseLeistung & {
    verguetungsart: "99"
    // there is only one code for Pauschale: "Sonstiges" = "99", see codes.ts 2.7.8
}

export type Zuschlag = {
    zuschlagsart: ZuschlagsartSchluessel
    zuschlag: ZuschlagSchluessel
    /** Mandatory if zuschlagsart == "00" */
    beschreibungZuschlagsart?: string
    zuschlagszuordnung: ZuschlagszuordnungSchluessel
    zuschlagsberechnung: ZuschlagsberechnungSchluessel
    istAbzugStattZuschlag: boolean
    /** value for the surcharge. The meaning of this value depends on the 
     *  ZuschlagsberechnungSchluessel given: It could be the Punktzahl (score), a Betrag (amount, in
     *  Euro) or a Prozentsatz (percentage). 
     * 
     *  For example, if it is 42,12%, the value specified here will be 42.12. This was not clear
     *  from the docs, but we asked GKV-Spitzenverband and they clarified that:
     * 
     *  > Der Prozentsatz wird als Zahl ohne Prozent-Zeichen angegeben, z. B. „10“ für 10 %.
     *  */
    wert: number
}

export type Pflegehilfsmittel = {
    /** Only to be specified if there is any Mehrwertsteuer on it */
    mehrwertsteuerart?: MehrwertsteuerSchluessel
    /** according to § 40 SGB XI */
    gesetzlicheZuzahlungBetrag?: number
    /** Bei der Kostenzusage vergebene Genehmigungsnummer. Required only for "technische Hilfsmittel" */
    genehmigungskennzeichen?: string
    genehmigungsDatum?: Date
    /** Required only for "technische Hilfsmittel" (see § 40 Abs. 3 SGB XI) */
    kennzeichenPflegehilfsmittel?: PflegehilfsmittelSchluessel
    /** Only to be specified if for the adjuvant used, there is no Pflegehilfsmittelpositionsnummer yet */
    bezeichnungPflegehilfsmittel?: string
    /** Positionsnummer für Produktbesonderheiten von Pflegehilfsmitteln 
     *  
     *  This 1-10 digit number must be specified if it is specified that way in the respective 
     *  service and supply contracts.
     * 
     *  We asked the GKV-Spitzenverband about whether any numbers are known and documented. They
     *  replied that there is no directory of such service and supply contracts for 
     *  Produktbesonderheiten made by the different GKV. And thus, they assume that this field is to
     *  be filled in by each Leistungserbringer individually depending on their invididual contract(s)
     * 
     *  > Die Angabe von „besonderen Positionsnummern für Produktbesonderheiten“ ist in diesen 
     *  > [vom GKV Spitzenverband geschlossenen] Verträgen nicht vorgesehen. Die Regelungen in den 
     *  > Pflegehilfsmittelverträgen, die die Pflegekassen z.B. zur Versorgung mit Pflegebetten 
     *  > geschlossen haben, sind uns nicht bekannt. Ein Verzeichnis der vertraglich vereinbarten 
     *  > Produktbesonderheiten bei Pflegehilfsmitteln liegt uns nicht vor. Wir gehen davon aus, 
     *  > dass die Angabe der Hilfsmittelpositionsnummern für Produktbesonderheiten durch den 
     *  > Leistungserbringer vertragsabhängig als manuelle Eingabe erfolgen muss.
    */
    produktbesonderheitenPflegehilfsmittel?: string
    /** Inventory number of the adjuvant used (if applicable) */
    inventarnummerPflegehilfsmittel?: string
}
