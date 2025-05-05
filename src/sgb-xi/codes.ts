/** based on document: Pflege, Technische Anlage 3, Schlüsselverzeichnisse
  * see docs/documents.md for more info
  * 
  * The keys are sorted by the order they appear in the documentation
  */

/** 2.1 Schlüssel Rechnungsart for Pflege
 * 
 *  Whether this is a bill by the health care provider himself or by an accounting center (with or
 *  without power to collect)
 */
export const rechnungsartSchluessel =  {
    "1": "Abrechnung von Leistungserbringer und Zahlung an IK Leistungserbringer",
    // note: also used if Leistungserbringer has several IKs
    "2": "Abrechnung über Abrechnungsstelle (ohne Inkassovollmacht) und Zahlung an IK Leistungserbringer",
    "3": "Abrechnung über Abrechnungsstelle (mit Inkassovollmacht) und Zahlung an IK Abrechnungsstelle",
}
export type RechnungsartSchluessel = keyof typeof rechnungsartSchluessel

/** 2.2.1 Schlüssel Abrechnungscode */
export const abrechnungscodeSchluessel = {
    // Abrechnungsstelle
    "00": "Kennzeichen zur Identifizierung einer Abrechnungsstelle als Rechnungssteller",
    // Leistungserbringer Pflegehilfsmittel
    "11": "Pflegehilfsmittel: Apotheke (Vertrag gem. § 78 Abs. 1+2 SGB XI)",
    "15": "Pflegehilfsmittel: Orthopädiemechaniker, Bandagist, Sanitätshaus",
    "16": "Pflegehilfsmittel: Orthopädieschuhmacher",
    "17": "Pflegehilfsmittel: Orthopäde",
    "19": "Pflegehilfsmittel: sonstiger Hilfsmittellieferant, Pflegehilfsmittellieferant",
    // Leistungserbringer ambulante Pflege
    "35": "ambulante Pflege: frei gemeinnütziger Anbieter (Sozialstation)",
    "36": "ambulante Pflege: privat gewerblicher Anbieter",
    "37": "ambulante Pflege: öffentlicher Anbieter",
    "39": "ambulante Pflege: sonstiger Pflegedienst",
    // Leistungserbringer Tagespflege
    "81": "Tagespflege: privat gewerblicher Anbieter",
    "82": "Tagespflege: frei gemeinnütziger Anbieter (gemeinnützige private Anbieter)",
    "83": "Tagespflege: öffentlicher Anbieter",
    "84": "Tagespflege: sonstige Pflegeeinrichtung",
    // Leistungserbringer Nachtpflege
    "86": "Nachtpflege: privat gewerblicher Anbieter",
    "87": "Nachtpflege: frei gemeinnütziger Anbieter (gemeinnützige private Anbieter)",
    "88": "Nachtpflege: öffentlicher Anbieter",
    "89": "Nachtpflege: sonstige Pflegeeinrichtung",
    // Leistungserbringer Kurzzeitpflege
    "91": "Kurzzeitpflege: privat gewerblicher Anbieter",
    "92": "Kurzzeitpflege: frei gemeinnütziger Anbieter (gemeinnützige private Anbieter)",
    "93": "Kurzzeitpflege: öffentlicher Anbieter",
    "94": "Kurzzeitpflege: sonstige Pflegeeinrichtung",
    // Leistungserbringer vollstationäre Pflege
    "96": "vollstationäre Pflege: privat gewerblicher Anbieter",
    "97": "vollstationäre Pflege: frei gemeinnütziger Anbieter (gemeinnützige private Anbieter)",
    "98": "vollstationäre Pflege: öffentlicher Anbieter",
    "99": "vollstationäre Pflege: sonstige Pflegeeinrichtung",
}
export type AbrechnungscodeSchluessel = keyof typeof abrechnungscodeSchluessel;

// 2.2.2 & 2.14.1 Schlüssel Tarifkennzeichen: Tarifbereich
export const tarifbereichSchluessel = {
    "00": "Bundeseinheitlicher Tarif (Ost und West)",
    "01": "Baden-Württemberg",
    "02": "Bayern",
    "04": "Bremen",
    "05": "Hamburg",
    "06": "Hessen",
    "07": "Niedersachsen",
    "08": "Nordrhein-Westfalen",
    "09": "Rheinland-Pfalz",
    "10": "Saarland",
    "11": "Schleswig-Holstein",
    "12": "Brandenburg",
    "13": "Sachsen",
    "14": "Sachsen-Anhalt",
    "15": "Mecklenburg-Vorpommern",
    "16": "Thüringen",
    "23": "Berlin (gesamt)",
}
export type TarifbereichSchluessel = keyof typeof tarifbereichSchluessel

/* Tarifkennzeichen: Sondertarife (3. bis 5. Stelle des Tarifkennzeichens)

    000         ohne Besonderheiten
    001 - ZZZ   Nummerierung der Vergütungsvereinbarung je Pflegedienst (je IK) 
*/

/** 2.3 Schlüssel Verarbeitungskennzeichen */
export const verarbeitungskennzeichenSchluessel = {
    "01": "Abrechnung ohne Besonderheiten",
}
export type VerarbeitungskennzeichenSchluessel = keyof typeof verarbeitungskennzeichenSchluessel

/** 2.4 Schlüssel Art der abgegebenen Leistung */
export const leistungsartSchluessel = {
    "01": "ambulante Pflege (einschl. pflegerische Betreuungsmaßnahmen) (ohne Beratungsbesuch)",
    "02": "Tagespflege",
    "03": "Nachtpflege",
    "04": "Kurzzeitpflege",
    "05": "vollstationäre Pflege",
    "06": "Pflegehilfsmittel",
    "07": "Verhinderungspflege",
    "08": "Zuschuss nach § 43 Abs. 3 SGB XI",
    "09": "Beratungsbesuch nach § 37 Abs. 3 SGB XI, in der Erprobungsphase ist die Abrechnung des Beratungsbesuches optional",
    "10": "Entlastungsleistungen nach § 45b SGB XI",
    "11": "Beratungsgutschein nach § 7b SGB XI",
    "12": "Wohngruppenzuschlag nach § 38a SGB XI", 
    "13": "Pflegekurse nach § 45 SGB XI (z. B. Schulung in der Häuslichkeit)",
    "14": "Leistungen nach § 43b SGB XI (Vergütungszuschlag für zusätzliche Betreuung und Aktivierung)",
    "15": "Ergänzende Unterstützungsleistung für digitale Pflegeanwendungen",
}
export type LeistungsartSchluessel = keyof typeof leistungsartSchluessel

/** 2.5 Schlüssel Vergütungsart */
export const verguetungsartSchluessel = {
    "01": "Leistungskomplexvergütung",
    "02": "Zeitvergütung",
    "03": "teilstationär",
    "04": "vollstationär / Kurzzeitpflege",
    "05": "Pflegehilfsmittel",
    "06": "Wegegebühren (sofern nicht Leistungskomplex)",
    "07": "Entlastungsleistung",
    "08": "Pauschale (Beratungsbesuch) (sofern nicht Leistungskomplex)",
    "99": "keine Vetragspreisregelung",
}
export type VerguetungsartSchluessel = keyof typeof verguetungsartSchluessel

/** 2.6 Schlüssel Qualifikationsabhängige Vergütung */
export const qualifikationsabhaengigeVerguetungSchluessel = {
    "0": "datentechn. nicht relevant",
    "1": "Pflegefachkraft",
    "2": "hauswirtschaftliche Fachkraft",
    "3": "ergänzende Hilfen",
    "4": "Bundesfreiwilligendienst",
    "5": "Praktikanten",
    "6": "Freiwilliges soziales Jahr",
    "7": "ISB Individuelle Schwerbehindertenbetreuung/-assistenz",
    "8": "Fachkraft für Betreuung",
}
export type QualifikationsabhaengigeVerguetungSchluessel = keyof typeof qualifikationsabhaengigeVerguetungSchluessel

/* 2.7 Schlüssel Leistung
 * 
 *  Kennzeichen der Leistung nach Vergütungsart:
 * 
 *  01:    2.7.1 Schlüssel Leistungskomplexvergütung
 *         3-character current number of Leistungskomplex, f.e. "15a"
 * 
 *  02:    2.7.2 Schlüsselkennzeichen Zeitvergütung
 *         2-character code, see 2.7.2.1 and 2.7.2.2
 * 
 *  03:    2.7.3 Schlüssel Kennzeichen Pflegesatz teilstationär
 * 
 *  04:    2.7.3 Schlüssel Kennzeichen Pflegesatz vollstationär / Kurzzeitpflege
 * 
 *  05:    2.7.4 Schlüssel Pflegehilfsmittelpositionsnummer
 *         see /hilfsmittelverzeichnis/*.ts
 * 
 *  06:    2.7.5 Schlüssel Wegegebühren/Beförderungsentgelt-Art
 * 
 *  07:    2.7.6 Schlüssel Entlastungsleistung
 * 
 *  08:    2.7.7 Schlüssel Beratungsbesuch nach § 37 Abs. 3
 *
 *  99:    2.7.8 Sonstige (Keine Vertragspreisregelung)
 */

/** 2.7.2.1 Schlüsselkennzeichen Zeiteinheit */
export const zeiteinheitSchluessel = {
    "1": "Minute",
    "2": "5 Minuten",
    "3": "15 Minuten",
    "4": "Stunde",
    "5": "Tag",
}
export type ZeiteinheitSchluessel = keyof typeof zeiteinheitSchluessel

/** 2.7.2.2 Schlüsselkennzeichen Zeitart */
export const zeitartSchluessel = {
    "1": "Begleitung zum Arztbesuch",
    "2": "Begleitung zum Behördenbesuch",
    "3": "Körperbezogene Pflegemaßnahmen (Grundpflege)",
    "4": "Hilfen zur Haushaltsführung (hauswirtschaftliche Versorgung)",
    "5": "Pflegerische Betreuungsmaßnahmen (häusliche Betreuung)",
    "6": "Hilfe bei der Sicherstellung der selbstverantworteten Haushaltsführung",
    "7": "Erstbesuch",
    "8": "Folgebesuch",
    "9": "Kombination unterschiedlicher Leistungsinhalte (nur bei landesspezifischer Regelung)",
    "0": "Ergänzende Unterstützungsleistungen für DiPA",
    "A": "Beratungsbesuch vor Ort",
    "B": "Beratungsbesuch Videokonferenz",
}
export type ZeitartSchluessel = keyof typeof zeitartSchluessel

/** 2.7.3 Schlüssel Kennzeichen Pflegesatz */
export const pflegesatzSchluessel = {
    "00": "ganztags (teilstationär, vollstationär/Kurzzeitpflege)",
    "01": "halbtags (teilstationär/Tages- oder Nachtpflege)",
    "02": "Abwesenheit",
}
export type PflegesatzSchluessel = keyof typeof pflegesatzSchluessel

/** 2.7.5 Schlüssel Wegegebühren/Beförderungsentgelt-Art */
export const wegegebuehrenSchluessel = {
    "01": "Tagespauschale",
    "02": "Monatspauschale",
    "03": "Einsatz- / Fahrtkostenpauschale",
    "04": "gefahrene Kilometer",
}
export type WegegebuehrenSchluessel = keyof typeof wegegebuehrenSchluessel

/** 2.7.6 Schlüssel Kennzeichen Entlastungsleistung */
export const entlastungsleistungSchluessel = {
    "10": "Leistungen der Tages- oder Nachtpflege",
    "20": "Leistungen der Kurzzeitpflege",
    "30": "Leistungen amb. Pflegedienste ohne Leistungsbereich Selbstversorgung",
    "31": "Leistungen amb. Pflegedienste Leistungsbereich Selbstversorgung",
    "40": "Leistungen der nach Landesrecht anerkannten Angebote nach § 45a SGB XI",
}
export type EntlastungsleistungSchluessel = keyof typeof entlastungsleistungSchluessel

/** 2.7.7 Schlüssel Leistung: Pauschale (Beratungsbesuch nach § 37 Abs. 3) */
export const beratungsbesuchPauschaleLeistungSchluessel = {
    "1": "Einsatzpauschale (Beratung vor Ort)",
    "2": "Videokonferenz",
}
export type BeratungsbesuchPauschaleLeistungSchluessel = keyof typeof beratungsbesuchPauschaleLeistungSchluessel

/** 2.7.8 Schlüssel Leistung: Sonstige */
export const sonstigeLeistungSchluessel = {
    "99": "Sonstiges"
}
export type SonstigeLeistungSchluessel = keyof typeof sonstigeLeistungSchluessel

/** 2.8 Schlüssel Kennzeichen Pflegehilfsmittel */
export const pflegehilfsmittelSchluessel = {
    "": "nicht zutreffend",
    "00": "Neulieferung",
    "01": "Reparatur",
    "02": "Wiedereinsatz",
    "03": "Miete",
    "04": "Nachlieferung",
    "05": "Zurichtung",
    "06": "Abgabe eines abweichenden, höherwertigen Pflegehilfsmittels",
    "08": "Vergütungspauschale",
    "09": "Folgevergütungspauschale",
    "10": "Folgeversorgung",
    "11": "Ersatzbeschaffung",
    "12": "Zubehör",
    "13": "Reparaturpauschale",
    "14": "Wartung",
    "15": "Wartungspauschale",
    "16": "Auslieferung",
    "17": "Aussonderung",
    "18": "Rückholung",
    "19": "Abbruch",
    "20": "Erprobung",
    "21": "Miete (Quartal)",
    "22": "Miete (Tag)",
}
export type PflegehilfsmittelSchluessel = keyof typeof pflegehilfsmittelSchluessel;

/** 2.9 Schlüssel Mehrwertsteuer */
export const mehrwertsteuerSchluessel = {
    "": "keine Mehrwertsteuer",
    "1": "voller Mehrwertsteuersatz, dem Einzelbetrag zuzurechnen",
    "2": "ermäßigter Mehrwertsteuersatz, dem Einzelbetrag zuzurechnen",
}
export type MehrwertsteuerSchluessel = keyof typeof mehrwertsteuerSchluessel

/** 2.13 Schlüssel Grund UST-Befreiung */
export const umsatzsteuerBefreiungSchluessel = {
    "": "keine Umsatzsteuerbefreiung",
    "01": "Umsatzsteuerbefreiung nach § 4 Nr. 16",
}
export type UmsatzsteuerBefreiungSchluessel = keyof typeof umsatzsteuerBefreiungSchluessel

/* 2.14 Schlüssel Zuschläge / Abschläge 
 * 
 * 5-character code:
 *  
 * ```
 * Tarifbereich (in documentation incorrectly denoted "Tarifkennzeichen")
 *  │  Zuschlagsart 
 *  │   │  Zuschlag
 * ┌┴─┐┌┴┐┌┴─┐
 *  XX  X  XX
 * ```
 */

/** 2.14.2 Zuschläge / Abschläge: Schlüssel Zuschlagsart */
export const zuschlagsartSchluessel = {
    "1": "ambulant",
    "2": "stationär (teil-/vollstationär)",
    "3": "Kurzzeitpflege",
}
export type ZuschlagsartSchluessel = keyof typeof zuschlagsartSchluessel

/** 2.14.3 Schlüssel Zuschlag */
export const zuschlagSchluessel = {
    "00": "wenn kein Schlüssel vorhanden, (dann aber Klartext angeben)",
    "02": "Prozentuale anteilige Wegegebühren wegen gleichzeitiger LE SGB V und SGB XI",
    "03": "Anteilige Wegegebühren bei betreutes Wohnen",
    "04": "Höhere Vergütung für Einsatz einer zweiten Pflegekraft ",
    "05": "Zu-/Abwahl von einzelnen Leistungen",
    "06": "2 Personen",
    "07": "Demente",
    "08": "Apalliker",
    "09": "Härtefälle",
    "10": "Taxi",
    "11": "Abwesenheit bei Urlaub (gilt für stationär)",
    "12": "Abwesenheit bei Krankheit (gilt für stationär)",
    "13": "Abwesenheit bei Kur (gilt für stationär)",
    "14": "Abwesenheit bei Reha (gilt für stationär)",
    "15": "Abwesenheit bei Wochenendurlaub (gilt für stationär)",
    "16": "Sonstige Abwesenheit",
    "17": "Abwesenheit bei Krankenhausaufenthalt",
    "18": "Ausbildungsumlage nach PflAFinV",
    "19": "MRE-Zuschlag",
    "21": "Ungünstige Zeiten",
    "22": "Ungünstige Tage",
}
export type ZuschlagSchluessel = keyof typeof zuschlagSchluessel

/** n.a. Schlüssel Zuschlagszuordnung */
export const zuschlagszuordnungSchluessel = {
    "1": "Leistung",
    "2": "Wegegebühr",
}
export type ZuschlagszuordnungSchluessel = keyof typeof zuschlagszuordnungSchluessel

/** 2.15 Schlüssel Pflegegrad */
export const pflegegradSchluessel = {
    "1": "Pflegegrad 1",
    "2": "Pflegegrad 2",
    "3": "Pflegegrad 3",
    "4": "Pflegegrad 4",
    "5": "Pflegegrad 5",
}
export type PflegegradSchluessel = keyof typeof pflegegradSchluessel

/** 2.16 Schlüssel Zuschlagsberechnung */
export const zuschlagsberechnungSchluessel = {
    "01": "Punktzahl absolut",
    "02": "Prozentsatz zur Punktzahl",
    "03": "Punktwert absolut",
    "04": "Prozentsatz zum Punktwert",
    "05": "Basiswert + Addition (Subtraktion) Betrag absolut bzw. Ersatzwert",
    "06": "Basiswert + Addition (Subtraktion) Punktzahl absolut bzw. Ersatzwert",
    "07": "Basiswert + Addition (Subtraktion) Punktwert absolut bzw. Ersatzwert",
    "08": "monatlicher Betrag",
    "09": "Ersatzwert mtl. Punktzahl",
    "10": "Ersatzwert mtl. Punktwert",
    "11": "Prozentsatz zum Betrag",
    "12": "Betrag absolut",
    "13": "Prozentsatz zum Betrag-Ersatzwert aller ZUS",
    "14": "täglicher Betrag (absoluter Betrag * Anzahl / Menge aus Segment ELS)",
    "15": "Prozentsatz zum Punktzahl-Ersatzwert aller ZUS",
    "16": "Prozentsatz zum Punktwert-Ersatzwert alles ZUS",
    "17": "Basiswert + Prozentsatz absolut bzw. Ersatzwert",
}
export type ZuschlagsberechnungSchluessel = keyof typeof zuschlagsberechnungSchluessel

/** 2.17 Schlüssel Ersatz-Beschäftigtennummer */
export const ersatzbeschaeftigtennummerSchluessel = {
    "999999999": "Leiharbeitnehmer(in) ohne Beschäftigtennummer nach § 293 Abs. 8 Satz 2 SGB V",
    "999999998": "neuer Beschäftigte(r), die/der noch nicht über eine Beschäftigtennummer nach § 293 Abs. 8 Satz 2 SGB V verfügt",
    "999999997": "Beschäftigtennummer nach § 293 Abs. 8 Satz 2 SGB V fehlt aus sonstigem Grund",
    "999999996": "Auszubildende(r) ohne Beschäftigtennummer nach § 293 Abs. 8 Satz 2 SGB V",
}
export type ErsatzbeschaeftigtennummerSchluessel = keyof typeof ersatzbeschaeftigtennummerSchluessel


/** Schlüssel für die vollelektronische Abrechnung innerhalb der Telematik Infrastruktur */

/** 3.1 Schlüssel Fehlercodes */
export const fehlercodesSchluessel = {
    "01000": "Ungültige Versionsnummer logische Version",
    "01001": "XML-Schemavalidierung fehlgeschlagen",
    "01004": "Erstellungsdatum größer Verarbeitungsdatum unzulässig",
    "01007": "Nutzdatendatei nicht lesbar",
    "01008": "Falscher Zeichensatz",
    "01009": "Möglicher Virenbefall",
    "01201": "Die Signatur der Abrechnungsdaten ist nicht gültig, da ein fehlerhaftes Zertifikat verwendet wurde.",
    "01202": "Die Signatur der Abrechnungsdaten ist nicht gültig, da die übermittelten Daten nicht den signierten Daten entsprechen.",
    "01203": "Die Signatur des Leitungsnachweises ist nicht gültig, da ein fehlerhaftes Zertifikat verwendet wurde.",
    "01204": "Die Signatur des Leitungsnachweises ist nicht gültig, da die übermittelten Daten nicht den signierten Daten entsprechen.",
    "01307": "Die KIM-Nachricht ist in einem falschen Format verschlüsselt.",
    "01309": "KIM-Nachricht besitzt keine Signatur.",
    "01310": "Die Signatur für die KIM-Nachricht hat das falsche Format.",
    "01311": "Die Signaturprüfung der KIM-Nachricht hat ergeben, dass der Nachrichteninhalt nicht mit der Signatur übereinstimmt.",
    "01313": "Die KIM-Nachricht konnte aufgrund eines nicht verfügbaren Schlüssels nicht entschlüsselt werden.",
    "01314": "Nachrichtentyp unbekannt",
    "01315": "IK Pflege-Leistungserbinger unbekannt",
    "01316": "IK Pflege-/Krankenkasse unbekannt",
    "01317": "Empfänger KIM-Postfach und Empfänger Nutzdatendatei nicht identisch",
    "02001": "Datenelement unzulässig leer",
    "02002": "Format Datei-ID nicht korrekt",
    "02003": "Datei-ID bereits vorhanden",
    "02004": "Format Leistungsnachweis-ID nicht korrekt",
    "02005": "Leistungsnachweis-ID bereits vorhanden",
    "02006": "Unbekannter Schlüsselwert",
    "02007": "Datumsangabe größer Verarbeitungsdatum unzulässig",
    "02008": "Falscher Nachrichtentyp",
    "02009": "Leistungsnachweis-IDs zwischen Element „Abrechnungsbegründende Unterlage“ und entsprechendem Leistungsnachweis nicht identisch",
    "03002": "anderer technischer Fehler (Erläuterung siehe Fehlertext)",
}
export type FehlercodesSchluessel = keyof typeof fehlercodesSchluessel

/** 3.2 Schlüssel Art der Unterschrift */
export const unterschriftSchluessel = {
    "1": "Bildunterschrift des Versicherten oder seines Vertreters",
    "2": "Bildunterschrift eines Vertreters aus Angehörigen-Apps",
    "3": "gescannter Papier - LNW mit der Unterschrift eines abwesenden Betreuers / Bevollmächtigten",
    "4": "alternative Bestätigungsmethode (nur nach bilateraler Abstimmung mit der Pflegekasse möglich)",
    "5": "begründetes Fehlen der Unterschrift",
}
export type UnterschriftSchluessel = keyof typeof unterschriftSchluessel

/** 3.3 Schlüssel Grund des Fehlens der Unterschrift */
export const fehlendeUnterschriftSchluessel = {
    "1": "Versicherter verstorben",
    "2": "stationäre Versorgung",
    "3": "körperliche / kognitive Einschränkung (z.B. Schreibschwäche)",
    "4": "Sonstiges",
}
export type FehlendeUnterschriftSchluessel = keyof typeof fehlendeUnterschriftSchluessel

/** 3.5 Schlüssel Inhaltstyp (fachlicher Inhalt der Datei) */
export const inhaltstypSchluessel = {
    "1": "Leistungsnachweis",
    "2": "Abtretungserklärung",
}
export type InhaltstypSchluessel = keyof typeof inhaltstypSchluessel

/** 3.6 Schlüssel Dateityp (MIME Type der Datei) */
export const dateitypSchluessel = {
    "1": "text / xml",
    "2": "application / pdf",
    "3": "image / png",
    "4": "image / jpeg",
    "5": "Sonstiges",
}
export type DateitypSchluessel = keyof typeof dateitypSchluessel
