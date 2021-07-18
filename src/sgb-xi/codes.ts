/** based on document: Pflege, Technische Anlage 3, Schlüsselverzeichnisse
  * see docs/documents.md for more info
  */

// 2.2.1 Schlüssel Abrechnungscode
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
    "08": "NRW",
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
export type TarifbereichSchluessel = keyof typeof tarifbereichSchluessel;

// 2.3 Schlüssel Verarbeitungskennzeichen
export const verarbeitungskennzeichenSchluessel = {
    "01": "Abrechnung ohne Besonderheiten",
}
export type VerarbeitungskennzeichenSchluessel = keyof typeof verarbeitungskennzeichenSchluessel;

// 2.4 Schlüssel Art der abgegebenen Leistung
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
}
export type LeistungsartSchluessel = keyof typeof leistungsartSchluessel;

// 2.5 Schlüssel Vergütungsart
export const verguetungsartSchluessel = {
    "01": "Leistungskomplexvergütung",
    "02": "Zeitvergütung",
    "03": "teilstationär",
    "04": "vollstationär / Kurzzeitpflege",
    "05": "Pflegehilfsmittel",
    "06": "Wegegebühren (sofern nicht Leistungskomplex)",
    "08": "Pauschale (Beratungsbesuch) (sofern nicht Leistungskomplex)",
    "99": "keine Vetragspreisregelung",
}
export type VerguetungsartSchluessel = keyof typeof verguetungsartSchluessel;

// 2.6 Schlüssel Qualifikationsabhängige Vergütung
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
export type QualifikationsabhaengigeVerguetungSchluessel = keyof typeof qualifikationsabhaengigeVerguetungSchluessel;

// 2.7.2.1 Schlüsselkennzeichen Zeiteinheit
export const zeiteinheitSchluessel = {
    "1": "Minute",
    "2": "5 Minuten",
    "3": "15 Minuten",
    "4": "Stunde",
    "5": "Tag",
}
export type ZeiteinheitSchluessel = keyof typeof zeiteinheitSchluessel;

// 2.7.2.2 Schlüsselkennzeichen Zeitart
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
}
export type ZeitartSchluessel = keyof typeof zeitartSchluessel;

// 2.7.3 Schlüssel Kennzeichen Pflegesatz
export const pflegesatzSchluessel = {
    "00": "ganztags (teilstationär, vollstationär/Kurzzeitpflege)",
    "01": "halbtags (teilstationär/Tages- oder Nachtpflege)",
    "02": "Abwesenheit",
}
export type PflegesatzSchluessel = keyof typeof pflegesatzSchluessel;

// 2.7.5 Schlüssel Wegegebühren/Beförderungsentgelt-Art
export const wegegebuehrenSchluessel = {
    "01": "Tagespauschale",
    "02": "Monatspauschale",
    "03": "Einsatz- / Fahrtkostenpauschale",
    "04": "gefahrene Kilometer",
}
export type WegegebuehrenSchluessel = keyof typeof wegegebuehrenSchluessel;

// 2.7.7 Schlüssel Leistung: Pauschale (Beratungsbesuch nach § 37 Abs. 3)
export const pauschaleLeistungSchluessel = {
    "1": "Einsatzpauschale"
}
export type PauschaleLeistungSchluessel = keyof typeof pauschaleLeistungSchluessel;

// 2.7.8 Schlüssel Leistung: Sonstige
export const sonstigeLeistungSchluessel = {
    "99": "Sonstiges"
}
export type SonstigeLeistungSchluessel = keyof typeof sonstigeLeistungSchluessel;

// 2.8 Schlüssel Kennzeichen Pflegehilfsmittel
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

// 2.9 Schlüssel Mehrwertsteuer
export const mehrwertsteuerSchluessel = {
    "": "keine Mehrwertsteuer",
    "1": "voller Mehrwertsteuersatz, dem Einzelbetrag zuzurechnen",
    "2": "ermäßigter Mehrwertsteuersatz, dem Einzelbetrag zuzurechnen",
}
export type MehrwertsteuerSchluessel = keyof typeof mehrwertsteuerSchluessel;

// 2.13 Schlüssel Grund UST-Befreiung
export const umsatzsteuerBefreiungSchluessel = {
    "": "keine Umsatzsteuerbefreiung",
    "01": "Umsatzsteuerbefreiung nach § 4 Nr. 16",
}
export type UmsatzsteuerBefreiungSchluessel = keyof typeof umsatzsteuerBefreiungSchluessel;

// 2.14.2 Schlüssel Zuschlagsart
export const zuschlagsartSchluessel = {
    "1": "ambulant",
    "2": "stationär (teil-/vollstationär)",
    "3": "Kurzzeitpflege",
}
export type ZuschlagsartSchluessel = keyof typeof zuschlagsartSchluessel;

// 2.14.3 Schlüssel Zuschlag
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
export type ZuschlagSchluessel = keyof typeof zuschlagSchluessel;

// n.a. Schlüssel Zuschlagszuordnung
export const zuschlagszuordnungSchluessel = {
    "1": "Leistung",
    "2": "Wegegebühr",
}
export type ZuschlagszuordnungSchluessel = keyof typeof zuschlagszuordnungSchluessel;

// 2.15 Schlüssel Pflegegrad
export const pflegegradSchluessel = {
    "1": "Pflegegrad 1",
    "2": "Pflegegrad 2",
    "3": "Pflegegrad 3",
    "4": "Pflegegrad 4",
    "5": "Pflegegrad 5",
}
export type PflegegradSchluessel = keyof typeof pflegegradSchluessel;

// 2.16 Schlüssel Zuschlagsberechnung
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
export type ZuschlagsberechnungSchluessel = keyof typeof zuschlagsberechnungSchluessel;