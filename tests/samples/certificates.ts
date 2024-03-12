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

export const multipleExampleCertificatesPEM = () => [
    `MIIDTjCCAjagAwIBAgIDAnxUMA0GCSqGSIb3DQEBCwUAMEkxCzAJBgNVBAYTAkRF
MTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29uc3RpZ2UgTGVpc3R1
bmdzZXJicmluZ2VyMB4XDTIwMTEyNDAwMDAwMFoXDTIzMDEwODIzNTk1OVowgYkx
CzAJBgNVBAYTAkRFMTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29u
c3RpZ2UgTGVpc3R1bmdzZXJicmluZ2VyMQ0wCwYDVQQLEwR2ZGVrMRQwEgYDVQQL
EwtJSzEwOTk3OTk3ODEZMBcGA1UEAxMQRHIuIEhlaWtvIFN0YW1lcjCCASIwDQYJ
KoZIhvcNAQEBBQADggEPADCCAQoCggEBAIAI9oynbhMHVe16zbUXGfdtNfC7a8WJ
60nLaOXWnSvzCU81/gTz59jhi5i3y8lxR63hVeJuHl5/fY4z28tlMDQwX/V5z4iZ
y8m75bo/SWu5kjmSETW0a0St5bq56kPTOJhxPvONF5nQfGuZGPw3Y6jsu2osCIVB
ZQYWGihfL1hadbNQaalO0ZKYRu6FlUA6GfHtmzLnnQLVuAAUA6LMnaj0s9oBgwUQ
oLuPrqe9pFdBKl+iEyg0/FC2fY7jy+dAgXsGQMDtY5sk0l0b7t7NFOzOwwPaeZrk
u6oRKV9VSILMgSIHy7gLcBa8n4fuYM+4Bzf9oItMQQr+VuMjxe+UAWMCAwEAATAN
BgkqhkiG9w0BAQsFAAOCAQEAOz8znqhmVw7g6RsENcOqu7UtjbdEitRd9aAW4hiz
WJbbPv1rCU6+cFA8vCiQYdZagl8xrZrYyCpx+JUqQFkDUuq2kdQRgeAnQTggNV+K
Xs702G+AMB3GmulPdlIPTN7YXQXoCiIJgsxn/CKveQYyYXuMdRJw/9GJJR9FatkJ
xkG7EX7PaWOpimA/+U40PRyJ4etxclFNVuBbefQ/cWCHQhupY7hewdaK2yIXyXvd
xAITd32OHKn7H/rEl220hwCPuGFUUvvoEtXn2i77dequl7BG3ceikkmjsdueqUxv
3Ggt+TSxF2vu3ZXzDT1AjV7TFTLX7ClDQMXdUIn/nBF14g==`,
`MIIF1TCCA42gAwIBAgIDAw14MD0GCSqGSIb3DQEBCjAwoA0wCwYJYIZIAWUDBAIB
oRowGAYJKoZIhvcNAQEIMAsGCWCGSAFlAwQCAaIDAgEgMEkxCzAJBgNVBAYTAkRF
MTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29uc3RpZ2UgTGVpc3R1
bmdzZXJicmluZ2VyMB4XDTE4MTExNDAwMDAwMFoXDTIxMTIzMTIzNTk1OVowgbAx
CzAJBgNVBAYTAkRFMTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29u
c3RpZ2UgTGVpc3R1bmdzZXJicmluZ2VyMTkwNwYDVQQLEzBEZXV0c2NoZSBSZW50
ZW52ZXJzaWNoZXJ1bmcgS25hcHBzY2hhZnQtQmFobi1TZWUxFDASBgNVBAsTC0lL
MTA5OTA1MDAzMRQwEgYDVQQDEwtNYXJjbyBMb25nbzCCAiIwDQYJKoZIhvcNAQEB
BQADggIPADCCAgoCggIBAIAkL03AX9q0ns8n3L/EnhjmllPQi9xl5VtvrgnOkJjy
1IEwf6dun+HutZmFpOKLMXGamg5O6HmkUdRfjTUG1+NRnczc20YP8KZSMG5nuF9i
azjIAzynUxk3g5joV8HmmpZUlXHONeJe3rYWhB2yODiOB5vWiUo9TVf2uk3DjFIS
bcTya2c7wvTRYHUmKyNEGe/AHnfQPlvu/VsiiefQDGwls8A0TXgdbWo1qMXG7jG3
f0s3crHZcaLeFRJpIurOxLOQnxCTis1+4gqUJbUMzLpPmOlA28if5Kb0cXFG89DK
UccabAXSf1fT+/1G9oFVcaioIyCrVTntxSGrdTWankJmm5b438h2eyoyxXZduC+g
WnUhVjDNww2d3Z2K6BPol0Vi66ff2Flhjg/m8wkE2OIt7GtewfHKnHidbWpB6VUq
cURBCfZUsE6ENj7BrknRbV5tV0K+iUou6odBHkYk+ikkYjKsabEr+LXirdPUcUbM
2ExIojGMV3tbih6hYJ9aEPl9XkNz0iEcx2f/SujL6fh5Q+o8xRw5qL5eUE2ww/wJ
fJg0mlNZYUTBpP/a3nclHxMfxtwfuLKDHaXCsi5C80EtcZCfwYqXahc5ddRjujjc
fBkesvIehJiVnEpFcqejB0H//m6NvYY/eOGQXJkEjUjezaM2Q3jlSBXKEGPc6cB5
AgMBAAEwPQYJKoZIhvcNAQEKMDCgDTALBglghkgBZQMEAgGhGjAYBgkqhkiG9w0B
AQgwCwYJYIZIAWUDBAIBogMCASADggIBAFip1KcLylK0xVBPcRVMjydCOJckB47j
rhyaznSwEntPvCAGxzlyxnoLIDhw5uh/K94hf2BMFMGkmNf9uX7qK7bxoMRV+IYx
78ZKvf9ARQfCQSc7qlOP1Dpiu+QmP6MVyKutrhilTxO5dNnIa2MvaPlTPhgUFAle
+8NfJkk8M0iJFGrD3+aUZpyXOlDUspz+aYs9GPvhHe0PjdoPmffPwk06PJrAOBJQ
NQzTmJZlhadV6EbxebJTyL6y3Dgu5HmWTdLsyGWZI2jQ9sWxmEqpAJ1QdCLuPP87
maBwAjjHuAqDCp9nLiMnjKNe9ZLVKgfjIuxvwkupFZN78px5MHg/Il08PT58wO6a
t9Nxx6ZhvdzazPLLs3WbnH/kUCjbhHYNeWvSAPQ0mrOh/EuFP5NiXqucxnvQx/Kq
6195+C35wds/xZJI2R4R5nvV015H9VyhFfJOfhEsPA1pw03ggRRpcF+Hkzyu0Dex
mIUG8Egca5ztCjr0F+XYTvrXM4L/RWaQQ3LslPLWTW8oHwTUytgcGGQHiDlv6vjq
vHCs7GJuxjLcjRRYkf8Ck+hpRK+9JaT7BbxAPILEaRJN/K3rTyKDtakAWFjWhdMJ
lv9V4Ip794XGRzPNZDeh/F4qg/NUCRI/YimhOa4vF+x10FP7hOITBIAncb3fCO5A
qF7l6fgFaTTV`,
``]

/**
 * This is a real world Kostenträger certficate used in production, but used as test example here.
 * When this example certificate expires, some tests will fail. When this happens, it needs to be 
 * replaced with a new valid one from dist/kostentraeger.json (it doesn't really matter which one).
 * The current example certificate expires on 2024-12-31.
 */
export const exampleKostentraegerCertificatePEM = () => 
    `MIIFvzCCA3egAwIBAgIDA3YbMD0GCSqGSIb3DQEBCjAwoA0wCwYJYIZIAWUDBAIBoRowGAYJKoZIhvcNAQEIMAsGCWCGSAFlAwQCAaIDAgEgMEkxCzAJBgNVBAYTAkRFMTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29uc3RpZ2UgTGVpc3R1bmdzZXJicmluZ2VyMB4XDTIxMTEyMzAwMDAwMFoXDTI0MTIzMTIzNTk1OVowgZoxCzAJBgNVBAYTAkRFMTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29uc3RpZ2UgTGVpc3R1bmdzZXJicmluZ2VyMR8wHQYDVQQLExZUZWNobmlrZXIgS3Jhbmtlbmthc3NlMRQwEgYDVQQLEwtJSzE4MTU3NTUxOTEYMBYGA1UEAxMPU2ViYXN0aWFuIExpZWJlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAgCO9i2gDXbZrcxQ92F/IRvKLcR/k8LgRsOCX/xBK6rfWlNVaw2OtZSeW3U0jUEuNW2POad0o6vDNfAG1eVEXmqAeEItEBC700Gm3X9MKQI1nhRW/Fl6Wc/PJuW/Rjtsf9Zrhlr0/lwiAA9AWV4I1jaFXzW0wQ5GB5gtTEo64lvlKtXZcschDSi7vDC2bjBCPxzgEL+g4usTUC7aoSDwlMRTqIHI6dZVOcXnbAYEOw0Omx51ZlExm8fwxkMr/2JjRvFWRc3xj6dQIjmKiSdZFXoqEdEG8WDdwYDFj6GpeUvIZS7BkX886ppv9I0HEd8JUrZt4sOrjpNJpRSED3MEhrspJC2AAqBVp2dmTksgH3ZpNtwZZ9SbG+GNue1zIPvpQJAJYXW8IoXEgbgcWfUF1bxVBzT0s/IGwgAsLic1jzQfj3/thOZVWS2p8GzyL14WdBbr8XP9IZYcbYNGoxNcj6YVX7G5lVmnL5Q2lcs+mETls2m7H0XpqpF4cYvun3PAp2uV6+EDV/iYvqL74zpVuodO81WtLWiNN8PC/hjP5vFApicxOxu3bbih/Uxr+7bmwQJdpD4jcRnN4XFEvb6kCRMtHPAfgZgTI5J7Fj1Yc/Q4kTOqEgpFvKGxKeBued/itKMttLDxswpg8cXSkcpoaPkF51UG02NfjeCfR1guWna8CAwEAATA9BgkqhkiG9w0BAQowMKANMAsGCWCGSAFlAwQCAaEaMBgGCSqGSIb3DQEBCDALBglghkgBZQMEAgGiAwIBIAOCAgEAFP4EXVo5AvDtu0Gv5Z48lpbXlMFKlCWsRtSqFrMG3q7ks4bxdeLy4ZmbeCiBpBo3+CqN3vcF51d/okbT/bGy4qu/5xHnpsB9tB4jgtzVA/RH06Fc3ly4b/OfMP6Pw/8XnJ5dmQN/+yUrplWeJaN//ux4P3PVX81dphFYBsHiO/7OVHcE6T51EPGdPUOw+GRg6ZXbK1egDW1uRvoKbkrTerDad3Z49AJJUWfE8/Z/QX2X/AXOXoGbN++e+VTWqlfmcSjSOlbyuDui0wSw619uClxaqf8hxPI8PWlzqqdz5RSDBeqRWQ4WrMLFBGLHiWRz9qi0CckVEDKCYtzeblXBLk6bqqt1H7nU5dIqMZYxmaqRfU7F5QPWs7U1HFaclT0eAaJV8Te48p++1AvJBEyQeMHO+o+CrhTe8a+WzpQ5zZ4+A6RzlDou8lz5lIap89cre9Z2k7gl2q/su1d4r6rWiJVb9rB4WKdE/817ERmA0vaV103xrPBNylCAFfUFBMXRAsMe8TQMeTdj/3W6kctPAdAox1KMhCQ5tdItWrrgxKKbyp5TSJKbkLQVy+hxspKFIY6K7lZE4ee1/HXXnKypBh9ECKtRgSq+Cf0dPSiQ7RWVhm5Qdej5+rqf0IlbXJAQ58pEowRyYHHvWHLrGzsF0kQwbuX1JPZuxhY8A968RPc=`
