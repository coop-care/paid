import { InstitutionList, institutionListReplacer, institutionListReviver } from "../../src/kostentraeger/types"

describe("InstitutionList", () => {

    it("stringify and parse InstitutionList", () => {
        const institutionList: InstitutionList = {
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
                addresses: [
                    { postcode: 12345, place: "Humburg" }
                ],
                contacts: []
            }],
        }

        const str = JSON.stringify(institutionList, institutionListReplacer)
        const institutionList2 = JSON.parse(str, institutionListReviver) as InstitutionList
        const str2 = JSON.stringify(institutionList2, institutionListReplacer)

        // we cannot equal the institution list directly cause same dates do not equal
        expect(str2).toEqual(str)
    })
})
