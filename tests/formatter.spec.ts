import { mask, price, datetime, segment } from "../src/formatter"

describe("formatter", () => {

    it("masks special characters in string", () => {
        expect(mask("Hello, 'world'? :+1:")).toEqual("Hello?, ?'world?'?? ?:?+1?:");
    });

    it("price format: zero", () => {
        expect(price(0)).toEqual("0,00");
    });

    it("price format: large amount", () => {
        expect(price(9876543.21)).toEqual("9876543,21");
    });

    it("price format: round many fraction digits", () => {
        expect(price(.0654321)).toEqual("0,07");
    });

    it("price format: negative", () => {
        expect(price(-12.344)).toEqual("-12,34");
    });

    it("price format: undefined", () => {
        expect(price(undefined)).toEqual("");
    });

    it("date time format", () => {
        expect(datetime(new Date(2021, 2, 8, 13, 37))).toEqual("20210308:1337");
    });

    it("date time format: midnight", () => {
        expect(datetime(new Date(2021, 2, 8, 0, 0))).toEqual("20210308:0000");
    });

    it("omit + sepearator on optional values at the end of a segment", () => {
        expect(segment("A", "", "B", undefined, "C", "", "", "")).toEqual("A++B+C'\n");
    });

});