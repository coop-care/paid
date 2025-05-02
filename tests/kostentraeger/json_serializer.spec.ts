import { deserializeInstitutionLists, serializeInstitutionLists } from "../../src/kostentraeger/json_serializer"
import { base64ToArrayBuffer } from "../../src/pki/utils"
import { InstitutionList } from "../../src/kostentraeger/types"
import { AsnParser, AsnSerializer } from "@peculiar/asn1-schema"
import { Certificate } from "@peculiar/asn1-x509"
import { exampleKostentraegerCertificatePEM } from "../samples/certificates"


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
    base64ToArrayBuffer(exampleKostentraegerCertificatePEM()),
    Certificate
)
