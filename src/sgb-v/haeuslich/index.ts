/** based on documents: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.4 SLLA: C (Häusliche Krankenpflege)
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.5 SLLA: D (Haushaltshilfe)
 *  - Verordnungsformular für häusliche Krankenpflege: Muster 12
 * 
  * see docs/documents.md for more info
  */

import { Segment } from "../../edifact/types"
import { sum } from "../../utils"
import { INV, NAD, TXT, DIA, SKZ, FKT, REC } from "../segments_slla"
import { Versicherter, Einsatz, Verordnung, Leistungserbringergruppe, Rechnung } from "../types"
import { ESK, EHK, ZHK, BES, ELP } from "./segments"
import { HaeuslicheKrankenpflegeAbrechnungsposition } from "./types"

/* TODO validations: 
 * 
 *  ERRORS:
 *  ------- 
 *    Versicherter:
 *      !(versichertennummer && versichertenstatus) && !(street && houseNumber && postalCode && city)
 *    Einsatz:
 *      startDateTime < endDateTime
 *    Abrechnungsposition:
 *      einzelpreis >= 10 000 000 000
 *      anzahl >= 10000
 *      gefahreneKilometer >= 1 000 000
 *      leistungserbringergruppe.sondertarif.length != 3
 *    Verordnung:
 *      kostenzusagen.length < 1
 *      
 * 
 *  WARNINGS:
 *  ---------
 *    Versicherter:
 *      lastName.length > 47
 *      firstName.length > 30
 *      street.length + 1 + houseNumber.length > 30
 *      city.length > 25
 *    Abrechnungsposition:
 *      text.length > 70
*/


/**
 * One message per combination of health insurance (Pflegekasse), health care service provider (Leistungserbringer) and payer (Kostenträger)
 * 
 * FKT
 * REC
 * for each Abrechnungsfall:
 *   INV
 *   URI (cond.)
 *   NAD
 *   IMG (cond.)
 *   for each Einsatz, in chronological order:
 *     ESK
 *     for each Abrechnungsposition:
 *       EHK
 *       TXT (cond.)
 *       if Abrechnungsposition is Pauschale, for each Einzelleistung:
 *         ELP
 *   for each Verordnung:
 *     ZHK
 *     for each Diagnose, if any:
 *       DIA
 *     for each Kostenzusage:
 *       SKZ
 *   BES
 */
export const makeMessage = (
    rechnung: Rechnung
    ): Segment[] => {
    // contract: all insurees must have same pflegekasseIK

    const insurees: Versicherter[] = []
        // per insuree
        const einsaetzeChronological: Einsatz[] = []
            // per einsatz
            const positionen: HaeuslicheKrankenpflegeAbrechnungsposition[] = []
        const verordnungen: Verordnung[] = []

    const result = [
        FKT("01", rechnung),
        REC(rechnung),
        ...insurees.flatMap(insuree => [
            INV(
                insuree.versichertennummer,
                insuree.versichertenstatus,
                beleginformation,
                belegnummer,
                besondereVersorgungsform
            ),
            NAD(insuree),
            ...einsaetzeChronological.flatMap(einsatz => [
                ESK(einsatz.leistungsBeginn, einsatz.leistungsEnde),
                ...positionen.flatMap(position => [
                    EHK(leistungserbringergruppe, position),
                    // add TXT segment only if there is any text
                    position.text ? TXT(position.text) : undefined,
                    // add ELP segments only if there are any einzelpositionen (= position is a Pauschale)
                    ...("einzelpositionen" in position ? 
                        position.einzelpositionen.map(e => ELP(e)) : 
                        [undefined]
                    )
                ])
            ]),
            ...verordnungen.flatMap(verordnung => [
                ZHK(verordnung),
                ...verordnung.diagnosen.map(d => DIA(d)),
                ...verordnung.kostenzusagen.map(k => SKZ(k))
            ]),
            BES(
                // TODO actually all positions from all einsätze...
                sum(positionen.map(p => Math.round(p.einzelpreis * p.anzahl)))
            )
        ])
    ].filter(segment => segment !== undefined)
    
}
