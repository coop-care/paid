/** based on documents: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung
 * 
  * see docs/documents.md for more info
  */

import { 
    TestIndicator
} from "../types"
import { 
    getSummenstatus,
    LeistungserbringerSammelgruppenSchluessel,
    SummenstatusSchluessel,
    summenstatusSchluessel,
} from "./codes"
import { elements } from "../edifact/builder"
import { date, time, char, fixedInt } from "../edifact/formatter"
import { Message, Segment } from "../edifact/types"
import { 
    FKT, 
    FKT_Sammelrechnung, 
    GES, 
    NAM, 
    REC, 
    REC_Sammelrechnung, 
    SKO, 
    UST
} from "./segments_slga"
import { 
    Einzelrechnung, 
    Sammelrechnung, 
    Skonto,
    BaseAbrechnungsfall,
    Gesamtsummen
} from "./types"

export const makeInterchangeHeader = (
    /** IK of the sender (creator) of this bill */
    absenderIK: string,
    /** IK of the designated recipient of this file */
    encryptedForIK: string,
    /** date at which this file has been created */
    dateCreated: Date,
    /** serial number that should be increased by one for each transmission to the recipient
     *  (encryptedForIK). A value from 00001-99999. It should loop back to 00001 before 100000 is 
     *  reached. */
    datenaustauschreferenz: number,
    /** To which group of health care providers the care provider belongs */
    leistungsbereich: LeistungserbringerSammelgruppenSchluessel,
    /** AKA "logischer Dateneiname" */
    anwendungsreferenz: string,
    /** Whether this bill is just a test or its real data */
    testIndicator: TestIndicator
) => elements(
    ["UNOC", "3"],
    char(absenderIK, 9),
    char(encryptedForIK, 9),
    [date(dateCreated), time(dateCreated)],
    fixedInt(datenaustauschreferenz, 5),
    leistungsbereich,
    char(anwendungsreferenz, 11),
    testIndicator
)

export const makeSLGA_SammelrechnungMessage = <T extends BaseAbrechnungsfall>(
    s: Sammelrechnung,
    abrechnungsfaelle: T[],
    calculateGesamtsummen: (abrechnungsfaelle: T[]) => Gesamtsummen
): Message => ({
    header: elements(["SLGA", "16", "0", "0"]),
    segments: [
        /* NOTE: if any other verarbeitungskennzeichen than "01" is supported, the calculation of 
                GES needs to be adjusted */ 
        FKT_Sammelrechnung("01", s),
        REC_Sammelrechnung(s),
        ...createSkontoList(s.skontos),
        ...calculateGESList(abrechnungsfaelle, calculateGesamtsummen),
        NAM(s.rechnungssteller)
    ]
})

export const makeSLGAMessage = <T extends BaseAbrechnungsfall>(
    r: Einzelrechnung,
    abrechnungsfaelle: T[],
    calculateGesamtsummen: (abrechnungsfaelle: T[]) => Gesamtsummen
): Message => ({
    header: elements(["SLGA", "16", "0", "0"]),
    segments: [
        /* NOTE: if any other verarbeitungskennzeichen than "01" is supported, the calculation of 
                 GES needs to be adjusted */ 
        FKT("01", r), 
        REC(r),
        r.leistungserbringer.umsatzsteuer ? UST(r.leistungserbringer.umsatzsteuer) : undefined,
        ...createSkontoList(r.skontos),
        ...calculateGESList(abrechnungsfaelle, calculateGesamtsummen),
        NAM(r.leistungserbringer)
    // filter out undefined (left out segments)
    ].filter(segment => segment !== undefined) as Segment[]
})

const createSkontoList = (skontos: Skonto[] | undefined): Segment[] =>
    // at most 9 Skontos are allowed
    (skontos ?? []).slice(0,9).map(skonto => SKO(skonto))

/** Returns a bunch of GES segments:
 * 
 *  Always a GES with Summenstatus "00" first and then each one GES segment for the other 
 *  Summenstatus if any Abrechnungspositions are actually ascribed to that Summenstatus.
 */
const calculateGESList = <T extends BaseAbrechnungsfall>(
    abrechnungsfaelle: T[],
    calculateGesamtsummen: (abrechnungsfaelle: T[]) => Gesamtsummen
): Segment[] => {
    // ensure that 00 is always first
    const summenstatuses = Object.keys(summenstatusSchluessel).sort()
    return summenstatuses.map(summenstatusString => {
        const summenstatus = summenstatusString as SummenstatusSchluessel
        const abrechnungsfalleForSummenstatus = getAbrechnungsfaelleBySummenstatus(abrechnungsfaelle, summenstatus)
        // we only want GES segments for non-empty groups
        if (abrechnungsfalleForSummenstatus.length > 0) {
            const summen = calculateGesamtsummen(abrechnungsfalleForSummenstatus)
            return GES(summenstatus, summen.gesamtbruttobetrag, summen.zuzahlungUndEigenanteilBetrag)
        }
    // filter out undefined (left out segments)
    }).filter(segment => segment !== undefined) as Segment[]
}

/** Return all the Abrechnungsfaelle ascribed to the given Summenstatus */
const getAbrechnungsfaelleBySummenstatus = <T extends BaseAbrechnungsfall>(
    abrechnungsfaelle: T[],
    summenstatusSchluessel: SummenstatusSchluessel
): T[] => {
    // don't filter at all for Summenstatus 00
    if (summenstatusSchluessel == "00") {
        return abrechnungsfaelle
    } else {
        return abrechnungsfaelle.filter(fall => 
            getSummenstatus(fall.versicherter.versichertenstatus) == summenstatusSchluessel
        )
    }
}
