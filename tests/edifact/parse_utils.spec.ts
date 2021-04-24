import { parseDate, parseDecimal } from "../../src/edifact/parse_utils"

describe("EDIFACT parsing utilities", () => {
    
    describe("parseDate", () => {
        
        it("parses date and time correctly", () => {
            expect(parseDate("20120806","1215")).toEqual(new Date("2012-08-06T12:15Z"))
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

})