
/** Parses all the URLs that lead to the Kostenträger files from the RSS feed. An RSS feed like this
 *  "https://gkv-datenaustausch.de/leistungserbringer/pflege/kostentraegerdateien_pflege/rss_kostentraegerdateien_pflege.xml"
 */
export default function parseKostentraegerUrls(rssText: string): string[] {
    const rssDOM = new DOMParser().parseFromString(rssText, "text/xml")
    const items = rssDOM.getElementsByTagName("item")
    const urls: string[] = []
    for (let i = 0; i < items.length; i++) {
        const item = items.item(i)
        const kostentraegerFileUrl = item?.getElementsByTagName("link")?.item(0)?.childNodes[0]?.nodeValue
        if (kostentraegerFileUrl) {
            urls.push(kostentraegerFileUrl.replace(/^http:/, "https:"))
        }
    }
    
    return filterOnlyMostCurrentKostentraegerUrls(urls)
}

/** Filter out f.e. "BN06Q318.KE0" if there is also a "BN06Q318.KE1" */
function filterOnlyMostCurrentKostentraegerUrls(fileUrls: string[]): string[] {
    // disregard any old versions of the same file
    return fileUrls.filter((url, index) => {
        const name = getFileName(url)
        const version = getFileVersion(url)
        return !fileUrls.some((url2, index2) => {
            if (index == index2) return false
            const name2 = getFileName(url2)
            if (name == name2) {
                const version2 = getFileVersion(url2)
                return version < version2
            }
        })
    })
}

function getFileName(url: string): string {
    url = url.toUpperCase()
    return url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."))
}

function getFileVersion(url: string): number {
    url = url.toUpperCase()
    return parseInt(url.substring(url.lastIndexOf(".KE") + 3))
}
