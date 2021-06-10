import fetch from 'cross-fetch'
import { IKPublicKeyInfo } from './types'
import parse from './parser'

/* Currently (2021-05), there are indeed two lists, the other being
   https://trustcenter-data.itsg.de/dale/annahme-sha256.key 
   which are the old certificates with 2048bit keys. However, all Datenannahmestellen already got
   new keys, so no need to include the old list (due to be deleted before 2023) now
 */
const certificatesUrls = [
    "https://trustcenter-data.itsg.de/dale/annahme-rsa4096.key"
]

export default async function fetchPublicKeyInfos(): Promise<IKPublicKeyInfo[]> {
    const publicKeyInfos = await Promise.all(certificatesUrls.map(async (url) => {
        const pems = await(await fetch(url)).text()
        return parse(pems)
    }))
    return publicKeyInfos.flat()
}
