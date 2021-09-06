import { makeMessage } from "../../../src/sgb-v/haeuslich/message"
import { segment } from "../../../src/edifact/builder"
import { Kostenzusage, Verordnung } from "../../../src/sgb-v/types"
import { Abrechnungsposition } from "../../../src/sgb-v/haeuslich/types"

describe("Häusliche Krankenpflege message", () => {
    it("constructs correct message", () => {
        expect(makeMessage({
            rechnungsart: "1",
            kostentraegerIK: "000000003",
            pflegekasseIK: "000000004",
            senderIK: "000000005",
            leistungsbereich: "C",
            leistungserbringer: {
                name: "LE",
                ik: "000000001",
                ansprechpartner: [],
                abrechnungscode: "16",
                location: "HH",
                tarifbereich: "24",
                sondertarifJeKostentraegerIK: {"000000003": "XXX"},
                umsatzsteuerBefreiung: "01",
            },
            rechnungssteller: {
                name: "RS",
                ik: "000000002",
                ansprechpartner: []
            },
            sammelRechnungsnummer: "123",
            einzelRechnungsnummer: "321",
            rechnungsdatum: new Date("2021-12-12")
        }, [{
                versicherter: {
                    pflegekasseIK: "000000004",
                    kostentraegerIK: "999999999",
                    firstName: "Zaphod",
                    lastName: "Beeblebrox",
                    birthday: new Date("1337-01-23"),
                    address: {
                        street: "Very long street name that seemingly has no end",
                        houseNumber: "222",
                        postalCode: "555555511111",
                        city: "Very long city name that is very long",
                        countryCode: "HV"
                    }
                },
                belegnummer: "belegnumma",
                beleginformation: "0",
                besondereVersorgungsform: "1",
                einsaetze: [{
                    leistungsBeginn: new Date("2000-10-10 13:37:00"),
                    leistungsEnde: new Date("2000-10-10 13:37:01"),
                    abrechnungspositionen: [{
                        positionsnummer: {
                            gesetzlicheLebensgrundlage: "11",
                            versorgungsArt: "6",
                            verguetungsArt: "100"
                        },
                        einzelpositionen: [{
                            positionsnummer: {
                                gesetzlicheLebensgrundlage: "11",
                                versorgungsArt: "6",
                                verguetungsArt: "201"
                            },
                            anzahl: 2
                        },{
                            positionsnummer: {
                                gesetzlicheLebensgrundlage: "05",
                                versorgungsArt: "0",
                                verguetungsArt: "227"
                            },
                            anzahl: 5
                        }],
                        einzelpreis: 125.04, 
                        anzahl: 5.12,
                        gefahreneKilometer: 8,
                        text: "this is just a text, but it is quite long. So long indeed that it is cut off"
                    }, 
                    minAbrechnungsposition]
                }, // second Einsatz is earlier, to check if they are sorted by date ascending
                {
                    leistungsBeginn: new Date("1000-10-10 22:00:00"),
                    leistungsEnde: new Date("1000-10-11 02:00:00"),
                    abrechnungspositionen: [minAbrechnungsposition]
                }],
                verordnungen: [{
                    betriebsstaettennummer: "betrnummr",
                    vertragsarztnummer: "arztnr",
                    verordnungsDatum: new Date("5000-01-01"),
                    unfall: "1",
                    sonstigeEntschaedigung: "6",
                    verordnungsBesonderheiten: "4",
                    // both fields of diagnosen are actually optional
                    diagnosen: [{
                        diagnoseschluessel: "icd-10-code"
                    }, {
                        diagnosetext: "a diagnosetext that will definitely be cut off because it is just so long"
                    }],
                    kostenzusagen: [{
                        genehmigungsKennzeichen: "hurk durk",
                        genehmigungsDatum: new Date("1234-10-10"),
                        kostenzusageGenehmigung: "D1"
                    }, {
                        genehmigungsKennzeichen: "wacky ducky",
                        genehmigungsDatum: new Date("1834-08-10"),
                        kostenzusageGenehmigung: "M1"
                    }]
                },minVerordnung]
            }, {
                versicherter: {
                    pflegekasseIK: "000000004",
                    kostentraegerIK: "999999999",
                    versichertennummer: "versicherter",
                    versichertenstatus: "31000123456",
                    firstName: "Arthur",
                    lastName: "Dent",
                    birthday: new Date("1970-01-23")
                },
                belegnummer: "belegnum",
                einsaetze: [{
                    leistungsBeginn: new Date("1000-10-10 3:37:00"),
                    leistungsEnde: new Date("1000-10-10 13:37:01"),
                    abrechnungspositionen: [minAbrechnungsposition]
                }],
                verordnungen: [minVerordnung]
            }]
        )).toEqual({
            header: [["SLLA", "16", "0", "0"]],
            segments: [
                // general information
                segment("FKT", "01", undefined, "000000001", "000000003", "000000004", undefined),
                segment("REC", ["123", "321"], "20211212", "1"),

                // Abrechnungsfälle for Zaphod Beeblebrox 
                segment("INV", undefined, undefined, "0", "belegnumma", "1"),
                segment("NAD", "Beeblebrox", "Zaphod", "13370123", "Very long street name that 222", "5555555", "Very long city name that ", "HV"),
                
                // Einsatz 1 for Zaphod
                segment("ESK", "10001010", "2200", "0200", "240"),
                // Abrechnungsposition 1 in Einsatz 1
                minEHK,

                // Einsatz 2 for Zaphod
                segment("ESK", "20001010", "1337", "1337", "1"),
                // Abrechnungsposition 1 in Einsatz 2 (Pauschale)
                segment("EHK", ["16","24XXX"], "116100", "5,12", "125,04", "8"),
                segment("TXT", "this is just a text, but it is quite long. So long indeed that it is c"),
                // Einzelabrechnungspositionen for Abrechnungsposition 1 in Einsatz 2
                segment("ELP", "116201", "2,00"),
                segment("ELP", "050227", "5,00"),

                // Abrechnungsposition 2 in Einsatz 2
                minEHK,

                // Verordnung 1 for Zaphod
                segment("ZHK", "betrnummr", "arztnr", "50000101", "1", "6", "4"),
                segment("DIA", "icd-10-code", undefined),
                segment("DIA", undefined, "a diagnosetext that will definitely be cut off because it is just so l"),
                segment("SKZ", "hurk durk", "12341010", "D1"),
                segment("SKZ", "wacky ducky", "18340810", "M1"),

                // Verordnung 2 for Zaphod
                minZHK,
                minSKZ,

                // Betragssumme for Zaphod
                segment("BES", "642,20"),

                // Abrechnungsfälle for Arthur Dent
                segment("INV", "versicherter", "31000", undefined, "belegnum", undefined),
                segment("NAD", "Dent", "Arthur", "19700123", undefined, undefined, undefined, undefined),
                
                // Einsatz 1 for Arthur
                segment("ESK", "10001010", "0337", "1337", "601"),
                // Abrechnungsposition 1 in Einsatz 1
                minEHK,

                // Verordnung 1 for Arthur
                minZHK,
                minSKZ,

                // Betragssumme for Arthur
                segment("BES", "1,00"),
            ]
        })
    })
})

const minAbrechnungsposition: Abrechnungsposition = {
    positionsnummer: {
        gesetzlicheLebensgrundlage: "11",
        versorgungsArt: "6",
        verguetungsArt: "201"
    },
    einzelpreis: 1,
    anzahl: 1
}
const minEHK = segment("EHK", ["16","24XXX"], "116201", "1,00", "1,00", undefined)

const minKostenzusage: Kostenzusage = {
    genehmigungsKennzeichen: "kennz",
    genehmigungsDatum: new Date("2000-02-01"),
    kostenzusageGenehmigung: "D1"
}

const minSKZ = segment("SKZ", "kennz", "20000201", "D1")

const minVerordnung: Verordnung = {
    verordnungsDatum: new Date("2000-01-01"),
    diagnosen: [],
    // at least one kostenzusage is mandatory
    kostenzusagen: [minKostenzusage]
}

const minZHK = segment("ZHK", "999999999", "999999999", "20000101", undefined, undefined, undefined)

