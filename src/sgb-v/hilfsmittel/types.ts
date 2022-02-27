/** based on documents: 
 *  - Verordnungsformulare für Hilfsmittel: Muster 8, 8A, 15, 16
 * 
  * see docs/documents.md for more info
  */

import { ZuzahlungSchluessel } from "../codes"
import { Verordnung } from "../types"

export type Hilfsmittelverordnung = Verordnung & {
    zuzahlung: ZuzahlungSchluessel
}
