/** based on document: 
 *  Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung
 * 
  * see docs/documents.md for more info
  */

import { segment } from "../edifact/builder"
import { char, decimal, int, varchar, date } from "../edifact/formatter"
import { Segment } from "../edifact/types"
import { Ansprechpartner, Institution } from "../types"
import { 
    SummenstatusSchluessel,
    VerarbeitungskennzeichenSchluessel
} from "./codes"
import { Einzelrechnung, Sammelrechung, Skonto } from "./types"

/** Segments for SLGA message */

/** Funktion
 * 
 *  FKT in SGLA that accompanies an SLLA */
 export const FKT = (
    verarbeitungskennzeichen: VerarbeitungskennzeichenSchluessel,
    r: Einzelrechnung
) => segment(
    "FKT",
    verarbeitungskennzeichen, 
    undefined, 
    char(r.leistungserbringer.ik, 9), 
    char(r.kostentraegerIK, 9), 
    char(r.pflegekasseIK, 9),
    char(r.rechnungssteller.ik, 9)
)

/** FKT in Sammelrechnungs-SLGA */
export const FKT_Sammelrechnung = (
    verarbeitungskennzeichen: VerarbeitungskennzeichenSchluessel,
    r: Sammelrechung
) => segment(
    "FKT",
    verarbeitungskennzeichen,
    "J",
    char(r.rechnungssteller.ik, 9),
    char(r.kostentraegerIK, 9),
    undefined,
    char(r.rechnungssteller.ik, 9)
)

/** Rechnung / Zahlung
 * 
 *  Contains information about bill number and date */
 export const REC = (r: Einzelrechnung) => segment(
    "REC",
    [varchar(r.sammelRechnungsnummer, 14), varchar(r.einzelRechnungsnummer ?? "0", 6)],
    date(r.rechnungsdatum),
    r.rechnungsart
)

export const REC_Sammelrechnung = (r: Sammelrechung) => segment(
    "REC",
    [varchar(r.sammelRechnungsnummer, 14), "0"],
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

/** Skonto */
 export const SKO = (s: Skonto) => segment(
    "SKO",
    decimal(s.skontoPercent, 2, 2),
    int(s.zahlungsziel, 0, 999)
)


const GES_internal = (
    summenstatusSchluessel: SummenstatusSchluessel,
    /** if Verarbeitungskennzeichen == 1 or 2 or 4:
     *    = gesamtbruttobetrag - zuzahlungs_eigenanteil_korrekturbetrag
     *  if verarbeitungskennzeichen == 3:
     *    = zuzahlungs_eigenanteil_korrekturbetrag
     */
    gesamtrechnungsbetrag: number,
    /** if Verarbeitungskennzeichen == 1 or 2 or 4:
     *    = sum of all(BES.gesamtbruttobetrag)
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
    zuzahlungs_eigenanteil_korrekturbetrag: number
) => segment(
    "GES",
    summenstatusSchluessel,
    decimal(gesamtrechnungsbetrag, 10, 2),
    decimal(gesamtbruttobetrag, 10, 2),
    decimal(zuzahlungs_eigenanteil_korrekturbetrag, 10, 2)
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
    gesamtbruttobetrag: number,
    zuzahlungsUndEigenanteilUndPauschKorrekturBetrag: number
) => GES_internal(
    summenstatusSchluessel,
    gesamtbruttobetrag - zuzahlungsUndEigenanteilUndPauschKorrekturBetrag,
    gesamtbruttobetrag,
    zuzahlungsUndEigenanteilUndPauschKorrekturBetrag
)

/** Same as GES, but for Verarbeitungskennzeichen == "03" */
export const GES_VKZ3 = (
    summenstatusSchluessel: SummenstatusSchluessel,
    zuzahlungsUndEigenanteilUndPauschKorrekturBetrag: number
) => GES_internal(
    summenstatusSchluessel,
    zuzahlungsUndEigenanteilUndPauschKorrekturBetrag,
    0,
    zuzahlungsUndEigenanteilUndPauschKorrekturBetrag
)

/** Namen
 * 
 *  Name(s) and contacts of health care provider */
export const NAM = (institution: Institution): Segment => {
    // we need exactly 3 Ansprechpartner - the rest is filled with undefined 
    const ansprechpartner3: Array<string | undefined> = [undefined, undefined, undefined]
    for (let i = 0; i < 3; i++) {
        const a = institution.ansprechpartner[i]
        if (a) {
            // f.e. {name: "John", phone: "123"} becomes "John, 123"
            ansprechpartner3[i] = Object.values(a).filter(Boolean).join(", ").substr(0, 30)
        }
    }

    return segment(
        "NAM",
        institution.name.substr(0, 30),
        ...ansprechpartner3,
        institution.email?.substr(0, 70)
    )
}
