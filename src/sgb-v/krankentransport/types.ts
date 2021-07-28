/** based on documents: 
 *  - Verordnungsformular für Krankenhauseinweisung: Muster 2
 * 
  * see docs/documents.md for more info
  */

import { ZuzahlungSchluessel } from "../codes"
import { Verordnung } from "../types"

/** See Verordnungsformular für Krankenhauseinweisung: Muster 2 for how the prescription looks */
export type KrankentransportVerordnung = Verordnung & {
    zuzahlung: ZuzahlungSchluessel,
    verordnungsDatum?: Date, // optional for Krankentransport
}
