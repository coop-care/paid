import { importPKCS8 } from "../../src/pki/utils";
import { isValidCertificate } from "../../src/pki/validation";
import { exampleRecipientCertificate, exampleSelfSignedCertificate } from "../samples/certificates";

jest.setTimeout(20000);

describe("validate certificate", () => {

    it("certificate has unexpected type", async () => {
        const results = await isValidCertificate({ certificate: undefined }, "certificate");
        expect(results).toEqual([{
            code: "unexpectedType",
            type: 1,
            path: ["certificate"],
            params: { expectedType: "ArrayBuffer" }
        }]);
    });

    it("certificate cannot be verified", async () => {
        const { certificateAsDER: certificate } = exampleRecipientCertificate();
        const results = await isValidCertificate({ certificate }, "certificate", certificate);
        expect(results).toEqual([{
            code: "certificateVerificationFailed",
            type: 1,
            path: ["certificate"],
        }, {
            code: "certificateExpired",
            type: 1,
            path: ["certificate"],
        }]);
    });

    it("certificate expired", async () => {
        const { certificate, privateKey } = await exampleSelfSignedCertificate();
        certificate.notAfter.value = new Date(Date.now() - 1_000_000_000);
        await certificate.sign(await importPKCS8(privateKey), "SHA-256");
        const certificateAsDER = certificate.toSchema().toBER();
        const results = await isValidCertificate({ certificateAsDER }, "certificateAsDER");
        expect(results).toEqual([{
            code: "certificateExpired",
            type: 1,
            path: ["certificateAsDER"],
        }]);
    });

    it("certificate not yet valid", async () => {
        const { certificate, privateKey } = await exampleSelfSignedCertificate();
        certificate.notBefore.value = new Date(Date.now() + 1_000_000_000);
        await certificate.sign(await importPKCS8(privateKey), "SHA-256");
        const certificateAsDER = certificate.toSchema().toBER();
        const results = await isValidCertificate({ certificateAsDER }, "certificateAsDER");
        expect(results).toEqual([{
            code: "certificateBeforeValidity",
            type: 1,
            path: ["certificateAsDER"],
        }, {
            code: "certificateWillExpire",
            type: 0,
            path: ["certificateAsDER"],
        }]);
    });

    it("certificate without expiration warning", async () => {
        const { certificate, privateKey } = await exampleSelfSignedCertificate();
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 31);
        certificate.notAfter.value = expirationDate;
        await certificate.sign(await importPKCS8(privateKey), "SHA-256");
        const certificateAsDER = certificate.toSchema().toBER();
        const results = await isValidCertificate({ certificateAsDER }, "certificateAsDER");
        expect(results).toHaveLength(0);
    });

    it("certificate with unsupported type fot the validity dates", async () => {
        const { certificate, privateKey } = await exampleSelfSignedCertificate();
        certificate.notAfter.type = 1;
        certificate.notBefore.type = 1;
        await certificate.sign(await importPKCS8(privateKey), "SHA-256");
        const certificateAsDER = certificate.toSchema().toBER();
        const results = await isValidCertificate({ certificateAsDER }, "certificateAsDER");
        expect(results).toEqual([{
            code: "certificateExpired",
            type: 1,
            path: ["certificateAsDER"],
        }, {
            code: "certificateBeforeValidity",
            type: 1,
            path: ["certificateAsDER"],
        }]);
    });

});