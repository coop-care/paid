import { InstitutionList } from "../../src/kostentraeger/types"

describe("Kostenträger index", () => {

    it("excludes lists for a different Leistungserbringer group", () => {
        const institutionLists: InstitutionList[] = [{
            issuerIK: "123456789",
            leistungserbringerGruppeSchluessel: "5",
            kassenart: "AO",
            validityStartDate: new Date("2017-09-01"),
            institutions: [

            ]
        }]
        // todo
    })

    it("excludes lists that are not valid yet", () => {
        // todo
    })

    it("when several lists of the same issuer etc. are valid, takes only the most current one", () => {
        // todo
    })


    it("excludes single institutions that are not valid", () => {
        // todo
    })

    it("excludes single institutions that are not valid also when linked to", () => {
        // todo
    })

    it("finds kostentraeger when there are no kostentraeger links", () => {
        // todo
    })

    it("finds kostentraeger when there is one simple kostentraeger link", () => {
        // todo
    })

    it("finds kostentraeger with multiple redirects", () => {
        // todo
    })

    it("on finding kostentraeger, does not run into endless loop for circular links", () => {
        // todo
    })

    it("on finding kostentraeger, excludes links for another location or leistungsart", () => {
        // todo
    })

    it("on finding datenannahmestellen, excludes links for another location or leistungsart", () => {
        // todo
    })
})