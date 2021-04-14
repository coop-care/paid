import {
    kassenartSchluessel, KassenartSchluessel,
    verfahrenSchluessel, VerfahrenSchluessel
} from './filename_keys'

/** Elements with metadata of a "Kostenträger" filename */
export type KostentraegerFilenameElements = {
    kassenart: KassenartSchluessel,
    verfahren: VerfahrenSchluessel,
    validityStartDate: Date,
    /** The file version (0-9). If there are several files with otherwise the same Kassenart, Verfahren,
     *  Einsatzgebiet and validity start date, the file with the highest version number is the most
     *  current one and any with a lower version number can be discarded.
     */
    version: number
}

/** Parse the elements of the filename of a "Kostenträger" file */
export default function parse(filename: string): KostentraegerFilenameElements {
    if (filename.length != 12 || filename[8] != ".") {
        throw new Error(`Filename "${filename}" must be in this format: xxxxxxxx.xxx`)
    }
    const einsatzgebiet = filename.substring(9,10).toUpperCase()
    if (einsatzgebiet != "K") {
        throw new Error(`Unknown Einsatzgebiet "${einsatzgebiet}", expected "K" for "Kostenträgerdatei"`)
    }
    const fileFormat = filename.substring(10,11).toUpperCase()
    if (fileFormat != "E") {
        throw new Error(`Unknown file format "${fileFormat}", expected "E" for "EDIFACT"`)
    }

    return {
        kassenart: parseKassenartSchluessel(filename.substring(0, 2)),
        verfahren: parseVerfahrenSchluessel(filename.substring(2, 4)),
        validityStartDate: parseValidityStartDate(filename.substring(4,8)),
        version: parseVersion(filename.substring(11,12))
    }
}

function parseKassenartSchluessel(str: string): KassenartSchluessel {
    if(!kassenartSchluessel.hasOwnProperty(str)) {
        throw new Error(`Unknown Kassenart "${str}"`)
    }
    return str as KassenartSchluessel
}

function parseValidityStartDate(str: string): Date {
    const month = parseMonth(str.substring(0,2))
    const year = parseYear(str.substring(2,4))
    const monthIndex = month - 1
    return new Date(year, monthIndex)
}

function parseMonth(str: string): number {
    switch(str) {
        case "Q1": return 1
        case "Q2": return 4
        case "Q3": return 7
        case "Q4": return 10
        case "01": return 1
        case "02": return 2
        case "03": return 3
        case "04": return 4
        case "05": return 5
        case "06": return 6
        case "07": return 7
        case "08": return 8
        case "09": return 9
        case "10": return 10
        case "11": return 11
        case "12": return 12
    }
    throw new Error(`Unknown month "${str}"`)
}

function parseYear(str: string): number {
    const year = parseInt(str)
    if (isNaN(year)) throw new Error(`Unknown year "${year}"`)
    
    // The year just has two digits. We need to infer the full year
    return inferFullYear(year, new Date().getFullYear())
}

function inferFullYear(twoDigitYear: number, currentYear: number): number {
    if (twoDigitYear < 0 || twoDigitYear > 99) {
        throw new RangeError(`twoDigitYear must be between 0 and 99 but was ${twoDigitYear}`)
    }

    /* Can we assume that the German health insurances will modernize their data format 
       before the start of the next century? Not so sure about that, so let's
       infer the century in a future-proof way to be on the safe side. */
    const currentYearInCentury = currentYear % 100
    const currentCentury = Math.floor(currentYear / 100)
    const yearDifference = twoDigitYear - currentYearInCentury

    if (yearDifference < -90) {
        // the year would be more than 90 years in the past? Must mean next century then
        return (currentCentury + 1) * 100 + twoDigitYear
    } else if (yearDifference > 10) {
        // the date would be more than 10 years in the future? Must mean last century then
        return (currentCentury - 1) * 100 + twoDigitYear
    } else {
        return currentCentury * 100 + twoDigitYear
    }
}

function parseVerfahrenSchluessel(str: string): VerfahrenSchluessel {
    if(!verfahrenSchluessel.hasOwnProperty(str)) {
        throw new Error(`Unknown Verfahren "${str}"`)
    }
    return str as VerfahrenSchluessel
}

function parseVersion(str: string): number {
    const version = parseInt(str)
    if (isNaN(version)) throw new Error(`Expected numerical version (0-9) but got "${str}"`)
    return version
}
