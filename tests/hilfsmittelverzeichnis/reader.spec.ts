import read from "../../src/hilfsmittelverzeichnis/reader"
import { writeFileSync, readFileSync } from "fs"

describe("read hilfsmittelverzeichnis", () => {

    it("ignores products that are \"nicht besetzt\"", () => {
        expect(read(`
        <hv:HMV logische_version="1.0.0"
            xmlns:GI4X-basis="GI4X:/xml-schema/GI4X-basis/2.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema" xmlns:hv="GI4X:/xml-schema/ESOL-HMV/1.0">
            <hv:HMV_PRODUKT>
                <hv:GRUPPE>99</hv:GRUPPE>
                <hv:ORT>99</hv:ORT>
                <hv:UNTERGRUPPE>3</hv:UNTERGRUPPE>
                <hv:ART>0</hv:ART>
                <hv:PRODUKT>2</hv:PRODUKT>
                <hv:BEZEICHNUNG>nicht besetzt</hv:BEZEICHNUNG>
            </hv:HMV_PRODUKT>
        </hv:HMV>`).products).toHaveLength(0)
    })

    it("reads products", () => {
        expect(read(`
        <hv:HMV logische_version="1.0.0"
            xmlns:GI4X-basis="GI4X:/xml-schema/GI4X-basis/2.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema" xmlns:hv="GI4X:/xml-schema/ESOL-HMV/1.0">
            <hv:HMV_PRODUKT>
                <hv:GRUPPE>99</hv:GRUPPE>
                <hv:ORT>22</hv:ORT>
                <hv:UNTERGRUPPE>3</hv:UNTERGRUPPE>
                <hv:ART>0</hv:ART>
                <hv:PRODUKT>2</hv:PRODUKT>
                <hv:BEZEICHNUNG>Wir bauen uns ein Atomkraftwerk</hv:BEZEICHNUNG>
                <hv:HERSTELLER>Vattenfall</hv:HERSTELLER>
            </hv:HMV_PRODUKT>
            <hv:HMV_PRODUKT>
                <hv:GRUPPE>12</hv:GRUPPE>
                <hv:ORT>45</hv:ORT>
                <hv:UNTERGRUPPE>6</hv:UNTERGRUPPE>
                <hv:ART>7</hv:ART>
                <hv:PRODUKT>8910</hv:PRODUKT>
                <hv:BEZEICHNUNG>Saugblaser Heinzelmann</hv:BEZEICHNUNG>
            </hv:HMV_PRODUKT>
        </hv:HMV>`).products).toEqual([
            {
                groupId: 99,
                bodyPartId: 22,
                subgroupId: 3,
                typeId: 0,
                productId: 2,
                label: "Wir bauen uns ein Atomkraftwerk",
                manufacturer: "Vattenfall"
            }, {
                groupId: 12,
                bodyPartId: 45,
                subgroupId: 6,
                typeId: 7,
                productId: 8910,
                label: "Saugblaser Heinzelmann",
            }
        ])
    })

    it("reads groups", () => {
        expect(read(`
        <hv:HMV logische_version="1.0.0"
        xmlns:GI4X-basis="GI4X:/xml-schema/GI4X-basis/2.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema" xmlns:hv="GI4X:/xml-schema/ESOL-HMV/1.0">
            <hv:HMV_GRUPPE>
                <hv:GRUPPE>1</hv:GRUPPE>
                <hv:BEZEICHNUNG>Absauggeräte</hv:BEZEICHNUNG>
            </hv:HMV_GRUPPE>
        </hv:HMV>`).groups).toEqual([
            {
                groupId: 1,
                label: "Absauggeräte"
            }
        ])
    })

    it("reads body parts", () => {
        expect(read(`
        <hv:HMV logische_version="1.0.0"
        xmlns:GI4X-basis="GI4X:/xml-schema/GI4X-basis/2.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema" xmlns:hv="GI4X:/xml-schema/ESOL-HMV/1.0">
            <hv:HMV_ORT>
                <hv:ORT>1</hv:ORT>
                <hv:BEZEICHNUNG>Vor- und Mittelfuß</hv:BEZEICHNUNG>
            </hv:HMV_ORT>
        </hv:HMV>`).bodyParts).toEqual([
            {
                bodyPartId: 1,
                label: "Vor- und Mittelfuß"
            }
        ])
    })

    it("reads subgroups", () => {
        expect(read(`
        <hv:HMV logische_version="1.0.0"
        xmlns:GI4X-basis="GI4X:/xml-schema/GI4X-basis/2.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema" xmlns:hv="GI4X:/xml-schema/ESOL-HMV/1.0">
            <hv:HMV_UNTERGRUPPE>
                <hv:GRUPPE>2</hv:GRUPPE>
                <hv:ORT>10</hv:ORT>
                <hv:UNTERGRUPPE>1</hv:UNTERGRUPPE>
                <hv:BEZEICHNUNG>Armunterstützungssysteme</hv:BEZEICHNUNG>
            </hv:HMV_UNTERGRUPPE>
        </hv:HMV>`).subgroups).toEqual([
            {
                groupId: 2,
                bodyPartId: 10,
                subgroupId: 1,
                label: "Armunterstützungssysteme"
            }
        ])
    })

    it("reads types", () => {
        expect(read(`
        <hv:HMV logische_version="1.0.0"
        xmlns:GI4X-basis="GI4X:/xml-schema/GI4X-basis/2.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema" xmlns:hv="GI4X:/xml-schema/ESOL-HMV/1.0">
            <hv:HMV_ART>
                <hv:GRUPPE>7</hv:GRUPPE>
                <hv:ORT>50</hv:ORT>
                <hv:UNTERGRUPPE>1</hv:UNTERGRUPPE>
                <hv:ART>3</hv:ART>
                <hv:BEZEICHNUNG>Mehrteilige Langstöcke: Telefaltstöcke</hv:BEZEICHNUNG>
            </hv:HMV_ART>
        </hv:HMV>`).types).toEqual([
            {
                groupId: 7,
                bodyPartId: 50,
                subgroupId: 1,
                typeId: 3,
                label: "Mehrteilige Langstöcke: Telefaltstöcke"
            }
        ])
    })

    
    // need to put the XML to read into the main directory, then have a lot of patience (8 mins). This
    // could be faster if the implementation would be rewritten to use a stream parser and the file 
    // reader API would output a stream instead of a string, but reading this XML is not likely
    // done very often
    /*
    it("read xml", () => {
        const xml = readFileSync("20210521_HMV.xml", "utf-8")
        const list = read(xml)
        writeFileSync("dist/hilfsmittelverzeichnis.json", JSON.stringify(list, undefined, 2))
        writeFileSync("dist/hilfsmittelverzeichnis.min.json", JSON.stringify(list))
    })
    */
})
