/** based on documents: 
 * 
 *  (a) Sonstige Leistungserbringer, Technische Anlage 3, Schlüsselverzeichnisse
 *  (b) Sonstige Leistungserbringer, Anlage 1, Anhang 3, Kapitel 10, Kostenträgerdatei
 * 
 * see docs/documents.md for more info
 * 
 * The keys are sorted by the order they appear in the documentation (a)
 */

 export const nachrichtenkennungSchluessel = {
    "SLGA": "Sonstige Leistungserbringer Gesamtaufstellung der Abrechnung",
    "SLLA": "Sonstige Leistungserbringer Abrechnungsdaten je Abrechnungsfall",
}
export type NachrichtenkennungSchluessel = keyof typeof nachrichtenkennungSchluessel

/** Unfall / Sonstiges
 * 
 *  documented in (a) 8.1.2
 */
export const unfallSchluessel = {
    "1": "Arbeitsunfall / Wegeunfall / Berufskrankheit",
    "2": "sonstige Unfallfolgen",
    /** See f.e. https://soziales.niedersachsen.de/startseite/soziales_amp_gesundheit/soziales_entschadigungsrecht/personenkreis_und_leistungen/soziales-entschadigungsrecht-171.html 
     *  for what the acronyms stand for
    */
    "3": "Sonstiges (BVFG, BEG, HHG, OEG, IfSG, SVG)"
}
export type UnfallSchluessel = keyof typeof unfallSchluessel

/** documented as "BVG" but more precisely something of a subkey of UnfallSchluessel = 3
 * 
 *  documented in (a) 8.1.2.1
*/
export const sonstigeEntschaedigungSchluessel = {
    "6": "BVG"
}
export type SonstigeEntschaedigungSchluessel = keyof typeof sonstigeEntschaedigungSchluessel

/** Zuzahlung
 * 
 *  documented in (a) 8.1.3
 */
export const zuzahlungSchluessel = {
    "0": "keine gesetzliche Zuzahlung",
    "1": "Zuzahlungsbefreit",
    "2": "keine Zuzahlung trotz schriftlicher Zahlungsaufforderung",
    "3": "Zuzahlungspflichtig",
    "4": "Übergang zuzahlungspflichtig zu zuzahlungsfrei",
    "5": "Übergang zuzahlungsfrei zu zuzahlungspflichtig" 
}
export type ZuzahlungSchluessel = keyof typeof zuzahlungSchluessel

/** Abrechnungscode für Leistungen nach § 302 Abs. 2 SGB V
 * 
 *  documented in (a) 8.1.5.1, (b) 8.14 */
export type AbrechnungscodeEinzelschluessel = 
    HilfsmittellieferantAbrechnungscodeSchluessel |
    HeilmittelerbringerAbrechnungscodeSchluessel |
    HaeuslicheKrankenpflegeAbrechnungscodeSchluessel |
    KrankentransportleistungenAbrechnungscodeSchluessel |
    HebammenAbrechnungscodeSchluessel |
    NichtaerztlicheDialyseleistungenAbrechnungscodeSchluessel |
    RehasportAbrechnungscodeSchluessel |
    FunktionstrainingAbrechnungscodeSchluessel | 
    SonstigeAbrechnungscodeSchluessel |
    PraeventationAbrechnungscodeSchluessel |
    ErgaenzendeRehaAbrechnungscodeSchluessel |
    SozialpaediatrikAbrechnungscodeSchluessel |
    SozioTherapeutikAbrechnungscodeSchluessel |
    SAPVAbrechnungscodeSchluessel |
    VersorgungsplanungAbrechnungscodeSchluessel |
    KurzzeitpflegeAbrechnungscodeSchluessel

export const hilfsmittellieferantAbrechnungscodeSchluessel = {
    "11": "Hilfsmittellieferant: Apotheke (mit gesonderter Zulassung nach § 126 SGB V)",
    "12": "Hilfsmittellieferant: Augenoptiker",
    "13": "Hilfsmittellieferant: Augenarzt",
    "14": "Hilfsmittellieferant: Hörgeräteakustiker",
    "15": "Hilfsmittellieferant: Orthopädiemechaniker, Bandagist, Sanitätshaus",
    "16": "Hilfsmittellieferant: Orthopädieschuhmacher",
    "17": "Hilfsmittellieferant: Orthopäde",
    "18": "Hilfsmittellieferant: Sanitätshaus", // deprecated and supposedly removed on 31.12.2005 -> de-facto still used at least by AOK
    "19": "Hilfsmittellieferant: Sonstiger",
}
export type HilfsmittellieferantAbrechnungscodeSchluessel = keyof typeof hilfsmittellieferantAbrechnungscodeSchluessel

export const heilmittelerbringerAbrechnungscodeSchluessel = {
    "21": "Heilmittelerbringer: Masseur / Medizinischer Badebetrieb",
    "22": "Heilmittelerbringer: Krankengymnast/Physiotherapeut",
    "23": "Heilmittelerbringer: Logopäde/Atem-, Sprech- und Stimmlehrer / staatl. Anerkannter Sprachtherapeut",
    "24": "Heilmittelerbringer: Sprachheilpädagoge / Dipl. Pädagoge",
    "25": "Heilmittelerbringer: Sonstiger Sprachtherapeut",
    "26": "Heilmittelerbringer: Ergotherapeut",
    "27": "Heilmittelerbringer: Krankenhaus",
    "28": "Heilmittelerbringer: Kurbetrieb",
    "29": "Heilmittelerbringer: Sonstige therapeutische Heilperson",
    "71": "Podologen",
    "72": "Med. Fußpfleger (gemäß § 10 Abs. 4 bis 6 PodG)",
    "73": "Leistungserbringer von Ernährungstherapie für seltene angeborene Stoffwechselerkrankungen",
    "74": "Leistungserbringer von Ernährungstherapie für Mukoviszidose",
}
export type HeilmittelerbringerAbrechnungscodeSchluessel = keyof typeof heilmittelerbringerAbrechnungscodeSchluessel

export const haeuslicheKrankenpflegeAbrechnungscodeSchluessel = {
    "31": "Häusliche Krankenpflege: freigemeinnützige Anbieter (Sozialstation)",
    "32": "Häusliche Krankenpflege: privatgewerbliche Anbieter",
    "33": "Häusliche Krankenpflege: öffentliche Anbieter",
    "34": "Häusliche Krankenpflege: sonstige Pflegedienste",
}
export type HaeuslicheKrankenpflegeAbrechnungscodeSchluessel = keyof typeof haeuslicheKrankenpflegeAbrechnungscodeSchluessel

export const krankentransportleistungenAbrechnungscodeSchluessel = {
    "41": "Krankentransportleistungen: Öffentlicher Träger (z.B. Feuerwehr)",
    "42": "Krankentransportleistungen: Deutsches Rotes Kreuz (DRK)",
    "43": "Krankentransportleistungen: Arbeiter-Samariter-Bund (ASB)",
    "44": "Krankentransportleistungen: Johanniter-Unfall-Hilfe (JUH)",
    "45": "Krankentransportleistungen: Malteser-Hilfsdienst (MHD)",
    "46": "Krankentransportleistungen: Sonstiger Leistungserbringer von bodengebundenen Transportleistungen (Taxi / Mietwagen)",
    "47": "Krankentransportleistungen: Leistungserbringer von Flugrettungs-und Transportleistungen",
    "48": "Krankentransportleistungen: Privatgewerbliche Rettungsdienste",
    "49": "Krankentransportleistungen: Sonstiger Leistungserbringer von Krankentransportleistungen (z.B. Bergwacht, Wasserwacht, usw.)",
}
export type KrankentransportleistungenAbrechnungscodeSchluessel = keyof typeof krankentransportleistungenAbrechnungscodeSchluessel

export const hebammenAbrechnungscodeSchluessel = {
    "50": "Hebamme / Entbindungspfleger",
}
export type HebammenAbrechnungscodeSchluessel = keyof typeof hebammenAbrechnungscodeSchluessel

export const nichtaerztlicheDialyseleistungenAbrechnungscodeSchluessel = {
    "55": "Sonstiger Leistungserbringer von nichtärztlichen Dialysesachleistungen",
    "56": "Kuratorium für Heimdialyse (KfH)",
    "57": "Patienten-Heimversorgung (PHV)",
}
export type NichtaerztlicheDialyseleistungenAbrechnungscodeSchluessel = keyof typeof nichtaerztlicheDialyseleistungenAbrechnungscodeSchluessel

export const rehasportAbrechnungscodeSchluessel = {
    "61": "Leistungserbringer von Rehabilitationssport",
}
export type RehasportAbrechnungscodeSchluessel = keyof typeof rehasportAbrechnungscodeSchluessel

export const funktionstrainingAbrechnungscodeSchluessel = {
    "62": "Leistungserbringer von Funktionstraining",
}
export type FunktionstrainingAbrechnungscodeSchluessel = keyof typeof funktionstrainingAbrechnungscodeSchluessel

export const sonstigeAbrechnungscodeSchluessel = {
    "65": "Sonstige Leistungserbringer",
    "60": "Betriebshilfe",
}
export type SonstigeAbrechnungscodeSchluessel = keyof typeof sonstigeAbrechnungscodeSchluessel

export const praeventationAbrechnungscodeSchluessel = {
    "66": "Leistungserbringer von Präventions- und Gesundheitsförderungsmaßnahmen im Rahmen von ambulanten Vorsorgeleistungen",
}
export type PraeventationAbrechnungscodeSchluessel = keyof typeof praeventationAbrechnungscodeSchluessel

export const ergaenzendeRehaAbrechnungscodeSchluessel = {
    "63": "Leistungserbringer für ergänzende Rehabilitationsmaßnahmen",
    "67": "Ambulantes Rehazentrum / Mobile Rehabilationseinrichtung",
}
export type ErgaenzendeRehaAbrechnungscodeSchluessel = keyof typeof ergaenzendeRehaAbrechnungscodeSchluessel

export const sozialpaediatrikAbrechnungscodeSchluessel = {
    "68": "Sozialpädiatrische Zentren/Frühförderstellen",
}
export type SozialpaediatrikAbrechnungscodeSchluessel = keyof typeof sozialpaediatrikAbrechnungscodeSchluessel

export const sozioTherapeutikAbrechnungscodeSchluessel = {
    "69": "Soziotherapeutische Leistungserbringer",
}
export type SozioTherapeutikAbrechnungscodeSchluessel = keyof typeof sozioTherapeutikAbrechnungscodeSchluessel

export const sapvAbrechnungscodeSchluessel = {
    "75": "Spezialisierte ambulante Palliativversorgung (SAPV)",
}
export type SAPVAbrechnungscodeSchluessel = keyof typeof sapvAbrechnungscodeSchluessel

export const versorgungsplanungAbrechnungscodeSchluessel = {
    "76": "Leistungserbringer nach § 132g SGB V",
}
export type VersorgungsplanungAbrechnungscodeSchluessel = keyof typeof versorgungsplanungAbrechnungscodeSchluessel

export const kurzzeitpflegeAbrechnungscodeSchluessel = {
    "91": "Kurzzeitpflege: privat gewerblicher Anbieter",
    "92": "Kurzzeitpflege: frei gemeinnütziger Anbieter (gemeinnützige private Anbieter)",
    "93": "Kurzzeitpflege: öffentlicher Anbieter",
    "94": "Kurzzeitpflege: sonstige Pflegeeinrichtung"
}

export type KurzzeitpflegeAbrechnungscodeSchluessel = keyof typeof kurzzeitpflegeAbrechnungscodeSchluessel

/** Tarifkennzeichen: Tarifbereich (1-2 Stelle des Tarifkennzeichens) 
 * 
 *  documented in (a) 8.1.5.2
 */
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

/*  Tarifkennzeichen: Sondertarife (3. bis 5. Stelle des Tarifkennzeichens)
    documented in (a) 8.1.5.2

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

/** Summenstatus: Kennzeichnung der Endsumme je Status.
 * 
 *  The sums are to be grouped by Versichertenstatus. If the first number of the Versichertenstatus
 *  is 1, the key should be "11", if it is 3, it should be "31" etc. 
 * 
 *  See f.e. https://de.wikipedia.org/wiki/Versichertenstatus to see what information the 
 *  Versichertenstatus contains.
 * 
 *  documented in (a) 8.1.6
 */
 export const summenstatusSchluessel = {
    "00": "Gesamtsumme aller Status",
    "11": "Mitglieder (Versicherungspflichtige und -berechtigte)",
    "31": "Angehörige (Familienversicherte)",
    "51": "Rentner (und deren familienversicherten Angehörige)",
    "99": "nicht zuzuordnende Status"
}
export type SummenstatusSchluessel = keyof typeof summenstatusSchluessel

/** Verarbeitungskennzeichen für die Weiterverarbeitung der Nachricht.
 * 
 *  How the bill should be processed. The values 02, 03 and 04 can only be used after a bilateral 
 *  arangement is made, which makes these somewhat useless considering the number of entities (GKV) 
 *  involved
 * 
 *  documented in (a) 8.1.7 */
export const verarbeitungskennzeichenSchluessel = {
    "01": "Erstrechnung / Abrechnung ohne Besonderheiten",
    "02": "Nachforderung (z.B. Hausbesuch wurde bei der Erstrechnung versehentlich vergessen)",
    "03": "Zuzahlungsnachforderung",
    "04": "Korrekturrechnung / Einspruch nach Rechnungskürzung",
}
export type VerarbeitungskennzeichenSchluessel = keyof typeof verarbeitungskennzeichenSchluessel

/** Prüfvermerk 
 * 
 *  Reply to the health care service provider about settling the bill 
 *  
 *  documented in (a) 8.1.9
*/
export const pruefvermerkSchluessel = {
    "01": "Rechnungsbetrag wird bezahlt",
    "02": "Rechnung wird zurückgewiesen",
    "03": "Rechnungsbetrag wurde berichtigt",
    "04": "Rechnungsbetrag wurde gekürzt",
    "05": "Rechnung wird zur Zeit geprüft" 
}
export type PruefvermerkSchluessel = keyof typeof pruefvermerkSchluessel


/** Hilfsmittel-Kennzeichen
 *  
 *  documented in (a) 8.1.10
 */
export const hilfsmittelKennzeichenSchluessel = {
    /** Kauf/Erstlieferung: erstmalige Versorgung [Leistungsabgabe] mit einem neuen Hilfsmittel, 
     * z. B. erstmalige Versorgung mit einem Hörgerät */
    "00": "Neulieferung",
    /** Instandsetzung des vorhandenen Hilfsmittels/Austausch von Einzelteilen usw.; evtl auch 
     *  Pauschalbetrag für einmalige Reparatur */
    "01": "Reparatur",
    /** Lieferung eines im Wiedereinsatz befindlichen Hilfsmittels, ggf. inkl. erforderliche 
     *  Instandsetzung; für Instandsetzungen während der Nutzung gilt Kennzeichen 01 */
    "02": "Wiedereinsatz",
    "03": "Miete",
    /** Erneute Versorgung mit dem gleichen Hilfsmittel, Nachlieferung eines Produkts mit 
     *  identischer Hilfsmittelpositionsnummer */
    "04": "Nachlieferung",
    /** Anpassung von Hilfsmitteln an die spezifischen Anforderungen der Anwender; für 
     *  Instandsetzungen gilt Kennzeichen 01 */
    "05": "Zurichtung",
    /** z. B. Abgabe von Gleitsichtgläsern bei verordneten Bifokalgläsern */
    "06": "Abgabe eines von der Verordnung abweichenden höherwertigen Hilfsmittels",
    "07": "Arbeitszeit",
    /** Fall- und Versorgungspauschale */
    "08": "Vergütungspauschale",
    /** Erneute Abrechnung desselben Hilfsmittels für einen weiteren Gewährleistungs-/Versorgungszeitraum */
    "09": "Folgevergütungspauschale",
    /** Erneute Abrechnung desselben Hilfsmittels für einen weiteren Gewährleistungs-/Versorgungszeitraum */
    "10": "Folgeversorgung",
    /** Erneute Versorgung mit dem gleichen Hilfsmittel innerhalb eines bestimmten Zeitraums, z.B. 
     *  bei Verlust eines Hörgeräts */
    "11": "Ersatzbeschaffung",
    /** Zurüstung des Hilfsmittels an die spezifischen Anforderungen des Anwenders */
    "12": "Zubehör",
    /** Pauschale Abgeltung der Reparaturkosten während eines vereinbarten Zeitraums */
    "13": "Reparaturpauschale",
    /** Wartung bzw. Pflege/Überprüfung des vorhandenen Hilfsmittels; 
     *  evtl. auch Pauschalbetrag für einmalige Wartung */
    "14": "Wartung",
    /** Pauschale Abgeltung der Wartungskosten während eines vereinbarten Zeitraums */
    "15": "Wartungspauschale",
    /** gesonderte [ggf. pauschale] Vergütung der Auslieferung */
    "16": "Auslieferung",
    /** gesonderte [ggf. pauschale] Vergütung der Aussonderung */
    "17": "Aussonderung",
    /** gesonderte [ggf. pauschale] Vergütung der Rückholung */
    "18": "Rückholung",
    /** gesonderte [ggf. pauschale] Vergütung des Abbruchs */
    "19": "Abbruch",
    /** gesonderte [ggf. pauschale] Vergütung der Erprobung */
    "20": "Erprobung"
}
export type HilfsmittelKennzeichenSchluessel = keyof typeof hilfsmittelKennzeichenSchluessel


/** Verordnungsbesonderheiten
 * 
 *  In which frame the prescription was made
 * 
 *  documented in (a) 8.1.11
 */
export const verordnungsbesonderheitenSchluessel = {
    "1": "Verordnung von einem Zahnarzt/Kieferorthopäden",
    "2": "Verordnung im Zusammenhang mit der Schwangerschaft oder der Entbindung",
    "4": "Verordnung im Rahmen des Entlassmanagements",
    "7": "Verordnung im Rahmen der Terminservicestellen"
}
export type VerordnungsbesonderheitenSchluessel = keyof typeof verordnungsbesonderheitenSchluessel


/** Verordnungsart bei Heilmitteln
 *  
 *  type of therapy prescription
 * 
 *  documented in (a) 8.1.12
 */
export const heilmittelVerordnungsartSchluessel = {
    "03": "Verordnung nach § 7 Abs. 1 bis 5 HeilM-RL bzw. § 6 Abs. 1 bis 4 HeilM-RL Zahnärzte (orientierender Behandlungsmenge gemäß Heilmittelkatalog)",
    "04": "Verordnung nach § 7 Abs. 6 HeilM-RL bzw. § 6 Abs. 5 HeilM-RL Zahnärzte (besonderer Verordnungsbedarf oder langfristiger Heilmittelbedarf bis zu 12 Wochen)",
    "05": "Verordnung nach § 13a HeilM-RL bzw. § 12 HeilM-RL Zahnärzte (Blankoverordnung)"
}
export type HeilmittelVerordnungsartSchluessel = keyof typeof heilmittelVerordnungsartSchluessel

/** Zuzahlungsart: Kennzeichnung welche Art der gesetzlichen Zuzahlung abgerechnet wurde 
 * 
 *  documented in (a) 8.1.13
 */
export const zuzahlungsartSchluessel = {
    "01": "Prozentuale Zuzahlung gemäß § 61 Satz 1 SGB V",
    /** minimale bzw. maximale Zuzahlung bzw. Kosten der Leistung)
     * 
     * Sollte die prozentuale Zuzahlung nicht greifen, ist der gesetzliche maximale Zuzahlungsbetrag
     * oder der Mindestzuzahlungsbetrag, allerdigs nicht mehr als die Kosten der Leistung anzugeben.
     */
    "02": "Zuzahlungsgrenzbetrag",
    "03": "Prozentuale Zuzahlung für den Verbrauchszeitraum gem. § 33 Abs. 2 Satz 4, letzter Halbsatz SGB V, falls das Hilfsmittel zum Verbrauch bestimmt ist",
    "04": "Maximaler Zuzahlungsbetrag für den Verbrauchszeitraum gem. § 33 Abs. 2, Satz 4, letzter Halbsatz SGB V, falls das Hilfsmittel zum Verbrauch bestimmt ist"
}
export type ZuzahlungsartSchluessel = keyof typeof zuzahlungsartSchluessel

/** Leistungserbringer-Sammelgruppenschlüssel 
 * 
 *  documented in (a) 8.1.14 */
 export const leistungserbringerSammelgruppenSchluessel = {
    "A": "Leistungserbringer von Hilfsmitteln",
    "B": "Leistungserbringer von Heilmitteln",
    "C": "Leistungserbringer von häuslicher Krankenpflege",
    "D": "Leistungserbringer von Haushaltshilfe",
    "E": "Leistungserbringer von Krankentransportleistungen",
    "F": "Hebammen",
    "G": "nichtärztliche Dialysesachleistungen",
    "H": "Leistungserbringer von Rehabilitationssport",
    "I": "Leistungserbringer von Funktionstraining",
    "J": "Weitere Sonstige Leistungserbringer, sofern nicht unter A - I und K - O aufgeführt",
    "K": "Leistungserbringer von Präventions- und Gesundheitsförderungsmaßnahmen im Rahmen von ambulanten Vorsorgeleistungen",
    "L": "Leistungserbringer für ergänzende Rehamaßnahmen",
    "M": "Sozialpädiatrische Zentren/Frühförderstellen",
    "N": "Soziotherapeutischer Leistungserbringer",
    "O": "SAPV",
    "P": "Leistungserbringer nach § 132g SGB V",
    "Q": "Kurzzeitpflege",
}
export type LeistungserbringerSammelgruppenSchluessel = keyof typeof leistungserbringerSammelgruppenSchluessel

// because the two are almost identical
export const haeuslicheLeistungserbringerSammelgruppenSchluessel = {
    "C": "Leistungserbringer von häuslicher Krankenpflege",
    "D": "Leistungserbringer von Haushaltshilfe",
}
export type HaeuslicheLeistungserbringerSammelgruppenSchluessel = keyof typeof haeuslicheLeistungserbringerSammelgruppenSchluessel

const leistungserbringerSammelgruppenschluesselToEinzelSchluessel = 
    new Map<LeistungserbringerSammelgruppenSchluessel, string[]>([
        ["A", Object.keys(hilfsmittellieferantAbrechnungscodeSchluessel)],
        ["B", Object.keys(heilmittelerbringerAbrechnungscodeSchluessel)],
        ["C", Object.keys(haeuslicheKrankenpflegeAbrechnungscodeSchluessel)],
        ["D", Object.keys(haeuslicheKrankenpflegeAbrechnungscodeSchluessel)],
        ["E", Object.keys(krankentransportleistungenAbrechnungscodeSchluessel)],
        ["F", Object.keys(hebammenAbrechnungscodeSchluessel)],
        ["G", Object.keys(nichtaerztlicheDialyseleistungenAbrechnungscodeSchluessel)],
        ["H", Object.keys(rehasportAbrechnungscodeSchluessel)],
        ["I", Object.keys(funktionstrainingAbrechnungscodeSchluessel)],
        ["J", Object.keys(sonstigeAbrechnungscodeSchluessel)],
        ["K", Object.keys(praeventationAbrechnungscodeSchluessel)],
        ["L", Object.keys(ergaenzendeRehaAbrechnungscodeSchluessel)],
        ["M", Object.keys(sozialpaediatrikAbrechnungscodeSchluessel)],
        ["N", Object.keys(sozioTherapeutikAbrechnungscodeSchluessel)],
        ["O", Object.keys(sapvAbrechnungscodeSchluessel)],
        ["P", Object.keys(versorgungsplanungAbrechnungscodeSchluessel)],
        ["Q", Object.keys(kurzzeitpflegeAbrechnungscodeSchluessel)]
    ])


/** Get all AbrechnungscodeEinzelschluessel that are allocated to the given 
 *  LeistungserbringerSammelgruppenSchluessel */
 export function getAbrechnungscodeEinzelschluesselByLeistungserbringerSammelgruppenSchluessel(
    schluessel: LeistungserbringerSammelgruppenSchluessel
): AbrechnungscodeEinzelschluessel[] {
    return leistungserbringerSammelgruppenschluesselToEinzelSchluessel.get(schluessel)! as AbrechnungscodeEinzelschluessel[]
}

/** Get the LeistungserbringerSammelgruppenSchluessel the given AbrechnungscodeEinzelschluessel is 
 * allocated to. Returns undefined if it isn't allocated to any particular group */
export function getLeistungserbringerSammelgruppenSchluesselByAbrechnungscodeEinzelschluessel(
    schluessel: AbrechnungscodeEinzelschluessel
): LeistungserbringerSammelgruppenSchluessel | undefined {
    for(const [leistungserbringerSammelgruppenSchluessel, einzelschluesselArray]
        of leistungserbringerSammelgruppenschluesselToEinzelSchluessel.entries()
    ) {
        if (einzelschluesselArray.includes(schluessel)) {
            return leistungserbringerSammelgruppenSchluessel
        }
    }
}


/** Anwendungsort
 * 
 *  documented in (a) 8.1.15
 */
export const anwendungsortSchluessel = {
    "0": "Links",
    "1": "Rechts",
    "2": "beidseitig"
}
export type AnwendungsortSchluessel = keyof typeof anwendungsortSchluessel

/** Geburtsdatum 
 * 
 *  documented in (a) 8.1.16
*/

export const geburtsdatumSchluessel = {
    "1": "tatsächliches Geburtsdatum",
    "2": "errechnetes (mutmaßliches) Geburtsdatum"
}
export type GeburtsdatumSchluessel = keyof typeof geburtsdatumSchluessel

/** Art der Genehmigung
 * 
 *  usually referring to a "Kostenzusage"
 * 
 *  documented in (a) 8.1.17
 */
export const kostenzusageGenehmigung = {
    "A1": "Bereich Hilfsmittel: Genehmigung im Einzelfall",
    "A2": "Bereich Hilfsmittel: Langfristige Genehmigung",

    "B2": "Bereich Heilmittel: Genehmigung gem. § 8 Abs. 3 Heilmittel-Richtlinie Ärzte bzw. § 7 Abs. 1 Heilmittel-Richtlinie Zahnärzte (Genehmigung eines langfristigen Heilmittelbedarfs)",

    "C1": "Bereich Häusliche Krankenpflege: Genehmigung im Einzelfall",
    "C2": "Bereich Häusliche Krankenpflege: Leistungserbringung im Rahmen der Regelungen der vorläufigen Kostenzusage nach § 6 Abs. 6 der Richtlinie des G-BA nach § 92 Abs. 1 Satz 2 Nr. 6 i.V.m. Abs. 7 SGB V",

    "D1": "Bereich Haushaltshilfe: Genehmigung im Einzelfall",

    "E1": "Bereich Krankentransportleistungen: Genehmigung im Einzelfall",
    "E2": "Bereich Krankentransportleistungen: Langfristige Genehmigung",

    "F1": "Bereich Hebammen: Genehmigung im Einzelfall",

    "G1": "Bereich nichtärztliche Dialysesachleistungen: Genehmigung im Einzelfall",

    "H1": "Bereich Rehabilitationssport: Genehmigung im Einzelfall",

    "I1": "Bereich Funktionstraining: Genehmigung im Einzelfall",

    "J1": "Bereich Weitere Sonstige Leistungserbringer: Genehmigung im Einzelfall",

    "K1": "Bereich Präventions- und Gesundheitsförderungsmaßnahmen: Genehmigung im Einzelfall",

    "L1": "Bereich ergänzende Rehamaßnahmen: Genehmigung im Einzelfall",

    "M1": "Bereich Sozialpädiatrische Zentren/Frühförderstellen: Genehmigung im Einzelfall",

    "N1": "Bereich Soziotherapeutischer Leistungserbringer: Genehmigung im Einzelfall",

    "O1": "Bereich SAPV: Genehmigung im Einzelfall",

    "Q1": "Bereich Kurzzeitpflege: Genehmigung im Einzelfall",
}
export type KostenzusageGenehmigung = keyof typeof kostenzusageGenehmigung


/** Beleginformation
 * 
 *  If or how receipts for the bill have been transmitted. In the documentation, it is stated that 
 *  key 2 will only be used with comprehensive electronic data processing.
 * 
 *  documented in (a) 8.1.18
 */
export const beleginformationSchluessel = {
    "0": "keine Belegübermittlung zum Fall",
    "1": "Belege zum Fall per Post übermittelt",
    "2": "Belege zum Fall elektronisch (z.B. Image) übermittelt"
}
export type BeleginformationSchluessel = keyof typeof beleginformationSchluessel


/** Heilmittelpositionsnummer
 * 
 *  Stelle 1      Leistungserbringer
 *  Stelle 2 - 3  Leistungsart
 *  Stelle 4 - 5  einzelne Leistung
 * 
 *  documented in (a) 8.2.1
 * 
 */

/** Hilfsmittelpositionsnummer
 * 
 * Stelle 1 - 2  Produktgruppe 
 * Stelle 3 - 4  Anwendungsort 
 * Stelle 5 - 6  Untergruppe 
 * Stelle 7      Produktart 
 * Stelle 8 - 10 Produkt 
 * 
 * Use "900" for 8 - 10 if product is not in Hilfsmittelverzeichnis (yet)
 * 
 * documented in (a) 8.2.2
 */

/** Abrechnungspositionsnummer für Leistungen der häuslichen Krankenpflege und Haushaltshilfe 
 * 
 *  Stelle 1 - 2  Gesetzliche Leistungsgrundlage
 *  Stelle 3      Art der Versorgung
 *  Stelle 4 - 6  Art der Leistung
 * 
 *  documented in (a) 8.2.4
 * 
 */

/** Abrechnungspositionsnummer für Krankentransportleistungen 
 * 
 *  Stelle 1      Verordnungsart 
 *  Stelle 2      Transportart 
 *  Stelle 3 - 4  Tarifart 
 *  Stelle 5 - 6  Ausprägungen 
 * 
 *  documented in (a) 8.2.5
 */

/** Abrechnungspositionsnummer für sonstige Leistungen 
 * 
 *  Stelle 1 - 2   Art der Einrichtung 
 *  Stelle 3 - 4   Behandlungsart 
 *  Stelle 5 - 7   Vergütungsart 
 * 
 *  documented in (a) 8.2.10
 * 
 */

/**  Abrechnungspositionsnummer für die Spezialisierte Ambulante Palliativversorgung (SAPV) 
 * 
 *  Stelle 1 - 2   Ort der Leistungserbringung (Versorgung Patient)
 *  Stelle 3 - 4   Art der Leistung
 *  Stelle 5 - 6   Leistungen (verordnete Maßnahmen) 
 *  Stelle 7 - 10  Art der Vergütung
 * 
 *  documented in (a) 8.2.11
 * 
 */

/** Abrechnungspositionsnummer für Kurzzeitpflege
 * 
 *  Stelle 1 - 2   Leistungsgrundlage 
 *  Stelle 3 - 4   Vergütungsart 
 *  Stelle 5       Qualifikationsabhängige Vergütung 
 *  Stelle 6 - 7  Vergütungsart 
 * 
 *  documented in (a) 8.2.12
 */

/** Positionsnummer für Produktbesonderheiten von Hilfsmitteln
 * 
 *  Stelle 1 - 2  Produktbesonderheit Größe 
 *  Stelle 3 - 4  Produktbesonderheit Menge 
 *  Stelle 5 - 6  weitere Produktbesonderheit 
 *  Stelle 7      weitere Produktbesonderheit 
 *  Stelle 8      weitere Produktbesonderheit 
 *  Stelle 9      weitere Produktbesonderheit 
 *  Stelle 10     weitere Produktbesonderheit 
 * 
 *  Apparently the exact values of Größe, Menge and the rest are to be defined by each health
 *  insurance individually, there are no common values.
 * 
 *  documented in (a) 8.3
 */

/** Heilmittel-Bereich as seen on Muster 13: Heilmittelverordnung.
 * 
 *  documented in-place in Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle 
 *  Abrechnung for segment "ZHE" in 5.5.3.3 SLLA: B (Heilmittel) - page 70
 */
export const heilmittelBereichSchluessel = {
    "1": "Physiotherapie",
    "2": "Podologische Therapie",
    "3": "Stimm-, Sprech-, Sprach- und Schlucktherapie",
    "4": "Ergotherapie",
    "5": "Ernährungstherapie" 
}
export type HeilmittelBereichSchluessel = keyof typeof heilmittelBereichSchluessel


// Groups ------------------------------------------------------------------------------------------


/** Gruppensschlüssel Abrechnungscode für Leistungen nach § 302 Abs. 2 SGB V
 * 
 *  These keys are used in the Kostenträger files for f.e. denote that an institution accepts 
 *  receipts for all services belonging to given group
 * 
 *  documented in (b) 8.14
 */
 export const abrechnungscodeGruppenschluessel = {
    "10": "Gruppenschlüssel Hilfsmittellieferant (Schlüssel 11-19)",
    "20": "Gruppenschlüssel Heilmittelerbringer (Schlüssel 21-29)",
    "30": "Gruppenschlüssel Häusliche Krankenpflege (Schlüssel 31-34)",
    "40": "Gruppenschlüssel Krankentransportleistungen (Schlüssel 41-49)",
    "90": "Gruppenschlüssel Kurzzeitpflege (Schlüssel 91-94)"
}
export type AbrechnungscodeGruppenschluessel = keyof typeof abrechnungscodeGruppenschluessel

/** Gruppensschlüssel + Einzelschlüssel für Leistungen nach § 302 Abs. 2 SGB V
 * 
 *  Outside of Kostenträger file parsing and filtering logic, this is probably not used, see 
 *  AbrechnungscodeEinzelschluessel instead
 */
export const abrechnungscodeSchluessel = { 
    ...abrechnungscodeGruppenschluessel,
    ...hilfsmittellieferantAbrechnungscodeSchluessel,
    ...heilmittelerbringerAbrechnungscodeSchluessel,
    ...haeuslicheKrankenpflegeAbrechnungscodeSchluessel,
    ...krankentransportleistungenAbrechnungscodeSchluessel,
    ...hebammenAbrechnungscodeSchluessel,
    ...nichtaerztlicheDialyseleistungenAbrechnungscodeSchluessel,
    ...rehasportAbrechnungscodeSchluessel,
    ...funktionstrainingAbrechnungscodeSchluessel,
    ...sonstigeAbrechnungscodeSchluessel,
    ...praeventationAbrechnungscodeSchluessel,
    ...ergaenzendeRehaAbrechnungscodeSchluessel,
    ...sozialpaediatrikAbrechnungscodeSchluessel,
    ...sozioTherapeutikAbrechnungscodeSchluessel,
    ...sapvAbrechnungscodeSchluessel,
    ...versorgungsplanungAbrechnungscodeSchluessel,
    ...kurzzeitpflegeAbrechnungscodeSchluessel
}

export type AbrechnungscodeSchluessel = keyof typeof abrechnungscodeSchluessel

const gruppenschluesselToEinzelSchluessel = 
    new Map<AbrechnungscodeGruppenschluessel, AbrechnungscodeEinzelschluessel[]>([
        ["10", ["11","12","13","14","15","16","17","18","19"]],
        ["20", ["21","22","23","24","25","26","27","28","29"]],
        ["30", ["31","32","33","34"]],
        ["40", ["41","42","43","44","45","46","47","49"]],
        ["90", ["91", "92", "93", "94"]]
    ])

/** Get all AbrechnungscodeEinzelschluessel that are allocated to the given 
 *  AbrechnungscodeGruppenSchluessel */
export function getAbrechnungscodeEinzelschluessel(schluessel: AbrechnungscodeGruppenschluessel): AbrechnungscodeEinzelschluessel[] {
    return gruppenschluesselToEinzelSchluessel.get(schluessel)!
}

/** Get the AbrechnungscodeGruppenSchluessel the given AbrechnungscodeEinzelschluessel is allocated
 *  to. Returns undefined if it isn't allocated to any particular group */
export function getAbrechnungscodeGruppenschluessel(schluessel: AbrechnungscodeEinzelschluessel): AbrechnungscodeGruppenschluessel | undefined {
    for(const [gruppenschluessel, einzelschluesselArray] of gruppenschluesselToEinzelSchluessel.entries()) {
        if (einzelschluesselArray.includes(schluessel)) {
            return gruppenschluessel
        }
    }
}

