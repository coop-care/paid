import { RechnungsartSchluessel } from "./codes"
import { InstitutionListsIndex } from "../kostentraeger"
import { TestIndicator } from "../types"
import { entriesGroupedBy, entriesGroupedByAnyKey } from "../utils"
import { LeistungserbringerSammelgruppenSchluessel } from "./codes"
import { 
    BaseAbrechnungsfall,
    Leistungserbringer
} from "./types"
import {
    Institution as KostentraegerInstitution
} from "../kostentraeger/types"
import { Abrechnungsfall } from "./haeuslich/types"
import { groupBySammelgruppe as groupBySammelgruppeHaueslich } from "./haeuslich/message"

/** 
 * # Structure
 * 
 * Depends on Rechnungsart (1,2,3) and Sammelrechnung (yes or no)
 * 
 * ### Rechnungsart 1
 * Used for health care service providers that do accounting themselves, have one Institutionskennzeichen
 * 
 * ```txt
 * for each Kostenträger:
 *   SLGA Sammelrechnung (mandatory if more than one Pflegekasse)
 *   for each Pflegekasse:
 *     SLGA Gesamtrechnung
 *     SLLA
 * ```
 * 
 * ### Rechnungsart 2
 * Used for 
 * - health care service providers that do accounting themselves but have multiple Institutionskennzeichen
 * - accounting centers without collecting power (Abrechnungsstelle ohne Inkassovollmacht)
 * 
 * Same structure as for Rechnungsart 1, only that the invoices for each Leistungserbringer are
 * listed one after another.
 * 
 * ```txt
 * for each Leistungserbringer:
 *   for each Kostenträger:
 *     SLGA Sammelrechnung (mandatory if more than one Pflegekasse)
 *     for each Pflegekasse:
 *       SLGA Gesamtrechnung
 *       SLLA
 * ```
 * 
 * ### Rechnungsart 3
 * Used for accounting centers with collecting power (Abrechnungsstelle mit Inkassovollmacht), i.e.
 * manages accounting for multiple health care service providers (Leistungserbringer).
 * 
 * Note that the structure is different from Rechnungsart 1 and 2. Leistungserbringer are grouped by
 * Kostenträgers, not the other way round!
 * 
 * ```txt
 * for each Kostenträger:
 *   SLGA Sammelrechnung (always mandatory)
 *   for each Leistungserbringer:
 *     for each Pflegekasse:
 *       SLGA Gesamtrechnung
 *       SLLA
 * ```
 */

/** Returns an array of tuples of [Leistungserbringer, Abrechnungsfaelle[]] */
const groupByLeistungserbringer = <T extends BaseAbrechnungsfall>(
    invoices: Invoice<T>[]
): [Leistungserbringer, T[]][] => 
    entriesGroupedByAnyKey(invoices,
        invoice => invoice.leistungserbringer,
        institution => institution.ik
    ).map(([le, invoices]) => [le, invoices.flatMap(invoice => invoice.abrechnungsfaelle)])

/** Returns an array of tuples of [Pflegekasse IK, Abrechnungsfaelle[]] */
const groupByPflegekasseIK = <T extends BaseAbrechnungsfall>(faelle: T[]): [string, T[]][] => 
    entriesGroupedBy(faelle, fall => fall.versicherter.pflegekasseIK)

/** Returns an array of tuples of [Kostentraeger, Abrechnungsfaelle[]] */
const groupByKostentraeger = <T extends BaseAbrechnungsfall>(
    institutionsIndex: InstitutionListsIndex,
    leistungserbringer: Leistungserbringer,
    faelle: T[]
): [KostentraegerInstitution, T[]][] => 
    entriesGroupedByAnyKey(faelle, 
        fall => getKostentraeger(institutionsIndex, leistungserbringer, fall)!.kostentraeger,
        institution => institution.ik
    )

/** Returns an array of tuples of [EncryptTo, Abrechnungsfaelle[]] */
const groupByEncryptTo = <T extends BaseAbrechnungsfall>(
    institutionsIndex: InstitutionListsIndex,
    leistungserbringer: Leistungserbringer,
    faelle: T[]
): [KostentraegerInstitution, T[]][] => 
    entriesGroupedByAnyKey(faelle, 
        fall => getKostentraeger(institutionsIndex, leistungserbringer, fall)!.encryptTo,
        institution => institution.ik
    )

/** Returns an array of tuples of [Datenannahmestelle, Abrechnungsfaelle[]] */
const groupBySendTo = <T extends BaseAbrechnungsfall>(
    institutionsIndex: InstitutionListsIndex,
    leistungserbringer: Leistungserbringer,
    faelle: T[]
): [KostentraegerInstitution, T[]][] => 
    entriesGroupedByAnyKey(faelle, 
        fall => getKostentraeger(institutionsIndex, leistungserbringer, fall)!.sendTo,
        institution => institution.ik
    )

/** Returns a map with SammelgruppenSchluessel as key and an array of associated Abrechnungsfällen as values  */
const groupBySammelgruppe = <T extends BaseAbrechnungsfall>(faelle: T[]) =>
    faelle.flatMap((unknownFall: unknown) => {
        if ((unknownFall as Abrechnungsfall).einsaetze && (unknownFall as Abrechnungsfall).verordnungen) {
            return groupBySammelgruppeHaueslich(unknownFall as Abrechnungsfall)
        } else {
            // TODO: adding support for other Sammelgruppen
            return [];
        }
    }).reduce((result, item) => {
        const list = result[item.sammelgruppe] || [];
        result[item.sammelgruppe] = list.concat([item.fall as unknown as T]);
        return result;
    }, {} as Record<string, T[]>);

const getKostentraeger = (
    institutionsIndex: InstitutionListsIndex,
    leistungserbringer: Leistungserbringer,
    fall: BaseAbrechnungsfall
) =>
    institutionsIndex.findForData(
        fall.versicherter.pflegekasseIK,
        { sgbvAbrechnungscode: leistungserbringer.abrechnungscode },
        leistungserbringer.location
    )

type Invoice<T extends BaseAbrechnungsfall> = {
    leistungserbringer: Leistungserbringer
    abrechnungsfaelle: T[]
}

type DingsRechnung = {
    /** Kind of bill, see documentation of RechnungsartSchluessel */
    rechnungsart: RechnungsartSchluessel
    /** Indicate whether this bill is a test or if it is real data */
    testIndicator: TestIndicator

    /** Sender of this bill */
    senderIK: string
    /** Final recipient for this bill (Datenannahmestelle mit Entschlüsselungsbefugnis) */
    encryptToIK: string
    /** Running number per recipient (encrypToIK) for each bill transmitted */
    datenaustauschreferenz: number
    /** Date the bill was created */
    rechnungsdatum: Date
    /** For which month this bill is. Bills are transmitted by month. */
    abrechnungsmonat: Date

    /** For which sub group of health care service providers this bill is */
    leistungsbereich: LeistungserbringerSammelgruppenSchluessel
}
