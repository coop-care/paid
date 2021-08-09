import { HaeuslicheLeistungserbringerSammelgruppenSchluessel } from "../codes"
import { BaseAbrechnungsposition, Einzelrechnung } from "../types"
import { 
    HaeuslicheKrankenpflegeEinzelPositionsnummer,
    HaeuslicheKrankenpflegePauschalePositionsnummer
} from "./codes"

/** An Abrechnungsposition for the sector häusliche Krankenpflege and Haushaltshilfe is an
 *  Abrechnungsposition whose positionsnummer satisfies certain constraints */
export type HaeuslicheKrankenpflegeAbrechnungsposition = 
    HaeuslicheKrankenpflegePauschaleAbrechnungsposition |
    HaeuslicheKrankenpflegeEinzelAbrechnungsposition

/** The Abrechnungsposition in the sector häusliche Krankenpflege and Haushaltshilfe is furthermore
 *  split into two categories: 
 *  1. Using a Pauschale - in this case, the Einzelpositions must be listed as well
 *  2. Not using a Pauschale
 */
 export type HaeuslicheKrankenpflegePauschaleAbrechnungsposition = BaseAbrechnungsposition & {
    leistungserbringerSammelgruppe: HaeuslicheLeistungserbringerSammelgruppenSchluessel
    /** Which service was provided (Pauschale) */
    positionsnummer: HaeuslicheKrankenpflegePauschalePositionsnummer
    /** Breakdown of which individual Einzelleistungen were provided */
    einzelpositionen: HaeuslicheKrankenpflegeEinzelposition[]
}
export type HaeuslicheKrankenpflegeEinzelAbrechnungsposition = BaseAbrechnungsposition & {
    leistungserbringerSammelgruppe: HaeuslicheLeistungserbringerSammelgruppenSchluessel
    /** Which service was provided (Einzelleistung) */
    positionsnummer: HaeuslicheKrankenpflegeEinzelPositionsnummer
}

export type HaeuslicheKrankenpflegeEinzelposition = {
    /** Which service was provided */
    positionsnummer: HaeuslicheKrankenpflegeEinzelPositionsnummer
    /** and how many/much of that */
    anzahl: number
}

export type HaeuslicheKrankenpflegeRechnung = Einzelrechnung & {
    leistungserbringerSammelgruppe: HaeuslicheLeistungserbringerSammelgruppenSchluessel
}
