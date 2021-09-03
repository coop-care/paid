/** based on document: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.6 SLLA: E (Krankentransportleistungen)
 *  - Verordnungsformular für Krankenhauseinweisung: Muster 2
 * 
  * see docs/documents.md for more info
  */

import { segment } from "../../edifact/builder"
import { char, decimal, int, varchar, date, duration, time } from "../../edifact/formatter"
import { ZuzahlungsartSchluessel } from "../codes"
import { LaenderkennzeichenSchluessel } from "../../country_codes"
import { KrankentransportVerordnung } from "./types"
import { Leistungserbringergruppe, leistungserbringergruppeCode } from "../types"

/** Segments for SLLA E message (Krankentransportleistungen) */

/** Krankentransportleistungen 
 * 
 *  Information about where the patient was picked up, and where he was dropped of
 */
export const KTL = (
    /** Identifikationsnummer  */
    id: number,
    /** Address where patient was picked up. Usually street and housenumber, or f.e. "A45, Kilometer 7" */
    pickupStreetAndHousenumber: string,
    /** Postcode at which the pationt was picked up, if known */
    pickupPostalCode: string | undefined,
    /** Mandatory if the pickup location was outside of Germany */
    pickupLaenderkennzeichen: LaenderkennzeichenSchluessel | undefined,
    /** City/Place name at which the pationt was picked up, if known */
    pickupPlaceName: string | undefined,
    /** Place where patient was dropped of */
    dropOffStreetAndHousenumber: string,
    /** Postcode at which the patient was dropped of */
    dropOffPostalCode: string,
    /** Mandatory if the drop off location was outside of Germany */
    dropOffLaenderkennzeichen: LaenderkennzeichenSchluessel | undefined,
    /** City/Place name at which the pationt was dropped of, if known */
    dropOffPlaceName: string | undefined,
) => segment(
    "KTL",
    int(id, 0, 999),
    varchar(pickupStreetAndHousenumber, 30),
    varchar(pickupPostalCode, 7),
    pickupLaenderkennzeichen,
    varchar(pickupPlaceName, 25),
    varchar(dropOffStreetAndHousenumber, 30),
    varchar(dropOffPostalCode, 7),
    dropOffLaenderkennzeichen,
    varchar(dropOffPlaceName, 25),
)

/** Einzelfallnachweis Krankentransport  */
export const EKT = (
    leistungserbringergruppe: Leistungserbringergruppe,
    /** Which service was provided */
    positionsnummer: string,
    /** If the "pauschale is used", "kilometersDriven" must be specified too */
    amount: number,
    /** Price of one abrechnungsposition */
    abrechnungspositionPrice: number,
    /** How many kilometers were driven, if applicable */
    kilometersDriven: number | undefined,
    /** Date and time at which the service started */
    startDateTime: Date,
    /** Date and time at which the service ended */
    endDateTime: Date
) => segment(
    "EKT",
    leistungserbringergruppeCode(leistungserbringergruppe),
    char(positionsnummer, 6),
    decimal(amount, 4, 2),
    decimal(abrechnungspositionPrice, 10, 2),
    date(startDateTime),
    decimal(kilometersDriven, 4, 2),
    time(startDateTime),
    time(endDateTime),
    int(duration(startDateTime, endDateTime), 0, 9999)
)

/** Zuzahlung
 * 
 *  Must be added for service provided that requires a co-payment by he insuree according to
 *  § 61 SGB V Satz 1
 */
 export const ZUK = (
    /** same as KTL.id */
    id: number,
    /** gross price including VAT if applicable
     *  = round(sum of all(EKT.abrechnungspositionPrice * EKT.amount + (MWS.mehrwertsteuerBetrag ?? 0)))
     */
    bruttobetrag: number,
    zuzahlungsart?: ZuzahlungsartSchluessel | undefined,
    /** gesetzliche Zuzahlung je Leistung */
    gesetzlicheZuzahlungBetrag?: number | undefined,
) => segment(
    "ZUK",
    int(id, 0, 999),
    decimal(bruttobetrag, 10, 2),
    zuzahlungsart,
    decimal(gesetzlicheZuzahlungBetrag, 10, 2)
)

/** Zusatzinfo Verordnung 
 * 
 *  Additional info about prescription.
 * 
 *  See
 *    Verordnungsformular für Krankenhauseinweisung: Muster 2
 *  for how the prescription looks
*/
export const ZKT = ({
    betriebsstaettennummer,
    vertragsarztnummer,
    zuzahlung,
    verordnungsDatum,
    unfall,
    sonstigeEntschaedigung
}: KrankentransportVerordnung) => segment(
    "ZKT",
    varchar(betriebsstaettennummer ?? "999999999", 9),
    varchar(vertragsarztnummer ?? "999999999", 9),
    zuzahlung,
    verordnungsDatum ? date(verordnungsDatum) : undefined,
    unfall,
    sonstigeEntschaedigung,
)

/** Betrags-Summen 
 * 
 *  Although this segment is common in all the different SLLA segments, it has a different content in each
 * 
 *  NOTE: When this segment is used, the calculation of SLGA.GES needs to be adjusted!
*/
export const BES = (
    /** gross price including VAT if applicable
     *  = sum of all(round(EKT.abrechnungspositionPrice * EKT.amount + (MWS.mehrwertsteuerBetrag ?? 0)))
     */
    gesamtbruttobetrag: number,
    /** = sum of all ZUK.gesetzlicheZuzahlungBetrag */
    gesetzlicheZuzahlungBetrag?: number | undefined,
) => segment(
    "BES",
    decimal(gesamtbruttobetrag, 10, 2),
    decimal(gesetzlicheZuzahlungBetrag, 10, 2)
)
