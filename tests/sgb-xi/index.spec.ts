import MockDate from "mockdate";
import { absender, transmissionIdentifiers } from "../../src/transmission/utils";
import { makeNutzdaten } from "../../src/sgb-xi";
import { makeAnwendungsreferenz, makeDateiname } from "../../src/sgb-xi/filenames";
import { payload1, payload2, payload3 } from "../samples/billingPayloads";
import { result1, result2, result3 } from "../samples/billingResults";

describe("payload", () => {

    it("create billing with invoice type 1", () => {
        MockDate.set("2021-04-27T21:59");
        const { invoices, billingData } = payload1;
        const { transferNumber, datenaustauschreferenz, laufendeDatenannahmeImJahr } = transmissionIdentifiers(billingData, "");
        const sender = absender(billingData, invoices[0]);
        const dateiname = makeDateiname(billingData.testIndicator, transferNumber);
        const anwendungsreferenz = makeAnwendungsreferenz(billingData, sender.ik, "AO", laufendeDatenannahmeImJahr);
        const nutzdaten = makeNutzdaten(billingData, invoices, sender.ik, "000000011", datenaustauschreferenz, anwendungsreferenz);
        
        expect(dateiname).toEqual(result1.dateiname);
        expect(anwendungsreferenz).toEqual(result1.anwendungsreferenz);
        expect(nutzdaten.split("\n")).toEqual(result1.nutzdaten.split("\n"));
        MockDate.reset();
    });

    it("create billing with invoice type 2", () => {
        MockDate.set("2021-04-27T21:59");
        const { invoices, billingData } = payload2;
        const { transferNumber, datenaustauschreferenz, laufendeDatenannahmeImJahr } = transmissionIdentifiers(billingData, "");
        const sender = absender(billingData, invoices[0]);
        const dateiname = makeDateiname(billingData.testIndicator, transferNumber);
        const anwendungsreferenz = makeAnwendungsreferenz(billingData, sender.ik, "AO", laufendeDatenannahmeImJahr);
        const nutzdaten = makeNutzdaten(billingData, invoices, sender.ik, "000000011", datenaustauschreferenz, anwendungsreferenz);

        expect(dateiname).toEqual(result2.dateiname);
        expect(anwendungsreferenz).toEqual(result2.anwendungsreferenz);
        expect(nutzdaten.split("\n")).toEqual(result2.nutzdaten.split("\n"));
        MockDate.reset();
    });

    it("create billing with invoice type 3", () => {
        MockDate.set("2021-04-27T21:59");
        const { invoices, billingData } = payload3;
        const { transferNumber, datenaustauschreferenz, laufendeDatenannahmeImJahr } = transmissionIdentifiers(billingData, "");
        const sender = absender(billingData, invoices[0]);
        const dateiname = makeDateiname(billingData.testIndicator, transferNumber);
        const anwendungsreferenz = makeAnwendungsreferenz(billingData, sender.ik, "AO", laufendeDatenannahmeImJahr);
        const nutzdaten = makeNutzdaten(billingData, invoices, sender.ik, "000000011", datenaustauschreferenz, anwendungsreferenz);

        expect(dateiname).toEqual(result3.dateiname);
        expect(anwendungsreferenz).toEqual(result3.anwendungsreferenz);
        expect(nutzdaten.split("\n")).toEqual(result3.nutzdaten.split("\n"));
        MockDate.reset();
    });

    

})