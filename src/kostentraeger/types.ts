import { 
    KostentraegerAbrechnungscodeSchluessel,
    KostentraegerPflegeLeistungsartSchluessel,
    LeistungserbringergruppeSchluessel, 
    UebermittlungszeichensatzSchluessel 
} from "./edifact/codes"

/**
 * These types represent the data from Kostentraeger file(s) cast into a (more) accessible data model
 */

/** A parse result of a list of Kostentraeger information for one umbrella organization. Includes
 *  all warnings that occured when parsing the information
 */
export type InstitutionListParseResult = {
    institutionList: InstitutionList,
    warnings: string[]
}

/** A list of Kostentraeger information for one umbrella organization */
export type InstitutionList = {
    /** Institutionskennzeichen (=Institution code) of the umbrella organization that issued this
     *  list */
    spitzenverbandIK: string,
    /** All the Kostentraeger for this umbrella organization */
    institutions: Institution[],
    /** For which Leistungserbringergruppe this institution list is for */
    leistungserbringerGruppeSchluessel: LeistungserbringergruppeSchluessel,
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

    vertragskassennummer?: number,
    /** Optional bank account details of this institution */
    bankAccountDetails?: BankAccountDetails,

    /** Validity start date for this institution information. May be undefined if it is always valid */
    validityFrom?: Date,
    /** Validity end date for this institution information. May be undefined if it is always valid */
    validityTo?: Date,

    /** Contacts. This list may be empty */
    contacts: Contact[],
    /** Address(es). Contains one to three addresses, (max) one for each type */
    addresses: Address[],
    /** Details on where and with which protocol to send receipts. Undefined if this institution
     *  does not accept any receipts directly */
    transmissionMethods?: ReceiptTransmissionMethods,
    /** Link(s) to Kostenträger (=institutions that pays the receipts). 
     *  The institution with the IK as printed on the health-insurance card is not necessarily the
     *  institution that manages paying the receipts. Usually such things are done by a central 
     *  office. 
     *  It is possible that there are different Kostenträger for different regions / health care
     *  provider groups etc, this is why there can be several links.
     */
    kostentraegerLinks: KostentraegerLink[],
    /** Link(s) to Datenannahmestellen (=data acceptance office). See comment for kostentraegerLinks */
    datenannahmestelleLinks: DatenannahmestelleLink[],
    /** Link(s) to Papierannahmestellen (=paper acceptance office). See comment for kostentraegerLinks */
    papierannahmestelleLinks: PapierannahmestelleLink[],
}

export type KostentraegerLink = InstitutionLink

export type DatenannahmestelleLink = InstitutionLink & {
    /** whether this data acceptance office can actually decrypt the receipts */
    canDecrypt: boolean
}

export type PapierannahmestelleLink = InstitutionLink & {
    /** Whether it accepts paper receipts that are not machine readable (Rechnung auf Papier) */
    paperReceipt: boolean,
    /** Whether it accepts paper receipts that are machine readable (maschinenlesbarer Beleg) */
    machineReadablePaperReceipt: boolean,
    /** Whether it accepts prescriptions (Verordnungen) */
    prescription: boolean,
    /** Whether it accepts cost estimates (Kostenvoranschlag) */
    costEstimate: boolean
}

export type InstitutionLink = {
    /** IK of the linked partner */
    ik: string,
    /** For which location of the care provider the link is valid */
    standortLeistungserbringerSchluessel?: KVLocationSchluessel,
    /** For which type of health care service provided the link is valid */
    leistungsart?: KostentraegerLeistungsart,
}

export type KostentraegerLeistungsart = 
    KostentraegerPflegeLeistungsart | KostentraegerSonstigeLeistungsart

export type KostentraegerPflegeLeistungsart = {
    /** The type of care service provided according to SGB XI
     * 
     *  A value of 00 (Sammelschlüssel) means that this link is valid for all care services 
     *  provided, 99 means the link is valid for all services provided that are not listed */
    sgbxiLeistungsartSchluessel: KostentraegerPflegeLeistungsartSchluessel,
}

export type KostentraegerSonstigeLeistungsart = {
    /** A.k.a Leistungserbringerart. The group/kind of health care service provided for health
     *  care services according to SGB V.
     * 
     *  Some of the possible values are groups. For example "30" means that this link is valid for
     *  any nursing care (keys 31-34).
     *  
     *  A value of 00 (Sammelschlüssel) means that this link is valid for all care services 
     *  provided, 99 means the link is valid for all services provided that are not listed */
    sgbvAbrechnungscodeSchluessel: KostentraegerAbrechnungscodeSchluessel,
}

export const federalStateSchluesselWithoutNRWSchluessel = {
    "SH": "Schleswig-Holstein",
    "HH": "Hamburg",
    "NI": "Niedersachsen",
    "HB": "Bremen",
    "HE": "Hessen",
    "RP": "Rheinland-Pfalz",
    "BW": "Baden-Württemberg",
    "BY": "Bayern",
    "SL": "Saarland",
    "BE": "Berlin",
    "BB": "Brandenburg",
    "MV": "Mecklenburg-Vorpommern",
    "SN": "Sachsen",
    "ST": "Sachsen-Anhalt",
    "TH": "Thüringen",
}

type FederalStateSchluesselWithoutNRWSchluessel = keyof typeof federalStateSchluesselWithoutNRWSchluessel

export const nrwSubdivisionSchluessel = {
    "Nordrhein": "Nordrhein (Düsseldorf, Köln)",
    "Westfalen-Lippe": "Westfalen-Lippe (Arnsberg, Detmold, Münster)",
}
export type NRWSubdivisionSchluessel = keyof typeof nrwSubdivisionSchluessel

/** Information for which region (usually federal state) the public health care institution 
 *  (Kostenträger, Datenannahmestelle, ...) has authority. Special case is NRW: The AOK currently
 *  (2021-05) distinguishes between the western or eastern part of Nordrhein-Westfalen
 */
export type KVLocationSchluessel = 
    FederalStateSchluesselWithoutNRWSchluessel |
    NRWSubdivisionSchluessel |
    "NW" // Nordrhein-Westfalen

/** Information in which region the health care provider is located. Special case is NRW: 
 *  The AOK currently (2021-05) distinguishes between the western or eastern part of 
 *  Nordrhein-Westfalen
 */
export type CareProviderLocationSchluessel = 
    FederalStateSchluesselWithoutNRWSchluessel | NRWSubdivisionSchluessel

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
