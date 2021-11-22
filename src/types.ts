/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import { LaenderkennzeichenSchluessel } from "./country_codes"
import { KassenartSchluessel } from "./kostentraeger/filename/codes"
import { PflegegradSchluessel, RechnungsartSchluessel } from "./sgb-xi/codes"
import { Invoice } from "./sgb-xi/types"
import { ValidationError } from "./validation/index"
import { CareProviderLocationSchluessel, Institution as KostentraegerInstitution, InstitutionLink } from "./kostentraeger/types"
import { Leistungsart } from "./kostentraeger"

export type ResultOrErrors<T> = {
    result?: T
    errors?: ValidationError[]
    warnings?: ValidationError[]
}

export type Recipient = {
    kassenart: KassenartSchluessel;
    sendTo: KostentraegerInstitution;
    encryptTo: KostentraegerInstitution;
    certificate: ArrayBuffer;
}
export type InvoicesWithRecipient = {
    invoices: Invoice[];
    recipient: Recipient;
}

export type Transmission = {
    email: Email;
    payloadFile: File;
    instructionFile: File;
    unencryptedPayloadFile: File;
}

export type File = {
    name: string;
    data: ArrayBuffer;
}

export type EmailAddress = {
    name?: string;
    address: string;
}

export type Email = {
    from: EmailAddress;
    to: EmailAddress[];
    date: string;
    subject: string;
    body: string;
    attachments: File[];
}

export const testIndicator = {
    "0": "Testdatei",
    "1": "Erprobungsdatei",
    "2": "Echtdatei",
}
export type TestIndicator = keyof typeof testIndicator;

export type BillingData = {
    /** Running number per recipient for each bill transmitted */
    datenaustauschreferenzJeEmpfaengerIK: Record<string, number>
    /** Indicate whether this bill is a test or if it is real data */
    testIndicator: TestIndicator
    /** Kind of bill, see documentation of RechnungsartSchluessel */
    rechnungsart: RechnungsartSchluessel
    /** X.509 Certificate including public key, ASN.1 Syntax in DER format */
    senderCertificate: ArrayBuffer
    /** corresponds to public key in senderCertificate, PKCS8 in DER format */
    senderPrivateKey: ArrayBuffer

    rechnungsnummerprefix: string
    /** Date the bill was created. If not specified, the date is "now" */
    rechnungsdatum?: Date
    /** For which month this bill is. Bills are transmitted by month. */
    abrechnungsmonat: Date
    /** An ascending number indicating a correction of an earlier version of this same bill.
     *  0 or undefined if this is not a correction. */
    korrekturlieferung?: number
    /** Mandatory if rechnungsart != "1" */
    abrechnungsstelle?: Institution
    laufendeDatenannahmeImJahrJeEmpfaengerIK: Record<string, number>
}

export type Institution = {
    name: string
    ik: string
    ansprechpartner: Ansprechpartner[]
    email: string
}

export type Ansprechpartner = {
    name: string
    phone?: string
}

export type Versicherter = {
    pflegekasseIK: string
    /** DEPRECATED - TODO: The Kostenträger selection is not only dependent on the Pflegekasse! */
    kostentraegerIK?: string
    /** Mandatory if known. If not known, full address must be specified.
     *  On prescription or health insurance card listed in field "Versicherten-Nr." */
    versichertennummer?: string
    /** Mandatory if known when billing with SGB V. If not known, full address must be specified.
     *  On prescription, listed in field "Status" */
    versichertenstatus?: string
    /** Mandatory for billing with SGB XI */
    pflegegrad?: PflegegradSchluessel
    /** first names longer than 30 characters (SGB V) or 45 characters (SGB XI) will be cut off. */
    firstName: string
    /** last names longer than 47 characters (SGB V) or 45 characters (SGB XI) will be cut off. */
    lastName: string
    birthday: Date
    /** Mandatory if the versichertennummer or versichertenstatus is not known */
    address?: Address
}

export type Address = {
    /** street + housenumber longer than 30 characters (SGB V) will be cut off.
     *  For SGB XI, streets longer than 46 characters will be cut off. */
    street?: string
    /** housenumbers longer than 9 characters will be cut off (SGB XI) */
    houseNumber?: string
    /** Postal codes longer than 7 characters (SGB V) or 10 characters (SGB XI) will be cut off. */
    postalCode?: string
    /** City names longer than 25 characters (SGB V) or 40 characters (SGB XI) will be cut off. */
    city?: string
    /** to be specified if the country is not Germany. Ignored for SGB XI */
    countryCode?: LaenderkennzeichenSchluessel
}

export type Amounts = {
    /** = sum of all(rechnungsbetrag + zuzahlungsbetrag + beihilfebetrag + mwst) */
    gesamtbruttobetrag: number
    /** max. bis zum Höchstleistungsanspruch */
    rechnungsbetrag: number // 
    /** = sum of all(zuzahlungen + eigenanteil)
     * 
     * bei Pflegehilfsmitteln oder wenn Bruttobetrag über Höchstleistungsanspruch liegt */
    zuzahlungsbetrag: number
    /** gem. §28 Abs. 2 SGB XI */
    beihilfebetrag: number
    mehrwertsteuerbetrag: number
}

export type GroupInvoiceByRecipientMethod = (
    invoice: Invoice,
    findRecipient: (
        pflegekasseIK: string,
        leistungsart: Leistungsart,
        location: CareProviderLocationSchluessel,
    ) => {
        key: string,
        recipient?: Recipient,
        kostentraegerIK?: string,
    }
) => Record<string, { recipient?: Recipient, invoice: Invoice }>;
