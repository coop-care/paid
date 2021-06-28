export type Hilfsmittelverzeichnis = {
    groups: HilfsmittelGroup[],
    bodyParts: HilfsmittelBodyPart[],
    subgroups: HilfsmittelSubgroup[],
    types: HilfsmittelType[],
    products: HilfsmittelProduct[]
}

export type HilfsmittelGroup = {
    groupId: number,
    label?: string
}

/** Where the appliances is applied */
export type HilfsmittelBodyPart = {
    bodyPartId: number,
    label?: string
}

export type HilfsmittelSubgroup = {
    groupId: number,
    bodyPartId: number,
    subgroupId: number,
    label?: string
}

export type HilfsmittelType = {
    groupId: number,
    bodyPartId: number,
    subgroupId: number,
    typeId: number,
    label?: string
}


export type HilfsmittelProduct = {
    groupId: number,
    bodyPartId: number,
    subgroupId: number,
    typeId: number,
    productId: number,
    label?: string,
    manufacturer?: string
}

/** Returns the Positionsnummer (aka Pos.-Nr.) of a Hilfsmittel product */
export function getPositionsnummer(product: HilfsmittelProduct) : string {
    // yes, there is no dot between Art and Produkt
    return product.groupId + "." + product.bodyPartId + "." + product.subgroupId + "." + product.typeId + product.productId
}
