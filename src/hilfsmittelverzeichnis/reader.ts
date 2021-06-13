
export type HilfsmittelProduct = {
    itemNo: string,
    label?: string,
    manufacturer?: string
}

/** Parses a Hilfsmittel- und Pflegehilfsmittelverzeichnis (= catalogue of invoicable therapeutic 
 *  appliances for care providers) from the XML as contained in a ZIP like this:
 *  https://www.gkv-datenaustausch.de/media/dokumente/leistungserbringer_1/sonstige_leistungserbringer/positionsnummernverzeichnisse/20210521_HMV.zip
 *  (The URL changes for each new publication, but the XML schema remains the same of course)
 */
export default function readHilfsmittelverzeichnis(xmlText: string): HilfsmittelProduct[] {
    const dom = new DOMParser().parseFromString(xmlText, "text/xml") as XMLDocument
    
    /* The XML also contain names, descriptions etc. for the hierarchical structure of
       GRUPPE
       └╴ORT
         └╴UNTERGRUPPE
           └╴ART

       too, which could be very handy for browsing the catalogue, f.e. the product 13.20.14.1.965
       is sorted under the following:
       
       GRUPPE 13: Hörhilfen
       └╴ORT 20: Hörorgan
         └╴UNTERGRUPPE 14: Tinnitusgeräte
           └╴ART 1: Kombinierte Tinnitusgeräte/Hörgeräte (Tinnitus-Instruments)
             └╴PRODUKT 965: Viron 5 miniRITE T (85-Hörer) Tinnitus-Kombigerät

        For now, however, we only parse basic info on the products
       */

    const result: HilfsmittelProduct[] = []

    const products = dom.getElementsByTagName("hv:HMV_PRODUKT")
    for (let i = 0; i < products.length; i++) {
        const product = products.item(i)!
        const gruppe = product.getElementsByTagName("hv:GRUPPE").item(0)!.firstChild!.nodeValue!
        const ort = product.getElementsByTagName("hv:ORT").item(0)!.firstChild!.nodeValue!
        const untergruppe = product.getElementsByTagName("hv:UNTERGRUPPE").item(0)!.firstChild!.nodeValue!
        const art = product.getElementsByTagName("hv:ART").item(0)!.firstChild!.nodeValue!
        const produkt = product.getElementsByTagName("hv:PRODUKT").item(0)!.firstChild!.nodeValue!
        const bezeichnung = product.getElementsByTagName("hv:BEZEICHNUNG").item(0)?.firstChild?.nodeValue
        const hersteller = product.getElementsByTagName("hv:HERSTELLER").item(0)?.firstChild?.nodeValue

        // if the Bezeichnung is this "magic word", it means that the whole product does actually not exist anymore
        if (bezeichnung == "nicht besetzt" ) {
            continue
        }

        // aka Positionsnummer (Pos.-Nr): No dot between Art and Produkt
        const itemNo = gruppe + "." + ort + "." + untergruppe + "." + art + produkt

        result.push({
            itemNo: itemNo,
            label: bezeichnung ?? undefined,
            manufacturer: hersteller ?? undefined
        })
    }
    return result
}