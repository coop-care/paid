import { IKPublicKeyInfo, ikPublicKeyInfoReplacer, ikPublicKeyInfoReviver } from "../../src/pki/types"
import { base64ToArrayBuffer } from "../../src/pki/utils"

describe("IKPublicKeyInfo", () => {

    it("stringify and parse IKPublicKeyInfo", () => {
        const keyInfo = {
            ik: "1234567890",
            validityFrom: new Date("2010-10-10"),
            validityTo: new Date("2020-12-12"),
            publicKey: base64ToArrayBuffer("TG9yZW0gaXBzb20gZG9sb3IgZXN0")
        } as IKPublicKeyInfo

        const str = JSON.stringify(keyInfo, ikPublicKeyInfoReplacer)
        const keyInfo2 = JSON.parse(str, ikPublicKeyInfoReviver) as IKPublicKeyInfo

        expect(keyInfo2.ik).toEqual(keyInfo.ik)
        expect(JSON.stringify(keyInfo2.validityFrom)).toEqual(JSON.stringify(keyInfo.validityFrom))
        expect(JSON.stringify(keyInfo2.validityTo)).toEqual(JSON.stringify(keyInfo.validityTo))
        expect(arrayBufferEquals(keyInfo2.publicKey, keyInfo.publicKey)).toBeTruthy()
    })
})

export function arrayBufferEquals (buf1: ArrayBuffer, buf2: ArrayBuffer)
{
    if (buf1.byteLength != buf2.byteLength) return false
    var bytes1 = new Int8Array(buf1)
    var bytes2 = new Int8Array(buf2)
    for (var i = 0; i != buf1.byteLength; i++)
    {
        if (bytes1[i] != bytes2[i]) return false
    }
    return true
}
