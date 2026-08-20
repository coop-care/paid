import { 
    AbrechnungscodeEinzelschluessel as SGBVAbrechnungscodeEinzelschluessel, 
    AbrechnungscodeGruppenschluessel, abrechnungscodeGruppenschluessel, 
    getAbrechnungscodeEinzelschluessel
} from "../sgb-v/codes";
import { 
    LeistungsartSchluessel as SGBXILeistungsartSchluessel
} from "../sgb-xi/codes";
import { DatenlieferungsartSchluessel, LeistungserbringergruppeSchluessel } from "./edifact/codes";
import { KassenartSchluessel } from "./filename/codes";
import { 
    CareProviderLocationSchluessel,
    Institution,
    InstitutionLink,
    InstitutionList
} from "./types";
import { Certificate } from '@peculiar/asn1-x509'
import { AsnSerializer } from "@peculiar/asn1-schema"
import { Certificate as PkiCertificate } from 'pkijs'
import { toUTC } from "../formatter";


/** Result of a InstitutionListsIndex::findForPaper query */
export type KostentraegerForPaperFindResult = {
    /** Information of the institution with the IK given as krankenkasseIK parameter in the find function */
    krankenkasse: Institution,
    /** Information on the instutition which shall be the Kostenträger of this document */
    kostentraeger: Institution,
    /** Information on the institutions to which the document could be sent depending on transmission type */
    papierannahmestellen: Partial<Record<DatenlieferungsartSchluessel, Institution>>,
    /** The statutory health insurance group the given krankenkasseIK belongs to */
    kassenart: KassenartSchluessel,
}

/** Result of a InstitutionListsIndex::findForData query */
export type KostentraegerForDataFindResult = Omit<KostentraegerForPaperFindResult, "papierannahmestellen"> & {
    /** Information on the institution to which the invoices shall be sent */
    sendTo: Institution,
    /** Information on the institution for which the invoices shall be encrypted */
    encryptTo: Institution,
    /** certificate to be used for encryption when using SMTP and not KIM */
    certificate: Uint8Array | null,
    /** Information on the institutions to which the document could be sent depending on transmission type */
    papierannahmestellen: Partial<Record<"21" | "28", Institution>>,
    /** Information on the institution to which the invoices shall be sent via KIM */
    kimTo: Institution | null,
}

export type Leistungsart = SGBXILeistungsart | SGBVAbrechnungscode
export type SGBXILeistungsart = { sgbxiLeistungsart: SGBXILeistungsartSchluessel }
export type SGBVAbrechnungscode = { sgbvAbrechnungscode: SGBVAbrechnungscodeEinzelschluessel }

type InstitutionListWithValidityStartDate = {
    validityStartDate: Date,
    institutions: Institution[]
}

/** An index to find Kostenträger information for Pflegedienstleister and sonstige Dienstleister */
export class InstitutionListsIndex {

    /* The lists are deliberately not merged together because it is neither invalid nor unrealistic
       that one and the same institution is mentioned in different Kostenträger files, each with 
       different links and maybe other data too.
       For example, the companies Telekom and Bitmarck are Datenannahmestellen (=data 
       acceptance offices) for multiple health care insurances.
     */

    private index = new Map<LeistungserbringergruppeSchluessel,
                            Map<KassenartSchluessel, InstitutionListWithValidityStartDate[]>
                           >()
    caCertificates = new Map<LeistungserbringergruppeSchluessel, PkiCertificate[]>()

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

            if (!this.caCertificates.has(leGruppe)) {
                this.caCertificates.set(leGruppe, institutionList.caCertificates)
            }
        })
    }

    getByIK(
        ik: string, 
        leGruppe: LeistungserbringergruppeSchluessel, 
        date: Date = new Date()
    ): Institution & { kassenart: KassenartSchluessel } | undefined {
        const forLEGruppe = this.index.get(leGruppe)

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

            // create map of IK -> Institution with only institutions that are valid at the given date
            const institutionsIndex = getValidInstitutionsIndex(institutions, date)

            const krankenkasse = institutionsIndex.get(ik)

            if (krankenkasse) {
                return { ...krankenkasse, kassenart };
            }
        }
    }

    
    /** Find information on the Kostenträger for sending the given paper data type
     * 
     * @param krankenkasseIK 9-digit "Institutionskennzeichen" of the care insurance of the insuree
     * 
     * @param leistungsart Type of health care service provided. Either a health care service type 
     *                     (Leistungsart) from SGB XI or one from SGB V (Abrechnungscode).
     * 
     * @param location Location of the health care service provider
     * 
     * @param date Date at which the receipt should be sent. Optional, defaults to now. Some
     *             institutions given in the Kostenträger files have a validity date range (as well
     *             as the certificates used for encryption).
     */
    findForPaper(
        krankenkasseIK: string,
        leistungsart: Leistungsart,
        location: CareProviderLocationSchluessel,
        date: Date = new Date()
    ): KostentraegerForPaperFindResult | undefined {
        return this.find(krankenkasseIK, leistungsart, location, [], date, (
                krankenkasse: Institution,
                kostentraeger: Institution,
                institutionsIndex: Map<string, Institution>,
                kassenart: KassenartSchluessel,
            ) => {
                const papierannahmestellen = findPapierannahmestellen(kostentraeger, institutionsIndex, leistungsart, location)
    
                return {
                    krankenkasse,
                    kostentraeger,
                    papierannahmestellen,
                    kassenart
                }
            }
        )
    }

    
    /** Find information on the Kostenträger for sending data
     * 
     * @param krankenkasseIK 9-digit "Institutionskennzeichen" of the care insurance of the insuree
     * 
     * @param leistungsart Type of health care service provided. Either a health care service type 
     *                     (Leistungsart) from SGB XI or one from SGB V (Abrechnungscode).
     * 
     * @param location Location of the health care service provider
     * 
     * @param supportedTransmissionTypes prioritized list of supported methods for data transfer ("Art der Datenlieferung")
     * 
     * @param date Date at which the receipt should be sent. Optional, defaults to now. Some
     *             institutions given in the Kostenträger files have a validity date range (as well
     *             as the certificates used for encryption).
     */
    findForData(
        krankenkasseIK: string,
        leistungsart: Leistungsart,
        location: CareProviderLocationSchluessel,
        supportedTransmissionTypes: DatenlieferungsartSchluessel[] = ["07"],
        date: Date = new Date()
    ): KostentraegerForDataFindResult | undefined {
        return this.find(krankenkasseIK, leistungsart, location, supportedTransmissionTypes, date, (
                krankenkasse: Institution,
                kostentraeger: Institution,
                institutionsIndex: Map<string, Institution>,
                kassenart: KassenartSchluessel,
        ) => {
            let encryptTo: Institution | null = null
            let sendTo: Institution | null = null
            let certificate: Uint8Array | null = null
            let papierannahmestellen: Partial<Record<DatenlieferungsartSchluessel, Institution>> = {}
            let kimTo: Institution | null = null

            if (supportedTransmissionTypes.includes("07")) {
                const datenannahmestelle = findDatenannahmestelle(kostentraeger, institutionsIndex,
                    leistungsart, location)

                if (datenannahmestelle) {
                    encryptTo = datenannahmestelle.encryptTo
                    sendTo = datenannahmestelle.sendTo
                    const certificateInstance = findMostCurrentValidCertificate(encryptTo.certificates || [], date)

                    if (certificateInstance) {
                        certificate = new Uint8Array(AsnSerializer.serialize(certificateInstance))
                    }
                }

                papierannahmestellen = findPapierannahmestellen(kostentraeger, institutionsIndex,
                    leistungsart, location)
                delete papierannahmestellen["24"];
                delete papierannahmestellen["26"];
                delete papierannahmestellen["29"];
            }

            if (supportedTransmissionTypes.includes("30") 
                /* KIM is currently only used by Ambulante Pflegedienste for SGB XI Leistungen of
                   Leistungsart 01 (ambulante Pflege), 07 (Verhinderungspflege), 10 (Entlastungsleistung) */
                && (leistungsart as SGBXILeistungsart).sgbxiLeistungsart
                && ["00", "01", "07", "10"].includes((leistungsart as SGBXILeistungsart).sgbxiLeistungsart))
            {
                kimTo = findKIMAnnahmestelle(kostentraeger, institutionsIndex, leistungsart, location) || null
            }

            if (!encryptTo || !sendTo || !certificate) {
                if (kimTo) {
                    sendTo = encryptTo = kimTo
                } else {
                    return
                }
            }
            
            return {
                krankenkasse,
                kostentraeger,
                encryptTo: encryptTo!,
                sendTo: sendTo!,
                kimTo,
                certificate,
                kassenart,
                papierannahmestellen,
            }
        })
    }

    getValidCertificate(institution: Institution, date = new Date()) {
        const certificateInstance = findMostCurrentValidCertificate(institution.certificates || [], date)

        if (certificateInstance) {
            return new Uint8Array(AsnSerializer.serialize(certificateInstance))
        } else {
            return undefined;
        }
    }

    private find<T>(
        krankenkasseIK: string,
        leistungsart: Leistungsart,
        location: CareProviderLocationSchluessel,
        supportedTransmissionTypes: DatenlieferungsartSchluessel[],
        date: Date = new Date(),
        block: (
            krankenkasseIK: Institution,
            kostentraeger: Institution,
            institutionsIndex: Map<string, Institution>,
            kassenart: KassenartSchluessel,
        ) => T | undefined
    ): T | undefined {
        /* only comb through those which are for the right Leistungserbringergruppe */
        const leGruppe = leistungsartToLeistungserbringergruppeSchluessel(leistungsart)
        const forLEGruppe = this.index.get(leGruppe)

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

            // create map of IK -> Institution with only institutions that are valid at the given date
            const institutionsIndex = getValidInstitutionsIndex(institutions, date)

            let krankenkasse = institutionsIndex.get(krankenkasseIK)

            /* In most cases, Pflegekasse IK is the same as Krankenkasse IK, except for the first 
                two digits where Krankenkasse starts with 10 and Pflegekasse start with 18. 
                So if Krankenkasse IK cannot be found in institutionsIndex for SGB XI (LE-Gruppe 6)
                or if it does not have kostentraegerLinks, it can most likely be found when we 
                change the first two digits to 18. */
            if (leGruppe == "6" 
                && krankenkasseIK.startsWith("10") 
                && (!krankenkasse || !krankenkasse.kostentraegerLinks?.length)
                && institutionsIndex.get(`18${krankenkasseIK.slice(2)}`)
            ) {
                krankenkasse = institutionsIndex.get(`18${krankenkasseIK.slice(2)}`)
            }

            if (!krankenkasse) {
                continue
            }

            let kostentraeger = findKostentraeger(krankenkasse, institutionsIndex, leistungsart, 
                location, supportedTransmissionTypes)
            
            /* for some cases with SGB XI (LE-Gruppe 6), we determine the Pflegekasse IK by 
               following kostentraegerLinks */
            if (leGruppe == "6" && krankenkasse.ik.startsWith("10") && kostentraeger.ik.startsWith("18")) {
                krankenkasse = kostentraeger
            }

            return block(krankenkasse, kostentraeger, institutionsIndex, kassenart)
        }
    }
}

function findMostCurrentValidCertificate(certificates: Certificate[], date: Date): Certificate | undefined {
    const utcDate = toUTC(date)
    let result: Certificate | undefined = undefined
    let mostCurrentValidityToDate = toUTC(new Date(0)) // 1970
    certificates.forEach(certificate => {
        const cert = certificate.tbsCertificate
        const validityFrom = cert.validity.notBefore.getTime()
        const validityTo = cert.validity.notAfter.getTime()
        if (validityFrom < utcDate && validityTo > utcDate) {
            if (mostCurrentValidityToDate < validityTo) {
                mostCurrentValidityToDate = validityTo
                result = certificate
            }
        }
    })
    return result
}

/** Finds the index of the entry in the given lists that has the most current valid date that is
 *  at the same time already valid at the given date.
 */
function findMostCurrentValidInstitutionList(lists: InstitutionListWithValidityStartDate[], date: Date): Institution[] | undefined {
    let result: Institution[] | undefined = undefined
    let mostCurrentValidityStartDate = new Date(0) // 1970
    lists.forEach(list => {
        if (list.validityStartDate <= date && list.validityStartDate > mostCurrentValidityStartDate) {
            result = list.institutions
            mostCurrentValidityStartDate = list.validityStartDate
        }
    })
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

/** Find the Kostenträger for the given Krankenkasse and the given parameters for the health care
 *  service provider in the given list of institutions. */
function findKostentraeger(
    krankenkasse: Institution,
    institutions: Map<string, Institution>,
    leistungsart: Leistungsart,
    location: CareProviderLocationSchluessel,
    supportedTransmissionTypes: DatenlieferungsartSchluessel[],
): Institution {

    let kostentraegerList: Institution[] = [krankenkasse]

    /** We need to recursively follow all Kostenträger links. This is not really documented,
        but this is how some Kostenträger are de-facto linked. At time of writing (2021-05), 
        the Kostenträgerdatei for BKK contains these kind of redirecting links. */
    while( true ) {
        const currentKostentraeger = kostentraegerList.at(-1)!
        const firstApplicableKostentraegerLink = findApplicableInstitutionLinks(
            currentKostentraeger.kostentraegerLinks, leistungsart, location, supportedTransmissionTypes
        )[0]
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
    return kostentraegerList.at(-1)!
}

/** Given a kostenträger, finds to which institution the data should be sent via DTA and to which 
 *  institution it should be encrypted to. (Almost always but not always the same)
 */
function findDatenannahmestelle(
    kostentraeger: Institution,
    institutions: Map<string, Institution>,
    leistungsart: Leistungsart,
    location: CareProviderLocationSchluessel,
): { sendTo: Institution, encryptTo: Institution } | undefined {
    const encryptToLink = findApplicableInstitutionLinks(
        kostentraeger.datenannahmestelleLinks, leistungsart, location, ["07"]
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
    if (encryptTo.transmissionEmail) {
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
            encryptTo.untrustedDatenannahmestelleLinks, leistungsart, location, ["07"]
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
        sendTo,
        encryptTo
    }
}

/** Given a kostenträger, finds to which institution the data should be sent via KIM.
 */
function findKIMAnnahmestelle(
    kostentraeger: Institution,
    institutions: Map<string, Institution>,
    leistungsart: Leistungsart,
    location: CareProviderLocationSchluessel,
): Institution | undefined {
    const kimToLink = findApplicableInstitutionLinks(
        kostentraeger.datenannahmestelleLinks, leistungsart, location, ["30"]
    )[0]

    if (!kimToLink) {
        return
    }

    const kimTo = institutions.get(kimToLink.ik)

    if (!kimTo || !kimTo.kim) {
        return
    }

    return kimTo
}

/** Given a kostenträger, finds to which institution the paper should be sent */
function findPapierannahmestellen(
    kostentraeger: Institution,
    institutions: Map<string, Institution>,
    leistungsart: Leistungsart,
    location: CareProviderLocationSchluessel,
): Partial<Record<DatenlieferungsartSchluessel, Institution>> {
    const links = findApplicableInstitutionLinks(kostentraeger.papierannahmestelleLinks, leistungsart, location)

    return links.reduce((result, link) => {
        const institution = institutions.get(link.ik)

        if (institution) {
            link.transmissionTypes?.forEach(type => 
                result[type] = institution
            )
        }
        return result
    }, {} as Partial<Record<DatenlieferungsartSchluessel, Institution>>)
}

/** Return all institution links that match the given parameters of the care provider. See
 *  isInstitutionLinkApplicable for more details */
function findApplicableInstitutionLinks<L extends InstitutionLink>(
    links: L[] | undefined | null,
    leistungsart: Leistungsart,
    location: CareProviderLocationSchluessel,
    supportedTransmissionTypes: DatenlieferungsartSchluessel[] = []
): L[] {
    const result: L[] = []
    if (!links) { return result }

    const supportedLinks = !supportedTransmissionTypes.length
        ? links
        : [
            ...supportedTransmissionTypes.flatMap(type => 
                links.filter(({ transmissionTypes }) => !transmissionTypes || transmissionTypes.includes(type))
            ),
            ...links.filter(({ transmissionTypes }) => !transmissionTypes?.length),
        ]

    for (const link of supportedLinks) {
        if (isInstitutionLinkApplicable(link, leistungsart, location, false)) {
            result.push(link)
        }
    }

    // and another iteration if nothing was found, to cover link.leistungsart = "99"
    if (result.length == 0) {
        for (const link of supportedLinks) {
            if (isInstitutionLinkApplicable(link, leistungsart, location, true)) {
                result.push(link)
            }
        }
    }

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
