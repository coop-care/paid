import { 
    ValidationCode,
    ValidationError,
    ValidationResult,
    ValidationResultType
} from "./index"

export const error = (
    code: ValidationCode,
    property?: string | number | symbol,
    params?: Record<string, string>,
    message?: string
): ValidationError => ({
    code,
    type: ValidationResultType.Error,
    path: property ? [property] : [],
    message,
    params
})

export const warning = (
    code: ValidationCode,
    property?: string | number | symbol,
    params?: Record<string, string>,
    message?: string
): ValidationError => ({
    code,
    type: ValidationResultType.Warning,
    path: property ? [property] : [],
    message,
    params
})

export const validationByType = (errorsAndWarnings: ValidationResult[]): {
    errors: ValidationError[];
    warnings: ValidationError[];
} => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    errorsAndWarnings.forEach(item => {
        if (item?.type == ValidationResultType.Error) {
            errors.push(item);
        } else if (item?.type == ValidationResultType.Warning) {
            warnings.push(item);
        }
    });

    return { errors, warnings };
}

export const isRequired = <T>(obj: T, key: keyof T): ValidationResult => {
    if (obj[key] == undefined) {
        return error("requiredValueMissing", key)
    }
}

export const isOptionalDate = <T>(obj: T, key: keyof T): ValidationResult => 
    obj[key] == undefined ? undefined : isDate(obj, key)

export const isDate = <T>(obj: T, key: keyof T): ValidationResult => {
    if (!(obj[key] instanceof Date)) {
        return error("noDate", key)
    }
}

export const isOptionalNumber = <T>(obj: T, key: keyof T, min: number, maxExclusive: number): ValidationResult => 
    obj[key] == undefined ? undefined : isNumber(obj, key, min, maxExclusive)

export const isNumber = <T>(obj: T, key: keyof T, min: number, maxExclusive: number): ValidationResult => {
    const value = obj[key]
    if (typeof value != "number") {
        return error("noNumber", key)
    } else if (value < min) {
        return error("numberTooSmall", key, { min: min.toString() })
    } else if (value >= maxExclusive) {
        return error("numberTooBig", key, { max: maxExclusive.toString() })
    }
}

export const isOptionalInt = <T>(obj: T, key: keyof T, min: number, maxExclusive: number): ValidationResult => 
    obj[key] == undefined ? undefined : isInt(obj, key, min, maxExclusive)

export const isInt = <T>(obj: T, key: keyof T, min: number, maxExclusive: number): ValidationResult => {
    const result = isNumber(obj, key, min, maxExclusive)
    if(!Number.isInteger(obj[key])) {
        return error("noInt", key)
    } else if (result) {
        return result
    }
}

export const isArray = <T>(obj: T, key: keyof T, minLength: number, maxLength?: number): ValidationResult => {
    const value = obj[key]
    if (!Array.isArray(value)) {
        return error("noArray", key)
    } else if(value.length < minLength) {
        return error("arrayTooSmall", key, { minLength: minLength.toString() }) 
    } else if (maxLength != undefined && value.length > maxLength) {
        return error("arrayTooLong", key, { maxLength: maxLength.toString() }) 
    }
}

export const isOptionalVarchar = <T>(obj: T, key: keyof T, maxLength: number): ValidationResult => 
    obj[key] == undefined ? undefined : isVarchar(obj, key, maxLength)

export const isVarchar = <T>(obj: T, key: keyof T, maxLength: number): ValidationResult => {
    const value = obj[key]
    if (typeof value != "string") {
        return error("noString", key)
    } else if (value.length == 0 ) {
        /* because in EDIFACT, "" == undefined but in our datastructure, we explicitly use undefined
           if a field is undefined. */
        return error("textEmpty", key)
    } else if(value.length > maxLength) {
        return error("textTooLong", key, {
            maxLength: maxLength.toString(), 
            truncatedValue: value.substring(0, maxLength)
        })
    }
}

export const isOptionalChar = <T>(obj: T, key: keyof T, maxLength: number): ValidationResult => 
    obj[key] == undefined ? undefined : isChar(obj, key, maxLength)

export const isChar = <T>(obj: T, key: keyof T, length: number): ValidationResult => {
    const value = obj[key]
    if (typeof value != "string") {
        return error("noString", key)
    } else if(value.length != length) {
        return error("textHasIncorrectLength", key, { length: length.toString() })
    }
}

export const isIK = <T>(obj: T, key: keyof T): ValidationResult => {
    const value = obj[key]
    if (typeof value != "string") {
        return error("noString", key)
    } else if(!/^\d{9}$/.test(value)) {
        return error("institutionskennzeichenIncorrect", key)
    }
}

export const isRechnungsnummer = <T>(obj: T, key: keyof T): ValidationResult => {
    const value = obj[key]
    if (typeof value != "string") {
        return error("noString", key)
    } else if(!/^[a-z0-9][a-z0-9/-]*[a-z0-9]$/i.test(value)) {
        return error("rechnungsnummerIncorrect", key)
    }
}

export const isTruncatedIfTooLong = (result: ValidationResult): ValidationResult => {
    if (result != undefined) {
        if (result.code == "arrayTooLong") {
            result.code = "arrayTruncated"
            result.type = ValidationResultType.Warning
        }
        else if (result.code == "textTooLong") {
            result.code = "textTruncated"
            result.type = ValidationResultType.Warning
        }
    }
    return result
}

export const arrayConstraints = <T>(
    obj: any,
    key: string,
    perItemConstraints: (item: T) => ValidationResult[]
): ValidationResult[] => {
    const value = obj[key]
    // not-set value is treated the same as an empty array by this function
    if (value === undefined) {
        return []
    }
    if (!Array.isArray(value)) {
        return [ error("noArray", key) ]
    }
    return value.flatMap((item, i) => {
        const results = perItemConstraints(item)
        results.forEach(result => {
            if (result != undefined) {
                result.path.unshift(i)
                result.path.unshift(key)
            }
        })
        return results
    })
}

export const valueConstraints = <T>(
    obj: any,
    key: string,
    itemConstraints: (item: T) => ValidationResult[]
): ValidationResult[]  => {
    if (obj[key] === undefined) {
        return []
    }
    const results = itemConstraints(obj[key] as T)
    results.forEach(result => {
        if (result != undefined) {
            result.path.unshift(key)
        }
    })
    return results
}
