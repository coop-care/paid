import { VerfahrenKennung } from "./codes";
import { Auftrag } from "./types";

/** based on documents: 
 *  - Pflege, Technische Anlage 1, Anhang 1: Struktur Auftragsdatei
 *  - Gemeinsame Grundsätze Technik, Anlage 2: Auftragsdatei
 * 
 * (see /docs/documents.md for more info)
 */

export default function write(auftragsdatei: Auftrag): string {
    validate(auftragsdatei)

    return [
        /* 1st part (page 8-13): General description of "health insurance communication" */

         // identificator: constant for "health insurance communication" (6 digits)
        "500000",
        // version of this communication (2 digits)
        "01", 
         // Length of this file (8 digits): constant length for Version 01 is 348
        "00000348",
        // Whether this file is segmented (3 digits). 000 = message is complete in this file
        "000",
        // Verfahrenkennung (5 chars)
        (auftragsdatei.isTest ? "T" : "E") + auftragsdatei.verfahrenKennung + "0",
        // Transfernummer (3 digits)
        auftragsdatei.transferNumber.toString().padStart(3, "0"),
        // Verfahrenskennungsspezifikation (5 chars). Optional, unclearly documented: 
        // "can be used to denote the processing priority"
        "".padEnd(5," "),
        // sender IK (15 chars)
        auftragsdatei.senderIK.padEnd(15," "), 
        // intermediate sender IK (15 chars)
        auftragsdatei.senderIK.padEnd(15," "), 
        // recipient IK  (15 chars)
        auftragsdatei.encryptedForIK.padEnd(15," "), 
        // intermediate recipient IK  (15 chars)
        auftragsdatei.sendToIK.padEnd(15," "), 
        // Error code (6 digits) when data is sent back. 000000 = no error
        "000000",
        // Action code (6 digits). 000000 = no error
        "000000",
        // File name - "anwendungsreferenz" (11 chars)
        auftragsdatei.anwendungsreferenz,
        // Creation date of this file (14 digits: YYYYMMDDhhmmss)
        YYYYMMDDhhmmss(auftragsdatei.dateCreated),
        // Date when the file was sent (14 digits: YYYYMMDDhhmmss)
        YYYYMMDDhhmmss(auftragsdatei.dateSent),
        // Date when the file started to be received (14 digits: YYYYMMDDhhmmss). First recipient fills in this info
        "".padStart(14, "0"), 
        // Date when the file ended to be received (14 digits: YYYYMMDDhhmmss). First recipient fills in this info
        "".padStart(14, "0"), 
         // File version number (6 digits). Unused, must be "000000"
        "000000",
         // File correction number (1 digit). Unused, must be "0"
        "0",
        // unencrypted size of the referenced Nutzdatendatei in bytes (12 digits)
        auftragsdatei.unencryptedNutzdatenSizeBytes.toString().padStart(12, "0"), 
        // encrypted size of the referenced Nutzdatendatei in bytes (12 digits)
        auftragsdatei.encryptedNutzdatenSizeBytes.toString().padStart(12, "0"), 
        // charset (2 chars). I1 = ISO-8859-1
        "I1",
        // compression (2 digits).
        // 00 = none, 02 = gzip, 03 = zip (one file), 07 = bzip2, 13 = zip (several files)
        "00",
        // type of compression (2 digits). 03 = PKCS#7
        "03",
        // type of signature (2 digits), 03 = PKCS#7
        "03",

        /* 2nd part (page 14): Data medium specific information */

        // "Satzformat auf dem Datenträger" (3 chars). For data transmission: "   "
        "   ",
        // "Satzlänge" (5 digits). For data transmission: "00000"
        "00000",
        // "Blocklänge" (8 digits). For data transmission: "00000000"
        "00000000", 


        /* 3rd part (page 15): (FTAM) Transmission specific information */

        // FTAM "Status" (1 char). Optional. For data delivery, leave empty
        " ",
        // max retry count on error during data transmission (2 digits). Optional. Not relevant nowadays
        "00",
        // "Übertragungsweg" (1 digit). Optional field and obsolete. 5 = "anderer Weg"
        "0",
        // date at which this should be processed (10 digits: YYMMDDhhmm). Optional
        "".padStart(10, "0"),
        // error number from FTAM (6 digits). Optional. Empty if no error
        "".padStart(6, "0"),
        // error message (28 chars). Optional. Empty if no error
        "".padEnd(28, " "),


        /* 4th part (page 16): Data center processing specific information */

        // processing-internal physical filename (44 chars). Used within data processing center
        "".padEnd(44, " "),
        // (variable) additional info for file.
        /* The documentation mentions that "Schlüssel Art der abgegebenen Leistung" is
           specified here, however, in the docs it was unclear if the field is optional or not. 
           We asked the GKV-Spitzenverband and got the reply that it is indeed optional:

           > Die Angabe kann von Absender gesetzt werden, ist aber nicht verpflichtend.
           
           So, we don't set it. */
        "".padEnd(30, " ")
    ].join("")
}

function validate(auftragsdatei: Auftrag) {
    if (auftragsdatei.senderIK.length != 9) {
        throw new Error("sender IK must have exactly 9 digits")
    }

    if (auftragsdatei.encryptedForIK.length != 9) {
        throw new Error("IK to which it is encrypted must have exactly 9 digits")
    }

    if (auftragsdatei.sendToIK.length != 9) {
        throw new Error("recipient IK must have exactly 9 digits")
    }

    if (auftragsdatei.unencryptedNutzdatenSizeBytes.toString().length > 12) {
        throw new Error("Unencrypted file size can have at most 12 digits")
    }
    if (!Number.isInteger(auftragsdatei.unencryptedNutzdatenSizeBytes) || 
        auftragsdatei.unencryptedNutzdatenSizeBytes < 0) {
        throw new Error("Unencrypted file size must be a positive integer")
    }

    if (auftragsdatei.encryptedNutzdatenSizeBytes.toString().length > 12) {
        throw new Error("Encrypted file size can have at most 12 digits")
    }
    if (!Number.isInteger(auftragsdatei.encryptedNutzdatenSizeBytes) || 
        auftragsdatei.encryptedNutzdatenSizeBytes < 0) {
        throw new Error("Encrypted file size must be a positive integer")
    }

    if (auftragsdatei.transferNumber.toString().length > 3) {
        throw new Error("Transfer number must be between 0 and 999")
    }
    if (!Number.isInteger(auftragsdatei.transferNumber) || auftragsdatei.transferNumber < 0) {
        throw new Error("Transfer number must be a positive integer")
    }

    if (auftragsdatei.anwendungsreferenz.length != 11) {
        throw new Error("Anwendungsreferenz (aka logical filename) must consist of exactly 11 characters")
    }
}

const YYYYMMDDhhmmss = (date: Date): string => [
    date.getFullYear().toString().padStart(4, "0"),
    (date.getMonth()+1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
    date.getHours().toString().padStart(2, "0"),
    date.getMinutes().toString().padStart(2, "0"),
    date.getSeconds().toString().padStart(2, "0")
].join("")
