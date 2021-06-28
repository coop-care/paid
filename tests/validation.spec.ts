import { validate } from "../src/sgb-xi/validation";
import { payload1, payload2, payload3 } from "./samples/billingPayloads";

describe("validation", () => {

    it("shows no errors or warnings for billing with invoice type 1", () => {
        const result = validate(payload1.invoices, payload1.billingData);

        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    it("shows no errors or warnings for billing with invoice type 2", () => {
        const result = validate(payload2.invoices, payload2.billingData);

        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([{
            code: "textIsTruncated",
            params: {
                key: "name",
                maxLength: "30",
            },
            path: ["invoices", 0, "leistungserbringer"],
            message: "The property \"name\" will be truncated, because it is longer than 30 characters.",
        }]);
    });

    it("shows no errors or warnings for billing with invoice type 3", () => {
        const result = validate(payload3.invoices, payload3.billingData);

        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    it("shows several errors for incorrect billingData", () => {
        const result = validate(payload3.invoices, {
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
        });

        expect(result.errors).toEqual([{
            code: "requiredValueMissing",
            params: {
                key: "rechnungsart"
            },
            path: ["billing"],
            message: "The property \"rechnungsart\" is required.",
        }, {
            code: "textIsTooLong",
            params: {
                key: "rechnungsnummerprefix",
                maxLength: "9"
            },
            path: ["billing"],
            message: "The property \"rechnungsnummerprefix\" may not be longer than 9 characters.",
        }, {
            code: "invoiceNumberIncorrect",
            params: {
                key: "rechnungsnummerprefix"
            },
            path: ["billing"],
            message: "The property \"rechnungsnummerprefix\" may only contain the caracters a-z, A-Z, 0-9 and the separators '-' and '/', though it may not begin or end with a separator.",
        }, {
            code: "lessThanMinimumValue",
            params: {
                key: "datenaustauschreferenzJeEmpfaengerIK",
                minValue: "1"
            },
            path: ["billing"],
            message: "The property \"datenaustauschreferenzJeEmpfaengerIK\" may not be less than 1.",
        }, {
            code: "institutionskennzeichenIncorrect",
            params: {
                key: "datenaustauschreferenzJeEmpfaengerIK"
            },
            path: ["billing"],
            message: "The property \"datenaustauschreferenzJeEmpfaengerIK\" must consist of 9 digits.",
        }, {
            code: "lessThanMinimumValue",
            params: {
                key: "laufendeDatenannahmeImJahrJeEmpfaengerIK",
                minValue: "1"
            },
            path: ["billing"],
            message: "The property \"laufendeDatenannahmeImJahrJeEmpfaengerIK\" may not be less than 1.",
        }, {
            code: "institutionskennzeichenIncorrect",
            params: {
                key: "laufendeDatenannahmeImJahrJeEmpfaengerIK"
            },
            path: ["billing"],
            message: "The property \"laufendeDatenannahmeImJahrJeEmpfaengerIK\" must consist of 9 digits.",
        }, {
            code: "institutionskennzeichenIncorrect",
            params: {
                key: "abrechnungsstelleIK"
            },
            path: ["billing", "abrechnungsstelle"],
            message: "The property \"abrechnungsstelleIK\" must consist of 9 digits.",
        }]);
        expect(result.warnings).toEqual([]);
    });

})