import anyAscii from "any-ascii";

export const I7 = {
    "\u0000": 0x00,
    "\u0001": 0x01,
    "\u0002": 0x02,
    "\u0003": 0x03,
    "\u0004": 0x04,
    "\u0005": 0x05,
    "\u0006": 0x06,
    "\u0007": 0x07,
    "\u0008": 0x08,
    "\u0009": 0x09,
    "\u000a": 0x0a,
    "\u000b": 0x0b,
    "\u000c": 0x0c,
    "\u000d": 0x0d,
    "\u000e": 0x0e,
    "\u000f": 0x0f,

    "\u0010": 0x10,
    "\u0011": 0x11,
    "\u0012": 0x12,
    "\u0013": 0x13,
    "\u0014": 0x14,
    "\u0015": 0x15,
    "\u0016": 0x16,
    "\u0017": 0x17,
    "\u0018": 0x18,
    "\u0019": 0x19,
    "\u001a": 0x1a,
    "\u001b": 0x1b,
    "\u001c": 0x1c,
    "\u001d": 0x1d,
    "\u001e": 0x1e,
    "\u001f": 0x1f,

    " ": 0x20,
    "!": 0x21,
    "\"": 0x22,
    "#": 0x23,
    "$": 0x24,
    "%": 0x25,
    "&": 0x26,
    "'": 0x27,
    "(": 0x28,
    ")": 0x29,
    "*": 0x2a,
    "+": 0x2b,
    ",": 0x2c,
    "-": 0x2d,
    ".": 0x2e,
    "/": 0x2f,

    "0": 0x30,
    "1": 0x31,
    "2": 0x32,
    "3": 0x33,
    "4": 0x34,
    "5": 0x35,
    "6": 0x36,
    "7": 0x37,
    "8": 0x38,
    "9": 0x39,
    ":": 0x3a,
    ";": 0x3b,
    "<": 0x3c,
    "=": 0x3d,
    ">": 0x3e,
    "?": 0x3f,

    "§": 0x40,
    "A": 0x41,
    "B": 0x42,
    "C": 0x43,
    "D": 0x44,
    "E": 0x45,
    "F": 0x46,
    "G": 0x47,
    "H": 0x48,
    "I": 0x49,
    "J": 0x4a,
    "K": 0x4b,
    "L": 0x4c,
    "M": 0x4d,
    "N": 0x4e,
    "O": 0x4f,

    "P": 0x50,
    "Q": 0x51,
    "R": 0x52,
    "S": 0x53,
    "T": 0x54,
    "U": 0x55,
    "V": 0x56,
    "W": 0x57,
    "X": 0x58,
    "Y": 0x59,
    "Z": 0x5a,
    "Ä": 0x5b,
    "Ö": 0x5c,
    "Ü": 0x5d,
    "^": 0x5e,
    "_": 0x5f,

    "`": 0x60,
    "a": 0x61,
    "b": 0x62,
    "c": 0x63,
    "d": 0x64,
    "e": 0x65,
    "f": 0x66,
    "g": 0x67,
    "h": 0x68,
    "i": 0x69,
    "j": 0x6a,
    "k": 0x6b,
    "l": 0x6c,
    "m": 0x6d,
    "n": 0x6e,
    "o": 0x6f,

    "p": 0x70,
    "q": 0x71,
    "r": 0x72,
    "s": 0x73,
    "t": 0x74,
    "u": 0x75,
    "v": 0x76,
    "w": 0x77,
    "x": 0x78,
    "y": 0x79,
    "z": 0x7a,
    "ä": 0x7b,
    "ö": 0x7c,
    "ü": 0x7d,
    "ß": 0x7e,
    "\u007f": 0x7f,
};

export const I8 = {
    ...I7,

    " ": 0xa0,
    "¡": 0xa1,
    "¢": 0xa2,
    "£": 0xa3,
    "¤": 0xa4,
    "¥": 0xa5,
    "¦": 0xa6,
    "@": 0xa7,
    "¨": 0xa8,
    "©": 0xa9,
    "ª": 0xaa,
    "«": 0xab,
    "¬": 0xac,
    "­": 0xad,
    "®": 0xae,
    "¯": 0xaf,

    "°": 0xb0,
    "±": 0xb1,
    "²": 0xb2,
    "³": 0xb3,
    "´": 0xb4,
    "µ": 0xb5,
    "¶": 0xb6,
    "·": 0xb7,
    "¸": 0xb8,
    "¹": 0xb9,
    "º": 0xba,
    "»": 0xbb,
    "¼": 0xbc,
    "½": 0xbd,
    "¾": 0xbe,
    "¿": 0xbf,

    "À": 0xc0,
    "Á": 0xc1,
    "Â": 0xc2,
    "Ã": 0xc3,
    "[": 0xc4,
    "Å": 0xc5,
    "Æ": 0xc6,
    "Ç": 0xc7,
    "È": 0xc8,
    "É": 0xc9,
    "Ê": 0xca,
    "Ë": 0xcb,
    "Ì": 0xcc,
    "Í": 0xcd,
    "Î": 0xce,
    "Ï": 0xcf,

    "Ð": 0xd0,
    "Ñ": 0xd1,
    "Ò": 0xd2,
    "Ó": 0xd3,
    "Ô": 0xd4,
    "Õ": 0xd5,
    "\\": 0xd6,
    "×": 0xd7,
    "Ø": 0xd8,
    "Ù": 0xd9,
    "Ú": 0xda,
    "Û": 0xdb,
    "]": 0xdc,
    "Ý": 0xdd,
    "Þ": 0xde,
    "~": 0xdf,

    "à": 0xe0,
    "á": 0xe1,
    "â": 0xe2,
    "ä": 0xe3,
    "{": 0xe4,
    "å": 0xe5,
    "æ": 0xe6,
    "ç": 0xe7,
    "è": 0xe8,
    "é": 0xe9,
    "ê": 0xea,
    "ë": 0xeb,
    "ì": 0xec,
    "í": 0xed,
    "î": 0xee,
    "ï": 0xef,

    "ð": 0xf0,
    "ñ": 0xf1,
    "ò": 0xf2,
    "ó": 0xf3,
    "ô": 0xf4,
    "õ": 0xf5,
    "|": 0xf6,
    "÷": 0xf7,
    "ø": 0xf8,
    "ù": 0xf9,
    "ú": 0xfa,
    "û": 0xfb,
    "}": 0xfc,
    "ý": 0xfd,
    "þ": 0xfe,
    "ÿ": 0xff,
};

const reverseCharacterTable = (characterTable: Record<string, number>) => Object.entries(characterTable)
    .reduce((result, [key, value]) => {
        result[value] = key;
        return result;
    }, {} as Record<number, string>);

export const stringToByteArray = (text: string, characterTable: Record<string, number>) => 
    Uint8Array.from([...text].map(char => characterTable[char]));

export const byteArrayToString = (bytes: Uint8Array, characterTable: Record<string, number>) => {
    const reversedCharacterTable = reverseCharacterTable(characterTable);

    return [...bytes]
        .map(byte => reversedCharacterTable[byte])
        .filter(value => value != undefined)
        .join("");
};

export const transliterate = (text: string, characterTable: Record<string, number>) =>
    [...text].map(char =>
        characterTable[char] != undefined
            ? char
            : isConformingToCharacterSet(anyAscii(char), characterTable)
                ? anyAscii(char)
                : ""
    ).join("");

export const isConformingToCharacterSet = (text: string, characterTable: Record<string, number>) =>
    ![...text].some(char => characterTable[char] == undefined);

export const isEncodableI8 = (text: string) => isConformingToCharacterSet(text, I8);

export const encodeI8 = (text: string) => stringToByteArray(text, I8);

export const decodeI8 = (bytes: Uint8Array) => byteArrayToString(bytes, I8);

export const transliterateI8 = (text: string) => transliterate(text, I8);
