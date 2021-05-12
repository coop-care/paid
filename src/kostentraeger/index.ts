import { 
    AbrechnungscodeEinzelschluessel as SGBVAbrechnungscodeEinzelschluessel, 
    AbrechnungscodeGruppenschluessel, abrechnungscodeGruppenschluessel, 
    getAbrechnungscodeEinzelschluessel
} from "../sgb-v/codes";
import { 
    LeistungsartSchluessel as SGBXILeistungsartSchluessel
} from "../sgb-xi/codes";
import { LeistungserbringergruppeSchluessel } from "./edifact/codes";
import { KassenartSchluessel } from "./filename/codes";
import { 
    CareProviderLocationSchluessel,
    Institution,
    InstitutionLink,
    InstitutionList,
    PapierannahmestelleLink
} from "./types";


/** Result of a KostentraegerIndex::find* query */
export type KostentraegerFindResult = {
    /** Information of the institution with the IK given as pflegekasseIK parameter in the find function */
    pflegekasse: Institution,
    /** Information on the instutition which shall be the Kostenträger of this receipt */
    kostentraeger: Institution,
    /** Information on the institution for which the receipt shall be encrypted */
    encryptTo?: Institution,
    /** Information on the institution to which the receipt shall be sent */
    sendTo: Institution 
}

export type Leistungsart = SGBXILeistungsart | SGBVAbrechnungscode
export type SGBXILeistungsart = { sgbxiLeistungsart: SGBXILeistungsartSchluessel }
export type SGBVAbrechnungscode = { sgbvAbrechnungscode: SGBVAbrechnungscodeEinzelschluessel }

export type PaperBasedDataType = 
    "paperReceipt" | 
    "machineReadablePaperReceipt" |
    "prescription" |
    "costEstimate"

type InstitutionListWithValidityStartDate = {
    validityStartDate: Date,
    institutions: Institution[]
}

/** An index to find Kostenträger information for Pflegedienstleister and sonstige Dienstleister */
export class KostentraegerIndex {

    /* The lists are deliberately not merged together because it is neither invalid nor unrealistic
       that one and the same institution is mentioned in different Kostenträger files, each with 
       different links and maybe other data too.
       For example, the companies Telekom and Bitmarck are Datenannahmestellen (=data 
       acceptance offices) for multiple health care insurances.
     */

    private index = new Map<LeistungserbringergruppeSchluessel,
                            Map<KassenartSchluessel, InstitutionListWithValidityStartDate[]>
                           >()

    constructor(institutionLists: InstitutionList[]) {
        institutionLists.forEach((institutionList) => {
            const leGruppe = institutionList.leistungserbringerGruppeSchluessel
            const kassenart = institutionList.kassenart
            // lazily create those maps...
            if (!this.index.has(leGruppe)) {
                this.index.set(leGruppe, new Map<KassenartSchluessel, InstitutionListWithValidityStartDate[]>())
            }
            const institutionListForLeGruppe = this.index.get(leGruppe)!
            if (!institutionListForLeGruppe.has(kassenart)) {
                institutionListForLeGruppe.set(kassenart, [])
            }
            const institutionListForKassenart = institutionListForLeGruppe.get(kassenart)!
            institutionListForKassenart.push({
                validityStartDate: institutionList.validityStartDate,
                institutions: institutionList.institutions,
            })
        })
    }

    private findFirst<T>(
        leistungserbringergruppeSchluessel: LeistungserbringergruppeSchluessel,
        date: Date,
        block: (institutions: Map<string, Institution>) => T | undefined
    ): T | undefined {
        /* only comb through those which are for the right Leistungserbringergruppe */
        const forLEGruppe = this.index.get(leistungserbringergruppeSchluessel)
        if (!forLEGruppe) {
            return
        }

        for (const [kassenart, institutionLists] of forLEGruppe) {
            /* exclude institution lists that are not valid yet and if several valid ones are 
               available, take only the most current one that is already valid */
            const institutions = findMostCurrentValidInstitutionList(institutionLists, date)
            if (!institutions) {
                continue
            }

            for (const institutionList of institutionLists) {
                // create map of IK -> Institution with only institutions that are valid at the given date
                const institutionsIndex = getValidInstitutionsIndex(institutionList.institutions, date)
                const result = block(institutionsIndex)
                if (result !== undefined) {
                    return result
                }
            }
        }
    }

    /** Find information on the Kostenträger for sending digital data
     * 
     * @param pflegekasseIK 9-digit "Institutionskennzeichen" of the care insurance of the insuree
     * 
     * @param leistungsart Type of health care service provided. Either a health care service type 
     *        (Leistungsart) from SGB XI or a from SGB V (Abrechnungscode).
     * 
     * @param location Location of the health care service provider
     * 
     * @param date Date at which the receipt should be sent. Optional, defaults to now. Some
     *        institutions given in the Kostenträger files have a validity date range.
    */
    findForData(
        pflegekasseIK: string,
        leistungsart: Leistungsart,
        location: CareProviderLocationSchluessel,
        date: Date = new Date()
    ): KostentraegerFindResult | undefined {

        const leGruppe = leistungsartToLeistungserbringergruppeSchluessel(leistungsart)
        return this.findFirst(leGruppe, date, (institutions => {
            const pflegekasse = institutions.get(pflegekasseIK)
            if (!pflegekasse) {
                return
            }

            const kostentraeger = findKostentraeger(pflegekasse, institutions, leistungsart, location)
            
            const datenannahmestellen = findDatenannahmestelle(kostentraeger, institutions, leistungsart, location)
            if (!datenannahmestellen) {
                return
            }

            return {
                pflegekasse: pflegekasse,
                kostentraeger: kostentraeger,
                encryptTo: datenannahmestellen.encryptTo,
                sendTo: datenannahmestellen.sendTo
            }
        }))
    }

    /** Find information on the Kostenträger for sending paper receipts, prescriptions, cost 
     *  estimates etc.
     * 
     * @param paperBasedDataType What shall be sent: paper receipts, prescriptions,... etc
     * 
     * @param pflegekasseIK 9-digit "Institutionskennzeichen" of the care insurance of the insuree
     * 
     * @param leistungsart Type of health care service provided. Either a health care service type 
     *        (Leistungsart) from SGB XI or a from SGB V (Abrechnungscode).
     * 
     * @param location Location of the health care service provider
     * 
     * @param date Date at which the receipt should be sent. Optional, defaults to now. Some
     *        institutions given in the Kostenträger files have a validity date range.
    */
    findForPaper(
        paperBasedDataType: PaperBasedDataType,
        pflegekasseIK: string,
        leistungsart: Leistungsart,
        location: CareProviderLocationSchluessel,
        date: Date = new Date()
    ): KostentraegerFindResult | undefined {

        const leGruppe = leistungsartToLeistungserbringergruppeSchluessel(leistungsart)
        return this.findFirst(leGruppe, date, (institutions => {
            const pflegekasse = institutions.get(pflegekasseIK)
            if (!pflegekasse) {
                return
            }

            const kostentraeger = findKostentraeger(pflegekasse, institutions, leistungsart, location)

            const sendTo = findPapierannahmestelle(kostentraeger, institutions, paperBasedDataType, leistungsart, location)
            if (!sendTo) {
                return
            }

            return {
                pflegekasse: pflegekasse,
                kostentraeger: kostentraeger,
                sendTo: sendTo
            }
        }))
    }
}

/** Finds the index of the entry in the given lists that has the most current valid date that is
 *  at the same time already valid at the given date.
 */
function findMostCurrentValidInstitutionList(lists: InstitutionListWithValidityStartDate[], date: Date): Institution[] | undefined {
    let result: Institution[] | undefined = undefined
    let mostCurrentValidityStartDate: Date | undefined
    for (let i = 0; i < lists.length; i++) {
        const list = lists[i]
        if (list.validityStartDate < date) {
            if (!mostCurrentValidityStartDate || list.validityStartDate > mostCurrentValidityStartDate) {
                result = list.institutions
                mostCurrentValidityStartDate = list.validityStartDate
            }
        }
    }
    return result
}

function leistungsartToLeistungserbringergruppeSchluessel(leistungsart: Leistungsart): LeistungserbringergruppeSchluessel {
    if ((leistungsart as SGBVAbrechnungscode).sgbvAbrechnungscode) {
        return "5"
    } else if ((leistungsart as SGBXILeistungsart).sgbxiLeistungsart) {
        return "6"
    } else {
        // should not be possible
        throw new Error()
    }
}

/** Returns a map of the given institutions associated by IK, but only those that are valid at the
 *  given date
 */
 function getValidInstitutionsIndex(institutions: Institution[], date: Date): Map<string, Institution> {
    const institutionsIndex = new Map<string, Institution>()
    institutions.forEach((institution) => {
        if (
            (!institution.validityFrom || institution.validityFrom < date) && // already valid
            (!institution.validityTo || institution.validityTo > date) // and still valid
        ) {
            institutionsIndex.set(institution.ik, institution)
        }
    })
    return institutionsIndex
}

/** Find the Kostenträger for the given Pflegekasse and the given parameters for the health care
 *  service provider in the given list of institutions. */
function findKostentraeger(
    pflegekasse: Institution,
    institutions: Map<string, Institution>,
    leistungsart: Leistungsart,
    location: CareProviderLocationSchluessel
): Institution {

    let firstApplicableKostentraegerLink = findApplicableInstitutionLinks(
        pflegekasse.kostentraegerLinks, leistungsart, location
    )[0]
    let kostentraegerList: Institution[] = [pflegekasse]

    /** We need to recursively follow all Kostenträger links. This is not really documented,
        but this is how some Kostenträger are de-facto linked. At time of writing (2021-05), 
        the Kostenträgerdatei for BKK contains these kind of redirecting links. */
    while( true ) {
        /* if no (further) link is specified, assume that this is the Kostenträger then. Not
           really documented but this is actually used by some health insurances */
        if (!firstApplicableKostentraegerLink) {
            break
        }
        /* links to self (this is done by almost all) or any more complex circular links 
           (f.e. Kostenträger A links to Kostenträger B, Kostenträger B links back to A) should not
           be followed. */
        const nextLinkIsCircular = kostentraegerList.some(
            (kostentraeger) => kostentraeger.ik == firstApplicableKostentraegerLink.ik
        )
        if (nextLinkIsCircular) {
            break
        }

        const kostentraeger = institutions.get(firstApplicableKostentraegerLink.ik)
        if (!kostentraeger) {
            break
        }
        kostentraegerList.push(kostentraeger)
    }
    return kostentraegerList[kostentraegerList.length - 1]!
}

/** Given a kostenträger, finds to which institution the data should be sent and to which 
 *  institution is should be encrypted to. (Almost always but not always the same)
 */
 function findDatenannahmestelle(
    kostentraeger: Institution,
    institutions: Map<string, Institution>,
    leistungsart: Leistungsart,
    location: CareProviderLocationSchluessel
): { sendTo: Institution, encryptTo: Institution } | undefined {

    const encryptToLink = findApplicableInstitutionLinks(
        kostentraeger.datenannahmestelleLinks, leistungsart, location
    )[0]
    if (!encryptToLink) {
        return
    }
    const encryptTo = institutions.get(encryptToLink.ik)
    if (!encryptTo) {
        return
    }

    // Step 3: Find if Datenannahmestelle has decryption authority and handle it if not
    let sendTo: Institution | undefined
    if (encryptTo.transmissionMethods?.email || !encryptTo.transmissionMethods?.ftam) {
        /* if it accepts data itself, that's great! 
           The documentation is making it
           sound that even if this institution accepts data directly, one should look
           if any linked institution that is not able to decrypt it can accept the data 
           too and send it there. Doesn't make a lot of sense though and it is not clear
           if this is what the health insurances actually want, so let's first take
           the easy route here */
        sendTo = encryptTo
    } else {
        const sendToLink = findApplicableInstitutionLinks(
            encryptTo.untrustedDatenannahmestelleLinks, leistungsart, location
            )[0]
        if (!sendToLink) {
            return
        }
        sendTo = institutions.get(sendToLink.ik)
    }
    if (!sendTo) {
        return
    }
    return {
        sendTo: sendTo,
        encryptTo: encryptTo
    }
}

/** Given a kostenträger, finds to which institution the paper should be sent */
function findPapierannahmestelle(
    kostentraeger: Institution,
    institutions: Map<string, Institution>,
    paperBasedDataType: PaperBasedDataType,
    leistungsart: Leistungsart,
    location: CareProviderLocationSchluessel,
): Institution | undefined {

    const links = findApplicableInstitutionLinks(kostentraeger.papierannahmestelleLinks, leistungsart, location)
    const firstApplicableLink = filterPapierannahmestelleLinksByDataType(paperBasedDataType, links)[0]
    if (!firstApplicableLink) {
        return
    }

    return institutions.get(firstApplicableLink.ik)
}

function filterPapierannahmestelleLinksByDataType(
    paperBasedDataType: PaperBasedDataType,
    annahmestellen: PapierannahmestelleLink[]
): PapierannahmestelleLink[] {
    switch(paperBasedDataType) {
        case "paperReceipt":                return annahmestellen.filter(it => it.paperReceipt)
        case "machineReadablePaperReceipt": return annahmestellen.filter(it => it.machineReadablePaperReceipt)
        case "costEstimate":                return annahmestellen.filter(it => it.costEstimate)
        case "prescription":                return annahmestellen.filter(it => it.prescription)
    }
}


/** Return all institution links that match the given parameters of the care provider. See
 *  isInstitutionLinkApplicable for more details */
function findApplicableInstitutionLinks<L extends InstitutionLink>(
    links: L[],
    leistungsart: Leistungsart,
    location: CareProviderLocationSchluessel
): L[] {
    const result: L[] = []
    for (const link of links) {
        if (isInstitutionLinkApplicable(link, leistungsart, location, false)) {
            result.push(link)
        }
    }
    // and another iteration if nothing was found, to cover link.leistungsart = "99"
    if (result.length == 0) {
        for (const link of links) {
            if (isInstitutionLinkApplicable(link, leistungsart, location, true)) {
                result.push(link)
            }
        }
    }
    /* The documentation mentions that if several institutions would be applicable according to the
       filter criteria, the health care service provider should communicate only with the regional
       one that is closest to him. So, let's sort so that those that require a location are first */
    result.sort((a, b) => +!!b.location - +!!a.location)

    return result
}

/** Return whether the given link to an institution is applicable to the given parameters of the 
 *  care provider: The type of health care service provided and the location of the health care
 *  service provider.
 *  
 *  @param noOtherLeistungsartApplies should be true if the list of links have been iterated once
 *         already and no link was found because in that case, the link.leistungsart = "99" would be 
 *         applicable to any provided leistungsart
 */
function isInstitutionLinkApplicable(
    link: InstitutionLink,
    leistungsart: Leistungsart,
    location: CareProviderLocationSchluessel,
    noOtherLeistungsartApplies: boolean
): boolean {
    // check if institution has no authority over where the care provider is located
    if (link.location) {
        if (link.location == "NW") {
            if (!["Nordrhein", "Westfalen-Lippe"].includes(location)) {
                return false
            }
        } else if (link.location != location) {
            return false
        }
    }
    /* check if institution processes receipts from the type of health care service that has been
       provided as a parameter */
    if (link.sgbxiLeistungsart) {
        const sgbxiLeistungsart = (leistungsart as SGBXILeistungsart).sgbxiLeistungsart
        if (!sgbxiLeistungsart) {
            return false
        }
        
        if (link.sgbxiLeistungsart == "99") { // "99" = all that were not mentioned
            if (!noOtherLeistungsartApplies) {
                return false
            }
        } else if (link.sgbxiLeistungsart != "00") { // "00" = any    
            if (link.sgbxiLeistungsart != sgbxiLeistungsart) {
                return false
            }
        }
    }
    if (link.sgbvAbrechnungscode) {
        const sgbvAbrechnungscode = (leistungsart as SGBVAbrechnungscode).sgbvAbrechnungscode
        if (!sgbvAbrechnungscode) {
            return false
        }
        if (link.sgbvAbrechnungscode == "99") { // "99" = all that were not mentioned
            if (!noOtherLeistungsartApplies) {
                return false
            }
        } else if(link.sgbvAbrechnungscode != "00") { // "00" = any
            // some Abrechnungscodes are groups, that encompass multiple single codes
            const isGroup = abrechnungscodeGruppenschluessel.hasOwnProperty(link.sgbvAbrechnungscode)
            if (isGroup) {
                const einzelschluessel = getAbrechnungscodeEinzelschluessel(link.sgbvAbrechnungscode as AbrechnungscodeGruppenschluessel)
                if (!einzelschluessel.includes(sgbvAbrechnungscode)) {
                    return false
                }
            } else {
                if (link.sgbvAbrechnungscode != sgbvAbrechnungscode) {
                    return false
                }
            }
        }
    }
    return true
}
