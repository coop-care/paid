/** based on document Gemeinsame Grundsätze Technik, Anlage 16
 * (see /docs/documents.md for more info)
 */

import EncapsulatedContentInfo from "pkijs/src/EncapsulatedContentInfo";
import SignedData from "pkijs/src/SignedData";
import SignerInfo from "pkijs/src/SignerInfo";
import AlgorithmIdentifier from "pkijs/src/AlgorithmIdentifier";
import IssuerAndSerialNumber from "pkijs/src/IssuerAndSerialNumber";
import RSASSAPSSParams from "pkijs/src/RSASSAPSSParams";
import EnvelopedData from "pkijs/src/EnvelopedData";
import ContentInfo from "pkijs/src/ContentInfo";
import CertificationRequest from "pkijs/src/CertificationRequest";
import AttributeTypeAndValue from "pkijs/src/AttributeTypeAndValue";
import Certificate from "pkijs/src/Certificate";
import { OctetString, PrintableString, fromBER } from "asn1js";
import { initCrypto } from "./crypto";
import { bufferToCertificate, importPKCS8, exportPKCS8, bufferToHex } from "./utils";
import { File, ResultOrErrors } from "../types";
import { isIK, isTruncatedIfTooLong, isVarchar, validationByType } from "../validation/utils";
import { transliterateCertificateName, transliterateRecursively } from "../transcoding";

// - PKCS#7 methods

export const signAndEncryptMessage = async (
    message: ArrayBuffer,
    signerCertificate: ArrayBuffer,
    signerPrivateKey: ArrayBuffer,
    recipientCertificate: ArrayBuffer
): Promise<ArrayBuffer> =>
    await encryptMessage(
        await signMessage(message, signerCertificate, signerPrivateKey),
        [recipientCertificate, signerCertificate]
    );

export const signMessage = async (
    message: ArrayBuffer,
    signerCertificate: ArrayBuffer,
    signerPrivateKey: ArrayBuffer
): Promise<ArrayBuffer> => {
    initCrypto();

    const certificate = bufferToCertificate(signerCertificate);
    const privateKey = await importPKCS8(signerPrivateKey);
    const signedData = new SignedData({
        version: 1,
        encapContentInfo: new EncapsulatedContentInfo({
            eContentType: "1.2.840.113549.1.7.1", // "data" content type
            eContent: new OctetString({
                valueHex: message
            })
        }),
        certificates: [certificate],
        signerInfos: [
            new SignerInfo({
                version: 1,
                sid: new IssuerAndSerialNumber({
                    issuer: certificate.issuer,
                    serialNumber: certificate.serialNumber
                }),
            })
        ]
    });

    await signedData.sign(privateKey, 0, "SHA-256");

    const cms = new ContentInfo();
    cms.contentType = "1.2.840.113549.1.7.2"; // signedData
    cms.content = signedData.toSchema();

    return cms.toSchema().toBER();
};

export const encryptMessage = async (
    message: ArrayBuffer,
    recipientCertificates: ArrayBuffer[]
): Promise<ArrayBuffer> => {
    initCrypto();

    const envelopedData = new EnvelopedData();

    recipientCertificates.forEach(certificate =>
        envelopedData.addRecipientByCertificate(bufferToCertificate(certificate), {
            oaepHashAlgorithm: "SHA-256",
        }, 1)
    );

    await envelopedData.encrypt({
        name: "AES-CBC", // AES-256-CBC, OID 2.16.840.1.101.3.4.1.42
        length: 256
    } as Algorithm, message);
    // encrypt method automatically sets version value to 2, but we need 0 according to GKV spec
    envelopedData.version = 0;

    const cms = new ContentInfo();
    cms.contentType = "1.2.840.113549.1.7.3"; // envelopedData
    cms.content = envelopedData.toSchema();

    return cms.toSchema().toBER();
};

export const decryptMessage = async (
    encryptedMessage: ArrayBuffer,
    certificateBuffer: ArrayBuffer,
    privateKeyPKCS8: ArrayBuffer
): Promise<ArrayBuffer | void> => {
    initCrypto();

    const envelopedContentInfo = new ContentInfo({ schema: fromBER(encryptedMessage).result })
    const envelopedData = new EnvelopedData({ schema: envelopedContentInfo.content });
    const recipientCertificate = bufferToCertificate(certificateBuffer);
    const recipientIndex = envelopedData.recipientInfos.findIndex(recipient => 
        recipient.value.rid.serialNumber.valueBlock.valueDec == recipientCertificate.serialNumber.valueBlock.valueDec
    );

    if (recipientIndex < 0) {
        return undefined;
    }

    return await envelopedData.decrypt(recipientIndex, {
        recipientCertificate,
        recipientPrivateKey: privateKeyPKCS8,
    });
};

export const getNewCertificateFromP7C = (
    p7cFileContent: ArrayBuffer, 
    ik: string
): ArrayBuffer | undefined => {
    const signedContentInfo = new ContentInfo({ schema: fromBER(p7cFileContent).result });
    const signedData = new SignedData({ schema: signedContentInfo.content });

    return (signedData.certificates as Certificate[])?.find(certificate => 
        certificate.subject.typesAndValues.find(item => 
            "" + item.type == "2.5.4.11" && item.value.valueBlock.value == "IK" + ik
        )
    )?.toSchema().toBER();
};


// - PKCS#10 methods

export const createCertificationRequest = async (params: {
    institutionName: string;
    ik: string;
    contactPersonName: string;
}): Promise<ResultOrErrors<{
    certificationRequestFile: File;
    privateKey: ArrayBuffer;
    publicKeyHash: string;
}>> => {
    let { warnings, transliterated } = transliterateRecursively(params, transliterateCertificateName);

    const { errors, warnings: validationWarnings } = validationByType([
        isTruncatedIfTooLong(isVarchar(transliterated, "institutionName", 64)),
        isTruncatedIfTooLong(isVarchar(transliterated, "contactPersonName", 128)),
        isIK(transliterated, "ik"),
    ]);
    warnings = warnings.concat(validationWarnings);

    if (errors.length > 0) {
        return { errors, warnings };
    }

    const result = await makeCertificationRequest(transliterated);

    return { warnings, result };
};

const makeCertificationRequest = async (params: {
    institutionName: string;
    ik: string;
    contactPersonName: string;
}): Promise<{
    certificationRequestFile: File;
    privateKey: ArrayBuffer;
    publicKeyHash: string;
}> => {
    const { institutionName, ik, contactPersonName} = params;
    const crypto = initCrypto();
    const { publicKey, privateKey } = await crypto.generateKey(
        {
            name: "RSA-PSS", // OID 1.2.840.113549.1.1.10
            modulusLength: 4096,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
    );

    if (!publicKey || !privateKey) {
        throw new Error("key pair could not be generated");
    }

    const pkcs10 = new CertificationRequest();
    pkcs10.version = 0;
    pkcs10.subject.typesAndValues = makeDistinguishedNames(
        institutionName,
        ik,
        contactPersonName
    );

    // importKey() sets certificate.subjectPublicKeyInfo.algorithm with algorithmId == 1.2.840.113549.1.1.1 (RSAES-PKCS1-v1_5)
    await pkcs10.subjectPublicKeyInfo.importKey(publicKey);
    // sign() sets certificate.signatureAlgorithm with algorithmId == 1.2.840.113549.1.1.10 (RSAES-PSS).
    await pkcs10.sign(privateKey, "SHA-256");

    const publicKeyHash = await crypto.digest({ name: "SHA-256" }, pkcs10.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex);

    return {
        certificationRequestFile: {
            name: ik.substring(0, 8) + ".p10",
            data: pkcs10.toSchema().toBER(),
        } as File,
        privateKey: await exportPKCS8(privateKey),
        publicKeyHash: bufferToHex(publicKeyHash).toUpperCase(),
    };
};

export const makeDistinguishedNames = (
    institutionName: string,
    ik: string,
    contactPersonName: string,
    trustCenterName = "ITSG TrustCenter fuer sonstige Leistungserbringer",
    countryCode = "DE"
): AttributeTypeAndValue[] => [
    new AttributeTypeAndValue({
        type: "2.5.4.6", // C = Country Name
        value: new PrintableString({ value: countryCode.substring(0, 2) })
    }),
    new AttributeTypeAndValue({
        type: "2.5.4.10", // O = Organization Name
        value: new PrintableString({ value: trustCenterName.substring(0, 64) })
    }),
    new AttributeTypeAndValue({
        type: "2.5.4.11", // OU = Organization Unit Name
        value: new PrintableString({ value: institutionName.substring(0, 64) })
    }),
    new AttributeTypeAndValue({
        type: "2.5.4.11", // OU = Organization Unit Name
        value: new PrintableString({ value: "IK" + ik.substring(0, 62) })
    }),
    new AttributeTypeAndValue({
        type: "2.5.4.3", // CM = Common Name
        value: new PrintableString({ value: contactPersonName.substring(0, 128) })
    })
];


// - algorithms

/** SHA-256, see chapter 2.1.1 */
const getHashAlgorithm = () =>
    new AlgorithmIdentifier({
        algorithmId: "2.16.840.1.101.3.4.2.1" // SHA-256
    });;

/** MGF1, see chapter 2.1.2 */
const getMaskGenAlgorithm = () =>
    new AlgorithmIdentifier({
        algorithmId: "1.2.840.113549.1.1.8", // MGF1
        algorithmParams: getHashAlgorithm().toSchema()
    });

/** RSAES-PSS, see chapter 2.1.2 */
export const getSignatureAlgorithm = () =>
    new AlgorithmIdentifier({
        algorithmId: "1.2.840.113549.1.1.10", // RSAES-PSS 
        algorithmParams: new RSASSAPSSParams({
            hashAlgorithm: getHashAlgorithm(),
            maskGenAlgorithm: getMaskGenAlgorithm(),
            saltLength: 32,
            trailerField: 1
        })
    });
