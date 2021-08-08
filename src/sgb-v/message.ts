/** based on documents: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung
 * 
  * see docs/documents.md for more info
  */

import { TestIndicator } from "../types"
import { 
    getSummenstatus,
    LeistungserbringerSammelgruppenSchluessel, SummenstatusSchluessel, summenstatusSchluessel,
} from "./codes"
import { elements } from "../edifact/builder"
import { date, time, char, fixedInt } from "../edifact/formatter"
import { Message, Segment } from "../edifact/types"
import { FKT, FKT_Sammelrechnung, GES, NAM, REC, REC_Sammelrechnung, SKO, UST } from "./segments_slga"
import { getAbrechnungsfallPositionen, Abrechnungsposition, calculateBruttobetrag, Einsatz, Einzelrechnung, Sammelrechung, calculateZuzahlungUndEigentanteilBetrag, Abrechnungsfall } from "./types"
import { sum } from "../utils"

export const makeInterchangeHeader = (
    /** IK of the sender (creator) of this bill */
    rechnungsstellerIK: string,
    /** IK of the designated recipient of this file */
    encryptedForIK: string,
    /** date at which this file has been created */
    dateCreated: Date,
    /** serial number that should increased by one for each transmission to the recipient. 
     *  A value from 00001-99999. It should loop back to 00001 before 100000 is reached. */
    datenaustauschreferenz: number,
    /** To which group of health care providers the care provider belongs */
    leistungsbereich: LeistungserbringerSammelgruppenSchluessel,
    /** AKA "logischer Dateneiname" */
    anwendungsreferenz: string,
    /** Whether this bill is just a test or its real data */
    testIndicator: TestIndicator
) => elements(
    ["UNOC", "3"],
    char(rechnungsstellerIK, 9),
    char(encryptedForIK, 9),
    [date(dateCreated), time(dateCreated)],
    fixedInt(datenaustauschreferenz, 5),
    leistungsbereich,
    char(anwendungsreferenz, 11),
    testIndicator
)

export const makeSLGA_SammelrechnungMessage = (s: Sammelrechung): Message => ({
    header: elements(["SLGA", "16", "0", "0"]),
    segments: [
        /* NOTE: if any other verarbeitungskennzeichen than "01" is supported, the calculation of 
                GES needs to be adjusted */ 
        FKT_Sammelrechnung("01", s),
        REC_Sammelrechnung(s),
        ...(s.skontos ?? []).slice(0,9).map(skonto => SKO(skonto)),
        ...calculateGESList(s.rechnungen.flatMap(r => r.abrechnungsfaelle)),
        NAM(s.rechnungssteller)
    ]
})


export const makeSLGAMessage = (r: Einzelrechnung): Message => ({
    header: elements(["SLGA", "16", "0", "0"]),
    segments: [
        /* NOTE: if any other verarbeitungskennzeichen than "01" is supported, the calculation of 
                 GES needs to be adjusted */ 
        FKT("01", r), 
        REC(r),
        UST(r.umsatzsteuerIdentifikationsnummer, r.umsatzsteuerBefreit),
        ...(r.skontos ?? []).slice(0,9).map(skonto => SKO(skonto)),
        ...calculateGESList(r.abrechnungsfaelle),
        NAM(r.leistungserbringer)
    ]
})

/** Returns a bunch of GES segments:
 * 
 *  Always a GES with Summenstatus "00" first and then each one GES segment for the other 
 *  Summenstatus if any Abrechnungspositions are actually ascribed to that Summenstatus.
 */
const calculateGESList = (abrechnungsfaelle: Abrechnungsfall[]): Segment[] => 
    Object.keys(summenstatusSchluessel).map(str => {
        const summenstatus = str as SummenstatusSchluessel
        const abrechnungspositions = getRechnungsAbrechnungspositionen(abrechnungsfaelle, summenstatus)
        // we only want GES segments for non-empty groups
        if (abrechnungspositions.length > 0) {
            const summen = calculateGesamtsummen(abrechnungspositions)
            return GES(summenstatus, summen.gesamtbruttobetrag, summen.zuzahlungUndEigenanteilBetrag)
        }
    // some segments are left out conditionally (by returning undefined), so we need to filter those out
    }).filter(segment => segment !== undefined) as Segment[]


/** Return all the Abrechnungspositions ascribed to the given Summenstatus */
const getRechnungsAbrechnungspositionen = (
    abrechnungsfaelle: Abrechnungsfall[],
    summenstatusSchluessel: SummenstatusSchluessel
): Abrechnungsposition[] => {
    // don't filter at all for Summenstatus 00
    if (summenstatusSchluessel != "00") {
        abrechnungsfaelle = abrechnungsfaelle.filter(fall => 
            getSummenstatus(fall.versicherter.versichertenstatus) == summenstatusSchluessel
        )
    }
    return abrechnungsfaelle
        .flatMap(fall => getAbrechnungsfallPositionen(fall))
}

/** Sum up all the values from the given individual Abrechnungspositions */
const calculateGesamtsummen = (positionen: Abrechnungsposition[]) => ({
    gesamtbruttobetrag: sum(positionen.map(calculateBruttobetrag)),
    zuzahlungUndEigenanteilBetrag: sum(positionen.map(calculateZuzahlungUndEigentanteilBetrag))
})


/** 
 * TODO
 * 
 * # Structure
 * 
 * Depends on Rechnungsart (1,2,3) and Sammelrechnung (yes or no)
 * 
 * ### Rechnungsart 1
 * Used for health care service providers that do accounting themselves, have one Institutionskennzeichen
 * 
 * ```txt
 * for each Kostenträger:
 *   SLGA Sammelrechnung (mandatory if more than one Pflegekasse)
 *   for each Pflegekasse:
 *     SLGA Gesamtrechnung
 *     SLLA
 * ```
 * 
 * ### Rechnungsart 2
 * Used for 
 * - health care service providers that do accounting themselves but have multiple Institutionskennzeichen
 * - accounting centers without collecting power (Abrechnungsstelle ohne Inkassovollmacht)
 * 
 * Same structure as for Rechnungsart 1, only that the invoices for each Leistungserbringer are
 * listed one after another.
 * 
 * ```txt
 * for each Leistungserbringer:
 *   for each Kostenträger:
 *     SLGA Sammelrechnung (mandatory if more than one Pflegekasse)
 *     for each Pflegekasse:
 *       SLGA Gesamtrechnung
 *       SLLA
 * ```
 * 
 * ### Rechnungsart 3
 * Used for accounting centers with collecting power (Abrechnungsstelle mit Inkassovollmacht), i.e.
 * manages accounting for multiple health care service providers (Leistungserbringer).
 * 
 * Note that the structure is different from Rechnungsart 1 and 2. Leistungserbringer are grouped by
 * Kostenträgers, not the other way round!
 * 
 * ```txt
 * for each Kostenträger:
 *   SLGA Sammelrechnung (always mandatory)
 *   for each Leistungserbringer:
 *     for each Pflegekasse:
 *       SLGA Gesamtrechnung
 *       SLLA
 * ```
 */
