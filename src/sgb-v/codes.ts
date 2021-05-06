

/** Schlüssel Abrechnungscode für Leistungen nach § 302 Abs. 2 SGB V */
export const abrechnungscodeEinzelschluessel = {
    "11": "Hilfsmittellieferant: Apotheke (mit gesonderter Zulassung nach § 126 SGB V)",
    "12": "Hilfsmittellieferant: Augenoptiker",
    "13": "Hilfsmittellieferant: Augenarzt",
    "14": "Hilfsmittellieferant: Hörgeräteakustiker",
    "15": "Hilfsmittellieferant: Orthopädiemechaniker, Bandagist, Sanitätshaus",
    "16": "Hilfsmittellieferant: Orthopädieschuhmacher",
    "17": "Hilfsmittellieferant: Orthopäde",
    "18": "Hilfsmittellieferant: Sanitätshaus", // deprecated and supposedly removed on 31.12.2005 -> de-facto still used at least by AOK
    "19": "Hilfsmittellieferant: Sonstiger",
    "21": "Heilmittelerbringer: Masseur / Medizinischer Badebetrieb",
    "22": "Heilmittelerbringer: Krankengymnast/Physiotherapeut",
    "23": "Heilmittelerbringer: Logopäde/Atem-, Sprech- und Stimmlehrer / staatl. Anerkannter Sprachtherapeut",
    "24": "Heilmittelerbringer: Sprachheilpädagoge / Dipl. Pädagoge",
    "25": "Heilmittelerbringer: Sonstiger Sprachtherapeut",
    "26": "Heilmittelerbringer: Ergotherapeut",
    "27": "Heilmittelerbringer: Krankenhaus",
    "28": "Heilmittelerbringer: Kurbetrieb",
    "29": "Heilmittelerbringer: Sonstige therapeutische Heilperson",
    "31": "Häusliche Krankenpflege: freigemeinnützige Anbieter (Sozialstation)",
    "32": "Häusliche Krankenpflege: privatgewerbliche Anbieter",
    "33": "Häusliche Krankenpflege: öffentliche Anbieter",
    "34": "Häusliche Krankenpflege: sonstige Pflegedienste",
    "41": "Krankentransportleistungen: Öffentlicher Träger (z.B. Feuerwehr)",
    "42": "Krankentransportleistungen: Deutsches Rotes Kreuz (DRK)",
    "43": "Krankentransportleistungen: Arbeiter-Samariter-Bund (ASB)",
    "44": "Krankentransportleistungen: Johanniter-Unfall-Hilfe (JUH)",
    "45": "Krankentransportleistungen: Malteser-Hilfsdienst (MHD)",
    "46": "Krankentransportleistungen: Sonstiger Leistungserbringer von bodengebundenen Transportleistungen (Taxi / Mietwagen)",
    "47": "Krankentransportleistungen: Leistungserbringer von Flugrettungs-und Transportleistungen",
    "49": "Krankentransportleistungen: Sonstiger Leistungserbringer von Krankentransportleistungen (z.B. Bergwacht, Wasserwacht, usw.)",
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
    "91": "Kurzzeitpflege: privat gewerblicher Anbieter",
    "92": "Kurzzeitpflege: frei gemeinnütziger Anbieter (gemeinnützige private Anbieter)",
    "93": "Kurzzeitpflege: öffentlicher Anbieter",
    "94": "Kurzzeitpflege: sonstige Pflegeeinrichtung"
}
export type AbrechnungscodeEinzelschluessel = keyof typeof abrechnungscodeEinzelschluessel

/** Gruppensschlüssel Abrechnungscode für Leistungen nach § 302 Abs. 2 SGB V
 *  These keys are used in the Kostenträger files for f.e. denote that an institution accepts 
 *  receipts for all services belonging to given group
 */
export const abrechnungscodeGruppenSchluessel = {
    "10": "Gruppenschlüssel Hilfsmittellieferant (Schlüssel 11-19)",
    "20": "Gruppenschlüssel Heilmittelerbringer (Schlüssel 21-29)",
    "30": "Gruppenschlüssel Häusliche Krankenpflege (Schlüssel 31-34)",
    "40": "Gruppenschlüssel Krankentransportleistungen (Schlüssel 41-49)",
    "90": "Gruppenschlüssel Kurzzeitpflege (Schlüssel 91-94)"
}
export type AbrechnungscodeGruppenSchluessel = keyof typeof abrechnungscodeGruppenSchluessel

/** Gruppensschlüssel + Einzelschlüssel für Leistungen nach § 302 Abs. 2 SGB V
 * 
 *  Outside of Kostenträger file parsing and filtering logic, this is probably not used, see 
 *  AbrechnungscodeEinzelschluessel instead
 */
export const abrechnungscodeSchluessel = { ...abrechnungscodeGruppenSchluessel, ...abrechnungscodeEinzelschluessel }

export type AbrechnungscodeSchluessel = keyof typeof abrechnungscodeSchluessel

const gruppenSchluesselToEinzelSchluessel = 
    new Map<AbrechnungscodeGruppenSchluessel, AbrechnungscodeEinzelschluessel[]>([
        ["10", ["11","12","13","14","15","16","17","18","19"]],
        ["20", ["21","22","23","24","25","26","27","28","29"]],
        ["30", ["31","32","33","34"]],
        ["40", ["41","42","43","44","45","46","47","49"]],
        ["90", ["91", "92", "93", "94"]]
    ])

/** Get all AbrechnungscodeEinzelschluessel that are allocated to the given 
 *  AbrechnungscodeGruppenSchluessel */
export function getAbrechnungscodeEinzelSchluessel(schluessel: AbrechnungscodeGruppenSchluessel): AbrechnungscodeEinzelschluessel[] {
    return gruppenSchluesselToEinzelSchluessel.get(schluessel)!
}

/** Get the AbrechnungscodeGruppenSchluessel the given AbrechnungscodeEinzelschluessel is allocated
 *  to. Returns undefined if it isn't allocated to any particular group */
export function getAbrechnungscodeGruppenSchluessel(schluessel: AbrechnungscodeEinzelschluessel): AbrechnungscodeGruppenSchluessel | undefined {
    for(const [gruppenschluessel, einzelschluesselArray] of gruppenSchluesselToEinzelSchluessel.entries()) {
        if (einzelschluesselArray.includes(schluessel)) {
            return gruppenschluessel
        }
    }
}


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
