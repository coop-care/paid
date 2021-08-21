import { 
    Umsatzsteuer
} from "../types"
import { 
    constraintsIKToSondertarif,
    constraintsUmsatzsteuer,
    constraintsVersicherter
} from "../validation"
import { 
    arrayConstraints, valueConstraints, isTruncatedIfTooLong, 
    isArray, isChar, isDate, isNumber, isVarchar, isRequired, 
    isOptionalDate, isOptionalInt, isOptionalNumber, isOptionalVarchar,
} from "../validation/utils"
import { 
    Leistung,
    Pflegehilfsmittel,
    Zuschlag,
    Einsatz,
    Abrechnungsfall,
    Leistungserbringer,
    Invoice
} from "./types"

export const constraintsInvoice = (i: Invoice) => [
    isRequired(i, "leistungserbringer"),
    ...valueConstraints<Leistungserbringer>(i, "leistungserbringer", constraintsLeistungserbringer),
    isArray(i, "faelle", 1),
    ...arrayConstraints<Abrechnungsfall>(i, "faelle", constraintsAbrechnungsfall)
]

const constraintsLeistungserbringer = (l: Leistungserbringer) => [
    isRequired(l, "abrechnungscode"),
    isRequired(l, "tarifbereich"),
    isRequired(l, "sondertarifJeKostentraegerIK"),
    ...valueConstraints<Record<string, string>>(l, "sondertarifJeKostentraegerIK", constraintsIKToSondertarif),
    ...valueConstraints<Umsatzsteuer>(l, "umsatzsteuer", constraintsUmsatzsteuer)
]

const constraintsAbrechnungsfall = (a: Abrechnungsfall) => [
    isRequired(a, "versicherter"),
    ...valueConstraints(a, "versicherter", constraintsVersicherter),
    isArray(a, "einsaetze", 1),
    ...arrayConstraints(a, "einsaetze", constraintsEinsatz)
]

const constraintsEinsatz = (e: Einsatz) => [
    isOptionalDate(e, "leistungsBeginn"),
    isArray(e, "leistungen", 1),
    ...arrayConstraints(e, "leistungen", constraintsLeistung)
]

const constraintsLeistung = (l: Leistung) => [
    isRequired(l, "leistungsart"),
    isRequired(l, "verguetungsart"),
    isRequired(l, "qualifikationsabhaengigeVerguetung"),
    isNumber(l, "einzelpreis", 0, 1e10),
    isNumber(l, "anzahl", 0, 1e4),
    isOptionalNumber(l, "punktwert", 0, 10),
    isOptionalInt(l, "punktzahl", 0, 1e4),
    isArray(l, "zuschlaege", 0),
    ...arrayConstraints(l, "zuschlaege", constraintsZuschlag),
    ...constraintsXLeistung(l)
]

const constraintsXLeistung = (l: Leistung) => {
    switch(l.verguetungsart) {
        case "01": return [
            isOptionalDate(l, "leistungsEnde"),
            isChar(l, "leistungskomplex", 3),
        ]
        case "02": return [
            isDate(l, "leistungsEnde"),
            isRequired(l, "zeiteinheit"),
            isRequired(l, "zeitart"),
        ]
        case "03": return [
            isDate(l, "leistungsEnde"),
            isRequired(l, "pflegesatz"),
        ]
        case "04": return [
            isDate(l, "leistungsBeginn"),
            isDate(l, "leistungsEnde"),
            isRequired(l, "pflegesatz"),
        ]
        case "05": return [
            isRequired(l, "hilfsmittel"),
            ...valueConstraints(l, "hilfsmittel", constraintsPflegehilfsmittel),
            isVarchar(l, "positionsnummer", 10),
        ]
        case "06": 
            if (l.wegegebuehren == "04") {
                return [ isNumber(l, "gefahreneKilometer", 0, 1e4) ]
            } else {
                return []
            }
        default: return []
    }
}

const constraintsZuschlag = (z: Zuschlag) => [
    isRequired(z, "zuschlagsart"),
    isRequired(z, "zuschlag"),
    // the text is mandatory if zuschlag = 00
    isTruncatedIfTooLong(
        z.zuschlag == "00" ? 
        isVarchar(z, "beschreibungZuschlagsart", 50) :
        isOptionalVarchar(z, "beschreibungZuschlagsart", 50)
    ),
    isRequired(z, "zuschlagszuordnung"),
    isRequired(z, "zuschlagsberechnung"),
    isRequired(z, "istAbzugStattZuschlag"),
    isNumber(z, "wert", 0, 1e4)
]

const constraintsPflegehilfsmittel = (p: Pflegehilfsmittel) => [
    // mehrwertsteuerart is optional
    isOptionalNumber(p, "gesetzlicheZuzahlungBetrag", 0, 1e10),
    isOptionalVarchar(p, "genehmigungskennzeichen", 15),
    isOptionalDate(p, "genehmigungsDatum"),
    // kennzeichenPflegehilfsmittel is optional
    isTruncatedIfTooLong(isOptionalVarchar(p, "bezeichnungPflegehilfsmittel", 30)),
    isOptionalVarchar(p, "produktbesonderheitenPflegehilfsmittel", 10),
    isOptionalVarchar(p, "inventarnummerPflegehilfsmittel", 20)
]
