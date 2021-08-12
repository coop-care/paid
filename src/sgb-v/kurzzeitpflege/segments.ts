/** based on document: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.11 SLLA: Q (Kurzzeitpflege)
 * 
  * see docs/documents.md for more info
  */

import { segment } from "../../edifact/builder"
import { char, decimal, date } from "../../edifact/formatter"
import { Leistungserbringergruppe, leistungserbringergruppeCode } from "../types"

/** Segments for SLLA Q message (Kurzzeitpflege) */

/** Einzelfallnachweis Kurzzeitpflege  */
export const EHP = (
    le: Leistungserbringergruppe,
    /** Abrechnungspositionsnummer für Kurzzeitpflege. See ./codes.ts */
    positionsnummer: string,
    amount: number,
    /** Price of one Abrechnungsposition including VAT */
    abrechnungspositionPrice: number,
    /** start date of the care provided */
    serviceStartDate: Date,
    /** end date of the care provided */
    serviceEndDate: Date,
) => segment(
    "EHP",
    leistungserbringergruppeCode(le),
    char(positionsnummer, 7),
    decimal(amount, 4, 2),
    decimal(abrechnungspositionPrice, 10, 2),
    date(serviceStartDate),
    date(serviceEndDate)
)

/** Betrags-Summen 
 * 
 *  Although this segment is common in all the different SLLA segments, it has a different content in each
*/
export const BES = (
    /** gross price
     *  = sum of all(round(EHP.abrechnungspositionPrice * EHP.amount)) */
    gesamtbruttobetrag: number
) => segment(
    "BES",
    decimal(gesamtbruttobetrag, 10, 2)
)
