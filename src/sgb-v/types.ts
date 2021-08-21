/** based on documents: 
 *  - Informationen zu Heilmittel-Verordnungen
 * 
  * see docs/documents.md for more info
  */

import { RechnungsartSchluessel } from "../codes"
import { char } from "../edifact/formatter"
import { CareProviderLocationSchluessel } from "../kostentraeger/types"
import { Institution, Umsatzsteuer, Versicherter } from "../types"
import { 
    AbrechnungscodeEinzelschluessel,
    BeleginformationSchluessel,
    KostenzusageGenehmigung,
    LeistungserbringerSammelgruppenSchluessel,
    SonstigeEntschaedigungSchluessel,
    TarifbereichSchluessel,
    UnfallSchluessel,
    VerordnungsbesonderheitenSchluessel,
} from "./codes"

/* Schlüssel Leistungserbringergruppe
 * 
 * documented in (a) 8.1.5
 * 
 * 7-character code
 * 
 * ```
 * Abrechnungscode
 *  │  Tarifkennzeichen
 * ┌┴─┐┌─┴─────┐
 *  XX  XX  XXX
 *     └┬─┘└─┬─┘
 *      │   Sondertarif
 *     Tarifbereich
 * ```
 */
export type Leistungserbringergruppe = {
    abrechnungscode: AbrechnungscodeEinzelschluessel,
    tarifbereich: TarifbereichSchluessel,
    sondertarif: string
}

export const createLeistungserbringergruppe = (
    le: Leistungserbringer,
    kostentraegerIK: string
): Leistungserbringergruppe => ({
    abrechnungscode: le.abrechnungscode,
    tarifbereich: le.tarifbereich,
    sondertarif: le.sondertarifJeKostentraegerIK[kostentraegerIK] || "000"
})

export const leistungserbringergruppeCode = (le: Leistungserbringergruppe): string[] => [
    le.abrechnungscode,
    le.tarifbereich + char(le.sondertarif, 3)
]

export type Sammelrechnung = Rechnung

export type Rechnung = {
    rechnungsart: RechnungsartSchluessel
    senderIK: string
    kostentraegerIK: string
    sammelRechnungsnummer: string
    rechnungsdatum: Date
    /** at most 9 */
    skontos?: Skonto[]
    rechnungssteller: Institution
}

export type Einzelrechnung = Rechnung & {
    /** if RechnungsartSchluessel == 3 and it is a Sammelrechnung, each Leistungserbringer 
     *  (health care service provider) within one bill is assigned an own unique 
     *  Einzel-Rechnungsnummer. This is effectively an index, starting with 1.
     *  */
    einzelRechnungsnummer?: string

    pflegekasseIK: string

    leistungsbereich: LeistungserbringerSammelgruppenSchluessel
    leistungserbringer: Leistungserbringer
}

export type Leistungserbringer = Institution & {
    abrechnungscode: AbrechnungscodeEinzelschluessel
    tarifbereich: TarifbereichSchluessel
    /** Location of care provider. Necessary to know where to send bills to */
    location: CareProviderLocationSchluessel
    /** Per Kostenträger IK a 3-character id for the Sondertarif, see sgb-v/codes.ts */
    sondertarifJeKostentraegerIK: Record<string, string>

    /** to be specified if care provider is income tax excempt */
    umsatzsteuer?: Umsatzsteuer
}

export type BaseAbrechnungsfall = {
    versicherter: Versicherter
    /** Unique number within the whole bill. 
     * 
     *  ASK Belegnummer: Docs mention "siehe § 4 des Richtlinientextes". Neither §4 of 
     *  Heilmittelrichtlinie nor §4 Hilfsmittelrichtlinie seem to be related here.
     */
    belegnummer: string
    beleginformation?: BeleginformationSchluessel
    /** "Vertragskennzeichen für besondere Versorgungsformen gemäß der vertraglichen Vereinbarungen.
     *  Für Verordnungen im Rahmen der Versorgung nach §116b Abs. 1 SGB V ist eine "1" zu 
     *  übermitteln." https://www.gesetze-im-internet.de/sgb_5/__116b.html
     */
    besondereVersorgungsform?: string
}

/** Fields common to all types of Abrechnungsposition for the different subgroups (Heilmittel-
 *  erbringer, Hilfsmittelerbringer, häusliche Krankenpfleger, etc etc...)
 * */
export type BaseAbrechnungsposition = {
    /** Price of one service provided */
    einzelpreis: number
    /** Number of things done, f.e. 3x check blood pressure, 3x 15 minutes etc. */
    anzahl: number
    /** How many kilometers were driven, if applicable */
    gefahreneKilometer?: number
    /** Explanatory text */
    text?: string
}

export const calculateBruttobetrag = (p: BaseAbrechnungsposition): number =>
    Math.round(100 * p.einzelpreis * p.anzahl) / 100

/** Represents a prescription/voucher (Verordnung, Beleg) from a doctor */
export type Verordnung = {
    /** Content of the field "Betriebsstätten-Nr." from the prescription, if specified */
    betriebsstaettennummer?: string
    /** Content of the field "Arzt-Nr." from the prescription, if specified */
    vertragsarztnummer?: string
    /** Content of the field "Datum" from the prescription */
    verordnungsDatum: Date
    /** Content of the field(s) "Unfall" / "Arbeitsunfall" / "Sonstige" on the prescription, if specified*/
    unfall?: UnfallSchluessel
    /** Whether "BVG" is checked on the prescription */
    sonstigeEntschaedigung?: SonstigeEntschaedigungSchluessel
    verordnungsBesonderheiten?: VerordnungsbesonderheitenSchluessel
    /** Content of the fields at "behandlungsrelevante Diagnose(n)". Empty array if not specified.
     *  Some prescription forms have fields for multiple diagnoses */
    diagnosen: Diagnose[]
    /** At least one is required. No a guarantee to cover the costs -> no billing possible */
    kostenzusagen: Kostenzusage[]
}

/** Details on the diagnosis made by the doctor */
export type Diagnose = {
    /** Content of the field "ICD-10-Code" at "Behandlungsrelevante Diagnose(n)" 
     *  on the prescription/voucher, if specified. Max 12 characters. */
    diagnoseschluessel?: string
    /** Content of the free text field at ""Behandlungsrelevante Diagnose(n)" from the 
     *  prescription/voucher, if specified. 
     *  Strings longer than 70 characters will be cut off. */
    diagnosetext?: string
}

/** Information about the guarantee that the public health insurance will cover the costs */
export type Kostenzusage = {
    /** bei der Kostenzusage vergebene Genehmigungsnummer oder das Aktenzeichen der Krankenkasse.
     *  Max 20 characters. */
    genehmigungsKennzeichen: string
    genehmigungsDatum: Date
    kostenzusageGenehmigung: KostenzusageGenehmigung
}

/** Skonto
 * 
 *  Contains information about cashback */
export type Skonto = {
    /** granted skonto in percent */
    skontoPercent: number
    /** skonto is granted if payment is settled within the given number of days */
    zahlungsziel: number
}

export type Gesamtsummen = {
    gesamtbruttobetrag: number,
    zuzahlungUndEigenanteilBetrag: number
}
