import { dfuProtokollSchluessel } from "./edifact/keys"
import { KTORInterchange, KTORMessage, ANS, ASP, DFU, KTO } from "./edifact/segments"
import { 
    Address, 
    BankAccountDetails, 
    Contact, 
    Kostentraeger, 
    KostentraegerList, 
    TransmissionDetails, 
    TransmissionProtocol 
} from "./types"

export function transform(interchange: KTORInterchange): KostentraegerList {
    return {
        spitzenverbandIK: interchange.spitzenverbandIK,
        creationDate: interchange.creationDate,
        kostentraeger: interchange.kostentraeger.map((msg) => transformMessage(msg))
    }
}

function transformMessage(msg: KTORMessage): Kostentraeger {
    const messageTxt = `Message ${msg.id} -`

    /* Simplification: Certain data is documented that it could be different, but de-facto it's not.
       Let's assert that it is never a value so that our data model and application logic can be 
       simpler
     */

    if (msg.idk.institutionsart != 99) {
        throw new Error(`${messageTxt} Expected that "institutionsart" is always 99`)
    }
    if (msg.idk.vertragskassennummer) {
        throw new Error(`${messageTxt} Expected that "vertragskassennummer" is never set`)
    }

    msg.dfuList.forEach((dfu) => {
        if (dfu.allowedTransmissionDays && dfu.allowedTransmissionDays != "1") {
            throw new Error(`${messageTxt} Expected that transmission is allowed on any day`)
        }
        if (
            dfu.allowedTransmissionTimeStart && 
            dfu.allowedTransmissionTimeStart != { hours: 0, minutes: 0 }
            ||
            dfu.allowedTransmissionTimeEnd && 
            dfu.allowedTransmissionTimeEnd != { hours: 24, minutes: 0 }
        ) {
            throw new Error(`${messageTxt} Expected that transmission is allowed at any time`)
        }

        if (dfu.benutzerkennung) {
            throw new Error(`${messageTxt} Expected that "benutzerkennung" is empty`)
        }
    })

    // TODO map uemList
    // TODO map vkgList

    return {
        ik: msg.idk.ik,
        name: msg.nam.names.join(" "),
        abbreviatedName: msg.idk.abbreviatedName,
        
        bankAccountDetails: msg.kto ? createBankAccountDetails(msg.kto, msg.idk.abbreviatedName) : undefined,

        validityDateFrom: msg.vdt.from,
        validityDateTo: msg.vdt.to,
        verarbeitungskennzeichenSchluessel: msg.fkt.verarbeitungskennzeichenSchluessel,

        contacts: msg.aspList.map((asp) => createContact(asp)),
        addresses: msg.ansList.map((ans) => createAddress(ans)),
        transmissionDetails: msg.dfuList.map((dfu) => createTransmissionDetails(dfu))
    }
}

function createTransmissionDetails(dfu: DFU): TransmissionDetails {
    return {
        protocol: dfuProtokollSchluessel[dfu.dfuProtokollSchluessel] as TransmissionProtocol,
        address: dfu.address
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

// TODO: or - check if KTO is used at all, it looks as if it isnt...
function createBankAccountDetails(kto: KTO, abbreviatedName: string): BankAccountDetails {
    return {
        bankName: kto.bankName,
        accountOwner: kto.accountOwner ?? abbreviatedName,
        accountConnection: kto.accountNumber ? {
            accountNumber: kto.accountNumber!,
            bankCode: kto.bankCode!
        } : {
            iban: kto.iban!,
            bic: kto.bic!
        }
    }
}

function createAddress(ans: ANS): Address {
    const place = ans.place
    const postcode = ans.postcode
    const addr = ans.address

    switch(ans.anschriftartSchluessel) {
        case "1": return { place: place, postcode: postcode, streetAndHousenumber: addr }
        case "2": return { place: place, postcode: postcode, poBox: addr }
        case "3": return { place: place, postcode: postcode }
    }
}

// TODO test