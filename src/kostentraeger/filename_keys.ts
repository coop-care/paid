/* 
 * These keys are based on the documentation mentioned in ./parser.ts
 */

/** Indicates the group of statutory health insurance. Each group has its own set of contact 
 *  addresses and rules how and where to send the invoices.
*/
export const kassenartSchluessel = {
    "AO": "Allgemeine Ortskrankenkassen",
    "EK": "Ersatzkassen",
    "BK": "Betriebskrankenkassen",
    "IK": "Innungskrankenkassen",
    "BN": "Knappschaft-Bahn-See",
    "LK": "Landwirtschaftliche Krankenkasse",
    "GK": "Gesetzliche Krankenversicherung"
}

export type KassenartSchluessel = keyof typeof kassenartSchluessel

/** For a "Kostenträger" file, indicates for which health care provider this file is used - 
 * 
 *  For services of care providers according to § 105 SGB XI, it is 
 *  "Datenaustausch Teilprojekt Leistungserbringer Pflege"
 * 
 *  For services of care providers according to § 302 SGB V, it is
 *  "Datenaustausch Teilprojekt Sonstige Leistungserbringer"
  */
export const verfahrenSchluessel = { 
    "01": "Datenaustausch Teilprojekt Ärzte",
    "02": "Datenaustausch Teilprojekt Zahnärzte",
    "03": "Datenaustausch Teilprojekt Apotheken",
    "4A": "Datenaustausch Teilprojekt Krankenhäuser",
    "4B": "Datenaustausch Teilprojekt Reha-Einrichtungen",
    "05": "Datenaustausch Teilprojekt Sonstige Leistungserbringer",
    "06": "Datenaustausch Teilprojekt Leistungserbringer Pflege"
}

export type VerfahrenSchluessel = keyof typeof verfahrenSchluessel
