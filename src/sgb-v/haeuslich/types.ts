import { BaseAbrechnungsfall, BaseAbrechnungsposition, Verordnung } from "../types"
import { 
    HaeuslicheKrankenpflegeEinzelPositionsnummer,
    HaeuslicheKrankenpflegePauschalePositionsnummer
} from "./codes"

export type Abrechnungsfall = BaseAbrechnungsfall & {
    einsaetze: Einsatz[]
    /** Prescription(s) allocated to this Abrechnungsfall. Billing via SGB V is only possible with
     *  a prescription. */
    verordnungen: Verordnung[]
}

export type Einsatz = {
    /** Date and time at which the health care service started. */
    leistungsBeginn: Date
    /** Date and time at which the health care service ended. */
    leistungsEnde: Date
    abrechnungspositionen: Abrechnungsposition[]
}

/** An Abrechnungsposition for the sector häusliche Krankenpflege and Haushaltshilfe is an
 *  Abrechnungsposition whose positionsnummer satisfies certain constraints */
export type Abrechnungsposition = PauschaleAbrechnungsposition | EinzelAbrechnungsposition

/** The Abrechnungsposition in the sector häusliche Krankenpflege and Haushaltshilfe is furthermore
 *  split into two categories: 
 *  1. Using a Pauschale - in this case, the Einzelpositions must be listed as well
 *  2. Not using a Pauschale
 */
 export type PauschaleAbrechnungsposition = BaseAbrechnungsposition & {
    /** Which service was provided (Pauschale) */
    positionsnummer: HaeuslicheKrankenpflegePauschalePositionsnummer
    /** Breakdown of which individual Einzelleistungen were provided */
    einzelpositionen: Einzelposition[]
}
export type EinzelAbrechnungsposition = BaseAbrechnungsposition & {
    /** Which service was provided (Einzelleistung) */
    positionsnummer: HaeuslicheKrankenpflegeEinzelPositionsnummer
}

export type Einzelposition = {
    /** Which service was provided */
    positionsnummer: HaeuslicheKrankenpflegeEinzelPositionsnummer
    /** and how many/much of that */
    anzahl: number
}
