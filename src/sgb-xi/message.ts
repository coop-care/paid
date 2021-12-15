/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import { BillingData } from "../types";
import {
    MessageIdentifiers,
    Invoice,
    Abrechnungsfall,
} from "./types";
import { ELS, ESK, FKT, GES, HIL, IAF, INV, MAN, NAD, NAM, REC, SRD, UNH, UNT, UST, ZUS } from "./segments";
import { absenderAndRechnungssteller } from "../transmission/utils";
import { valuesGroupedBy } from "../utils";
import { calculateFall, calculateHilfsmittelMehrwertsteuer, calculateInvoice } from "./calculation";

// see 4.4.1 Nachrichtentyp Gesamtaufstellung der Abrechnung (PLGA)
export const makePLGA = (
    messageNumber: number,
    invoice: Invoice,
    billing: BillingData,
    invoiceIndex: number,
    leistungserbringerIndex: number,
    isSammelrechnungPLGA: boolean
) => wrapMessage("PLGA", messageNumber, [
        FKT("01", absenderAndRechnungssteller(billing, invoice), invoice.faelle[0].versicherter, isSammelrechnungPLGA),
        REC(billing, invoiceIndex, leistungserbringerIndex, isSammelrechnungPLGA),
        SRD(invoice.leistungserbringer, invoice.faelle[0]),
        ...(isSammelrechnungPLGA
            ? []
            : [UST(invoice.leistungserbringer)]
        ),
        GES(calculateInvoice(invoice)),
        NAM(billing.rechnungsart != "3" || !billing.abrechnungsstelle ? invoice.leistungserbringer : billing.abrechnungsstelle)
    ]);

// see 4.4.2 Nachrichtentyp Abrechnungsdaten (PLAA)
export const makePLAA = (
    messageNumber: number,
    invoice: Invoice,
    billing: BillingData,
    invoiceIndex: number,
    leistungserbringerIndex: number,
) => wrapMessage("PLAA", messageNumber, [
        FKT("01", absenderAndRechnungssteller(billing, invoice), invoice.faelle[0].versicherter),
        REC(billing, invoiceIndex, leistungserbringerIndex, false),
        ...groupByMonth(invoice.faelle).flatMap((fall, belegNummer) => [
            INV(fall.versicherter.versichertennummer, belegNummer),
            NAD(fall.versicherter),
            MAN(fall.einsaetze[0].leistungsBeginn || billing.abrechnungsmonat, fall.versicherter.pflegegrad!),
            ...fall.einsaetze.flatMap(einsatz => [
                ESK(einsatz.leistungsBeginn),
                ...einsatz.leistungen.flatMap(leistung => [
                    ELS(leistung),
                    ...leistung.zuschlaege.map((zuschlag, index) =>
                        ZUS(
                            index == leistung.zuschlaege.length - 1,
                            invoice.leistungserbringer.tarifbereich,
                            zuschlag,
                            0 // todo: calculate ergebnis
                        )
                    ),
                    ...leistung.verguetungsart == "05"
                        ? [HIL(
                            leistung.hilfsmittel,
                            calculateHilfsmittelMehrwertsteuer(leistung.einzelpreis, leistung.hilfsmittel)
                        )] : []
                ])
            ]),
            IAF(calculateFall(fall))
        ]),
    ]);

const wrapMessage = (
    messageIdentifier: MessageIdentifiers,
    messageNumber: number,
    segments: any[]
) =>[
        UNH(messageNumber, messageIdentifier),
        ...segments,
        UNT(segments.length, messageNumber)
    ];

const groupByMonth = (faelle: Abrechnungsfall[]) => faelle.flatMap(fall => [
    ...valuesGroupedBy(fall.einsaetze, ({ leistungsBeginn, leistungen }) =>
        (leistungsBeginn || leistungen.find(leistung => !!leistung.leistungsBeginn)?.leistungsBeginn)
            ?.getMonth().toString() || ""
    ).flatMap(einsaetze => ({
        ...fall,
        einsaetze
    } as Abrechnungsfall))
]);

