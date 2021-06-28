import fetchInstitutionLists from "../../src/kostentraeger/fetcher"
import { writeFileSync } from "fs"
import { serializeInstitutionLists } from "../../src/kostentraeger/json_serializer"

describe("kostentraeger fetcher", () => {

    it("fetch all", async () => {
        const result = await fetchInstitutionLists()
        const lists = result.map(it => it.institutionList)
        writeFileSync("dist/kostentraeger.json", serializeInstitutionLists(lists, 2))
        writeFileSync("dist/kostentraeger.min.json", serializeInstitutionLists(lists))

        // additionally, let's print the warnings into a separate file too
        let warnings: string = ""
        result.forEach(parseResult => {
            if (parseResult.warnings.length > 0) {
                warnings += parseResult.fileName + "\n" + parseResult.warnings.map(it => "  " + it).join("\n") + "\n\n"
            }
        })
        writeFileSync("dist/kostentraeger-warnings.txt", warnings)
    })
})
