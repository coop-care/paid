/** based on document: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.10 SLLA: P (gesundheitliche Versorgungsplanung nach § 132g SGB V)
 * 
  * see docs/documents.md for more info
  */

import { segment } from "../../edifact/builder"
import { char, decimal, int, varchar, date } from "../../edifact/formatter"
import { AbrechnungscodeEinzelschluessel, TarifbereichSchluessel } from "../codes"

/** Segments for SLLA P message (gesundheitliche Versorgungsplanung nach § 132g SGB V) 
*/

/** Einzelfallnachweis gesundheitliche Versorgungsplanung  */
export const EGV = (
    abrechnungscode: AbrechnungscodeEinzelschluessel,
    tarifbereich: TarifbereichSchluessel,
    /** 3-character string, see Sondertarife in ./codes.ts */
    sondertarif: string,
    /** Abrechnungspositionsnummer für sonstige Leistungen. See ./codes.ts */
    positionsnummer: string,
    amount: number,
    /** Price of one Abrechnungsposition */
    abrechnungspositionPrice: number,
    /** date at which the care was provided
     *  or if Abrechnung via Pauschale: start date of Abrechnungszeitraum */
    serviceStartDate: Date,
    /** if Abrechnung via Pauschale: end date of Abrechnungszeitraum
     *  otherwise undefined */
    serviceEndDate: Date | undefined,
) => segment(
    "EGV",
    [
        abrechnungscode,
        tarifbereich + char(sondertarif, 3)
    ],
    char(positionsnummer, 7),
    decimal(amount, 4, 2),
    decimal(abrechnungspositionPrice, 10, 2),
    date(serviceStartDate),
    serviceEndDate ? date(serviceEndDate) : undefined,
)

/** Informationen zum Beratungsprozess  */
export const IBP = (
    /** Whether the consultation is the first (true) or another one */
    isFirstConsultation: boolean,
    /** Start date of consultation process */
    consultationProcessStart: Date,
    /** End date of consultation process */
    consultationProcessEnd: Date,
    /** Number of conversation held in the consultation process */
    conversationCount: number,
    /** name of consultant */
    consultantName: string
) => segment(
    "IBP",
    isFirstConsultation ? "1" : "2",
    date(consultationProcessStart),
    date(consultationProcessEnd),
    int(conversationCount, 0, 999999),
    varchar(consultantName, 70)
)

/** Betrags-Summen 
 * 
 *  Although this segment is common in all the different SLLA segments, it has a different content in each
*/
export const BES = (
    /** gross price
     *  = sum of all(round(EGV.abrechnungspositionPrice * EGV.amount)) */
    gesamtbruttobetrag: number
) => segment(
    "BES",
    decimal(gesamtbruttobetrag, 10, 2)
)
