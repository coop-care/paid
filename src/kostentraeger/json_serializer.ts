import { arrayBufferToBase64, base64ToArrayBuffer } from "./pki/utils";
import { InstitutionList } from "./types";
import { AsnSerializer, AsnParser } from "@peculiar/asn1-schema"
import { Certificate } from "@peculiar/asn1-x509"

export function serializeInstitutionLists(data: InstitutionList[], space?: string|number|undefined): string {
    return JSON.stringify(data, (key: string, value: any): any => {
        switch(key) {
            case "certificates": 
                if (value) {
                    const certificates = value as Array<Certificate>
                    return certificates.map(certificate => 
                        arrayBufferToBase64(AsnSerializer.serialize(certificate))
                    )
                }
        }
        return value
    }, space)
}

export function deserializeInstitutionLists(text: string): InstitutionList[] {
    return JSON.parse(text, (key: string, value: any): any => {
        switch(key) {
            case "certificates":
                if (value) {
                    const certificatePEMs = value as Array<string>
                    return certificatePEMs.map(pem =>
                        AsnParser.parse(base64ToArrayBuffer(pem), Certificate)
                    )
                }
            case "validityStartDate": 
                return new Date(value as string)
        }
        return value
    })
}
