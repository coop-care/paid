/** based on documents: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung
 * 
  * see docs/documents.md for more info
  */

import { TestIndicator } from "../types"
import { 
    LeistungserbringerSammelgruppenSchluessel,
    NachrichtenkennungSchluessel,
} from "./codes"
import { elements } from "../edifact/builder"
import { date, time, char, fixedInt } from "../edifact/formatter"

export const createInterchangeHeader = (
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

export const createMessageHeader = (
    nachrichtenkennung: NachrichtenkennungSchluessel
) => elements(
    [nachrichtenkennung, "16", "0", "0"],
)
