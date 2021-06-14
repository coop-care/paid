import { arrayBufferToBase64, base64ToArrayBuffer } from "./pki/utils";
import { InstitutionList } from "./types";

export function serializeInstitutionLists(data: InstitutionList[], space?: string|number|undefined): string {
    return JSON.stringify(data, (key: string, value: any): any => {
        switch(key) {
            case "publicKey": return arrayBufferToBase64(value as ArrayBuffer)
        }
        return value
    }, space)
}

export function deserializeInstitutionLists(text: string): InstitutionList[] {
    return JSON.parse(text, (key: string, value: any): any => {
        switch(key) {
            case "publicKey":         return base64ToArrayBuffer(value as string)
            case "validityStartDate": return new Date(value as string)
            case "validityFrom":      return new Date(value as string)
            case "validityTo":        return new Date(value as string)
        }
        return value
    })
}
