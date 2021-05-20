import parse from "../../../src/kostentraeger/filename/parser"
import MockDate from 'mockdate'

describe("filename parser", () => {

    it("parses filename", () => {
    
        expect(parse("AO06Q221.ke1")).toEqual({
            kassenart: "AO",
            verfahren: "06",
            validityStartDate: new Date(2021, 3),
            version: 1
        })
    })

    it("parses validity start date", () => {
        MockDate.set('2020-01-01')

        // with month as number
        expect(parseDate("0101")).toEqual(new Date(2001, 0))
        expect(parseDate("1201")).toEqual(new Date(2001, 11))

        // with month as quarter
        expect(parseDate("Q101")).toEqual(new Date(2001, 0))
        expect(parseDate("Q201")).toEqual(new Date(2001, 3))
        expect(parseDate("Q301")).toEqual(new Date(2001, 6))
        expect(parseDate("Q401")).toEqual(new Date(2001, 9))
    })

    it("parses validity start date for next century", () => {
        MockDate.set('2099-01-01')
        expect(parseDate("0101")).toEqual(new Date(2101, 0))
    })

    it("parses validity start date for last century", () => {
        MockDate.set('2101-01-01')
        expect(parseDate("0199")).toEqual(new Date(2099, 0))
    })

    it("parsing file name in invalid format results in error", () => {
        expect(() => parse("readme.md")).toThrow()
        expect(() => parse("AO06Q221.Xe1")).toThrow()
        expect(() => parse("AO06Q221.kX1")).toThrow()
        expect(() => parse("XX06Q221.ke1")).toThrow()
        expect(() => parse("AOXXQ221.ke1")).toThrow()
        expect(() => parse("AO06XX21.ke1")).toThrow()
        expect(() => parse("AO06Q221.kex")).toThrow()
    })

    afterEach(() => {
        // reset mockings
        MockDate.reset()
    })
})

const parseDate = (str: string): Date => parse(`AO06${str}.ke0`).validityStartDate
