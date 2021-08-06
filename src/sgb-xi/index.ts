/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import { BillingData, Abrechnungsfall, Invoice, MessageIdentifiers, BillingFile, Hilfsmittel, Einsatz, Leistung } from "../types";
import { valuesGroupedBy } from "../utils";
import { LeistungsartSchluessel, MehrwertsteuerSchluessel, RechnungsartSchluessel } from "./codes";
import { makeAnwendungsreferenz, makeDateiname } from "./filenames";
import { ELS, ESK, FKT, GES, HIL, IAF, INV, MAN, NAD, NAM, REC, SRD, UNB, UNH, UNT, UNZ, UST, ZUS } from "./segments";

const mehrwertsteuersaetze: Record<MehrwertsteuerSchluessel, number> = {
    "": 0,
    "1": 0.19,
    "2": 0.07
};

const sortByLeistungsBeginn = (a: Einsatz | Leistung, b: Einsatz | Leistung) =>
    (a?.leistungsBeginn?.getTime() || Number.MAX_VALUE)
    - (b?.leistungsBeginn?.getTime() || Number.MAX_VALUE);

export const makeBillingFile = (
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
    const absenderIK = absender(billing, invoices[0]).ik;
    const datenaustauschreferenz = datenaustauschreferenzJeEmpfaengerIK[empfaengerIK] || 1;
    const laufendeDatenannahmeImJahr = laufendeDatenannahmeImJahrJeEmpfaengerIK[empfaengerIK] || 1;
    const anwendungsreferenz = makeAnwendungsreferenz(kassenart, laufendeDatenannahmeImJahr, billing);
    const dateiname = makeDateiname(dateiindikator, datenaustauschreferenz - 1); // todo: resaearch „verfahrensversion”, maybe in Auftragsdatei documentation?
    let messageNumber = 0;
    let invoiceIndex = 0;

    // sort leistungen und einsätze by start date
    invoices.forEach(invoice => 
        invoice.faelle.forEach(fall => {
            fall.einsaetze.forEach(einsatz =>
                einsatz.leistungen.sort(sortByLeistungsBeginn)
            );
            fall.einsaetze.sort(sortByLeistungsBeginn);
        })
    );

    // according to section 4.2 Struktur der Datei, grouped for all three Rechnungsarten
    const nutzdaten = [
        UNB(absenderIK, empfaengerIK, datenaustauschreferenz, anwendungsreferenz, dateiindikator),
        ...mapEachKostentraeger(invoices, rechnungsart).flatMap(invoices => [
            ...mapEachLeistungserbringerAndPflegekasse(invoices).flatMap((invoicesByPflegekasse, index) => [
                ...makeMessage("PLGA", true, mergeInvoices(invoicesByPflegekasse), billing, ++messageNumber, invoiceIndex, index),
                ...invoicesByPflegekasse.flatMap(invoice => [
                    ...makeMessage("PLGA", false, invoice, billing, ++messageNumber, invoiceIndex, index),
                    ...makeMessage("PLAA", false, invoice, billing, ++messageNumber, invoiceIndex++, index)
                ])
            ])
        ]),
        UNZ(messageNumber, datenaustauschreferenz)
    ].join("");

    // console.log(indentNutzdaten(nutzdaten));

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

const mapEachKostentraeger = (invoices: Invoice[], rechnungsart: RechnungsartSchluessel): Invoice[][] => 
    structureForRechnungsart(
        invoices.flatMap(invoice => 
            groupFaelleByKostentraeger(invoice.faelle)
                .map(faelle => ({
                    ...invoice,
                    faelle: groupByLeistungsart(faelle)
                } as Invoice))
        ), rechnungsart
    );

const groupFaelleByKostentraeger = (faelle: Abrechnungsfall[]): Abrechnungsfall[][] =>
    valuesGroupedBy(faelle, fall => fall.versicherter.kostentraegerIK);

/** 
 * split an array of Abrechnungsfälle based on the property leistungsart 
 * that is stored deep down the nested structure on each leistung
 * because each invoice has to be for one kind of leistungsart only
*/
const groupByLeistungsart = (faelle: Abrechnungsfall[]): Abrechnungsfall[] =>
    faelle.flatMap(fall =>
        existingLeistungsarten(fall.einsaetze) // find all unique leistungsarten in einseatze
        .map(leistungsart => ({
            ...fall,
            einsaetze: fall.einsaetze.map(einsatz => ({
                ...einsatz,
                leistungen: einsatz.leistungen.filter(leistung => 
                    leistung.leistungsart == leistungsart // keep every leistung that has the current leistungsart 
                )
            })).filter(einsatz => einsatz.leistungen.length) // remove every einsatz with empty leistungen
        }))
    );

const existingLeistungsarten = (einsaetze: Einsatz[]): LeistungsartSchluessel[] =>
    [...new Set(
        einsaetze.flatMap(einsatz => einsatz.leistungen).map(leistung => leistung.leistungsart)
    )];

const structureForRechnungsart = (invoices: Invoice[], rechnungsart: RechnungsartSchluessel): Invoice[][] =>
    rechnungsart != "3"
        ? [invoices]
        : groupInvoicesByKostentraeger(invoices);

const groupInvoicesByKostentraeger = (invoices: Invoice[]): Invoice[][] => 
    valuesGroupedBy(invoices, invoice => invoice.faelle[0].versicherter.kostentraegerIK);

const mapEachLeistungserbringerAndPflegekasse = (invoices: Invoice[]): Invoice[][] => 
    invoices.map(invoice =>
        valuesGroupedBy(invoice.faelle, fall => fall.versicherter.pflegekasseIK)
            .map(faelle => ({ ...invoice, faelle } as Invoice))
    );

const mergeInvoices = (invoices: Invoice[]): Invoice => ({
    leistungserbringer: {...invoices[0].leistungserbringer},
    faelle: invoices.flatMap(invoice => invoice.faelle)
})


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
    isSammelrechnungPLGA: boolean
) => [
    FKT("01", absenderAndRechnungssteller(billing, invoice), invoice.faelle[0].versicherter, isSammelrechnungPLGA),
    REC(billing, invoiceIndex, leistungserbringerIndex, isSammelrechnungPLGA),
    SRD(invoice.leistungserbringer, invoice.faelle[0]),
    ...(isSammelrechnungPLGA
        ? []
        : [UST(invoice.leistungserbringer)]
    ),
    GES(calculateInvoice(invoice)),
    NAM(billing.rechnungsart != "3" || !billing.abrechnungsstelle ? invoice.leistungserbringer : billing.abrechnungsstelle)
];

// see 4.4.2 Nachrichtentyp Abrechnungsdaten (PLAA)
const makePLAA = (
    invoice: Invoice,
    billing: BillingData,
    invoiceIndex: number,
    leistungserbringerIndex: number,
) => [
    FKT("01", absenderAndRechnungssteller(billing, invoice), invoice.faelle[0].versicherter),
    REC(billing, invoiceIndex, leistungserbringerIndex, false),
    ...groupByMonth(invoice.faelle).flatMap((fall, belegNummer) => [
        INV(fall.versicherter.versichertennummer, belegNummer),
        NAD(fall.versicherter),
        MAN(fall.einsaetze[0].leistungsBeginn || billing.abrechnungsmonat, fall.versicherter.pflegegrad),
        ...fall.einsaetze.flatMap(einsatz => [
            ESK(einsatz.leistungsBeginn),
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
        ]),
        IAF(calculateFall(fall))
    ]),
];

const groupByMonth = (faelle: Abrechnungsfall[]) => faelle.flatMap(fall => [
    ...valuesGroupedBy(fall.einsaetze, ({leistungsBeginn, leistungen}) => 
        (leistungsBeginn || leistungen.find(leistung => !!leistung.leistungsBeginn)?.leistungsBeginn)
            ?.getMonth().toString() || ""
    ).flatMap(einsaetze => ({
        ...fall,
        einsaetze
    } as Abrechnungsfall))
]);

const absenderAndRechnungssteller = (billing: BillingData, invoice: Invoice) => ({
    absender: absender(billing, invoice),
    rechnungssteller: rechnungssteller(billing, invoice),
});

/** 
 * @returns Leistungserbringer, der selbst abrechnet (Rechnungsart 1)
 *     oder Abrechnungsstelle (Rechnungsart 2 + 3)
 */
const absender = (
    {rechnungsart, abrechnungsstelle}: BillingData, 
    {leistungserbringer}: Invoice
) => rechnungsart == "1" || !abrechnungsstelle ? leistungserbringer : abrechnungsstelle;

/**
 * @returns Leistungserbringer (Rechnungsart 1 + 2) 
 *     oder Abrechnungsstelle mit Inkasssovollmacht (Rechnungsart 3)
 */
const rechnungssteller = (
    { rechnungsart, abrechnungsstelle }: BillingData,
    { leistungserbringer }: Invoice
) => rechnungsart != "3" || !abrechnungsstelle ? leistungserbringer : abrechnungsstelle;


// - calculation

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
        const zuzahlungsbetrag = (hilfsmittel?.zuzahlungsbetrag || 0);
        const beihilfebetrag = 0;
        const mehrwertsteuer = calculateHilfsmittel(einzelpreis, hilfsmittel);
        const gesamtbruttobetrag = value + mehrwertsteuer;
        result.gesamtbruttobetrag += gesamtbruttobetrag;
        result.rechnungsbetrag += gesamtbruttobetrag - zuzahlungsbetrag - beihilfebetrag;
        result.zuzahlungsbetrag += zuzahlungsbetrag;
        result.beihilfebetrag += beihilfebetrag;
        result.mehrwertsteuerbetrag += mehrwertsteuer;
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


// - debug helper

const indentNutzdaten = (nutzdaten: string) => 
    nutzdaten.split("\n").slice(0, -1)
        .map((line, index, list) => `"${line}\\n"` + (index < list.length - 1 ? " +" : ""))
        .map(line => line
            .replace(/^"(UNB|UNZ|UNH|UNT)/, "  \"$1")
            .replace(/^"(FKT|REC|SRD|UST|GES|NAM|INV|IAF)/, "      \"$1")
            .replace(/^"(NAD|MAN|ESK|ELS|HIL|ZUS)/, "          \"$1"))
        .join("\n")
