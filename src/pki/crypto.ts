import { webcrypto } from "crypto";
import { getCrypto, setEngine } from "pkijs/src/common";
import CryptoEngine from "pkijs/src/CryptoEngine";

export const initCrypto = (): CryptoEngine => {
    let cryptoEngine: CryptoEngine = getCrypto() as CryptoEngine;

    if (!cryptoEngine) {
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
        cryptoEngine = getCrypto() as CryptoEngine;

        if (!cryptoEngine) {
            throw new Error("WebCrypto engine missing");
        }
    }

    return cryptoEngine;
};
