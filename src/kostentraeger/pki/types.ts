import { arrayBufferToBase64, base64ToArrayBuffer } from "./utils"

/** Public key for an IK */
export type IKPublicKeyInfo = {
    /** IK (Institutionskennzeichen) this key is assigned to */
    ik: string,
    /** date from which the key may be used */
    validityFrom: Date,
    /** date until which the key may be used */
    validityTo: Date
    /** array buffer with public key (RSA) */
    publicKey: ArrayBuffer
}

export const ikPublicKeyInfoReplacer = (key: string, value: any): any => {
    switch(key) {
        case "publicKey": return arrayBufferToBase64(value as ArrayBuffer)
    }
    return value
}

export const ikPublicKeyInfoReviver = (key: string, value: any): any => {
    switch(key) {
        case "publicKey": return base64ToArrayBuffer(value as string)
        case "validityFrom": return new Date(value as string)
        case "validityTo": return new Date(value as string)
    }
    return value
}
