import parseFilename from "./filename_parser.js"

function parse(filename: string) {
    const metadata = parseFilename(filename);
    if (metadata.einsatzgebiet != "Kostenträgerdatei Datenaustausch") {
       throw new Error(`File ${filename} is not a Kostenträgerdatei`);
    }
    if (metadata.fileFormat != "EDIFACT") {
        throw new Error(`Unable to parse ${filename}. Only the EDIFACT format is supported.`);
    }
    
    // TODO tzwick parse...
}
