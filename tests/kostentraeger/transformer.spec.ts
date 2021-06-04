import { KOTRInterchange } from "../../src/kostentraeger/edifact/segments"
import transform from "../../src/kostentraeger/transformer"
import { InstitutionList, PaperDataType } from "../../src/kostentraeger/types"


describe("kostentraeger transformer", () => {

    it("transform one message", () => {
        const interchange: KOTRInterchange = {
            issuerIK: "123456789",
            filename: {
                kassenart: "AO",
                verfahren: "06",
                validityStartDate: new Date("2018-05-05"),
                version: 1
            },
            institutions: [{
                id: 1, 
                idk: {
                    ik: "999999999",
                    institutionsart: "99",
                    abbreviatedName: "short name",
                    vertragskassennummer: 12345
                },
                vdt: {
                    validityFrom: new Date("2010-20-20"),
                    validityTo: new Date("2088-10-10")
                },
                fkt: {
                    verarbeitungskennzeichenSchluessel: "01"
                },
                nam: {
                    index: 1,
                    names: ["very","long","name"]
                },
                kto: {
                    bankName: "Sparbank",
                    iban: "ibanibaniban",
                    bic: "bicbicbic"
                },
                vkgList: [
                    {   // Kostenträger
                        ikVerknuepfungsartSchluessel: "01",
                        verknuepfungspartnerIK: "999999999",
                        leistungserbringergruppeSchluessel: "6",
                        standortLeistungserbringerBundeslandSchluessel: "02",
                    },
                    {   // Datenannahmestelle ohne Entschlüsselungsbefugnis
                        ikVerknuepfungsartSchluessel: "02",
                        verknuepfungspartnerIK: "999999999",
                        leistungserbringergruppeSchluessel: "6",
                        datenlieferungsartSchluessel: "07",
                        standortLeistungserbringerBundeslandSchluessel: "01",
                        sgbxiLeistungsartSchluessel: "12"
                    },
                    {   // Datenannahmestelle mit Entschlüsselungsbefugnis
                        ikVerknuepfungsartSchluessel: "03",
                        verknuepfungspartnerIK: "999999999",
                        datenlieferungsartSchluessel: "07",
                        standortLeistungserbringerBundeslandSchluessel: "99"
                    },
                    {   // Machinenlesbare Belege Annahmestelle
                        ikVerknuepfungsartSchluessel: "09",
                        verknuepfungspartnerIK: "999999999",
                        leistungserbringergruppeSchluessel: "5",
                        datenlieferungsartSchluessel: "29",
                        standortLeistungserbringerKVBezirkSchluessel: "38",
                        sgbvAbrechnungscodeSchluessel: "25"
                    },
                    {   // Papierannahmestelle
                        ikVerknuepfungsartSchluessel: "09",
                        verknuepfungspartnerIK: "999999999",
                        leistungserbringergruppeSchluessel: "6",
                        datenlieferungsartSchluessel: "21"
                    },
                ],
                ansList: [
                    {
                        anschriftartSchluessel: "1",
                        postcode: 12345,
                        place: "Humburg",
                        address: "Straßenallee 33"
                    }, 
                    {
                        anschriftartSchluessel: "2",
                        postcode: 12345,
                        place: "Humburg",
                        address: "123"
                    }, 
                    {
                        anschriftartSchluessel: "3",
                        postcode: 12345,
                        place: "Humburg"
                    },
                ],
                aspList: [
                    {
                        index: 1,
                        phone: "123456789/88",
                        fax: "123456789/77",
                        name: "Max & Moritz",
                        fieldOfWork: "Schabernack"
                    }
                ],
                dfuList: [
                    {
                        index: 1,
                        dfuProtokollSchluessel: "016",
                        allowedTransmissionTimeStart: "0000",
                        allowedTransmissionTimeEnd: "2400",
                        allowedTransmissionDays: "1",
                        address: "ftam.blub-it.de:5000"
                    },
                    {
                        index: 2,
                        dfuProtokollSchluessel: "070",
                        allowedTransmissionTimeStart: "0000",
                        allowedTransmissionTimeEnd: "2400",
                        allowedTransmissionDays: "1",
                        address: "ok@go.de"
                    }
                ],
                uemList: [
                    {   // DFU
                        uebermittlungsmediumSchluessel: "1",
                        uebermittlungsmediumParameterSchluessel: "00",
                        uebermittlungszeichensatzSchluessel: "I8"
                    },
                    {   // CD-ROM - ignored
                        uebermittlungsmediumSchluessel: "7",
                        uebermittlungsmediumParameterSchluessel: "14",
                        uebermittlungszeichensatzSchluessel: "I8"
                    },
                    {   // "Machinenlesbarer Beleg"
                        uebermittlungsmediumSchluessel: "5",
                        uebermittlungsmediumParameterSchluessel: "00",
                        uebermittlungszeichensatzSchluessel: "I8"
                    },
                ]
            }]
        }

        const expectedInstitutionList: InstitutionList = {
            issuerIK: "123456789",
            leistungserbringerGruppeSchluessel: "6",
            kassenart: "AO",
            validityStartDate: new Date("2018-05-05"),
            institutions: [{
                ik: "999999999",
                abbreviatedName: "short name",
                name: "very long name",
                validityTo: new Date("2088-10-10"),
                vertragskassennummer: 12345,
                addresses: [
                    { postcode: 12345, place: "Humburg", streetAndHousenumber: "Straßenallee 33" },
                    { postcode: 12345, place: "Humburg", poBox: "123" },
                    { postcode: 12345, place: "Humburg" },
                ],
                contacts: [
                    {
                        phone: "123456789/88",
                        fax: "123456789/77",
                        name: "Max & Moritz",
                        fieldOfWork: "Schabernack"
                    }
                ],
                transmission: {
                    email: "ok@go.de",
                    zeichensatz: "I8"
                },
                kostentraegerLinks: [{
                    ik: "999999999",
                    location: "HH",
                    sgbxiLeistungsart: "00"
                }],
                datenannahmestelleLinks: [{
                    ik: "999999999"
                }],
                untrustedDatenannahmestelleLinks: [{
                    ik: "999999999",
                    location: "SH",
                    sgbxiLeistungsart: "12"
                }],
                papierannahmestelleLinks: [{
                    ik: "999999999",
                    location: "Nordrhein",
                    sgbvAbrechnungscode: "25",
                    paperTypes: PaperDataType.MachineReadableReceipt | PaperDataType.CostEstimate | PaperDataType.Prescription,
                }, {
                    ik: "999999999",
                    sgbxiLeistungsart: "00",
                    paperTypes: PaperDataType.Receipt,
                }]
            }],
        }

        const result = transform(interchange)
        // there should also not be any warnings parsing this
        expect(result.warnings).toEqual([])

        expect(json(result.institutionList)).toEqual(json(expectedInstitutionList))
    })
    
    it("skip message that is not valid anymore", () => {
        const interchange: KOTRInterchange = {
            issuerIK: "123456789",
            filename: {
                kassenart: "AO",
                verfahren: "06",
                validityStartDate: new Date("2010-01-01"),
                version: 1
            },
            institutions: [{
                id: 1, 
                idk: {
                    ik: "999999999",
                    institutionsart: "99",
                    abbreviatedName: "short name"
                },
                vdt: {
                    validityFrom: new Date("2000-10-20"),
                    validityTo: new Date("2009-12-31")          // <--- here
                },
                fkt: { verarbeitungskennzeichenSchluessel: "01" },
                nam: { index: 1, names: ["name"]},
                ansList: [],
                vkgList: [],
                aspList: [],
                dfuList: [],
                uemList: []
            }]
        }

        expect(transform(interchange).institutionList.institutions).toHaveLength(0)
    })

    it("skip message with verarbeitungskennzeichen 3", () => {
        const interchange: KOTRInterchange = {
            issuerIK: "123456789",
            filename: {
                kassenart: "AO",
                verfahren: "06",
                validityStartDate: new Date("2020-01-01"),
                version: 1
            },
            institutions: [{
                id: 1, 
                idk: {
                    ik: "999999999",
                    institutionsart: "99",
                    abbreviatedName: "short name"
                },
                vdt: { validityFrom: new Date("2000-20-20") },
                fkt: { verarbeitungskennzeichenSchluessel: "03" },   // <--- here
                nam: { index: 1, names: ["name"]},
                ansList: [],
                vkgList: [],
                aspList: [],
                dfuList: [],
                uemList: []
            }]
        }

        expect(transform(interchange).institutionList.institutions).toHaveLength(0)
    })

    it("skip message that had a parsing error", () => {
        const interchange: KOTRInterchange = {
            issuerIK: "123456789",
            filename: {
                kassenart: "AO",
                verfahren: "06",
                validityStartDate: new Date("2020-01-01"),
                version: 1
            },
            institutions: [{
                id: 1, 
                idk: {
                    ik: "999999999",
                    institutionsart: "15",                    // <--- here
                    abbreviatedName: "short name"
                },
                vdt: { validityFrom: new Date("2000-20-20") },
                fkt: { verarbeitungskennzeichenSchluessel: "01" },
                nam: { index: 1, names: ["name"]},
                ansList: [],
                vkgList: [],
                aspList: [],
                dfuList: [],
                uemList: []
            }]
        }

        expect(transform(interchange).institutionList.institutions).toHaveLength(0)
    })

    it("merge Papierannahmestellen-VKGs", () => {
        const interchange: KOTRInterchange = {
            issuerIK: "123456789",
            filename: {
                kassenart: "AO",
                verfahren: "06",
                validityStartDate: new Date("2020-01-01"),
                version: 1
            },
            institutions: [{
                id: 1, 
                idk: {
                    ik: "999999999",
                    institutionsart: "99",
                    abbreviatedName: "short name"
                },
                vdt: { validityFrom: new Date("2000-20-20") },
                fkt: { verarbeitungskennzeichenSchluessel: "01" },
                nam: { index: 1, names: ["name"]},
                ansList: [],
                vkgList: [{
                    ikVerknuepfungsartSchluessel: "09",
                    verknuepfungspartnerIK: "999999999",
                    datenlieferungsartSchluessel: "21"
                },{
                    ikVerknuepfungsartSchluessel: "09",
                    verknuepfungspartnerIK: "999999999",
                    datenlieferungsartSchluessel: "24"
                },{
                    ikVerknuepfungsartSchluessel: "09",
                    verknuepfungspartnerIK: "999999999",
                    datenlieferungsartSchluessel: "28"
                },],
                aspList: [],
                dfuList: [],
                uemList: []
            }]
        }

        const expectedInstitutionList = {
            issuerIK: "123456789",
            leistungserbringerGruppeSchluessel: "6",
            kassenart: "AO",
            validityStartDate: new Date("2020-01-01"),
            institutions: [{
                ik: "999999999",
                abbreviatedName: "short name",
                name: "name",
                addresses: [],
                papierannahmestelleLinks: [{
                    ik: "999999999",
                    paperTypes: PaperDataType.Receipt | PaperDataType.MachineReadableReceipt | PaperDataType.CostEstimate | PaperDataType.Prescription
                }]
            }],
        } as InstitutionList

        expect(json(transform(interchange).institutionList)).toEqual(json(expectedInstitutionList))
    })

    it("validate messages for dependence on FTAM", () => {
        const interchange: KOTRInterchange = {
            issuerIK: "123456789",
            filename: {
                kassenart: "AO",
                verfahren: "06",
                validityStartDate: new Date("2018-05-05"),
                version: 1
            },
            institutions: [
            // 1. The Kostenträger
            {
                id: 1, 
                idk: {
                    ik: "999999999",
                    institutionsart: "99",
                    abbreviatedName: "short name"
                },
                vdt: { validityFrom: new Date("2000-20-20") },
                fkt: { verarbeitungskennzeichenSchluessel: "01" },
                nam: { index: 1, names: ["name"]},
                ansList: [],
                aspList: [],
                dfuList: [],
                uemList: [],
                vkgList: [
                    {   // link to Datenannahmestelle mit Entschlüsselungsbefugnis
                        ikVerknuepfungsartSchluessel: "03",
                        verknuepfungspartnerIK: "999999991",
                        datenlieferungsartSchluessel: "07"
                    }
                ]
            },
            // 2. The Datenannahmestelle mit Entschlüsselungsbefugnis
            {
                id: 2, 
                idk: {
                    ik: "999999991",
                    institutionsart: "99",
                    abbreviatedName: "short name"
                },
                vdt: { validityFrom: new Date("2000-20-20") },
                fkt: { verarbeitungskennzeichenSchluessel: "01" },
                nam: { index: 1, names: ["name"]},
                ansList: [],
                aspList: [],
                uemList: [
                    {
                        uebermittlungsmediumSchluessel: "1",
                        uebermittlungsmediumParameterSchluessel: "00",
                        uebermittlungszeichensatzSchluessel: "I8"
                    }
                ],
                dfuList: [
                    {   // only accept FTAM :-(
                        index: 1,
                        dfuProtokollSchluessel: "016",
                        address: "ftam.blub-it.de:5000"
                    }
                ],
                vkgList: [
                    {   // link to Datenannahmestelle ohne Entschlüsselungsbefugnis
                        ikVerknuepfungsartSchluessel: "02",
                        verknuepfungspartnerIK: "999999992",
                        datenlieferungsartSchluessel: "07"
                    }
                ]
            },
            // 3. The Datenannahmestelle ohne Entschlüsselungsbefugnis
            {
                id: 3, 
                idk: {
                    ik: "999999992",
                    institutionsart: "99",
                    abbreviatedName: "short name"
                },
                vdt: { validityFrom: new Date("2000-20-20") },
                fkt: { verarbeitungskennzeichenSchluessel: "01" },
                nam: { index: 1, names: ["name"]},
                ansList: [],
                aspList: [],
                uemList: [
                    {
                        uebermittlungsmediumSchluessel: "1",
                        uebermittlungsmediumParameterSchluessel: "00",
                        uebermittlungszeichensatzSchluessel: "I8"
                    }
                ],
                dfuList: [
                    {   // only accept FTAM :-(
                        index: 1,
                        dfuProtokollSchluessel: "016",
                        address: "ftam.blub-it.de:5000"
                    }
                ],
                vkgList: []
            }]
        }

        const result = transform(interchange)
        // there should also not be any warnings parsing this
        expect(result.warnings).toHaveLength(1)
    })
})

/* need to compare the stringified and then parsed result because Javascript Date objects 
are compared using identity, not equality :-( */
function json(obj: object): object {
    return JSON.parse(JSON.stringify(obj))
}
