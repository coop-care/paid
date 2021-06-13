
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const str = atob(base64)
    const buffer = new ArrayBuffer(str.length)
    const bytes = new Uint8Array(buffer)
    bytes.forEach((_, i) => bytes[i] = str.charCodeAt(i))
    return buffer
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    return btoa(String.fromCharCode(...bytes))
}
