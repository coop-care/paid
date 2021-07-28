/** based on documents: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.9 SLLA: O (SAPV - Spezialisierte ambulante Palliativversorgung)
 * 
  * see docs/documents.md for more info
  */

import { segment } from "../../edifact/builder"
import { char, decimal, int, varchar, date, duration, time } from "../../edifact/formatter"
import { 
    Leistungserbringergruppe,
    leistungserbringergruppeCode
} from "../types"
import { SAPVVerordnung } from "./types"

/** Segments for SLLA O message (SAPV - Spezialisierte ambulante Palliativversorgung) 
*/

/** Informationen zum Beginn der Leistungserbringung beim Erstkontakt des SAPV-Leistungserbringers 
 */
export const ERS = (
    /** Date of first contact, i.e. the date at which the health care service provider first 
     *  provided a care service for the patient.  */
    firstContactDate: Date
) => segment(
    "ERS",
    date(firstContactDate)
)

/** Einzelfallnachweis SAPV */
export const ESP = (
    leistungserbringergruppe: Leistungserbringergruppe,
    /** Which service was provided. If a "Leistungspauschale" is specified here, ZZL segments need
     *  to be specified. */
    positionsnummer: string,
    /** Number of abrechnungspositions, f.e. 1x consulting or 3x fixed rate  */
    amount: number,
    /** Price of one abrechnungsposition */
    abrechnungspositionPrice: number,
    /** How many kilometers were driven, if applicable */
    kilometersDriven: number | undefined
) => segment(
    "ESP",
    leistungserbringergruppeCode(leistungserbringergruppe),
    char(positionsnummer, 10),
    decimal(amount, 4, 2),
    decimal(abrechnungspositionPrice, 10, 2),
    int(kilometersDriven, 0, 999999)
)

/** Zeitangabe zur Leistungserbringung */
export const ZZL = (
    /** Date and time at which the service started */
    startDateTime: Date,
    /** Date and time at which the service ended */
    endDateTime: Date
) => segment(
    "ZZL",
    date(startDateTime),
    time(startDateTime),
    date(endDateTime),
    time(endDateTime),
    int(duration(startDateTime, endDateTime), 0 , 9999)
)

/** Zusatzinfo Verordnung für SAPV 
 * 
 *  Additional info about prescription.
 * 
 *  See
 *    Verordnungsformular für SAPV: Muster 63
 *  for how the prescription looks
*/
export const ZSP = (v: SAPVVerordnung) => segment(
    "ZSP",
    varchar(v.betriebsstaettennummer ?? "999999999", 9),
    varchar(v.vertragsarztnummer ?? "999999999", 9),
    date(v.verordnungsDatum),
    v.unfall,
    date(v.verordnungsBeginn),
    date(v.verordnungsEnde),
    v.verordnungsBesonderheiten
)

/** Betrags-Summen 
 * 
 *  Although this segment is common in all the different SLLA segments, it has a different content in each
*/
export const BES = (
    /** gross price including VAT
     *  = sum of all(round(ESP.abrechnungspositionPrice * ESP.amount))
     */
    gesamtbruttobetrag: number
) => segment(
    "BES",
    decimal(gesamtbruttobetrag, 10, 2)
)
