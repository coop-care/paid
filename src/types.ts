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

export type Transmission = {
    senderID: string; // "IK Absender" // Question: = rechnungsstellerIK = absenderIK?
    receiverID: string; // "IK Empfänger" // Question: = kostentraegerIK = insuranceID?
    interchangeControlReference: number; // Datenaustauschreferenz
    filename: string;
    fileType: FileType;
    messages: Message[];
}

export type Message = {
    invoice: {
        referenceNumber: string;
        kostentraegerIK: string; // "IK Kostenträger" // Question: = receiverID = pflegekasseIK?
        leistungsart: LeistungsartSchluessel;
    },
    careProvider: {
        rechnungsstellerIK: string; // "IK Leistungserbringer (oder Abrechnungsstelle mit Inkassovollmacht)"
        rechnungsart: RechnungsartSchluessel;
        abrechnungscode: AbrechnungscodeSchluessel;
        tarifbereich: TarifbereichSchluessel;
        umsatzsteuerbefreiung: UmsatzsteuerBefreiungSchluessel;
    },
    clients: Versicherter[]
};

export type Versicherter = {
    pflegekasseIK: string;
    versichertennummer: string;
    pflegegrad: PflegegradSchluessel;
    eindeutigeBelegnummer: string;
    abrechnungsMonate: Abrechnungsmonat[];
};

export type Abrechnungsmonat = {
    monat: Date;
    einsaetze: Einsatz[];
};

export type Einsatz = {
    leistungsBeginn: Date;
    verguetungsart: VerguetungsartSchluessel;
    leistungen: Leistung[];
};

export type Leistung = {
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
    hilfsmittel?: {
        mehrwertsteuerart: MehrwertsteuerSchluessel;
        mehrwertsteuerbetrag?: number;
        zuzahlungsbetrag?: number;
        genehmigungskennzeichen: string;
        genehmigungsdatum?: Date;
        kennzeichenPflegehilfsmittel: PflegehilfsmittelSchluessel;
        bezeichnungPflegehilfsmittel: string;
        produktbesonderheitenPflegehilfsmittel: string;
        inventarnummerPflegehilfsmittel: string;
    }
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
