import stringify from "../../src/edifact/writer"
import { elements, segment } from "../../src/edifact/builder"


describe("EDIFACT writer", () => {

    it("writes empty interchange", () => {
        expect(stringify({
            header: elements(["UNOC", "3"], "123456789", "987654321", ["20210427", "2159"], "111"),
            messages: [],
            decimalNotation: ","
        })).toEqual([
            "UNA:+,? '",
            "UNB+UNOC:3+123456789+987654321+20210427:2159+111'",
            "UNZ+0+111'"
        ].join("\r\n"))
    })

    it("writes interchange with two empty messages", () => {
        expect(stringify({
            header: elements(["UNOC", "3"], "1", "2", ["20210427", "2159"], "1"),
            messages: [{
                header: elements(["TEST", "2"]),
                segments: []
            },
            {
                header: elements(["TEST", "2"]),
                segments: []
            }],
            decimalNotation: ","
        })).toEqual([
            "UNA:+,? '",
            "UNB+UNOC:3+1+2+20210427:2159+1'",
            "UNH+1+TEST:2'",
            "UNT+2+1'",
            "UNH+2+TEST:2'",
            "UNT+2+2'",
            "UNZ+2+1'"
        ].join("\r\n"))
    })

    it("writes interchange with edge-casey message", () => {
        // we are lazy - let's just put all the edge cases to test into one test case, see comments

        expect(stringify({
            header: elements(["UNOC", "3"], "123456789", "987654321", ["20210427", "2159"], "111"),
            messages: [{
                header: elements(["TEST", "2"]),
                segments: [
                    // undefined segments in between
                    segment("UND", ["01", undefined, "x"], undefined, "123"),
                    // escape characters
                    segment("ESC", "Title: Hey, what's 1+2?"),
                    // removing trailing 
                    segment("TRA", ["1", undefined, undefined], "2", undefined, undefined)
                ]
            }],
            decimalNotation: ","
        })).toEqual([
            "UNA:+,? '",
            "UNB+UNOC:3+123456789+987654321+20210427:2159+111'",
            "UNH+1+TEST:2'",
            "UND+01::x++123'",
            "ESC+Title?: Hey, what?'s 1?+2??'",
            "TRA+1+2'",
            "UNT+5+1'",
            "UNZ+1+111'"
        ].join("\r\n"))
    })
})