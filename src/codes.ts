/** based on documents: 
 * 
 * Pflege, Technische Anlage 3, Schlüsselverzeichnisse
 * Sonstige Leistungserbringer, Technische Anlage 3, Schlüsselverzeichnisse
 * 
 * Only includes those codes/keys that are the same for both documents
 * 
 * see docs/documents.md for more info
 */


/** Whether this is a bill by the health care provider itself or by an accounting center
 * 
 *  Identically documented at 
 *  - 8.1.4 Schlüssel Rechnungsart for Sonstige Leistungserbringer
 *  - 2.1 Schlüssel Rechnungsart 
 */
export const rechnungsartSchluessel =  {
    "1": "Abrechnung von Leistungserbringer und Zahlung an IK Leistungserbringer",
    "2": "Abrechnung über Abrechnungsstelle (ohne Inkassovollmacht) und Zahlung an IK Leistungserbringer",
    "3": "Abrechnung über Abrechnungsstelle (mit Inkassovollmacht) und Zahlung an IK Abrechnungsstelle",
}
export type RechnungsartSchluessel = keyof typeof rechnungsartSchluessel;
