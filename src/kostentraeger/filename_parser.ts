/** Indicates the group of statutory health insurance. Each group has its own set of contact 
 *  addresses and rules how and where to send the bills.
*/
export type Kassenart = 
    "Allgemeine Ortskrankenkassen" | 
    "Ersatzkassen" | 
    "Betriebskrankenkassen" | 
    "Innungskrankenkassen" |
    "Knappschaft-Bahn-See" |
    "Landwirtschaftliche Krankenkasse" |
    "Gesetzliche Krankenversicherung"

/** For a "Kostenträger" file, indicates for which health care provider this file is used - 
 * 
 *  For services of care providers according to § 105 SGB XI, it is 
 *  "Datenaustausch Teilprojekt Leistungserbringer Pflege"
 * 
 *  For services of care providers according to § 302 SGB V, it is
 *  "Datenaustausch Teilprojekt Sonstige Leistungserbringer"
  */
export type Verfahren = 
    "Datenaustausch Teilprojekt Ärzte" |
    "Datenaustausch Teilprojekt Zahnärzte" |
    "Datenaustausch Teilprojekt Apotheken" |
    "Datenaustausch Teilprojekt Krankenhäuser" |
    "Datenaustausch Teilprojekt Reha-Einrichtungen" |
    "Datenaustausch Teilprojekt Sonstige Leistungserbringer" |
    "Datenaustausch Teilprojekt Leistungserbringer Pflege"

/** Application/purpose of this file. Only one value seems to be documented */
export type Einsatzgebiet = 
    "Kostenträgerdatei Datenaustausch"

/** Format that is used for this file. Only EDIFACT seems to be used, the status of the other ones
 *  is not clear as they are not documented in more detail.  */
export type FileFormat = "Database" | "EDIFACT" | "Excel"

/** The file version (0-9). If there are several files with otherwise the same Kassenart, Verfahren,
 *  Einsatzgebiet and validity start date, the file with the highest version number is the most
 *  current one and any with a lower version number can be discarded.
*/
export type FileVersion = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** Elements with metadata of a "Kostenträger" filename */
export type KostentraegerFilenameElements = {
    kassenart: Kassenart,
    verfahren: Verfahren,
    einsatzgebiet: Einsatzgebiet,
    validityStartDate: Date,
    fileFormat: FileFormat,
    version: FileVersion
}

/** Parse the elements of the filename of a "Kostenträger" file */
export default function parse(filename: string): KostentraegerFilenameElements {
    if (filename.length != 12 || filename[8] != ".") {
        throw new Error(`Filename "${filename}" must be in this format: xxxxxxxx.xxx`)
    }
    return {
        kassenart: parseKassenart(filename.substring(0, 2)),
        verfahren: parseVerfahren(filename.substring(2, 4)),
        validityStartDate: parseValidityStartDate(filename.substring(4,8)),
        einsatzgebiet: parseEinsatzgebiet(filename.substring(9,10)),
        fileFormat: parseFileFormat(filename.substring(10,11)),
        version: parseVersion(filename.substring(11,12))
    }
}

function parseKassenart(str: string): Kassenart {
    switch(str) {
        case "AO": return "Allgemeine Ortskrankenkassen"
        case "EK": return "Ersatzkassen"
        case "BK": return "Betriebskrankenkassen"
        case "IK": return "Innungskrankenkassen"
        case "BN": return "Knappschaft-Bahn-See"
        case "LK": return "Landwirtschaftliche Krankenkasse"
        case "GK": return "Gesetzliche Krankenversicherung"
    }
    throw new Error(`Unknown Kassenart "${str}"`)
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

function parseVerfahren(str: string): Verfahren {
    switch(str) {
        case "01": return "Datenaustausch Teilprojekt Ärzte"
        case "02": return "Datenaustausch Teilprojekt Zahnärzte"
        case "03": return "Datenaustausch Teilprojekt Apotheken"
        case "4A": return "Datenaustausch Teilprojekt Krankenhäuser"
        case "4B": return "Datenaustausch Teilprojekt Reha-Einrichtungen"
        case "05": return "Datenaustausch Teilprojekt Sonstige Leistungserbringer"
        case "06": return "Datenaustausch Teilprojekt Leistungserbringer Pflege"
    }
    throw new Error(`Unknown Verfahren "${str}"`)
}

function parseEinsatzgebiet(str: string): Einsatzgebiet {
    switch(str.toUpperCase()) {
        case "K": return "Kostenträgerdatei Datenaustausch"
    }
    throw new Error(`Unknown Einsatzgebiet "${str}"`)
}

function parseFileFormat(str: string): FileFormat {
    switch(str.toUpperCase()) {
        case "D": return "Database"
        case "E": return "EDIFACT"
        case "X": return "Excel"
    }
    throw new Error(`Unknown FileFormat "${str}"`)
}

function parseVersion(str: string): FileVersion {
    const version = parseInt(str)
    if (isNaN(version)) throw new Error(`Expected numerical version (0-9) but got "${str}"`)
    return version as FileVersion
}