import { char } from "../edifact/formatter"
import { Institution, Umsatzsteuer, Versicherter } from "../types"
import { 
    AbrechnungscodeSchluessel,
    BeratungsbesuchPauschaleLeistungSchluessel,
    LeistungsartSchluessel,
    MehrwertsteuerSchluessel, 
    NichtPauschaleWegegebuehrenSchluessel, 
    PauschaleWegegebuehrenSchluessel, 
    PflegehilfsmittelKennzeichenSchluessel,
    PflegesatzSchluessel,
    QualifikationsabhaengigeVerguetungSchluessel,
    TarifbereichSchluessel,
    VerguetungsartSchluessel,
    WegegebuehrenSchluessel,
    ZeitartSchluessel,
    ZeiteinheitSchluessel,
    ZuschlagsartSchluessel,
    ZuschlagsberechnungSchluessel,
    ZuschlagSchluessel,
    ZuschlagszuordnungSchluessel
} from "./codes"

/* 2.2 Schlüssel Leistungserbringergruppe
 * 
 * 7-character code:
 *  
 * ```
 * Abrechnungscode
 *  │  Tarifkennzeichen
 * ┌┴─┐┌─┴─────┐
 *  XX  XX  XXX
 *     └┬─┘└─┬─┘
 *      │   Sondertarif
 *     Tarifbereich
 * ```
 */
export type Leistungserbringergruppe = {
    abrechnungscode: AbrechnungscodeSchluessel,
    tarifbereich: TarifbereichSchluessel,
    sondertarif: string
}

export const createLeistungserbringergruppe = (
    le: Leistungserbringer,
    kostentraegerIK: string
): Leistungserbringergruppe => ({
    abrechnungscode: le.abrechnungscode,
    tarifbereich: le.tarifbereich,
    sondertarif: le.sondertarifJeKostentraegerIK[kostentraegerIK] || "000"
})

export const leistungserbringergruppeCode = (le: Leistungserbringergruppe): string[] => [
    le.abrechnungscode,
    le.tarifbereich + char(le.sondertarif, 3)
]

export type Invoice = {
    leistungserbringer: Leistungserbringer
    faelle: Abrechnungsfall[]
}

export type Leistungserbringer = Institution & {
    abrechnungscode: AbrechnungscodeSchluessel
    tarifbereich: TarifbereichSchluessel

    /** Per Kostenträger IK a 3-character id for the SGB XI Sondertarif, see sgb-xi/codes.ts */
    sondertarifJeKostentraegerIK: Record<string, string>

    /** to be specified if care provider is income tax excempt */
    umsatzsteuer?: Umsatzsteuer
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

export type Leistung = 
    LeistungskomplexverguetungLeistung |
    ZeitverguetungLeistung |
    TeilstationaerLeistung |
    VollstationaerOderKurzzeitpflegeLeistung |
    PflegehilfsmittelLeistung |
    WegegebuehrenLeistung |
    PauschaleLeistung |
    SonstigeLeistung

export type BaseLeistung = {
    leistungsart: LeistungsartSchluessel
    verguetungsart: VerguetungsartSchluessel
    qualifikationsabhaengigeVerguetung: QualifikationsabhaengigeVerguetungSchluessel

    /** Price of one service provided */
    einzelpreis: number
    /** Number of things done, f.e. 3x check blood pressure, 3x 15 minutes etc. */
    anzahl: number
    punktwert?: number
    punktzahl?: number

    zuschlaege: Zuschlag[]
}

export type LeistungskomplexverguetungLeistung = BaseLeistung & {
    verguetungsart: "01"
    leistungsEnde?: Date
    /** 3-character current number of Leistungskomplex */
    leistungskomplex: string
}

export type ZeitverguetungLeistung = BaseLeistung & {
    verguetungsart: "02"
    leistungsEnde: Date
    zeiteinheit: ZeiteinheitSchluessel
    zeitart: ZeitartSchluessel
}

export type TeilstationaerLeistung = BaseLeistung & {
    verguetungsart: "03"
    leistungsEnde: Date
    pflegesatz: PflegesatzSchluessel
}

export type VollstationaerOderKurzzeitpflegeLeistung = BaseLeistung & {
    verguetungsart: "04"
    leistungsBeginn: Date
    leistungsEnde: Date
    pflegesatz: PflegesatzSchluessel
}

export type PflegehilfsmittelLeistung = BaseLeistung & {
    verguetungsart: "05"
    hilfsmittel: Pflegehilfsmittel
    /** Hilfsmittelpositionsnummer, see /hilfsmittelverzeichnis/types.ts  */
    positionsnummer: string
}

export type WegegebuehrenLeistung = 
    PauschaleWegegebuehrenLeistung |
    WegegebuehrenNachKilometerLeistung

export type PauschaleWegegebuehrenLeistung = BaseLeistung & {
    verguetungsart: "06"
    wegegebuehren: PauschaleWegegebuehrenSchluessel
}

export type WegegebuehrenNachKilometerLeistung = BaseLeistung & {
    verguetungsart: "06"
    wegegebuehren: NichtPauschaleWegegebuehrenSchluessel
    gefahreneKilometer: number
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
    /** value depends on the field zuschlagsberechnung */
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
    kennzeichenPflegehilfsmittel?: PflegehilfsmittelKennzeichenSchluessel
    /** Only to be specified if for the adjuvant used, there is no Pflegehilfsmittelpositionsnummer yet */
    bezeichnungPflegehilfsmittel?: string
    /** siehe Schlüssel Positionsnummer für Produktbesonderheiten von Pflegehilfsmitteln Anlage 3, Abschnitt 2.12 */
    produktbesonderheitenPflegehilfsmittel?: string
    /** Inventory number of the adjuvant used (if applicable) */
    inventarnummerPflegehilfsmittel?: string
}
