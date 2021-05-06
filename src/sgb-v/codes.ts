

/** Schlüssel Abrechnungscode für Leistungen nach § 302 Abs. 2 SGB V */
export const abrechnungscodeSchluessel = {
    "10": "Gruppenschlüssel Hilfsmittellieferant (Schlüssel 11-19)",
    "11": "Apotheke (mit gesonderter Zulassung nach § 126 SGB V)",
        "12": "Augenoptiker",
        "13": "Augenarzt",
        "14": "Hörgeräteakustiker",
        "15": "Orthopädiemechaniker, Bandagist, Sanitätshaus",
        "16": "Orthopädieschuhmacher",
        "17": "Orthopäde",
        "18": "Sanitätshaus", // deprecated and supposedly removed on 31.12.2005 -> de-facto still used at least by AOK
        "19": "Sonstiger Hilfsmittellieferant",
    "20": "Gruppenschlüssel Heilmittelerbringer (Schlüssel 21-29)",
        "21": "Masseur / Medizinischer Badebetrieb",
        "22": "Krankengymnast/Physiotherapeut",
        "23": "Logopäde/Atem-, Sprech- und Stimmlehrer / staatl. Anerkannter Sprachtherapeut",
        "24": "Sprachheilpädagoge / Dipl. Pädagoge",
        "25": "Sonstiger Sprachtherapeut",
        "26": "Ergotherapeut",
        "27": "Krankenhaus",
        "28": "Kurbetrieb",
        "29": "Sonstige therapeutische Heilperson",
    "30": "Gruppenschlüssel Häusliche Krankenpflege (Schlüssel 31-34)",
        "31": "freigemeinnützige Anbieter (Sozialstation)",
        "32": "privatgewerbliche Anbieter",
        "33": "öffentliche Anbieter",
        "34": "sonstige Pflegedienste",
    "40": "Gruppenschlüssel Krankentransportleistungen (Schlüssel 41-49)",
        "41": "Öffentlicher Träger (z.B. Feuerwehr)",
        "42": "Deutsches Rotes Kreuz (DRK)",
        "43": "Arbeiter-Samariter-Bund (ASB)",
        "44": "Johanniter-Unfall-Hilfe (JUH)",
        "45": "Malteser-Hilfsdienst (MHD)",
        "46": "Sonstiger Leistungserbringer von bodengebundenen Transportleistungen (Taxi / Mietwagen)",
        "47": "Leistungserbringer von Flugrettungs-und Transportleistungen",
        "49": "Sonstiger Leistungserbringer von Krankentransportleistungen (z.B. Bergwacht, Wasserwacht, usw.)",
    "50": "Hebamme / Entbindungspfleger",
    "55": "Sonstiger Leistungserbringer von nichtärztlichen Dialysesachleistungen",
    "56": "Kuratorium für Heimdialyse (KfH)",
    "57": "Patienten-Heimversorgung (PHV)",
    "60": "Betriebshilfe",
    "61": "Leistungserbringer von Rehabilitationssport",
    "62": "Leistungserbringer von Funktionstraining",
    "63": "Leistungserbringer für ergänzende Rehabilitationsmaßnahmen",
    "65": "Sonstige Leistungserbringer",
    "66": "Leistungserbringer von Präventions- und Gesundheitsförderungsmaßnahmen im Rahmen von ambulanten Vorsorgeleistungen",
    "67": "Ambulantes Rehazentrum",
    "68": "Sozialpädiatrische Zentren/Frühförderstellen",
    "69": "Soziotherapeutische Leistungserbringer",
    "71": "Podologen",
    "73": "Leistungserbringer von Ernährungstherapie für seltene angeborene Stoffwechselerkrankungen",
    "74": "Leistungserbringer von Ernährungstherapie für Mukoviszidose",
    "72": "Med. Fußpfleger (gemäß § 10 Abs. 4 bis 6 PodG)",
    "75": "Spezialisierte ambulante Palliativversorgung (SAPV)",
    "76": "Leistungserbringer nach § 132g SGB V",
    "90": "Gruppenschlüssel Kurzzeitpflege (Schlüssel 91-94)",
        "91": "Kurzzeitpflege, privat gewerblicher Anbieter",
        "92": "Kurzzeitpflege, frei gemeinnütziger Anbieter (gemeinnützige private Anbieter)",
        "93": "Kurzzeitpflege, öffentlicher Anbieter",
        "94": "Kurzzeitpflege, sonstige Pflegeeinrichtung"
}
export type AbrechnungscodeSchluessel = keyof typeof abrechnungscodeSchluessel
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
