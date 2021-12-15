import { arrayBufferToBase64, base64ToArrayBuffer, keyToPEM } from "../../src/pki/utils"
import { exampleSelfSignedCertificate } from "../samples/certificates"

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

const cert = `MIIDTjCCAjagAwIBAgIDAnxUMA0GCSqGSIb3DQEBCwUAMEkxCzAJBgNVBAYTAkRF
MTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29uc3RpZ2UgTGVpc3R1
bmdzZXJicmluZ2VyMB4XDTIwMTEyNDAwMDAwMFoXDTIzMDEwODIzNTk1OVowgYkx
CzAJBgNVBAYTAkRFMTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29u
c3RpZ2UgTGVpc3R1bmdzZXJicmluZ2VyMQ0wCwYDVQQLEwR2ZGVrMRQwEgYDVQQL
EwtJSzEwOTk3OTk3ODEZMBcGA1UEAxMQRHIuIEhlaWtvIFN0YW1lcjCCASIwDQYJ
KoZIhvcNAQEBBQADggEPADCCAQoCggEBAIAI9oynbhMHVe16zbUXGfdtNfC7a8WJ
60nLaOXWnSvzCU81/gTz59jhi5i3y8lxR63hVeJuHl5/fY4z28tlMDQwX/V5z4iZ
y8m75bo/SWu5kjmSETW0a0St5bq56kPTOJhxPvONF5nQfGuZGPw3Y6jsu2osCIVB
ZQYWGihfL1hadbNQaalO0ZKYRu6FlUA6GfHtmzLnnQLVuAAUA6LMnaj0s9oBgwUQ
oLuPrqe9pFdBKl+iEyg0/FC2fY7jy+dAgXsGQMDtY5sk0l0b7t7NFOzOwwPaeZrk
u6oRKV9VSILMgSIHy7gLcBa8n4fuYM+4Bzf9oItMQQr+VuMjxe+UAWMCAwEAATAN
BgkqhkiG9w0BAQsFAAOCAQEAOz8znqhmVw7g6RsENcOqu7UtjbdEitRd9aAW4hiz
WJbbPv1rCU6+cFA8vCiQYdZagl8xrZrYyCpx+JUqQFkDUuq2kdQRgeAnQTggNV+K
Xs702G+AMB3GmulPdlIPTN7YXQXoCiIJgsxn/CKveQYyYXuMdRJw/9GJJR9FatkJ
xkG7EX7PaWOpimA/+U40PRyJ4etxclFNVuBbefQ/cWCHQhupY7hewdaK2yIXyXvd
xAITd32OHKn7H/rEl220hwCPuGFUUvvoEtXn2i77dequl7BG3ceikkmjsdueqUxv
3Ggt+TSxF2vu3ZXzDT1AjV7TFTLX7ClDQMXdUIn/nBF14g==`
