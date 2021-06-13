import fetch from "../../src/pki/fetcher"
import { writeFileSync } from "fs"
import { ikPublicKeyInfoReplacer } from "../../src/pki/types"

describe("certificates fetcher", () => {

    it("fetch", async () => {
        const publicKeyInfos = await fetch()
        
        writeFileSync("dist/pkeys.json", JSON.stringify(publicKeyInfos, ikPublicKeyInfoReplacer, 2))
        writeFileSync("dist/pkeys.min.json", JSON.stringify(publicKeyInfos, ikPublicKeyInfoReplacer))
    })
})
