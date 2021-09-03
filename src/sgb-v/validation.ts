import { 
    Versicherter
} from "../types"
import { 
    constraintsInstitution, 
    constraintsVersicherter, 
    constraintsIKToSondertarif
} from "../validation"
import { 
    isRequired, isDate, isArray, isVarchar, isNumber, isOptionalInt, isInt,
    isTruncatedIfTooLong, isOptionalVarchar,
    arrayConstraints, valueConstraints,
} from "../validation/utils"
import { 
    BaseAbrechnungsfall,
    BaseAbrechnungsposition,
    Diagnose,
    Kostenzusage,
    Leistungserbringer,
    Skonto,
    Verordnung, 
} from "./types"

// Einzelrechnung, Rechnung, Sammelrechnung are not validated because they will be just intermediate
// data structures, not exposed to the user of the library

export const constraintsLeistungserbringer = (leistungserbringer: Leistungserbringer) => [
    ...constraintsInstitution(leistungserbringer),
    isRequired(leistungserbringer, "abrechnungscode"),
    isRequired(leistungserbringer, "tarifbereich"),
    isRequired(leistungserbringer, "location"),
    isRequired(leistungserbringer, "sondertarifJeKostentraegerIK"),
    ...valueConstraints<Record<string, string>>(leistungserbringer, "sondertarifJeKostentraegerIK", constraintsIKToSondertarif),
    isOptionalVarchar(leistungserbringer, "umsatzsteuerOrdnungsnummer", 20),
    // umsatzsteuerBefreiung is optional
]

export const constraintsBaseAbrechnungsfall = (fall: BaseAbrechnungsfall) => [
    isRequired(fall, "versicherter"), 
    ...valueConstraints<Versicherter>(fall, "versicherter", constraintsVersicherter),
    isVarchar(fall, "belegnummer", 10),
    // beleginformation is optional
    isOptionalVarchar(fall, "besondereVersorgungsform", 25)
]

export const constraintsBaseAbrechnungsposition = (position: BaseAbrechnungsposition) => [
    isNumber(position, "einzelpreis", 0, 1e10),
    isNumber(position, "anzahl", 1, 1e4),
    isOptionalInt(position, "gefahreneKilometer", 0, 1e6),
    isTruncatedIfTooLong(isOptionalVarchar(position, "text", 70))
]

export const constraintsVerordnung = (verordnung: Verordnung) => [
    isOptionalVarchar(verordnung, "betriebsstaettennummer", 9),
    isOptionalVarchar(verordnung, "vertragsarztnummer", 9),
    isDate(verordnung, "verordnungsDatum"),
    // unfall, sonstigeEntschaedigung, verordnungsBesonderheiten are optional
    isArray(verordnung, "diagnosen", 0),
    ...arrayConstraints<Diagnose>(verordnung, "diagnosen", constraintsDiagnose),
    isArray(verordnung, "kostenzusagen", 1),
    ...arrayConstraints<Kostenzusage>(verordnung, "kostenzusagen", constraintsKostenzusage),
]

const constraintsDiagnose = (diagnose: Diagnose) => [
    isOptionalVarchar(diagnose, "diagnoseschluessel", 12),
    isTruncatedIfTooLong(isOptionalVarchar(diagnose, "diagnosetext", 70))
]

const constraintsKostenzusage = (kostenzusage: Kostenzusage) => [
    isVarchar(kostenzusage, "genehmigungsKennzeichen", 20),
    isDate(kostenzusage, "genehmigungsDatum"),
    isRequired(kostenzusage, "kostenzusageGenehmigung")
]

export const constraintsSkonto = (skonto: Skonto) => [
    isNumber(skonto, "skontoPercent", 0, 100),
    isInt(skonto, "skontoPercent", 0, 1000)
]
