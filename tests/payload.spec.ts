import MockDate from "mockdate";
import { makeBillingFile } from "../src/sgb-xi/";
import { payload1, payload2, payload3 } from "./samples/billingPayloads";
import { result1, result2, result3 } from "./samples/billingResults";

describe("payload", () => {

    it("create billing with invoice type 1", () => {
        MockDate.set("2021-04-27T21:59");
        const result = makeBillingFile("000000011", "AO", payload1.invoices, payload1.billingData);
        
        expect(result.dateiname).toEqual(result1.dateiname);
        expect(result.anwendungsreferenz).toEqual(result1.anwendungsreferenz);
        expect(result.nutzdaten.split("\n")).toEqual(result1.nutzdaten.split("\n"));
        MockDate.reset();
    });

    it("create billing with invoice type 2", () => {
        MockDate.set("2021-04-27T21:59");
        const result = makeBillingFile("000000011", "AO", payload2.invoices, payload2.billingData);

        expect(result.dateiname).toEqual(result2.dateiname);
        expect(result.anwendungsreferenz).toEqual(result2.anwendungsreferenz);
        expect(result.nutzdaten.split("\n")).toEqual(result2.nutzdaten.split("\n"));
        MockDate.reset();
    });

    it("create billing with invoice type 3", () => {
        MockDate.set("2021-04-27T21:59");
        const result = makeBillingFile("000000011", "AO", payload3.invoices, payload3.billingData);

        expect(result.dateiname).toEqual(result3.dateiname);
        expect(result.anwendungsreferenz).toEqual(result3.anwendungsreferenz);
        expect(result.nutzdaten.split("\n")).toEqual(result3.nutzdaten.split("\n"));
        MockDate.reset();
    });

})