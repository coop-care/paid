import fetchKostentraeger from "../../src/kostentraeger/fetcher"
import { writeFileSync } from "fs"
import { InstitutionList } from "../../src/kostentraeger/types"

describe("kostentraeger fetcher", () => {

    it("fetch all", async () => {
        const institutionListParseResults = await fetchKostentraeger()

        const institutionMap: {[k: string]: InstitutionList} = {}
        let warnings: string = ""

        institutionListParseResults.forEach((parseResult, filename) => {
            if (parseResult.warnings.length > 0) {
                warnings += filename + "\n" + parseResult.warnings.map(it => "  " + it).join("\n") + "\n\n"
            }
            institutionMap[filename] = parseResult.institutionList
        })

        writeFileSync("kostentraeger.json", JSON.stringify(institutionMap, undefined, 2))
        writeFileSync("kostentraeger-warnings.txt", warnings)
    })

})


