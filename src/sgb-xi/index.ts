import { BillingData, Abrechnungsfall, Einsatz, Invoice } from "../types";
import { RechnungsartSchluessel } from "./codes";
import { ELS, ESK, FKT, GES, IAF, INV, MAN, NAD, NAM, REC, SRD, UNB, UNH, UNT, UNZ, UST } from "./segments";

// const linebreak = "\n";

// export const makePayloadFile = (interchange: BillingData) => [
//     UNB(interchange),
//     ...interchange.invoices.flatMap((message, index) => [
//         UNH(index + 1, ""),
//         UNT(message.lineItems.length, index + 1),
//     ]),
//     UNZ(interchange.invoices.length, interchange.controlReference),
// ].join(linebreak);

// const sort = (interchange: BillingData) => {
//     return interchange.invoices.map(invoice => ({
//         ...invoice,
//         lineItemsByKostentraegerAndLeistungsart: 
//             valuesGroupedBy(invoice.lineItems, item => item.versicherter.kostentraegerIK)
//             .flatMap(items => groupByLeistungsart(items))
//     }))
// };

// const groupByLeistungsart = (items: Abrechnungsfall[]) =>
//     items.reduce((result, item) => {
//         const key = getKey(item)
//         result[key] = (result[key] || []).concat(item);
//         return result;
//     }, {} as Record<string, Abrechnungsfall[]>);

const makePLGA = (
    invoice: Invoice,
    rechnungsart: RechnungsartSchluessel,
    rechnungsnummer: string,
    leistungserbringerIndex: number,
    sammelrechnung: boolean
) => [
    FKT("01", invoice.careProvider, invoice.lineItems[0].versicherter, sammelrechnung),
    REC(rechnungsnummer, leistungserbringerIndex, sammelrechnung, invoice.date, rechnungsart),
    SRD(invoice.careProvider, invoice.lineItems[0].einsaetze[0].leistungen[0].leistungsart),
    UST(invoice.careProvider),
    GES(calculateGES(invoice)),
    NAM(invoice.careProvider)
];

const makePLAA = (
    invoice: Invoice,
    rechnungsart: RechnungsartSchluessel,
    rechnungsnummer: string,
    leistungserbringerIndex: number,
) => [
    FKT("01", invoice.careProvider, invoice.lineItems[0].versicherter),
    REC(rechnungsnummer, leistungserbringerIndex, false, invoice.date, rechnungsart),
    ...invoice.lineItems.flatMap(abrechnungsfall => [
        INV(abrechnungsfall.versicherter.versichertennummer, abrechnungsfall.eindeutigeBelegnummer),
        NAD(abrechnungsfall.versicherter),
        ...forEachMonat(abrechnungsfall.einsaetze).flatMap(einsaetze => [
            MAN(einsaetze[0].leistungsBeginn, abrechnungsfall.versicherter.pflegegrad),
            ...forEachVerguetungsart(einsaetze).flatMap(einsatz => [
                ESK(einsatz.leistungsBeginn, einsatz.verguetungsart),
                ...einsatz.leistungen.flatMap(leistung => [
                    ELS(leistung)
                ])
            ])
        ]),
        IAF(calculateIAF(abrechnungsfall))
    ])
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

const calculateGES = (invoice: Invoice) => invoice.lineItems
    .reduce((result, item) => {
        const amounts = calculateIAF(item);
        result.gesamtbruttobetrag += amounts.gesamtbruttobetrag;
        result.rechnungsbetrag += amounts.rechnungsbetrag;
        result.zuzahlungsbetrag += amounts.zuzahlungsbetrag;
        result.beihilfebetrag += amounts.beihilfebetrag;
        result.mehrwertsteuerbetrag += amounts.mehrwertsteuerbetrag;
        return result;
    }, makeAmounts());

const calculateIAF = (abrechnungsfall: Abrechnungsfall) => abrechnungsfall.einsaetze
    .flatMap(einsatz => einsatz.leistungen)
    .reduce((result, leistung) => {
        const value = leistung.einzelpreis * leistung.anzahl;
        result.rechnungsbetrag += value;
        result.gesamtbruttobetrag += value;
        return result;
    }, makeAmounts());

const makeAmounts = () => ({
    gesamtbruttobetrag: 0,
    rechnungsbetrag: 0,
    zuzahlungsbetrag: 0,
    beihilfebetrag: 0,
    mehrwertsteuerbetrag: 0,
});

const groupBy = <T, K extends string | number>(items: T[], getKey: (item: T) => K) =>
    items.reduce((result, item) => {
        const key = getKey(item)
        result[key] = (result[key] || []).concat(item);
        return result;
    }, {} as Record<K, T[]>);

const valuesGroupedBy = <T, K extends string>(items: T[], getKey: (item: T) => K) =>
    Object.values(groupBy(items, getKey)) as T[][];

const entriesGroupedBy = <T, K extends string>(items: T[], getKey: (item: T) => K) =>
    Object.entries(groupBy(items, getKey)) as [K, T[]][];

// ToDo:
// sort outer: rechnungsart 1 & 2
// sort outer: rechnungsart 3
// add HIL incl. calculation
// add ZUS incl. calculation