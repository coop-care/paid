/** based on documents: 
 *  - Informationen zu Heilmittel-Verordnungen
 * 
  * see docs/documents.md for more info
  */

import { char } from "../edifact/formatter"
import { CareProviderLocationSchluessel } from "../kostentraeger/types"
import { UmsatzsteuerBefreiungSchluessel } from "../sgb-xi/codes"
import { Institution, Versicherter } from "../types"
import { 
    AbrechnungscodeEinzelschluessel,
    BeleginformationSchluessel,
    KostenzusageGenehmigung,
    LeistungserbringerSammelgruppenSchluessel,
    SonstigeEntschaedigungSchluessel,
    TarifbereichSchluessel,
    UnfallSchluessel,
    VerordnungsbesonderheitenSchluessel,
    RechnungsartSchluessel
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

    /** Steuernummer (according to §14 Abs. 1a) OR Umsatzsteuer-Identifikationsnummer.
     *  Mandatory if not VAT excempt. */
     umsatzsteuerOrdnungsnummer?: string
     /** specified if income tax excempt */
     umsatzsteuerBefreiung: UmsatzsteuerBefreiungSchluessel
}

export type BaseAbrechnungsfall = {
    versicherter: Versicherter
    /** Unique number within the whole bill, allocated by the party that does the invoicing, i.e. 
     *  the creator of the bill.
     *  
     *  The docs are not so clear on that, so we asked the GKV-spitzenverband to confirm it. Their
     *  answer: 
     * 
     *  > Bei der Belegnummer handelt es sich um eine eindeutige Nummer je Abrechnungsfall innerhalb 
     *  > einer Gesamtrechnung, die von der abrechnenden Stelle (Leistungserbringer oder 
     *  > Dienstleister) vergeben wird.
     *  > Der Verweis [auf §4] bezieht sich auf die Abrechnungsrichtlinie nach § 302 SGB V"
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

/** Represents a prescription/voucher (Verordnung, Beleg) from a doctor */
export type Verordnung = {
    /** Content of the field "Betriebsstätten-Nr." from the prescription, if specified */
    betriebsstaettennummer?: string
    /** Content of the field "Arzt-Nr." from the prescription, if specified */
    vertragsarztnummer?: string
    /** Content of the field "Datum" from the prescription */
    verordnungsDatum: Date
    /** Content of the field(s) "Unfall" / "Arbeitsunfall" / "Sonstige" on the prescription, if 
     *  specified. 
     * 
     * Certain prescription forms only have one field for "Unfall"/"Unfallfolgen" but none for 
     * "Arbeitsunfall", such as Muster 13 (Heilmittelverordnung). For such forms, if that field is
     * checked, "2" (sonstige Unfallfolgen) should be specified. This was not clear from the 
     * documentation, so we asked GKV-spitzenverband about it. Answer:
     * 
     * > Vordruckerläuterungen; Losgelöst von einem bestimmten Vordruck steht im einleitenden Teil
     * > folgendes:
     * > „ 8. Bei Arbeitsunfällen, Berufskrankheiten und Schülerunfällen können nur die Muster 1 
     * > (Arbeitsunfähigkeitsbescheinigung), 4 (Verordnung einer Krankenbeförderung) und 16 
     * > (Arzneiverordnungsblatt) verwendet werden.
     * > Das Ankreuzfeld „Unfall/Unfallfolgen“ ist nicht bei Arbeitsunfällen, Berufskrankheiten usw.
     * > zu verwenden, sondern nur bei sonstigen Unfällen (z. B. Haus-, Sport-, Verkehrsunfällen).“
     * > [...]
     * > Wenn bei der Heilmittelverordnung Unfall/Unfallfolgen angekreuzt ist, muss in den Daten 
     * > immer eine „2“ für sonstige Unfallfolgen (8.1.2) übermittelt werden.
     * */
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
    /** Total gross amount of all Abrechnungsfälle, i.e. sum of all(BES.gesamtbruttobetrag) (if 
     *  applicable).
     * 
     *  We were not sure whether the sum of zuzahlungUndEigenanteilBetrag should be added to this
     *  sum too. The answer by GKV-Spitzenverband was no: 
     *  the gross amount of all the Abrechnungsfälle already implicitly contain all that, and VAT 
     *  (and thus implicitly the price on the Abrechnungspositions do as well). Makes sense, it is 
     *  called the gross amount after all. 
     * 
     *  The precise answer was:
     * > Die [von Ihnen] beschriebene Regel [
     * >> "Summe über alle (BES.Gesamtbetrag Brutto + BES.Gesamtbetrag gesetzliche Zuzahlung +
     * >>                  BES.Gesamtbetrag Eigenanteil + BES.Pauschale Korrekturabzug)"
     * > ] ist nicht zutreffend. Der Bruttobetrag enthält bereits die gesetzlicher Zuzahlungsbeträge
     * > oder Eigenanteil und/oder Pauschale Korrekturbetrag sowie ggf. Mehrwertsteuer.
    */
    gesamtbruttobetrag: number,
    /** Total amount of all zuzahlungUndEigenanteilBetrag, i.e. 
     *  sum of all(BES.gesetzlicheZuzahlungBetrag + BES.eigenanteilBetrag) etc. (if applicable) */
    zuzahlungUndEigenanteilBetrag: number
}
