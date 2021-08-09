/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import { 
    AbrechnungscodeSchluessel,
    PflegegradSchluessel, 
    RechnungsartSchluessel, 
    TarifbereichSchluessel, 
    LeistungsartSchluessel, 
    UmsatzsteuerBefreiungSchluessel,
    QualifikationsabhaengigeVerguetungSchluessel,
    VerguetungsartSchluessel,
    ZuschlagsartSchluessel,
    ZuschlagsberechnungSchluessel,
    ZuschlagSchluessel,
    ZuschlagszuordnungSchluessel,
    MehrwertsteuerSchluessel,
    PflegehilfsmittelSchluessel,
} from "./sgb-xi/codes";

export const messageIdentifiers = {
    "PLGA": "Pflegeleistungserbringer Gesamtaufstellung der Abrechnung",
    "PLAA": "Pflegeleistungserbringer Abrechnungsdaten je Abrechnungsfall",
}
export const messageIdentifierVersions = {
    "PLGA": "PLGA:2",
    "PLAA": "PLAA:3",
}
export type MessageIdentifiers = keyof typeof messageIdentifiers;

export const fileTypes = {
    "0": "Testdatei",
    "1": "Erprobungsdatei",
    "2": "Echtdatei",
}
export type FileType = keyof typeof fileTypes;

export type BillingData = {
    datenaustauschreferenzJeEmpfaengerIK: Record<string, number>;
    dateiindikator: FileType;
    rechnungsart: RechnungsartSchluessel;
    rechnungsnummerprefix: string;
    rechnungsdatum?: Date;
    abrechnungsmonat: Date;
    korrekturlieferung?: number;
    abrechnungsstelle?: Institution;
    laufendeDatenannahmeImJahrJeEmpfaengerIK: Record<string, number>;
}

export type BillingFile = {
    dateiname: string;
    absenderIK: string;
    empfaengerIK: string;
    datenaustauschreferenz: number;
    anwendungsreferenz: string;
    dateiindikator: string;
    nutzdaten: string;
    rechnungsbetrag: number;
}

export type Invoice = {
    leistungserbringer: Leistungserbringer;
    faelle: Abrechnungsfall[];
};

export type Institution = {
    name: string;
    ik: string;
    ansprechpartner: {
        name: string;
        phone?: string;
    }[];
};

export type Leistungserbringer = Institution & {
    abrechnungscode: AbrechnungscodeSchluessel;
    tarifbereich: TarifbereichSchluessel;
    sondertarifJeKostentraegerIK: Record<string, string>;
    umsatzsteuerBefreiung: UmsatzsteuerBefreiungSchluessel;
    umsatzsteuerOrdnungsnummer?: string;
};

export type Abrechnungsfall = {
    versicherter: Versicherter;
    einsaetze: Einsatz[];
}

export type Versicherter = {
    pflegekasseIK: string;
    kostentraegerIK: string;
    versichertennummer: string;
    pflegegrad: PflegegradSchluessel;
    firstName: string;
    lastName: string;
    birthday: Date;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
};

export type Einsatz = {
    leistungsBeginn?: Date;
    leistungen: Leistung[];
};

export type Leistung = {
    leistungsart: LeistungsartSchluessel;
    verguetungsart: VerguetungsartSchluessel;
    qualifikationsabhaengigeVerguetung: QualifikationsabhaengigeVerguetungSchluessel,
    leistung: string,
    einzelpreis: number,
    anzahl: number,
    leistungsBeginn?: Date,
    leistungsEnde?: Date, // for verguetungsart 01, 02, 03, 04
    gefahreneKilometer?: number, // for verguetungsart 06 with leistung 04
    punktwert?: number,
    punktzahl?: number,
    zuschlaege: Zuschlag[];
    hilfsmittel?: Hilfsmittel;
};

export type Zuschlag = {
    zuschlagsart: ZuschlagsartSchluessel;
    zuschlag: ZuschlagSchluessel;
    beschreibungZuschlagsart?: string;
    zuschlagszuordnung: ZuschlagszuordnungSchluessel;
    zuschlagsberechnung: ZuschlagsberechnungSchluessel;
    istAbzugStattZuschlag: boolean;
    /** value for the surcharge. The meaning of this value depends on the 
     *  ZuschlagsberechnungSchluessel given: It could be the Punktzahl (score), a Betrag (amount, in
     *  Euro) or a Prozentsatz (percentage). 
     * 
     *  For example, if it is 42,12%, the value specified here will be 42.12. This was not clear
     *  from the docs, but we asked GKV-Spitzenverband and they clarified that:
     * 
     *  > Der Prozentsatz wird als Zahl ohne Prozent-Zeichen angegeben, z. B. „10“ für 10 %.
     *  */
    wert: number;
};

export type Hilfsmittel = {
    mehrwertsteuerart?: MehrwertsteuerSchluessel;
    zuzahlungsbetrag?: number; // gem. § 40 SGB XI
    genehmigungskennzeichen?: string;
    genehmigungsdatum?: Date;
    kennzeichenPflegehilfsmittel?: PflegehilfsmittelSchluessel;
    bezeichnungPflegehilfsmittel?: string;
    /** Positionsnummer für Produktbesonderheiten von Pflegehilfsmitteln 
     *  
     *  This 1-10 digit number must be specified if it is specified that way in the respective 
     *  service and supply contracts.
     * 
     *  We asked the GKV-Spitzenverband about whether any numbers are known and documented. They
     *  replied that there is no directory of such service and supply contracts for 
     *  Produktbesonderheiten made by the different GKV. And thus, they assume that this field is to
     *  be filled in by each Leistungserbringer individually depending on their invididual contract(s)
     * 
     *  > Die Angabe von „besonderen Positionsnummern für Produktbesonderheiten“ ist in diesen 
     *  > [vom GKV Spitzenverband geschlossenen] Verträgen nicht vorgesehen. Die Regelungen in den 
     *  > Pflegehilfsmittelverträgen, die die Pflegekassen z.B. zur Versorgung mit Pflegebetten 
     *  > geschlossen haben, sind uns nicht bekannt. Ein Verzeichnis der vertraglich vereinbarten 
     *  > Produktbesonderheiten bei Pflegehilfsmitteln liegt uns nicht vor. Wir gehen davon aus, 
     *  > dass die Angabe der Hilfsmittelpositionsnummern für Produktbesonderheiten durch den 
     *  > Leistungserbringer vertragsabhängig als manuelle Eingabe erfolgen muss.
    */
    produktbesonderheitenPflegehilfsmittel?: string;
    inventarnummerPflegehilfsmittel?: string;
};

export type Amounts = {
    gesamtbruttobetrag: number, // = rechnungsbetrag + zuzahlungsbetrag + beihilfebetrag + mwst
    rechnungsbetrag: number, // max. bis zum Höchstleistungsanspruch
    zuzahlungsbetrag: number, // bei Pflegehilfsmitteln oder wenn Bruttobetrag über Höchstleistungsanspruch liegt
    beihilfebetrag: number, // gem. §28 Abs. 2 SGB XI
    mehrwertsteuerbetrag: number,
};
