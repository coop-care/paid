import tokenize from "../../../src/edifact/tokenizer"
import parseKostentraeger from "../../../src/kostentraeger/edifact/parser"

import { KOTRInterchange, KOTRMessage } from "../../../src/kostentraeger/edifact/segments"

describe("kostentraeger edifact parser", () => {

    it("parses interchange with only the header", () => {
        expect(parse(
            "UNB+UNOC:3+109910000+999999999+20210401:1510+00178++AO06Q221ke1'"+
            "UNZ+000188+00178'"
        )).toEqual({
            issuerIK: "109910000",
            institutions: [],
            filename: {
                kassenart: "AO",
                verfahren: "06",
                validityStartDate: new Date(2021,4-1),
                version: 1
            }
        })
    })

    it("non-KOTR message is skipped", () => {
        expect(parse(
            unb+
            "UNH+00001+ROFL:01'"+
            "UNT+00002+00001'"+
            unz
        ).institutions).toHaveLength(0)
    })

    it("KOTR message of version higher than 2 is skipped", () => {
        expect(parseMessages(
            "UNH+00001+KOTR:03'"+
            idk+vdt+fkt+nam+ans+ // but otherwise it's ok
            "UNT+00002+00001'"
        )).toHaveLength(0)
    })

    it("missing mandatory segments skips message", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam    ))).toHaveLength(0)
        expect(parseMessages(msg(idk+vdt+fkt+    ans))).toHaveLength(0)
        expect(parseMessages(msg(idk+vdt+    nam+ans))).toHaveLength(0)
        expect(parseMessages(msg(idk+    fkt+nam+ans))).toHaveLength(0)
        expect(parseMessages(msg(    vdt+fkt+nam+ans))).toHaveLength(0)
    })

    it("parses a minimal message", () => {
        expect(parseMessages(msg(
            "IDK+100295017+99+gkv informatik'"+
            "VDT+20040920'"+
            "FKT+02'"+
            "NAM+01+gkv informatik+Fachbereich Inputmanagement'"+
            "ANS+1+42285+Wuppertal+Lichtscheiderstraße 89'"
        ))).toEqual([{
            id: 1,
            idk: {
                ik: "100295017",
                institutionsart: "99",
                abbreviatedName: "gkv informatik",
                vertragskassennummer: undefined
            },
            vdt: {
                validityFrom: new Date(Date.UTC(2004, 9-1, 20))
            },
            fkt: {
                verarbeitungskennzeichenSchluessel: "02"
            },
            nam: {
                index: 1,
                names: ["gkv informatik", "Fachbereich Inputmanagement"]
            },
            kto: undefined,
            ansList: [{
                anschriftartSchluessel: "1",
                postcode: 42285,
                place: "Wuppertal",
                address: "Lichtscheiderstraße 89"
            }],
            aspList: [],
            dfuList: [],
            uemList: [],
            vkgList: []
        }])
    })

    it("parses several mesages", () => {
        // just testing that it can parse several, not the content
        expect(parseMessages(
            msg(idk+vdt+fkt+nam+ans)+
            msg(idk+vdt+fkt+nam+ans)
        ).length).toEqual(2)
    })

    it("parses validity from-to", () => {
        expect(parseMessages(msg(
            idk+
            "VDT+20040920+20140712'"+
            fkt+nam+ans
        ))[0].vdt).toEqual({
            validityFrom: new Date(Date.UTC(2004, 9-1, 20)),
            validityTo: new Date(Date.UTC(2014, 7-1, 12)),
        })
    })

    it("parsing unknown VerarbeitungskennzeichenSchluessel skips message", () => {
        expect(parseMessages(msg(
            idk+vdt+
            "FKT+09'"+
            nam+ans
        ))).toHaveLength(0)
    })

    it("parses all the name elements", () => {
        expect(parseMessages(msg(
            idk+vdt+fkt+
            "NAM+01+This text+is very+long+etc'"+
            ans
        ))[0].nam.names).toEqual(["This text","is very","long","etc"])
    })

    it("parsing unknown AnschriftartSchluessel skips message", () => {
        expect(parseMessages(msg(
            idk+vdt+fkt+nam+
            "ANS+9+42285+Wuppertal+Lichtscheiderstraße 89'"
        ))).toHaveLength(0)
    })

    it("parses all three possible address types", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+
            "ANS+1+12345+Wuppertal+Lichtscheiderstraße 89'"+
            "ANS+2+67891+Wappertal+123456'"+
            "ANS+3+34567+Wippertal'"
        ))[0].ansList).toEqual([{
            anschriftartSchluessel: "1",
            postcode: 12345,
            place: "Wuppertal",
            address: "Lichtscheiderstraße 89"
        }, {
            anschriftartSchluessel: "2",
            postcode: 67891,
            place: "Wappertal",
            address: "123456"
        }, {
            anschriftartSchluessel: "3",
            postcode: 34567,
            place: "Wippertal"
        }])
    })

    it("parses international bank account information", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "KTO+++Super Bank+GKV XYZ+ibanibaniban+bicbicbic'"
        ))[0].kto).toEqual({
            bankName: "Super Bank",
            accountOwner: "GKV XYZ",
            accountNumber: undefined,
            bankCode: undefined,
            iban: "ibanibaniban",
            bic: "bicbicbic"
        })
    })

    it("parses national bank account information", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "KTO+123456+001001001+Super Bank'"
        ))[0].kto).toEqual({
            bankName: "Super Bank",
            accountOwner: undefined,
            accountNumber: "123456",
            bankCode: "001001001",
            iban: undefined,
            bic: undefined
        })
    })

    it("parsing incomplete bank account information skips message", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "KTO+123456++Super Bank'"
        ))).toHaveLength(0)
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "KTO++123456+Super Bank'"
        ))).toHaveLength(0)

        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "KTO+++Super Bank+ibanibaniban'"
        ))).toHaveLength(0)
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "KTO+++Super Bank++bicbicbic'"
        ))).toHaveLength(0)
    })

    it("parsing several links to kostentraeger skips message", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "VKG+01+180202549+6'"+
            "VKG+01+150202549+6'"
        ))).toHaveLength(0)
    })

    it("parse contact persons", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "ASP+01+5050/123456798++Mann Musterfrau'"+
            "ASP+02++5050-1111111111++Datenaustausch'"
        ))[0].aspList).toEqual([
            {
                index: 1,
                phone: "5050/123456798",
                fax: undefined,
                name: "Mann Musterfrau",
                fieldOfWork: undefined
            }, {
                index: 2,
                phone: undefined,
                fax: "5050-1111111111",
                name: undefined,
                fieldOfWork: "Datenaustausch"
            }
        ])
    })

    it("parsing transmission details with unknown keys skips that segment", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "DFU+01+123+++++ftam.arge.aok.de?:5000'"
        ))[0].dfuList).toHaveLength(0)
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "DFU+01+016++++5+ftam.arge.aok.de?:5000'"
        ))[0].dfuList).toHaveLength(0)
    })


    it("parse transmission details", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "DFU+01+016+++++ftam.arge.aok.de?:5000'"+
            "DFU+02+070++0000+2400+1+da@dta.aok.de'"
        ))[0].dfuList).toEqual([
            {
                index: 1,
                dfuProtokollSchluessel: "016",
                benutzerkennung: undefined,
                allowedTransmissionTimeStart: undefined,
                allowedTransmissionTimeEnd: undefined,
                address: "ftam.arge.aok.de:5000"
            }, {
                index: 2,
                dfuProtokollSchluessel: "070",
                benutzerkennung: undefined,
                allowedTransmissionTimeStart: "0000",
                allowedTransmissionTimeEnd: "2400",
                allowedTransmissionDays: "1",
                address: "da@dta.aok.de"
            }
        ])
    })

    it("parse transmission mediums", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "UEM+1+00+I8'"+
            "UEM+3+05+I7'"+
            "UEM+7+00+I1'"+
            "DFU+01+016+++++ftam.arge.aok.de?:5000'" // required as per doc
        ))[0].uemList).toEqual([
            {
                uebermittlungsmediumSchluessel: "1",
                uebermittlungsmediumParameterSchluessel: "00", 
                uebermittlungszeichensatzSchluessel: "I8"
            },
            {
                uebermittlungsmediumSchluessel: "3",
                uebermittlungsmediumParameterSchluessel: "05", 
                uebermittlungszeichensatzSchluessel: "I7"
            },
            {
                uebermittlungsmediumSchluessel: "7",
                uebermittlungsmediumParameterSchluessel: "00", 
                uebermittlungszeichensatzSchluessel: "I1"
            }
        ])
    })

    it("parsing transmission mediums with invalid keys skips that segment", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "UEM+0+00+I8'"
        ))[0].uemList).toHaveLength(0)

        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "UEM+1+55+I8'"
            ))[0].uemList).toHaveLength(0)

        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "UEM+1+00+XX'"
            ))[0].uemList).toHaveLength(0)

        // valid, but a DFU is missing
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "UEM+1+00+I8'"
            ))[0].uemList).toHaveLength(0)
    })

    it("parse links", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "VKG+01+100295017+6+888888888+07+7+01++02'"+
            "VKG+00+100295017+5++21+1++13+40+12345'"+
            "VKG+09+100295017'"
        ))[0].vkgList).toEqual([
            {
                ikVerknuepfungsartSchluessel: "01",
                verknuepfungspartnerIK: "100295017",
                leistungserbringergruppeSchluessel: "6",
                abrechnungsstelleIK: "888888888",
                datenlieferungsartSchluessel: "07",
                uebermittlungsmediumSchluessel: "7",
                standortLeistungserbringerBundeslandSchluessel: "01",
                standortLeistungserbringerKVBezirkSchluessel: undefined,
                sgbxiLeistungsartSchluessel: "02",
                sgbvAbrechnungscodeSchluessel: undefined,
                tarifkennzeichen: undefined
            }, {
                ikVerknuepfungsartSchluessel: "00",
                verknuepfungspartnerIK: "100295017",
                leistungserbringergruppeSchluessel: "5",
                abrechnungsstelleIK: undefined,
                datenlieferungsartSchluessel: "21",
                uebermittlungsmediumSchluessel: "1",
                standortLeistungserbringerBundeslandSchluessel: undefined,
                standortLeistungserbringerKVBezirkSchluessel: "13",
                sgbxiLeistungsartSchluessel: undefined,
                sgbvAbrechnungscodeSchluessel: "40",
                tarifkennzeichen: "12345"
            }, {
                ikVerknuepfungsartSchluessel: "09",
                verknuepfungspartnerIK: "100295017",
                leistungserbringergruppeSchluessel: undefined,
                abrechnungsstelleIK: undefined,
                datenlieferungsartSchluessel: undefined,
                uebermittlungsmediumSchluessel: undefined,
                standortLeistungserbringerBundeslandSchluessel: undefined,
                standortLeistungserbringerKVBezirkSchluessel: undefined,
                sgbxiLeistungsartSchluessel: undefined,
                sgbvAbrechnungscodeSchluessel: undefined,
                tarifkennzeichen: undefined
            }
        ])
    })

    it("parsing links with invalid keys skips these segments", () => {
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "VKG+50+000000000'"
        ))[0].vkgList).toHaveLength(0)

        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "VKG+02+000000000+++21'"
            ))[0].vkgList).toHaveLength(0)
        
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "VKG+09+000000000+9'"
        ))[0].vkgList).toHaveLength(0)
        
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "VKG+09+000000000+++50'"
        ))[0].vkgList).toHaveLength(0)
        
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "VKG+09+000000000++++0'"
        ))[0].vkgList).toHaveLength(0)
        
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "VKG+09+000000000+++++50'"
        ))[0].vkgList).toHaveLength(0)
        
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "VKG+09+000000000++++++04'"
        ))[0].vkgList).toHaveLength(0)
        
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "VKG+09+000000000+6++++++50'"
        ))[0].vkgList).toHaveLength(0)
        
        expect(parseMessages(msg(idk+vdt+fkt+nam+ans+
            "VKG+09+000000000+5++++++98'"
        ))[0].vkgList).toHaveLength(0)
    })
})

/* just some constants with some data, when the precise data doesn't matter for the test */
const unb = "UNB+UNOC:3+999999999+999999999+20210401:1510+00001++AO06Q221ke1'"
const unz = "UNZ+000188+00178'"
const idk = "IDK+100295017+99+gkv informatik'"
const vdt = "VDT+20040920'"
const fkt = "FKT+02'"
const nam = "NAM+01+gkv informatik+Fachbereich Inputmanagement'"
const ans = "ANS+1+42285+Wuppertal+Lichtscheiderstraße 89'"

const msg = (str: string, i: number = 1): string => `UNH+${i}+KOTR:01'${str}UNT+000007+${i}'`

const parse = (str: string): KOTRInterchange => parseKostentraeger(tokenize(str)).interchange

const parseMessages = (str: string): KOTRMessage[] => parse(unb+str+unz).institutions