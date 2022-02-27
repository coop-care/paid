import anyAscii from "any-ascii"
import { ValidationError, ValidationResultType } from "../validation/index";

export const transliterateCertificateName = (text: string) =>
    anyAscii(
        text.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")
    ).replace(/[^A-Za-z0-9 .()/-]/g, "");

/** Recursively traverses and clones nested objects and arrays and transliterates every property of type string 
 *  using the provided transliterate method parameter. Returns warnings if the transliterated string
 *  differs from the original string.
 * @param objectOrArray root object or array that is traversed
 * @param transliterate transliteration method for transliterating every string in the data structure
 * @returns an object with the properties `transliterated` and `warnings`.
 * `transliterated` is a deep clone of the `objectOrArray` parameter with transliterated strings.
 * `warnings`is an array of ValidationError of type warning for every string that has changed due to transliteration.
 */
export const transliterateRecursively = <T extends Record<string, any>>(
    objectOrArray: T,
    transliterate: (text: string) => string
): { warnings: ValidationError[], transliterated: T} => {
    let warnings: ValidationError[] = [];
    const transliterated: Record<string, any> = Array.isArray(objectOrArray)
        ? [...objectOrArray]
        : {...objectOrArray};

    Object.entries(transliterated).forEach(([key, value]) => {
        if (typeof value == "string") {
            const transliteratedValue = transliterate(value);

            if (value != transliteratedValue) {
                transliterated[key] = transliteratedValue;
                warnings.push({
                    code: "textTransliterated",
                    type: ValidationResultType.Warning,
                    path: [key],
                    params: {
                        transliteratedValue
                    }
                });
            }
        } else if (value != undefined && (value.constructor == Object || value.constructor == Array)) {
            const result = transliterateRecursively(value, transliterate);
            result.warnings.forEach(warning => warning.path = [key, ...warning.path]);
            warnings = warnings.concat(result.warnings);
            transliterated[key] = result.transliterated;
        }
    });

    return {
        warnings,
        transliterated: transliterated as T
    };
};
