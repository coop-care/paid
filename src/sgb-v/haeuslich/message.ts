/** based on documents: 
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.4 SLLA: C (Häusliche Krankenpflege)
 *  - Sonstige Leistungserbringer, Technische Anlage 1 für die maschinelle Abrechnung, 
 *    Kapitel 5.5.3.5 SLLA: D (Haushaltshilfe)
 *  - Verordnungsformular für häusliche Krankenpflege: Muster 12
 * 
  * see docs/documents.md for more info
  */

import { elements } from "../../edifact/builder"
import { Message, Segment } from "../../edifact/types"
import { sum } from "../../utils"
import { HaeuslicheLeistungserbringerSammelgruppenSchluessel } from "../codes"
import { INV, NAD, TXT, DIA, SKZ, FKT, REC } from "../segments_slla"
import { 
    calculateBruttobetrag, 
    createLeistungserbringergruppe,
    Einzelrechnung
} from "../types"
import { 
    einsatzSegment,
    BES,
    ELP,
    einzelfallnachweisSegment,
    verordnungSegment
} from "./segments"
import { 
    Abrechnungsfall,
    PauschaleAbrechnungsposition
} from "./types"

/**
 * Make one SLLA C (häusliche Krankenpflege) or D (Haushaltshilfe) message.
 * 
 * The structure is (currently) the same for häusl. Krankenpflege and Haushaltshilfe, only the 
 * segment names differ.
 * 
 * There should be one message per combination of health insurance (Pflegekasse), 
 * health care service provider (Leistungserbringer) and payer (Kostenträger)
 */
export const makeMessage = (
    rechnung: Einzelrechnung,
    abrechnungsfaelle: Abrechnungsfall[]
): Message => {
    // all Einsaetze must be sorted chronologically
    abrechnungsfaelle.forEach(abrechnungsfall => {
        abrechnungsfall.einsaetze.sort((a, b) => 
        a.leistungsBeginn.getTime() - b.leistungsBeginn.getTime()
    )})

    const leGruppe = createLeistungserbringergruppe(rechnung.leistungserbringer, rechnung.kostentraegerIK)

    const type = rechnung.leistungsbereich as HaeuslicheLeistungserbringerSammelgruppenSchluessel

    return {
        header: elements(["SLLA", "16", "0", "0"]),
        segments: [
            FKT("01", rechnung),
            REC(rechnung),
            ...abrechnungsfaelle.flatMap(fall => [
                INV(fall),
                NAD(fall.versicherter),
                ...fall.einsaetze.flatMap(einsatz => [
                    einsatzSegment(type, einsatz.leistungsBeginn, einsatz.leistungsEnde),
                    ...einsatz.abrechnungspositionen.flatMap(position => [
                        einzelfallnachweisSegment(type, position, leGruppe),
                        // add TXT segment only if there is any text
                        position.text ? TXT(position.text) : undefined,
                        // add ELP segments only if there are any einzelpositionen (= position is a Pauschale)
                        ...("einzelpositionen" in position ? 
                            (position as PauschaleAbrechnungsposition).einzelpositionen.map(e => ELP(e)) : 
                            []
                        )
                    ])
                ]),
                ...fall.verordnungen.flatMap(verordnung => [
                    verordnungSegment(type, verordnung),
                    ...verordnung.diagnosen.map(d => DIA(d)),
                    ...verordnung.kostenzusagen.map(k => SKZ(k))
                ]),
                BES(sum(fall.einsaetze
                    .flatMap(einsatz => einsatz.abrechnungspositionen)
                    .map(calculateBruttobetrag)
                ))
            ])
        // some segments are left out conditionally (by returning undefined), so we need to filter those out
        ].filter(segment => segment !== undefined) as Segment[]
    }
}

/** Sum up all the values from the given individual Abrechnungspositions */
export const calculateGesamtsummen = (abrechnungsfaelle: Abrechnungsfall[]) => {
    const abrechnungspositionen = abrechnungsfaelle
        .flatMap(fall => fall.einsaetze)
        .flatMap(einsatz => einsatz.abrechnungspositionen)

    return {
        gesamtbruttobetrag: sum(abrechnungspositionen.map(calculateBruttobetrag)),
        zuzahlungUndEigenanteilBetrag: 0 // no Zuzahlung, Eigenanteil etc. for häusliche Krankenpflege
    }
}
