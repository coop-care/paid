import { 
    Umsatzsteuer,
    Versicherter
} from "../types"
import { 
    constraintsInstitution, 
    constraintsVersicherter, 
    constraintsUmsatzsteuer, 
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

export const constraintsLeistungserbringer = (l: Leistungserbringer) => [
    ...constraintsInstitution(l),
    isRequired(l, "abrechnungscode"),
    isRequired(l, "tarifbereich"),
    isRequired(l, "location"),
    isRequired(l, "sondertarifJeKostentraegerIK"),
    ...valueConstraints<Record<string, string>>(l, "sondertarifJeKostentraegerIK", constraintsIKToSondertarif),
    ...valueConstraints<Umsatzsteuer>(l, "umsatzsteuer", constraintsUmsatzsteuer)
]

export const constraintsBaseAbrechnungsfall = (a: BaseAbrechnungsfall) => [
    isRequired(a, "versicherter"), 
    ...valueConstraints<Versicherter>(a, "versicherter", constraintsVersicherter),
    isVarchar(a, "belegnummer", 10),
    // beleginformation is optional
    isOptionalVarchar(a, "besondereVersorgungsform", 25)
]

export const constraintsBaseAbrechnungsposition = (a: BaseAbrechnungsposition) => [
    isNumber(a, "einzelpreis", 0, 1e10),
    isNumber(a, "anzahl", 1, 1e4),
    isOptionalInt(a, "gefahreneKilometer", 0, 1e6),
    isTruncatedIfTooLong(isOptionalVarchar(a, "text", 70))
]

export const constraintsVerordnung = (v: Verordnung) => [
    isOptionalVarchar(v, "betriebsstaettennummer", 9),
    isOptionalVarchar(v, "vertragsarztnummer", 9),
    isDate(v, "verordnungsDatum"),
    // unfall, sonstigeEntschaedigung, verordnungsBesonderheiten are optional
    isArray(v, "diagnosen", 0),
    ...arrayConstraints<Diagnose>(v, "diagnosen", constraintsDiagnose),
    isArray(v, "kostenzusagen", 1),
    ...arrayConstraints<Kostenzusage>(v, "kostenzusagen", constraintsKostenzusage),
]

const constraintsDiagnose = (d: Diagnose) => [
    isOptionalVarchar(d, "diagnoseschluessel", 12),
    isTruncatedIfTooLong(isOptionalVarchar(d, "diagnosetext", 70))
]

const constraintsKostenzusage = (k: Kostenzusage) => [
    isVarchar(k, "genehmigungsKennzeichen", 20),
    isDate(k, "genehmigungsDatum"),
    isRequired(k, "kostenzusageGenehmigung")
]

export const constraintsSkonto = (s: Skonto) => [
    isNumber(s, "skontoPercent", 0, 100),
    isInt(s, "skontoPercent", 0, 1000)
]
