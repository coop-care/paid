import { createTransmissionSGBXI, groupInvoicesByRecipientSGBXI } from "../../src/transmission/index";
import { InstitutionListsIndex } from "../../src/kostentraeger";
import { exampleSelfSignedCertificate } from "../samples/certificates";
import { decryptMessage } from "../../src/pki/pkcs";
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { OctetString, fromBER } from "asn1js";
import { ContentInfo, SignedData } from "pkijs";
import { institutionLists } from "../samples/institutions";
import {
    makeTestverfahrenInvoices,
    makeTestverfahrenBillingData,
    makeCorrectionBillingData
} from "./sgb_xi_testverfahren_data";

jest.setTimeout(15000);

describe("SGB XI Testverfahren Spec", () => {
    let certificateAsDER: ArrayBuffer;
    let privateKey: ArrayBuffer;
    let index: InstitutionListsIndex;

    beforeAll(async () => {
        const certs = await exampleSelfSignedCertificate();
        certificateAsDER = certs.certificateAsDER;
        privateKey = certs.privateKey;
        index = new InstitutionListsIndex(institutionLists);
    });

    it("should group invoices and validate combined cases successfully", async () => {
        const invoices = makeTestverfahrenInvoices();
        const billingData = makeTestverfahrenBillingData(certificateAsDER, privateKey);

        const { invoicesWithRecipient, recipientNotFound } = await groupInvoicesByRecipientSGBXI(
            invoices,
            index
        );

        expect(recipientNotFound).toHaveLength(0);
        expect(invoicesWithRecipient).toHaveLength(1);

        const transmission = await createTransmissionSGBXI(
            invoicesWithRecipient[0],
            billingData,
            index
        );

        expect(transmission.errors).toBeUndefined();
        expect(transmission.result).toBeDefined();
    });

    it("should correctly format and include Ausbildungsumlage and other surcharges in ZUS segments", async () => {
        const invoices = makeTestverfahrenInvoices();
        const billingData = makeTestverfahrenBillingData(certificateAsDER, privateKey);

        const { invoicesWithRecipient } = await groupInvoicesByRecipientSGBXI(invoices, index);
        const transmission = await createTransmissionSGBXI(invoicesWithRecipient[0], billingData, index);

        expect(transmission.result).toBeDefined();
        if (transmission.result) {
            const textDecoder = new TextDecoder();
            const unencryptedText = textDecoder.decode(transmission.result.unencryptedPayloadFile.bytes);

            // Verify ZUS segments are generated
            // Surcharges are mapped as: ZUS+00:1:18+... (Ausbildungsumlage) and ZUS+00:1:21+... (Ungünstige Zeiten)
            expect(unencryptedText).toContain("ZUS+00:1:18+");
            expect(unencryptedText).toContain("ZUS+00:1:21+");
        }
    });

    it("should handle Korrekturlieferung by reflecting the index in anwendungsreferenz", async () => {
        const invoices = makeTestverfahrenInvoices();
        const billingData = makeCorrectionBillingData(certificateAsDER, privateKey);

        const { invoicesWithRecipient } = await groupInvoicesByRecipientSGBXI(invoices, index);
        const transmission = await createTransmissionSGBXI(invoicesWithRecipient[0], billingData, index);

        expect(transmission.result).toBeDefined();
        if (transmission.result) {
            const { anwendungsreferenz } = transmission.result;
            // The 5th character in the 14-char logical filename (anwendungsreferenz) represents korrekturlieferung
            // Example: PL0411S... where PL + month (04) + korrekturlieferung (1) + running count (1) + sender classification (S)
            // Let's verify the logical filename has 1 at the correct position
            expect(anwendungsreferenz.substring(4, 5)).toBe("1");
        }
    });

    it("should execute end-to-end transmission, writing to temp/testverfahren/ and verifying decryption", async () => {
        const invoices = makeTestverfahrenInvoices();
        const billingData = makeTestverfahrenBillingData(certificateAsDER, privateKey);

        const { invoicesWithRecipient } = await groupInvoicesByRecipientSGBXI(invoices, index);
        const transmission = await createTransmissionSGBXI(invoicesWithRecipient[0], billingData, index);

        expect(transmission.result).toBeDefined();

        if (transmission.result) {
            const { payloadFile, instructionFile, unencryptedPayloadFile } = transmission.result;

            const targetDir = "temp/testverfahren";
            if (!existsSync("temp")) {
                mkdirSync("temp");
            }
            if (!existsSync(targetDir)) {
                mkdirSync(targetDir);
            }

            const payloadPath = `${targetDir}/${payloadFile.name}`;
            const instructionPath = `${targetDir}/${instructionFile.name}`;

            writeFileSync(payloadPath, Buffer.from(payloadFile.bytes));
            writeFileSync(instructionPath, Buffer.from(instructionFile.bytes));

            // Verify the generated files exist
            expect(existsSync(payloadPath)).toBe(true);
            expect(existsSync(instructionPath)).toBe(true);

            // Read the encrypted file and decrypt it using the sender certificate/key to verify integrity
            const encryptedBytes = readFileSync(payloadPath).buffer;
            const decryptedData = await decryptMessage(encryptedBytes, certificateAsDER, privateKey);
            expect(decryptedData).toBeDefined();

            if (decryptedData) {
                const signedContentInfo = new ContentInfo({ schema: fromBER(decryptedData).result });
                const signedData = new SignedData({ schema: signedContentInfo.content });
                const resultMessageBuffer = (signedData.encapContentInfo.eContent?.valueBlock.value[0] as OctetString)?.valueBlock.valueHex;

                const textDecoder = new TextDecoder();
                const decryptedText = textDecoder.decode(resultMessageBuffer);
                const unencryptedText = textDecoder.decode(unencryptedPayloadFile.bytes);

                expect(await signedData.verify({ signer: 0 })).toEqual(true);
                expect(decryptedText).toEqual(unencryptedText);
            }
        }
    });
});
