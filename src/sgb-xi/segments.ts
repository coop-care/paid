import { Amounts, BillingData, CareProvider, Leistung, MessageIdentifiers, Versicherter } from "../types";
import { 
    ZuschlagszuordnungSchluessel, 
    ZuschlagsberechnungSchluessel, 
    ZuschlagSchluessel, 
    ZuschlagsartSchluessel, 
    PflegehilfsmittelSchluessel,
    PflegegradSchluessel, 
    RechnungsartSchluessel, 
    TarifbereichSchluessel, 
    VerarbeitungskennzeichenSchluessel,
    VerguetungsartSchluessel, 
    LeistungsartSchluessel, 
    MehrwertsteuerSchluessel,
} from "./codes";
import { mask, number, price, day, month, date, time, datetime, segment } from "../formatter";

const Syntax_Version = "UNOC:3";
const DefaultCurrency = "EUR";

export const UNB = (
    { senderID, receiverID, controlReference, filename, fileType }: BillingData
) => segment(
    "UNB", 
    Syntax_Version,
    senderID,
    receiverID,
    datetime(new Date()),
    controlReference.toString(),
    filename,
    fileType
);

export const UNZ = (
    controlCount: number, // = number of messages (starting with UNH)
    controlReference: number,
) => segment(
    "UNZ",
    controlCount.toString(),
    controlReference.toString()
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
    {
        absenderIK, // PLGA: Absender der Datei, identisch zu Absender in UNB; PLAA: wie RechnungsstellerIK (?)
        rechnungsstellerIK, // Leistungserbringer oder Abrechnungsstelle mit Inkassovollmacht bei Sammelrechnung; PLAA == PLGA
    }: CareProvider,
    {
        kostentraegerIK, // Institution die die Rechnung begleicht laut Kostenträgerdatei; PLAA == PLGA
        pflegekasseIK, // Pflegekasse des Leistungs- bzw. Bewilligungsbescheids; falls angegeben gilt: PLAA == PLGA
    }: Versicherter,
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
    sammelrechnung !== undefined ? absenderIK : rechnungsstellerIK
);

export const REC = (
    rechnungsnummer: string,
    leistungserbringerIndex: number,
    sammelrechnung: boolean,
    rechnungsdatum = new Date(),
    rechnungsart: RechnungsartSchluessel,
    currency = DefaultCurrency
) => segment(
    "REC",
    mask(rechnungsnummer) + ":" + (sammelrechnung || rechnungsart == "1" ? 0 : (leistungserbringerIndex + 1)),
    date(rechnungsdatum),
    rechnungsart,
    currency
);

export const SRD = (
    {
        abrechnungscode,
        tarifbereich,
    }: CareProvider,
    leistungsart: LeistungsartSchluessel,
) => segment(
    "SRD",
    abrechnungscode + ":" + tarifbereich,
    leistungsart
);

export const UST = ({
    umsatzsteuerOrdnungsnummer = "",
    umsatzsteuerBefreiung = "",
}: CareProvider) => segment(
    "UST",
    mask(umsatzsteuerOrdnungsnummer),
    umsatzsteuerBefreiung.length ? "J" : "",
    umsatzsteuerBefreiung
);

export const GES = ({
    gesamtbruttobetrag,
    rechnungsbetrag,
    zuzahlungsbetrag,
    beihilfebetrag,
    mehrwertsteuerbetrag,
}: Amounts) => segment(
    "GES",
    price(gesamtbruttobetrag),
    price(zuzahlungsbetrag || undefined),
    price(beihilfebetrag || undefined),
    price(rechnungsbetrag),
    price(mehrwertsteuerbetrag || undefined)
);

export const NAM = ({
    name,
    ansprechpartner
}: CareProvider) => segment(
    "NAM",
    mask(name.substr(0, 30)),
    ...ansprechpartner.slice(0, 3).map(ansprechpartner =>
        Object.values(ansprechpartner).filter(Boolean).join(", ").substr(0, 30)
    )
);

export const INV = (
    versichertennummer: string,
    eindeutigeBelegnummer: string
) => segment(
    "INV",
    mask(versichertennummer),
    mask(eindeutigeBelegnummer)
);

export const NAD = ({
    firstName,
    lastName,
    birthday,
    street = "",
    houseNumber = "",
    postalCode = "",
    city = ""
}: Versicherter) => segment(
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
export const ELS = ({
    leistungsart,
    verguetungsart,
    qualifikationsabhaengigeVerguetung,
    leistung,
    einzelpreis,
    anzahl,
    leistungsBeginn, // for verguetungsart 04
    leistungsEnde, // for verguetungsart 01, 02, 03, 04
    gefahreneKilometer, // for verguetungsart 06 with leistung 04
    punktwert,
    punktzahl,
}: Leistung) => {
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

export const IAF = ({ // is calculcated from all ELS / ZUS / HIL segments for one INV segment
    gesamtbruttobetrag,
    rechnungsbetrag,
    zuzahlungsbetrag,
    beihilfebetrag
}: Amounts) => segment(
    "IAF",
    price(gesamtbruttobetrag),
    price(zuzahlungsbetrag || undefined),
    price(beihilfebetrag || undefined),
    price(rechnungsbetrag),
);
