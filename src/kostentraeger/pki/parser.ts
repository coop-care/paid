/** based on document Gemeinsame Grundsätze Technik, Anlage 16
 * (see /docs/documents.md for more info)
 */
import { AsnParser } from "@peculiar/asn1-schema"
import { Certificate } from "@peculiar/asn1-x509"
import { base64ToArrayBuffer } from "../../pki/utils"

/** Parses a string that consists of number of PEM-encoded certificates (of Datenannahmestellen)
 *  separated by newlines into a map of IK -> Certificate[].
 */
export default function parse(str: string): Map<string, Certificate[]> {
    const result = new Map<string, Certificate[]>()
    parseCertificates(str).forEach((certificate) => {
        validateCertificate(certificate)
        const iks = getCertificateIKs(certificate)
        iks.forEach(ik => {
            if (!result.has(ik)) {
                result.set(ik, [certificate])
            } else {
                result.get(ik)!.push(certificate)
            }
        })
    })

    return result
}

function validateCertificate(certificate: Certificate) {
    const cert = certificate.tbsCertificate
    // expecting that all public keys use the RSA algorithm ( http://oid-info.com/get/1.2.840.113549.1.1.1 )
    // (out of lazyness/KISS to handle more then what is necessary)
    if (cert.subjectPublicKeyInfo.algorithm.algorithm != '1.2.840.113549.1.1.1') {
        throw new Error(`Expected public key to use RSA encryption (oid = 1.2.840.113549.1.1.1) but was oid = ${cert.subjectPublicKeyInfo.algorithm.algorithm}`)
    }
    if (cert.subjectPublicKeyInfo.algorithm.parameters) {
        throw new Error(`Expected no parameters for public key RSA encryption`)
    }
}

/** Returns the IK(s) the certificates are valid for. 
 *  
 *  The documentation is a bit unclear whether a certificate can be valid for multiple IKs. Since
 *  it is possible by the data structure, better play it safe and support that
*/
function getCertificateIKs(certificate: Certificate): string[] {
    // See page 32 of Gemeinsame Grundsätze Technik, Anlage 16
    // Organizational Unit ( see http://oid-info.com/get/2.5.4.11 )
    const iks = certificate.tbsCertificate.subject
        .filter((name) => name[0].type == '2.5.4.11' && name[0].value.printableString?.startsWith("IK"))
        .map((name) => name[0]!.value!.printableString!.substring(2))

    return iks
}

function parseCertificates(str: string): Certificate[] {
    const pems = str.split(RegExp("\r?\n\r?\n"))
    return pems.map((pem) => {
        const der = base64ToArrayBuffer(pem)
        if (der.byteLength > 0) {
            return AsnParser.parse(der, Certificate)
        }
    }).filter((cert): cert is Certificate => !!cert)
}
