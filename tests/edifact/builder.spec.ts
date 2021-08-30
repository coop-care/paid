import { elements } from "../../src/edifact/builder"

describe("EDIFACT builder", () => {

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