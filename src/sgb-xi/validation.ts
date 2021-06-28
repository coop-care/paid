/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

import { BillingData, Invoice } from "../types";

const messages = {
  "requiredValueMissing": "The property \"{key}\" is required.",
  "textIsTruncated": "The property \"{key}\" will be truncated, because it is longer than {maxLength} characters.",
  "textIsTooLong": "The property \"{key}\" may not be longer than {maxLength} characters.",
  "textHasIncorrectLength": "The property \"{key}\" must have exactly {length} characters.",
  "lessThanMinimumValue": "The property \"{key}\" may not be less than {minValue}.",
  "institutionskennzeichenIncorrect": "The property \"{key}\" must consist of 9 digits.",
  "invoiceNumberIncorrect": "The property \"{key}\" may only contain the caracters a-z, A-Z, 0-9 and the separators '-' and '/', though it may not begin or end with a separator.",
};

export type ValidationPath = Array<string | number>;

export type ValidationCode = keyof typeof messages;

export type ValidationResult = {
  code: ValidationCode;
  path?: ValidationPath;
  params?: Record<string, string>;
  message?: string;
}

const addMessage = (result: ValidationResult) => {
  let message: string = messages[result.code] || "";

  Object.entries(result.params || {}).forEach(([key, value]) => 
    message = message.replace(new RegExp("{" + key + "}", "g"), value)
  );

  return {...result, message};
};

const requiredValueMissing = (key: string): ValidationResult => ({
  code: "requiredValueMissing",
  params: {key}
});

const textIsTruncated = (key: string, maxLength: number): ValidationResult => ({
  code: "textIsTruncated",
  params: { key, maxLength: maxLength.toString() }
});

const textIsTooLong = (key: string, maxLength: number): ValidationResult => ({
  code: "textIsTooLong",
  params: { key, maxLength: maxLength.toString() }
});

const textHasIncorrectLength = (key: string, length: number): ValidationResult => ({
  code: "textHasIncorrectLength",
  params: { key, length: length.toString() }
});

const lessThanMinimumValue = (key: string, minValue: number): ValidationResult => ({
  code: "lessThanMinimumValue",
  params: { key, minValue: minValue.toString() }
});

const institutionskennzeichenIncorrect = (key: string): ValidationResult => ({
  code: "institutionskennzeichenIncorrect",
  params: { key }
});

const invoiceNumberIncorrect = (key: string): ValidationResult => ({
  code: "invoiceNumberIncorrect",
  params: { key }
});

// notify on undefined, null and empty string values for required keys of target object
const isMissing = <T>(target: T, requiredKeys: (keyof T)[], path: ValidationPath): ValidationResult[] => 
  !target
    ? []
    : requiredKeys.filter(key => 
        target[key] == undefined || 
        (target[key] as any) === "" ||
        (Array.isArray(target[key]) && (target[key] as any).length == 0)
      )
      .map(key => ({
        code: "requiredValueMissing",
        params: {
          key: key.toString()
        },
        path,
      }));

const isTruncated = <T>(target: T, keyAndMaxLength: [keyof T, number][], path: ValidationPath): ValidationResult[] =>
  keyAndMaxLength.flatMap(([key, maxLength]) =>
    ((!!target && (target[key] as any)?.length as number) || 0) > maxLength
      ? [{
        code: "textIsTruncated",
        params: {
          key: key.toString(),
          maxLength: maxLength.toString(),
        },
        path
      }]
      : []
  );

const isFailing = (
  conditions: Array<boolean | ValidationResult>,
  path: ValidationPath
): ValidationResult[] =>
  conditions.flatMap(value => 
    typeof value == "boolean" 
      ? []
      : [{...value, path}]
  );

const failingIK = (ik = "") => !/\d{9}/.test(ik);

const failingInvoiceNumber = (value = "") => !/^[a-z0-9][a-z0-9/-]*[a-z0-9]$/i.test(value);

export const validate = (invoices: Invoice[], billing: BillingData) => {
  let errors: ValidationResult[] = [];
  let warnings: ValidationResult[] = [];

  errors = errors.concat(
    isMissing(billing, [
      "datenaustauschreferenzJeEmpfaengerIK",
      "dateiindikator",
      "rechnungsart",
      "rechnungsnummerprefix",
      "abrechnungsmonat",
      "laufendeDatenannahmeImJahrJeEmpfaengerIK",
    ], ["billing"])
  ).concat(
    isFailing([
      billing?.rechnungsnummerprefix.length <= 9 
        || textIsTooLong("rechnungsnummerprefix", 9),
      !failingInvoiceNumber(billing?.rechnungsnummerprefix)
        || invoiceNumberIncorrect("rechnungsnummerprefix"),
      Object.values(billing?.datenaustauschreferenzJeEmpfaengerIK || {}).every(value => value >= 1)
        || lessThanMinimumValue("datenaustauschreferenzJeEmpfaengerIK", 1),
      Object.keys(billing?.datenaustauschreferenzJeEmpfaengerIK || {}).every(ik => !failingIK(ik))
        || institutionskennzeichenIncorrect("datenaustauschreferenzJeEmpfaengerIK"),
      Object.values(billing?.laufendeDatenannahmeImJahrJeEmpfaengerIK || {}).every(value => value >= 1)
        || lessThanMinimumValue("laufendeDatenannahmeImJahrJeEmpfaengerIK", 1),
      Object.keys(billing?.laufendeDatenannahmeImJahrJeEmpfaengerIK || {}).every(ik => !failingIK(ik))
        || institutionskennzeichenIncorrect("laufendeDatenannahmeImJahrJeEmpfaengerIK"),
    ], ["billing"])
  ).concat(
    billing.rechnungsart == "1"
      ? []
      : isMissing(billing, [
          "abrechnungsstelle"
        ], ["billing"])
        .concat(
          !billing?.abrechnungsstelle
            ? []
            : isMissing(billing.abrechnungsstelle, [
                "name",
                "ik",
              ], ["billing", "abrechnungsstelle"])
              .concat(
                isFailing([
                  !failingIK(billing?.abrechnungsstelle?.ik) 
                  || institutionskennzeichenIncorrect("abrechnungsstelleIK")
                ], ["billing", "abrechnungsstelle"])
              )
        )
  ).concat(
    invoices?.flatMap((invoice, invoiceIndex) => 
      isMissing(invoice, [
        "leistungserbringer",
        "faelle",
      ], ["invoices", invoiceIndex])
      .concat(
        isMissing(invoice?.leistungserbringer, [
          "name",
          "ik",
          "abrechnungscode",
          "tarifbereich",
          "sondertarifJeKostentraegerIK"
        ], ["invoices", invoiceIndex, "leistungserbringer"])
      )
      .concat(
        isFailing([
          !failingIK(invoice?.leistungserbringer?.ik)
            || institutionskennzeichenIncorrect("leistungserbringerIK"),
          (invoice?.leistungserbringer?.umsatzsteuerBefreiung == "01"
            || !!invoice?.leistungserbringer?.umsatzsteuerOrdnungsnummer)
            || requiredValueMissing("umsatzsteuerOrdnungsnummer"),
          Object.keys(invoice?.leistungserbringer?.sondertarifJeKostentraegerIK || {})
            .every(ik => !failingIK(ik))
            || institutionskennzeichenIncorrect("sondertarifJeKostentraegerIK"),
          Object.values(invoice?.leistungserbringer?.sondertarifJeKostentraegerIK || {})
            .every(value => value.length == 3)
            || textHasIncorrectLength("sondertarifJeKostentraegerIK", 3),
        ], ["invoices", invoiceIndex, "leistungserbringer"])
      ).concat(
        invoice?.faelle.flatMap((fall, fallIndex) =>
          isMissing(fall, [
            "versicherter",
            "einsaetze"
          ], ["invoices", invoiceIndex, "faelle", fallIndex])
          .concat(
            isMissing(fall?.versicherter, [
              "pflegekasseIK",
              "kostentraegerIK",
              "versichertennummer",
              "pflegegrad",
              "firstName",
              "lastName",
              "birthday",
            ], ["invoices", invoiceIndex, "faelle", fallIndex, "versicherter"])
          ).concat(
            isFailing([
              !failingIK(fall?.versicherter?.pflegekasseIK)
                || institutionskennzeichenIncorrect("pflegekasseIK"),
              !failingIK(fall?.versicherter?.kostentraegerIK)
                || institutionskennzeichenIncorrect("kostentraegerIK"),
              fall?.versicherter?.versichertennummer.length <= 20
                || textIsTooLong("versichertennummer", 20),
            ], ["invoices", invoiceIndex, "faelle", fallIndex, "versicherter"])
          ).concat(
            fall?.einsaetze?.flatMap((einsatz, einsatzIndex) =>
              isMissing(einsatz, [
                "leistungen"
              ], ["invoices", invoiceIndex, "faelle", fallIndex, "einsaetze", einsatzIndex])
              .concat(
                isFailing([
                  (einsatz?.leistungen?.every(leistung =>
                    !["01", "02", "03", "06"].includes(leistung?.verguetungsart)
                  ) || !!einsatz?.leistungsBeginn)
                    || requiredValueMissing("leistungsBeginn"),
                ], ["invoices", invoiceIndex, "faelle", fallIndex, "einsaetze", einsatzIndex])
              ).concat(einsatz?.leistungen?.flatMap((leistung, leistungIndex) => 
                isMissing(leistung, [
                  "leistungsart",
                  "verguetungsart",
                  "qualifikationsabhaengigeVerguetung",
                  "leistung",
                  "einzelpreis",
                  "anzahl",
                ], ["invoices", invoiceIndex, "faelle", fallIndex, "einsaetze", einsatzIndex, "leistungen", leistungIndex])
                .concat(
                  isFailing([
                    (leistung?.verguetungsart != "04" || !!leistung?.leistungsBeginn)
                      || requiredValueMissing("leistungsBeginn"),
                    (!["01", "02", "03", "04"].includes(leistung?.verguetungsart) 
                      || !!leistung?.leistungsEnde)
                      || requiredValueMissing("leistungsEnde"),
                    (leistung?.verguetungsart != "06" 
                      || leistung?.leistung != "04" 
                      || leistung?.gefahreneKilometer != undefined)
                      || requiredValueMissing("gefahreneKilometer"),
                    (leistung?.leistungsart != "06" || !!leistung.hilfsmittel)
                      || requiredValueMissing("hilfsmittel"),
                  ], ["invoices", invoiceIndex, "faelle", fallIndex, "einsaetze", einsatzIndex, "leistungen", leistungIndex])
                ).concat(
                  (leistung?.zuschlaege || []).flatMap((zuschlag, zuschlagIndex) =>
                    isMissing(zuschlag, [
                      "zuschlagsart",
                      "zuschlag",
                      "zuschlagszuordnung",
                      "zuschlagsberechnung",
                      "istAbzugStattZuschlag",
                      "wert"
                    ], ["invoices", invoiceIndex, "faelle", fallIndex, "einsaetze", einsatzIndex, "leistungen", leistungIndex, "zuschlaege", zuschlagIndex])
                  )
                )
              ))
            )
          )
        )
      )
    )
  ).map(addMessage);

  warnings = warnings.concat(
    !billing?.abrechnungsstelle
    ? []
    : isTruncated(billing?.abrechnungsstelle, [
        ["name", 30]
      ], ["billing", "abrechnungsstelle"])
      .concat(
        isFailing([
          billing?.abrechnungsstelle?.ansprechpartner?.every(ansprechpartner =>
            Object.values(ansprechpartner).filter(Boolean).join(", ").length <= 30
          ) || textIsTruncated("ansprechpartner", 30),
        ], ["billing", "abrechnungsstelle"])
      )
  ).concat(
    invoices?.flatMap((invoice, invoiceIndex) =>
      isTruncated(invoice?.leistungserbringer, [
        ["name", 30]
      ], ["invoices", invoiceIndex, "leistungserbringer"])
      .concat(
        isFailing([
          invoice?.leistungserbringer?.ansprechpartner?.every(ansprechpartner =>
            Object.values(ansprechpartner).filter(Boolean).join(", ").length <= 30
          ) || textIsTruncated("ansprechpartner", 30),
        ], ["invoices", invoiceIndex, "leistungserbringer"])
      )
      .concat(
        invoice?.faelle?.flatMap((fall, fallIndex) =>
          isTruncated(fall?.versicherter, [
            ["firstName", 45],
            ["lastName", 45],
            ["street", 46],
            ["houseNumber", 9],
            ["postalCode", 10],
            ["city", 40],
          ], ["invoices", invoiceIndex, "faelle", fallIndex, "versicherter"])
          .concat(
            fall?.einsaetze?.flatMap((einsatz, einsatzIndex) =>
              einsatz?.leistungen?.flatMap((leistung, leistungIndex) =>
                (!leistung?.hilfsmittel
                  ? []
                  : isTruncated(leistung?.hilfsmittel, [
                      ["genehmigungskennzeichen", 15],
                      ["bezeichnungPflegehilfsmittel", 30],
                      ["inventarnummerPflegehilfsmittel", 15]
                    ], ["invoices", invoiceIndex, "faelle", fallIndex, "einsaetze", einsatzIndex, "leistungen", leistungIndex, "hilfsmittel"])
                ).concat(
                  leistung?.zuschlaege?.flatMap((zuschlag, zuschlagIndex) => 
                    isTruncated(zuschlag, [
                      ["beschreibungZuschlagsart", 50]
                    ], ["invoices", invoiceIndex, "faelle", fallIndex, "einsaetze", einsatzIndex, "leistungen", leistungIndex, "zuschlaege", zuschlagIndex])
                  )
                )
              )
            )
          )
        )
      )
    )
  ).map(addMessage);

  return {errors, warnings};
}
