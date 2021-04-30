import { KOTRInterchange } from "../../src/kostentraeger/edifact/segments"
import transform from "../../src/kostentraeger/transformer"
import { InstitutionList } from "../../src/kostentraeger/types"


describe("kostentraeger transformer", () => {

    it("transform one message", () => {
        const interchange: KOTRInterchange = {
            spitzenverbandIK: "123456789",
            filename: {
                kassenart: "AO",
                verfahren: "06",
                validityStartDate: new Date("1999-05-05"),
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
                    validityFrom: new Date("2020-20-20"),
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
                    {   // Kostenträger & Datenannahmestelle
                        ikVerknuepfungsartSchluessel: "01",
                        verknuepfungspartnerIK: "555444333",
                        leistungserbringergruppeSchluessel: "6",
                        datenlieferungsartSchluessel: "07",
                        standortLeistungserbringerBundeslandSchluessel: "02",
                        pflegeLeistungsartSchluessel: "00"
                    },
                    {   // Machinenlesbare Belege Annahmestelle
                        ikVerknuepfungsartSchluessel: "03",
                        verknuepfungspartnerIK: "334455667",
                        leistungserbringergruppeSchluessel: "5",
                        datenlieferungsartSchluessel: "07",
                        standortLeistungserbringerKVBezirkSchluessel: "37",
                        abrechnungscodeSchluessel: "25",
                        tarifkennzeichen: "12345"
                    },
                    {   // Papierannahmestelle
                        ikVerknuepfungsartSchluessel: "09",
                        verknuepfungspartnerIK: "112233445",
                        leistungserbringergruppeSchluessel: "6",
                        datenlieferungsartSchluessel: "29",
                        pflegeLeistungsartSchluessel: "00"
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
            spitzenverbandIK: "123456789",
            leistungserbringerGruppeSchluessel: "6",
            institutions: [{
                ik: "999999999",
                abbreviatedName: "short name",
                name: "very long name",
                validityFrom: new Date("2020-20-20"),
                validityTo: new Date("2088-10-10"),
                vertragskassennummer: 12345,
                bankAccountDetails: {
                    bankName: "Sparbank",
                    accountOwner: "short name",
                    iban: "ibanibaniban",
                    bic: "bicbicbic"
                },
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
                transmissionMethods: {
                    paperReceipt: false,
                    machineReadablePaperReceipt: true,
                    email: "ok@go.de",
                    ftam: "ftam.blub-it.de:5000",
                    zeichensatzSchluessel: "I8"
                },
                links: [
                    {
                        ikVerknuepfungsartSchluessel: "01",
                        verknuepfungspartnerIK: "555444333",
                        leistungserbringergruppeSchluessel: "6",
                        datenlieferungsartSchluessel: "07",
                        standortLeistungserbringerBundeslandSchluessel: "02",
                        pflegeLeistungsartSchluessel: "00"
                    },
                    {
                        ikVerknuepfungsartSchluessel: "03",
                        verknuepfungspartnerIK: "334455667",
                        leistungserbringergruppeSchluessel: "5",
                        datenlieferungsartSchluessel: "07",
                        standortLeistungserbringerKVBezirkSchluessel: "37",
                        abrechnungscodeSchluessel: "25",
                        tarifkennzeichen: "12345"
                    },
                    {
                        ikVerknuepfungsartSchluessel: "09",
                        verknuepfungspartnerIK: "112233445",
                        leistungserbringergruppeSchluessel: "6",
                        datenlieferungsartSchluessel: "29",
                        pflegeLeistungsartSchluessel: "00"
                    }
                ]
            }],
        }

        /* need to compare the stringified and then parsed result because Javascript Date objects 
           are compared using identity, not equality :-( */
        const actual = JSON.parse(JSON.stringify(transform(interchange).institutionList))
        const expected = JSON.parse(JSON.stringify(expectedInstitutionList))

        expect(actual).toEqual(expected)
    })
})