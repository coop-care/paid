/** based on documents: 
 *  - Verordnungsformular für SAPV: Muster 63
 * 
  * see docs/documents.md for more info
  */

import { Verordnung } from "../types"

export type SAPVVerordnung = Verordnung & {
    /** Start date of care ("vom") from the prescription */
    verordnungsBeginn: Date,
    /** End date of care ("bis") from the prescription */
    verordnungsEnde: Date
}
