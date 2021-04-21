import { TimeOfDay } from "./types";

/** Parse date in YYYYMMDD and HHMM format */
export function parseDate(date: string, time?: string): Date {
    if (date.length != 8) {
        throw new Error(`Expected date in the format YYYYMMDD but got "${date}"`)
    }
    if (time && time.length != 4) {
        throw new Error(`Expected time in format HHMM but got "${time}"`)
    }
    const result = new Date(
        parseInt(date.substring(0, 4)),
        parseInt(date.substring(4, 6)) - 1, // Date constructor expects an index
        parseInt(date.substring(6, 8)),
        time ? parseInt(time.substring(0, 2)) : 0,
        time ? parseInt(time.substring(2, 4)) : 0
    )
    if (isNaN(result.getTime())) {
        throw new Error(`Invalid date-time "${date}:${time}"`)
    }
    return result
}

/** Parses a time given as HHMM */
export function parseTimeOfDay(time: string): TimeOfDay {
    if (time.length != 4) {
        throw new Error(`Expected time in format HHMM but got "${time}"`)
    }
    const hours = parseInt(time.substring(0,2))
    const minutes = parseInt(time.substring(2,4))
    if (isNaN(minutes) || isNaN(hours)
        || hours < 0 || hours > 24
        || minutes < 0 || minutes > 59
        || hours == 24 && minutes > 0) {
        throw new Error(`Invalid time "${time}"`)
    }
    return { hours: hours, minutes: minutes }
}

/** Parse a decimal with given decimal separator  */
export function parseDecimal(str: string, decimalNotation: string): number {
    return parseFloat(str.replace(decimalNotation, "."))
}
