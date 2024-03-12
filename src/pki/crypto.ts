import { webcrypto } from "crypto";
import { getCrypto, setEngine, CryptoEngine } from "pkijs";

/** Initializes the pkijs crypto engine and needs to be called in advance of any other
 * pkijs cryptographic method call.
 */
export const initCrypto = (): CryptoEngine => {
    const name = "webcrypto";
    let crypto: Crypto;

    if (typeof window === "undefined") {
        crypto = webcrypto as unknown as Crypto;
    } else {
        crypto = window.crypto;
    }

    setEngine(
        name,
        crypto,
        new CryptoEngine({ name, crypto, subtle: crypto.subtle }) as SubtleCrypto
    );
    const cryptoEngine = getCrypto() as CryptoEngine;

    if (!cryptoEngine) {
        throw new Error("WebCrypto engine missing");
    }

    return cryptoEngine;
};
