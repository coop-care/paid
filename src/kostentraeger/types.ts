import { VerarbeitungskennzeichenSchluessel } from "./edifact/keys"

/**
 * These types represent the data from Kostentraeger file(s) cast into a (more) accesible data model
 */

/** A list of Kostentraeger informations for one umbrella organization */
export type KostentraegerList = {
    /** Institutionskennzeichen (=Institution code) of the umbrella organization that issued this
     *  list */
    spitzenverbandIK: number,
    /** Date this list was created. This is not the validity start date. */
    creationDate: Date,
    /** All the Kostentraeger for this umbrella organization */
    kostentraeger: Kostentraeger[]
}

/** Information for one Kostentraeger.
 * 
 *  Note that the max. characters that are specified in the comment for strings are not enforced by
 *  the parser.
 */
export type Kostentraeger = {
    /** Institutionskennzeichen (=Institution code). 
     *  Nine-digit unique identifier for this institution */
    ik: number,
    /** Full name of the institution (max. 123 characters) */
    name: string,
    /** Abbreviated name of the institution (max. 30 characters) */
    abbreviatedName: string,

    /** Optional bank account details for this institution */
    bankAccountDetails?: BankAccountDetails,

    /** Validity start date for this Kostentraeger information. */
    validityDateFrom: Date,
    /** Validity end date for this Kostentraeger information. May be undefined. */
    validityDateTo?: Date,
    /** Verarbeitungskennzeichen. ASK/TODO how is this used? Is this for us? I.e. if it is "03", that entry should be deleted? */
    verarbeitungskennzeichenSchluessel: VerarbeitungskennzeichenSchluessel

    /** Contacts. This list may be empty */
    contacts: Contact[],
    /** Address(es). Contains 1 to three addresses, (max) one for each type */
    addresses: Address[],
    /** Details on where and with which protocol to send invoices. May be several if there are
     *  several options. */
    transmissionDetails: TransmissionDetails[]
}

export type TransmissionDetails = {
    protocol: TransmissionProtocol,
    address: string
}

export type TransmissionProtocol = "FTAM" | "FTP" | "SMTP"

export type Contact = {
    /** Phone number. The dialing code and phone number usually separated with "/" or "-" */
    phone?: string | undefined,
    /** Fax number. The dialing code and phone number usually separated with "/" or "-" */
    fax?: string | undefined,
    /** Name of the contact. Max. 30 characters */
    name?: string,
    /** Description of the field of work of the contact. Max. 30 characters */
    fieldOfWork?: string
}

export type Address = NormalAddress | MajorCustomerAddress | POBoxAddress

/** (de: Großkunde). Major customers don't have a street & housenumber */
export type MajorCustomerAddress = BasicAddress

export type NormalAddress = BasicAddress & {
    /** max. 30 characters */
    streetAndHousenumber: string
}
export type POBoxAddress = BasicAddress & {
    /** max. 30 characters */
    poBox: string
}

type BasicAddress = {
    postcode: number,
    /** max. 25 characters */
    place: string,
    /** max. 30 characters */
}

export type BankAccountDetails = {
    bankName: string,
    accountOwner: string,
    accountConnection: BankAccountConnection
}

export type BankAccountConnection = 
    NationalBankAccountConnection | 
    InternationalBankAccountConnection

export type NationalBankAccountConnection = {
    accountNumber: string,
    bankCode: string
}

export type InternationalBankAccountConnection = {
    iban: string,
    bic: string
}

