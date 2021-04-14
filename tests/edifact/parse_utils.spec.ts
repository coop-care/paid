import { parseDate, parseDecimal, parseTimeOfDay } from "../../src/edifact/parse_utils"

describe("EDIFACT parsing utilities", () => {
    
    describe("parseDate", () => {
        
        it("parses date and time correctly", () => {
            expect(parseDate("20120806","1215")).toEqual(new Date("2012-08-06 12:15"))
        })

        it("parses date only correctly", () => {
            expect(parseDate("20120806")).toEqual(new Date("2012-08-06"))
        })
    })

    describe("parseDecimal", () => {

        it("parses decimal correctly", () => {
            expect(parseDecimal("123.456",".")).toEqual(123.456)
            expect(parseDecimal("123,456",",")).toEqual(123.456)
        })
    })

    describe("parseTimeOfDay", () => {

        it("parses time correctly", () => {
            expect(parseTimeOfDay("0000")).toEqual({ hours: 0, minutes: 0 })
            expect(parseTimeOfDay("1259")).toEqual({ hours: 12, minutes: 59 })
            expect(parseTimeOfDay("2400")).toEqual({ hours: 24, minutes: 0 })
        })
    })
})