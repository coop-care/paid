import parse from "../../../src/kostentraeger/pki/parser"
import { AsnSerializer } from "@peculiar/asn1-schema"
import { base64ToArrayBuffer } from "../../../src/pki/utils"
import { multipleExampleCertificatesPEM } from "../../samples/certificates"

describe("certificates parser", () => {

    it("parse two certificates", () => {
        const certificatesPEM = multipleExampleCertificatesPEM()
        const [certificate1PEM, certificate2PEM] = certificatesPEM
        const certificatesByIK = parse(certificatesPEM.join("\n\n"))
        
        const info1 = certificatesByIK.get("109979978")!
        expect(info1).toHaveLength(1)
        expect(AsnSerializer.serialize(info1[0])!).toEqual(base64ToArrayBuffer(certificate1PEM))

        const info2 = certificatesByIK.get("109905003")!
        expect(info2).toHaveLength(1)
        expect(AsnSerializer.serialize(info2[0])!).toEqual(base64ToArrayBuffer(certificate2PEM))
    })
})
