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
    "PLGA:2": "Pflegeleistungserbringer Gesamtaufstellung der Abrechnung",
    "PLAA:3": "Pflegeleistungserbringer Abrechnungsdaten je Abrechnungsfall"
}
export type MessageIdentifiers = keyof typeof messageIdentifiers;

export const fileTypes = {
    "0": "Testdatei",
    "1": "Erprobungsdatei",
    "2": "Echtdatei",
}
export type FileType = keyof typeof fileTypes;

export type BillingData = {
    senderID: string;
    receiverID: string;
    controlReference: number; // Datenaustauschreferenz
    filename: string;
    fileType: FileType;
    rechnungsart: RechnungsartSchluessel;
    invoices: Invoice[];
}

export type Invoice = {
    referencePrefix: string;
    referenceNumber: number;
    date?: Date;
    careProvider: CareProvider;
    lineItems: Abrechnungsfall[];
};

export type CareProvider = {
    name: string;
    ansprechpartner: {
        name?: string;
        phone?: string;
    }[];
    // Leistungserbringer, der selbst abrechnet (Rechnungsart 1), 
    // oder Abrechnungsstelle (Rechnungsart 2 + 3):
    absenderIK: string;
    // Leistungserbringer (Rechnungsart 1 + 2),
    // oder Abrechnungsstelle mit Inkasssovollmacht (Rechnungsart 3).
    // Hinweis: absenderIK und rechnungsstellerIK sind bei Rechnungsart 1 + 3 identisch.
    rechnungsstellerIK: string;
    abrechnungscode: AbrechnungscodeSchluessel;
    tarifbereich: TarifbereichSchluessel;
    umsatzsteuerBefreiung: UmsatzsteuerBefreiungSchluessel;
    umsatzsteuerOrdnungsnummer?: string;
};

export type Abrechnungsfall = {
    versicherter: Versicherter;
    eindeutigeBelegnummer: string;
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
    leistungsBeginn: Date;
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
    zusaetze: Zusatz[];
    hilfsmittel?: Hilfsmittel;
};

export type Zusatz = {
    zuschlagsart: ZuschlagsartSchluessel;
    beschreibungZuschlagsart?: string;
    zuschlag: ZuschlagSchluessel;
    zuschlagszuordnung: ZuschlagszuordnungSchluessel;
    zuschlagsberechnung: ZuschlagsberechnungSchluessel;
    istAbzugStattZuschlag: boolean;
    wert: number;
};

export type Hilfsmittel = {
    mehrwertsteuerart: MehrwertsteuerSchluessel;
    mehrwertsteuerbetrag?: number;
    zuzahlungsbetrag?: number;
    genehmigungskennzeichen: string;
    genehmigungsdatum?: Date;
    kennzeichenPflegehilfsmittel: PflegehilfsmittelSchluessel;
    bezeichnungPflegehilfsmittel: string;
    produktbesonderheitenPflegehilfsmittel: string;
    inventarnummerPflegehilfsmittel: string;
};

export type Amounts = {
    gesamtbruttobetrag: number, // = rechnungsbetrag + zuzahlungsbetrag + beihilfebetrag + mwst
    rechnungsbetrag: number, // max. bis zum Höchstleistungsanspruch
    zuzahlungsbetrag: number, // bei Pflegehilfsmitteln oder wenn Bruttobetrag über Höchstleistungsanspruch liegt
    beihilfebetrag: number, // gem. §28 Abs. 2 SGB XI
    mehrwertsteuerbetrag: number,
};
