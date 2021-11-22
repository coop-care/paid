import { transliterateRecursively } from "../../src/transcoding";
import { isEncodableI8, encodeI8, decodeI8, transliterateI8 } from "../../src/transcoding/din66003drv"
import { ValidationError, ValidationResultType } from "../../src/validation/index";
import { payload3 } from "../samples/billingPayloads";


describe("transcoding to I8", () => {

    it("string is encodable to I8", () => {
        expect(isEncodableI8("außergewöhnlich, spécial, særlig \n")).toEqual(true);
    });

    it("string is not encodable to I8", () => {
        expect(isEncodableI8("außergewöhnlich, spécial, zwłaszcza")).toEqual(false);
    });

    it("encode string to I8", () => {
        expect(encodeI8("außergewöhnlich, spécial, særlig \n"))
        .toEqual(new Uint8Array([
            97, 117, 126, 101, 114, 103, 101,
            119, 124, 104, 110, 108, 105, 99,
            104, 44, 32, 115, 112, 233, 99,
            105, 97, 108, 44, 32, 115, 230,
            114, 108, 105, 103, 32, 10
        ]));
    });

    it("encode string to I8 and decode back to UTF-8", () => {
        expect(decodeI8(encodeI8("außergewöhnlich, spécial, særlig \r\n\t")))
            .toEqual("außergewöhnlich, spécial, særlig \r\n\t");
    });

    it("transliterate string for I8", () => {
        expect(transliterateI8("Schöne Grüße an René François Lacôte, Małgorzata Dąbrowski, Nærøy, Борис Николаевич Ельцин, Δημήτρης Φωτόπουλος, אברהם הלוי פרנקל, Trần Hưng Đạo, สงขลา, கன்னியாகுமரி, महासमुंद, 深圳!\r\n\t"))
            .toEqual("Schöne Grüße an René François Lacôte, Malgorzata Dabrowski, Nærøy, Boris Nikolaevich El'tsin, Dimitris Fotopoylos, 'vrhm hlvy frnkl, Tran Hung Dao, sngkhla, knniyakumri, mhasmumd, ShenZhen!\r\n\t");
    });

    it("recursively transliterate billing data and invoices for I8", () => {
        const { transliterated, warnings } = transliterateRecursively(payload3, transliterateI8);

        expect(transliterated).not.toEqual(payload3);
        expect(transliterated).toEqual({
            ...payload3,
            invoices: [{
                ...payload3.invoices[0],
                faelle: [{
                        ...payload3.invoices[0].faelle[0],
                        versicherter: {
                            ...payload3.invoices[0].faelle[0].versicherter,
                            firstName: "Malgorzata",
                            lastName: "Dabrowski"
                        }
                    },
                    payload3.invoices[0].faelle[1],
                    payload3.invoices[0].faelle[2]
                ]
            }, payload3.invoices[1]]
        });
        expect(warnings).toEqual([{
            code: "textTransliterated",
            type: ValidationResultType.Warning,
            path: ["invoices", "0", "faelle", "0", "versicherter", "firstName"],
            params: {
                transliteratedValue: "Malgorzata"
            }
        }, {
            code: "textTransliterated",
            type: ValidationResultType.Warning,
            path: ["invoices", "0", "faelle", "0", "versicherter", "lastName"],
            params: {
                transliteratedValue: "Dabrowski"
            }
        }] as ValidationError[]);
    });

});