import { BillingData, Address, Ansprechpartner, Institution, InvoicesWithRecipient, Recipient, Versicherter } from "./types"
import { Institution as KostentraegerInstitution } from "./kostentraeger/types"
import { 
    arrayConstraints, valueConstraints,
    isArray, isChar, isVarchar, isDate, isIK, isInt, isRequired,
    isOptionalChar, isOptionalVarchar,
    error, isTruncatedIfTooLong, isRechnungsnummer, isOptionalDate, isOptionalInt,
} from "./validation/utils"
import { isValidCertificate } from "./pki/validation"
import { Invoice } from "./sgb-xi/types"
import { ValidationResult } from "./validation/index"


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
    isTruncatedIfTooLong(isVarchar(institution, "email", 70))
]

const constraintsAnsprechpartner = (ansprechpartner: Ansprechpartner) => {
    const phoneNumberLength = ansprechpartner.phone ? ansprechpartner.phone?.length + 2 : 0
    return [
        isTruncatedIfTooLong(isOptionalVarchar(ansprechpartner, "phone", 30)),
        // how much space there is left for the name depends on the length of the phone number, if any
        isTruncatedIfTooLong(isVarchar(ansprechpartner, "name", 30 - phoneNumberLength))
    ]
}

export const constraintsVersicherter = (versicherter: Versicherter, requiresVersichertenStatus: boolean) => [
    isIK(versicherter, "pflegekasseIK"),
    // the visible immutable part of versichertennummer are always 10 characters long
    isOptionalChar(versicherter, "versichertennummer", 10),
    // no constraints for optional versichertenstatus (should be (up to) 5 digits though)
    isTruncatedIfTooLong(isVarchar(versicherter, "firstName", 30)), // 45 for SGB XI 
    isTruncatedIfTooLong(isVarchar(versicherter, "lastName", 45)), // 47 for SGB V
    isDate(versicherter, "birthday"),
    /* If versichertennummer (plus versichertenstatus for SGB V) is not specified, 
       address is mandatory and every field in address is mandatory (except country).
       As SGB XI is not based on Verordnungen, the versichertenstatus is likely unknown and 
       a full address is only mandatory if versichertennummer is unknown in this case.  */
    ...(!versicherter.versichertennummer || (requiresVersichertenStatus && !versicherter.versichertenstatus) ? [
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

export const constraintsRecipient = (recipient: Recipient) => [
    isChar(recipient, "kassenart", 2),
    isRequired(recipient, "sendTo"),
    ...valueConstraints<KostentraegerInstitution>(recipient, "sendTo", sendTo => [
        isIK(sendTo, "ik"),
        isVarchar(sendTo, "transmissionEmail", 254),
    ]),
    isRequired(recipient, "encryptTo"),
    ...valueConstraints<KostentraegerInstitution>(recipient, "encryptTo", encryptTo => [
        isIK(encryptTo, "ik"),
    ]),
];

export const constraintsBillingData = (billing: BillingData) => [
    isRequired(billing, "datenaustauschreferenzJeEmpfaengerIK"),
    ...valueConstraints(billing, "datenaustauschreferenzJeEmpfaengerIK", constraintsIKToDatenaustauschreferenz),
    isRequired(billing, "testIndicator"),
    isRequired(billing, "rechnungsart"),
    isVarchar(billing, "rechnungsnummerprefix", 9),
    isRechnungsnummer(billing, "rechnungsnummerprefix"),
    isOptionalDate(billing, "rechnungsdatum"),
    isRequired(billing, "senderCertificate"),
    isRequired(billing, "senderPrivateKey"),
    isDate(billing, "abrechnungsmonat"),
    isOptionalInt(billing, "korrekturlieferung", 0, 10),
    billing.rechnungsart != "1" ? isRequired(billing, "abrechnungsstelle") : undefined,
    ...valueConstraints(billing, "abrechnungsstelle", constraintsInstitution),
    isRequired(billing, "laufendeDatenannahmeImJahrJeEmpfaengerIK"),
    ...valueConstraints(billing, "laufendeDatenannahmeImJahrJeEmpfaengerIK", constraintsIKToLfdDatenannahmeimJahr),
]

export const constraintsForTransmission = async (
    billingData: BillingData,
    invoicesWithRecipient: InvoicesWithRecipient,
    constraintsInvoice: (invoice: Invoice) => ValidationResult[]
) => {
    const recipientCertificateResult = await isValidCertificate(invoicesWithRecipient.recipient, "certificate");
    const senderCertificateResult = await isValidCertificate(billingData, "senderCertificate");

    return [
        ...valueConstraints<BillingData>({ billingData }, "billingData", billingData => [
            ...constraintsBillingData(billingData),
            ...senderCertificateResult
        ]),
        ...valueConstraints<InvoicesWithRecipient>({ invoicesWithRecipient }, "invoicesWithRecipient", invoicesWithRecipient => [
            isArray(invoicesWithRecipient, "invoices", 1),
            ...arrayConstraints<Invoice>(invoicesWithRecipient, "invoices", constraintsInvoice),
            ...valueConstraints<Recipient>(invoicesWithRecipient, "recipient", recipient => [
                ...constraintsRecipient(recipient),
                ...recipientCertificateResult,
            ])
        ]),
    ];
};
