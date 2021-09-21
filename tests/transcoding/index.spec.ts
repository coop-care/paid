import { isEncodableI8, encodeI8, decodeI8 } from "../../src/transcoding/din66003drv"


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

});