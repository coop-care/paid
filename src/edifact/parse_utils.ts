
/** Parse date in YYYYMMDD and HHMM format */
export function parseDate(date: string, time?: string): Date {
    if (date.length != 8) {
        throw new Error(`Expected date in the format YYYYMMDD but got "${date}"`)
    }
    if (time && time.length != 4) {
        throw new Error(`Expected time in format HHMM but got "${time}"`)
    }
    const year = parseInt(date.substring(0, 4))
    const month = parseInt(date.substring(4, 6)) - 1 // month index
    const day = parseInt(date.substring(6, 8))
    let result: Date
    if (time) {
        const hours = parseInt(time.substring(0, 2))
        const minutes = parseInt(time.substring(2, 4))
        result = new Date(Date.UTC(year, month, day, hours, minutes))
    } else {
        result = new Date(Date.UTC(year, month, day))
    }

    if (isNaN(result.getTime())) {
        throw new Error(`Invalid date-time "${date}:${time}"`)
    }
    return result
}

/** Parse a decimal with given decimal separator  */
export function parseDecimal(str: string, decimalNotation: string): number {
    return parseFloat(str.replace(decimalNotation, "."))
}
