import anyAscii from "any-ascii"
import { ValidationError, ValidationResultType } from "../validation/index";

export const transliterateCertificateName = (text: string) =>
    anyAscii(
        text.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")
    ).replace(/[^A-Za-z0-9 .()/-]/g, "");

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
