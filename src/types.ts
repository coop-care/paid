/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import { 
    RechnungsartSchluessel
} from "./codes";
import { 
    AbrechnungscodeSchluessel,
    PflegegradSchluessel, 
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
    "SLGA": "Sonstige Leistungserbringer Gesamtaufstellung der Abrechnung",
    "SLLA": "Sonstige Leistungserbringer Abrechnungsdaten je Abrechnungsfall",
}
export const messageIdentifierVersions = {
    "PLGA": "PLGA:2",
    "PLAA": "PLAA:3",
    "SLGA": "SLGA:15:0:0",
    "SLLA": "SLLA:15:0:0"
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
    /** An ascending number indicating a correction of an earlier version of this same bill.
     *  0 or undefined if this is not a correction. */
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
    wert: number;
};

export type Hilfsmittel = {
    mehrwertsteuerart?: MehrwertsteuerSchluessel;
    zuzahlungsbetrag?: number; // gem. § 40 SGB XI
    genehmigungskennzeichen?: string;
    genehmigungsdatum?: Date;
    kennzeichenPflegehilfsmittel?: PflegehilfsmittelSchluessel;
    bezeichnungPflegehilfsmittel?: string;
    produktbesonderheitenPflegehilfsmittel?: string; // siehe Schlüssel Positionsnummer für Produktbesonderheiten von Pflegehilfsmitteln Anlage 3, Abschnitt 2.12
    inventarnummerPflegehilfsmittel?: string;
};

export type Amounts = {
    gesamtbruttobetrag: number, // = rechnungsbetrag + zuzahlungsbetrag + beihilfebetrag + mwst
    rechnungsbetrag: number, // max. bis zum Höchstleistungsanspruch
    zuzahlungsbetrag: number, // bei Pflegehilfsmitteln oder wenn Bruttobetrag über Höchstleistungsanspruch liegt
    beihilfebetrag: number, // gem. §28 Abs. 2 SGB XI
    mehrwertsteuerbetrag: number,
};
