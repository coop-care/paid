import { 
    Abrechnungsfall,
    Diagnose,
    Einsatz,
    Kostenzusage,
    Verordnung, 
} from "./types"

const constraintsAbrechnungsfall = (a: Abrechnungsfall) => [
    maxTextLength(a, "belegnummer", 10),
    maxTextLength(a, "besondereVersorgungsform", 25),
    ...valueConstraints<Versicherter>(a, "versicherter", constraintsVersicherter),
    notEmpty(a, "einsaetze"),
    ...arrayConstraints<Einsatz>(a, "einsaetze", constraintsEinsatz),
    notEmpty(a, "verordnungen"),
    ...arrayConstraints<Verordnung>(a, "verordnungen", constraintsVerordnung),
]

const constraintsVersicherter = (v: Versicherter) => [
    maxTextLength(v, "versichertennummer", 12),
    // if versichertennummer or versichertenstatus is not specified, address is mandatory
    !!v.versichertennummer && !!v.versichertenstatus || requireValue(v, "address"),
    textNotTruncated(v, "firstName", 30),
    textNotTruncated(v, "lastName", 47),
    ...valueConstraints<Address>(v, "address", constraintsAddress),
]

const constraintsAddress = (a: Address) => [
    textNotTruncated(a, "street", 24), // street + housenumber is max 30
    textNotTruncated(a, "houseNumber", 5),
    textNotTruncated(a, "postalCode", 7),
    textNotTruncated(a, "city", 25),
]

const constraintsVerordnung = (v: Verordnung) => [
    maxTextLength(v, "betriebsstaettennummer", 9),
    maxTextLength(v, "vertragsarztnummer", 9),
    ...arrayConstraints<Diagnose>(v, "diagnosen", constraintsDiagnose),
    notEmpty(v, "kostenzusagen"),
    ...arrayConstraints<Kostenzusage>(v, "kostenzusagen", constraintsKostenzusage),
]

const constraintsDiagnose = (d: Diagnose) => [
    maxTextLength(d, "diagnoseschluessel", 12),
    textNotTruncated(d, "diagnosetext", 70)
]

const constraintsKostenzusage = (k: Kostenzusage) => [
    maxTextLength(k, "genehmigungsKennzeichen", 20)
]


const error = (code: ValidationCode, property: string, params?: Record<string, string>): ValidationResult => ({
    code, type: ValidationResultType.Error, path: [property], params
})

export const notEmpty = (obj: any, key: string): ValidationResult | true => 
    obj[key] === undefined || obj[key].length > 0 || 
    error("arrayIsEmpty", key)

export const maxTextLength = (obj: any, key: string, maxLength: number): ValidationResult | true =>
    obj[key] === undefined || obj[key].length <= maxLength || 
    error("textIsTooLong", key, { maxLength: maxLength.toString() })

export const textNotTruncated = (obj: any, key: string, maxLength: number): ValidationResult | true =>
    obj[key] === undefined || obj[key].length <= maxLength || 
    error("textIsTruncated", key, { maxLength: maxLength.toString() })

export const requireValue = (obj: any, key: string): ValidationResult | true =>
    obj[key] !== undefined ||
    error("requiredValueMissing", key)

export const arrayConstraints = <T>(
    obj: any,
    key: string,
    perItemConstraints: (item: T) => Array<ValidationResult | true>
): Array<ValidationResult | true> => 
    obj[key] === undefined ? [] : (obj[key] as Array<T>).flatMap((item, i) => {
        const results = perItemConstraints(item)
        results.forEach(result => {
            if (result !== true) {
                result.path?.unshift(key)
                result.path?.unshift(i)
            }
        })
        return results
    })

export const valueConstraints = <T>(
    obj: any,
    key: string,
    itemConstraints: (item: T) => Array<ValidationResult | true>
): Array<ValidationResult | true>  => {
    if (obj[key] === undefined) {
        return []
    }
    const results = itemConstraints(obj[key] as T)
    results.forEach(result => {
        if (result !== true) {
            result.path?.unshift(key)
        }
    })
    return results
}





const onlyFailedConstraints = <T>(arr: Array<T | true>) => arr.filter(it => it !== true ) as Array<T>

const messages = {
    "requiredValueMissing": "The property \"{key}\" is required.",
    "arrayIsEmpty": "The property \"{key}\" must have at least one element.",

    "textIsTruncated": "The property \"{key}\" will be truncated, because it is longer than {maxLength} characters.",
    "textIsTooLong": "The property \"{key}\" may not be longer than {maxLength} characters.",
    "textHasIncorrectLength": "The property \"{key}\" must have exactly {length} characters.",
    
    "lessThanMinimumValue": "The property \"{key}\" may not be less than {minValue}.",
    "institutionskennzeichenIncorrect": "The property \"{key}\" must consist of 9 digits.",
    "invoiceNumberIncorrect": "The property \"{key}\" may only contain the characters a-z, A-Z, 0-9 and the separators '-' and '/', though it may not begin or end with a separator.",
}

export type ValidationPath = Array<string | number>

export type ValidationCode = keyof typeof messages

export enum ValidationResultType { Warning, Error }

export type ValidationResult = {
  code: ValidationCode
  type: ValidationResultType
  path: ValidationPath
  params?: Record<string, string>
  message?: string
}
