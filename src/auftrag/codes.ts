/** based on documents: 
 *  - Pflege, Technische Anlage 1, Anhang 1: Struktur Auftragsdatei
 *  - Gemeinsame Grundsätze Technik, Anlage 2: Auftragsdatei
 * 
 * (see /docs/documents.md for more info)
 */

/** Verfahren-Daten */
export const verfahrenDatenSchluessel = {
    "E": "Echtdaten",
    "T": "Testdaten, oder Echtdaten im Erprobungsverfahren"
}
export type VerfahrenDatenSchluessel = keyof typeof verfahrenDatenSchluessel

/** Verfahren */
export const verfahrenKennung = {
    "KAV": "Kassenärztliche Vereinigungen",
    "KZV": "Kassenzahnärztliche Vereinigungen",
    "APO": "Apotheken",
    "KRH": "Krankenhäuser",
    "REH": "Reha-Einrichtungen",
    "SOL": "Sonstige Leistungserbringer",
    "PFL": "Pflege-Leistungserbringer"
}
export type VerfahrenKennung = keyof typeof verfahrenKennung