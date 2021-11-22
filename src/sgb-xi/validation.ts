import { Versicherter } from "../types"
import {
    constraintsIKToSondertarif,
    constraintsInstitution,
    constraintsVersicherter
} from "../validation"
import { 
    arrayConstraints, valueConstraints, isTruncatedIfTooLong, 
    isArray, isDate, isNumber, isVarchar, isRequired, 
    isOptionalDate, isOptionalInt, isOptionalNumber, isOptionalVarchar,
} from "../validation/utils"
import { 
    Leistung,
    Pflegehilfsmittel,
    Zuschlag,
    Einsatz,
    Abrechnungsfall,
    Leistungserbringer,
    Invoice,
} from "./types"

export const constraintsInvoice = (invoice: Invoice) => [
    isRequired(invoice, "leistungserbringer"),
    ...valueConstraints<Leistungserbringer>(invoice, "leistungserbringer", constraintsLeistungserbringer),
    isArray(invoice, "faelle", 1),
    ...arrayConstraints<Abrechnungsfall>(invoice, "faelle", constraintsAbrechnungsfall)
]

const constraintsLeistungserbringer = (leistungserbringer: Leistungserbringer) => [
    ...constraintsInstitution(leistungserbringer),
    isRequired(leistungserbringer, "abrechnungscode"),
    isRequired(leistungserbringer, "tarifbereich"),
    isRequired(leistungserbringer, "sondertarifJeKostentraegerIK"),
    leistungserbringer.umsatzsteuerBefreiung != "01" ? isRequired(leistungserbringer, "umsatzsteuerOrdnungsnummer") : undefined,
    ...valueConstraints<Record<string, string>>(leistungserbringer, "sondertarifJeKostentraegerIK", constraintsIKToSondertarif),
]

const constraintsAbrechnungsfall = (fall: Abrechnungsfall) => [
    isRequired(fall, "versicherter"),
    ...valueConstraints<Versicherter>(fall, "versicherter", versicherter => constraintsVersicherter(versicherter, false)),
    isArray(fall, "einsaetze", 1),
    ...arrayConstraints(fall, "einsaetze", constraintsEinsatz)
]

const constraintsEinsatz = (einsatz: Einsatz) => [
    isOptionalDate(einsatz, "leistungsBeginn"),
    isArray(einsatz, "leistungen", 1),
    ...arrayConstraints(einsatz, "leistungen", constraintsLeistung)
]

const constraintsLeistung = (leistung: Leistung) => [
    isRequired(leistung, "leistungsart"),
    isRequired(leistung, "verguetungsart"),
    isRequired(leistung, "qualifikationsabhaengigeVerguetung"),
    isNumber(leistung, "einzelpreis", 0, 1e10),
    isNumber(leistung, "anzahl", 0, 1e4),
    isOptionalNumber(leistung, "punktwert", 0, 10),
    isOptionalInt(leistung, "punktzahl", 0, 1e4),
    isArray(leistung, "zuschlaege", 0),
    ...arrayConstraints(leistung, "zuschlaege", constraintsZuschlag),
    ...constraintsLeistungByVerguetungsart(leistung)
]

const constraintsLeistungByVerguetungsart = (leistung: Leistung) => {
    switch(leistung.verguetungsart) {
        case "01": return [
            isOptionalDate(leistung, "leistungsEnde"),
            isVarchar(leistung, "leistung", 3), // leistung = Leistungskomplex
        ]
        case "02": return [
            isDate(leistung, "leistungsEnde"),
            isRequired(leistung, "leistung"), // leistung = ZeiteinheitSchluessel + ZeitartSchluessel
        ]
        case "03": return [
            isDate(leistung, "leistungsEnde"),
            isRequired(leistung, "leistung"), // leistung = PflegesatzSchluessel
        ]
        case "04": return [
            isDate(leistung, "leistungsBeginn"),
            isDate(leistung, "leistungsEnde"),
            isRequired(leistung, "leistung"), // leistung = PflegesatzSchluessel
        ]
        case "05": return [
            isRequired(leistung, "hilfsmittel"),
            ...valueConstraints(leistung, "hilfsmittel", constraintsPflegehilfsmittel),
            isVarchar(leistung, "leistung", 10), // leistung = Positionsnummer
        ]
        case "06": 
            if (leistung.leistung == "04") { // leistung = WegegebuehrenSchluessel
                return [ isNumber(leistung, "gefahreneKilometer", 0, 1e4) ]
            } else {
                return []
            }
        default: return []
    }
}

const constraintsZuschlag = (zuschlag: Zuschlag) => [
    isRequired(zuschlag, "zuschlagsart"),
    isRequired(zuschlag, "zuschlag"),
    // the text is mandatory if zuschlag = 00
    isTruncatedIfTooLong(
        zuschlag.zuschlag == "00" ? 
        isVarchar(zuschlag, "beschreibungZuschlagsart", 50) :
        isOptionalVarchar(zuschlag, "beschreibungZuschlagsart", 50)
    ),
    isRequired(zuschlag, "zuschlagszuordnung"),
    isRequired(zuschlag, "zuschlagsberechnung"),
    isRequired(zuschlag, "istAbzugStattZuschlag"),
    isNumber(zuschlag, "wert", 0, 1e4)
]

const constraintsPflegehilfsmittel = (hilfsmittel: Pflegehilfsmittel) => [
    // mehrwertsteuerart is optional
    isOptionalNumber(hilfsmittel, "gesetzlicheZuzahlungBetrag", 0, 1e10),
    isOptionalVarchar(hilfsmittel, "genehmigungskennzeichen", 15),
    isOptionalDate(hilfsmittel, "genehmigungsDatum"),
    // kennzeichenPflegehilfsmittel is optional
    isTruncatedIfTooLong(isOptionalVarchar(hilfsmittel, "bezeichnungPflegehilfsmittel", 30)),
    isOptionalVarchar(hilfsmittel, "produktbesonderheitenPflegehilfsmittel", 10),
    isOptionalVarchar(hilfsmittel, "inventarnummerPflegehilfsmittel", 20)
]
