/** based on document: 
 *  Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung
 * 
  * see docs/documents.md for more info
  */

import { segment } from "../edifact/builder"
import { char, decimal, int, varchar, date } from "../edifact/formatter"
import { Segment } from "../edifact/types"
import { Institution } from "../types"
import { 
    SummenstatusSchluessel,
    VerarbeitungskennzeichenSchluessel
} from "./codes"
import { 
    Einzelrechnung, 
    Leistungserbringer, 
    Sammelrechnung, 
    Skonto
} from "./types"

/** Segments for SLGA message */

/** Funktion
 * 
 *  FKT in SGLA that accompanies an SLLA */
 export const FKT = (
    verarbeitungskennzeichen: VerarbeitungskennzeichenSchluessel,
    {
        leistungserbringer,
        kostentraegerIK,
        pflegekasseIK,
        senderIK
    }: Einzelrechnung
) => segment(
    "FKT",
    verarbeitungskennzeichen, 
    undefined, 
    char(leistungserbringer.ik, 9), 
    char(kostentraegerIK, 9), 
    char(pflegekasseIK, 9),
    char(senderIK, 9)
)

/** FKT in Sammelrechnungs-SLGA */
export const FKT_Sammelrechnung = (
    verarbeitungskennzeichen: VerarbeitungskennzeichenSchluessel,
    {
        rechnungssteller,
        kostentraegerIK,
        senderIK
    }: Sammelrechnung
) => segment(
    "FKT",
    verarbeitungskennzeichen,
    "J",
    char(rechnungssteller.ik, 9),
    char(kostentraegerIK, 9),
    undefined,
    char(senderIK, 9)
)

/** Rechnung / Zahlung
 * 
 *  Contains information about bill number and date */
export const REC = ({
     sammelRechnungsnummer,
     einzelRechnungsnummer,
     rechnungsdatum,
     rechnungsart
}: Einzelrechnung) => segment(
    "REC",
    [varchar(sammelRechnungsnummer, 14), varchar(einzelRechnungsnummer ?? "0", 6)],
    date(rechnungsdatum),
    rechnungsart
)

export const REC_Sammelrechnung = ({
    sammelRechnungsnummer,
    rechnungsdatum,
    rechnungsart
}: Sammelrechnung) => segment(
    "REC",
    [varchar(sammelRechnungsnummer, 14), "0"],
    date(rechnungsdatum),
    rechnungsart
)


/** Umsatzsteuer
 * 
 *  Not to be used in Sammelrechnung-SLGA */
 export const UST = ({
    umsatzsteuerOrdnungsnummer,
    umsatzsteuerBefreiung
}: Leistungserbringer) => segment(
    "UST",
    varchar(umsatzsteuerOrdnungsnummer, 20),
    umsatzsteuerBefreiung ? "J" : undefined
)

/** Skonto */
 export const SKO = ({ skontoPercent, zahlungsziel }: Skonto) => segment(
    "SKO",
    decimal(skontoPercent, 2, 2),
    int(zahlungsziel, 0, 999)
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
        const ansprechnpartner = institution.ansprechpartner[i]
        if (ansprechnpartner) {
            // f.e. {name: "John", phone: "123"} becomes "John, 123"
            ansprechpartner3[i] = Object.values(ansprechnpartner).filter(Boolean).join(", ").substr(0, 30)
        }
    }

    return segment(
        "NAM",
        institution.name.substr(0, 30),
        ...ansprechpartner3,
        institution.email?.substr(0, 70)
    )
}
