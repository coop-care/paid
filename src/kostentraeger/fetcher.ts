import fetch from 'cross-fetch'
import tokenize from "../edifact/tokenizer"
import parse from "./edifact/parser"
import parsePems from "./pki/parser"
import parseKostentraegerUrls from './rssreader'
import transform from "./transformer"
import { InstitutionListFileParseResult, InstitutionListParseResult } from "./types"
import { TextDecoder } from "util"
import { Certificate } from '@peculiar/asn1-x509'

const kostentraegerRssUrls = [
    "https://gkv-datenaustausch.de/leistungserbringer/pflege/kostentraegerdateien_pflege/rss_kostentraegerdateien_pflege.xml",
    "https://gkv-datenaustausch.de/leistungserbringer/sonstige_leistungserbringer/kostentraegerdateien_sle/rss_kostentraegerdateien_sonstige_leistungserbringer.xml"
]

/* Currently (2021-05), there are two lists, the other being
   https://trustcenter-data.itsg.de/dale/annahme-sha256.key 
   Those are the old certificates with 2048bit keys. However, all Datenannahmestellen already got
   new keys, so no need to include the old list (due to be deleted before 2023) now
 */
const certificatesUrl = "https://trustcenter-data.itsg.de/dale/annahme-rsa4096.key"

export default async function fetchInstitutionLists(): Promise<InstitutionListFileParseResult[]> {
    const certificatesByIK = await fetchCertificates()
    const fileUrls = await fetchKostentraegerUrls(kostentraegerRssUrls)
    const kostentraegerFiles = await fetchKostentraegerFiles(fileUrls)
    return kostentraegerFiles.map(([fileName, text]) => {
        return { fileName: fileName, ...parseKostentraegerString(certificatesByIK, text) }
    })
}

async function fetchCertificates(): Promise<Map<string, Certificate[]>> {
    const pems = await (await fetch(certificatesUrl)).text()
    return parsePems(pems)
}

async function fetchKostentraegerUrls(kostentraegerRssUrls: string[]): Promise<string[]> {
    const urlsArray = await Promise.all(kostentraegerRssUrls.map(async (url) => {
        // The RSS text files are encoded in UTF-8, so we can call .text() here without worry
        const responseText = await (await fetch(url)).text()
        return parseKostentraegerUrls(responseText)
    }))
    return urlsArray.flat()
}

async function fetchKostentraegerFiles(kostentraegerFileUrls: string[]): Promise<[string, string][]> {
    return await Promise.all(
        kostentraegerFileUrls.map(async url => await fetchKostentraegerFile(url))
    )
}

async function fetchKostentraegerFile(url: string): Promise<[string, string]> {
    const response = await fetch(url)
    /* Kostenträger files are encoded in iso-8859-1 and not in UTF-8, so we cannot
       just call response.text()! */
    const decoder = new TextDecoder("iso-8859-1")
    const text = decoder.decode(await response.arrayBuffer())
    const fileName = url.substring(url.lastIndexOf("/")+1)
    try {
        return [fileName, text]
    } catch(e) {
        e.message = fileName + ": " + e.message
        throw e
    }
}

function parseKostentraegerString(pkeyMap: Map<string, Certificate[]>, text: string): InstitutionListParseResult {
    const tokenizedEdifact = tokenize(text)
    const edifactParseResult = parse(tokenizedEdifact)
    const transformedResult = transform(pkeyMap, edifactParseResult.interchange)
    // also merge the warnings from both parsing steps
    transformedResult.warnings = edifactParseResult.warnings.concat(transformedResult.warnings)
    return transformedResult
}
