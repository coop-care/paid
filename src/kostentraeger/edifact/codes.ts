/** based on documents: 
 *  - Pflege, Technische Anlage 1, Anhang 5: Kostenträgerdatei
 *  - Sonstige Leistungserbringer, Anlage 1, Anhang 3, Kapitel 10: Kostenträgerdatei
 * 
 * (see /docs/documents.md for more info)
 */

import { AbrechnungscodeSchluessel as SonstigeAbrechnungscodeSchluessel } from "../../sgb-v/codes"
import { LeistungsartSchluessel as PflegeLeistungsartSchluessel } from "../../sgb-xi/codes"

/** Art der Anschrift */
export const anschriftartSchluessel = {
    "1": "Hausanschrift",
    "2": "Postfachanschrift",
    "3": "Großkundenanschrift"
}
export type AnschriftartSchluessel = keyof typeof anschriftartSchluessel

/** Art der Datenlieferung */
export const datenlieferungsArtSchluessel = {
    "07": "digitalisierte Rechnungs- und Abrechnungsdaten " +
          "(PLGA und PLLA für Pflege, SLGA und SLLA für Sonstige)",

    "21": "Rechnung (Papier)",

    "24": "maschinenlesbarer Beleg",

    "26": "Verordnung (Papier)",

    "27": "Kostenvoranschlag (Papier)",

    "28": "Gruppenschlüssel (Einzelschlüssel 21, 26, 27): "+
          "papiergebundene Unterlagen einer digitalen Abrechnung " +
          "(Verordnung, ggf. Kostenvoranschlag, ggf. Rechnung)",

    "29": "Gruppenschlüssel (Einzelschlüssel 24, 26, 27): " +
          "maschinenlesbarer Beleg einschließlich der dazugehörigen Abrechnungsunterlagen"
}
export type DatenlieferungsartSchluessel = keyof typeof datenlieferungsArtSchluessel

/** Art der Verknüpfung zwischen Institutionskennzeichen */
export const ikVerknuepfungsartSchluessel = {
    "00": "Keine Verknüpfung möglich (Verweis ist bilateral zu vereinbaren)",
    "01": "Verweis vom IK der Versichertenkarte zum Kostenträger",
    "02": "Verweis auf eine Datenannahmestelle (ohne Entschlüsselungsbefugnis). ",
    "03": "Verweis auf eine Datenannahmestelle (mit Entschlüsselungsbefugnis). ",
    "09": "Verweis auf eine Papierannahmestelle"
}
export type IKVerknuepfungsartSchluessel = keyof typeof ikVerknuepfungsartSchluessel

/** Bundesland */
export const bundeslandSchluessel = {
    "01": "Schleswig-Holstein",
    "02": "Hamburg",
    "03": "Niedersachsen",
    "04": "Bremen",
    "05": "Nordrhein-Westfalen",
    "06": "Hessen",
    "07": "Rheinland-Pfalz",
    "08": "Baden-Württemberg",
    "09": "Bayern",
    "10": "Saarland",
    "11": "Berlin",
    "12": "Brandenburg",
    "13": "Mecklenburg-Vorpommern",
    "14": "Sachsen",
    "15": "Sachsen-Anhalt",
    "16": "Thüringen",
    "99": "Alle Bundesländer (bei Datenlieferungen)",
}
export type BundeslandSchluessel = keyof typeof bundeslandSchluessel

/** DFÜ Protokoll / Übertragungsprotokoll */
export const dfuProtokollSchluessel = {
    "016": "FTAM",
    "023": "FTP", // Verwendung nur nach biliteraler Absprache möglich
    "070": "SMTP"
}
export type DFUProtokollSchluessel = keyof typeof dfuProtokollSchluessel

/** Komprimierungsart */
// this key is not (yet) defined

/** KV-Bezirk 
 * 
 *  Only used by very few institutions. As of April 2021, actually only used by two sub-branches
 *  of the AOK: Westfalen-Lippe and Nordrhein (only used values are "20", "38" and a stray "17").
*/
export const kvBezirkSchluessel = {
    "01": "Schleswig-Holstein",
    "02": "Hamburg",
    "03": "Bremen",
    "17": "Niedersachsen",
        "06": "Bezirksstelle Aurich",
        "07": "Bezirksstelle Braunschweig",
        "08": "Bezirksstelle Göttingen",
        "09": "Bezirksstelle Hannover",
        "10": "Bezirksstelle Hildesheim",
        "11": "Bezirksstelle Lüneburg",
        "12": "Bezirksstelle Oldenburg",
        "13": "Bezirksstelle Osnabrück",
        "14": "Bezirksstelle Stade",
        "15": "Bezirksstelle Verden",
        "16": "Bezirksstelle Wilhelmshaven",
    "20": "Westfalen-Lippe",
        "18": "Verwaltungsstelle Dortmund",
        "19": "Verwaltungsstelle Münster",
    "38": "Nordrhein",
        "21": "Bezirksstelle Aachen",
        "24": "Bezirksstelle Düsseldorf",
        "25": "Bezirksstelle Duisburg",
        "27": "Bezirksstelle Köln",
        "28": "Bezirksstelle Linker Niederrhein",
        "31": "Bezirksstelle Ruhr",
        "37": "Bezirksstelle Bergisch-Land",
    "46": "Hessen",
        "39": "Bezirksstelle Darmstadt",
        "40": "Bezirksstelle Frankfurt",
        "41": "Bezirksstelle Giessen",
        "42": "Bezirksstelle Kassel",
        "43": "Bezirksstelle Limburg",
        "44": "Bezirksstelle Marburg",
        "45": "Bezirksstelle Wiesbaden",
    "47": "Koblenz",
    "48": "Rheinhessen",
    "49": "Pfalz",
    "50": "Trier",
    "55": "Nordbaden",
        "52": "Abrechnungsstelle Karlsruhe",
        "53": "Abrechnungsstelle Mannheim",
        "54": "Abrechnungsstelle Pfortzheim",
        "56": "Abrechnungsstelle Baden-Baden",
    "60": "Südbaden",
        "57": "Abrechnungsstelle Freiburg",
        "58": "Abrechnungsstelle Konstanz",
        "59": "Abrechnungsstelle Offenburg",
    "61": "Nordwürttemberg",
    "62": "Südwürttemberg",
    "71": "Bayern",
        "63": "Bezirksstelle München Stadt u. Land",
        "64": "Bezirksstelle Oberbayern",
        "65": "Bezirksstelle Oberfranken",
        "66": "Bezirksstelle Mittelfranken",
        "67": "Bezirksstelle Unterfranken",
        "68": "Bezirksstelle Oberpfalz",
        "69": "Bezirksstelle Niederbayern",
        "70": "Bezirksstelle Schwaben",
    "72": "Berlin",
    "73": "Saarland",
    "78": "Mecklenburg-Vorpommern",
    "83": "Brandenburg",
        "79": "Abrechnungsstelle Potsdam",
        "80": "Abrechnungsstelle Cottbus",
        "81": "Abrechnungsstelle Frankfurt/Oder",
    "88": "Sachsen-Anhalt",
        "85": "Abrechnungsstelle Magdeburg",
        "86": "Abrechnungsstelle Halle",
        "87": "Abrechnungsstelle Dessau",
    "93": "Thüringen",
        "89": "Abrechnungsstelle Erfurt",
        "90": "Abrechnungsstelle Gera",
        "91": "Abrechnungsstelle Suhl",
    "98": "Sachsen",
        "94": "Bezirksstelle Chemnitz",
        "95": "Bezirksstelle Dresden",
        "96": "Bezirksstelle Leipzig"
}
export type KVBezirkSchluessel = keyof typeof kvBezirkSchluessel

/** Leistungserbringergruppe */
export const leistungserbringergruppeSchluessel = {
    "5": "Sonstige Leistungserbringer",
    "6": "Pflege-Leistungserbringer"
}
export type LeistungserbringergruppeSchluessel = keyof typeof leistungserbringergruppeSchluessel

/** Übermittlungsmedium */
export const uebermittlungsmediumSchluessel = {
    "1": "DFÜ (einschließlich E-Mail)",
    "2": "Magnetband",
    "3": "Magnetbanddiskette",
    "4": "Diskette",
    "5": "Machinenlesbarer Beleg",
    "6": "Nicht maschinenlesbarer Beleg",
    "7": "CD-ROM",
    "9": "Alle Datenträger (Schlüssel 2, 3, 4, 7)"
}
export type UebermittlungsmediumSchluessel = keyof typeof uebermittlungsmediumSchluessel

/** Übermittlungsmedium-Parameter */
export const uebermittlungsmediumParameterSchluessel = {
    "00": "kein Parameter (DFÜ-Parameter sind im Segment DFU hinterlegt)",
    "01": "Magnetband 1600 bpi", // Verwendung nur nach biliteraler Absprache möglich
    "02": "Magnetband 6250 bpi",
    "03": "Magnetbandkassette 3480",
    "04": "Magnetbandkassette 3490 - 18 Spur",
    "05": "Magnetbandkassette 3490 - 36 Spur",
    "06": "Magnetbandkassette DAT", // Verwendung nur nach biliteraler Absprache möglich
    "07": "Magnetbandkassette 8 mm", // Verwendung nur nach biliteraler Absprache möglich
    "08": "Diskette 3,5\" - 720 KB - DOS-Format",
    "09": "Diskette 3,5\" - 1,44 MB - DOS-Format",
    "10": "Diskette 3,5\" - 2,88 MB - DOS-Format",
    "11": "Diskette 5,25\" - 360 kB - DOS-Format", // Verwendung nur nach biliteraler Absprache möglich
    "12": "Diskette 5,25\" - 1,2 MB - DOS-Format", // Verwendung nur nach biliteraler Absprache möglich
    "13": "Diskette 3,5\"- 1,44 MB - UNIX-TAR-Format", // Verwendung nur nach biliteraler Absprache möglich
    "14": "CD-ROM, 12cm, 650 MB",
}
export type UebermittlungsmediumParameterSchluessel = keyof typeof uebermittlungsmediumParameterSchluessel

/** Übermittlungszeichensatz */
export const uebermittlungszeichensatzSchluessel = {
    "I1": "ISO 8859-1",
    "I7": "ASCII 7-Bit",
    "I8": "ASCII 8-Bit",
    "99": "alle Zeichensätze gemäß Anlage 15 GGT"
}
export type UebermittlungszeichensatzSchluessel = keyof typeof uebermittlungszeichensatzSchluessel

/** Übertragungstage */
export const uebertragungstageSchluessel = {
    "1": "Übertragung an allen Tagen",
    "2": "Übertragung nur an Werktagen (Montag bis Samstag außer Feiertag)",
    "3": "Übertragung nur an Arbeitstagen (Montag bis Freitag außer Feiertag)"
}
export type UebertragungstageSchluessel = keyof typeof uebertragungstageSchluessel

/** Verarbeitungskennzeichen */
export const verarbeitungskennzeichenSchluessel = {
    "01": "Neuanmeldung",
    "02": "Änderung",
    "03": "Stornierung",
    "04": "Unverändert"
} 
export type VerarbeitungskennzeichenSchluessel = keyof typeof verarbeitungskennzeichenSchluessel

/** Sonderschlüssel für Leistungsart für Pflegedienstleistungen nach § 105 Abs. 2 SGB XI */
export const pflegeLeistungsartSonderschluessel = {
    "00": "Sammelschlüssel für alle Leistungsarten",
    "99": "Sonderschlüssel, gilt für alle in der Kostenträgerdatei nicht aufgeführten Gruppen-und Einzelschlüssel",
}
export type PflegeLeistungsartSonderschluessel = keyof typeof pflegeLeistungsartSonderschluessel

export type KostentraegerPflegeLeistungsartSchluessel = 
    PflegeLeistungsartSonderschluessel | PflegeLeistungsartSchluessel

/** Sonderschlüssel Abrechnungscode für Leistungen nach § 302 Abs. 2 SGB V */
export const abrechnungscodeSonderschluessel = {
    "00": "Sammelschlüssel für alle Leistungsarten",
    "99": "Sonderschlüssel, gilt für alle in der Kostenträgerdatei nicht aufgeführten Gruppen-und Einzelschlüssel"
}
export type AbrechnungscodeSonderschluessel = keyof typeof abrechnungscodeSonderschluessel

export type KostentraegerAbrechnungscodeSchluessel = 
    AbrechnungscodeSonderschluessel | SonstigeAbrechnungscodeSchluessel

// ASK/TODO: Why the duplicates? Relevant for us?
/** Tarifkennzeichen: Tarifbereich (1-2 Stelle des Tarifkennzeichens) */
export const tarifbereichSchluessel = {
    "00": "Bundeseinheitlicher Tarif (gültig für Ost und West)",
    "01": "Baden-Württemberg",
    "02": "Bayern",
    "03": "Berlin Ost",
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
    "16": "Thüringen",
    "17": "Stuttgart und Karlsruhe",
    "18": "Freiburg und Tübingen",
    "19": "Berlin West",
    "20": "Nordrhein",
    "21": "Westfalen-Lippe",
    "22": "Lippe",
    "23": "Berlin (gesamt)",
    "24": "Bundeseinheitlicher Tarif (West)",
    "25": "Bundeseinheitlicher Tarif (Ost)",
    "50": "Bundesvertrag",
    "51": "Baden-Württemberg",
    "52": "Bayern",
    "53": "Berlin Ost",
    "54": "Bremen",
    "55": "Hamburg",
    "56": "Hessen",
    "57": "Niedersachsen",
    "58": "Nordrhein-Westfalen",
    "59": "Rheinland-Pfalz",
    "60": "Saarland",
    "61": "Schleswig-Holstein",
    "62": "Brandenburg",
    "63": "Sachsen",
    "64": "Sachsen-Anhalt",
    "65": "Mecklenburg-Vorpommern",
    "66": "Thüringen",
    "67": "Stuttgart und Karlsruhe",
    "68": "Freiburg und Tübingen",
    "69": "Berlin West",
    "70": "Nordrhein",
    "71": "Westfalen-Lippe",
    "72": "Lippe",
    "73": "Berlin (gesamt)",
    "74": "Bundeseinheitlicher Tarif (West)",
    "75": "Bundeseinheitlicher Tarif (Ost)",
    "90": "sonstiger länderübergreifender Tarif",
    "91": "Vertrag auf Kassenebene",
    "92": "Vertrag auf Kassenebene",
    "93": "Vertrag auf Kassenebene",
    "94": "Vertrag auf Kassenebene",
    "95": "Vertrag auf Kassenebene",
    "96": "Vertrag auf Kassenebene",
    "97": "Vertrag auf Kassenebene",
    "98": "Vertrag auf Kassenebene",
    "99": "Vertrag auf Kassenebene"
}
export type TarifbereichSchluessel = keyof typeof tarifbereichSchluessel

/*  Sondertarife (3. bis 5. Stelle des Tarifkennzeichens)

    000 - 090           ohne Besonderheiten
    A00 - A90           
    
    091 - 098           nicht besetzt
    A91 - A98            (wird von den Verbänden der Krankenkassen auf Bundesebene belegt)
    U00 - ZZZ           
    
    099                 Leistung ohne preisliche Regelung und daher Abrechnung nach genehmigten 
                         Kostenvoranschlag
    
    100 - 999           Sondertarifvereinbarungen zwischen einem oder mehreren Leistungserbringern
    A99 - TZZ            und einem oder mehreren Kostenträgern
                         (Das Kennzeichen für Sondertarife wird von den Vertragspartnern festgelegt)

    Alle übrigen        Sondertarifvereinbarungen zwischen einem oder mehreren Leistungserbringern 
    Zahlen-/Buch-        und einem oder mehreren Kostenträgern 
    stabenkombi-         (Das Kennzeichen für Sondertarife wird von den Vertragspartnern festgelegt)
    nationen, die 
    nicht in die o.g. 
    reservierten Be-
    reiche fallen
*/