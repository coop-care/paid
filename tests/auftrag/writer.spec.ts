import { Auftrag } from "../../src/auftrag/types"
import write from "../../src/auftrag/writer"

describe("Auftragsdatei writer", () => {

    it("writes auftragsdatei", () => {
        expect(write({
            verfahrenKennung: "PFL",
            anwendungsreferenz: "PL128001SAO",
            senderIK: "123456789",
            encryptedForIK: "987654321",
            sendToIK: "666333111",
            dateCreated: new Date("2018-02-02T12:12:12"),
            dateSent: new Date("2018-02-03T10:10:10"),
            unencryptedNutzdatenSizeBytes: 999666,
            encryptedNutzdatenSizeBytes: 1333222,
            isTest: false,
            transferNumber: 22
        })).toEqual(
            "500000"+
            "01"+
            "00000348"+
            "000"+
            "E"+"PFL"+"0"+ // verfahrenKennung + isTest
            "022"+ // transferNumber
            "     "+
            "123456789      "+ // senderIK
            "123456789      "+ // senderIK
            "987654321      "+ // encryptedForIK
            "666333111      "+ // sendToIK
            "000000"+
            "000000"+
            "PL128001SAO"+ // anwendungsreferenz
            "20180202121212"+ // dateCreated
            "20180203101010"+ // dateSent
            "00000000000000"+
            "00000000000000"+
            "000000"+
            "0"+
            "000000999666"+ //unencryptedNutzdatenSizeBytes
            "000001333222"+ //encryptedNutzdatenSizeBytes
            "I1"+
            "00"+
            "03"+
            "03"+
            "   "+
            "00000"+
            "00000000"+
            " "+
            "00"+
            "0"+
            "0000000000"+
            "000000"+
            "                            "+
            "                                            "+
            "                              "
        )
    })

    it("validates auftragsdatei", () => {
        const auftrag = {
            verfahrenKennung: "PFL",
            anwendungsreferenz: "PL128001SAO",
            senderIK: "123456789",
            encryptedForIK: "987654321",
            sendToIK: "666333111",
            dateCreated: new Date("2018-02-02T12:12:12"),
            dateSent: new Date("2018-02-03T10:10:10"),
            unencryptedNutzdatenSizeBytes: 999666,
            encryptedNutzdatenSizeBytes: 1333222,
            isTest: false,
            transferNumber: 22
        }

        expect(() => write({ ...auftrag, 
            anwendungsreferenz: "PL128001SAOxxxx"
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            senderIK: "1234567890"
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            encryptedForIK: "1234567890"
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            sendToIK: "1234567890"
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            unencryptedNutzdatenSizeBytes: 1234567890123
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            unencryptedNutzdatenSizeBytes: 123.456
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            unencryptedNutzdatenSizeBytes: -123
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            encryptedNutzdatenSizeBytes: 1234567890123
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            encryptedNutzdatenSizeBytes: 123.456
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            encryptedNutzdatenSizeBytes: -123
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            transferNumber: 1234
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            transferNumber: -12
        } as Auftrag)).toThrow()

        expect(() => write({ ...auftrag, 
            transferNumber: 1.5
        } as Auftrag)).toThrow()
    })
})