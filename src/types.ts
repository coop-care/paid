/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import { 
    RechnungsartSchluessel
} from "./codes";
import { LaenderkennzeichenSchluessel } from "./country_codes";
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
    "SLGA": "SLGA:16:0:0",
    "SLLA": "SLLA:16:0:0"
}
export type MessageIdentifiers = keyof typeof messageIdentifiers;

export const testIndicator = {
    "0": "Testdatei",
    "1": "Erprobungsdatei",
    "2": "Echtdatei",
}
export type TestIndicator = keyof typeof testIndicator;

export type BillingData = {
    datenaustauschreferenzJeEmpfaengerIK: Record<string, number>;
    testIndicator: TestIndicator;
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
    ansprechpartner: Ansprechpartner[];
    email?: string;
};

export type Ansprechpartner = {
    name: string;
    phone?: string;
}

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
    pflegekasseIK: string
    kostentraegerIK: string
    versichertennummer?: string
    pflegegrad: PflegegradSchluessel
    firstName: string
    lastName: string
    birthday: Date
    /** Mandatory if the versichertennummer or versichertenstatus is not known */
    address?: Address
};

export type Address = {
    /** street + housenumber longer than 30 characters (SGB V) will be cut off.
     *  For SGB XI, streets longer than 46 characters will be cut off. */
    street: string
    /** housenumbers longer than 9 characters will be cut off (SGB XI) */
    houseNumber: string
    /** Strings longer than 7 characters (SGB V) or 10 characters (SGB XI) will be cut off. */
    postalCode: string
    /** Strings longer than 25 characters (SGB V) or 40 characters (SGB XI) will be cut off. */
    city: string
    /** to be specified if the country is not Germany. */
    countryCode?: LaenderkennzeichenSchluessel
}

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
