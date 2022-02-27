import fetch from 'cross-fetch'
import tokenize from "../edifact/tokenizer"
import parse from "./edifact/parser"
import parsePems from "./pki/parser"
import parseKostentraegerUrls from './rssreader'
import transform from "./transformer"
import { InstitutionListFileParseResult, InstitutionListParseResult } from "./types"
import { Certificate } from '@peculiar/asn1-x509'

const getTextDecoder = async () => (typeof window !== 'undefined') && window.TextDecoder
    ? window.TextDecoder
    : (await import("util"))?.default?.TextDecoder

const kostentraegerRssUrls = [
    "https://gkv-datenaustausch.de/leistungserbringer/pflege/kostentraegerdateien_pflege/rss_kostentraegerdateien_pflege.xml",
    "https://gkv-datenaustausch.de/leistungserbringer/sonstige_leistungserbringer/kostentraegerdateien_sle/rss_kostentraegerdateien_sonstige_leistungserbringer.xml"
]

type FetchMethodType = (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

/* Currently (2021-05), there are two lists, the other being
   https://trustcenter-data.itsg.de/dale/annahme-sha256.key 
   Those are the old certificates with 2048bit keys. However, all Datenannahmestellen already got
   new keys, so no need to include the old list (due to be deleted before 2023) now
 */
const certificatesUrl = "https://trustcenter-data.itsg.de/dale/annahme-rsa4096.key"

export default async function fetchInstitutionLists(proxyFetch = fetch): Promise<InstitutionListFileParseResult[]> {
    const certificatesByIK = await fetchCertificates(proxyFetch)
    const fileUrls = await fetchKostentraegerUrls(kostentraegerRssUrls, proxyFetch)
    const kostentraegerFiles = await fetchKostentraegerFiles(fileUrls, proxyFetch)
    return kostentraegerFiles.map(([fileName, text]) => {
        return { fileName: fileName, ...parseKostentraegerString(certificatesByIK, text) }
    })
}

async function fetchCertificates(fetch: FetchMethodType): Promise<Map<string, Certificate[]>> {
    const pems = await (await fetchSecure(certificatesUrl, fetch)).text()
    return parsePems(pems)
}

async function fetchKostentraegerUrls(kostentraegerRssUrls: string[], fetch: FetchMethodType): Promise<string[]> {
    const urlsArray = await Promise.all(kostentraegerRssUrls.map(async (url) => {
        // The RSS text files are encoded in UTF-8, so we can call .text() here without worry
        const responseText = await (await fetchSecure(url, fetch)).text()
        return parseKostentraegerUrls(responseText)
    }))
    return urlsArray.flat()
}

async function fetchKostentraegerFiles(kostentraegerFileUrls: string[], fetch: FetchMethodType): Promise<[string, string][]> {
    return await Promise.all(
        kostentraegerFileUrls.map(async url => await fetchKostentraegerFile(url, fetch))
    )
}

async function fetchKostentraegerFile(url: string, fetch: FetchMethodType): Promise<[string, string]> {
  const TextDecoder = await getTextDecoder()
    const response = await fetchSecure(url, fetch)
    /* Kostenträger files are encoded in iso-8859-1 and not in UTF-8, so we cannot
       just call response.text()! */
    const decoder = new TextDecoder("iso-8859-1")
    const text = decoder.decode(await response.arrayBuffer())
    const fileName = url.substring(url.lastIndexOf("/")+1)
    try {
        return [fileName, text]
    } catch(e: any) {
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

async function fetchSecure(url: string, fetch: FetchMethodType) {
    return await fetch(url.replace(/^http:/, "https:"));
}
