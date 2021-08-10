/** based on documents: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.3 SLLA: B (Heilmittel) 
 *  - Informationen zu Heilmittel-Verordnungen
 * 
  * see docs/documents.md for more info
  */

import { segment } from "../../edifact/builder"
import { char, decimal, int, varchar, date } from "../../edifact/formatter"
import { AbrechnungscodeEinzelschluessel, TarifbereichSchluessel } from "../codes"
import { HeilmittelVerordnung } from "./types"

/** Segments for SLLA B message (Heilmittel) */

/** Einzelfallnachweis Heilmittel 
 * 
 *  Contains information about the therapies used */
 export const EHE = (
    abrechnungscode: AbrechnungscodeEinzelschluessel,
    tarifbereich: TarifbereichSchluessel,
    /** 3-character string, see Sondertarife in ./codes.ts */
    sondertarif: string,
    /** Heilmittelpositionsnummer. See ./codes.ts */
    positionsnummer: string,
    /** number of therapies used */
    amount: number,
    /** Price of one therapy.
     *  If the price is plus VAT, the MWS segment must be appended
     *  If the price is VAT included, no MWS segment must be appended
     */
    abrechnungspositionPrice: number,
    /** date at which the therapy was done */
    serviceDate: Date,
    /** Mandatory if the insuree had to do co-payment
     *  = round((abrechnungspositionPrice + (MWS.mehrwertsteuerBetrag ?? 0)) * Zuzahlungsprozentsatz */
    zuzahlungsbetrag: number | undefined,
    /** How many kilometers were driven, if applicable */
    kilometersDriven: number | undefined,
) => segment(
    "EHE",
    [
        abrechnungscode,
        tarifbereich + char(sondertarif, 3)
    ],
    char(positionsnummer, 5),
    decimal(amount, 4, 2),
    decimal(abrechnungspositionPrice, 10, 2),
    /** date at which the adjuvant was used */
    date(serviceDate),
    decimal(zuzahlungsbetrag, 10, 2),
    int(kilometersDriven, 0, 999999),
)

/** Zusatzinfo Verordnung Heilmittel
 * 
 *  Additional info about prescription (for therapy). See
 *    Informationen zu Heilmittel-Verordnungen
 *   for how it looks like
 */
export const ZHE = (v: HeilmittelVerordnung) => segment(
    "ZHE",
    varchar(v.betriebsstaettennummer ?? "999999999", 9),
    varchar(v.vertragsarztnummer ?? "999999999", 9),
    date(v.verordnungsDatum),
    v.zuzahlung,
    varchar(v.diagnosegruppe ?? "9999", 4),
    v.verordnungsart ?? "99",
    v.verordnungsBesonderheiten,
    v.unfall,
    v.sonstigeEntschaedigung,
    // ex start date of therapy. Not used anymore
    undefined,
    v.therapiebericht ? "1" : undefined,
    v.hausbesuch ? "1" : undefined,
    v.leitsymptomatik ? (
        v.leitsymptomatik.a ? "1" : "0" + 
        v.leitsymptomatik.b ? "1" : "0" + 
        v.leitsymptomatik.c ? "1" : "0" +
        v.leitsymptomatik.patientenindividuell ? "1" : "0"
    ) : "9999",
    v.patientenindividuelleLeitsymptomatik?.substr(0, 70),
    v.dringlicherBehandlungsbedarf ? "1" : "0",
    v.heilmittelBereich,
    char(v.therapieFrequenz, 1)
)

/** Betrags-Summen 
 * 
 *  to be transmitted for Verarbeitungskennzeichen 1, 2 or 4
 * 
 *  Although this segment is common in all the different SLLA segments, it has a different content in each
*/
export const BES = (
    /** gross price including VAT if applicable 
     *  = sum of all(round(EHE.abrechnungspositionPrice * EHE.amount + (MWS.mehrwertsteuerBetrag ?? 0)))
     */
    gesamtbruttobetrag: number,
    /** = gesamtbetragProzentualeZuzahlung + pauschalerZuzahlungsbetrag */
    gesetzlicheZuzahlungBetrag?: number | undefined,
    /** = sum of all(round(EHE.zuzahlungsbetrag * EHE.amount)) */
    gesamtbetragProzentualeZuzahlung?: number | undefined,
    /** 10.00 EUR but at most gesamtbruttobetrag - gesamtbetragProzentualeZuzahlung */
    pauschalerZuzahlungsbetrag?: number | undefined,
    /** Only specify if Verarbeitungskennzeichen == 4 */
    pauschalerKorrekturabzug?: number | undefined,
) => segment(
    "BES",
    decimal(gesamtbruttobetrag, 10, 2),
    decimal(gesetzlicheZuzahlungBetrag, 10, 2),
    decimal(gesamtbetragProzentualeZuzahlung, 10, 2),
    decimal(pauschalerZuzahlungsbetrag, 10, 2),
    decimal(pauschalerKorrekturabzug, 10, 2),
)

/** Gesamtbetrag Zuzahlungsforderung 
 * 
 *  only to be transmitted if Verarbeitungskennzeichen == 3
 * 
 *  NOTE: When this segment is used, the calculation of SLGA.GES needs to be adjusted!
*/
export const GZF = (
    /** = gesamtbetragProzentualeZuzahlung + pauschalerZuzahlungsbetrag */
    gesetzlicheZuzahlungBetrag?: number | undefined,
    /** = sum of all(round(EHE.zuzahlungsbetrag * EHE.amount)) */
    gesamtbetragProzentualeZuzahlung?: number | undefined,
    /** 10.00 EUR but at most gesamtbruttobetrag - gesamtbetragProzentualeZuzahlung */
    pauschalerZuzahlungsbetrag?: number | undefined,
) => segment(
    "GZF",
    decimal(gesetzlicheZuzahlungBetrag, 10, 2),
    decimal(gesamtbetragProzentualeZuzahlung, 10, 2),
    decimal(pauschalerZuzahlungsbetrag, 10, 2)
)
