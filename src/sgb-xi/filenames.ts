/** based on document: Pflege, Technische Anlage 1, Anhang 3, Datenübermittlungsarten
  * see docs/documents.md for more info
  */

import { BillingData, FileType } from "../types";

/** A.k.a. "logischer Dateiname" */
export const makeAnwendungsreferenz = (
    kassenart: string,
    laufendeDatenannahmeImJahr: number,
    {
        rechnungsart,
        abrechnungsmonat,
        korrekturlieferung = 0
    }: BillingData
) => [
    "PL",
    (abrechnungsmonat.getMonth() + 1).toString().padStart(2, "0") +
    abrechnungsmonat.getFullYear().toString().substr(3, 1),
    korrekturlieferung,
    laufendeDatenannahmeImJahr.toString().slice(0, 2).padStart(2, "0"),
    rechnungsart == "1" ? "S" : "A",
    kassenart
].join("");

/** A.k.a "Verfahrenskennung" */
export const makeDateiname = (
    dateiindikator: FileType,
    transferNumber: number
) => [
    dateiindikator == "2" ? "E" : "T",
    "PFL",
    "0", // verfahrensversion. Always 0
    transferNumber.toString().slice(0, 3).padStart(3, "0")
].join("");
