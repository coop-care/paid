/** based on documents: 
 *  - Informationen zu Heilmittel-Verordnungen
 * 
  * see docs/documents.md for more info
  */

import { RechnungsartSchluessel } from "../codes"
import { Abrechnungsfall, Institution, Umsatzsteuer, Versicherter } from "../types"
import { 
    AbrechnungscodeEinzelschluessel,
    KostenzusageGenehmigung,
    LeistungserbringerSammelgruppenSchluessel,
    SonstigeEntschaedigungSchluessel,
    TarifbereichSchluessel,
    UnfallSchluessel,
    VerordnungsbesonderheitenSchluessel,
} from "./codes"
import { HaeuslicheKrankenpflegeAbrechnungsposition } from "./haeuslich/types"

export type Sammelrechung = Rechnung & {
    rechnungen: Einzelrechnung[]
}

export type Rechnung = {
    rechnungsart: RechnungsartSchluessel
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
    leistungserbringer: Institution
    pflegekasseIK: string

    umsatzsteuer?: Umsatzsteuer

    leistungserbringerSammelgruppe: LeistungserbringerSammelgruppenSchluessel

    abrechnungsfaelle: Abrechnungsfall[]
}

/** An Abrechnungsposition as defined in SGB V could be any of the given types
 * 
 *  For each (supported) LeistungserbringerSammelgruppe, there is a (slightly) different data
 *  structure.
 *  (Currently, only one is supported)
 * 
 *  NOTE: When extending support for other LeistungserbringerSammelgruppen, check if the
 *        implementation of any function that takes a Abrechnungsposition needs to be updated. F.e.
 *        calculateZuzahlungUndEigentanteilBetrag
 */
export type Abrechnungsposition = 
    HaeuslicheKrankenpflegeAbrechnungsposition // for "C" and "D"

/** Fields common to all types of Abrechnungsposition for the different subgroups (Heilmittel-
 *  erbringer, Hilfsmittelerbringer, häusliche Krankenpfleger, etc etc...)
 * */
export type BaseAbrechnungsposition = {
    /** to tell apart the different types */
    leistungserbringerSammelgruppe: LeistungserbringerSammelgruppenSchluessel,

    abrechnungscode: AbrechnungscodeEinzelschluessel
    tarifbereich: TarifbereichSchluessel
    /** 3-character string, see Sondertarife in ./codes.ts */
    sondertarif: string
    /** Price of one service provided */
    einzelpreis: number
    /** Number of things done, f.e. 3x check blood pressure, 3x 15 minutes etc. */
    anzahl: number
    /** How many kilometers were driven, if applicable */
    gefahreneKilometer?: number
    /** Explanatory text */
    text?: string
}

export const calculateBruttobetrag = (p: Abrechnungsposition): number =>
    Math.round(100 * p.einzelpreis * p.anzahl) / 100

export const calculateZuzahlungUndEigentanteilBetrag = (p: Abrechnungsposition): number =>
    // currently supported Abrechnungsposition don't include any Zuzahlung or Eigenanteil
    0

export const getAbrechnungsfallPositionen = (abrechnungsfall: Abrechnungsfall): Abrechnungsposition[] =>
    abrechnungsfall.einsaetze.flatMap(einsatz => einsatz.abrechnungspositionen)

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
