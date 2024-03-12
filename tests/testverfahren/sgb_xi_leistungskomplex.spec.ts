import { createTransmissionSGBXI, groupInvoicesByRecipientSGBXI } from "../../src/transmission/index";
import kostentreagerJson from "../../dist/kostentraeger.min.json";
import { deserializeInstitutionLists } from "../../src/kostentraeger/json_serializer";
import { Einsatz, Invoice, LeistungskomplexverguetungLeistung } from "../../src/sgb-xi/types";
import { CareProviderLocationSchluessel } from "../../src/kostentraeger/types";
import { TarifbereichSchluessel, LeistungsartSchluessel } from "../../src/sgb-xi/codes";
import { BillingData, Address } from "../../src/types";
import { exampleSelfSignedCertificate } from "../samples/certificates";
import { decryptMessage } from "../../src/pki/pkcs";
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { OctetString, fromBER } from "asn1js";
import { ContentInfo, SignedData } from "pkijs";

type Leistungskomplex = {
    leistungsart: LeistungsartSchluessel,
    leistung: string,
    punktzahl?: number,
    einzelpreis?: number,
}
type Leistungskomplexname = 
    "kleineKoerperpflege" | 
    "grosseKoerperpflege" |
    "reinigung" |
    "zubereitungSonstigeMahlzeit" |
    "aufbereitungWarmeMahlzeit" |
    "beratung" |
    "erstbesuch";

type Vereinbarung = Record<Leistungskomplexname, Leistungskomplex>;

jest.setTimeout(10000);

describe("Testverfahren", () => {
    it("Testdateien erzeugen für AOK Plus", async () => {
        const { certificate, certificateAsDER, privateKey } = await exampleSelfSignedCertificate();
        const { invoicesWithRecipient, recipientNotFound } = await groupInvoicesByRecipientSGBXI(
            makeInvoices("SN", "13", "187299005", {
                kleineKoerperpflege: {
                    leistungsart: "01",
                    leistung: "1",
                    punktzahl: 370
                },
                grosseKoerperpflege: {
                    leistungsart: "01",
                    leistung: "3",
                    punktzahl: 580
                },
                reinigung: {
                    leistungsart: "01",
                    leistung: "12",
                    punktzahl: 130
                },
                zubereitungSonstigeMahlzeit: {
                    leistungsart: "01",
                    leistung: "16",
                    punktzahl: 70
                },
                aufbereitungWarmeMahlzeit: {
                    leistungsart: "01",
                    leistung: "16a",
                    punktzahl: 100
                },
                beratung: {
                    leistungsart: "09",
                    leistung: "17",
                    punktzahl: 900
                },
                erstbesuch: {
                    leistungsart: "01",
                    leistung: "18",
                    punktzahl: 1100
                }
            }, [{
                street: "Willy-Brandt-Platz",
                houseNumber: "5",
                postalCode: "04109",
                city: "Leipzig"
            }, {
                street: "Kiewer Straße",
                houseNumber: "30",
                postalCode: "04205",
                city: "Leipzig"
            }, {
                street: "Georg-Schumann-Straße",
                houseNumber: "290",
                postalCode: "04159",
                city: "Leipzig"
            }, {
                street: "Goldsternstraße",
                houseNumber: "58",
            }],
            0.05),
            institutionLists,
        );
        expect(invoicesWithRecipient).toHaveLength(1);
        expect(recipientNotFound).toHaveLength(0);

        const transmission = await createTransmissionSGBXI(
            invoicesWithRecipient[0],
            makeBillingdata(certificateAsDER, privateKey),
        );

        expect(transmission.errors).toBeUndefined();
        expect(transmission.result?.payloadFile).toBeDefined();
        expect(transmission.result?.instructionFile).toBeDefined();
        expect(transmission.result?.email).toBeDefined();

        if (transmission.result) {
            const { payloadFile, instructionFile, unencryptedPayloadFile } = transmission.result;

            if (!existsSync("temp")) {
                mkdirSync("temp");
            }

            writeFileSync("temp/" + payloadFile.name, Buffer.from(payloadFile.data));
            writeFileSync("temp/" + instructionFile.name, Buffer.from(instructionFile.data));

            // decrypt, verify and compare encrypted file to unencrypted file content
            const fileAsArrayBuffer = readFileSync("temp/" + payloadFile.name).buffer;
            const decryptedDataForSender = await decryptMessage(fileAsArrayBuffer, certificateAsDER, privateKey);
            expect(decryptedDataForSender).toBeDefined();
            const signedContentInfoForSender = new ContentInfo({ schema: fromBER(decryptedDataForSender || new ArrayBuffer(0)).result });
            const signedDataForSender = new SignedData({ schema: signedContentInfoForSender.content });
            const resultMessageBufferForSender = (signedDataForSender.encapContentInfo.eContent?.valueBlock.value[0] as OctetString)?.valueBlock.valueHex;
            const textDecoder = new TextDecoder();
            const resultMessageForSender = textDecoder.decode(resultMessageBufferForSender);
            expect(await signedDataForSender.verify({ signer: 0 })).toEqual(true);
            expect(resultMessageForSender).toEqual(textDecoder.decode(unencryptedPayloadFile.data));
        }
    });
});

const institutionLists = deserializeInstitutionLists(JSON.stringify(kostentreagerJson));

const previousMonth = () => {
    const month = new Date();
    month.setMonth(month.getMonth() - 1);
    month.setDate(1);
    month.setHours(0, 0, 0, 0);
    return month;
};

const makeBillingdata = (senderCertificate: ArrayBuffer, senderPrivateKey: ArrayBuffer): BillingData => ({
    rechnungsart: "1",
    abrechnungsmonat: previousMonth(),
    testIndicator: "0",
    datenaustauschreferenzJeEmpfaengerIK: {},
    laufendeDatenannahmeImJahrJeEmpfaengerIK: {},
    rechnungsnummerprefix: "2021-0042",
    senderCertificate,
    senderPrivateKey,
});

const makeInvoices = (
    location: CareProviderLocationSchluessel,
    tarifbereich: TarifbereichSchluessel,
    pflegekasseIK: string,
    vereinbarung: Vereinbarung,
    addresses: Address[],
    punktwert?: number,
): Invoice[] => {
    return [{
        leistungserbringer: {
            name: "Fiktiver ambulanter Pflegedienst",
            ik: "000000000",
            ansprechpartner: [{
                name: "Erika Mustermann"
            }],
            abrechnungscode: "39",
            location,
            tarifbereich,
            sondertarifJeKostentraegerIK: {},
            umsatzsteuerBefreiung: "01",
            email: "hallo@coopcare.de",
        },
        faelle: [{
            versicherter: {
                firstName: "Erika",
                lastName: "Bauer",
                birthday: new Date(1936, 0, 17),
                pflegekasseIK,
                versichertennummer: "A000000000",
                pflegegrad: "3",
                address: addresses[0]
            },
            einsaetze: [
                ...makeEinsatzList(
                    [vereinbarung.kleineKoerperpflege, vereinbarung.zubereitungSonstigeMahlzeit],
                    new Date(2021, 0, 1, 8, 0),
                    1,
                    punktwert
                ),
                ...makeEinsatzList(
                    [vereinbarung.aufbereitungWarmeMahlzeit],
                    new Date(2021, 0, 1, 13, 0),
                    1,
                    punktwert
                ),
            ]
        }, {
            versicherter: {
                firstName: "Elfriede",
                lastName: "Richter",
                birthday: new Date(1938, 5, 4),
                pflegekasseIK,
                versichertennummer: "B000000000",
                pflegegrad: "2",
                address: addresses[1]
            },
            einsaetze: makeEinsatzList(
                [vereinbarung.grosseKoerperpflege, vereinbarung.reinigung],
                new Date(2021, 0, 1, 9, 0),
                2,
                punktwert
            ),
        }, {
            versicherter: {
                firstName: "Manfred",
                lastName: "Schneider",
                birthday: new Date(1943,2,7),
                pflegekasseIK,
                versichertennummer: "C000000000",
                pflegegrad: "2",
                address: addresses[2]
            },
            einsaetze: [
                ...makeEinsatzList(
                    [vereinbarung.erstbesuch],
                    new Date(2021, 0, 12, 16, 0),
                    0,
                    punktwert
                ),
                ...makeEinsatzList(
                    [vereinbarung.aufbereitungWarmeMahlzeit, vereinbarung.reinigung],
                    new Date(2021, 0, 26, 12, 30),
                    1,
                    punktwert
                ),
            ]
        }, {
            versicherter: {
                firstName: "Peter",
                lastName: "Weber",
                birthday: new Date(1944, 8, 24),
                pflegekasseIK,
                versichertennummer: "D000000000",
                pflegegrad: "3",
                address: addresses[3]
            },
            einsaetze: makeEinsatzList(
                [vereinbarung.beratung],
                new Date(2021, 0, 21, 15, 0),
                0,
                punktwert
            ),
        }]
    }]
}

const makeEinsatzList = (
    leistungen: Leistungskomplex[], 
    leistungsBeginn: Date, 
    repetition = 0,
    punktwert?: number
): Einsatz[] => {
    const month = previousMonth();
    const lastDayOfMonth = (new Date(month.getFullYear(), month.getMonth() + 1, 0)).getDate();
    leistungsBeginn.setMonth(month.getMonth());
    leistungsBeginn.setFullYear(month.getFullYear());
    let einsatzDates = [leistungsBeginn];
    let nextEinsatzDay = leistungsBeginn.getDate() + repetition;

    while (repetition > 0 && nextEinsatzDay <= lastDayOfMonth) {
        const date = new Date(
            month.getFullYear(), 
            month.getMonth(), 
            nextEinsatzDay, 
            leistungsBeginn.getHours(), 
            leistungsBeginn.getMinutes()
        );
        einsatzDates.push(date);
        nextEinsatzDay += repetition;
    }

    return einsatzDates.map(leistungsBeginn => ({
        leistungsBeginn,
        leistungen: leistungen.map(({leistungsart, leistung: leistungskomplex, punktzahl, einzelpreis}) => ({
            verguetungsart: "01",
            qualifikationsabhaengigeVerguetung: "1",
            leistungsart,
            leistungsBeginn,
            leistungskomplex,
            anzahl: 1,
            punktzahl,
            punktwert,
            einzelpreis: einzelpreis == undefined && punktzahl != undefined && punktwert != undefined
                ? punktzahl * punktwert
                : einzelpreis,
            zuschlaege: []
        } as LeistungskomplexverguetungLeistung))
    } as Einsatz));
}

