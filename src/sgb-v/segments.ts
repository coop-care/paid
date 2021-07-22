/** based on document: Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung
  * see docs/documents.md for more info
  */

import { FileType, MessageIdentifiers, messageIdentifierVersions } from "../types";
import { mask, number, price, day, month, date, time, datetime, segment, pad } from "../formatter";
import { LeistungserbringerSammelgruppenSchluessel } from "./codes";
import { TestIndicator } from "../types"

const Syntax_Version = "UNOC:3";
const DefaultCurrency = "EUR";

export const UNB = (
    absenderIK: string,
    empfaengerIK: string,
    datenaustauschreferenz: number,
    /** To which group of health care providers the care provider belongs */
    leistungsbereich: LeistungserbringerSammelgruppenSchluessel,
    anwendungsreferenz: string,
    dateiindikator: FileType
) => segment(
    "UNB",
    Syntax_Version,
    absenderIK,
    empfaengerIK,
    datetime(new Date()),
    pad(datenaustauschreferenz, 5),
    leistungsbereich,
    anwendungsreferenz,
    dateiindikator
);

export const UNZ = (
    numberOfMessages: number,
    datenaustauschreferenz: number,
) => segment(
    "UNZ",
    pad(numberOfMessages, 6),
    pad(datenaustauschreferenz, 5)
);

export const UNH = (
    messageReferenceNumber: number, // = index of message (starting with UNH)
    messageIdentifier: MessageIdentifiers,
) => segment(
    "UNH",
    pad(messageReferenceNumber, 5),
    messageIdentifierVersions[messageIdentifier]
);

export const UNT = (
    numberOfSegments: number, // Control count including UNH and UNT
    messageReferenceNumber: number // = index of message
) => segment(
    "UNT",
    pad(numberOfSegments, 6),
    pad(messageReferenceNumber, 5),
);
