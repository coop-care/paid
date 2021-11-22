import { groupInvoicesByRecipientSGBXI, validateForTransmissionSGBXI } from "../../src/transmission";
import { payload2 } from "../samples/billingPayloads";
import kostentreagerJson from "../../dist/kostentraeger.min.json";
import { deserializeInstitutionLists } from "../../src/kostentraeger/json_serializer";
import { Invoice } from "../../src/sgb-xi/types";

describe("transmission", () => {

    it("trying to group invoices without finding a recipient", async () => {
        const { invoicesWithRecipient, recipientNotFound } = groupInvoicesByRecipientSGBXI(payload2.invoices, []);
        expect(invoicesWithRecipient).toHaveLength(0);
        expect(recipientNotFound).toHaveLength(2);
    });

    it("validate SGB XI invoices and billing data for transmission", async () => {
        const { invoicesWithRecipient, recipientNotFound } = groupInvoicesByRecipientSGBXI(
            replaceWithRealPflegekasseIK(payload2.invoices),
            makeInstitutionLists()
        );
        expect(invoicesWithRecipient).toHaveLength(2);
        expect(recipientNotFound).toHaveLength(0);

        const { errors, warnings } = await validateForTransmissionSGBXI(payload2.billingData, invoicesWithRecipient[0]);
        expect(errors).toEqual([{
            code: "throwsError",
            type: 1,
            path: ["billingData", "senderCertificate"],
            message: "Error: Object's schema was not verified against input data for Certificate",
        }]);
        expect(warnings).toEqual([{
            code: "textTruncated",
            type: 0,
            path: [
                "invoicesWithRecipient",
                "invoices",
                0,
                "leistungserbringer",
                "name"
            ],
            message: undefined,
            params: {
                maxLength: "30",
                truncatedValue: "Nachbarschaftspflege in Wilhel"
            }
        }]);
    });

});

const replaceWithRealPflegekasseIK = (invoices: Invoice[]) => {
    const pflegekasseIKs = ["105067999", "102314376", "102114261"];
    const updatedInvoices = invoices.slice();
    let index = 0;
    updatedInvoices.forEach(invoice =>
        invoice.faelle.forEach(fall =>
            fall.versicherter.pflegekasseIK = pflegekasseIKs[index++ % pflegekasseIKs.length]
        )
    );
    return updatedInvoices;
}

const makeInstitutionLists = () => deserializeInstitutionLists(JSON.stringify(kostentreagerJson));
