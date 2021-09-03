import { Address, Ansprechpartner, Institution, Versicherter } from "./types"
import { 
    arrayConstraints, valueConstraints,
    isArray, isChar, isVarchar, isDate, isIK, isInt, isRequired,
    isOptionalChar, isOptionalVarchar,
    error, isTruncatedIfTooLong,
} from "./validation/utils"


export const constraintsIKToSondertarif = (record: Record<string, string>) => 
    Object.keys(record).flatMap(ik => [
        // this is a requirement for a key, not a value: Each key must be an IK
        /\d{9}/.test(ik) ? undefined : error("institutionskennzeichenIncorrect", ik),
        // and each value must be a three-character string
        isChar(record, ik, 3)
    ])

export const constraintsIKToDatenaustauschreferenz = (record: Record<string, string>) => 
    Object.keys(record).flatMap(ik => [
        // this is a requirement for a key, not a value: Each key must be an IK
        /\d{9}/.test(ik) ? undefined : error("institutionskennzeichenIncorrect", ik),
        // and each value must be a number from 1 to 9999
        isInt(record, ik, 1, 1e5)
    ])

export const constraintsIKToLfdDatenannahmeimJahr = (r: Record<string, string>) => 
    Object.keys(r).flatMap(ik => [
        // this is a requirement for a key, not a value: Each key must be an IK
        /\d{9}/.test(ik) ? undefined : error("institutionskennzeichenIncorrect", ik),
        // and each value must be a number from 1 to 99
        isInt(r, ik, 1, 100)
    ])

export const constraintsInstitution = (institution: Institution) => [
    isTruncatedIfTooLong(isVarchar(institution, "name", 30)),
    isIK(institution, "ik"),
    isTruncatedIfTooLong(isArray(institution, "ansprechpartner", 0, 3)),
    ...arrayConstraints(institution, "ansprechpartner", constraintsAnsprechpartner),
    isTruncatedIfTooLong(isOptionalVarchar(institution, "email", 70))
]

const constraintsAnsprechpartner = (ansprechpartner: Ansprechpartner) => {
    const phoneNumberLength = ansprechpartner.phone ? ansprechpartner.phone?.length + 2 : 0
    return [
        isTruncatedIfTooLong(isOptionalVarchar(ansprechpartner, "phone", 30)),
        // how much space there is left for the name depends on the length of the phone number, if any
        isTruncatedIfTooLong(isVarchar(ansprechpartner, "name", 30 - phoneNumberLength))
    ]
}

export const constraintsVersicherter = (versicherter: Versicherter) => [
    isIK(versicherter, "pflegekasseIK"),
    // the visible immutable part of versichertennummer are always 10 characters long
    isOptionalChar(versicherter, "versichertennummer", 10),
    // no constraints for optional versichertenstatus (should be (up to) 5 digits though)
    isTruncatedIfTooLong(isVarchar(versicherter, "firstName", 30)), // 45 for SGB XI 
    isTruncatedIfTooLong(isVarchar(versicherter, "lastName", 45)), // 47 for SGB V
    isDate(versicherter, "birthday"),
    /* if versichertennummer or versichertenstatus is not specified, address is mandatory and every
       field in address is mandatory (except country) */
    ...(!versicherter.versichertennummer || !versicherter.versichertenstatus ? [
            isRequired(versicherter, "address"),
            ...valueConstraints<Address>(versicherter, "address", constraintsWhenAddressIsMandatory),
        ] : []
    ),
    // otherwise, if specified, the fields in address must just be not too long
    ...valueConstraints<Address>(versicherter, "address", constraintsAddress),
]

const constraintsWhenAddressIsMandatory = (address: Address) => [
    isRequired(address, "street"),
    isRequired(address, "houseNumber"),
    isRequired(address, "postalCode"),
    isRequired(address, "city")
]

const constraintsAddress = (address: Address) => [
    isTruncatedIfTooLong(isOptionalVarchar(address, "street", 24)), // street + housenumber is max 30, 46 for SGB XI
    isTruncatedIfTooLong(isOptionalVarchar(address, "houseNumber", 5)), // 9 for SGB XI
    isTruncatedIfTooLong(isOptionalVarchar(address, "postalCode", 7)), // 10 for SGB XI
    isTruncatedIfTooLong(isOptionalVarchar(address, "city", 25)), // 40 for SGB XI
    /* SGB XI in general allows for longer address strings, but when both are used, I guess a 
       warning should be emitted when the string is too long for any SGB ...*/
]
