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

export const constraintsAbrechnungsfall = (fall: Abrechnungsfall) => [
    ...constraintsBaseAbrechnungsfall(fall),
    isArray(fall, "einsaetze", 1),
    ...arrayConstraints<Einsatz>(fall, "einsaetze", constraintsEinsatz),
    isArray(fall, "verordnungen", 1),
    ...arrayConstraints<Verordnung>(fall, "verordnungen", constraintsVerordnung),
]

const constraintsEinsatz = (einsatz: Einsatz) => [
    isDate(einsatz, "leistungsBeginn"),
    isDate(einsatz, "leistungsEnde"),
    isArray(einsatz, "abrechnungspositionen", 1),
    ...arrayConstraints<Abrechnungsposition>(einsatz, "abrechnungspositionen", constraintsAbrechnungsposition)
]

const constraintsAbrechnungsposition = (position: Abrechnungsposition) => {
    if ("einzelpositionen" in position) {
        return [
            ...constraintsBaseAbrechnungsposition(position), 
            isRequired(position, "positionsnummer"),
            ...valueConstraints<PauschalePositionsnummer>(position, "positionsnummer", constraintsPauschalePositionsnummer),
            isArray(position, "einzelpositionen", 1),
            ...arrayConstraints<Einzelposition>(position, "einzelpositionen", constraintsEinzelposition)
        ]
    } else {
        return [
            ...constraintsBaseAbrechnungsposition(position), 
            isRequired(position, "positionsnummer"),
            ...valueConstraints<EinzelPositionsnummer>(position, "positionsnummer", constraintsEinzelPositionsnummer),
        ]
    }
}

const constraintsEinzelposition = (position: Einzelposition) => [
    isNumber(position, "anzahl", 1, 1e4),
    isRequired(position, "positionsnummer"),
    ...valueConstraints<EinzelPositionsnummer>(position, "positionsnummer", constraintsEinzelPositionsnummer),
]

const constraintsPauschalePositionsnummer = (position: PauschalePositionsnummer) => [
    isRequired(position, "gesetzlicheLebensgrundlage"),
    isRequired(position, "verguetungsArt"),
    isRequired(position, "versorgungsArt")
]

const constraintsEinzelPositionsnummer = (position: EinzelPositionsnummer) => [
    isRequired(position, "gesetzlicheLebensgrundlage"),
    isRequired(position, "verguetungsArt"),
    isRequired(position, "versorgungsArt")
]
