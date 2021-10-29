import { validate, ValidationResultType } from "../../src/validation/index"
import { BillingData, Invoice } from "../../src/sgb-xi/types"
import { constraintsBillingData, constraintsInvoice } from "../../src/sgb-xi/validation"
import { payload1, payload2, payload3 } from "../samples/billingPayloads";
import { arrayConstraints, valueConstraints } from "../../src/validation/utils";

describe("validation", () => {

    it("shows no errors or warnings for billing with invoice type 1", () => {
        expect(validate(constraintsBillingPayload(payload1))).toEqual([])
    })

    it("shows no errors or warnings for billing with invoice type 2", () => {
        expect(validate(constraintsBillingPayload(payload2))).toEqual([
            {
                code: "textTruncated",
                message: ".invoices[0].leistungserbringer.name: String will be truncated because it is longer than 30 characters.",
                params: { maxLength: "30" },
                path: ["invoices", 0, "leistungserbringer", "name"],
                type: ValidationResultType.Warning,
            }
        ])
    })

    it("shows no errors or warnings for billing with invoice type 3", () => {
        expect(validate(constraintsBillingPayload(payload3))).toEqual([])
    })

    it("shows several errors for incorrect billingData", () => {
        expect(
            validate(constraintsBillingPayload({
                billingData: {
                    ...payload3.billingData,
                    //@ts-ignore
                    rechnungsart: undefined,
                    //@ts-ignore
                    abrechnungsstelle: {
                        ...payload3.billingData.abrechnungsstelle,
                        ik: "12345678X",
                    },
                    rechnungsnummerprefix: "-too-long-and-wrong",
                    datenaustauschreferenzJeEmpfaengerIK: {
                        "0": 0
                    },
                    laufendeDatenannahmeImJahrJeEmpfaengerIK: {
                        "0": 0
                    },
                },
                invoices: payload3.invoices
            }))
        ).toEqual([
        {
            code: "institutionskennzeichenIncorrect",
            message: ".billingData.datenaustauschreferenzJeEmpfaengerIK.0: An IK must be a string that consists of exactly 9 digits.",
            path: ["billingData", "datenaustauschreferenzJeEmpfaengerIK", "0"],
            type: ValidationResultType.Error,
        },
        {
            code: "numberTooSmall",
            message: ".billingData.datenaustauschreferenzJeEmpfaengerIK.0: Number must be greater or equal than 1.",
            params:  { "min": "1" },
            path: ["billingData", "datenaustauschreferenzJeEmpfaengerIK","0"],
            type: ValidationResultType.Error,
        },
        {
            code: "requiredValueMissing",
            message: ".billingData.rechnungsart: Property is required.",
            path: ["billingData","rechnungsart"],
            type: ValidationResultType.Error,
        },
        {
            code: "textTooLong",
            message: ".billingData.rechnungsnummerprefix: String length must be at most 9 characters.",
            params:  { "maxLength": "9" },
            path: ["billingData", "rechnungsnummerprefix"],
            type: ValidationResultType.Error,
        },
        {
            code: "rechnungsnummerIncorrect",
            message: ".billingData.rechnungsnummerprefix: An invoice number may only contain the characters a-z, A-Z, 0-9 and the separators '-' and '/', though it may not begin or end with a separator.",
            path: ["billingData", "rechnungsnummerprefix"],
            type: ValidationResultType.Error,
        },
        {
            code: "institutionskennzeichenIncorrect",
            message: ".billingData.abrechnungsstelle.ik: An IK must be a string that consists of exactly 9 digits.",
            path: ["billingData", "abrechnungsstelle", "ik"],
            type: ValidationResultType.Error,
        },
        {
            code: "institutionskennzeichenIncorrect",
            message: ".billingData.laufendeDatenannahmeImJahrJeEmpfaengerIK.0: An IK must be a string that consists of exactly 9 digits.",
            path: ["billingData", "laufendeDatenannahmeImJahrJeEmpfaengerIK", "0"],
            type: ValidationResultType.Error,
        },
        {
            code: "numberTooSmall",
            message: ".billingData.laufendeDatenannahmeImJahrJeEmpfaengerIK.0: Number must be greater or equal than 1.",
            params:  { "min": "1"},
            path: ["billingData", "laufendeDatenannahmeImJahrJeEmpfaengerIK", "0"],
            type: ValidationResultType.Error,
        }
        ])
    })
})

type BillingPayload = {
    billingData: BillingData,
    invoices: Invoice[]
}

const constraintsBillingPayload = (payload: BillingPayload) => [
    ...valueConstraints(payload, "billingData", constraintsBillingData),
    ...arrayConstraints(payload, "invoices", constraintsInvoice)
]
