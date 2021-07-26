import { char, decimal, elements, fixedInt, int, varchar } from "../../src/edifact/builder"


describe("EDIFACT builder", () => {

    describe("decimal format", () => {

        it("zero", () => {
            expect(decimal(0, 4, 2)).toEqual("0,00")
        })
    
        it("large amount", () => {
            expect(decimal(9876543.21, 10, 2)).toEqual("9876543,21")
        })
    
        it("round many fraction digits", () => {
            expect(decimal(.0654321, 2, 2)).toEqual("0,07")
        })
    
        it("negative", () => {
            expect(decimal(-12.345, 2, 2)).toEqual("-12,35")
        })
    
        it("too large value throws", () => {
            expect(() => decimal(999.34, 2, 2)).toThrow()
        })
    })

    describe("fixed int", () => {

        it("pads small value", () => {
            expect(fixedInt(1, 3)).toEqual("001")
        })

        it("does not pad big value", () => {
            expect(fixedInt(999, 3)).toEqual("999")
        })

        it("too large value throws", () => {
            expect(() => fixedInt(999, 2)).toThrow()
        })

        it("not-an-integer throws", () => {
            expect(() => fixedInt(10.123, 10)).toThrow()
        })
    })

    describe("int", () => {

        it("converts to string", () => {
            expect(int(10, 1, 20)).toEqual("10")
        })

        it("not-an-integer throws", () => {
            expect(() => int(10.123, 1, 20)).toThrow()
        })

        it("out of bounds throws", () => {
            expect(() => int(0, 1, 20)).toThrow()
            expect(() => int(21, 1, 20)).toThrow()
        })
    })

    describe("char", () => {

        it("returns string", () => {
            expect(char("hey", 3)).toEqual("hey")
        })

        it("too short string throws", () => {
            expect(() => char("he", 3)).toThrow()
        })

        it("too long string throws", () => {
            expect(() => char("heyy", 3)).toThrow()
        })
    })

    describe("varchar", () => {

        it("returns string", () => {
            expect(varchar("hey", 3)).toEqual("hey")
        })

        it("too long string throws", () => {
            expect(() => varchar("heyy", 3)).toThrow()
        })
    })

    describe("elements", () => {

        it("handles undefined", () => {
            expect(
                elements("a", undefined, ["b","c"], [undefined, "d"])
            ).toEqual(
                [["a"],[""],["b","c"],["", "d"]]
            )
        })
    })
})