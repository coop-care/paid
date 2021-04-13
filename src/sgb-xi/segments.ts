import { FileType, MessageIdentifiers } from "../types";
import { 
    ZuschlagszuordnungSchluessel, 
    ZuschlagsberechnungSchluessel, 
    ZuschlagSchluessel, 
    ZuschlagsartSchluessel, 
    PflegehilfsmittelSchluessel, 
    AbrechnungscodeSchluessel, 
    PflegegradSchluessel, 
    RechnungsartSchluessel, 
    TarifbereichSchluessel, 
    VerarbeitungskennzeichenSchluessel, 
    QualifikationsabhaengigeVerguetungSchluessel, 
    VerguetungsartSchluessel, 
    LeistungsartSchluessel, 
    MehrwertsteuerSchluessel, 
    UmsatzsteuerBefreiungSchluessel, 
} from "./codes";
import { mask, number, price, day, month, date, time, datetime, segment } from "../formatter";

const Syntax_Version = "UNOC:3";
const DefaultCurrency = "EUR";

export const UNB = (
    sender: string, // Absender IK
    receiver: string, // Empfänger IK
    interchangeControlReference: number, // Datenaustauschreferenz
    filename: string,
    fileType: FileType
) => segment(
    "UNB", 
    Syntax_Version,
    sender,
    receiver,
    datetime(new Date()),
    interchangeControlReference.toString(),
    filename,
    fileType
);

export const UNZ = (
    interchangeControlCount: number, // = number of messages (starting with UNH)
    interchangeControlReference: number,
) => segment(
    "UNZ",
    interchangeControlCount.toString(),
    interchangeControlReference.toString()
);

export const UNH = (
    messageReferenceNumber: number, // = index of message (starting with UNH)
    messageIdentifier: MessageIdentifiers,
) => segment(
    "UNH",
    messageReferenceNumber.toString(),
    messageIdentifier
);

export const UNT = (
    numberOfSegments: number, // Control count including UNH and UNT
    messageReferenceNumber: number // = index of message
) => segment(
    "UNT",
    numberOfSegments.toString(),
    messageReferenceNumber.toString()
);

export const FKT = (
    verarbeitungskennzeichen: VerarbeitungskennzeichenSchluessel, // always "01"
    rechnungsstellerIK: string, // the party who gets the money
    kostentraegerIK: string, // party who pays the money
    pflegekasseIK: string,
    absenderIK: string,
    sammelrechnung?: boolean, // only for PLGA, undefined for PLAA
) => segment(
    "FKT",
    verarbeitungskennzeichen,
    sammelrechnung === undefined
        ? undefined
        : sammelrechnung
        ? "J"
        : "",
    rechnungsstellerIK,
    kostentraegerIK,
    sammelrechnung !== true ? pflegekasseIK : "",
    absenderIK
);

export const REC = (
    rechnungsnummer: string,
    einzelrechnungsnummer = "0",
    rechnungsdatum: Date,
    rechnungsart: RechnungsartSchluessel,
    currency = DefaultCurrency
) => segment(
    "REC",
    mask(rechnungsnummer) + ":" + mask(einzelrechnungsnummer),
    date(rechnungsdatum),
    rechnungsart,
    currency
);

export const SRD = (
    abrechnungscode: AbrechnungscodeSchluessel,
    tarifbereich: TarifbereichSchluessel,
    leistungsart: LeistungsartSchluessel,
) => segment(
    "SRD",
    abrechnungscode + ":" + tarifbereich,
    leistungsart
);

export const UST = (
    ordnungsnummer = "",
    umsatzsteuerbefreiung: UmsatzsteuerBefreiungSchluessel = "",
) => segment(
    "UST",
    mask(ordnungsnummer),
    umsatzsteuerbefreiung.length ? "J" : "",
    umsatzsteuerbefreiung
);

export const GES = (
    summeGesamtbruttobetraege: number, // = gesamtrechnungsbetrag + summeZuzahlungsbetraege + summeBeihilfebetraege + mehrwertsteuerbetrag
    gesamtrechnungsbetrag: number,
    summeZuzahlungsbetraege?: number,
    summeBeihilfebetraege?: number,
    mehrwertsteuerbetrag?: number,
) => segment(
    "GES",
    price(summeGesamtbruttobetraege),
    price(summeZuzahlungsbetraege),
    price(summeBeihilfebetraege),
    price(gesamtrechnungsbetrag),
    price(mehrwertsteuerbetrag)
);

export const NAM = (
    name1: string,
    name2 = "",
    name3 = "",
    name4 = ""
) => segment(
    "NAM",
    mask(name1.substr(0, 30)),
    mask(name2.substr(0, 30)),
    mask(name3.substr(0, 30)),
    mask(name4.substr(0, 30)),
);

export const INV = (
    versichertennummer: string,
    eindeutigeBelegnummer: string
) => segment(
    "INV",
    mask(versichertennummer),
    mask(eindeutigeBelegnummer)
);

export const NAD = (
    firstName: string,
    lastName: string,
    birthday: Date,
    street = "",
    houseNumber = "",
    postalCode = "",
    city = ""
) => segment(
    "NAD",
    mask(firstName.substr(0, 45)),
    mask(lastName.substr(0, 45)),
    date(birthday),
    mask(street.substr(0, 46)),
    mask(houseNumber.substr(0, 9)),
    mask(postalCode.substr(0, 10)),
    mask(city.substr(0, 40))
);

export const MAN = (
    monatLeistungserbringung: Date,
    pflegegrad: PflegegradSchluessel,
) => segment(
    "MAN",
    monatLeistungserbringung.getFullYear() + month(monatLeistungserbringung),
    "", // "Pflegestufe", obsolete
    "", // "Pflegeklasse", obsolete
    pflegegrad
);

export const ESK = (
    leistungsBeginn: Date,
    verguetungsart: VerguetungsartSchluessel,
) => segment(
    "ESK",
    day(leistungsBeginn),
    ["01", "02", "03", "06"].includes(verguetungsart) ? time(leistungsBeginn) : ""
);

// ELS is insanely complex: leistung and several parameters depend on verguetungsart
export const ELS = (
    leistungsart: LeistungsartSchluessel,
    verguetungsart: VerguetungsartSchluessel,
    qualifikationsabhaengigeVerguetung: QualifikationsabhaengigeVerguetungSchluessel,
    leistung: string,
    einzelpreis: number,
    anzahl: number,
    leistungsBeginn?: Date, // for verguetungsart 04
    leistungsEnde?: Date, // for verguetungsart 01, 02, 03, 04
    gefahreneKilometer?: number, // for verguetungsart 06 with leistung 04
    punktwert?: number,
    punktzahl?: number,
) => {
    let details = "00";

    if (verguetungsart == "01") {
        details = leistungsEnde ? time(leistungsEnde) : "00";
    } else if (verguetungsart == "02" && leistungsEnde) {
        details = time(leistungsEnde);
    } else if (verguetungsart == "03" && leistungsEnde) {
        details = time(leistungsEnde);
    } else if (verguetungsart == "04" && leistungsBeginn && leistungsEnde) {
        details = day(leistungsBeginn) + day(leistungsEnde);
    } else if (verguetungsart == "06" && leistung == "04"
            && gefahreneKilometer != undefined) {
        details = number(gefahreneKilometer, 0)
    }

    return segment(
        "ELS",
        [
            leistungsart,
            verguetungsart,
            qualifikationsabhaengigeVerguetung,
            leistung
        ].join(":"),
        price(einzelpreis),
        number(punktwert, 5),
        number(punktzahl, 0),
        details,
        number(anzahl, 2)
    )
};

export const ZUS = (
    isLast: boolean,
    tarifbereich: TarifbereichSchluessel,
    zuschlagsart: ZuschlagsartSchluessel, 
    zuschlag: ZuschlagSchluessel, 
    zuschlagszuordnung: ZuschlagszuordnungSchluessel,
    zuschlagsberechnung: ZuschlagsberechnungSchluessel,
    istAbzugStattZuschlag: boolean,
    wert: number,
    ergebnis: number,
    beschreibungZuschlagsart?: string,
) => segment(
    "ZUS",
    [tarifbereich, zuschlagsart, zuschlag].join(":"),
    mask(beschreibungZuschlagsart?.substr(0, 50) || ""),
    zuschlagszuordnung,
    zuschlagsberechnung,
    istAbzugStattZuschlag ? "0" : "1",
    number(wert, 5),
    price(ergebnis),
    isLast? "1" : "0"
);

export const HIL = (
    mehrwertsteuerart: MehrwertsteuerSchluessel = "",
    mehrwertsteuerbetrag?: number,
    zuzahlungsbetrag?: number,
    genehmigungskennzeichen = "",
    genehmigungsdatum?: Date,
    kennzeichenPflegehilfsmittel: PflegehilfsmittelSchluessel = "",
    bezeichnungPflegehilfsmittel = "",
    produktbesonderheitenPflegehilfsmittel = "",
    inventarnummerPflegehilfsmittel = "",
) => segment(
    "HIL",
    mehrwertsteuerart,
    price(mehrwertsteuerbetrag),
    price(zuzahlungsbetrag),
    mask(genehmigungskennzeichen.substr(0, 15)),
    genehmigungsdatum ? date(genehmigungsdatum) : "",
    kennzeichenPflegehilfsmittel,
    mask(bezeichnungPflegehilfsmittel.substr(0, 30)),
    mask(produktbesonderheitenPflegehilfsmittel.substr(0, 10)),
    mask(inventarnummerPflegehilfsmittel.substr(0, 20)),
);

export const IAF = ( // is calculcated from all ELS / ZUS / HIL segments for one INV segment
    gesamtbruttobetrag: number, // = rechnungsbetrag + zuzahlungsbetrag + beihilfebetrag
    rechnungsbetrag: number,
    zuzahlungsbetrag?: number,
    beihilfebetrag?: number,
) => segment(
    "IAF",
    price(gesamtbruttobetrag),
    price(zuzahlungsbetrag),
    price(beihilfebetrag),
    price(rechnungsbetrag),
);
