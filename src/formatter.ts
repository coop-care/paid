/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

/* The documentation is vague on whether the decimal notation character (usually ",") should be 
   escaped or not, so we asked GKV-Spitzenverband.
   
   They answered that the decimal notation is NOT escaped:
   
   > Hier handelt es sich um eine Ungenauigkeit in der Technischen Anlage. Das Komma ist als 
   > Dezimalzeichen vorgesehen, aber nicht als Trennzeichen im Sinne der EDIFACT-Syntax. Somit ist
   > das Komma nicht zu maskieren. Zu maskieren sind nur die Zeichen Doppelpunkt, Plus und Apostroph.
*/
export const mask = (value: string) => value.replace(/([:+?'])/g, "?$1");

export const number = (value?: number, fractionDigits?: number) => value?.toLocaleString("de-DE", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    useGrouping: false
}) || "";

export const price = (value?: number) => number(value, 2);

export const day = (value: Date) => value.getDate().toString().padStart(2, "0");

export const month = (value: Date) => (value.getMonth() + 1).toString().padStart(2, "0");

export const date = (value: Date) => value.getFullYear() + month(value) + day(value);

export const time = (value: Date) =>
    value.getHours().toString().padStart(2, "0") +
    value.getMinutes().toString().padStart(2, "0");

export const datetime = (value: Date) => date(value) + ":" + time(value);

export const segment = (
    // undefined: value does not appear in segment
    // empty string: value appears as empty value in segment
    ...values: Array<string | undefined>
) => values.filter(value => value !== undefined).join("+").replace(/\+*$/, "") + "'\n";