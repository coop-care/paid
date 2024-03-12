import { arrayBufferToBase64, base64ToArrayBuffer, keyToPEM } from "../../src/pki/utils"
import { exampleKostentraegerCertificatePEM } from "../samples/certificates"

describe("pki utils", () => {

    it("convert base64 to array buffer and back", () => {
        const cert2 = arrayBufferToBase64(base64ToArrayBuffer(cert))
        // deliberately ignoring newlines as those are ignored when converting to ArrayBuffer
        expect(cert2).toEqual(cert.replace(RegExp("\r?\n", "g"),""))
    })

    it("convert to PEM", async () => {
        const pem = await keyToPEM(base64ToArrayBuffer(cert));
        expect(pem.startsWith("-----BEGIN PRIVATE KEY-----")).toEqual(true);
    })

})

const cert = exampleKostentraegerCertificatePEM()
