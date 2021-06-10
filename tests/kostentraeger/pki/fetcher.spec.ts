import fetch from "../../../src/kostentraeger/pki/fetcher"
import { writeFileSync } from "fs"
import { ikPublicKeyInfoReplacer } from "../../../src/kostentraeger/pki/types"

describe("certificates fetcher", () => {

    it("fetch", async () => {
        const publicKeyInfos = await fetch()
        
        writeFileSync("dist/pkeys.json", JSON.stringify(publicKeyInfos, ikPublicKeyInfoReplacer, 2))
        writeFileSync("dist/pkeys.min.json", JSON.stringify(publicKeyInfos, ikPublicKeyInfoReplacer))
    })
})
