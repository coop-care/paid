/** based on documents: 
 *  - Pflege, Technische Anlage 1, Anhang 5: Kostenträgerdatei
 *  - Sonstige Leistungserbringer, Anlage 1, Anhang 3, Kapitel 10: Kostenträgerdatei
 * 
 * (see /docs/documents.md for more info)
 */

import { 
    KostentraegerAbrechnungscodeSchluessel,
    AnschriftartSchluessel, 
    BundeslandSchluessel, 
    DatenlieferungsartSchluessel, 
    DFUProtokollSchluessel, 
    IKVerknuepfungsartSchluessel, 
    KVBezirkSchluessel, 
    LeistungserbringergruppeSchluessel, 
    KostentraegerPflegeLeistungsartSchluessel, 
    UebermittlungsmediumParameterSchluessel, 
    UebermittlungsmediumSchluessel, 
    UebermittlungszeichensatzSchluessel, 
    UebertragungstageSchluessel, 
    VerarbeitungskennzeichenSchluessel 
} from "./codes"

/** Contains all the KOTR messages of one EDIFACT interchange and information from the header */
export type KOTRInterchange = {
    /** Institutionskennzeichen (=Institution code) of the umbrella organization that issued this */
    spitzenverbandIK: string
    /** Date this list was created. This is not the validity start date. */
    creationDate: Date,
    /** All the Kostentraeger for this umbrella organization */
    institutions: KOTRMessage[]
}

/** All the segments of one KOTR (=Kostenträger) message */
export type KOTRMessage = {
    id: number, 
    idk: IDK,
    vdt: VDT,
    fkt: FKT,
    nam: NAM,
    kto?: KTO,
    vkgList: VKG[]
    ansList: ANS[],
    aspList: ASP[],
    dfuList: DFU[],
    uemList: UEM[]
}

/** Identifikation */
export type IDK = {
    /** Institutionskennzeichen. Institution code. */
    ik: string,
    /* Type of institution. 99 = dummy. Apparently always 99 for TP5 and TP6,
       because all information for the IK must be derived from the VKG segment */
    institutionsart: string,
    /** Abbreviated name, max 30 characters */
    abbreviatedName: string,
    /* optional field. Apparently is missing always */
    vertragskassennummer?: number
}

/** Validity */
export type VDT = { 
    /** Validity of this information start date */
    validityFrom: Date, 
    /** Validity of this information end date */
    validityTo?: Date
}

/** Funktion */
export type FKT = {
    /** Verarbeitungskennzeichen */
    verarbeitungskennzeichenSchluessel: VerarbeitungskennzeichenSchluessel
}

/** Kontoverbindung */
export type KTO = {
    bankName: string,
    /** undefined if same as IDK.abbreviatedName */
    accountOwner?: string, 
    /** National bank account number */
    accountNumber?: string,
    /** National bank code */
    bankCode?: string,
    /** International bank account number */
    iban?: string,
    /** International bank code */
    bic?: string
}

export type VKG = {
    /** What is linked */
    ikVerknuepfungsartSchluessel: IKVerknuepfungsartSchluessel,
    /** IK of the linked partner. */
    verknuepfungspartnerIK: string,
    /** health care provider group, a.k.a LE-Gruppe */
    leistungserbringergruppeSchluessel?: LeistungserbringergruppeSchluessel,
    /** IK of the clearing office. If undefined, the link is valid for all offices */
    abrechnungsstelleIK?: string,
    /** How the data should be conveyed */
    datenlieferungsartSchluessel?: DatenlieferungsartSchluessel,
    /** On what kind of medium the data should be conveyed */
    uebermittlungsmediumSchluessel?: UebermittlungsmediumSchluessel,
    /** In which state the health care provider is located */
    standortLeistungserbringerBundeslandSchluessel?: BundeslandSchluessel,
    /** In which KV-district the health care provider is located */
    standortLeistungserbringerKVBezirkSchluessel?: KVBezirkSchluessel,
    /** Only defined if leistungserbringergruppeSchluessel = 6 (Pflege)
     *  The type of health care service provided.  
     * 
     *  A value of 00 (Sammelschlüssel) means that this link is valid for all health care services 
     *  provided. */
    pflegeLeistungsartSchluessel?: KostentraegerPflegeLeistungsartSchluessel,
    /** A.k.a Leistungserbringerart. Only defined if leistungserbringergruppeSchluessel = 5 (Sonstige)
     *  
     *  The group/kind of health care service provided. Some of the possible values are groups. For
     *  example "30" means that this link is valid for any nursing care (keys 31-34).
     *  
     *  A value of 00 (Sammelschlüssel) means that this link is valid for all health care services 
     *  provided. */
    abrechnungscodeSchluessel?: KostentraegerAbrechnungscodeSchluessel,
    /** Only defined if leistungserbringergruppeSchluessel = 5 (Sonstige)
     *  
     *  A 5-digit numeral whose first 2 digits form the TarifbereichSchluessel and its last 3 digits
     *  form an id for special tariffs.
     */
    tarifkennzeichen?: string
}

/** Name */
export type NAM = {
    /** serial number from 1 to 3. Makes no sense though, since there may be only one NAM segment
     *  per message */
    index: number,
    /** full name elements */
    names: string[]
}

/** Anschrift */
export type ANS = {
    /** Type of address */
    anschriftartSchluessel: AnschriftartSchluessel,
    postcode: number,
    /** max. 25 characters */
    place: string,
    /* Street & housenumber if anschriftartSchluessel == 1, 
     * P.O. box if anschriftartSchluessel == 2 and
     * undefined if anschriftartSchluessel == 3 */
    address?: string 
}

/** Ansprechpartner */
export type ASP = {
    /** serial number of the contact */
    index: number,
    /** Phone number. The dialing code and phone number usually separated with "/" or "-" */
    phone?: string,
    /** Fax number. The dialing code and phone number usually separated with "/" or "-" */
    fax?: string,
    /** Name of the contact. Max. 30 characters */
    name?: string,
    /** Description of the field of work of the contact. Max. 30 characters */
    fieldOfWork?: string
}

/** Übermittlungsmedium */
export type UEM = {
    /** Over which medium the invoices should be transmitted (internet, CD-ROM, floppy, ...) */
    uebermittlungsmediumSchluessel: UebermittlungsmediumSchluessel,
    /** Parameter for the medium */
    uebermittlungsmediumParameterSchluessel: UebermittlungsmediumParameterSchluessel,
    /** In which character set the invoices should be transmitted */
    uebermittlungszeichensatzSchluessel: UebermittlungszeichensatzSchluessel
}

/** Datenfernübertragung */
export type DFU = {
    /** serial number */
    index: number,
    /** Protocol in which the transmission must be made */
    dfuProtokollSchluessel: DFUProtokollSchluessel,
    /** User id. Only specified if different from the IK */
    benutzerkennung?: string,
    /** Start of the time window in which transmission of invoices is allowed in format "hhmm" */
    allowedTransmissionTimeStart?: string,
    /** End of the time window in which transmission of invoices is allowed in format "hhmm" */
    allowedTransmissionTimeEnd?: string,
    /* Days at which the transmission of invoices is allowed */
    allowedTransmissionDays?: UebertragungstageSchluessel,
    /* Address to which the data should be sent (with port behind ":"). Valid values are for example:
       - 203.0.113.195:49999
       - [2001:0db8:85a3:0000:0000:8a2e:0370:7344]:49999
       - ftam.kubus-it.de:5000
       - da@dta.aok.de
    */
    address: string
}
