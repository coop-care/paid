import { UebermittlungszeichensatzSchluessel } from "./edifact/codes"
import { VKG } from "./edifact/segments"

/**
 * These types represent the data from Kostentraeger file(s) cast into a (more) accessible data model
 */

/** A list of Kostentraeger informations for one umbrella organization */
export type InstitutionList = {
    /** Institutionskennzeichen (=Institution code) of the umbrella organization that issued this
     *  list */
    spitzenverbandIK: string,
    /** Date this list was created. This is not the validity start date. */
    creationDate: Date,
    /** All the Kostentraeger for this umbrella organization */
    institutions: Institution[]
}

/** Information for one Institution.
 * 
 *  Note that the max. characters that are specified in the comment for strings are not enforced by
 *  the parser.
 */
export type Institution = {
    /** Institutionskennzeichen (=Institution code). 
     *  Nine-digit unique identifier for this institution */
    ik: string,
    /** Full name of the institution (max. 123 characters) */
    name: string,
    /** Abbreviated name of the institution (max. 30 characters) */
    abbreviatedName: string,

    /** Optional bank account details of this institution */
    bankAccountDetails?: BankAccountDetails,

    /** Validity start date for this institution information. */
    validityFrom: Date,
    /** Validity end date for this institution information. May be undefined. */
    validityTo?: Date,

    /** Contacts. This list may be empty */
    contacts: Contact[],
    /** Address(es). Contains one to three addresses, (max) one for each type */
    addresses: Address[],
    /** Details on where and with which protocol to send receipts. Undefined if this institution
     *  does not accept any receipts directly */
    transmissionMethods: ReceiptTransmissionMethods | undefined,
    /** Links to the Kostenträger (=institution that pays the receipts), to Datenannahmestellen
     *  (=receipt data acceptance office) or to a Papierannahmestellen (=paper acceptance office).
     *  
     *  The institution with the IK as printed on the health-insurance card does only in the fewest
     *  cases also manage the processing of the receipt data and manage the paying of receipts.
     *  Usually such things are done by a central office. 
     * 
     *  The rules defined in the link define to which institution the receipts should be sent: It
     *  can depend on the place the health care provider is located, what kind of health care 
     *  service was provided, to which health care provider group it belongs and more. 
     * */
    links: InstitutionLink[]
}

/* Same as VKG from Kostenträger file */
export type InstitutionLink = VKG

/** Simplified data model of UEM+DFU from the Kostenträger file with legacy stuff removed */
export type ReceiptTransmissionMethods = {
    /** Whether it accepts paper receipts that are not machine readable */
    paperReceipt: boolean,
    /** Whether it accepts paper receipts that are machine readable */
    machineReadablePaperReceipt: boolean,
    /** Email address + charset to use to send receipts. Undefined if email is not accepted. */
    email?: string | undefined,
    /** FTAM address + charset to use to send receipts. Undefined if FTAM is not accepted. */
    ftam?: string | undefined,
    /** Charset in which the data must be transmitted (for email / FTAM) */
    zeichensatzSchluessel?: UebermittlungszeichensatzSchluessel
}

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
    iban: string,
    bic: string
}
