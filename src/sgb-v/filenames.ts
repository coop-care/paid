/** based on document: Sonstige Leistungserbringer, Technische Anlage 1, Anhang 1, Datenübermittlung
  * see docs/documents.md for more info
  */

import { BillingData, FileType } from "../types";

/** A.k.a. "logischer Dateiname" */
export const makeAnwendungsreferenz = (
    absenderIK: string,
    {
        rechnungsart,
        abrechnungsmonat
    }: BillingData
) => [
    "SL",
    absenderIK.substr(2, 6),
    rechnungsart == "1" ? "S" : "A",
    (abrechnungsmonat.getMonth() + 1).toString().padStart(2, "0"),
].join("");

/** A.k.a "Verfahrenskennung" */
export const makeDateiname = (
    dateiindikator: FileType,
    transfernummer: number
) => [
    dateiindikator == "2" ? "E" : "T",
    "SOL",
    "0", // verfahrensversion. Always 0
    transfernummer.toString().slice(0, 3).padStart(3, "0")
].join("");
