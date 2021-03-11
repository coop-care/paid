import { FileType } from "../types";
import { mask, number, price, day, month, date, time, datetime, segment } from "../formatter";

const Syntax_Version = "UNOC:3";
const PLGA_Version = "PLGA:2"; // Pflegeleistungserbringer Gesamtaufstellung der Abrechnung
const PLAA_Version = "PLAA:3"; // Pflegeleistungserbringer Abrechnungsdaten je Abrechnungsfall
const DefaultCurrency = "EUR";

export const UNB = (
    senderID: string,
    receiverID: string,
    transmissionIndex: number, 
    filename: string,
    fileType: FileType
) => segment(
    "UNB", 
    Syntax_Version,
    senderID,
    receiverID,
    datetime(new Date()),
    transmissionIndex.toString(),
    filename,
    fileType.toString()
);

export const UNZ = (
    numberOfUNH: number,
    transmissionIndex: number, 
) => segment(
    "UNZ",
    numberOfUNH.toString(),
    transmissionIndex.toString()
);

export const UNH = (
    indexOfUNH: number,
    isPLGA = false,
) => segment(
    "UNH",
    indexOfUNH.toString(),
    isPLGA ? PLGA_Version : PLAA_Version
);

export const UNT = (
    numberOfSegments: number, // including UNH and UNT
    indexOfUNH: number
) => segment(
    "UNT",
    numberOfSegments.toString(),
    indexOfUNH.toString()
);

export const FKT = (
    processingCode: string, // TODO: custom type?
    providerID: string, // the party who gets the money
    payerID: string, // party who pays the money
    insuranceID: string,
    senderID: string,
    combinedBilling?: boolean, // only for PLGA, undefined for PLAA
) => segment(
    "FKT",
    processingCode,
    combinedBilling === undefined
        ? undefined
        : combinedBilling
        ? "J"
        : "",
    providerID,
    payerID,
    combinedBilling !== true ? insuranceID : "",
    senderID
);

export const REC = (
    invoiceNumber: string,
    singleInvoiceNumber = "0",
    invoiceDate: Date,
    invoiceCode: string, // TODO: custom type?
    currency = DefaultCurrency
) => segment(
    "REC",
    mask(invoiceNumber) + ":" + mask(singleInvoiceNumber),
    date(invoiceDate),
    invoiceCode,
    currency
);

export const SRD = (
    billingCode: string, // TODO: custom type?
    payScaleCode: string, // TODO: custom type?
    typeOfServiceCode: string, // TODO: custom type?
) => segment(
    "SRD",
    billingCode + ":" + payScaleCode,
    typeOfServiceCode
);

export const UST = (
    taxOrdinalNumber = "",
    vatExemptionCode = "", // TODO: custom type?
) => segment(
    "UST",
    mask(taxOrdinalNumber),
    vatExemptionCode.length ? "J" : "",
    vatExemptionCode
);

export const GES = (
    totalGrossAmounts: number, // = totalInvoiceAmount + totalCoPaymentAmounts + totalAidAmounts + vatAmount
    totalInvoiceAmount: number,
    totalCoPaymentAmounts?: number,
    totalAidAmounts?: number,
    vatAmount?: number,
) => segment(
    "GES",
    price(totalGrossAmounts),
    price(totalCoPaymentAmounts),
    price(totalAidAmounts),
    price(totalInvoiceAmount),
    price(vatAmount)
);

export const NAM = (
    name1: string,
    name2 = "",
    name3 = "",
    name4 = ""
) => segment(
    "NAM",
    mask(name1.substr(0, 30)),
    mask(name2.substr(0, 30)),
    mask(name3.substr(0, 30)),
    mask(name4.substr(0, 30)),
);

export const INV = (
    insuranceNumber: string,
    documentNumber: string
) => segment(
    "INV",
    mask(insuranceNumber),
    mask(documentNumber)
);

export const NAD = (
    firstName: string,
    lastName: string,
    birthday: Date,
    street = "",
    houseNumber = "",
    postalCode = "",
    city = ""
) => segment(
    "NAD",
    mask(firstName.substr(0, 45)),
    mask(lastName.substr(0, 45)),
    date(birthday),
    mask(street.substr(0, 46)),
    mask(houseNumber.substr(0, 9)),
    mask(postalCode.substr(0, 10)),
    mask(city.substr(0, 40))
);

export const MAN = (
    monthOfService: Date,
    careLevelCode: string // TODO: custom type?
) => segment(
    "MAN",
    monthOfService.getFullYear() + month(monthOfService),
    "", // "Pflegestufe", obsolete
    "", // "Pflegeklasse", obsolete
    careLevelCode
);

export const ESK = (
    serviceStartDate: Date,
    remunerationCode: string, // TODO: custom type?
) => segment(
    "ESK",
    day(serviceStartDate),
    ["01", "02", "03", "06"].includes(remunerationCode) ? time(serviceStartDate) : ""
);

export const ELS = (
    typeOfServiceCode: string, // TODO: custom type?
    remunerationCode: string, // TODO: custom type?
    qualificationDependentRemunerationCode: string, // TODO: custom type?
    serviceCode: string, // TODO: custom types?
    unitPrice: number,
    quantity: number,
    serviceStartDate?: Date, // for typeOfServiceCode 04
    serviceEndDate?: Date, // for typeOfServiceCode 01, 02, 03, 04
    distanceKilometers?: number, // for typeOfServiceCode 06 with
    pointValue?: number,
    pointScore?: number,
) => {
    let details = "00";

    if (remunerationCode == "01") {
        details = serviceEndDate ? time(serviceEndDate) : "00";
    } else if (remunerationCode == "02" && serviceEndDate) {
        details = time(serviceEndDate);
    } else if (remunerationCode == "03" && serviceEndDate) {
        details = time(serviceEndDate);
    } else if (remunerationCode == "04" && serviceStartDate && serviceEndDate) {
        details = day(serviceStartDate) + day(serviceEndDate);
    } else if (remunerationCode == "06" && serviceCode == "04" 
            && distanceKilometers != undefined) {
        details = number(distanceKilometers, 0)
    }

    return segment(
        "ELS",
        [
            typeOfServiceCode,
            remunerationCode,
            qualificationDependentRemunerationCode,
            serviceCode
        ].join(":"),
        price(unitPrice),
        number(pointValue, 5),
        number(pointScore, 0),
        details,
        number(quantity, 2)
    )
};

export const ZUS = (
    isLast: boolean,
    payScaleCode: string, // TODO: custom type?
    additionTypeCode: string, // TODO: custom type?
    additionCode: string, // TODO: custom type?
    additionAssignmentCode: "0" | "1", // TODO: custom type?
    additionCalculationCode: string, // TODO: custom type?
    isDeduction: boolean,
    additionValue: number,
    cumulativeAmount: number,
    additionTitle?: string,
) => segment(
    "ZUS",
    [payScaleCode, additionTypeCode, additionCode].join(":"),
    mask(additionTitle?.substr(0, 50) || ""),
    additionAssignmentCode,
    additionCalculationCode,
    isDeduction ? "0" : "1",
    number(additionValue, 5),
    price(cumulativeAmount),
    isLast? "1" : "0"
);

export const HIL = (
    vatCode = "", // TODO: custom type?
    vatAmount?: number,
    coPaymentAmount?: number,
    approvalIdentifier = "",
    approvalDate?: Date,
    assistiveTechnologyCode = "", // TODO: custom type?
    assistiveTechnologyTitle = "",
    assistiveTechnologyFeatureCode = "",
    inventoryNumber = "",
) => segment(
    "HIL",
    vatCode,
    price(vatAmount),
    price(coPaymentAmount),
    mask(approvalIdentifier.substr(0, 15)),
    approvalDate ? date(approvalDate) : "",
    assistiveTechnologyCode,
    mask(assistiveTechnologyTitle.substr(0, 30)),
    mask(assistiveTechnologyFeatureCode.substr(0, 10)),
    mask(inventoryNumber.substr(0, 20)),
);

export const IAF = (
    grossAmount: number, // = invoiceAmount + coPaymentAmount + aidAmount + vatAmount
    invoiceAmount: number,
    coPaymentAmount?: number,
    aidAmount?: number,
) => segment(
    "IAF",
    price(grossAmount),
    price(coPaymentAmount),
    price(aidAmount),
    price(invoiceAmount),
);
