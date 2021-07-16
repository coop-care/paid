/** based on document: Sonstige Leistungserbringer, Technische Anlage 1, Anhang 1, Datenübermittlung
  * see docs/documents.md for more info
  */

import { BillingData, FileType } from "../types"

/** A.k.a. "logischer Dateiname" */
export const makeAnwendungsreferenz = (
    absenderIK: string,
    {
        rechnungsart,
        abrechnungsmonat
    }: BillingData
) => [
    // "Absenderklassifikation". "SL" stands for "Sonstige Leistungserbringer"
    "SL",
    // Index 2-3 of the IK is the "Regionalschlüssel", index 4-7 is a serial number
    absenderIK.substr(2, 6),
    // Who sends this bill: "S" stands for "Selbstabrechner", "A" stands for "Abrechnungszentrum"
    rechnungsart == "1" ? "S" : "A",
    (abrechnungsmonat.getMonth() + 1).toString().padStart(2, "0"),
].join("")

/** A.k.a "Verfahrenskennung" */
export const makeDateiname = (
    dateiindikator: FileType,
    transfernummer: number
) => [
    dateiindikator == "2" ? "E" : "T",
    // "SOL" stands for "Sonstige Leistungserbringer" here
    "SOL",
    // Verfahrensversion. Always 0
    "0", 
    transfernummer.toString().slice(0, 3).padStart(3, "0")
].join("")
