import { fromBER } from "asn1js";
import Certificate from "pkijs/src/Certificate";
import { initCrypto } from "./crypto";

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const str = Buffer.from(base64, "base64").toString("binary")
    const buffer = new ArrayBuffer(str.length)
    const bytes = new Uint8Array(buffer)
    bytes.forEach((_, i) => bytes[i] = str.charCodeAt(i))
    return buffer
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    return Buffer.from(String.fromCharCode(...bytes), "binary").toString("base64")
}

export const bufferToCertificate = (certificate: ArrayBuffer): Certificate => 
    new Certificate({ schema: fromBER(certificate).result });

export const importPKCS8 = async (key: ArrayBuffer): Promise<CryptoKey> =>
    await initCrypto().importKey(
        "pkcs8", 
        key, {
            name: "RSA-PSS",
            hash: {
                name: "SHA-256"
            }
        },
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
