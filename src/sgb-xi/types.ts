import { 
    LeistungsartSchluessel,
    MehrwertsteuerSchluessel, 
    PflegehilfsmittelKennzeichenSchluessel,
    QualifikationsabhaengigeVerguetungSchluessel,
    VerguetungsartSchluessel,
    ZuschlagsartSchluessel,
    ZuschlagsberechnungSchluessel,
    ZuschlagSchluessel,
    ZuschlagszuordnungSchluessel
} from "./codes"


export type Leistung = {
    leistungsart: LeistungsartSchluessel
    verguetungsart: VerguetungsartSchluessel
    qualifikationsabhaengigeVerguetung: QualifikationsabhaengigeVerguetungSchluessel

    /** The service provided TODO type! */
    leistung: string
    /** Price of one service provided */
    einzelpreis: number
    /** Number of things done, f.e. 3x check blood pressure, 3x 15 minutes etc. */
    anzahl: number

    leistungsBeginn?: Date // for verguetungsart 04
    leistungsEnde?: Date // for verguetungsart 01, 02, 03, 04
    gefahreneKilometer?: number // for verguetungsart 06 with leistung 04

    punktwert?: number
    punktzahl?: number

    zuschlaege: Zuschlag[]
    hilfsmittel?: Pflegehilfsmittel
}

export type Zuschlag = {
    zuschlagsart: ZuschlagsartSchluessel
    zuschlag: ZuschlagSchluessel
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