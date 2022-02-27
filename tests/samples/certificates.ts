/** based on document Gemeinsame Grundsätze Technik, Anlage 16
 * (see /docs/documents.md for more info)
 */

import Certificate from "pkijs/src/Certificate";
import BasicConstraints from "pkijs/src/BasicConstraints";
import Extension from "pkijs/src/Extension";
import { Integer, fromBER } from "asn1js";
import { initCrypto } from "../../src/pki/crypto";
import { getSignatureAlgorithm, makeDistinguishedNames } from "../../src/pki/pkcs";
import { base64ToArrayBuffer, exportPKCS8 } from "../../src/pki/utils";

export const exampleSelfSignedCertificate = async (
    serialNumber = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
    institutionName = "Pflegedienst Test",
    ik = "000000000",
    institutionContactPersonName = "Erika Mustermann"
) => {
    const crypto = initCrypto();
    const distinguishedName = makeDistinguishedNames(institutionName, ik, institutionContactPersonName);

    const certificate = new Certificate();
    certificate.version = 2; // X.509v3
    certificate.serialNumber = new Integer({ value: serialNumber });
    certificate.signature = getSignatureAlgorithm();
    certificate.issuer.typesAndValues = distinguishedName.slice(0, 2);
    certificate.subject.typesAndValues = distinguishedName;
    certificate.notBefore.value = new Date(Date.now() - 86400000);
    certificate.notAfter.value = new Date(Date.now() + 86400000);
    certificate.extensions = [];

    const basicConstraints = new BasicConstraints({
        cA: false
    });
    certificate.extensions?.push(new Extension({
        extnID: "2.5.29.19",
        critical: true,
        extnValue: basicConstraints.toSchema().toBER(),
        parsedValue: basicConstraints
    }));

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
        throw new Error("key pair could not be generated")
    }

    // importKey() sets certificate.subjectPublicKeyInfo.algorithm with algorithmId == 1.2.840.113549.1.1.1 (RSAES-PKCS1-v1_5)
    await certificate.subjectPublicKeyInfo.importKey(publicKey);
    // Self-signing the certificate which is not allowed.
    // Actually the certificate may only be signed by a CA with their private key.
    // sign() sets certificate.signatureAlgorithm with algorithmId == 1.2.840.113549.1.1.10 (RSAES-PSS).
    await certificate.sign(privateKey, "SHA-256");

    return {
        certificate,
        certificateAsDER: certificate.toSchema().toBER() as ArrayBuffer,
        privateKey: await exportPKCS8(privateKey),
    }
}

export const exampleRecipientCertificate = () => {
    const pem = `MIIFwTCCA3mgAwIBAgIDAw1tMD0GCSqGSIb3DQEBCjAwoA0wCwYJYIZIAWUDBAIB
    oRowGAYJKoZIhvcNAQEIMAsGCWCGSAFlAwQCAaIDAgEgMEkxCzAJBgNVBAYTAkRF
    MTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29uc3RpZ2UgTGVpc3R1
    bmdzZXJicmluZ2VyMB4XDTE4MTExNDAwMDAwMFoXDTIxMTIzMTIzNTk1OVowgZwx
    CzAJBgNVBAYTAkRFMTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29u
    c3RpZ2UgTGVpc3R1bmdzZXJicmluZ2VyMSQwIgYDVQQLExtrdWJ1cyBJVC9BT0sg
    UExVUyAoU2FjaHNlbikxFDASBgNVBAsTC0lLMTA3Mjk5MDA1MRUwEwYDVQQDEwxG
    cmFuayBLcmF1c2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCzbWe/
    /tELmLTH72UwZUOLWR8QPdtaigpmO9IIYEU2dJsSE0hE3ZVxGvEVFmx4azifIAw2
    Wl3AHq6CZ4D2pRIhnXJBYcTAuXjeOTus//+26s6bcw8BRTjV0mOyMtNKI7JYZttp
    8d5xEhkB2/Ese/bQTos7DCW5072zUj5Yy9Np2VKLnOKCKGpdKjDBc6WRSBSpZjI0
    iFdFtKaGfgTIx74cyY/VXXl1lpShm/rysQ3jzB7uAeYqPnxElTb37EQrlpqjIBeo
    QTz16Bte3FqMM519M0t7g7GmAiAxHF1f80nUJUIUWxOA9Ww1wy2U71ZuKopC7XAT
    Le/SuUW8O7UfDxX4UncFWEUXXR29mbZNXzkdt8yhhtbNIKUvKIdQiboVP7zLmFkR
    Iz+7+7J3faa9JBmruP7Jm2Ax4Cb+dVkOB3XXlPLBdujci5rBhtoHwd7nqzEY6y3w
    2MZ8Oo6omti08inw7BxiAde740e+0AU0eT/r9hapnw86BkHNW74ghHC9ZrfSNWsp
    V0nvb7DCSwB4DIBKkAx1lj70YxeVUGpBDdTm4sy6Gio3LuZrIDMzsyKNV+EURVK2
    oEmG/pDEK+8kGzRxpgwo7Ngv4LbgPiFlopqguAfEPgQ+pTyBvPXtja0ID6owdN9M
    yqddLmaKr3R7TabVGPNEU3BbwrDfPi26e9uyaQIDAQABMD0GCSqGSIb3DQEBCjAw
    oA0wCwYJYIZIAWUDBAIBoRowGAYJKoZIhvcNAQEIMAsGCWCGSAFlAwQCAaIDAgEg
    A4ICAQA1XdM3U+oBY1u9rL6cxYMCDrnrjxsAdjA3NsOFDV96btI40C8DVSMKqQ1Y
    c2su/sX08q5DQ9NxSDHbsb0UlJSPrdjE7zrgh+erWd6hjch1U3L8e1HNR8ihaIBU
    RuKRS5jhPCeqcoF+O01aVpc44vhhJdfNvu6i8NlFSkoqAxf8g8ipkPjmtoSqWc1D
    Od0ZZWpiBf1NY0SLm1wOmWKdTJsFo4e0oAAZiDsXhVfeQaIDF4xtqzNuLxZaBEmy
    bjD/Zqm7hrz/M1Z2VfpLqP5uuiqhNQpSHaMpAfvcrtL4whPPzkc6QGtoz3NJq5Qx
    ewXboG6S747Iw1Z9xcago5ArCQw2Mer2XbnaZ/wZmM8sdzhjRisuapluORrWQayQ
    liXNnmJ3WBqJuq8NvQqKid5+VXc3aZNJzApNDAc+zljAjP5tjWCCSBgzJQ5vOtcI
    /OHXtzHvqn22wF39pUqwzV/NpZDK5jqVBpS12skGYz98kg1nfWRJsSvZM76LcMPG
    Jcky5ALxTy4pazwkva+4Vcv6bLltQtbjm1XqaDvOb6XSsrf16yo3A7gh4zRWvVBi
    9AG1Uont1Sv//tXVCdgRjW6ut6X7L8x7il3uk9HD1FhoiPMtcJ8gvxvW0Ao0kKCj
    ZrQiiNh1gOCYrxfrjHTlOIsBssRnAxvURMg5wHeIMBIlPG2yug==`;

    const certificateAsDER = base64ToArrayBuffer(pem);
    const certificate = new Certificate({ schema: fromBER(certificateAsDER).result });

    return {
        certificate,
        certificateAsDER,
    };
};
