import fetch from 'cross-fetch'
import tokenize from "../edifact/tokenizer"
import parse from "./edifact/parser"
import transform from "./transformer"
import { InstitutionList } from "./types"

const kostentraegerRssUrls = [
    "https://gkv-datenaustausch.de/leistungserbringer/pflege/kostentraegerdateien_pflege/rss_kostentraegerdateien_pflege.xml",
    "https://gkv-datenaustausch.de/leistungserbringer/sonstige_leistungserbringer/kostentraegerdateien_sle/rss_kostentraegerdateien_sonstige_leistungserbringer.xml"
]

export default async function fetchKostentraeger(): Promise<InstitutionList[]> {
    const fileUrls = await fetchKostentraegerUrls(kostentraegerRssUrls)
    const institutionLists = await fetchKostentraegerFiles(fileUrls)
    return institutionLists
}

async function fetchKostentraegerUrls(kostentraegerRssUrls: string[]): Promise<string[]> {
    const urlsArray = await Promise.all(kostentraegerRssUrls.map(async (url) => {
        const responseText = await (await fetch(url)).text()
        const rssDOM = new DOMParser().parseFromString(responseText, "text/xml")
        const items = rssDOM.getElementsByTagName("item")
        const urls: string[] = []
        for (let i = 0; i < items.length; i++) {
            const item = items.item(i)
            const kostentraegerFileUrl = item?.getElementsByTagName("link")?.item(0)?.childNodes[0]?.nodeValue
            if (kostentraegerFileUrl) {
                urls.push(kostentraegerFileUrl)
            }
        }
        return urls
    }))
    return urlsArray.flat()
}

async function fetchKostentraegerFiles(kostentraegerFileUrls: string[]): Promise<InstitutionList[]> {
    return Promise.all(kostentraegerFileUrls.map((url) => fetchKostentraegerFile(url)))
}

async function fetchKostentraegerFile(url: string): Promise<InstitutionList> {
    const fileName = url.substring(url.lastIndexOf("/")+1)
    try {
        const responseText = await (await fetch(url)).text()
        const tokenizedEdifact = tokenize(responseText)
        const parsedEdifact = parse(tokenizedEdifact)
        return transform(parsedEdifact)
    } catch(error) {
        error.message = fileName + ": " + error.message
        throw error
    }
}