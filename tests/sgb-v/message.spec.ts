import { segment } from "../../src/edifact/builder"
import { makeSLGAMessage, makeSLGA_SammelrechnungMessage } from "../../src/sgb-v/message"
import { BaseAbrechnungsfall } from "../../src/sgb-v/types"
import { sum } from "../../src/utils"

describe("SGB V messages", () => {

    it("constructs correct SLGA message", () => {
        expect(makeSLGAMessage<TestAbrechnungsfall>({
            sammelRechnungsnummer: "555",
            einzelRechnungsnummer: "3",
            rechnungsdatum: new Date("2021-12-12"),
            rechnungsart: "1",
            pflegekasseIK: "123456789",
            kostentraegerIK: "000000002",
            senderIK: "000000005",
            leistungsbereich: "C",
            leistungserbringer: {
                name: "LE",
                ik: "000000001",
                ansprechpartner: [
                    { name: "wursti plutz", phone: "123465" },
                    { name: "wursti plutz2", phone: "000011" },
                    { name: "wursti plutz3", phone: "445667" },
                    { name: "wursti plutz4", phone: "778466" }, // this is cut off
                ],
                email: "hallo@wallo.de",
                abrechnungscode: "16",
                location: "HH",
                tarifbereich: "24",
                sondertarifJeKostentraegerIK: {"000000003": "XXX"},
                umsatzsteuer: {
                    identifikationsnummer: "111222333",
                    befreiung: "01"
                }
            },
            rechnungssteller: {
                name: "RS",
                ik: "000000002",
                ansprechpartner: []
            },
            skontos: [
                { skontoPercent: 12.311, zahlungsziel: 3 },
                { skontoPercent: 18.028, zahlungsziel: 1 }
            ]
        }, [{
            versicherter: {
                pflegekasseIK: "000000004",
                kostentraegerIK: "999999999",
                versichertennummer: "versicherter",
                versichertenstatus: "30000123456",
                firstName: "Arthur",
                lastName: "Dent",
                birthday: new Date("1970-01-23")
            },
            belegnummer: "belegnum",
            bruttobetrag: 100.00,
            zuzahlungUndEigenanteilBetrag: 20.0
        }, {
            versicherter: {
                pflegekasseIK: "000000004",
                kostentraegerIK: "999999999",
                versichertennummer: "versicherter",
                versichertenstatus: "50000123456",
                firstName: "Zaphod",
                lastName: "Beeblebrox",
                birthday: new Date("1337-01-23")
            },
            belegnummer: "belegnum",
            bruttobetrag: 55.00,
            zuzahlungUndEigenanteilBetrag: 12.0
        }], calculateGesamtsummen)).toEqual({
            header: [["SLGA", "16", "0", "0"]],
            segments: [
                segment("FKT", "01", undefined, "000000001", "000000002", "123456789", "000000005"),
                segment("REC", ["555", "3"], "20211212", "1"),
                segment("UST", "111222333", "J"),
                segment("SKO", "12,31", "3"),
                segment("SKO", "18,03", "1"),
                segment("GES", "00", "123,00", "155,00", "32,00"),
                segment("GES", "31", "80,00", "100,00", "20,00"),
                segment("GES", "51", "43,00", "55,00", "12,00"),
                segment("NAM", "LE", "wursti plutz, 123465", "wursti plutz2, 000011", "wursti plutz3, 445667", "hallo@wallo.de")
            ]
        })
    })

    it("constructs correct SLGA Sammmelrechnung message", () => {
        // just going the lazy / easy route here: a Sammelrechnung with zero rechnungen
        // This is not really allowed, but the logic in these places is similar to non-
        // Sammelrechnungen so no need to test that twice
        expect(makeSLGA_SammelrechnungMessage({
            sammelRechnungsnummer: "555",
            rechnungsdatum: new Date("2021-12-12"),
            rechnungsart: "1",
            kostentraegerIK: "000000002",
            senderIK: "000000005",
            rechnungssteller: {
                name: "RS",
                ik: "000000009",
                ansprechpartner: [],
                email: "cheers@brobo.de"
            }
        }, [], calculateGesamtsummen)).toEqual({
            header: [["SLGA", "16", "0", "0"]],
            segments: [
                segment("FKT", "01", "J", "000000009", "000000002", undefined, "000000005"),
                segment("REC", ["555", "0"], "20211212", "1"),
                // no skontos => no SKO segments
                // no rechnungen => no GES segments
                segment("NAM", "RS", undefined, undefined, undefined, "cheers@brobo.de")
            ]
        })
    })
})

type TestAbrechnungsfall = BaseAbrechnungsfall & {
    bruttobetrag: number,
    zuzahlungUndEigenanteilBetrag: number
}

const calculateGesamtsummen = (abrechnungsfaelle: TestAbrechnungsfall[]) => ({
    gesamtbruttobetrag: sum(abrechnungsfaelle.map(fall => fall.bruttobetrag)),
    zuzahlungUndEigenanteilBetrag: sum(abrechnungsfaelle.map(fall => fall.zuzahlungUndEigenanteilBetrag))
})
