/** based on document: 
 *  Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung
 * 
  * see docs/documents.md for more info
  */

import { segment } from "../edifact/builder"
import { char, decimal, int, varchar, date } from "../edifact/formatter"
import { 
    SummenstatusSchluessel,
    VerarbeitungskennzeichenSchluessel
} from "./codes"
import { Rechnung } from "./types"

/** Segments for SLGA message */

/** Funktion
 * 
 *  FKT in SGLA that accompanies an SLLA */
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
    char(r.rechnungsstellerIK, 9)
)

/** FKT in Sammelrechnungs-SLGA */
export const FKT_Sammelrechnung = (
    verarbeitungskennzeichen: VerarbeitungskennzeichenSchluessel,
    rechnungsstellerIK: string,
    kostentraegerIK: string
) => segment(
    "FKT",
    verarbeitungskennzeichen,
    "J",
    char(rechnungsstellerIK, 9),
    char(kostentraegerIK, 9),
    undefined,
    char(rechnungsstellerIK, 9)
)

/** Rechnung / Zahlung
 * 
 *  Contains information about bill number and date */
 export const REC = (r: Rechnung) => segment(
    "REC",
    [varchar(r.sammelRechnungsnummer, 14), varchar(r.einzelRechnungsnummer ?? "0", 6)],
    date(r.rechnungsdatum),
    r.rechnungsart
)

/** Umsatzsteuer
 * 
 *  Not to be used in Sammelrechnung-SLGA */
 export const UST = (
    /** Steuernummer (according to §14 Abs. 1a) OR Umsatzsteuer-Identifikationsnummer */
    umsatzsteuerIdentifikationsnummer: string,
    /** whether it is Umsatzsteuer excempt (according to §4 UStG) */
    umsatzsteuerBefreit: boolean
) => segment(
    "UST",
    varchar(umsatzsteuerIdentifikationsnummer, 20),
    umsatzsteuerBefreit ? "J" : undefined
)

/** Skonto
 * 
 *  Contains information about cashback */
 export const SKO = (
    /** granted skonto in percent */
    skontoPercent: number,
    /** skonto is granted if payment is settled within the given number of days */
    zahlungsziel: number
) => segment(
    "SKO",
    decimal(skontoPercent, 2, 2),
    int(zahlungsziel, 0, 999)
)


/** Rechnungssummen (Status) 
 * 
 * Contains information on Bruttobetrag, Zuzahlungsbetrag, Nettobetrag per Status
 * 
 * The sums for the amounts. The sums are to be grouped by SummenstatusSchluessel:
 * First for the 00 status (sum of all), then the other status.
 * 
 * Thus, this segment must occur at least 2 times
*/
export const GES = (
    summenstatusSchluessel: SummenstatusSchluessel,
    /** if Verarbeitungskennzeichen == 1 or 2 or 4:
     *    = gesamtbruttobetrag - zuzahlungsbetrag
     *  if verarbeitungskennzeichen == 3:
     *    = zuzahlungsbetrag
     */
    gesamtrechnungsbetrag: number,
    /** if Verarbeitungskennzeichen == 1 or 2 or 4:
     *    = sum of all(BES.gesamtbruttobetrag including gesetzlicheZuzahlungBetrag, eigenanteilBetrag, pauschale korrekturBetrag, Mehrwehrtsteuer)
     *  if verarbeitungskennzeichen == 3:
     *    = 0.00
     */
    gesamtbruttobetrag: number,
    /** if Verarbeitungskennzeichen == 1 or 2:
     *    = sum of all(BES.gesetzlicheZuzahlungBetrag + BES.eigenanteilBetrag)
     *  if Verarbeitungskennzeichen == 3:
     *    = sum of all(GZF.gesetzlicheZuzahlungBetrag + GZF.eigenanteilBetrag)
     *  if Verarbeitungskennzeichen == 4:
     *    = sum of all(BES.gesetzlicheZuzahlungBetrag + BES.eigenanteilBetrag + BES.pauschalerKorrekturbetrag)
     */
    zuzahlungsbetrag: number
) => segment(
    "GES",
    summenstatusSchluessel,
    decimal(gesamtrechnungsbetrag, 10, 2),
    decimal(gesamtbruttobetrag, 10, 2),
    decimal(zuzahlungsbetrag, 10, 2)
)

/** Namen
 * 
 *  Name(s) and contacts of health care provider */
 export const NAM = (
    /** Name of the biller (Leistungserbringer / Abrechnungsstelle) */
    name: string,
    /** 1st Contact person and phone number */
    contact1?: string,
    /** 2nd Contact person and phone number */
    contact2?: string,
    /** 3rd Contact person and phone number */
    contact3?: string,
    email?: string
) => segment(
    "NAM",
    varchar(name, 30),
    varchar(contact1, 30),
    varchar(contact2, 30),
    varchar(contact3, 30),
    varchar(email, 70)
)
