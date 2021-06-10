/** Public key */
export type PublicKeyInfo = {
    /** date from which the key may be used */
    validityFrom: Date,
    /** date until which the key may be used */
    validityTo: Date
    /** array buffer with public key (RSA) */
    publicKey: ArrayBuffer
}
