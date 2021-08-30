import { validate, ValidationResultType } from "../../src/validation/index"

describe("validation", () => {

    it("returns only validation errors and warnings with attached message", () => {
        expect(validate([
            undefined, 
            { code: "noArray", type: ValidationResultType.Error, path: ["myobj", 3, "foo"]},
            undefined,
            { code: "textTooLong", type: ValidationResultType.Warning, path: [], params: { maxLength: "123" }},
        ])).toEqual([
            { 
                code: "noArray",
                type: ValidationResultType.Error,
                path: ["myobj", 3, "foo"],
                message: ".myobj[3].foo: Must be an array."
            },
            { 
                code: "textTooLong",
                type: ValidationResultType.Warning,
                path: [],
                params: { maxLength: "123" },
                message: "String length must be at most 123 characters."
            },
        ])
    })

})