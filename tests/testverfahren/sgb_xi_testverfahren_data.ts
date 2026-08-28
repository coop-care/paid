import { Invoice, Abrechnungsfall, Einsatz, Leistung, Zuschlag, Leistungserbringer } from "../../src/sgb-xi/types";
import { BillingData, Address, Institution, Versicherter } from "../../src/types";

// Care Provider
export const testLeistungserbringer: Leistungserbringer = {
    name: "Fiktiver ambulanter Pflegedienst",
    ik: "000000110",
    postalAddress: {
        street1: "Mustergasse 12",
        postalCode: "12345",
        city: "Musterstadt",
    },
    ansprechpartner: [{
        name: "Erika Mustermann",
        phone: "0123 456789"
    }],
    abrechnungscode: "36",
    tarifbereich: "00",
    location: "HE",
    umsatzsteuerBefreiung: "01",
    umsatzsteuerOrdnungsnummer: null,
    email: "test@example.com",
};

// Common SGB XI Surcharges (Zuschläge)
export const ausbildungsumlageZuschlag: Zuschlag = {
    zuschlagsart: "1", // ambulant
    zuschlag: "18", // Ausbildungsumlage nach PflAFinV
    beschreibungZuschlagsart: null,
    zuschlagszuordnung: "1", // Leistung
    zuschlagsberechnung: "11", // Prozentsatz zum Betrag
    istAbzugStattZuschlag: false,
    wert: 5.5, // 5.5 %
};

export const ungunstigeZeitenZuschlag: Zuschlag = {
    zuschlagsart: "1", // ambulant
    zuschlag: "21", // Ungünstige Zeiten
    beschreibungZuschlagsart: null,
    zuschlagszuordnung: "1", // Leistung
    zuschlagsberechnung: "11", // Prozentsatz zum Betrag
    istAbzugStattZuschlag: false,
    wert: 10.0, // 10 %
};

// Insured Persons (Versicherte) with unique attributes matching scenarios
export const versicherte: Record<string, Versicherter> = {
    annaMueller: {
        krankenkasseIK: "187299005", // AOK Plus (exists in institutionLists with certs)
        versichertennummer: "A123456789",
        versichertenstatus: "11",
        pflegegrad: [{ value: "3", since: new Date("2020-01-01") }],
        firstName: "Anna",
        lastName: "Müller",
        birthday: new Date("1945-03-15"),
        address: {
            street: "Hauptstraße",
            houseNumber: "42",
            postalCode: "01067",
            city: "Dresden",
            countryCode: null
        } as Address
    },
    berndSchmidt: {
        krankenkasseIK: "187299005",
        versichertennummer: "B987654321",
        versichertenstatus: "11",
        pflegegrad: [{ value: "2", since: new Date("2020-01-01") }],
        firstName: "Bernd",
        lastName: "Schmidt",
        birthday: new Date("1950-07-22"),
        address: {
            street: "Gartenweg",
            houseNumber: "5",
            postalCode: "04109",
            city: "Leipzig",
            countryCode: null
        } as Address
    },
    claraWeber: {
        krankenkasseIK: "187299005",
        versichertennummer: "C246813579",
        versichertenstatus: "11",
        pflegegrad: [{ value: "4", since: new Date("2020-01-01") }],
        firstName: "Clara",
        lastName: "Weber",
        birthday: new Date("1938-11-30"),
        address: {
            street: "Rosenallee",
            houseNumber: "17",
            postalCode: "09111",
            city: "Chemnitz",
            countryCode: null
        } as Address
    },
    dieterFischer: {
        krankenkasseIK: "187299005",
        versichertennummer: "D135792468",
        versichertenstatus: "11",
        pflegegrad: [{ value: "3", since: new Date("2020-01-01") }],
        firstName: "Dieter",
        lastName: "Fischer",
        birthday: new Date("1942-05-18"),
        address: {
            street: "Waldweg",
            houseNumber: "3a",
            postalCode: "07743",
            city: "Jena",
            countryCode: null
        } as Address
    },
    evaBraun: {
        krankenkasseIK: "187299005",
        versichertennummer: "E999888777",
        versichertenstatus: "11",
        pflegegrad: [{ value: "2", since: new Date("2020-01-01") }],
        firstName: "Eva",
        lastName: "Braun",
        birthday: new Date("1948-09-05"),
        address: {
            street: "Schlossplatz",
            houseNumber: "1",
            postalCode: "99084",
            city: "Erfurt",
            countryCode: null
        } as Address
    },
    fritzKoenig: {
        krankenkasseIK: "187299005",
        versichertennummer: "F111222333",
        versichertenstatus: "11",
        pflegegrad: [{ value: "5", since: new Date("2020-01-01") }],
        firstName: "Fritz",
        lastName: "König",
        birthday: new Date("1935-12-25"),
        address: {
            street: "Bergstraße",
            houseNumber: "8",
            postalCode: "08523",
            city: "Plauen",
            countryCode: null
        } as Address
    },
    giselaHoffmann: {
        krankenkasseIK: "187299005",
        versichertennummer: "G444555666",
        versichertenstatus: "11",
        pflegegrad: [{ value: "2", since: new Date("2020-01-01") }],
        firstName: "Gisela",
        lastName: "Hoffmann",
        birthday: new Date("1940-02-14"),
        address: {
            street: "Talweg",
            houseNumber: "22",
            postalCode: "07545",
            city: "Gera",
            countryCode: null
        } as Address
    },
    hansBauer: {
        krankenkasseIK: "187299005",
        versichertennummer: "H777888999",
        versichertenstatus: "11",
        pflegegrad: [{ value: "3", since: new Date("2020-01-01") }],
        firstName: "Hans",
        lastName: "Bauer",
        birthday: new Date("1947-06-30"),
        address: {
            street: "Bachgasse",
            houseNumber: "14",
            postalCode: "02625",
            city: "Bautzen",
            countryCode: null
        } as Address
    }
};

// Common/helper lists of case operations (Einsätze / Leistungen)

// 1. Pflegesachleistung Case (Anna Müller)
export const pflegesachleistungEinsaetze: Einsatz[] = [
    {
        leistungsBeginn: new Date("2021-04-01T08:00:00"),
        leistungen: [
            {
                leistungsart: "01",
                verguetungsart: "01", // Leistungskomplex
                qualifikationsabhaengigeVerguetung: "1",
                leistungskomplex: "001", // kleine Körperpflege
                einzelpreis: 25.00,
                anzahl: 1,
                punktwert: 0.05,
                punktzahl: 500,
                leistungsBeginn: new Date("2021-04-01T08:00:00"),
                leistungsEnde: new Date("2021-04-01T08:20:00"),
                zuschlaege: [ausbildungsumlageZuschlag, ungunstigeZeitenZuschlag],
                beschaeftigtennummer1: null,
                beschaeftigtennummer2: null
            },
            {
                leistungsart: "01",
                verguetungsart: "02", // Zeitvergütung
                qualifikationsabhaengigeVerguetung: "1",
                zeiteinheit: "1", // Minute
                zeitart: "3", // Körperbezogene Pflege
                einzelpreis: 45.00,
                anzahl: 1,
                punktwert: null,
                punktzahl: null,
                leistungsBeginn: new Date("2021-04-01T08:20:00"),
                leistungsEnde: new Date("2021-04-01T08:50:00"),
                zuschlaege: [ausbildungsumlageZuschlag],
                beschaeftigtennummer1: null,
                beschaeftigtennummer2: null
            }
        ]
    }
];

// 2. Verhinderungspflege Case (Bernd Schmidt)
export const verhinderungspflegeEinsaetze: Einsatz[] = [
    {
        leistungsBeginn: new Date("2021-04-02T09:00:00"),
        leistungen: [
            {
                leistungsart: "07", // Verhinderungspflege
                verguetungsart: "01", // Leistungskomplexverguetung
                qualifikationsabhaengigeVerguetung: "1",
                leistungskomplex: "001",
                einzelpreis: 28.50,
                anzahl: 1,
                punktwert: 0.05,
                punktzahl: 570,
                leistungsBeginn: new Date("2021-04-02T09:00:00"),
                leistungsEnde: new Date("2021-04-02T09:30:00"),
                zuschlaege: [ausbildungsumlageZuschlag],
                beschaeftigtennummer1: null,
                beschaeftigtennummer2: null
            }
        ]
    }
];

// 3. Entlastungsleistungen § 45b Case (Clara Weber)
export const entlastungsleistungEinsaetze: Einsatz[] = [
    {
        leistungsBeginn: new Date("2021-04-03T10:00:00"),
        leistungen: [
            {
                leistungsart: "10", // Entlastungsleistungen nach § 45b SGB XI
                verguetungsart: "07", // Entlastungsleistung
                qualifikationsabhaengigeVerguetung: "1",
                entlastungsleistung: "40", // nach Landesrecht anerkannte Angebote
                einzelpreis: 125.00,
                anzahl: 1,
                punktwert: null,
                punktzahl: null,
                leistungsBeginn: null,
                leistungsEnde: null,
                zuschlaege: [],
                beschaeftigtennummer1: null,
                beschaeftigtennummer2: null
            }
        ]
    }
];

// 4. Beratungsbesuch § 37 Case (Dieter Fischer)
export const beratungsbesuchEinsaetze: Einsatz[] = [
    {
        leistungsBeginn: new Date("2021-04-04T11:00:00"),
        leistungen: [
            {
                leistungsart: "09", // Beratungsbesuch nach § 37 Abs. 3 SGB XI
                verguetungsart: "08", // Pauschale
                qualifikationsabhaengigeVerguetung: "1",
                beratungsbesuch: "1", // Beratung vor Ort
                einzelpreis: 33.00,
                anzahl: 1,
                punktwert: null,
                punktzahl: null,
                leistungsBeginn: null,
                leistungsEnde: null,
                zuschlaege: [],
                beschaeftigtennummer1: null,
                beschaeftigtennummer2: null
            }
        ]
    }
];

// 5. Pflegehilfsmittel Case (Eva Braun)
export const pflegehilfsmittelEinsaetze: Einsatz[] = [
    {
        leistungsBeginn: new Date("2021-04-05T12:00:00"),
        leistungen: [
            {
                leistungsart: "06", // Pflegehilfsmittel
                verguetungsart: "05", // Hilfsmittel
                qualifikationsabhaengigeVerguetung: "0",
                positionsnummer: "5140011000",
                einzelpreis: 40.00,
                anzahl: 1,
                punktwert: null,
                punktzahl: null,
                leistungsBeginn: null,
                leistungsEnde: null,
                zuschlaege: [],
                hilfsmittel: {
                    mehrwertsteuerart: "1", // voller Steuersatz
                    gesetzlicheZuzahlungBetrag: 4.00,
                    genehmigungskennzeichen: "HIL-MOCK-123",
                    genehmigungsDatum: new Date("2021-04-10"),
                    kennzeichenPflegehilfsmittel: "00", // Neulieferung
                    bezeichnungPflegehilfsmittel: "Hausnotruf",
                    produktbesonderheitenPflegehilfsmittel: null,
                    inventarnummerPflegehilfsmittel: null
                },
                beschaeftigtennummer1: null,
                beschaeftigtennummer2: null
            }
        ]
    }
];

// 6. Kurzzeitpflege Case (Fritz König)
export const kurzzeitpflegeEinsaetze: Einsatz[] = [
    {
        leistungsBeginn: new Date("2021-04-01T12:00:00"),
        leistungen: [
            {
                leistungsart: "04", // Kurzzeitpflege
                verguetungsart: "04", // vollstationär / Kurzzeitpflege
                qualifikationsabhaengigeVerguetung: "1",
                pflegesatz: "00", // ganztags
                einzelpreis: 85.00,
                anzahl: 7, // 7 days
                punktwert: null,
                punktzahl: null,
                leistungsBeginn: new Date("2021-04-01T12:00:00"),
                leistungsEnde: new Date("2021-04-08T12:00:00"),
                zuschlaege: [],
                beschaeftigtennummer1: null,
                beschaeftigtennummer2: null
            }
        ]
    }
];

// 7. Teilstationär/Tagespflege Case (Gisela Hoffmann)
export const tagespflegeEinsaetze: Einsatz[] = [
    {
        leistungsBeginn: new Date("2021-04-05T08:00:00"),
        leistungen: [
            {
                leistungsart: "02", // Tagespflege
                verguetungsart: "03", // teilstationär
                qualifikationsabhaengigeVerguetung: "1",
                pflegesatz: "01", // halbtags
                einzelpreis: 45.00,
                anzahl: 5, // 5 days
                punktwert: null,
                punktzahl: null,
                leistungsBeginn: null,
                leistungsEnde: new Date("2021-04-05T14:00:00"),
                zuschlaege: [],
                beschaeftigtennummer1: null,
                beschaeftigtennummer2: null
            }
        ]
    }
];

// 8. Wegegebühren Case (Hans Bauer)
export const wegegebuehrenEinsaetze: Einsatz[] = [
    {
        leistungsBeginn: new Date("2021-04-06T08:00:00"),
        leistungen: [
            {
                leistungsart: "01",
                verguetungsart: "06", // Wegegebühren
                qualifikationsabhaengigeVerguetung: "1",
                wegegebuehren: "03", // Einsatz- / Fahrtkostenpauschale
                einzelpreis: 4.50,
                anzahl: 10,
                punktwert: null,
                punktzahl: null,
                leistungsBeginn: null,
                leistungsEnde: null,
                gefahreneKilometer: null,
                zuschlaege: [],
                beschaeftigtennummer1: null,
                beschaeftigtennummer2: null
            },
            {
                leistungsart: "01",
                verguetungsart: "06", // Wegegebühren
                qualifikationsabhaengigeVerguetung: "1",
                wegegebuehren: "04", // gefahrene Kilometer
                einzelpreis: 0.35,
                anzahl: 1,
                punktwert: null,
                punktzahl: null,
                leistungsBeginn: null,
                leistungsEnde: null,
                gefahreneKilometer: 15,
                zuschlaege: [],
                beschaeftigtennummer1: null,
                beschaeftigtennummer2: null
            }
        ]
    }
];

// Combined test invoice payload representing all the test cases
export const makeTestverfahrenInvoices = (): Invoice[] => {
    return [{
        leistungserbringer: { ...testLeistungserbringer },
        rechnungsnummer: null,
        rechnungsdatum: new Date("2021-05-03"),
        faelle: [
            {
                versicherter: { ...versicherte.annaMueller },
                tarifkennzeichen: "",
                belegnummer: null,
                pflegegrad: "3",
                einsaetze: pflegesachleistungEinsaetze,
                kostentraegerIK: null
            },
            {
                versicherter: { ...versicherte.berndSchmidt },
                tarifkennzeichen: "",
                belegnummer: null,
                pflegegrad: "2",
                einsaetze: verhinderungspflegeEinsaetze,
                kostentraegerIK: null
            },
            {
                versicherter: { ...versicherte.claraWeber },
                tarifkennzeichen: "",
                belegnummer: null,
                pflegegrad: "4",
                einsaetze: entlastungsleistungEinsaetze,
                kostentraegerIK: null
            },
            {
                versicherter: { ...versicherte.dieterFischer },
                tarifkennzeichen: "",
                belegnummer: null,
                pflegegrad: "3",
                einsaetze: beratungsbesuchEinsaetze,
                kostentraegerIK: null
            },
            {
                versicherter: { ...versicherte.evaBraun },
                tarifkennzeichen: "",
                belegnummer: null,
                pflegegrad: "2",
                einsaetze: pflegehilfsmittelEinsaetze,
                kostentraegerIK: null
            },
            {
                versicherter: { ...versicherte.fritzKoenig },
                tarifkennzeichen: "",
                belegnummer: null,
                pflegegrad: "5",
                einsaetze: kurzzeitpflegeEinsaetze,
                kostentraegerIK: null
            },
            {
                versicherter: { ...versicherte.giselaHoffmann },
                tarifkennzeichen: "",
                belegnummer: null,
                pflegegrad: "2",
                einsaetze: tagespflegeEinsaetze,
                kostentraegerIK: null
            },
            {
                versicherter: { ...versicherte.hansBauer },
                tarifkennzeichen: "",
                belegnummer: null,
                pflegegrad: "3",
                einsaetze: wegegebuehrenEinsaetze,
                kostentraegerIK: null
            }
        ]
    }];
};

// Base Billing Data Setup
export const makeTestverfahrenBillingData = (
    senderCertificate: ArrayBuffer = new ArrayBuffer(0),
    senderPrivateKey: ArrayBuffer = new ArrayBuffer(0)
): BillingData => ({
    rechnungsart: "1",
    testIndicator: "0",
    verarbeitungskennzeichen: "01",
    datenaustauschreferenzJeEmpfaengerIK: {},
    laufendeDatenannahmeImJahrJeEmpfaengerIK: {},
    rechnungsnummerprefix: "2021-0042-",
    senderCertificate,
    senderPrivateKey,
    nextRechnungsnummer: 1,
    nextBelegnummer: 1,
});

// Correction Billing Data Setup
export const makeCorrectionBillingData = (
    senderCertificate: ArrayBuffer = new ArrayBuffer(0),
    senderPrivateKey: ArrayBuffer = new ArrayBuffer(0)
): BillingData => ({
    rechnungsart: "1",
    testIndicator: "0",
    verarbeitungskennzeichen: "01",
    datenaustauschreferenzJeEmpfaengerIK: {},
    laufendeDatenannahmeImJahrJeEmpfaengerIK: {},
    rechnungsnummerprefix: "2021-0042-",
    senderCertificate,
    senderPrivateKey,
    nextRechnungsnummer: 1,
    nextBelegnummer: 1,
    korrekturlieferung: 1 // Indicates this is a correction delivery
});
