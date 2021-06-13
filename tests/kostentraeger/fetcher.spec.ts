import fetchKostentraeger from "../../src/kostentraeger/fetcher"
import { writeFileSync } from "fs"
import { institutionListReplacer } from "../../src/kostentraeger/types"

describe("kostentraeger fetcher", () => {

    it("fetch all", async () => {
        const institutionListParseResults = await fetchKostentraeger()

        const institutionLists = institutionListParseResults.map(result => result.institutionList)

        let warnings: string = ""
        institutionListParseResults.forEach(parseResult => {
            if (parseResult.warnings.length > 0) {
                warnings += parseResult.fileName + "\n" + parseResult.warnings.map(it => "  " + it).join("\n") + "\n\n"
            }
        })

        writeFileSync("dist/kostentraeger.json", JSON.stringify(institutionLists, institutionListReplacer, 2))
        writeFileSync("dist/kostentraeger.min.json", JSON.stringify(institutionLists, institutionListReplacer))
        writeFileSync("dist/kostentraeger-warnings.txt", warnings)
    })

})
