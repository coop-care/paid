import { DataType, KostentraegerFindResult, KostentraegerIndex, Leistungsart } from "../../src/kostentraeger/index"
import { 
    CareProviderLocationSchluessel,
    Institution,
    InstitutionList
} from "../../src/kostentraeger/types"

describe("Kostenträger index", () => {

    it("finds kostentraeger when there are no kostentraeger links", () => {
        const kasse = { 
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000001"),
            ik: "00000001"
        } as Institution

        expect(find([institutionListOf([kasse])], "00000001")).toEqual({
            pflegekasse: kasse,
            kostentraeger: kasse,
            encryptTo: kasse,
            sendTo: kasse 
        })
    })

    it("finds kostentraeger when there is one simple kostentraeger link", () => {
        const kasse = { 
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000001"),
            ik: "00000001",
            kostentraegerLinks: [{ ik: "00000001" }],
        } as Institution

        expect(find([institutionListOf([kasse])], "00000001")).toEqual({
            pflegekasse: kasse,
            kostentraeger: kasse,
            encryptTo: kasse,
            sendTo: kasse 
        })
    })

    it("finds kostentraeger with multiple redirects", () => {
        const kasse1 = { 
            ...base, 
            ik: "00000001",
            kostentraegerLinks: [{ ik: "00000002" }],
        } as Institution

        const kasse2 = { 
            ...base, 
            ik: "00000002",
            kostentraegerLinks: [{ ik: "00000003" }],
        } as Institution

        const kasse3 = { 
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000003"),
            ik: "00000003",
        } as Institution

        expect(find([institutionListOf([kasse1, kasse2, kasse3])], "00000001")).toEqual({
            pflegekasse: kasse1,
            kostentraeger: kasse3,
            encryptTo: kasse3,
            sendTo: kasse3 
        })
    })

    it("on finding kostentraeger, does not run into endless loop for circular links", () => {
        const kasse1 = { 
            ...base, 
            ik: "00000001",
            kostentraegerLinks: [{ ik: "00000002" }],
        } as Institution

        const kasse2 = { 
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000002"),
            ik: "00000002",
            kostentraegerLinks: [{ ik: "00000001" }],
        } as Institution

        expect(find([institutionListOf([kasse1, kasse2])], "00000001")).toEqual({
            pflegekasse: kasse1,
            kostentraeger: kasse2,
            encryptTo: kasse2,
            sendTo: kasse2 
        })
    })

    it("finds kostenträger with different datenannahmestelle", () => {
        const pflegekasse = { 
            ...base, 
            ik: "00000001",
            kostentraegerLinks: [{
                ik: "00000002"
            }]
        }
        const kostentraeger = {
            ...base, 
            ik: "00000002",
            datenannahmestelleLinks: [{
                ik: "00000003"
            }]
        }
        const datenannahmestelle = {
            ...base, 
            ik: "00000003",
            transmissionMethods: {
                paperReceipt: true,
                machineReadablePaperReceipt: true,
                email: "default@default.de",
                zeichensatz: "I8"
            }
        } as Institution

        expect(find([institutionListOf([pflegekasse, kostentraeger, datenannahmestelle])], "00000001")).toEqual({
            pflegekasse: pflegekasse,
            kostentraeger: kostentraeger,
            encryptTo: datenannahmestelle,
            sendTo: datenannahmestelle 
        })
    })

    it("finds kostenträger with different datenannahmestelle and different place to send to", () => {
        const pflegekasse = { 
            ...base, 
            ik: "00000001",
            kostentraegerLinks: [{
                ik: "00000002"
            }]
        } as Institution
        const kostentraeger = {
            ...base, 
            ik: "00000002",
            datenannahmestelleLinks: [{
                ik: "00000003"
            }]
        } as Institution
        const trustedDatenannahmestelle = {
            ...base, 
            ik: "00000003",
            untrustedDatenannahmestelleLinks: [{
                ik: "00000004"
            }]
        } as Institution
        const untrustedDatenannahmestelle = {
            ...base, 
            ik: "00000004",
            transmissionMethods: {
                paperReceipt: true,
                machineReadablePaperReceipt: true,
                email: "default@default.de",
                zeichensatz: "I8"
            }
        } as Institution

        expect(find([institutionListOf([
            pflegekasse,
            kostentraeger,
            trustedDatenannahmestelle,
            untrustedDatenannahmestelle
        ])], "00000001")).toEqual({
            pflegekasse: pflegekasse,
            kostentraeger: kostentraeger,
            encryptTo: trustedDatenannahmestelle,
            sendTo: untrustedDatenannahmestelle 
        })
    })

    it("excludes lists for a different Leistungserbringer group", () => {
        expect(find(
            [{
                ...institutionListOf([simple]),
                leistungserbringerGruppeSchluessel: "6",  // <- LE-Gruppe 6 but...
            }], 
            defaultIK,
            { leistungsart: { sgbvAbrechnungscode: "11" } }  // <- ...using Abrechnungscode for LE-Gruppe 5
        )).toEqual(undefined)
    })

    it("excludes lists that are not valid yet", () => {
        expect(find(
            [{
                ...institutionListOf([simple]),
                validityStartDate: new Date("2010-02-01"), // valid starting then...
            }], 
            defaultIK,
            { date: new Date("2010-01-01") } // ...but "today" is the day before
        )).toEqual(undefined)
    })

    it("when several lists of the same issuer etc. are valid, takes only the most current one", () => {
        expect(find(
            [{
                ...institutionListOf([simple]),
                validityStartDate: new Date("2010-02-01"), // older
            },{
                ...institutionListOf( [{...simple, name: "new name"}]),
                validityStartDate: new Date("2011-02-01"), // newer
            }], 
            defaultIK,
            { date: new Date("2016-01-01") }
        )?.pflegekasse?.name).toEqual("new name")
    })

    it("excludes single institutions that are not valid", () => {
        expect(find(
            [institutionListOf([
                {
                    ...simple,
                    validityFrom: new Date("2020-01-01")    // not valid yet
                }, {
                    ...simple,
                    validityTo: new Date("2010-01-01")    // not valid anymore... nothing left then! 
                }
            ])],
            defaultIK,
            { date: new Date("2016-01-01") }
        )).toEqual(undefined)
    })

    it("excludes single institutions that are not valid when linked to as Kostenträger", () => {
        expect(find(
            [institutionListOf([
                { 
                    ...base, 
                    ik: "00000001",
                    kostentraegerLinks: [{ ik: "00000002" }]
                }, {
                    ...base, 
                    ...acceptsData,
                    ...linksPapierAndDatenannahmeTo("00000002"),
                    ik: "00000002",
                    validityFrom: new Date("2020-01-01")            // <- not valid yet
                } as Institution
            ])],
            defaultIK,
            { date: new Date("2016-01-01") }  // ...because today is this
        )).toEqual(undefined)
    })

    it("excludes single institutions that are not valid when linked to as Datenannahmestelle", () => {
        expect(find(
            [institutionListOf([
                { 
                    ...base, 
                    ik: "00000001",
                    ...linksPapierAndDatenannahmeTo("00000002"),
                }, {
                    ...base, 
                    ...acceptsData,
                    ik: "00000002",
                    validityFrom: new Date("2020-01-01"),             // <- not valid yet
                } as Institution
            ])],
            defaultIK,
            { date: new Date("2016-01-01") } // ...because today is this
        )).toEqual(undefined)
    })

    /* here only tested for links to Kostenträger because the linking stuff is identical in 
       implementation for all link types... */

    it("heeds the location", () => {
        const kasse = { 
            ...base, 
            ik: "00000001",
            kostentraegerLinks: [{ 
                ik: "00000002",
                location: "HH"
            },{ 
                ik: "00000003",
                location: "SH"
            }],
        } as Institution

        const kostentraeger2 = {
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000002"),
            ik: "00000002"
        } as Institution

        const kostentraeger3 = {
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000003"),
            ik: "00000003"
        } as Institution

        const institutionLists = [institutionListOf([kasse, kostentraeger2, kostentraeger3])]

        expect(find(institutionLists, "00000001",{ location: "SL" })).toEqual(undefined)

        expect(find(institutionLists, "00000001",{ location: "HH" })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger2,
            encryptTo: kostentraeger2,
            sendTo: kostentraeger2
        })

        expect(find(institutionLists, "00000001",{ location: "SH" })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger3,
            encryptTo: kostentraeger3,
            sendTo: kostentraeger3
        })
    })

    it("heeds the grouped location", () => {
        const kasse = { 
            ...base, 
            ik: "00000001",
            kostentraegerLinks: [{ 
                ik: "00000002",
                location: "NW"
            }],
        } as Institution

        const kostentraeger = {
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000002"),
            ik: "00000002"
        } as Institution

        const institutionLists = [institutionListOf([kasse, kostentraeger])]

        expect(find(institutionLists, "00000001",{ location: "HH" })).toEqual(undefined)

        expect(find(institutionLists, "00000001",{ location: "Westfalen-Lippe" })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger,
            encryptTo: kostentraeger,
            sendTo: kostentraeger
        })
    })

    it("heeds the sgbxiLeistungsart", () => {
        const kasse = { 
            ...base, 
            ik: "00000001",
            kostentraegerLinks: [{ 
                ik: "00000002",
                sgbxiLeistungsart: "05"
            },{ 
                ik: "00000003",
                sgbxiLeistungsart: "99"         // <- = "Rest"
            }],
        } as Institution

        const kostentraeger2 = {
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000002"),
            ik: "00000002"
        } as Institution

        const kostentraeger3 = {
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000003"),
            ik: "00000003"
        } as Institution

        const institutionLists = [institutionListOf([kasse, kostentraeger2, kostentraeger3])]

        expect(find(institutionLists, "00000001", { leistungsart: { sgbxiLeistungsart: "05" }})).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger2,
            encryptTo: kostentraeger2,
            sendTo: kostentraeger2
        })

        expect(find(institutionLists, "00000001",{ leistungsart: { sgbxiLeistungsart: "08" } })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger3,
            encryptTo: kostentraeger3,
            sendTo: kostentraeger3
        })
    })

    it("heeds the sgbvLeistungsart", () => {
        const kasse = { 
            ...base, 
            ik: "00000001",
            kostentraegerLinks: [{ 
                ik: "00000002",
                sgbvAbrechnungscode: "31"
            },{ 
                ik: "00000003",
                sgbvAbrechnungscode: "99"         // <- = "Rest"
            }],
        } as Institution

        const kostentraeger2 = {
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000002"),
            ik: "00000002"
        } as Institution

        const kostentraeger3 = {
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000003"),
            ik: "00000003"
        } as Institution

        const institutionLists = [{
            ...institutionListOf([kasse, kostentraeger2, kostentraeger3]),
            leistungserbringerGruppeSchluessel: "5"
        }] as InstitutionList[]

        expect(find(institutionLists, "00000001", { leistungsart: { sgbvAbrechnungscode: "31" }})).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger2,
            encryptTo: kostentraeger2,
            sendTo: kostentraeger2
        })

        expect(find(institutionLists, "00000001",{ leistungsart: { sgbvAbrechnungscode: "60" } })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger3,
            encryptTo: kostentraeger3,
            sendTo: kostentraeger3
        })
    })

    it("heeds the grouped sgbvLeistungsart", () => {
        const kasse = { 
            ...base, 
            ik: "00000001",
            kostentraegerLinks: [{ 
                ik: "00000002",
                sgbvAbrechnungscode: "30"
            }],
        } as Institution

        const kostentraeger = {
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000002"),
            ik: "00000002"
        } as Institution

        const institutionLists = [{
            ...institutionListOf([kasse, kostentraeger]),
            leistungserbringerGruppeSchluessel: "5"
        }] as InstitutionList[]

        expect(find(institutionLists, "00000001", { leistungsart: { sgbvAbrechnungscode: "31" }})).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger,
            encryptTo: kostentraeger,
            sendTo: kostentraeger
        })
        expect(find(institutionLists, "00000001", { leistungsart: { sgbvAbrechnungscode: "32" }})).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger,
            encryptTo: kostentraeger,
            sendTo: kostentraeger
        })
        expect(find(institutionLists, "00000001", { leistungsart: { sgbvAbrechnungscode: "41" }})).toEqual(undefined)
    })

    it("heeds both the location and leistungsart", () => {
        const kasse = { 
            ...base, 
            ik: "00000001",
            kostentraegerLinks: [{ 
                ik: "00000002",
                location: "HH",
                sgbxiLeistungsart: "05"
            }],
        } as Institution

        const kostentraeger = {
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000002"),
            ik: "00000002"
        } as Institution

        const institutionLists = [institutionListOf([kasse, kostentraeger])]

        expect(find(
            institutionLists,
            "00000001",
            { location: "SL", leistungsart: { sgbxiLeistungsart: "05"} }
        )).toEqual(undefined)

        expect(find(
            institutionLists,
            "00000001",
            { location: "HH", leistungsart: { sgbxiLeistungsart: "06"} }
        )).toEqual(undefined)

        expect(find(
            institutionLists,
            "00000001",
            { location: "HH", leistungsart: { sgbxiLeistungsart: "05"} }
        )).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger,
            encryptTo: kostentraeger,
            sendTo: kostentraeger
        })
    })

    it("links to specific location take precedence over others", () => {
        const kasse = { 
            ...base, 
            ik: "00000001",
            kostentraegerLinks: [{ 
                ik: "00000002",
                location: "HH"
            },
            { 
                ik: "00000003"
            }
        ],
        } as Institution

        const kostentraeger2 = {
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000002"),
            ik: "00000002"
        } as Institution

        const kostentraeger3 = {
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000003"),
            ik: "00000003"
        } as Institution

        const institutionLists = 

        expect(find(
            [institutionListOf([kasse, kostentraeger2, kostentraeger3])],
            "00000001",
            { location: "HH" }
        )).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger2,
            encryptTo: kostentraeger2,
            sendTo: kostentraeger2
        })

        // make sure that the previous test didn't just succeed because of the order
        expect(find(
            [institutionListOf([kasse, kostentraeger3, kostentraeger2])], // <- different order
            "00000001",
            { location: "HH" }
        )).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger2,
            encryptTo: kostentraeger2,
            sendTo: kostentraeger2
        })
    })

    it("finds papierannahmestelle", () => {
        const kasse = { 
            ...base, 
            papierannahmestelleLinks: [{
                ik: "00000001",
                paperReceipt: false,
                machineReadablePaperReceipt: true,
                prescription: true,
                costEstimate: false
            }],
            ik: "00000001"
        } as Institution
        const institutionList = [institutionListOf([kasse])]

        expect(find(institutionList, "00000001", { dataType: "paperReceipt" })).toEqual(undefined)
        expect(find(institutionList, "00000001", { dataType: "costEstimate" })).toEqual(undefined)

        expect(find(institutionList, "00000001", { dataType: "machineReadablePaperReceipt" })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kasse,
            sendTo: kasse 
        })
        expect(find(institutionList, "00000001", { dataType: "prescription" })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kasse,
            sendTo: kasse 
        })

        const kasse2 = { 
            ...base, 
            papierannahmestelleLinks: [{
                ik: "00000001",
                paperReceipt: true,
                machineReadablePaperReceipt: false,
                prescription: false,
                costEstimate: true
            }],
            ik: "00000001"
        } as Institution

        const institutionList2 = [institutionListOf([kasse2])]

        expect(find(institutionList2, "00000001", { dataType: "machineReadablePaperReceipt" })).toEqual(undefined)
        expect(find(institutionList2, "00000001", { dataType: "prescription" })).toEqual(undefined)

        expect(find(institutionList2, "00000001", { dataType: "paperReceipt" })).toEqual({
            pflegekasse: kasse2,
            kostentraeger: kasse2,
            sendTo: kasse2 
        })
        expect(find(institutionList2, "00000001", { dataType: "costEstimate" })).toEqual({
            pflegekasse: kasse2,
            kostentraeger: kasse2,
            sendTo: kasse2 
        })
    })
})

const defaultIK: string = "00000000"

const institutionListOf = (institutions: Institution[]): InstitutionList => ({
    issuerIK: "00000000",
    leistungserbringerGruppeSchluessel: "6",
    kassenart: "AO",
    validityStartDate: new Date("2000-01-01"),
    institutions: institutions
})

/* Default institution with just the necessary info */
const base: Institution = {
    ik: defaultIK,
    name: "default name",
    abbreviatedName: "default abbr. name",
    contacts: [],
    addresses: [{
        postcode: 0,
        place: "default place"
    }],
    kostentraegerLinks: [],
    datenannahmestelleLinks: [],
    untrustedDatenannahmestelleLinks: [],
    papierannahmestelleLinks: []
}

/* Merge with base to get an institution that links to itself for data and paper acceptance */
const linksPapierAndDatenannahmeTo = (ik: string) => ({
    datenannahmestelleLinks: [{
        ik: ik
    }],
    papierannahmestelleLinks: [{
        ik: ik,
        paperReceipt: true,
        machineReadablePaperReceipt: true,
        prescription: true,
        costEstimate: true
    }]
})

const acceptsData = {
    transmissionMethods: {
        paperReceipt: true,
        machineReadablePaperReceipt: true,
        email: "default@default.de",
        zeichensatz: "I8"
    }
}

const simple = { ...base, ...acceptsData, ...linksPapierAndDatenannahmeTo(defaultIK) } as Institution

type OptFindParams = {
    dataType?: DataType
    leistungsart?: Leistungsart,
    location?: CareProviderLocationSchluessel,
    date?: Date
}

function find(
    institutionLists: InstitutionList[],
    pflegekasseIK: string,
    {
        dataType = "digitalReceipt",
        leistungsart = { sgbxiLeistungsart: "01" },
        location = "HH",
        date = new Date()
    }: OptFindParams = {}
): KostentraegerFindResult | undefined {
    return new KostentraegerIndex(institutionLists).find(
        dataType, pflegekasseIK, leistungsart, location, date
    )
}