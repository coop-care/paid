/** based on document Gemeinsame Grundsätze Technik, Anlage 16
 * (see /docs/documents.md for more info)
 */
import { AsnParser } from "@peculiar/asn1-schema"
import { Certificate, id_kp_serverAuth } from "@peculiar/asn1-x509"
import { PublicKeyInfo } from "./types"
import { base64ToArrayBuffer } from "./utils"

/** Parses a string that consists of number of PEM-encoded certificates (of Datenannahmestellen)
 *  separated by newlines into a map of IK -> PublicKeyInfo[].
 */
export default function parse(str: string): Map<string, PublicKeyInfo[]> {
    const result = new Map<string, PublicKeyInfo[]>()
    parseCertificates(str).forEach((certificate) => {
        const pKeyInfos = certificateToPublicKeyInfo(certificate)
        pKeyInfos.forEach(([ik, pKeyInfo]) => {
            if (!result.has(ik)) {
                result.set(ik, [pKeyInfo])
            } else {
                result.get(ik)!.push(pKeyInfo)
            }
        })
    })

    return result
}

function certificateToPublicKeyInfo(certificate: Certificate): [string, PublicKeyInfo][] {
    const cert = certificate.tbsCertificate
    // See page 32 of Gemeinsame Grundsätze Technik, Anlage 16
    // Organizational Unit ( see http://oid-info.com/get/2.5.4.11 )
    // documentation is a bit unclear - could be that one certificate may be valid for multiple IKs
    const iks = cert.subject
        .filter((name) => name[0].type == '2.5.4.11' && name[0].value.printableString?.startsWith("IK"))
        .map((name) => name[0]!.value!.printableString!.substring(2))

    return iks.map(ik => {
        // expecting that all public keys use the RSA algorithm ( http://oid-info.com/get/1.2.840.113549.1.1.1 )
        // (out of lazyness/KISS to handle more then what is necessary)
        if (cert.subjectPublicKeyInfo.algorithm.algorithm != '1.2.840.113549.1.1.1') {
            throw new Error(`Expected public key to use RSA encryption (oid = 1.2.840.113549.1.1.1) but was oid = ${cert.subjectPublicKeyInfo.algorithm.algorithm}`)
        }
        if (cert.subjectPublicKeyInfo.algorithm.parameters) {
            throw new Error(`Expected no parameters for public key RSA encryption`)
        }

        return [ik, {
            validityFrom: cert.validity.notBefore.getTime(),
            validityTo: cert.validity.notAfter.getTime(),
            publicKey: cert.subjectPublicKeyInfo.subjectPublicKey
        }]
    })
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
