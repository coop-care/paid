/** based on documents: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.2 SLLA: A (Hilfsmittel)
 *  - Verordnungsformulare für Hilfsmittel: Muster 8, 8A, 15, 16
 * 
  * see docs/documents.md for more info
  */

import { segment } from "../../edifact/builder"
import { char, decimal, int, varchar, date, duration, time } from "../../edifact/formatter"
import { 
    HilfsmittelKennzeichenSchluessel,
    AnwendungsortSchluessel,
    ZuzahlungsartSchluessel
} from "../codes"
import { 
    Leistungserbringergruppe,
    leistungserbringergruppeCode 
} from "../types"
import { Hilfsmittelverordnung } from "./types"

/** Segments for SLLA B message (Hilfsmittel) */


/** Hilfsmittelidentifikationsnummer
 * 
 *  Contains the identification number of the adjuvant */
 export const HIL = (id: number) => segment("HIL", int(id, 0, 999))

/** Einzelfallnachweis Hilfsmittel
 * 
 *  Contains information about the adjuvant used */
export const EHI = (
    leistungserbringergruppe: Leistungserbringergruppe,
    /** Hilfsmittelpositionsnummer. See ./codes.ts */
    positionsnummer: string,
    /** number of adjuvants used */
    amount: number,
    /** Price of one adjuvant.
     *  If the price is plus VAT, the MWS segment must be appended
     *  If the price is VAT included, no MWS segment must be appended
      */
    abrechnungspositionPrice: number,
    /** date at which the adjuvant was used */
    serviceDate: Date,
    kennzeichen: HilfsmittelKennzeichenSchluessel,
    /** must be specified if the adjuvant is reinstateable */
    inventarnummerWiedereinsatz?: string | undefined,
    /** specialties of the adjuvant encoded in a 10-character string, if any. Has to be supplied for
     *  certain adjuvants. 
     *  See "Positionsnummer für Produktbesonderheiten von Hilfsmitteln" in ./codes.ts */
    positionnummerProduktbesonderheiten?: string | undefined,
    /** on which side the adjuvant was used, if applicable */
    anwendungsort?: AnwendungsortSchluessel | undefined,
    /** How many kilometers were driven */
    kilometersDriven?: number | undefined,
    startDateTime?: Date | undefined,
    endDateTime?: Date | undefined
) => segment(
    "EHI",
    leistungserbringergruppeCode(leistungserbringergruppe),
    char(positionsnummer, 10),
    decimal(amount, 4, 2),
    decimal(abrechnungspositionPrice, 10, 2),
    date(serviceDate),
    kennzeichen,
    varchar(inventarnummerWiedereinsatz, 20),
    varchar(positionnummerProduktbesonderheiten, 10),
    anwendungsort,
    int(kilometersDriven, 0, 999999),
    startDateTime ? time(startDateTime) : undefined,
    endDateTime ? time(endDateTime) : undefined,
    startDateTime && endDateTime ? int(duration(startDateTime, endDateTime), 0, 9999) : undefined,
    startDateTime ? date(startDateTime) : undefined,
    endDateTime ? date(endDateTime) : undefined
)

/** Zuzahlung Hilfsmittel
 * 
 *  Must be added for every health care service provided that requires a co-payment by he insuree
 */
export const ZUH = (
    id: number,
    /** gross price including VAT if applicable
     *  = round(sum of all(EHI.abrechnungspositionPrice * EHI.amount + (MWS.mehrwertsteuerBetrag ?? 0)))
     */
    bruttobetrag: number,
    zuzahlungsart?: ZuzahlungsartSchluessel | undefined,
    /** if zuzahlungsart == "01":
     *  = round(bruttobetrag * prozentuale Zuzahlung)
     */
    gesetzlicheZuzahlungBetrag?: number | undefined,
    /** amount of co-payment by the insuree */
    eigenanteilBetrag?: number | undefined,
    /** Only to be specified if the adjuvant is made for consumption. Time in months the care is 
     *  provided (adjuvant is used) */
    versorgungszeitraum?: number | undefined
) => segment(
    "ZUH",
    int(id, 0, 999),
    decimal(bruttobetrag, 10, 2),
    zuzahlungsart,
    decimal(gesetzlicheZuzahlungBetrag, 10, 2),
    decimal(eigenanteilBetrag, 10, 2),
    int(versorgungszeitraum, 0, 99)
)

/** Mehrkosten 
 *  
 *  Additional costs
 */
export const MEH = (
    /** Höhe der mit dem Versicherten abgerechneten Mehrkosten (Private Aufzahlungen gemäß 
     *  § 33 Abs. 1 Satz 5 SGB V, die der Kunde über die gesetzliche Zuzahlung (Feld 
     * „Betrag gesetzliche Zuzahlung“ Segment ZUH) und über den Eigenanteil (Feld „Betrag 
     * Eigenanteil“ Segment ZUH) hinaus trägt.). Falls keine Mehrkosten angefallen sind, ist 
     * "0,00" zu übermitteln. */
    mehrkostenBetrag: number
) => segment(
    "MEH",
    decimal(mehrkostenBetrag, 10, 2)
)

/** Zusatzinfo Verordnung Hilfsmittel
 * 
 *  Additional info about prescription. See 
 *    Verordnungsformulare für Hilfsmittel: Muster 8, 8A, 15, 16
 *  for how they look
 */
export const ZHI = (v : Hilfsmittelverordnung) => segment(
    "ZHI",
    varchar(v.betriebsstaettennummer ?? "999999999", 9),
    varchar(v.vertragsarztnummer ?? "999999999", 9),
    date(v.verordnungsDatum),
    v.zuzahlung,
    v.unfall,
    v.sonstigeEntschaedigung,
    v.verordnungsBesonderheiten
)

/** Betrags-Summen 
 * 
 *  Although this segment is common in all the different SLLA segments, it has a different content in each
*/
export const BES = (
    /** gross price including VAT if applicable 
     *  = sum of all(round(EHI.abrechnungspositionPrice * EHI.amount + (MWS.mehrwertsteuerBetrag ?? 0)))
     */
    gesamtbruttobetrag: number,
    /** = sum of all ZUH.gesetzlicheZuzahlungBetrag */
    gesetzlicheZuzahlungBetrag?: number | undefined,
    /** = sum of all ZUH.eigenanteilBetrag */
    eigenanteilBetrag?: number | undefined,
    /** = sum of all MEH.mehrkostenBetrag */
    mehrkostenBetrag?: number | undefined
) => segment(
    "BES",
    decimal(gesamtbruttobetrag, 10, 2),
    decimal(gesetzlicheZuzahlungBetrag, 10, 2),
    decimal(eigenanteilBetrag, 10, 2),
    decimal(mehrkostenBetrag, 10, 2)
)
