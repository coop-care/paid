import { VerfahrenKennung } from "./codes";

/** based on documents: 
 *  - Pflege, Technische Anlage 1, Anhang 1: Struktur Auftragsdatei
 *  - Gemeinsame Grundsätze Technik, Anlage 2: Auftragsdatei
 * 
 * (see /docs/documents.md for more info)
 */

export type Auftrag = {
    /** Leistungserbringer-group */
    verfahrenKennung: VerfahrenKennung,
    /** Anwendungsreferenz (aka "logischer Dateiname"), a string concat of different things, 
    *  depending on the health care provider group */
    anwendungsreferenz: string

    /** 9-digit IK of the sender (creator) of this file */
    senderIK: string,
    /** 9-digit IK of the designated recipient of this file */
    encryptedForIK: string,
    /** 9-digit IK of the intermediate recipient of this file */
    sendToIK: string,

    /** date at which this file has been created */
    dateCreated: Date,
    /** date at which this file has been sent */
    dateSent: Date,

    /** unencrypted file size of the Nutzdaten */
    unencryptedNutzdatenSizeBytes: number,
    /** encrypted file size of the Nutzdaten */
    encryptedNutzdatenSizeBytes: number,

    /** whether this is test data. Should also be true during the "Erprobungsverfahren" */
    isTest: boolean,

    /** serial number that should globally increased by one for each Auftragsdatei */
    transferNumber: number,
}
