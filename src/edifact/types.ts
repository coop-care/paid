/** Contents of an EDIFACT interchange */
export type Interchange = {
    header: Element[],
    messages: Message[],
    decimalNotation: string
}

/** Message in an EDIFACT interchange */
export type Message = {
    header: Element[]
    segments: Segment[]
}

/** Segment in a message in an EDIFACT interchange */
export type Segment = {
    tag: string,
    elements: Element[]
}

/** Element in a segment in an EDIFACT interchange. It consists of one or more "components" 
 *  (strings). */
export type Element = string[]

/** Defines which separator characters etc. shall be used in an interchange */
export type ServiceStringAdvice = {
    componentSeparator: string,
    elementSeparator: string,
    decimalNotation: string,
    releaseCharacter: string,
    segmentTerminator: string
}

export type TimeOfDay = {
    hours: number,
    minutes: number
}