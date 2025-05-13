import { fromBER } from "asn1js";
import { Certificate, CertificationRequest } from "pkijs";
import { initCrypto } from "./crypto";

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    const length = binaryString.length;
    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const length = bytes.byteLength;
    for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export const bufferToCertificate = (certificate: ArrayBuffer): Certificate => 
    new Certificate({ schema: fromBER(certificate).result });

export const bufferToCertificationRequest = (certificate: ArrayBuffer) =>
    CertificationRequest.fromBER(certificate);

export const importPKCS8 = async (key: ArrayBuffer): Promise<CryptoKey> =>
    await initCrypto().importKey(
        "pkcs8", 
        key, {
            name: "RSA-PSS",
            hash: {
                name: "SHA-256"
            }
        } as RsaHashedImportParams,
        true, 
        ["sign", "verify"]
    );

export const exportPKCS8 = async (key: CryptoKey): Promise<ArrayBuffer> =>
    await initCrypto().exportKey("pkcs8", key);

export const bufferToHex = (buffer: ArrayBuffer): string =>
    [...new Uint8Array(buffer)]
        .map(number => number.toString(16).padStart(2, "0"))
        .join("");

export const keyToPEM = async (key: ArrayBuffer): Promise<string> => {
    const base64 = arrayBufferToBase64(key);
    return `-----BEGIN PRIVATE KEY-----\n${base64}\n-----END PRIVATE KEY-----`;
};
