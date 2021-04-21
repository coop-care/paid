import { Interchange, Message, Segment, Element, ServiceStringAdvice } from "./types";

/** Parses an EDIFACT interchange.
 *  
 *  The parser does not support groups (UNG, UNE), nesting and only supports syntax UNOC version 3,
 *  so, requires the input to be encoded with ISO 8859-1.
 *  It would not be much effort to implement these each, but they are not necessary in this project.
 * 
 *  The parser also does not validate the interchange, it assumes that the input is well-formed.
 * 
 *  The implementation is based on the documentation from
 *
 *  https://www.gs1.org/docs/EDI/eancom/2012/ean02s3/part1/part1_05.htm
 */
export default function parse(str: string): Interchange {
    // first line decides which separators are to be used in the rest of the interchange
    const ssa = parseServiceStringAdvice(str)
    const segments = split(str, ssa.segmentTerminator, ssa.releaseCharacter)

    let header = null
    const messages: Message[] = []

    let messageHeader = null
    let messageSegments: Segment[] = []

    for (let i = 0; i < segments.length; ++i) { 
        // line feeds between segments should be ignored according to the docs
        const segment = segments[i].replace(/^(\r\n|\n|\r)|(\r\n|\n|\r)$/g,"")
        // we already took care of the service string advice...
        if (i == 0 && segment.startsWith("UNA")) { 
            continue
        }

        // array of elements which in turn each contain an array of components
        const elements: Element[] = split(segment, ssa.elementSeparator, ssa.releaseCharacter).map(
            (element) => split(element, ssa.componentSeparator, ssa.releaseCharacter).map(
                (component) => unescape(component, ssa.releaseCharacter)
            )
        )

        const segmentTag = elements.shift()!
        if (segmentTag.length > 1) {
            throw new Error("Nesting of segments is not supported by this parser")
        }
        const segmentCode = segmentTag[0]
        
        switch(segmentCode) {
            // Interchange header
            case "UNB": 
                const syntaxIdentifier = elements[0][0]
                const syntaxVersionNumber = parseInt(elements[0][1])
                if (syntaxIdentifier != "UNOC" || syntaxVersionNumber != 3) {
                    throw new Error("Only syntax identifier UNOC version 3 is supported by this parser")
                }
                header = elements
                break
            // Interchange trailer
            case "UNZ": 
                break

            // functional group header 
            case "UNG": 
            // functional group trailer
            case "UNE": 
                throw new Error("Functional groups (UNG, UNE) are not supported by this parser")

            // message header
            case "UNH": 
                messageHeader = elements
                break
            // message trailer
            case "UNT": 
                messages.push({
                    header: messageHeader!,
                    segments: messageSegments!
                })
                messageHeader = null
                messageSegments = []
                break

            // all other
            default: 
                messageSegments.push({
                    tag: segmentCode,
                    elements: elements
                })
                break
        }
    }

    return {
        header: header as Element[],
        messages: messages,
        decimalNotation: ssa.decimalNotation
    }
}

function parseServiceStringAdvice(str: string): ServiceStringAdvice {
    if (str.startsWith("UNA")) {
        return {
            componentSeparator: str[3],
            elementSeparator: str[4],
            decimalNotation: str[5],
            releaseCharacter: str[6],
            // index 7 is reserved "for future use"
            segmentTerminator: str[8]
        }
    } else {
        return {
            componentSeparator: ":",
            elementSeparator: "+",
            /* documentation is inconsistent what should be the default if not specified */
            decimalNotation: ",", 
            releaseCharacter: "?",
            segmentTerminator: "'"
        }
    }
}

/** split the given string into a list of strings, using the given separator, but leave any escaped
 *  character as-is */
function split(str: string, separator: string, escapeChar: string): string[] {
    const result = []
    let token = ""
    for (let i = 0; i < str.length; ++i) {
        let c = str.charAt(i)
        if (c === separator) {
            result.push(token)
            token = ""
            continue
        }
        token += c
        if (c === escapeChar) {
            token += str.charAt(++i)
        }
    }
    result.push(token)
    return result
}

/** unescape the given string with the given character as the escape character */
function unescape(str: string, escapeChar: string): string {
    let result = ""
    for (let i = 0; i < str.length; ++i) {
        let c = str.charAt(i)
        if (c === escapeChar) {
            result += str.charAt(++i)
        } else {
            result += c
        }
    }
    return result
}
