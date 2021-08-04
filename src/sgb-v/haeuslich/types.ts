import { HaeuslicheLeistungserbringerSammelgruppenSchluessel } from "../codes"
import { Abrechnungsposition, Rechnung } from "../types"
import { 
    HaeuslicheKrankenpflegeEinzelPositionsnummer,
    HaeuslicheKrankenpflegePauschalePositionsnummer
} from "./codes"

/** An Abrechnungsposition for the sector häusliche Krankenpflege and Haushaltshilfe is an
 *  Abrechnungsposition whose positionsnummer satisfies certain constraints */
export type HaeuslicheKrankenpflegeAbrechnungsposition = 
    HaeuslicheKrankenpflegePauschaleAbrechnungsposition |
    HaeuslicheKrankenpflegeEinzelAbrechnungsposition

/** The Abrechnungsposition in the sector häusliche Krankenpflege and Haushaltshilf is furthermore
 *  split into two categories: 
 *  1. Using a Pauschale - in this case, the Einzelpositions must be listed as well
 *  2. Not using a Pauschale
 */
 export type HaeuslicheKrankenpflegePauschaleAbrechnungsposition = Abrechnungsposition & {
    positionsnummer: HaeuslicheKrankenpflegePauschalePositionsnummer
    einzelpositionen: HaeuslicheKrankenpflegeEinzelposition[]
}
export type HaeuslicheKrankenpflegeEinzelAbrechnungsposition = Abrechnungsposition & {
    positionsnummer: HaeuslicheKrankenpflegeEinzelPositionsnummer
}

export type HaeuslicheKrankenpflegeEinzelposition = {
    /** Which service was provided */
    positionsnummer: HaeuslicheKrankenpflegeEinzelPositionsnummer
    /** and how many/much of that */
    anzahl: number
}

export type HaeuslicheKrankenpflegeRechnung = Rechnung & {
    leistungserbringerSammelgruppe: HaeuslicheLeistungserbringerSammelgruppenSchluessel
}
