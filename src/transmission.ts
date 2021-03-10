// TODO: filename format for SGB V
export const filename = (
    senderType: "PL",
    billingMonth: Date,
    transmissionVersion: number,
    transmissionIndexForCurrentYear: number,
    billingType: "S" | "A",
    payerAbbreviation: string
) => [
    senderType,
    (billingMonth.getMonth() + 1).toString().padStart(2, "0") + 
        billingMonth.getFullYear().toString().substr(2, 1),
    transmissionVersion,
    transmissionIndexForCurrentYear,
    billingType,
    payerAbbreviation
].join("")