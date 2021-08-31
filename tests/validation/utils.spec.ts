import { ValidationResultType } from "../../src/validation/index"
import { 
    error,
    isDate, isNumber, isVarchar, isInt, isArray, isRequired, isChar, 
    isIK, isRechnungsnummer, isTruncatedIfTooLong, arrayConstraints, valueConstraints
} from "../../src/validation/utils"

describe("validation utils", () => {

    it("isRequired", () => {
        expect(isRequired({ a: undefined }, "a")).toEqual(error("requiredValueMissing", "a"))
        expect(isRequired({ a: "I am here" }, "a")).toEqual(undefined)
    })

    it("isDate", () => {
        expect(isDate({ a: "not a date" }, "a")).toEqual(error("noDate", "a"))
        expect(isDate({ a: new Date() }, "a")).toEqual(undefined)
    })

    it("isNumber", () => {
        expect(isNumber({ a: "str" }, "a", 0, 1)).toEqual(error("noNumber", "a"))
        expect(isNumber({ a: -0.01 }, "a", 0, 1)).toEqual(error("numberTooSmall", "a", { min: "0" }))
        expect(isNumber({ a: 1.000 }, "a", 0, 1)).toEqual(error("numberTooBig", "a", { max: "1" }))
        expect(isNumber({ a: 0.999 }, "a", 0, 1)).toEqual(undefined)
    })

    it("isInt", () => {
        expect(isInt({ a: "str" }, "a", 0, 10)).toEqual(error("noInt", "a"))
        expect(isInt({ a: 4.12 }, "a", 0, 10)).toEqual(error("noInt", "a"))
        expect(isInt({ a: -1 }, "a", 0, 10)).toEqual(error("numberTooSmall", "a", { min: "0" }))
        expect(isInt({ a: 10 }, "a", 0, 10)).toEqual(error("numberTooBig", "a", { max: "10" }))
        expect(isInt({ a: 9 }, "a", 0, 10)).toEqual(undefined)
    })

    it("isArray", () => {
        expect(isArray({ a: "str" }, "a", 0, 10)).toEqual(error("noArray", "a"))
        expect(isArray({ a: [1] }, "a", 2, 10)).toEqual(error("arrayTooSmall", "a", { minLength: "2" }))
        expect(isArray({ a: [1,2,3,4,5] }, "a", 2, 4)).toEqual(error("arrayTooLong", "a", { maxLength: "4" }))
        expect(isArray({ a: [1,2] }, "a", 2, 2)).toEqual(undefined)
    })

    it("isVarchar", () => {
        expect(isVarchar({ a: 9 }, "a", 10)).toEqual(error("noString", "a"))
        expect(isVarchar({ a: "" }, "a", 10)).toEqual(error("textEmpty", "a"))
        expect(isVarchar({ a: "abc" }, "a", 2)).toEqual(error("textTooLong", "a", { maxLength: "2" }))
        expect(isVarchar({ a: "abc" }, "a", 3)).toEqual(undefined)
    })

    it("isChar", () => {
        expect(isChar({ a: 9 }, "a", 10)).toEqual(error("noString", "a"))
        expect(isChar({ a: "abc" }, "a", 2)).toEqual(error("textHasIncorrectLength", "a", { length: "2" }))
        expect(isChar({ a: "a" }, "a", 2)).toEqual(error("textHasIncorrectLength", "a", { length: "2" }))
        expect(isChar({ a: "ab" }, "a", 2)).toEqual(undefined)
    })

    it("isIK", () => {
        expect(isIK({ a: 123456789 }, "a")).toEqual(error("noString", "a"))
        expect(isIK({ a: "1234567890" }, "a")).toEqual(error("institutionskennzeichenIncorrect", "a"))
        expect(isIK({ a: "12345678" }, "a")).toEqual(error("institutionskennzeichenIncorrect", "a"))
        expect(isIK({ a: "123456789" }, "a")).toEqual(undefined)
    })

    it("isRechnungsnummer", () => {
        expect(isRechnungsnummer({ a: 123 }, "a")).toEqual(error("noString", "a"))
        expect(isRechnungsnummer({ a: "-a" }, "a")).toEqual(error("rechnungsnummerIncorrect", "a"))
        expect(isRechnungsnummer({ a: "/a" }, "a")).toEqual(error("rechnungsnummerIncorrect", "a"))
        expect(isRechnungsnummer({ a: "a99-" }, "a")).toEqual(error("rechnungsnummerIncorrect", "a"))
        expect(isRechnungsnummer({ a: "a99-4" }, "a")).toEqual(undefined)
    })

    it("isTruncatedIfTooLong", () => {
        expect(
            isTruncatedIfTooLong(isArray({ a: [1,2,3] }, "a", 2, 2))
        ).toEqual({
            code: "arrayTruncated",
            type: ValidationResultType.Warning,
            path: ["a"],
            params: { maxLength: "2" }
        })

        expect(
            isTruncatedIfTooLong(isArray({ a: [1,2,3] }, "a", 2, 3))
        ).toEqual(undefined)

        expect(
            isTruncatedIfTooLong(isVarchar({ a: "abc" }, "a", 2))
        ).toEqual({
            code: "textTruncated",
            type: ValidationResultType.Warning,
            path: ["a"],
            params: { maxLength: "2" }
        })

        expect(
            isTruncatedIfTooLong(isVarchar({ a: "ab" }, "a", 2))
        ).toEqual(undefined)
    })

    it("arrayConstraints", () => {
        const test: TestObject = {
            a: [{c: "hey"}, {c: "ho"}, {c: "let's go"}]
        }

        expect(
            arrayConstraints<NestedTestObject>(test, "a", it => [isChar(it, "c", 2)])
            .map(error => error?.path)
        ).toEqual([
            ["a", 0, "c"], // adds to the front of path array...
            undefined,     // but doesn't touch non-error
            ["a", 2, "c"]
        ])
    })

    it("valueConstraints", () => {
        const test: TestObject = {
            b: {c: "hey"}
        }

        expect(
            valueConstraints<NestedTestObject>(test, "b", it => [isChar(it, "c", 2), undefined])
            .map(error => error?.path)
        ).toEqual([
            ["b", "c"], // adds to the front of path array...
            undefined,  // but doesn't touch non-error
        ])
    })
})

type TestObject = {
    a?: NestedTestObject[]
    b?: NestedTestObject
}
type NestedTestObject = {
    c: string
}