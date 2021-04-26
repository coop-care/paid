import { KOTRInterchange, KOTRMessage, ANS, ASP, DFU, KTO, UEM } from "./edifact/segments"
import { 
    Address, 
    BankAccountDetails, 
    Contact, 
    Institution, 
    InstitutionList, 
    ReceiptTransmissionMethods
} from "./types"

export default function transform(interchange: KOTRInterchange): InstitutionList {
    return {
        spitzenverbandIK: interchange.spitzenverbandIK,
        creationDate: interchange.creationDate,
        institutions: interchange.institutions.map((msg) => {
            requirePreconditions(msg)
            return transformMessage(msg)
        }).filter((msg): msg is Institution => !!msg)
    }
}

function requirePreconditions(msg: KOTRMessage) {
    /* Simplification: Certain data is documented that it could be different, but de-facto it's not.
       Let's assert that it is never a value so that our data model and application logic can be 
       simpler
     */

    const messageTxt = `Message ${msg.id} -`

    if (msg.idk.institutionsart != "99") {
        throw new Error(`${messageTxt} Expected that "institutionsart" is always 99`)
    }
    if (msg.idk.vertragskassennummer) {
        throw new Error(`${messageTxt} Expected that "vertragskassennummer" is never set`)
    }

    msg.dfuList.forEach((dfu) => {
        if (dfu.allowedTransmissionDays && dfu.allowedTransmissionDays != "1") {
            throw new Error(`${messageTxt} Expected that transmission is allowed on any day but was "${dfu.allowedTransmissionDays}"`)
        }
        if (
            dfu.allowedTransmissionTimeStart && dfu.allowedTransmissionTimeStart != "0000"
            || dfu.allowedTransmissionTimeEnd && dfu.allowedTransmissionTimeEnd != "2400"
        ) {
            const start = dfu.allowedTransmissionTimeStart
            const end = dfu.allowedTransmissionTimeEnd
            throw new Error(`${messageTxt} Expected that transmission is allowed at any time but was ${start}-${end}`)
        }

        if (dfu.benutzerkennung) {
            throw new Error(`${messageTxt} Expected that "benutzerkennung" is empty`)
        }
    })

    if (msg.uemList.length > 0) {
        const acceptsInternetOrPaperReceipts = msg.uemList.some((uem) => ["1","5","6"].includes(uem.uebermittlungsmediumSchluessel))
        if (!acceptsInternetOrPaperReceipts) {
            throw new Error(`${messageTxt} Expected that institution at least accepts either paper receipts or receipts sent over internet`)
        }
    }

    if (msg.kto) {
        if (!msg.kto.iban || !msg.kto.bic) {
            throw new Error(`${messageTxt} Expected IBAN and BIC`)
        }
    }
}

function transformMessage(msg: KOTRMessage): Institution | null {
    /* in practice, this doesn't seem to be used and usage of this field is inconsistent for the
       different umbrella organizations that issue the Kostenträger-file. "03" however seems to mean
       "delete this entry" */
    if (msg.fkt.verarbeitungskennzeichenSchluessel == "03") return null

    return {
        ik: msg.idk.ik,
        name: msg.nam.names.join(" "),
        abbreviatedName: msg.idk.abbreviatedName,
        
        bankAccountDetails: msg.kto ? createBankAccountDetails(msg.kto, msg.idk.abbreviatedName) : undefined,

        validityFrom: msg.vdt.validityFrom,
        validityTo: msg.vdt.validityTo,

        contacts: msg.aspList.map((asp) => createContact(asp)),
        addresses: msg.ansList.map((ans) => createAddress(ans)),
        transmissionMethods: createReceiptTransmissionMethods(msg.uemList, msg.dfuList),
        links: msg.vkgList
    }
}

function createReceiptTransmissionMethods(uemList: UEM[], dfuList: DFU[]): ReceiptTransmissionMethods | undefined {
    if (uemList.length == 0) return undefined

    const machineReadablePaperReceipt = uemList.some((uem) => uem.uebermittlungsmediumSchluessel == "5")
    const paperReceipt = uemList.some((uem) => uem.uebermittlungsmediumSchluessel == "6")

    let zeichensatzSchluessel, email, ftam
    if (dfuList.length > 0) {
        zeichensatzSchluessel = uemList.find((uem) => uem.uebermittlungsmediumSchluessel == "1")?.uebermittlungszeichensatzSchluessel
        email = dfuList.find((dfu) => dfu.dfuProtokollSchluessel == "070")?.address
        ftam = dfuList.find((dfu) => dfu.dfuProtokollSchluessel == "016")?.address
    }

    return {
        paperReceipt: paperReceipt,
        machineReadablePaperReceipt: machineReadablePaperReceipt,
        email: email,
        ftam: ftam,
        zeichensatzSchluessel: zeichensatzSchluessel
    }
}

function createContact(asp: ASP): Contact {
    return {
        phone: asp.phone,
        fax: asp.fax,
        name: asp.name,
        fieldOfWork: asp.fieldOfWork
    }
}

function createBankAccountDetails(kto: KTO, abbreviatedName: string): BankAccountDetails {
    return {
        bankName: kto.bankName,
        accountOwner: kto.accountOwner ?? abbreviatedName,
        iban: kto.iban!,
        bic: kto.bic!
    }
}

function createAddress(ans: ANS): Address {
    const { place, postcode, address: addr } = ans

    switch(ans.anschriftartSchluessel) {
        case "1": return { place: place, postcode: postcode, streetAndHousenumber: addr }
        case "2": return { place: place, postcode: postcode, poBox: addr }
        case "3": return { place: place, postcode: postcode }
    }
}
