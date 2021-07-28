/** based on document: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.1 SLLA: Basis-Segment
 * 
  * see docs/documents.md for more info
  */

import { segment } from "../edifact/builder"
import { char, varchar, fixedInt, date, decimal } from "../edifact/formatter"
import { BeleginformationSchluessel, VerarbeitungskennzeichenSchluessel } from "./codes"
import { REC as SLGA_REC } from "./segments_slga"
import { Diagnose, Kostenzusage, Rechnung, Versicherter } from "./types"

/** Base-Segments for SLLA message 
 *  
 *  i.e. they are guaranteed to be the same for all SLLA messages
*/

/** Funktion
 * 
 *  Contains information about care provider, IK of health insurance card */
 export const FKT = (
    verarbeitungskennzeichen: VerarbeitungskennzeichenSchluessel, 
    r: Rechnung
) => segment(
    "FKT",
    verarbeitungskennzeichen,
    undefined,
    char(r.leistungserbringerIK, 9),
    char(r.kostentraegerIK, 9),
    char(r.pflegekasseIK, 9),
    char(r.rechnungsart == "3" ? r.rechnungsstellerIK : undefined, 9)
)


/** SLGA.REC and SLLA.REC are documented to be identical. Still aliasing it here, because 
 *  users don't need to be aware of this
 */
export const REC = SLGA_REC

/** Information Versicherte
 * 
 *  Contains information about insuree */
export const INV = (
    /** The field "Versicherten-Nr." from the prescription. Mandatory if known. If not known, full 
     *  address and date of birth must be specified in NAD */
    versichertennummer: string | undefined,
    /** The field "Status" (Versichertenstatus) from the prescription. Mandatory if known. 
     *  If not known, full address and date of birth must be specified in NAD */
    versichertenstatus: string | undefined,
    beleginformation: BeleginformationSchluessel | undefined,
    /** Unique number within the whole bill. 
     * 
     *  ASK Belegnummer: Docs mention "siehe § 4 des Richtlinientextes". Neither §4 of 
     *  Heilmittelrichtlinie nor §4 Hilfsmittelrichtlinie seem to be related here.
     */
    belegnummer: string,
    /** "Vertragskennzeichen für besondere Versorgungsformen gemäß der vertraglichen Vereinbarungen.
     *  Für Verordnungen im Rahmen der Versorgung nach §116b Abs. 1 SGB V ist eine "1" zu 
     *  übermitteln." https://www.gesetze-im-internet.de/sgb_5/__116b.html
     */
    besondereVersorgungsformKennzeichen: string | undefined
) => segment(
    "INV",
    varchar(versichertennummer, 12),
    /* only those digits of the status are specified that are visible on the prescription. I.e. 
       there could be more or less than 5 characters. If it is less than 5, they are padded with 
       "0"s at the END, if it is more than 5, the digits at the end are cut off */
    char(versichertenstatus?.substring(0, 5)?.padEnd(5, "0"), 5),
    beleginformation,
    varchar(belegnummer, 10),
    varchar(besondereVersorgungsformKennzeichen, 25)
)

/** ursprüngliche Rechnung/Zahlung
 * 
 *  to be used in the frame of the "Korrekturverfahren" (Verarbeitungskennzeichen != 01).
 *  It contains information from REC, FKT and INV of the original (Verarbeitungskennzeichen == 01)
 *  to-be-corrected bill
 */
export const URI = (
    /** SGLA.FKT.leistungserbringerIK from original bill */
    originalLeistungserbringerIK: string,
    /** SGLA.REC.sammelRechnungsnummer from original bill */
    originalSammelRechnungsnummer: string,
    /** SGLA.REC.einzelRechnungsnummer from original bill */
    originalEinzelRechnungsnummer: string | undefined,
    /** SGLA.REC.rechnungsdatum from original bill */
    originalRechnungsdatum: Date,
    /** SGLA.REC.belegnummer from original bill */
    belegnummer: string,
) => segment(
    "URI",
    char(originalLeistungserbringerIK, 9),
    [varchar(originalSammelRechnungsnummer, 14), varchar(originalEinzelRechnungsnummer ?? "0", 6)],
    date(originalRechnungsdatum),
    varchar(belegnummer, 10)
)

/** Name und Adresse Versicherter
 * 
 *  Contains additional information about the insuree */
 export const NAD = (v: Versicherter) => segment(
    "NAD",
    v.lastName.substr(0, 47),
    v.firstName.substr(0, 30),
    date(v.birthday),
    v.address ? concatStreetAndHousenumber(v.address.street, v.address.houseNumber, 30) : undefined,
    v.address?.postalCode?.substr(0, 7),
    v.address?.city?.substr(0, 25),
    v.address?.countryCode
)

function concatStreetAndHousenumber(street: string, houseNumber: string, maxLength: number): string {
    if (houseNumber == "") {
        return street.substr(0, maxLength)
    } else {
        /** If we have to cut, we should cut the street, not the housenumber - if possible */
        const len = Math.max(0, maxLength - houseNumber.length /* the space: */ - 1 )
        return (street.substr(0, len) + " " + houseNumber).substr(0, maxLength)
    }
}

/** Imagename 
 * 
 *  Contains information about image name when transferring image archives */
 export const IMG = (
    year: number,
    month: number,
    /** IK of the office that created the image and the dataset */
    imageIK: string
) => segment(
    "IMG",
    fixedInt(year, 4),
    fixedInt(month, 2),
    char(imageIK, 9)
)


/** Common segments for (all) SLLA messages
 * 
 *  that are also identical in their content!
 */

/** Textfeld */
export const TXT = (description: string) => segment("TXT", description.substr(0, 70))

/** Diagnose */
 export const DIA = (d: Diagnose) => segment(
    "DIA",
    varchar(d.diagnoseschluessel, 12),
    d.diagnosetext?.substr(0, 70)
)

/** Kostenzusage */
export const SKZ = (k: Kostenzusage) => segment(
    "SKZ",
    varchar(k.genehmigungsKennzeichen, 20),
    date(k.genehmigungsDatum),
    k.kostenzusageGenehmigung
)

/** Mehrwertsteuer
 * 
 *  Must be added only if the price in EHI/EHE/EKT is plus VAT
 */
 export const MWS = (
    mehrwertsteuersatz: number,
    /** (EHI/EHE/EKT, depending on the message)
     *  = round(EHI.abrechnungspositionPrice * EHI.amount * mehrwertsteuersatz) */
    mehrwertsteuerBetrag: number
) => segment(
    "MWS",
    decimal(mehrwertsteuersatz, 2, 2),
    decimal(mehrwertsteuerBetrag, 10, 2)
)