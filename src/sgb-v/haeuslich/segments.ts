/** based on documents: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.4 SLLA: C (Häusliche Krankenpflege)
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.5 SLLA: D (Haushaltshilfe)
 *  - Verordnungsformular für häusliche Krankenpflege: Muster 12
 * 
  * see docs/documents.md for more info
  */

import { segment } from "../../edifact/builder"
import { decimal, int, varchar, date, duration, time } from "../../edifact/formatter"
import { 
    haeuslicheKrankenpflegePositionsnummerCode
} from "./codes"
import { Leistungserbringergruppe, leistungserbringergruppeCode, Verordnung } from "../types"
import { 
    HaeuslicheKrankenpflegeAbrechnungsposition,
    HaeuslicheKrankenpflegeEinzelposition
} from "./types"
import { HaeuslicheLeistungserbringerSammelgruppenSchluessel } from "../codes"

/** Segments for SLLA C message (Häusliche Krankenpflege) and SLLA D message (Haushaltshilfe)
 * 
 *  Except for the segment tags, they are almost identical, this is why they are defined in the
 *  same file */

/** Informationen zum Einsatz/Hausbesuch für häusliche Krankenpflege / Haushaltshilfe */
export const einsatzSegment = (
    type: HaeuslicheLeistungserbringerSammelgruppenSchluessel,
    /** Date and time at which the health care service started */
    startDateTime: Date,
    /** Date and time at which the health care service ended */
    endDateTime: Date
) => segment(
    type == "C" ? "ESK" : "ESH",
    date(startDateTime),
    time(startDateTime),
    time(endDateTime),
    int(duration(startDateTime, endDateTime), 0, 9999)
)

/** Einzelfallnachweis Häusliche Krankenpflege / Haushaltshilfe */
export const einzelfallnachweisSegment = (
    type: HaeuslicheLeistungserbringerSammelgruppenSchluessel,
    a: HaeuslicheKrankenpflegeAbrechnungsposition,
    le: Leistungserbringergruppe
) => segment(
    type == "C" ? "EHK" : "EHH",
    leistungserbringergruppeCode(le),
    haeuslicheKrankenpflegePositionsnummerCode(a.positionsnummer),
    decimal(a.anzahl, 4, 2),
    decimal(a.einzelpreis, 10, 2),
    int(a.gefahreneKilometer, 0, 999999)
)

/** Erbrachte unterschiedliche Leistungen je Leistungspauschale 
 * 
 *  To be specified X times if EHK.positionsnummer was a "Leistungspauschale". Each the single 
 *  services provided need to be listed here then.
*/
export const ELP = (e: HaeuslicheKrankenpflegeEinzelposition) => segment(
    "ELP",
    haeuslicheKrankenpflegePositionsnummerCode(e.positionsnummer),
    decimal(e.anzahl, 4, 2)
)

/** Zusatzinfo Verordnung für Häusliche Krankenpflege / Haushaltshilfe */
export const verordnungSegment = (
    type: HaeuslicheLeistungserbringerSammelgruppenSchluessel,
    v: Verordnung
) => segment(
    type == "C" ? "ZHK" : "ZHH",
    varchar(v.betriebsstaettennummer ?? "999999999", 9),
    varchar(v.vertragsarztnummer ?? "999999999", 9),
    date(v.verordnungsDatum),
    v.unfall,
    v.sonstigeEntschaedigung,
    v.verordnungsBesonderheiten
)

/** Betrags-Summen 
 * 
 *  Although this segment is common in all the different SLLA segments, it has a different content 
 *  in each
*/
export const BES = (
    /** gross price including VAT (EHK/EHH depending on the message:)
     *  = sum of all(round(EHK.abrechnungspositionPrice * EHK.amount))
     */
    gesamtbruttobetrag: number
) => segment(
    "BES",
    decimal(gesamtbruttobetrag, 10, 2)
)
