import { 
    KostentraegerForDataFindResult,
    KostentraegerForPaperFindResult,
    InstitutionListsIndex,
    Leistungsart
} from "../../src/kostentraeger/index"
import { 
    CareProviderLocationSchluessel,
    Institution,
    InstitutionList,
    PaperDataType
} from "../../src/kostentraeger/types"
import { base64ToArrayBuffer } from "../../src/pki/utils"
import { AsnParser } from "@peculiar/asn1-schema"
import { Certificate, Time } from "@peculiar/asn1-x509"

describe("Kostenträger index", () => {

    it("finds kostentraeger when there are no kostentraeger links", () => {
        const kasse = { 
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000001"),
            ik: "00000001"
        } as Institution

        expect(findForData([institutionListOf([kasse])], "00000001")).toEqual({
            pflegekasse: kasse,
            kostentraeger: kasse,
            encryptTo: kasse,
            certificate: defaultCertificate,
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

        expect(findForData([institutionListOf([kasse])], "00000001")).toEqual({
            pflegekasse: kasse,
            kostentraeger: kasse,
            encryptTo: kasse,
            certificate: defaultCertificate,
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

        expect(findForData([institutionListOf([kasse1, kasse2, kasse3])], "00000001")).toEqual({
            pflegekasse: kasse1,
            kostentraeger: kasse3,
            encryptTo: kasse3,
            certificate: defaultCertificate,
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

        expect(findForData([institutionListOf([kasse1, kasse2])], "00000001")).toEqual({
            pflegekasse: kasse1,
            kostentraeger: kasse2,
            encryptTo: kasse2,
            certificate: defaultCertificate,
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
            transmissionEmail: "default@default.de",
            ...usesDefaultCertificate
        } as Institution

        expect(findForData([institutionListOf([pflegekasse, kostentraeger, datenannahmestelle])], "00000001")).toEqual({
            pflegekasse: pflegekasse,
            kostentraeger: kostentraeger,
            encryptTo: datenannahmestelle,
            certificate: defaultCertificate,
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
            }],
            ...usesDefaultCertificate
        } as Institution
        const untrustedDatenannahmestelle = {
            ...base, 
            ik: "00000004",
            transmissionEmail: "default@default.de",
        } as Institution

        expect(findForData([institutionListOf([
            pflegekasse,
            kostentraeger,
            trustedDatenannahmestelle,
            untrustedDatenannahmestelle
        ])], "00000001")).toEqual({
            pflegekasse: pflegekasse,
            kostentraeger: kostentraeger,
            encryptTo: trustedDatenannahmestelle,
            certificate: defaultCertificate,
            sendTo: untrustedDatenannahmestelle 
        })
    })

    it("excludes lists for a different Leistungserbringer group", () => {
        expect(findForData(
            [{
                ...institutionListOf([simple]),
                leistungserbringerGruppeSchluessel: "6",  // <- LE-Gruppe 6 but...
            }], 
            defaultIK,
            { leistungsart: { sgbvAbrechnungscode: "11" } }  // <- ...using Abrechnungscode for LE-Gruppe 5
        )).toEqual(undefined)
    })

    it("excludes lists that are not valid yet", () => {
        expect(findForData(
            [{
                ...institutionListOf([simple]),
                validityStartDate: new Date("2010-02-01"), // valid starting then...
            }], 
            defaultIK,
            { date: new Date("2010-01-01") } // ...but "today" is the day before
        )).toEqual(undefined)
    })

    it("when several lists of the same issuer etc. are valid, takes only the most current one", () => {
        expect(findForData(
            [{
                ...institutionListOf([simple]),
                validityStartDate: new Date("2021-01-01"), // older
            },{
                ...institutionListOf( [{...simple, name: "new name"}]),
                validityStartDate: new Date("2021-03-01"), // newer
            }], 
            defaultIK,
            { date: new Date("2021-04-01") }
        )?.pflegekasse?.name).toEqual("new name")
    })

    it("excludes single institutions that are not valid", () => {
        expect(findForData(
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
        expect(findForData(
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
        expect(findForData(
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

        expect(findForData(institutionLists, "00000001",{ location: "SL" })).toEqual(undefined)

        expect(findForData(institutionLists, "00000001",{ location: "HH" })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger2,
            encryptTo: kostentraeger2,
            certificate: defaultCertificate,
            sendTo: kostentraeger2
        })

        expect(findForData(institutionLists, "00000001",{ location: "SH" })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger3,
            encryptTo: kostentraeger3,
            certificate: defaultCertificate,
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

        expect(findForData(institutionLists, "00000001",{ location: "HH" })).toEqual(undefined)

        expect(findForData(institutionLists, "00000001",{ location: "Westfalen-Lippe" })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger,
            encryptTo: kostentraeger,
            certificate: defaultCertificate,
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

        expect(findForData(institutionLists, "00000001", { leistungsart: { sgbxiLeistungsart: "05" }})).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger2,
            encryptTo: kostentraeger2,
            certificate: defaultCertificate,
            sendTo: kostentraeger2
        })

        expect(findForData(institutionLists, "00000001",{ leistungsart: { sgbxiLeistungsart: "08" } })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger3,
            encryptTo: kostentraeger3,
            certificate: defaultCertificate,
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

        expect(findForData(institutionLists, "00000001", { leistungsart: { sgbvAbrechnungscode: "31" }})).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger2,
            encryptTo: kostentraeger2,
            certificate: defaultCertificate,
            sendTo: kostentraeger2
        })

        expect(findForData(institutionLists, "00000001",{ leistungsart: { sgbvAbrechnungscode: "60" } })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger3,
            encryptTo: kostentraeger3,
            certificate: defaultCertificate,
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

        expect(findForData(institutionLists, "00000001", { leistungsart: { sgbvAbrechnungscode: "31" }})).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger,
            encryptTo: kostentraeger,
            certificate: defaultCertificate,
            sendTo: kostentraeger
        })
        expect(findForData(institutionLists, "00000001", { leistungsart: { sgbvAbrechnungscode: "32" }})).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger,
            encryptTo: kostentraeger,
            certificate: defaultCertificate,
            sendTo: kostentraeger
        })
        expect(findForData(institutionLists, "00000001", { leistungsart: { sgbvAbrechnungscode: "41" }})).toEqual(undefined)
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

        expect(findForData(
            institutionLists,
            "00000001",
            { location: "SL", leistungsart: { sgbxiLeistungsart: "05"} }
        )).toEqual(undefined)

        expect(findForData(
            institutionLists,
            "00000001",
            { location: "HH", leistungsart: { sgbxiLeistungsart: "06"} }
        )).toEqual(undefined)

        expect(findForData(
            institutionLists,
            "00000001",
            { location: "HH", leistungsart: { sgbxiLeistungsart: "05"} }
        )).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger,
            encryptTo: kostentraeger,
            certificate: defaultCertificate,
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

        expect(findForData(
            [institutionListOf([kasse, kostentraeger2, kostentraeger3])],
            "00000001",
            { location: "HH" }
        )).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger2,
            encryptTo: kostentraeger2,
            certificate: defaultCertificate,
            sendTo: kostentraeger2
        })

        // make sure that the previous test didn't just succeed because of the order
        expect(findForData(
            [institutionListOf([kasse, kostentraeger3, kostentraeger2])], // <- different order
            "00000001",
            { location: "HH" }
        )).toEqual({
            pflegekasse: kasse,
            kostentraeger: kostentraeger2,
            encryptTo: kostentraeger2,
            certificate: defaultCertificate,
            sendTo: kostentraeger2
        })
    })

    it("finds papierannahmestelle", () => {
        const kasse = { 
            ...base, 
            papierannahmestelleLinks: [{
                ik: "00000001",
                paperTypes: PaperDataType.MachineReadableReceipt | PaperDataType.Prescription
            }],
            ik: "00000001"
        } as Institution
        const institutionList = [institutionListOf([kasse])]

        expect(findForPaper(institutionList, "00000001", { paperDataType: PaperDataType.Receipt })).toEqual(undefined)
        expect(findForPaper(institutionList, "00000001", { paperDataType: PaperDataType.CostEstimate })).toEqual(undefined)

        expect(findForPaper(institutionList, "00000001", { paperDataType: PaperDataType.MachineReadableReceipt })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kasse,
            sendTo: kasse 
        })
        expect(findForPaper(institutionList, "00000001", { paperDataType: PaperDataType.Prescription })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kasse,
            sendTo: kasse 
        })

        const kasse2 = { 
            ...base, 
            papierannahmestelleLinks: [{
                ik: "00000001",
                paperTypes: PaperDataType.Receipt | PaperDataType.CostEstimate
            }],
            ik: "00000001"
        } as Institution

        const institutionList2 = [institutionListOf([kasse2])]

        expect(findForPaper(institutionList2, "00000001", { paperDataType: PaperDataType.MachineReadableReceipt })).toEqual(undefined)
        expect(findForPaper(institutionList2, "00000001", { paperDataType: PaperDataType.Prescription })).toEqual(undefined)

        expect(findForPaper(institutionList2, "00000001", { paperDataType: PaperDataType.Receipt })).toEqual({
            pflegekasse: kasse2,
            kostentraeger: kasse2,
            sendTo: kasse2 
        })
        expect(findForPaper(institutionList2, "00000001", { paperDataType: PaperDataType.CostEstimate })).toEqual({
            pflegekasse: kasse2,
            kostentraeger: kasse2,
            sendTo: kasse2 
        })
    })

    it("excludes results for datenannahmestelle without certificate", () => {
        const kasse = { 
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000001"),
            ik: "00000001",
            certificates: []
        } as Institution

        expect(findForData([institutionListOf([kasse])], "00000001")).toBeUndefined()
    })

    it("excludes results for datenannahmestelle with expired certificate", () => {
        const expiredCertificate: Certificate = parseCertificate(certificatePEM)
        expiredCertificate.tbsCertificate.validity.notBefore = new Time(new Date("2010-01-01"))
        expiredCertificate.tbsCertificate.validity.notAfter = new Time(new Date("2012-01-01"))

        const kasse = { 
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000001"),
            certificates: [expiredCertificate],
            ik: "00000001"
        } as Institution

        expect(findForData([institutionListOf([kasse])], "00000001", {
            date: new Date("2012-01-02"),
        })).toBeUndefined()
    })

    it("finds kostentraeger and uses the newer certificate for result if there are several", () => {
        const oldCertificate: Certificate = parseCertificate(certificatePEM)
        oldCertificate.tbsCertificate.validity.notBefore = new Time(new Date("2010-01-01"))
        oldCertificate.tbsCertificate.validity.notAfter = new Time(new Date("2020-01-01"))
        
        const newCertificate: Certificate = parseCertificate(certificatePEM)
        newCertificate.tbsCertificate.validity.notBefore = new Time(new Date("2010-01-01"))
        newCertificate.tbsCertificate.validity.notAfter = new Time(new Date("2022-01-01"))

        const kasse = { 
            ...base, 
            ...acceptsData,
            ...linksPapierAndDatenannahmeTo("00000001"),
            certificates: [oldCertificate, newCertificate],
            ik: "00000001"
        } as Institution

        expect(findForData([institutionListOf([kasse])], "00000001", {
            date: new Date("2011-01-01"),
        })).toEqual({
            pflegekasse: kasse,
            kostentraeger: kasse,
            encryptTo: kasse,
            certificate: newCertificate,
            sendTo: kasse 
        })
    })
})

const parseCertificate = (certPEM: string): Certificate =>
    AsnParser.parse(base64ToArrayBuffer(certPEM), Certificate)

const certificatePEM = `MIIDTjCCAjagAwIBAgIDAnxUMA0GCSqGSIb3DQEBCwUAMEkxCzAJBgNVBAYTAkRF
MTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29uc3RpZ2UgTGVpc3R1
bmdzZXJicmluZ2VyMB4XDTIwMTEyNDAwMDAwMFoXDTIzMDEwODIzNTk1OVowgYkx
CzAJBgNVBAYTAkRFMTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29u
c3RpZ2UgTGVpc3R1bmdzZXJicmluZ2VyMQ0wCwYDVQQLEwR2ZGVrMRQwEgYDVQQL
EwtJSzEwOTk3OTk3ODEZMBcGA1UEAxMQRHIuIEhlaWtvIFN0YW1lcjCCASIwDQYJ
KoZIhvcNAQEBBQADggEPADCCAQoCggEBAIAI9oynbhMHVe16zbUXGfdtNfC7a8WJ
60nLaOXWnSvzCU81/gTz59jhi5i3y8lxR63hVeJuHl5/fY4z28tlMDQwX/V5z4iZ
y8m75bo/SWu5kjmSETW0a0St5bq56kPTOJhxPvONF5nQfGuZGPw3Y6jsu2osCIVB
ZQYWGihfL1hadbNQaalO0ZKYRu6FlUA6GfHtmzLnnQLVuAAUA6LMnaj0s9oBgwUQ
oLuPrqe9pFdBKl+iEyg0/FC2fY7jy+dAgXsGQMDtY5sk0l0b7t7NFOzOwwPaeZrk
u6oRKV9VSILMgSIHy7gLcBa8n4fuYM+4Bzf9oItMQQr+VuMjxe+UAWMCAwEAATAN
BgkqhkiG9w0BAQsFAAOCAQEAOz8znqhmVw7g6RsENcOqu7UtjbdEitRd9aAW4hiz
WJbbPv1rCU6+cFA8vCiQYdZagl8xrZrYyCpx+JUqQFkDUuq2kdQRgeAnQTggNV+K
Xs702G+AMB3GmulPdlIPTN7YXQXoCiIJgsxn/CKveQYyYXuMdRJw/9GJJR9FatkJ
xkG7EX7PaWOpimA/+U40PRyJ4etxclFNVuBbefQ/cWCHQhupY7hewdaK2yIXyXvd
xAITd32OHKn7H/rEl220hwCPuGFUUvvoEtXn2i77dequl7BG3ceikkmjsdueqUxv
3Ggt+TSxF2vu3ZXzDT1AjV7TFTLX7ClDQMXdUIn/nBF14g==`

const defaultIK: string = "00000000"
const defaultCertificate = parseCertificate(certificatePEM)

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
        paperTypes: PaperDataType.CostEstimate | PaperDataType.MachineReadableReceipt | PaperDataType.Prescription | PaperDataType.Receipt
    }]
})

const usesDefaultCertificate = {
    certificates: [defaultCertificate]
}

const acceptsData = {
    ...usesDefaultCertificate,
    transmissionEmail: "default@default.de"
}

const simple = { ...base, ...acceptsData, ...linksPapierAndDatenannahmeTo(defaultIK) } as Institution

type OptFindParams = {
    paperDataType?: PaperDataType
    leistungsart?: Leistungsart,
    location?: CareProviderLocationSchluessel,
    date?: Date
}

function findForPaper(
    institutionLists: InstitutionList[],
    pflegekasseIK: string,
    {
        paperDataType = 0,
        leistungsart = { sgbxiLeistungsart: "01" },
        location = "HH",
        date = new Date()
    }: OptFindParams = {}
): KostentraegerForPaperFindResult | undefined {
    return new InstitutionListsIndex(institutionLists).findForPaper(
        paperDataType, pflegekasseIK, leistungsart, location, date
    )
}

function findForData(
    institutionLists: InstitutionList[],
    pflegekasseIK: string,
    {
        leistungsart = { sgbxiLeistungsart: "01" },
        location = "HH",
        date = new Date()
    }: OptFindParams = {}
): KostentraegerForDataFindResult | undefined {
    return new InstitutionListsIndex(institutionLists).findForData(
        pflegekasseIK, leistungsart, location, date
    )
}