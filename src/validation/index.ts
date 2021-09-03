export const validate = (validationResults: ValidationResult[]): ValidationError[] => {
    const errors = validationResults.filter(it => it != undefined ) as ValidationError[]

    errors.forEach(error => {
        const path = getPath(error)
        
        error.message = (path ? path + ": " : "") + getMessage(error)
    })
    return errors
}

const getPath = (error: ValidationError): string => 
    error.path.map(p => typeof p == "string" ? "." + p : "[" + p.toString() + "]").join("")

const getMessage = (error: ValidationError): string => {
    let message: string = messages[error.code] || ""

    Object.entries(error.params || {}).forEach(([key, value]) => 
        message = message.replace(new RegExp("{" + key + "}", "g"), value)
    )
    return message
}


export type ValidationCode = keyof typeof messages

export enum ValidationResultType { Warning, Error }

export type ValidationResult = ValidationError | undefined

export type ValidationError = {
  code: ValidationCode
  type: ValidationResultType
  /** path in data structure where the error occured */
  path: Array<string | number | symbol>
  params?: Record<string, string>
  message?: string
}

const messages = {
    "requiredValueMissing": "Property is required.",

    "noArray": "Must be an array.",
    "noInt": "Must be an integer.",
    "noNumber": "Must be a number.",
    "noString": "Must be a string.",
    "noDate": "Must be a Date.",

    "numberTooSmall": "Number must be greater or equal than {min}.",
    "numberTooBig": "Number must be smaller than {max}.",
    "arrayTooSmall": "Array length must be at least {minLength}.",
    "arrayTooLong": "Array length must at most {maxLength}.",
    "arrayTruncated": "Array will be truncated because it is longer than {maxLength}.",

    "textEmpty": "String must not be empty.",
    "textTooLong": "String length must be at most {maxLength} characters.",
    "textHasIncorrectLength": "String must have exactly {length} characters.",
    "textTruncated": "String will be truncated because it is longer than {maxLength} characters.",

    "institutionskennzeichenIncorrect": "An IK must be a string that consists of exactly 9 digits.",
    "rechnungsnummerIncorrect": "An invoice number may only contain the characters a-z, A-Z, 0-9 and the separators '-' and '/', though it may not begin or end with a separator.",
}
