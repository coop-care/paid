/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import {
    Invoice,
    Abrechnungsfall,
    Pflegehilfsmittel
} from "./types";
import { MehrwertsteuerSchluessel } from "./codes";

const mehrwertsteuersaetze: Record<MehrwertsteuerSchluessel, number> = {
    "": 0,
    "1": 0.19,
    "2": 0.07
};

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
    .reduce((result, { einzelpreis, anzahl, hilfsmittel }) => {
        const value = einzelpreis * anzahl;
        const zuzahlungsbetrag = (hilfsmittel?.gesetzlicheZuzahlungBetrag || 0);
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

export const calculateHilfsmittel = (
    einzelpreis: number,
    hilfsmittel?: Pflegehilfsmittel
) => einzelpreis * mehrwertsteuersaetze[hilfsmittel?.mehrwertsteuerart || ""];

const makeAmounts = () => ({
    gesamtbruttobetrag: 0,
    rechnungsbetrag: 0,
    zuzahlungsbetrag: 0,
    beihilfebetrag: 0,
    mehrwertsteuerbetrag: 0,
});