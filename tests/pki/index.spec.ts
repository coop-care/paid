import { IKPublicKeyInfo } from "../../src/pki/types"
import { IKPublicKeyIndex } from "../../src/pki/index"

describe("public key index", () => {

    it("index does not return key for unknown IK", () => {
        const keyInfo: IKPublicKeyInfo = {
            ik: "1234567890",
            validityFrom: new Date("2010-01-01"),
            validityTo: new Date("2012-01-01"),
            publicKey: new ArrayBuffer(8)
        }

        expect(index(keyInfo).get("0000000001")).toBeUndefined()
    })

    it("index does not return expired key", () => {
        const keyInfo: IKPublicKeyInfo = {
            ik: "1234567890",
            validityFrom: new Date("2010-01-01"),
            validityTo: new Date("2012-01-01"),
            publicKey: new ArrayBuffer(8)
        }

        expect(index(keyInfo).get("1234567890", new Date("2012-01-02"))).toBeUndefined()
    })

    it("index returns key", () => {
        const keyInfo: IKPublicKeyInfo = {
            ik: "1234567890",
            validityFrom: new Date("2010-01-01"),
            validityTo: new Date("2012-01-01"),
            publicKey: new ArrayBuffer(8)
        }

        expect(index(keyInfo).get("1234567890", new Date("2011-01-01"))).toEqual(keyInfo.publicKey)
    })


    it("index returns newer key", async () => {
        const oldKeyInfo: IKPublicKeyInfo = {
            ik: "1234567890",
            validityFrom: new Date("2010-01-01"),
            validityTo: new Date("2020-01-01"),
            publicKey: new ArrayBuffer(8)
        }
        const newKeyInfo: IKPublicKeyInfo = {
            ik: "1234567890",
            validityFrom: new Date("2010-01-01"),
            validityTo: new Date("2022-01-01"),
            publicKey: new ArrayBuffer(9)
        }

        expect(
            index(oldKeyInfo, newKeyInfo).get("1234567890", new Date("2011-01-01"))
        ).toEqual(newKeyInfo.publicKey)
    })

})

const index = (...keyInfos: IKPublicKeyInfo[]): IKPublicKeyIndex => new IKPublicKeyIndex(keyInfos)
