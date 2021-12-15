import { deserializeInstitutionLists, serializeInstitutionLists } from "../../src/kostentraeger/json_serializer"
import { base64ToArrayBuffer } from "../../src/pki/utils"
import { InstitutionList } from "../../src/kostentraeger/types"
import { AsnParser, AsnSerializer } from "@peculiar/asn1-schema"
import { Certificate } from "@peculiar/asn1-x509"


describe("Institution lists with certificates JSON serializer", () => {

    it("serialize and deserialize", () => {

        const list1: InstitutionList[] = [{
            issuerIK: "123456789",
            leistungserbringerGruppeSchluessel: "6",
            kassenart: "AO",
            validityStartDate: new Date("2018-05-05"),
            institutions: [{
                ik: "999999999",
                abbreviatedName: "short name",
                name: "very long name",
                // no validityFrom, so we test if it works correctly if property is undefined
                validityTo: new Date("2088-10-10"),
                certificates: [certificate],
                addresses: [
                    { postcode: 12345, place: "Humburg" }
                ],
                contacts: []
            }]
        }]

        const str = serializeInstitutionLists(list1)
        const list2 = deserializeInstitutionLists(str)
        const str2 = serializeInstitutionLists(list2)

        arrayBufferEquals( 
            AsnSerializer.serialize(list1[0]!.institutions[0]!.certificates![0]!),
            AsnSerializer.serialize(list2[0]!.institutions[0]!.certificates![0]!)
        )
        // we cannot equal the institution list directly cause same dates do not equal
        expect(str2).toEqual(str)
    })
})

function arrayBufferEquals (buf1: ArrayBuffer, buf2: ArrayBuffer)
{
    if (buf1.byteLength != buf2.byteLength) { return false }
    var bytes1 = new Int8Array(buf1)
    var bytes2 = new Int8Array(buf2)
    for (var i = 0; i != buf1.byteLength; i++)
    {
        if (bytes1[i] != bytes2[i]) { return false }
    }
    return true
}

const certificate = AsnParser.parse(
    base64ToArrayBuffer(
`MIIDTjCCAjagAwIBAgIDAnxUMA0GCSqGSIb3DQEBCwUAMEkxCzAJBgNVBAYTAkRF
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
3Ggt+TSxF2vu3ZXzDT1AjV7TFTLX7ClDQMXdUIn/nBF14g==`),
Certificate
)