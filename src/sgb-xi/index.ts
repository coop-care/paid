/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import {
    Invoice,
    Abrechnungsfall, 
    Einsatz,
    Leistung
} from "./types";
import { valuesGroupedBy } from "../utils";
import { LeistungsartSchluessel, RechnungsartSchluessel } from "./codes";
import { UNB, UNZ } from "./segments";
import { makePLAA, makePLGA } from "./message";
import { BillingData, GroupInvoiceByRecipientMethod, Recipient } from "../types";

/** 
 * # Structure
 * 
 * Depends on Rechnungsart (1,2,3) and Sammelrechnung (yes or no)
 * 
 * ### Rechnungsart 1
 * Used for health care service providers that do accounting themselves, have one Institutionskennzeichen
 * 
 * ```txt
 * for each Kostenträger:
 *   PLGA Sammelrechnung (mandatory if more than one Pflegekasse)
 *   for each Pflegekasse:
 *     PLGA Gesamtrechnung
 *     PLAA
 * ```
 * 
 * ### Rechnungsart 2
 * Used for 
 * - health care service providers that do accounting themselves but have multiple Institutionskennzeichen
 * - accounting centers without collecting power (Abrechnungsstelle ohne Inkassovollmacht)
 * 
 * Same structure as for Rechnungsart 1, only that the invoices for each Leistungserbringer are
 * listed one after another.
 * 
 * ```txt
 * for each Leistungserbringer:
 *   for each Kostenträger:
 *     PLGA Sammelrechnung (mandatory if more than one Pflegekasse)
 *     for each Pflegekasse:
 *       PLGA Gesamtrechnung
 *       PLAA
 * ```
 * 
 * ### Rechnungsart 3
 * Used for accounting centers with collecting power (Abrechnungsstelle mit Inkassovollmacht), i.e.
 * manages accounting for multiple health care service providers (Leistungserbringer).
 * 
 * Note that the structure is different from Rechnungsart 1 and 2. Leistungserbringer are grouped by
 * Kostenträgers, not the other way round!
 * 
 * ```txt
 * for each Kostenträger:
 *   PLGA Sammelrechnung (always mandatory)
 *   for each Leistungserbringer:
 *     for each Pflegekasse:
 *       PLGA Gesamtrechnung
 *       PLAA
 * ```
 */
export const makeNutzdaten = (
    billingData: BillingData,
    invoices: Invoice[],
    senderIK: string,
    recipientIK: string, 
    datenaustauschreferenz: number,
    anwendungsreferenz: string,
) => {
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
        UNB(senderIK, recipientIK, datenaustauschreferenz, anwendungsreferenz, billingData.testIndicator),
        ...mapEachKostentraeger(invoices, billingData.rechnungsart).flatMap(invoices => [
            ...mapEachLeistungserbringerAndPflegekasse(invoices).flatMap((invoicesByPflegekasse, index) => [
                ...makePLGA(++messageNumber, mergeInvoices(invoicesByPflegekasse), billingData, ++invoiceIndex, index, true),
                ...invoicesByPflegekasse.flatMap((invoice, leistungserbringerIndex) => [
                    ...makePLGA(++messageNumber, invoice, billingData, invoiceIndex, leistungserbringerIndex, false),
                    ...makePLAA(++messageNumber, invoice, billingData, invoiceIndex, leistungserbringerIndex)
                ])
            ])
        ]),
        UNZ(messageNumber, datenaustauschreferenz)
    ].join("");

    // console.log(indentNutzdaten(nutzdaten));

    return nutzdaten;
};

const sortByLeistungsBeginn = (a: Einsatz | Leistung, b: Einsatz | Leistung) =>
    (a?.leistungsBeginn?.getTime() || Number.MAX_VALUE)
    - (b?.leistungsBeginn?.getTime() || Number.MAX_VALUE);

const mapEachKostentraeger = (
    invoices: Invoice[], 
    rechnungsart: RechnungsartSchluessel,
): Invoice[][] => 
    structureForRechnungsart(
        invoices.flatMap(invoice => 
            groupFaelleByKostentraeger(invoice.faelle)
                .map(faelle => ({
                    ...invoice,
                    faelle: groupByLeistungsart(faelle)
                } as Invoice))
        ),
        rechnungsart
    );

const groupFaelleByKostentraeger = (faelle: Abrechnungsfall[]): Abrechnungsfall[][] =>
    valuesGroupedBy(faelle, fall => fall.versicherter.kostentraegerIK || "");

/** 
 * split an array of Abrechnungsfälle based on the property leistungsart 
 * that is stored deep down the nested structure on each leistung
 * because each Abrechnungsfall has to be for one kind of leistungsart only
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

const structureForRechnungsart = (
    invoices: Invoice[], 
    rechnungsart: RechnungsartSchluessel,
): Invoice[][] =>
    rechnungsart != "3"
        ? [invoices]
        : groupInvoicesByKostentraeger(invoices);

const groupInvoicesByKostentraeger = (invoices: Invoice[]): Invoice[][] =>
    valuesGroupedBy(invoices, invoice => invoice.faelle[0].versicherter.kostentraegerIK || "");

const mapEachLeistungserbringerAndPflegekasse = (invoices: Invoice[]): Invoice[][] => 
    invoices.map(invoice =>
        valuesGroupedBy(invoice.faelle, fall => fall.versicherter.pflegekasseIK)
            .map(faelle => ({ ...invoice, faelle } as Invoice))
    );

const mergeInvoices = (invoices: Invoice[]): Invoice => ({
    leistungserbringer: {...invoices[0].leistungserbringer},
    faelle: invoices.flatMap(invoice => invoice.faelle)
})

// - group by recipient

export const groupInvoiceByRecipient: GroupInvoiceByRecipientMethod = (invoice, findRecipient) => {
    const invoiceByRecipient: Record<string, {recipient?: Recipient, invoice: Invoice}> = {};
    const location = invoice.leistungserbringer.location;

    groupByLeistungsart(invoice.faelle).forEach(fall => {
        const { key, recipient, kostentraegerIK } = findRecipient(
            fall.versicherter.pflegekasseIK,
            { sgbxiLeistungsart: fall.einsaetze[0]?.leistungen[0]?.leistungsart },
            location,
        );

        fall.versicherter.kostentraegerIK = kostentraegerIK;

        if (!invoiceByRecipient[key]) {
            invoiceByRecipient[key] = {
                recipient,
                invoice: {
                    ...invoice,
                    faelle: [fall]
                }
            };
        } else {
            invoiceByRecipient[key].invoice.faelle.push(fall);
        }
    });

    return invoiceByRecipient;
}


// - debug helper

const indentNutzdaten = (nutzdaten: string) => 
    nutzdaten.split("\n").slice(0, -1)
        .map((line, index, list) => `"${line}\\n"` + (index < list.length - 1 ? " +" : ""))
        .map(line => line
            .replace(/^"(UNB|UNZ|UNH|UNT)/, "  \"$1")
            .replace(/^"(FKT|REC|SRD|UST|GES|NAM|INV|IAF)/, "      \"$1")
            .replace(/^"(NAD|MAN|ESK|ELS|HIL|ZUS)/, "          \"$1"))
        .join("\n")
