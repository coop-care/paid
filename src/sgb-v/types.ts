/** based on documents: 
 *  - Informationen zu Heilmittel-Verordnungen
 * 
  * see docs/documents.md for more info
  */

import { RechnungsartSchluessel } from "../codes"
import { LaenderkennzeichenSchluessel } from "../country_codes"
import { char } from "../edifact/formatter"
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

export type Rechnung = {
    /** For Sammelrechnungs-SLGA, must be identical to all associated SGLA and SLLA */
    rechnungsart: RechnungsartSchluessel
    rechnungsdatum: Date
    /** Rechnungsnummer or Sammel-Rechnungsnummer if it is a Sammelrechnung */
    sammelRechnungsnummer: string
    /** if RechnungsartSchluessel == 3 and it is a Sammelrechnung, each Leistungserbringer 
     *  (health care service provider) within one bill is assigned an own unique 
     *  Einzel-Rechnungsnummer. This is effectively an index, starting with 1.
     *  */
    einzelRechnungsnummer?: string
    leistungserbringerIK: string
    pflegekasseIK: string
    kostentraegerIK: string
    /** Only specify if RechnungsartSchluessel == 3 */
    rechnungsstellerIK: string

    leistungserbringerSammelgruppe: LeistungserbringerSammelgruppenSchluessel

    abrechnungsfaelle: Abrechnungsfall[]
}


export type Abrechnungsfall = {
    versicherter: Versicherter
    einsaetze: Einsatz[]
    verordnungen: Verordnung[]
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

export type Versicherter = {
    pflegekasseIK: string
    /** Mandatory if known. If not known, full address must be specified.
     *  On prescription, listed in field "Versicherten-Nr." */
    versichertennummer?: string
    /** Mandatory if known. If not known, full address must be specified.
     *  On prescription, listed in field "Staus" */
    versichertenstatus?: string
    /** Strings longer than 30 characters will be cut off. */
    firstName: string
    /** Strings longer than 47 characters will be cut off. */
    lastName: string
    birthday: Date
    /** Mandatory if the versichertennummer or versichertenstatus is not known */
    address?: Address
}

export type Address = {
    street: string,
    houseNumber: string
    /** Strings longer than 7 characters will be cut off. */
    postalCode: string
    /** Strings longer than 25 characters will be cut off. */
    city: string
    /** to be specified if the country is not Germany. */
    countryCode?: LaenderkennzeichenSchluessel
}

export type Einsatz = {
    /** Date and time at which the health care service started */
    leistungsBeginn: Date
    /** Date and time at which the health care service ended */
    leistungsEnde: Date
    abrechnungspositionen: Abrechnungsposition[] 
}

export type Abrechnungsposition = {
    leistungserbringergruppe: Leistungserbringergruppe
    /** Which service was provided. The format of the positionsnummer is different for each 
     *  group (Krankentransport, Hilfsmittellieferand, Heilmittelerbringer, ...) */
    positionsnummer: string
    /** Price of one */
    einzelpreis: number
    /** Number of things done, f.e. 3x check blood pressure, 3x 15 minutes etc. */
    anzahl: number
    /** How many kilometers were driven, if applicable */
    gefahreneKilometer?: number
    /** Explanatory text */
    text?: string
}

/** 7-character code:
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
    abrechnungscode: AbrechnungscodeEinzelschluessel
    tarifbereich: TarifbereichSchluessel
    /** 3-character string, see Sondertarife in ./codes.ts */
    sondertarif: string
}

export const leistungserbringergruppeCode = (le: Leistungserbringergruppe): string[] =>
[
    le.abrechnungscode,
    le.tarifbereich + char(le.sondertarif, 3)
]

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
    /** At least one is required. Without no guarantee to cover the costs, no billing */
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
