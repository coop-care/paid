import { char } from "./formatter";
import { Segment, Element } from "./types";

/** convenience builder for a segment */
export const segment = (
    tag: string,
    ...values: Array<Array<string | undefined> | string | undefined>
): Segment => ({
    tag: char(tag, 3)!!,
    elements: elements(...values)
})

/** convenience builder for an array of elements where it is legal to pass strings (= elements
 *  with one component) and undefined (= elements with no components / empty elements) */
export const elements = (
    ...values: Array<Array<string | undefined> | string | undefined>
): Element[] => 
    values.map(value => {
        if (Array.isArray(value)) return value.map(component => component ?? "")
        else if (typeof value === 'string') return [value]
        else return [""]
    })
