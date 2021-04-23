/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import { BillingData, Abrechnungsfall, Einsatz, Invoice, MessageIdentifiers, BillingFile, Hilfsmittel, Leistung } from "../types";
import { entriesGroupedBy, valuesGroupedBy } from "../utils";
import { MehrwertsteuerSchluessel, RechnungsartSchluessel } from "./codes";
import { makeAnwendungsreferenz, makeDateiname } from "./filenames";
import { ELS, ESK, FKT, GES, HIL, IAF, INV, MAN, NAD, NAM, REC, SRD, UNB, UNH, UNT, UNZ, UST, ZUS } from "./segments";

const linebreak = "\n";
const mehrwertsteuersaetze: Record<MehrwertsteuerSchluessel, number> = {
    "": 0,
    "1": 0.19,
    "2": 0.07
};

const makeBillingFile = (
    empfaengerIK: string, 
    kassenart: string,
    invoices: Invoice[], 
    billing: BillingData
) => {
    const {
        datenaustauschreferenzJeEmpfaengerIK,
        laufendeDatenannahmeImJahrJeEmpfaengerIK,
        dateiindikator,
        rechnungsart
    } = billing;
    const absenderIK = invoices[0].leistungserbringer.absenderIK;
    const datenaustauschreferenz = datenaustauschreferenzJeEmpfaengerIK[empfaengerIK] || 1;
    const laufendeDatenannahmeImJahr = laufendeDatenannahmeImJahrJeEmpfaengerIK[empfaengerIK] || 1;
    const anwendungsreferenz = makeAnwendungsreferenz(kassenart, laufendeDatenannahmeImJahr, billing);
    const dateiname = makeDateiname(dateiindikator, datenaustauschreferenz - 1); // todo: resaearch „verfahrensversion”, maybe in Auftragsdatei documentation?
    let messageNumber = 0;

    // according to section 4.2 Struktur der Datei, grouped for all three Rechnungsarten
    const nutzdaten = [
        UNB(absenderIK, empfaengerIK, datenaustauschreferenz, anwendungsreferenz, dateiindikator),
        ...forEachKostentraeger(invoices, rechnungsart).flatMap((invoices, invoiceIndex) => [
            ...forEachLeistungserbringerAndPflegekasse(invoices).flatMap((invoicesByPflegekasse, index) => [
                ...(invoicesByPflegekasse.length > 1 || rechnungsart == "3"
                    ? makeMessage("PLGA", true, mergeInvoices(invoices), billing, ++messageNumber, invoiceIndex, index)
                    : []),
                ...invoicesByPflegekasse.flatMap(invoice => [
                    ...makeMessage("PLGA", false, invoice, billing, ++messageNumber, invoiceIndex, index),
                    ...makeMessage("PLAA", false, invoice, billing, ++messageNumber, invoiceIndex, index)
                ])
            ])
        ]),
        UNZ(messageNumber, datenaustauschreferenz)
    ].join(linebreak);

    return {
        dateiname,
        absenderIK,
        empfaengerIK,
        datenaustauschreferenz,
        anwendungsreferenz,
        dateiindikator,
        nutzdaten
    } as BillingFile;
};

const forEachKostentraeger = (invoices: Invoice[], rechnungsart: RechnungsartSchluessel) => 
    structureForRechnungsart(
        invoices.flatMap(invoice => 
            groupFaelleByKostentraeger(invoice.faelle)
                .flatMap(faelle => groupByLeistungsart(faelle))
                .map(faelle => ({
                    ...invoice,
                    faelle 
                } as Invoice))
        ), rechnungsart
    );

const groupFaelleByKostentraeger = (faelle: Abrechnungsfall[]) =>
    valuesGroupedBy(faelle, fall => fall.versicherter.kostentraegerIK);

const groupByLeistungsart = (faelle: Abrechnungsfall[]) => faelle
    .map(fall => {
        return fall.einsaetze.map(einsatz =>
            valuesGroupedBy(einsatz.leistungen, leistung => leistung.leistungsart)
                .map(leistungen => ({ ...einsatz, leistungen } as Einsatz))
        ).map(einsaetze => ({ ...fall, einsaetze } as Abrechnungsfall))
    });

const structureForRechnungsart = (invoices: Invoice[], rechnungsart: RechnungsartSchluessel) =>
    rechnungsart != "3"
        ? [invoices]
        : groupInvoicesByKostentraeger(invoices);

const groupInvoicesByKostentraeger = (invoices: Invoice[]) => 
    valuesGroupedBy(invoices, invoice => invoice.faelle[0].versicherter.kostentraegerIK);

const forEachLeistungserbringerAndPflegekasse = (invoices: Invoice[]) => invoices.map(invoice =>
    valuesGroupedBy(invoice.faelle, fall => fall.versicherter.pflegekasseIK)
        .map(faelle => ({ ...invoice, faelle } as Invoice))
);

const mergeInvoices = (invoices: Invoice[]) => ({
    leistungserbringer: {...invoices[0].leistungserbringer},
    faelle: invoices.flatMap(invoice => invoice.faelle)
} as Invoice)


const makeMessage = (
    messageIdentifier: MessageIdentifiers,
    sammelrechnung: boolean,
    invoice: Invoice,
    billing: BillingData,
    messageNumber: number,
    invoiceIndex: number,
    leistungserbringerIndex: number,
) => {
    const segments = messageIdentifier == "PLGA"
        ? makePLGA(invoice, billing, invoiceIndex, leistungserbringerIndex, sammelrechnung)
        : makePLAA(invoice, billing, invoiceIndex, leistungserbringerIndex);

    return [
        UNH(messageNumber, messageIdentifier),
        ...segments,
        UNT(segments.length, messageNumber)
    ]
}

// see 4.4.1 Nachrichtentyp Gesamtaufstellung der Abrechnung (PLGA)
const makePLGA = (
    invoice: Invoice,
    billing: BillingData,
    invoiceIndex: number,
    leistungserbringerIndex: number,
    sammelrechnung: boolean
) => [
    FKT("01", invoice.leistungserbringer, invoice.faelle[0].versicherter, sammelrechnung),
    REC(billing, invoiceIndex, leistungserbringerIndex, sammelrechnung),
    SRD(invoice.leistungserbringer, invoice.faelle[0].einsaetze[0].leistungen[0].leistungsart),
    UST(invoice.leistungserbringer),
    GES(calculateInvoice(invoice)),
    NAM(invoice.leistungserbringer)
];

// see 4.4.2 Nachrichtentyp Abrechnungsdaten (PLAA)
const makePLAA = (
    invoice: Invoice,
    billing: BillingData,
    invoiceIndex: number,
    leistungserbringerIndex: number,
) => [
    FKT("01", invoice.leistungserbringer, invoice.faelle[0].versicherter),
    REC(billing, invoiceIndex, leistungserbringerIndex, false),
    ...invoice.faelle.flatMap(fall => [
        INV(fall.versicherter.versichertennummer, fall.eindeutigeBelegnummer),
        NAD(fall.versicherter),
        ...forEachMonat(fall.einsaetze).flatMap(einsaetze => [
            MAN(einsaetze[0].leistungsBeginn, fall.versicherter.pflegegrad),
            ...forEachVerguetungsart(einsaetze).flatMap(einsatz => [
                ESK(einsatz.leistungsBeginn, einsatz.verguetungsart),
                ...einsatz.leistungen.flatMap(leistung => [
                    ELS(leistung),
                    ...leistung.zuschlaege.map((zuschlag, index) =>
                        ZUS(
                            index == leistung.zuschlaege.length - 1,
                            invoice.leistungserbringer.tarifbereich, 
                            zuschlag,
                            0 // todo: calculate ergebis
                        )
                    ),
                    ...leistung.hilfsmittel 
                        ? [HIL(
                            leistung.hilfsmittel, 
                            calculateHilfsmittel(leistung.einzelpreis, leistung.hilfsmittel)
                        )] : []
                ])
            ])
        ]),
        IAF(calculateFall(fall))
    ]),
];

const forEachMonat = (einsaetze: Einsatz[]) => 
    valuesGroupedBy(einsaetze, einsatz => einsatz.leistungsBeginn.getMonth().toString());

const forEachVerguetungsart = (einsaetze: Einsatz[]) => einsaetze.flatMap(einsatz =>
    entriesGroupedBy(einsatz.leistungen, leistung => leistung.verguetungsart)
    .map(([verguetungsart, leistungen]) => ({
        verguetungsart,
        leistungen,
        leistungsBeginn: einsatz.leistungsBeginn
    }))
);

export const calculateInvoice = (invoice: Invoice) => invoice.faelle
    .reduce((result, fall) => {
        const amounts = calculateFall(fall);
        result.gesamtbruttobetrag += amounts.gesamtbruttobetrag;
        result.rechnungsbetrag += amounts.rechnungsbetrag;
        result.zuzahlungsbetrag += amounts.zuzahlungsbetrag;
        result.beihilfebetrag += amounts.beihilfebetrag;
        result.mehrwertsteuerbetrag += amounts.mehrwertsteuerbetrag;
        return result;
    }, makeAmounts());

export const calculateFall = (fall: Abrechnungsfall) => fall.einsaetze
    .flatMap(einsatz => einsatz.leistungen)
    .reduce((result, {einzelpreis, anzahl, hilfsmittel}) => {
        const value = einzelpreis * anzahl;
        result.rechnungsbetrag += value;
        result.zuzahlungsbetrag += (hilfsmittel?.zuzahlungsbetrag || 0);
        result.gesamtbruttobetrag += value + calculateHilfsmittel(einzelpreis, hilfsmittel);
        return result;
    }, makeAmounts());

const calculateHilfsmittel = (
    einzelpreis: number,
    hilfsmittel?: Hilfsmittel
) => einzelpreis * mehrwertsteuersaetze[hilfsmittel?.mehrwertsteuerart || ""];

const makeAmounts = () => ({
    gesamtbruttobetrag: 0,
    rechnungsbetrag: 0,
    zuzahlungsbetrag: 0,
    beihilfebetrag: 0,
    mehrwertsteuerbetrag: 0,
});