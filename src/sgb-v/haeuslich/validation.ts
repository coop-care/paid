import { 
    arrayConstraints, isArray, isDate, isNumber, isRequired, valueConstraints
} from "../../validation/utils"
import { 
    Verordnung 
} from "../types"
import { 
    constraintsVerordnung,
    constraintsBaseAbrechnungsfall,
    constraintsBaseAbrechnungsposition
} from "../validation"
import { 
    HaeuslicheKrankenpflegeEinzelPositionsnummer as EinzelPositionsnummer, 
    HaeuslicheKrankenpflegePauschalePositionsnummer as PauschalePositionsnummer
} from "./codes"
import { 
    Abrechnungsfall, 
    Abrechnungsposition, 
    Einsatz,
    Einzelposition
} from "./types"

export const constraintsAbrechnungsfall = (a: Abrechnungsfall) => [
    ...constraintsBaseAbrechnungsfall(a),
    isArray(a, "einsaetze", 1),
    ...arrayConstraints<Einsatz>(a, "einsaetze", constraintsEinsatz),
    isArray(a, "verordnungen", 1),
    ...arrayConstraints<Verordnung>(a, "verordnungen", constraintsVerordnung),
]

const constraintsEinsatz = (e: Einsatz) => [
    isDate(e, "leistungsBeginn"),
    isDate(e, "leistungsEnde"),
    isArray(e, "abrechnungspositionen", 1),
    ...arrayConstraints<Abrechnungsposition>(e, "abrechnungspositionen", constraintsAbrechnungsposition)
]

const constraintsAbrechnungsposition = (p: Abrechnungsposition) => {
    if ("einzelpositionen" in p) {
        return [
            ...constraintsBaseAbrechnungsposition(p), 
            isRequired(p, "positionsnummer"),
            ...valueConstraints<PauschalePositionsnummer>(p, "positionsnummer", constraintsPauschalePositionsnummer),
            isArray(p, "einzelpositionen", 1),
            ...arrayConstraints<Einzelposition>(p, "einzelpositionen", constraintsEinzelposition)
        ]
    } else {
        return [
            ...constraintsBaseAbrechnungsposition(p), 
            isRequired(p, "positionsnummer"),
            ...valueConstraints<EinzelPositionsnummer>(p, "positionsnummer", constraintsEinzelPositionsnummer),
        ]
    }
}

const constraintsEinzelposition = (e: Einzelposition) => [
    isNumber(e, "anzahl", 1, 1e4),
    isRequired(e, "positionsnummer"),
    ...valueConstraints<EinzelPositionsnummer>(e, "positionsnummer", constraintsEinzelPositionsnummer),
]

const constraintsPauschalePositionsnummer = (p: PauschalePositionsnummer) => [
    isRequired(p, "gesetzlicheLebensgrundlage"),
    isRequired(p, "verguetungsArt"),
    isRequired(p, "versorgungsArt")
]

const constraintsEinzelPositionsnummer = (p: EinzelPositionsnummer) => [
    isRequired(p, "gesetzlicheLebensgrundlage"),
    isRequired(p, "verguetungsArt"),
    isRequired(p, "versorgungsArt")
]
