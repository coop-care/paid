import tokenize from "../../src/edifact/tokenizer"

describe("EDIFACT parser", () => {

    it("parses empty interchange", () => {
        expect(tokenize(
            "UNB+UNOC:3+1+2+20211011:1030+123'"+
            "UNZ+0+123'"
        )).toEqual({
            header: [["UNOC","3"],["1"],["2"],["20211011","1030"],["123"]],
            messages: [],
            decimalNotation: ","
        })
    })

    it("parses empty interchange with custom separators", () => {
        expect(tokenize(
            "UNA,|_\\ ;"+
            "UNB|UNOC,3|1|2|20211011,1030|123;"+
            "UNZ|0|123;"
        )).toEqual({
            header: [["UNOC","3"],["1"],["2"],["20211011","1030"],["123"]],
            messages: [],
            decimalNotation: "_"
        })
    })

    it("interprets escaped characters correctly", () => {
        expect(tokenize(
            "UNB+UNOC:3+???:?+?,?'+2+20211011:1030+123'"+
            "UNZ+0+123'"
        )).toEqual({
            header: [["UNOC","3"],["?:+,'"],["2"],["20211011","1030"],["123"]],
            messages: [],
            decimalNotation: ","
        })
    })

    it("interprets escaped characters correctly with custom separators", () => {
        expect(tokenize(
            "UNA,|_\\ ;"+
            "UNB|UNOC,3|\\,\\|\\_\\\\\\;|2|20211011,1030|123;"+
            "UNZ|0|123;"
        )).toEqual({
            header: [["UNOC","3"],[",|_\\;"],["2"],["20211011","1030"],["123"]],
            messages: [],
            decimalNotation: "_"
        })
    })

    it("parses a an empty message", () => {
        expect(parseMessages(
            "UNH+0001+KOTR:01'"+
            "UNT+3+0001'"
        )).toEqual([{
            header: [["0001"],["KOTR", "01"]],
            segments: []
        }])
    })

    it("parses a message multiple segments", () => {
        expect(parseMessages(
            "UNH+0001+KOTR:01'"+
            "LOL+123'"+
            "RFL'"+
            "YAY+1:2'"+
            "UNT+3+0001'"
        )).toEqual([{
            header: [["0001"],["KOTR", "01"]],
            segments: [
                { tag: "LOL", elements: [["123"]] },
                { tag: "RFL", elements: [] },
                { tag: "YAY", elements: [["1","2"]] },
            ]
        }])
    })

    it("parses empty segment", () => {
        expect(parseSegments(
            "RFL'"
        )).toEqual([
            { tag: "RFL", elements: [] }
        ])
    })

    it("handles empty elements in segment correctly", () => {
        expect(parseSegments(
            "LOL+123 +++foo'"
        )).toEqual([{
            tag: "LOL",
            elements: [["123 "],[""],[""],["foo"]]
        }])
    })

    it("handles empty components in segment correctly", () => {
        expect(parseSegments(
            "YAY+1:::4+a'"
        )).toEqual([{
            tag: "YAY",
            elements: [["1","","","4"],["a"]]
        }])
    })

    it("ignores newlines between segments", () => {
        expect(parseSegments(
            "AAA'\n" +
            "BBB'\r\n" +
            "CC\nC'" +
            "DDD'\r" +
            "EEE'"
        ).map((v) => v.tag)).toEqual(
            ["AAA","BBB","CC\nC","DDD","EEE"]
        )
    })
})

const parseMessages = (messages: string) => tokenize(
    "UNB+UNOC:3+1+2+20211011:1030+123'"+
    messages+
    "UNZ+0+123'"
).messages

const parseSegments = (segments: string) => parseMessages(
    "UNH+0001+KOTR:01'"+
    segments+
    "UNT+3+0001'"
)[0].segments