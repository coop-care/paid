/** based on documents: 
 * 
 * Pflege, Technische Anlage 3, Schlüsselverzeichnisse
 * Sonstige Leistungserbringer, Technische Anlage 3, Schlüsselverzeichnisse
 * 
 * Only includes those codes/keys that are the same for both documents
 * 
 * see docs/documents.md for more info
 */


/** Whether this is a bill by the health care provider himself or by an accounting center (with or
 *  without power to collect)
 * 
 *  Identically documented at 
 *  - 8.1.4 Schlüssel Rechnungsart for Sonstige Leistungserbringer
 *  - 2.1 Schlüssel Rechnungsart for Pflege
 */
export const rechnungsartSchluessel =  {
    "1": "Abrechnung von Leistungserbringer und Zahlung an IK Leistungserbringer",
    // note: also used if Leistungserbringer has several IKs
    "2": "Abrechnung über Abrechnungsstelle (ohne Inkassovollmacht) und Zahlung an IK Leistungserbringer",
    "3": "Abrechnung über Abrechnungsstelle (mit Inkassovollmacht) und Zahlung an IK Abrechnungsstelle",
}
export type RechnungsartSchluessel = keyof typeof rechnungsartSchluessel;
