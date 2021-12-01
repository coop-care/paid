/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */
 
import { Invoice } from "../sgb-xi/types";
import { ResultOrErrors, Transmission, InvoicesWithRecipient, BillingData, TestIndicator, File, GroupInvoiceByRecipientMethod } from "../types";
import { InstitutionList } from "../kostentraeger/types";
import { InstitutionListsIndex } from "../kostentraeger";
import { transliterateRecursively } from "../transcoding";
import { encodeI8, isEncodableI8, transliterateI8 } from "../transcoding/din66003drv";
import { constraintsForTransmission } from "../validation";
import { error, validationByType } from "../validation/utils";
import { ValidationError, ValidationResult } from "../validation/index";
import { signAndEncryptMessage } from "../pki/pkcs";
import writeAuftragsdatei from "../auftrag/writer";
import { billingEmail } from "./email";
import { KassenartSchluessel } from "../kostentraeger/filename/codes";
import { absender, transmissionIdentifiers } from "./utils";
import { makeNutzdaten as makeNutzdatenSGBXI, groupInvoiceByRecipient as groupInvoiceByRecipientSGBXI } from "../sgb-xi";
import { makeAnwendungsreferenz as makeAnwendungsreferenzSGBXI, makeDateiname as makeDateinameSGBXI } from "../sgb-xi/filenames";
import { constraintsInvoice as constraintsInvoiceSGBXI } from "../sgb-xi/validation";

/**
 * Group a list of SGB XI invoices by corresponsing recipients. The recipients will be determined from institutionList.
 * An institutionList can be either retrieved from calling `deserializeInstitutionLists` on the 
 * string contents of the file `dist/kostentraeger.min.json` or by calling `await fetchInstitutionLists()`.
 * @param invoices 
 * @param institutionLists 
 * @returns an object with two properties:
 * `invoicesWithRecipient`: a list of recipients together with the corresponding invoices
 * `recipientNotFound`: a list of invoices for which an recipient could not be found. Hopefully an empty list.
 */
export const groupInvoicesByRecipientSGBXI = (
    invoices: Invoice[],
    institutionLists: InstitutionList[]
) => groupInvoicesByRecipient(invoices, institutionLists, groupInvoiceByRecipientSGBXI);

const groupInvoicesByRecipient = (
    invoices: Invoice[],
    institutionLists: InstitutionList[],
    groupInvoiceByRecipient: GroupInvoiceByRecipientMethod,
): {
    invoicesWithRecipient: InvoicesWithRecipient[];
    recipientNotFound: Invoice[];
} => {
    const institutionListsIndex = new InstitutionListsIndex(institutionLists);
    const invoicesByRecipient: Record<string, InvoicesWithRecipient> = {};
    const recipientNotFound: Invoice[] = [];

    invoices.forEach(invoice => {
        const invoiceByRecipient = groupInvoiceByRecipient(invoice, (pflegekasseIK, leistungsart, location) => {
            const result = institutionListsIndex.findForData(pflegekasseIK, leistungsart, location);

            if (result) {
                const { kassenart, sendTo, encryptTo, certificate, kostentraeger } = result;
                const recipient = { kassenart, sendTo, encryptTo, certificate };
                const key = kassenart + sendTo.ik + encryptTo.ik; // a combination of these values describes a unique transmission recipient
                return { key, recipient, kostentraegerIK: kostentraeger.ik };
            } else {
                return { key: "notFound" };
            }
        });

        Object.entries(invoiceByRecipient).forEach(([key, {recipient, invoice}]) => {
            if (recipient) {
                if (!invoicesByRecipient[key]) {
                    invoicesByRecipient[key] = {
                        recipient,
                        invoices: [invoice],
                    }
                } else {
                    invoicesByRecipient[key].invoices.push(invoice);
                }
            } else {
                recipientNotFound.push(invoice);
            }
        })
    });

    return {
        invoicesWithRecipient: Object.values(invoicesByRecipient),
        recipientNotFound
    }
};


type NutzdatenFactory = (
    billingData: BillingData,
    invoices: Invoice[],
    senderIK: string,
    recipientIK: string,
    datenaustauschreferenz: number,
    anwendungsreferenz: string,
) => string;

type DateinameFactory = (
    dateiindikator: TestIndicator,
    transferNumber: number,
) => string;

type AnwendungsreferenzFactory = (
    billingData: BillingData,
    absenderIK: string,
    kassenart: KassenartSchluessel,
    laufendeDatenannahmeImJahr: number,
) => string;

/**
 * Prepares the transmission of invoices to one recipient.
 * Validates the invoices, generates a payload file (Nutzdatendatei) and an instruction file (Auftragsdatei), 
 * encodes the files, encrypts and signs the payload file, generates the email parameters and returns
 * them together with the files.
 * @param invoicesWithRecipient one of the returned invoicesWithRecipient items from `groupInvoicesByRecipientSGBXI` which needs to be called first
 * @param billingData addtional data about the sender and its transmission history
 * @returns an object with either a `result` property, containing the `email` parameters, 
 * the signed and encrypted `payloadFile`, a corresponding and readable `unencryptedPayloadFile` and
 * the instructionFile, or with an `errors` property containing a list of errors. In both cases an
 * additional and optional `warnings` property containing a list of warnings can be present in the
 * return object. Errors should be handled, warnings should be presented to the user as they indicate
 * an implicit modification of the data.
 */
export const createTransmissionSGBXI = async (
    invoicesWithRecipient: InvoicesWithRecipient,
    billingData: BillingData,
): Promise<ResultOrErrors<Transmission>> => 
    createTransmission(
        invoicesWithRecipient, 
        billingData, 
        makeNutzdatenSGBXI,
        makeDateinameSGBXI,
        makeAnwendungsreferenzSGBXI,
        constraintsInvoiceSGBXI
    );

const createTransmission = async (
    invoicesWithRecipient: InvoicesWithRecipient,
    billingData: BillingData,
    makeNutzdaten: NutzdatenFactory,
    makeDateiname: DateinameFactory,
    makeAnwendungsreferenz: AnwendungsreferenzFactory,
    constraintsInvoice: (invoice: Invoice) => ValidationResult[],
): Promise<ResultOrErrors<Transmission>> => {
    let { errors, warnings, transliterated } = await validateAndTransliterateForTransmission(
        billingData, 
        invoicesWithRecipient,
        constraintsInvoice
    );

    if (errors.length) {
        return { errors, warnings };
    }

    const { recipient } = invoicesWithRecipient;
    const transliteratedInvoices = transliterated.invoicesWithRecipient.invoices;
    const { kassenart, sendTo, encryptTo } = recipient;
    const recipientEmail = sendTo.transmissionEmail || "";
    const sender = absender(billingData, transliteratedInvoices[0]);
    const {
        datenaustauschreferenz,
        laufendeDatenannahmeImJahr,
        transferNumber,
    } = transmissionIdentifiers(billingData, sendTo.ik);
    const filename = makeDateiname(billingData.testIndicator, transferNumber);
    const anwendungsreferenz = makeAnwendungsreferenz(
        transliterated.billingData, 
        sender.ik, 
        kassenart, 
        laufendeDatenannahmeImJahr
    );
    const nutzdaten = makeNutzdaten(
        transliterated.billingData, 
        transliteratedInvoices, 
        sender.ik, 
        sendTo.ik, 
        datenaustauschreferenz, 
        anwendungsreferenz
    );

    if (!isEncodableI8(nutzdaten)) {
        return cancelWith(error("invalidCharacters"));
    }

    const unencryptedNutzdaten = encodeI8(nutzdaten);
    let auftragsdaten = "";
    let encryptedNutzdaten = new ArrayBuffer(0);

    try {
        encryptedNutzdaten = await signAndEncryptMessage(
            unencryptedNutzdaten,
            billingData.senderCertificate,
            billingData.senderPrivateKey,
            recipient.certificate
        );

        auftragsdaten = writeAuftragsdatei({
            verfahrenKennung: "PFL",
            anwendungsreferenz,
            senderIK: sender.ik,
            encryptedForIK: encryptTo.ik,
            sendToIK: sendTo.ik,
            dateCreated: new Date(),
            dateSent: new Date(),
            unencryptedNutzdatenSizeBytes: unencryptedNutzdaten.length,
            encryptedNutzdatenSizeBytes: encryptedNutzdaten.byteLength,
            isTest: billingData.testIndicator != "2",
            transferNumber,
        });
    } catch (thrownError) {
        return cancelWith(error("throwsError", undefined, undefined, (thrownError as Error)?.message));
    }

    const unencryptedPayloadFile = makeFile(unencryptedNutzdaten, filename);
    const payloadFile = makeFile(encryptedNutzdaten, filename);
    const instructionFile = makeFile(encodeI8(auftragsdaten), filename + ".AUF");
    const email = billingEmail(sender, recipientEmail, payloadFile, instructionFile);

    return {
        warnings,
        result: {
            unencryptedPayloadFile,
            payloadFile,
            instructionFile,
            email,
        }
    };
};

const makeFile = (data: ArrayBuffer, name: string): File => ({ name, data });

const cancelWith = (error: ValidationError): { errors: ValidationError[] } => ({ errors: [error] });


/**
 * Validates the data required for a transmission of invoices to one recipient.
 * @param invoicesWithRecipient one of the returned invoicesWithRecipient items from `groupInvoicesByRecipientSGBXI` which needs to be called first
 * @param billingData addtional data about the sender and its transmission history
 * @returns an object with an `errors` property containing an array of errors and 
 * a `warnings` property containing a list of warnings.
 * Errors should be handled, warnings should be presented to the user as they indicate
 * an implicit modification of the data to expect when preparing a transmission.
 */
export const validateForTransmissionSGBXI = async (
    billingData: BillingData,
    invoicesWithRecipient: InvoicesWithRecipient
) => {
    const { errors, warnings } = await validateAndTransliterateForTransmission(
        billingData,
        invoicesWithRecipient,
        constraintsInvoiceSGBXI
    );
    return { errors, warnings };
};

const validateAndTransliterateForTransmission = async (
    billingData: BillingData,
    invoicesWithRecipient: InvoicesWithRecipient,
    constraintsInvoice: (invoice: Invoice) => ValidationResult[]
) => {
    let { warnings, transliterated } = transliterateRecursively({
        billingData,
        invoicesWithRecipient: {
            invoices: invoicesWithRecipient.invoices
        }
    }, transliterateI8);

    const constraints = await constraintsForTransmission(transliterated.billingData, {
        ...invoicesWithRecipient,
        ...transliterated.invoicesWithRecipient
    }, constraintsInvoice);
    const result = validationByType(constraints);

    return {
        errors: result.errors,
        warnings: warnings.concat(result.warnings),
        transliterated
    }
};
