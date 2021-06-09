import { IKPublicKeyInfo } from "./types";

/** An index of public keys by IK (Institutionskennzeichen) */
export class IKPublicKeyIndex {
    /** There may be several public keys for one IK with overlapping validity date ranges */
    private index = new Map<string, IKPublicKeyInfo[]>()

    constructor(pkeys: IKPublicKeyInfo[]) {
        pkeys.forEach((pkey) => {
            if (!this.index.has(pkey.ik)) {
                this.index.set(pkey.ik, [pkey])
            } else {
                this.index.get(pkey.ik)!.push(pkey)
            }
        })
    }

    /** Get the public encryption key (as array buffer) for the given IK and given date (default: now) */
    get(ik: string, date: Date = new Date()): ArrayBuffer | undefined {
        const pkeys = this.index.get(ik)
        if (!pkeys || pkeys.length == 0) {
            return
        }
        const pkey = findMostCurrentValidKey(pkeys, date)
        if (!pkey) {
            return
        }

        return pkey.publicKey
    }
}

function findMostCurrentValidKey(pkeys: IKPublicKeyInfo[], date: Date): IKPublicKeyInfo | undefined {
    let result: IKPublicKeyInfo | undefined = undefined
    let mostCurrentValidityToDate = new Date(0) // 1970
    pkeys.forEach(pkey => {
        if (pkey.validityFrom < date && pkey.validityTo > date) {
            if (mostCurrentValidityToDate < pkey.validityTo ) {
                mostCurrentValidityToDate = pkey.validityTo
                result = pkey
            }
        }
    })
    return result
}
