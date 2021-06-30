import { 
    HilfsmittelBodyPart,
    HilfsmittelGroup,
    HilfsmittelProduct,
    HilfsmittelSubgroup,
    HilfsmittelType,
    Hilfsmittelverzeichnis
} from "./types"

/** Parses a Hilfsmittel- und Pflegehilfsmittelverzeichnis (= catalogue of invoicable therapeutic 
 *  appliances for care providers) from the XML as contained in a ZIP like this:
 *  https://www.gkv-datenaustausch.de/media/dokumente/leistungserbringer_1/sonstige_leistungserbringer/positionsnummernverzeichnisse/20210521_HMV.zip
 *  (The URL changes for each new publication, but the XML schema remains the same of course)
 * 
 *  Does not read all the long explanatory texts but basically just the names and ids
 */
export default function readHilfsmittelverzeichnis(xmlText: string): Hilfsmittelverzeichnis {
    const dom = new DOMParser().parseFromString(xmlText, "text/xml") as XMLDocument
    return {
        groups: readList(dom, "hv:HMV_GRUPPE", readGroup),
        bodyParts: readList(dom, "hv:HMV_ORT", readBodyPart),
        subgroups: readList(dom, "hv:HMV_UNTERGRUPPE", readSubgroup),
        types: readList(dom, "hv:HMV_ART", readType),
        products: readList(dom, "hv:HMV_PRODUKT", readProduct)
    }
}

function readGroup(e: Element) : HilfsmittelGroup | undefined {
    return {
        groupId: parseInt(read(e,"hv:GRUPPE")!),
        label: read(e,"hv:BEZEICHNUNG") ?? undefined
        // not read:
        // optional hv:DEFINITION - free text definition of the group
        // optional hv:INDIKATION - free text when it should/may be used
        // optional hv:QUERVERWEISE - free text with cross references to other groups
    }
}

function readBodyPart(e: Element) : HilfsmittelBodyPart | undefined {
    return {
        bodyPartId: parseInt(read(e, "hv:ORT")!),
        label: read(e, "hv:BEZEICHNUNG")!
    }
}

function readSubgroup(e: Element) : HilfsmittelSubgroup | undefined {
    // "magic word" that means that the entry does actually not exist anymore
    const bezeichnung = read(e, "hv:BEZEICHNUNG")
    if (bezeichnung?.toLowerCase() == "nicht besetzt" ) {
        return
    }
    return {
        groupId: parseInt(read(e,"hv:GRUPPE")!),
        bodyPartId: parseInt(read(e, "hv:ORT")!),
        subgroupId: parseInt(read(e, "hv:UNTERGRUPPE")!),
        label: bezeichnung ?? undefined
        // not read:
        // optional hv:ANFORDERUNGEN - free text requirements (medicinal and technical) for this subgroup
    }
}

function readType(e: Element) : HilfsmittelType | undefined {
    // "magic word" that means that the entry does actually not exist anymore
    const bezeichnung = read(e, "hv:BEZEICHNUNG")
    if (bezeichnung?.toLowerCase() == "nicht besetzt" ) {
        return
    }
    return {
        groupId: parseInt(read(e,"hv:GRUPPE")!),
        bodyPartId: parseInt(read(e, "hv:ORT")!),
        subgroupId: parseInt(read(e, "hv:UNTERGRUPPE")!),
        typeId: parseInt(read(e, "hv:ART")!),
        label: bezeichnung ?? undefined
        // not read:
        // optional hv:BESCHREIBUNG - free text describing what it is
        // optional hv:INDIKATION - free text when it should/may be used
    }
}

function readProduct(e: Element) : HilfsmittelProduct | undefined {
    // "magic word" that means that the entry does actually not exist anymore
    const bezeichnung = read(e, "hv:BEZEICHNUNG")
    if (bezeichnung?.toLowerCase() == "nicht besetzt" ) {
        return
    }
    return {
        groupId: parseInt(read(e,"hv:GRUPPE")!),
        bodyPartId: parseInt(read(e, "hv:ORT")!),
        subgroupId: parseInt(read(e, "hv:UNTERGRUPPE")!),
        typeId: parseInt(read(e, "hv:ART")!),
        productId: parseInt(read(e, "hv:PRODUKT")!),
        label: bezeichnung ?? undefined,
        manufacturer: read(e, "hv:HERSTELLER") ?? undefined
        // not read:
        // optional hv:MERKMALE - free text description
        // optional hv:AUFNAHMEDATUM - date when this entry was created
        // optional hv:AENDERUNGSDATUM - date when this entry was last changed
    }
}

function readList<T>(dom: XMLDocument, name: string, readOne: (e: Element) => T | undefined): T[] {
    const result: T[] = []

    const list = dom.getElementsByTagName(name)
    for (let i = 0; i < list.length; i++) {
        const e = list.item(i)!
        const item = readOne(e)
        if (item) {
            result.push(item)
        }
    }
    return result
}

function read(element: Element, name: string): string | null | undefined {
    return element.getElementsByTagName(name).item(0)?.firstChild?.nodeValue
}
