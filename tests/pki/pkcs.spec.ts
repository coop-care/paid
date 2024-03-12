import {
    SignedData,
    AlgorithmIdentifier,
    RSASSAPSSParams,
    EnvelopedData,
    ContentInfo,
    CertificationRequest,
    Certificate,
    RSAESOAEPParams,
    KeyTransRecipientInfo,
    IssuerAndSerialNumber
} from "pkijs";
import { OctetString, fromBER } from "asn1js";
import { initCrypto } from "../../src/pki/crypto";
import { signAndEncryptMessage, signMessage, encryptMessage, createCertificationRequest, getNewCertificateFromP7C, decryptMessage } from "../../src/pki/pkcs";
import { exampleSelfSignedCertificate, exampleRecipientCertificate } from "../samples/certificates";
import { bufferToHex } from "../../src/pki/utils";
import { ValidationError, ValidationResultType } from "../../src/validation/index";

jest.setTimeout(20000);

describe("PKI PKCS#7 signing and encrypting cryptographic messages", () => {

    it("crypto is available", () => {
        expect(initCrypto()).toBeDefined();
    });

    it("signing, encrypting, verifying and decrypting a message", async () => {
        const message = "Hello World!";
        const messageBuffer = (new TextEncoder()).encode(message);
        const sender = await exampleSelfSignedCertificate(1001);
        const recipient = await exampleSelfSignedCertificate(1002);
        const encryptedMessage = await signAndEncryptMessage(
            messageBuffer, 
            sender.certificateAsDER, 
            sender.privateKey, 
            recipient.certificateAsDER
        );

        initCrypto();
        const emptyBuffer = new ArrayBuffer(0);
        const envelopedContentInfo = new ContentInfo({ schema: fromBER(encryptedMessage).result })
        const envelopedData = new EnvelopedData({ schema: envelopedContentInfo.content });
        expect(envelopedData.recipientInfos).toHaveLength(2);

        const decryptedDataForRecipient = await decryptMessage(
            encryptedMessage, 
            recipient.certificateAsDER, 
            recipient.privateKey
        );
        expect(decryptedDataForRecipient).toBeDefined();
        const signedContentInfoForRecipient = new ContentInfo({ schema: fromBER(decryptedDataForRecipient || emptyBuffer).result });
        const signedDataForRecipient = new SignedData({ schema: signedContentInfoForRecipient.content });
        const resultMessageBufferForRecipient = (signedDataForRecipient.encapContentInfo.eContent?.valueBlock.value[0] as OctetString)?.valueBlock.valueHex;
        const resultMessageForRecipient = (new TextDecoder()).decode(resultMessageBufferForRecipient);
        expect(await signedDataForRecipient.verify({ signer: 0 })).toEqual(true);
        expect(resultMessageForRecipient).toEqual(message);

        const decryptedDataForSender = await decryptMessage(
            encryptedMessage,
            sender.certificateAsDER,
            sender.privateKey
        );
        expect(decryptedDataForSender).toBeDefined();
        const signedContentInfoForSender = new ContentInfo({ schema: fromBER(decryptedDataForSender || emptyBuffer).result });
        const signedDataForSender = new SignedData({ schema: signedContentInfoForSender.content });
        const resultMessageBufferForSender = (signedDataForSender.encapContentInfo.eContent?.valueBlock.value[0] as OctetString)?.valueBlock.valueHex;
        const resultMessageForSender = (new TextDecoder()).decode(resultMessageBufferForSender);
        expect(await signedDataForSender.verify({ signer: 0 })).toEqual(true);
        expect(resultMessageForSender).toEqual(message);
    });

    it("signing a message", async () => {
        const message = "Hello World!";
        const messageBuffer = (new TextEncoder()).encode(message);
        const sender = await exampleSelfSignedCertificate(42);
        const signedMessage = await signMessage(
            messageBuffer,
            sender.certificateAsDER,
            sender.privateKey
        );

        const signedContentInfo = new ContentInfo({ schema: fromBER(signedMessage).result });
        expect(signedContentInfo.contentType).toEqual("1.2.840.113549.1.7.2");

        const signedData = new SignedData({ schema: signedContentInfo.content });
        expect(await signedData.verify({ signer: 0 })).toEqual(true);
        expect(signedData.version).toEqual(1);
        expect(signedData.digestAlgorithms).toHaveLength(1);
        expect(signedData.digestAlgorithms[0].algorithmId).toEqual("2.16.840.1.101.3.4.2.1");
        expect(signedData.encapContentInfo.eContentType).toEqual("1.2.840.113549.1.7.1");

        const resultMessageBuffer = (signedData.encapContentInfo.eContent?.valueBlock.value[0] as OctetString)?.valueBlock.valueHex;
        const resultMessage = (new TextDecoder()).decode(resultMessageBuffer);
        expect(resultMessage).toEqual(message);

        expect(signedData.certificates).toHaveLength(1);
        expect((signedData.certificates?.[0] as Certificate).serialNumber.valueBlock.valueDec)
            .toEqual(sender.certificate.serialNumber.valueBlock.valueDec);
        expect(sender.certificate.serialNumber.valueBlock.valueDec).toBeGreaterThan(0);

        expect(signedData.signerInfos).toHaveLength(1);
        expect(signedData.signerInfos[0].version).toEqual(1);
        expect(signedData.signerInfos[0].sid.issuer.typesAndValues.map(mapTypesAndValues))
            .toEqual(sender.certificate.issuer.typesAndValues.map(mapTypesAndValues));
        expect(signedData.signerInfos[0].sid.serialNumber.valueBlock.valueDec)
            .toEqual(sender.certificate.serialNumber.valueBlock.valueDec);
        expect(signedData.signerInfos[0].digestAlgorithm.algorithmId).toEqual("2.16.840.1.101.3.4.2.1");
        expect(signedData.signerInfos[0].signatureAlgorithm.algorithmId).toEqual("1.2.840.113549.1.1.10");

        const signatureAlgorithmParams = new RSASSAPSSParams({ schema: signedData.signerInfos[0].signatureAlgorithm.algorithmParams });
        expect(signatureAlgorithmParams.hashAlgorithm.algorithmId).toEqual("2.16.840.1.101.3.4.2.1"); // SHA-256
        expect(signatureAlgorithmParams.maskGenAlgorithm.algorithmId).toEqual("1.2.840.113549.1.1.8"); // MGF1
        expect(new AlgorithmIdentifier({ schema: signatureAlgorithmParams.maskGenAlgorithm.algorithmParams }).algorithmId).toEqual("2.16.840.1.101.3.4.2.1"); // SHA-256
        expect(signatureAlgorithmParams.saltLength).toEqual(32);
        expect(signatureAlgorithmParams.trailerField).toEqual(1);

        expect(signedData.signerInfos[0].signature).toBeDefined();
        expect(signedData.signerInfos[0].signature.valueBlock.valueHex.byteLength).toEqual(512);
    });

    it("encrypting a message", async () => {
        const message = "Hello World!";
        const messageBuffer = (new TextEncoder()).encode(message);
        const recipient = exampleRecipientCertificate();
        const encryptedMessage = await encryptMessage(messageBuffer, [recipient.certificateAsDER]);

        const envelopedContentInfo = new ContentInfo({ schema: fromBER(encryptedMessage).result });
        expect(envelopedContentInfo.contentType).toEqual("1.2.840.113549.1.7.3");

        const envelopedData = new EnvelopedData({ schema: envelopedContentInfo.content });
        expect(envelopedData.version).toEqual(0);
        expect(envelopedData.originatorInfo).toBeUndefined();
        expect(envelopedData.recipientInfos).toHaveLength(1);
        const recipientInfoValue = envelopedData.recipientInfos[0].value as KeyTransRecipientInfo
        const rid = recipientInfoValue.rid as IssuerAndSerialNumber
        expect(recipientInfoValue.version).toEqual(0);
        expect(rid.issuer.typesAndValues.map(mapTypesAndValues))
            .toEqual(recipient.certificate.issuer.typesAndValues.map(mapTypesAndValues));
        expect(rid.serialNumber.valueBlock.valueDec)
            .toEqual(recipient.certificate.serialNumber.valueBlock.valueDec);
        expect(recipient.certificate.serialNumber.valueBlock.valueDec).toBeGreaterThan(0);
        expect(recipientInfoValue.keyEncryptionAlgorithm.algorithmId).toEqual("1.2.840.113549.1.1.7");

        const keyEncryptionAlgorithmParams = new RSAESOAEPParams({ schema: recipientInfoValue.keyEncryptionAlgorithm.algorithmParams });
        expect(keyEncryptionAlgorithmParams.hashAlgorithm.algorithmId).toEqual("2.16.840.1.101.3.4.2.1"); // SHA-256
        expect(keyEncryptionAlgorithmParams.maskGenAlgorithm.algorithmId).toEqual("1.2.840.113549.1.1.8"); // MGF1
        expect(new AlgorithmIdentifier({ schema: keyEncryptionAlgorithmParams.maskGenAlgorithm.algorithmParams }).algorithmId).toEqual("2.16.840.1.101.3.4.2.1"); // SHA-256
        expect(keyEncryptionAlgorithmParams.pSourceAlgorithm.algorithmId).toEqual("1.2.840.113549.1.1.9"); // pSpecified

        expect(recipientInfoValue.encryptedKey).toBeDefined();
        expect(recipientInfoValue.encryptedKey.valueBlock.blockLength).toEqual(512);

        expect((envelopedData.encryptedContentInfo as any).contentType).toEqual("1.2.840.113549.1.7.1");
        expect(envelopedData.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId).toEqual("2.16.840.1.101.3.4.1.42");
        expect(envelopedData.encryptedContentInfo.encryptedContent).toBeDefined();

        expect(envelopedData.unprotectedAttrs).toBeUndefined();
    });

    it("creating a certification request", async () => {
        const institutionName = "Ein Pflegedienst";
        const ik = "000000000";
        const contactPersonName = "Erika Mustermann";

        const crypto = initCrypto();
        const { result } = await createCertificationRequest({ institutionName, ik, contactPersonName });
        expect(result).toBeDefined();

        const { certificationRequestFile, publicKeyHash } = result!;
        const certificationRequest = new CertificationRequest({ schema: fromBER(certificationRequestFile.data).result });

        expect(certificationRequestFile.name).toEqual(ik.substring(0, 8) + ".p10");
        expect(certificationRequest.version).toEqual(0);
        expect(certificationRequest.subject.typesAndValues.map(mapTypesAndValues))
            .toEqual([{
                type: "2.5.4.6",
                value: "DE"
            }, {
                type: "2.5.4.10",
                value: "ITSG TrustCenter fuer sonstige Leistungserbringer"
            }, {
                type: "2.5.4.11",
                value: institutionName
            }, {
                type: "2.5.4.11",
                value: "IK" + ik
            }, {
                type: "2.5.4.3",
                value: contactPersonName
            }]);

        expect(certificationRequest.signatureAlgorithm.algorithmId).toEqual("1.2.840.113549.1.1.10");
        const signatureAlgorithmParams = new RSASSAPSSParams({ schema: certificationRequest.signatureAlgorithm.algorithmParams });
        expect(signatureAlgorithmParams.hashAlgorithm.algorithmId).toEqual("2.16.840.1.101.3.4.2.1"); // SHA-256
        expect(signatureAlgorithmParams.maskGenAlgorithm.algorithmId).toEqual("1.2.840.113549.1.1.8"); // MGF1
        expect(new AlgorithmIdentifier({ schema: signatureAlgorithmParams.maskGenAlgorithm.algorithmParams }).algorithmId).toEqual("2.16.840.1.101.3.4.2.1"); // SHA-256
        expect(signatureAlgorithmParams.saltLength).toEqual(32);
        expect(signatureAlgorithmParams.trailerField).toEqual(1);

        expect(certificationRequest.subjectPublicKeyInfo.algorithm.algorithmId).toEqual("1.2.840.113549.1.1.1");
        expect(certificationRequest.subjectPublicKeyInfo.subjectPublicKey).toBeDefined();
        expect(bufferToHex(await crypto.digest({ name: "SHA-256" }, certificationRequest.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex)).toUpperCase())
            .toEqual(publicKeyHash);

        expect(certificationRequest.signatureValue).toBeDefined();
        expect(certificationRequest.signatureValue.valueBlock.valueHex.byteLength).toEqual(512);
        expect(await certificationRequest.verify()).toEqual(true);
    });

    it("validating a certification request with warnings and errors", async () => {
        const institutionName = "";
        const ik = "000000000";
        const contactPersonName = "René François Lacôte, Grüße, Борис Николаевич Ельцин, Nærøy, Trần Hưng Đạo, Δημήτρης Φωτόπουλος, கன்னியாகுமரி, महासमुंद, دمنهور, 深圳, 화성시, さいたま";

        const { result, warnings, errors } = await createCertificationRequest({ institutionName, ik, contactPersonName });
        expect(result).toBeUndefined();
        expect(warnings).toEqual([{
            code: "textTransliterated",
            type: ValidationResultType.Warning,
            path: ["contactPersonName"],
            params: {
                transliteratedValue: "Rene Francois Lacote Gruesse Boris Nikolaevich Eltsin Naeroy Tran Hung Dao Dimitris Fotopoylos knniyakumri mhasmumd dmnhwr ShenZhen HwaSeongSi saitama"
            }
        }, {
            code: "textTruncated",
            type: ValidationResultType.Warning,
            path: ["contactPersonName"],
            params: {
                maxLength: "128",
                truncatedValue: "Rene Francois Lacote Gruesse Boris Nikolaevich Eltsin Naeroy Tran Hung Dao Dimitris Fotopoylos knniyakumri mhasmumd dmnhwr ShenZ"
            }
        }] as ValidationError[]);
        expect(errors).toEqual([{
            code: "textEmpty",
            type: ValidationResultType.Error,
            path: ["institutionName"],
        }] as ValidationError[]);
    });

    it("get new certificate from certification response", async () => {
        const serialNumber = 1337;
        const ik = "000000123";
        const sender = await exampleSelfSignedCertificate(serialNumber, "Ein Pflegedienst", ik);
        const signedMessage = await signMessage(
            new ArrayBuffer(0),
            sender.certificateAsDER,
            sender.privateKey
        );

        const certificateAsDER = getNewCertificateFromP7C(signedMessage, ik);
        expect(certificateAsDER).toBeDefined();

        const certificate = new Certificate({ schema: fromBER(certificateAsDER || new ArrayBuffer(0)).result });
        expect(certificate).toBeDefined();
        expect(certificate?.serialNumber.valueBlock.valueDec).toEqual(serialNumber);
    })
});

const mapTypesAndValues = (item: any) => ({
    type: item.type, 
    value: item.value.valueBlock.value
});
