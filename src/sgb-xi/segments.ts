/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import { 
    Amounts, 
    BillingData, 
    Leistungserbringer, 
    Leistung, 
    MessageIdentifiers, 
    messageIdentifierVersions, 
    Versicherter,
    Hilfsmittel,
    Zuschlag,
    Abrechnungsfall,
    Institution,
    TestIndicator
} from "../types";
import {
    PflegegradSchluessel,
    TarifbereichSchluessel, 
    VerarbeitungskennzeichenSchluessel,
} from "./codes";
import { mask, number, price, day, month, date, time, datetime, segment } from "../formatter";

const Syntax_Version = "UNOC:3";
const DefaultCurrency = "EUR";

export const UNB = (
    absenderIK: string, 
    empfaengerIK: string, 
    datenaustauschreferenz: number,
    anwendungsreferenz: string, 
    dateiindikator: TestIndicator
) => segment(
    "UNB", 
    Syntax_Version,
    absenderIK,
    empfaengerIK,
    datetime(new Date()),
    datenaustauschreferenz.toString().substr(0, 5),
    anwendungsreferenz,
    dateiindikator
);

export const UNZ = (
    numberOfMessages: number,
    datenaustauschreferenz: number,
) => segment(
    "UNZ",
    numberOfMessages.toString(),
    datenaustauschreferenz.toString().substr(0, 5),
);

export const UNH = (
    messageReferenceNumber: number, // = index of message (starting with UNH)
    messageIdentifier: MessageIdentifiers,
) => segment(
    "UNH",
    messageReferenceNumber.toString().substr(0, 5),
    messageIdentifierVersions[messageIdentifier]
);

export const UNT = (
    numberOfSegments: number, // Control count including UNH and UNT
    messageReferenceNumber: number // = index of message
) => segment(
    "UNT",
    numberOfSegments.toString(),
    messageReferenceNumber.toString().substr(0, 5),
);

/** Funktion */
export const FKT = (
    /** identical in PLGA.FKT and PLAA.FKT */
    verarbeitungskennzeichen: VerarbeitungskennzeichenSchluessel,
    {
        absender, // PLGA: Absender der Datei, identisch zu Absender in UNB; PLAA: wie RechnungsstellerIK (?)
        rechnungssteller, // Leistungserbringer oder Abrechnungsstelle mit Inkassovollmacht bei Sammelrechnung; PLAA == PLGA
    }: {
        absender: Institution,
        rechnungssteller: Institution,
    },
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
    rechnungssteller.ik,
    kostentraegerIK,
    sammelrechnung !== true ? pflegekasseIK : "",
    sammelrechnung !== undefined ? absender.ik : rechnungssteller.ik
);

/** Rechnung / Zahlung */
export const REC = (
    {
        rechnungsdatum = new Date(),
        rechnungsart,
        rechnungsnummerprefix
    }: BillingData,
    invoiceIndex: number,
    leistungserbringerIndex: number,
    sammelrechnung: boolean,
    currency = DefaultCurrency
) => segment(
    "REC",
    mask(rechnungsnummerprefix + "-" + (invoiceIndex + 1)) + ":" +
        (sammelrechnung || rechnungsart == "1" ? 0 : (leistungserbringerIndex + 1)),
    date(rechnungsdatum),
    rechnungsart,
    currency
);

/** Rechnungsdaten */
export const SRD = (
    {
        abrechnungscode,
        tarifbereich,
        sondertarifJeKostentraegerIK,
    }: Leistungserbringer,
    {
        versicherter,
        einsaetze,
    }: Abrechnungsfall
) => segment(
    "SRD",
    abrechnungscode + ":" + tarifbereich 
        + (sondertarifJeKostentraegerIK[versicherter.kostentraegerIK] || "000"),
    einsaetze[0].leistungen[0].leistungsart
);

/** Umsatzsteuer */
export const UST = ({
    umsatzsteuerOrdnungsnummer = "",
    umsatzsteuerBefreiung,
}: Leistungserbringer) => segment(
    "UST",
    mask(umsatzsteuerOrdnungsnummer),
    umsatzsteuerBefreiung.length ? "J" : "",
    umsatzsteuerBefreiung
);

/** Rechnungssummen  */
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

/** Namen */
export const NAM = ({
    name,
    ansprechpartner
}: Institution) => segment(
    "NAM",
    mask(name.substr(0, 30)),
    ...ansprechpartner.slice(0, 3).map(ansprechpartner =>
        Object.values(ansprechpartner).filter(Boolean).join(", ").substr(0, 30)
    )
);

/** Information des Pflegebedürftigen */
export const INV = (
    versichertennummer?: string,
    belegnummer: number
) => segment(
    "INV",
    mask(versichertennummer),
    (belegnummer + 1).toString()
);

/** Name und Anschrift des Versicherten */
export const NAD = (v: Versicherter) => segment(
    "NAD",
    mask(v.firstName.substr(0, 45)),
    mask(v.lastName.substr(0, 45)),
    date(v.birthday),
    mask(v.address?.street?.substr(0, 46)),
    mask(v.address?.houseNumber?.substr(0, 9)),
    mask(v.address?.postalCode?.substr(0, 10)),
    mask(v.address?.city?.substr(0, 40))
);

/** Monatskopf-Segment */
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

/** Einsatzkopf-Segment */
export const ESK = (
    leistungsBeginn?: Date,
) => segment(
    "ESK",
    leistungsBeginn ? day(leistungsBeginn) : "99",
    leistungsBeginn ? time(leistungsBeginn) : ""
);

// ELS is insanely complex: leistung and several parameters depend on verguetungsart
/** Einzelleistungen */
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

/** Zuschläge/Abzüge */
export const ZUS = (
    isLast: boolean,
    tarifbereich: TarifbereichSchluessel,
    {
        zuschlagsart, 
        zuschlag, 
        zuschlagszuordnung,
        zuschlagsberechnung,
        istAbzugStattZuschlag,
        wert,
        beschreibungZuschlagsart,
    }: Zuschlag,
    ergebnis: number,
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

/** Einzelleistungen */
export const HIL = ({
    mehrwertsteuerart = "",
    zuzahlungsbetrag,
    genehmigungskennzeichen = "",
    genehmigungsdatum,
    kennzeichenPflegehilfsmittel = "",
    bezeichnungPflegehilfsmittel = "",
    produktbesonderheitenPflegehilfsmittel = "",
    inventarnummerPflegehilfsmittel = "",
}: Hilfsmittel,
    mehrwertsteuerbetrag?: number
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

/** Abrechnungsfall-Endesegment  */
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
