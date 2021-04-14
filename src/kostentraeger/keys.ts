/* 
 *  These types are based on the documentation
 *  
 *  Anhang 5 zur Anlage 1 - Kostenträgerdatei,
 *  Regelung der Datenübermittlung nach § 105 Abs. 2 SGB XI Technische Anlage (Anlage 1),
 *  Version 3.3, Effective starting 01.10.2021
 *  
 *  https://gkv-datenaustausch.de/media/dokumente/leistungserbringer_1/pflege/technische_anlagen_aktuell_2/TA1_ANH5_20170907_105_oA.pdf
 * 
 *  and
 * 
 *  Anhang 3 zur Anlage 1 - Kapitel 10 "Kostenträgerdatei",
 *  zu den Richtlinien der Spitzenverbände der Krankenkassen nach § 302 Abs. 2 SGB V über Form und 
 *  Inhalt des Abrechnungsverfahrens mit "Sonstigen Leistungserbringern" sowie mit Hebammen und 
 *  Entbindungspflegern (§ 301a SGB V)
 *  Version 07, Effective starting 01.10.2021
 * 
 *  https://gkv-datenaustausch.de/media/dokumente/leistungserbringer_1/sonstige_leistungserbringer/technische_anlagen_aktuell_4/Anhang_03_Anlage_1_TP5_20200616.pdf
 * 
 */

/** Art der Anschrift */
export const anschriftartSchluessel = {
    1: "Hausanschrift",
    2: "Postfachanschrift",
    3: "Großkundenanschrift"
}
export type AnschriftartSchluessel = keyof typeof anschriftartSchluessel

/** Art der Datenlieferung */
export const datenlieferungsArtSchluessel = {
     7: "digitalisierte Rechnungs- und Abrechnungsdaten " +
        "(PLGA und PLLA für Pflege, SLGA und SLLA für Sonstige)",

    21: "Rechnung (Papier)",

    24: "maschinenlesbarer Beleg",

    26: "Verordnung (Papier)",

    27: "Kostenvoranschlag (Papier)",

    28: "Gruppenschlüssel (Einzelschlüssel 21, 26, 27): "+
        "papiergebundene Unterlagen einer digitalen Abrechnung " +
        "(Verordnung, ggf. Kostenvoranschlag, ggf. Rechnung)",

    29: "Gruppenschlüssel (Einzelschlüssel 24, 26, 27): " +
        "maschinenlesbarer Beleg einschließlich der dazugehörigen Abrechnungsunterlagen"
}
export type DatenlieferungsartSchluessel = keyof typeof datenlieferungsArtSchluessel

/** Art der Verknüpfung zwischen Institutionskennzeichen */
export const ikVerknuepfungsartSchluessel = {
    0: "Keine Verknüpfung möglich (Verweis ist bilateral zu vereinbaren)",

    1: "Verweis vom IK der Versichertenkarte zum Kostenträger",

    2: "Verweis auf eine Datenannahmestelle (ohne Entschlüsselungsbefugnis). " +
       "Schlüssel ist nur gültig in Verbindung mit dem Schlüssel 07 „Art der Datenlieferung“",

    3: "Verweis auf eine Datenannahmestelle (mit Entschlüsselungsbefugnis). " +
       "Schlüssel ist nur gültig in Verbindung mit dem Schlüssel 07 „Art der Datenlieferung“",

    9: "Verweis auf eine Papierannahmestelle"
}
export type IKVerknuepfungsartSchluessel = keyof typeof ikVerknuepfungsartSchluessel

/** Bundesland */
export const bundeslandSchluessel = {
     1: "Schleswig-Holstein",
     2: "Hamburg",
     3: "Niedersachsen",
     4: "Bremen",
     5: "Nordrhein-Westfalen",
     6: "Hessen",
     7: "Rheinland-Pfalz",
     8: "Baden-Württemberg",
     9: "Bayern",
    10: "Saarland",
    11: "Berlin",
    12: "Brandenburg",
    13: "Mecklenburg-Vorpommern",
    14: "Sachsen",
    15: "Sachsen-Anhalt",
    16: "Thüringen",
    99: "Alle Bundesländer (bei Datenlieferungen)",
}
export type BundeslandSchluessel = keyof typeof bundeslandSchluessel

/** DFÜ Protokoll */
export const dfuProtokollSchluessel = {
    "016": "FTAM",
    "023": "FTP", // Verwendung nur nach biliteraler Absprache möglich
    "070": "SMTP"
}
export type DFUProtokollSchluessel = keyof typeof dfuProtokollSchluessel

/** Komprimierungsart */
// this key is not (yet) defined

/** KV-Bezirk */
export const kvBezirkSchluessel = {
     1: "Schleswig-Holstein",
     2: "Hamburg",
     3: "Bremen",
    17: "Niedersachsen",
        6: "Bezirksstelle Aurich",
        7: "Bezirksstelle Braunschweig",
        8: "Bezirksstelle Göttingen",
        9: "Bezirksstelle Hannover",
        10: "Bezirksstelle Hildesheim",
        11: "Bezirksstelle Lüneburg",
        12: "Bezirksstelle Oldenburg",
        13: "Bezirksstelle Osnabrück",
        14: "Bezirksstelle Stade",
        15: "Bezirksstelle Verden",
        16: "Bezirksstelle Wilhelmshaven",
    20: "Westfalen-Lippe",
        18: "Verwaltungsstelle Dortmund",
        19: "Verwaltungsstelle Münster",
    38: "Nordrhein",
        21: "Bezirksstelle Aachen",
        24: "Bezirksstelle Düsseldorf",
        25: "Bezirksstelle Duisburg",
        27: "Bezirksstelle Köln",
        28: "Bezirksstelle Linker Niederrhein",
        31: "Bezirksstelle Ruhr",
        37: "Bezirksstelle Bergisch-Land",
    46: "Hessen",
        39: "Bezirksstelle Darmstadt",
        40: "Bezirksstelle Frankfurt",
        41: "Bezirksstelle Giessen",
        42: "Bezirksstelle Kassel",
        43: "Bezirksstelle Limburg",
        44: "Bezirksstelle Marburg",
        45: "Bezirksstelle Wiesbaden",
    47: "Koblenz",
    48: "Rheinhessen",
    49: "Pfalz",
    50: "Trier",
    55: "Nordbaden",
        52: "Abrechnungsstelle Karlsruhe",
        53: "Abrechnungsstelle Mannheim",
        54: "Abrechnungsstelle Pfortzheim",
        56: "Abrechnungsstelle Baden-Baden",
    60: "Südbaden",
        57: "Abrechnungsstelle Freiburg",
        58: "Abrechnungsstelle Konstanz",
        59: "Abrechnungsstelle Offenburg",
    61: "Nordwürttemberg",
    62: "Südwürttemberg",
    71: "Bayern",
        63: "Bezirksstelle München Stadt u. Land",
        64: "Bezirksstelle Oberbayern",
        65: "Bezirksstelle Oberfranken",
        66: "Bezirksstelle Mittelfranken",
        67: "Bezirksstelle Unterfranken",
        68: "Bezirksstelle Oberpfalz",
        69: "Bezirksstelle Niederbayern",
        70: "Bezirksstelle Schwaben",
    72: "Berlin",
    73: "Saarland",
    78: "Mecklenburg-Vorpommern",
    83: "Brandenburg",
        79: "Abrechnungsstelle Potsdam",
        80: "Abrechnungsstelle Cottbus",
        81: "Abrechnungsstelle Frankfurt/Oder",
    88: "Sachsen-Anhalt",
        85: "Abrechnungsstelle Magdeburg",
        86: "Abrechnungsstelle Halle",
        87: "Abrechnungsstelle Dessau",
    93: "Thüringen",
        89: "Abrechnungsstelle Erfurt",
        90: "Abrechnungsstelle Gera",
        91: "Abrechnungsstelle Suhl",
    98: "Sachsen",
        94: "Bezirksstelle Chemnitz",
        95: "Bezirksstelle Dresden",
        96: "Bezirksstelle Leipzig"
}
export type KVBezirkSchluessel = keyof typeof kvBezirkSchluessel

/** Leistungserbringergruppe */
export const leistungserbringergruppeSchluessel = {
    5: "Sonstige Leistungserbringer",
    6: "Pflege-Leistungserbringer"
}
export type LeistungserbringergruppeSchluessel = keyof typeof leistungserbringergruppeSchluessel

/** Übermittlungsmedium */
export const uebermittlungsmediumSchluessel = {
    1: "DFÜ (einschließlich E-Mail)",
    2: "Magnetband",
    3: "Magnetbanddiskette",
    4: "Diskette",
    5: "Machinenlesbarer Beleg",
    6: "Nicht maschinenlesbarer Beleg",
    7: "CD-ROM",
    9: "Alle Datenträger (Schlüssel 2, 3, 4, 7)"
}
export type UebermittlungsmediumSchluessel = keyof typeof uebermittlungsmediumSchluessel

/** Übermittlungsmedium-Parameter */
export const uebermittlungsmediumParameterSchluessel = {
    0: "kein Parameter (DFÜ-Parameter sind im Segment DFU hinterlegt)",
    1: "Magnetband 1600 bpi", // Verwendung nur nach biliteraler Absprache möglich
    2: "Magnetband 6250 bpi",
    3: "Magnetbandkassette 3480",
    4: "Magnetbandkassette 3490 - 18 Spur",
    5: "Magnetbandkassette 3490 -36 Spur",
    6: "Magnetbandkassette DAT", // Verwendung nur nach biliteraler Absprache möglich
    7: "Magnetbandkassette 8 mm", // Verwendung nur nach biliteraler Absprache möglich
    8: "Diskette 3,5\" - 720 KB - DOS-Format",
    9: "Diskette 3,5\" - 1,44 MB - DOS-Format",
   10: "Diskette 3,5\" - 2,88 MB - DOS-Format",
   11: "Diskette 5,25\" - 360 kB - DOS-Format", // Verwendung nur nach biliteraler Absprache möglich
   12: "Diskette 5,25\" - 1,2 MB - DOS-Format", // Verwendung nur nach biliteraler Absprache möglich
   13: "Diskette 3,5\"- 1,44 MB - UNIX-TAR-Format", // Verwendung nur nach biliteraler Absprache möglich
   14: "CD-ROM, 12cm, 650 MB",
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
    1: "Übertragung an allen Tagen",
    2: "Übertragung nur an Werktagen (Montag bis Samstag außer Feiertag)",
    3: "Übertragung nur an Arbeitstagen (Montag bis Freitag außer Feiertag)"
}
export type UebertragungstageSchluessel = keyof typeof uebertragungstageSchluessel

/** Verarbeitungskennzeichen */
export const verarbeitungskennzeichenSchluessel = {
    1: "Neuanmeldung",
    2: "Änderung",
    3: "Stornierung",
    4: "Unverändert"
} 
export type VerarbeitungskennzeichenSchluessel = keyof typeof verarbeitungskennzeichenSchluessel


// TODO already defined in src/sgb-xi/codes.ts!!
// BUT Sammelschlüssel 99! is missing!
/* "Der Sammelschlüssel schließt die Verwendung von Gruppen- und Einzelschlüsseln sowie den 
   Sonderschlüssel 99 aus. Wird ein Gruppenschlüssel aufgeführt, können zu einem IK nicht die 
   zugehörigen Einzelschlüssel zusätzlich angegeben werden."
 */

/** Schlüssel Leistungsart für Pflegedienstleistungen nach § 105 Abs. 2 SGB XI */
export const pflegeLeistungsartSchluessel = {
    99: "Sonderschlüssel, gilt für nicht aufgeführte Gruppen- und Einzelschlüssel",
     1: "ambulante Pflege",
     2: "Tagespflege",
     3: "Nachtpflege",
     4: "Kurzzeitpflege",
     5: "vollstationäre Pflege",
     6: "Pflegehilfsmittel",
     7: "Verhinderungspflege",
     8: "Zuschuss nach § 43 Abs.3 SGB XI",
     9: "Beratungsbesuch (sofern nicht im Rahmen der ambulante Pflege (Schlüssel 01 abrechenbar)",
    10: "Entlastungsleistung nach § 45b SGB XI",
    11: "Beratungsgutschein nach § 7b SGB XI",
    12: "Wohngruppenzuschlag nach § 38a SGB XI"
}
export type PflegeLeistungsartSchluessel = keyof typeof pflegeLeistungsartSchluessel

/** Schlüssel Abrechnungscode für Leistungen nach § 302 Abs. 2 SGB V */
export const abrechnungscodeSchluessel = {
    0: "Sammelschlüssel für alle Leistungsarten",
    99: "Sonderschlüssel, gilt für alle in der Kostenträgerdatei nicht aufgeführten Gruppen-und Einzelschlüssel",
    10: "Gruppenschlüssel Hilfsmittellieferant (Schlüssel 11-19)",
    11: "Apotheke (mit gesonderter Zulassung nach § 126 SGB V)",
        12: "Augenoptiker",
        13: "Augenarzt",
        14: "Hörgeräteakustiker",
        15: "Orthopädiemechaniker, Bandagist, Sanitätshaus",
        16: "Orthopädieschuhmacher",
        17: "Orthopäde",
        // deprecated and removed on 31.12.2005 -> 18: Sanitätshaus 
        19: "Sonstiger Hilfsmittellieferant",
    20: "Gruppenschlüssel Heilmittelerbringer (Schlüssel 21-29)",
        21: "Masseur / Medizinischer Badebetrieb",
        22: "Krankengymnast/Physiotherapeut",
        23: "Logopäde/Atem-, Sprech- und Stimmlehrer / staatl. Anerkannter Sprachtherapeut",
        24: "Sprachheilpädagoge / Dipl. Pädagoge",
        25: "Sonstiger Sprachtherapeut",
        26: "Ergotherapeut",
        27: "Krankenhaus",
        28: "Kurbetrieb",
        29: "Sonstige therapeutische Heilperson",
    30: "Gruppenschlüssel Häusliche Krankenpflege (Schlüssel 31-34)",
        31: "freigemeinnützige Anbieter (Sozialstation)",
        32: "privatgewerbliche Anbieter",
        33: "öffentliche Anbieter",
        34: "sonstige Pflegedienste",
    40: "Gruppenschlüssel Krankentransportleistungen (Schlüssel 41-49)",
        41: "Öffentlicher Träger (z.B. Feuerwehr)",
        42: "Deutsches Rotes Kreuz (DRK)",
        43: "Arbeiter-Samariter-Bund (ASB)",
        44: "Johanniter-Unfall-Hilfe (JUH)",
        45: "Malteser-Hilfsdienst (MHD)",
        46: "Sonstiger Leistungserbringer von bodengebundenen Transportleistungen (Taxi / Mietwagen)",
        47: "Leistungserbringer von Flugrettungs-und Transportleistungen",
        49: "Sonstiger Leistungserbringer von Krankentransportleistungen (z.B. Bergwacht, Wasserwacht, usw.)",
    50: "Hebamme / Entbindungspfleger",
    55: "Sonstiger Leistungserbringer von nichtärztlichen Dialysesachleistungen",
    56: "Kuratorium für Heimdialyse (KfH)",
    57: "Patienten-Heimversorgung (PHV)",
    60: "Betriebshilfe",
    61: "Leistungserbringer von Rehabilitationssport",
    62: "Leistungserbringer von Funktionstraining",
    63: "Leistungserbringer für ergänzende Rehabilitationsmaßnahmen",
    65: "Sonstige Leistungserbringer",
    66: "Leistungserbringer von Präventions- und Gesundheitsförderungsmaßnahmen im Rahmen von ambulanten Vorsorgeleistungen",
    67: "Ambulantes Rehazentrum",
    68: "Sozialpädiatrische Zentren/Frühförderstellen",
    69: "Soziotherapeutische Leistungserbringer",
    71: "Podologen",
    73: "Leistungserbringer von Ernährungstherapie für seltene angeborene Stoffwechselerkrankungen",
    74: "Leistungserbringer von Ernährungstherapie für Mukoviszidose",
    72: "Med. Fußpfleger (gemäß § 10 Abs. 4 bis 6 PodG)",
    75: "Spezialisierte ambulante Palliativversorgung (SAPV)",
    76: "Leistungserbringer nach § 132g SGB V",
    90: "Gruppenschlüssel Kurzzeitpflege (Schlüssel 91-94)",
        91: "Kurzzeitpflege, privat gewerblicher Anbieter",
        92: "Kurzzeitpflege, frei gemeinnütziger Anbieter (gemeinnützige private Anbieter)",
        93: "Kurzzeitpflege, öffentlicher Anbieter",
        94: "Kurzzeitpflege, sonstige Pflegeeinrichtung"
}
export type AbrechnungscodeSchluessel = keyof typeof abrechnungscodeSchluessel

// ASK: Why the duplicates? Relevant for us?
/** Tarifkennzeichen: Tarifbereich (1-2 Stelle des Tarifkennzeichens) */
export const tarifbereichSchluessel = {
    0: "Bundeseinheitlicher Tarif (gültig für Ost und West)",
    1: "Baden-Württemberg",
    2: "Bayern",
    3: "Berlin Ost",
    4: "Bremen",
    5: "Hamburg",
    6: "Hessen",
    7: "Niedersachsen",
    8: "Nordrhein-Westfalen",
    9: "Rheinland-Pfalz",
   10: "Saarland",
   11: "Schleswig-Holstein",
   12: "Brandenburg",
   13: "Sachsen",
   14: "Sachsen-Anhalt",
   15: "Mecklenburg-Vorpommern",
   16: "Thüringen",
   17: "Stuttgart und Karlsruhe",
   18: "Freiburg und Tübingen",
   19: "Berlin West",
   20: "Nordrhein",
   21: "Westfalen-Lippe",
   22: "Lippe",
   23: "Berlin (gesamt)",
   24: "Bundeseinheitlicher Tarif (West)",
   25: "Bundeseinheitlicher Tarif (Ost)",
   50: "Bundesvertrag",
   51: "Baden-Württemberg",
   52: "Bayern",
   53: "Berlin Ost",
   54: "Bremen",
   55: "Hamburg",
   56: "Hessen",
   57: "Niedersachsen",
   58: "Nordrhein-Westfalen",
   59: "Rheinland-Pfalz",
   60: "Saarland",
   61: "Schleswig-Holstein",
   62: "Brandenburg",
   63: "Sachsen",
   64: "Sachsen-Anhalt",
   65: "Mecklenburg-Vorpommern",
   66: "Thüringen",
   67: "Stuttgart und Karlsruhe",
   68: "Freiburg und Tübingen",
   69: "Berlin West",
   70: "Nordrhein",
   71: "Westfalen-Lippe",
   72: "Lippe",
   73: "Berlin (gesamt)",
   74: "Bundeseinheitlicher Tarif (West)",
   75: "Bundeseinheitlicher Tarif (Ost)",
   90: "sonstiger länderübergreifender Tarif",
   91: "Vertrag auf Kassenebene",
   92: "Vertrag auf Kassenebene",
   93: "Vertrag auf Kassenebene",
   94: "Vertrag auf Kassenebene",
   95: "Vertrag auf Kassenebene",
   96: "Vertrag auf Kassenebene",
   97: "Vertrag auf Kassenebene",
   98: "Vertrag auf Kassenebene",
   99: "Vertrag auf Kassenebene"
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