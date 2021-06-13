import fetch from 'cross-fetch'
import tokenize from "../edifact/tokenizer"
import parse from "./edifact/parser"
import parseKostentraegerUrls from './rssreader'
import transform from "./transformer"
import { InstitutionListFileParseResult, InstitutionListParseResult } from "./types"
import { TextDecoder } from "util"

const kostentraegerRssUrls = [
    "https://gkv-datenaustausch.de/leistungserbringer/pflege/kostentraegerdateien_pflege/rss_kostentraegerdateien_pflege.xml",
    "https://gkv-datenaustausch.de/leistungserbringer/sonstige_leistungserbringer/kostentraegerdateien_sle/rss_kostentraegerdateien_sonstige_leistungserbringer.xml"
]

export default async function fetchKostentraeger(): Promise<InstitutionListFileParseResult[]> {
    const fileUrls = await fetchKostentraegerUrls(kostentraegerRssUrls)
    const institutionListParseResults = await fetchKostentraegerFiles(fileUrls)
    return institutionListParseResults
}

async function fetchKostentraegerUrls(kostentraegerRssUrls: string[]): Promise<string[]> {
    const urlsArray = await Promise.all(kostentraegerRssUrls.map(async (url) => {
        // The RSS text files are encoded in UTF-8, so we can call .text() here without worry
        const responseText = await (await fetch(url)).text()
        return parseKostentraegerUrls(responseText)
    }))
    return urlsArray.flat()
}

async function fetchKostentraegerFiles(kostentraegerFileUrls: string[]): Promise<InstitutionListFileParseResult[]> {
    return await Promise.all(
        kostentraegerFileUrls.map(async url => await fetchKostentraegerFile(url))
    )
}

async function fetchKostentraegerFile(url: string): Promise<InstitutionListFileParseResult> {
    const response = await fetch(url)
    /* Kostenträger files are encoded in iso-8859-1 and not in UTF-8, so we cannot
       just call response.text()! */
    const decoder = new TextDecoder("iso-8859-1")
    const text = decoder.decode(await response.arrayBuffer())

    const fileName = url.substring(url.lastIndexOf("/")+1)
    try {
        return { fileName: fileName, ...parseKostentraegerString(text) }
    } catch(e) {
        e.message = fileName + ": " + e.message
        throw e
    }
}

function parseKostentraegerString(text: string): InstitutionListParseResult {
    const tokenizedEdifact = tokenize(text)
    const edifactParseResult = parse(tokenizedEdifact)
    const transformedResult = transform(edifactParseResult.interchange)
    // also merge the warnings from both parsing steps
    transformedResult.warnings = edifactParseResult.warnings.concat(transformedResult.warnings)
    return transformedResult
}
