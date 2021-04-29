import fetchKostentraeger from "../../src/kostentraeger/fetcher"

describe("kostentraeger fetcher", () => {

    it("fetch all", async () => {
        const institutionLists = await fetchKostentraeger()
        //console.log(JSON.stringify(institutionLists, undefined, 2))
    })

})


