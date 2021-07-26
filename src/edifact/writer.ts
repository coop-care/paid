import { segment } from "./builder";
import { Interchange, Segment, Element, ServiceStringAdvice, Message } from "./types";

/** Writes an EDIFACT interchange.
 *  
 *  The does only support syntax UNOC version 3, so, requires the input to be encoded with ISO 8859-1.
 * 
 *  The implementation is based on the documentation from
 *
 *  https://www.gs1.org/docs/EDI/eancom/2012/ean02s3/part1/part1_05.htm
 */
export default function stringify(interchange: Interchange) {
    if (interchange.decimalNotation.length != 1) {
        throw new Error("decimalNotation must be one character (usually ',' or '.'")
    }
    // no need to allow users to define custom separators (not used) but it would be easy to support
    const ssa = {
        componentSeparator: ":",
        elementSeparator: "+",
        decimalNotation: interchange.decimalNotation, 
        releaseCharacter: "?",
        segmentTerminator: "'"
    }

    const messageSegments = messagesToSegments(interchange.messages)

    const allSegments: Segment[] = [
        segment("UNB", ...interchange.header),
         ...messageSegments,
        segment("UNZ", 
            interchange.messages.length.toString(),
            // the fifth element in the header is the reference no of this interchange
            interchange.header[4] 
        )
    ]

    return [
        stringifyServiceStringAdvice(ssa),
        ...allSegments.map(segment => stringifySegment(segment, ssa))
    ].join("\r\n")
}

const messagesToSegments = (messages: Message[]): Segment[] => {
    let messageNo = 1
    // flatten the messages to segments (the header and trailer of a message are also segments)
    return messages.flatMap(message => messageToSegments(message, messageNo++))
}

const messageToSegments = (message: Message, no: number): Segment[] => [
    segment("UNH", no.toString(), ...message.header),
    ...message.segments,
    // +2 because this is the segment count including UNH and UNT
    segment("UNT", (message.segments.length + 2).toString(), no.toString())
]

const stringifyServiceStringAdvice = (ssa: ServiceStringAdvice): string =>
    "UNA" + 
    ssa.componentSeparator + 
    ssa.elementSeparator + 
    ssa.decimalNotation + 
    ssa.releaseCharacter + 
    " " + // unused
    ssa.segmentTerminator

const stringifySegment = (segment: Segment, ssa: ServiceStringAdvice): string =>
    segment.tag + 
    ssa.elementSeparator + 
    stringifyElements(segment.elements, ssa) +
    ssa.segmentTerminator

const stringifyElements = (elements: Element[], ssa: ServiceStringAdvice): string => {
    const esc = escapeCharacters(ssa)
    const trailingComponentsRegex = new RegExp("[" + ssa.componentSeparator + "]*$")
    const trailingElementsRegex = new RegExp("[" + ssa.elementSeparator + "]*$")
    /* elements are basically a string[][] and the control characters in each string need to be 
       escaped.
       Furthermore, the EDIFACT standard allows omitting empty components/elements at the end, maybe
       data parsers (incorrectly) require this */
    return elements
        .map(element => element
            .map(component => escape(component, esc))
            .join(ssa.componentSeparator)
            .replace(trailingComponentsRegex, "")
        )
        .join(ssa.elementSeparator)
        .replace(trailingElementsRegex, "")
}

const escape = (str: string, characters: string): string =>
    str.replace(new RegExp("([" + characters + "])", "g"), "?$1")

const escapeCharacters = (ssa: ServiceStringAdvice): string =>
    ssa.componentSeparator + ssa.elementSeparator + ssa.releaseCharacter + ssa.segmentTerminator
