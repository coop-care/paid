import { Address, Ansprechpartner, Institution, Versicherter } from "./types"
import { 
    arrayConstraints, valueConstraints,
    isArray, isChar, isVarchar, isDate, isIK, isInt, isRequired,
    isOptionalChar, isOptionalVarchar,
    error, isTruncatedIfTooLong,
} from "./validation/utils"


export const constraintsIKToSondertarif = (r: Record<string, string>) => 
    Object.keys(r).flatMap(ik => [
        // this is a requirement for a key, not a value: Each key must be an IK
        /\d{9}/.test(ik) ? undefined : error("institutionskennzeichenIncorrect", ik),
        // and each value must be a three-character string
        isChar(r, ik, 3)
    ])

export const constraintsIKToDatenaustauschreferenz = (r: Record<string, string>) => 
    Object.keys(r).flatMap(ik => [
        // this is a requirement for a key, not a value: Each key must be an IK
        /\d{9}/.test(ik) ? undefined : error("institutionskennzeichenIncorrect", ik),
        // and each value must be a number from 1 to 9999
        isInt(r, ik, 1, 1e5)
    ])

export const constraintsIKToLfdDatenannahmeimJahr = (r: Record<string, string>) => 
    Object.keys(r).flatMap(ik => [
        // this is a requirement for a key, not a value: Each key must be an IK
        /\d{9}/.test(ik) ? undefined : error("institutionskennzeichenIncorrect", ik),
        // and each value must be a number from 1 to 99
        isInt(r, ik, 1, 100)
    ])

export const constraintsInstitution = (i: Institution) => [
    isTruncatedIfTooLong(isVarchar(i, "name", 30)),
    isIK(i, "ik"),
    isTruncatedIfTooLong(isArray(i, "ansprechpartner", 0, 3)),
    ...arrayConstraints(i, "ansprechpartner", constraintsAnsprechpartner),
    isTruncatedIfTooLong(isOptionalVarchar(i, "email", 70))
]

const constraintsAnsprechpartner = (a: Ansprechpartner) => {
    const phoneNumberLength = a.phone ? a.phone?.length + 2 : 0
    return [
        isTruncatedIfTooLong(isOptionalVarchar(a, "phone", 30)),
        // how much space there is left for the name depends on the length of the phone number, if any
        isTruncatedIfTooLong(isVarchar(a, "name", 30 - phoneNumberLength))
    ]
}

export const constraintsVersicherter = (v: Versicherter) => [
    isIK(v, "pflegekasseIK"),
    // the visible immutable part of versichertennummer are always 10 characters long
    isOptionalChar(v, "versichertennummer", 10),
    // no constraints for optional versichertenstatus (should be (up to) 5 digits though)
    isTruncatedIfTooLong(isVarchar(v, "firstName", 30)), // 45 for SGB XI 
    isTruncatedIfTooLong(isVarchar(v, "lastName", 45)), // 47 for SGB V
    isDate(v, "birthday"),
    // if versichertennummer or versichertenstatus is not specified, address is mandatory
    !v.versichertennummer || !v.versichertenstatus ? isRequired(v, "address") : undefined,
    ...valueConstraints<Address>(v, "address", constraintsAddress),
]

const constraintsAddress = (a: Address) => [
    isTruncatedIfTooLong(isVarchar(a, "street", 24)), // street + housenumber is max 30, 46 for SGB XI
    isTruncatedIfTooLong(isVarchar(a, "houseNumber", 5)), // 9 for SGB XI
    isTruncatedIfTooLong(isVarchar(a, "postalCode", 7)), // 10 for SGB XI
    isTruncatedIfTooLong(isVarchar(a, "city", 25)), // 40 for SGB XI
    /* SGB XI in general allows for longer address strings, but when both are used, I guess a 
       warning should be emitted when the string is too long for any SGB ...*/
]
