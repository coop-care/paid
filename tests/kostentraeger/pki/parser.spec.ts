import parse from "../../../src/kostentraeger/pki/parser"
import { base64ToArrayBuffer } from "../../../src/kostentraeger/pki/utils"

describe("certificates parser", () => {

    it("parse two certificates", () => {
        const pkeyMap = parse(twoCertificatesInPEM)
        
        const info1 = pkeyMap.get("109979978")!
        expect(info1).toHaveLength(1)

        expect(info1[0]!.publicKey).toEqual(base64ToArrayBuffer(
            "MIIBCgKCAQEAgAj2jKduEwdV7XrNtRcZ92018LtrxYnrScto5dadK/MJTzX+BPPn2OGLmLfLyXFHreFV4m4eXn99jjPby2UwNDBf9XnPiJnLybvluj9Ja7mSOZIRNbRrRK3lurnqQ9M4mHE+840XmdB8a5kY/DdjqOy7aiwIhUFlBhYaKF8vWFp1s1BpqU7RkphG7oWVQDoZ8e2bMuedAtW4ABQDosydqPSz2gGDBRCgu4+up72kV0EqX6ITKDT8ULZ9juPL50CBewZAwO1jmyTSXRvu3s0U7M7DA9p5muS7qhEpX1VIgsyBIgfLuAtwFryfh+5gz7gHN/2gi0xBCv5W4yPF75QBYwIDAQAB"
        ))
        expect(info1[0]!.validityFrom.toISOString()).toEqual("2020-11-24T00:00:00.000Z")
        expect(info1[0]!.validityTo.toISOString()).toEqual("2023-01-08T23:59:59.000Z")

        const info2 = pkeyMap.get("109905003")!
        expect(info2).toHaveLength(1)

        expect(info2[0]!.publicKey).toEqual(base64ToArrayBuffer(
            "MIICCgKCAgEAgCQvTcBf2rSezyfcv8SeGOaWU9CL3GXlW2+uCc6QmPLUgTB/p26f4e61mYWk4osxcZqaDk7oeaRR1F+NNQbX41GdzNzbRg/wplIwbme4X2JrOMgDPKdTGTeDmOhXweaallSVcc414l7ethaEHbI4OI4Hm9aJSj1NV/a6TcOMUhJtxPJrZzvC9NFgdSYrI0QZ78Aed9A+W+79WyKJ59AMbCWzwDRNeB1tajWoxcbuMbd/Szdysdlxot4VEmki6s7Es5CfEJOKzX7iCpQltQzMuk+Y6UDbyJ/kpvRxcUbz0MpRxxpsBdJ/V9P7/Ub2gVVxqKgjIKtVOe3FIat1NZqeQmablvjfyHZ7KjLFdl24L6BadSFWMM3DDZ3dnYroE+iXRWLrp9/YWWGOD+bzCQTY4i3sa17B8cqceJ1takHpVSpxREEJ9lSwToQ2PsGuSdFtXm1XQr6JSi7qh0EeRiT6KSRiMqxpsSv4teKt09RxRszYTEiiMYxXe1uKHqFgn1oQ+X1eQ3PSIRzHZ/9K6Mvp+HlD6jzFHDmovl5QTbDD/Al8mDSaU1lhRMGk/9redyUfEx/G3B+4soMdpcKyLkLzQS1xkJ/BipdqFzl11GO6ONx8GR6y8h6EmJWcSkVyp6MHQf/+bo29hj944ZBcmQSNSN7NozZDeOVIFcoQY9zpwHkCAwEAAQ=="
        ))
        expect(info2[0]!.validityFrom.toISOString()).toEqual("2018-11-14T00:00:00.000Z")
        expect(info2[0]!.validityTo.toISOString()).toEqual("2021-12-31T23:59:59.000Z")
    })
})

const twoCertificatesInPEM = 
`MIIDTjCCAjagAwIBAgIDAnxUMA0GCSqGSIb3DQEBCwUAMEkxCzAJBgNVBAYTAkRF
MTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29uc3RpZ2UgTGVpc3R1
bmdzZXJicmluZ2VyMB4XDTIwMTEyNDAwMDAwMFoXDTIzMDEwODIzNTk1OVowgYkx
CzAJBgNVBAYTAkRFMTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29u
c3RpZ2UgTGVpc3R1bmdzZXJicmluZ2VyMQ0wCwYDVQQLEwR2ZGVrMRQwEgYDVQQL
EwtJSzEwOTk3OTk3ODEZMBcGA1UEAxMQRHIuIEhlaWtvIFN0YW1lcjCCASIwDQYJ
KoZIhvcNAQEBBQADggEPADCCAQoCggEBAIAI9oynbhMHVe16zbUXGfdtNfC7a8WJ
60nLaOXWnSvzCU81/gTz59jhi5i3y8lxR63hVeJuHl5/fY4z28tlMDQwX/V5z4iZ
y8m75bo/SWu5kjmSETW0a0St5bq56kPTOJhxPvONF5nQfGuZGPw3Y6jsu2osCIVB
ZQYWGihfL1hadbNQaalO0ZKYRu6FlUA6GfHtmzLnnQLVuAAUA6LMnaj0s9oBgwUQ
oLuPrqe9pFdBKl+iEyg0/FC2fY7jy+dAgXsGQMDtY5sk0l0b7t7NFOzOwwPaeZrk
u6oRKV9VSILMgSIHy7gLcBa8n4fuYM+4Bzf9oItMQQr+VuMjxe+UAWMCAwEAATAN
BgkqhkiG9w0BAQsFAAOCAQEAOz8znqhmVw7g6RsENcOqu7UtjbdEitRd9aAW4hiz
WJbbPv1rCU6+cFA8vCiQYdZagl8xrZrYyCpx+JUqQFkDUuq2kdQRgeAnQTggNV+K
Xs702G+AMB3GmulPdlIPTN7YXQXoCiIJgsxn/CKveQYyYXuMdRJw/9GJJR9FatkJ
xkG7EX7PaWOpimA/+U40PRyJ4etxclFNVuBbefQ/cWCHQhupY7hewdaK2yIXyXvd
xAITd32OHKn7H/rEl220hwCPuGFUUvvoEtXn2i77dequl7BG3ceikkmjsdueqUxv
3Ggt+TSxF2vu3ZXzDT1AjV7TFTLX7ClDQMXdUIn/nBF14g==

MIIF1TCCA42gAwIBAgIDAw14MD0GCSqGSIb3DQEBCjAwoA0wCwYJYIZIAWUDBAIB
oRowGAYJKoZIhvcNAQEIMAsGCWCGSAFlAwQCAaIDAgEgMEkxCzAJBgNVBAYTAkRF
MTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29uc3RpZ2UgTGVpc3R1
bmdzZXJicmluZ2VyMB4XDTE4MTExNDAwMDAwMFoXDTIxMTIzMTIzNTk1OVowgbAx
CzAJBgNVBAYTAkRFMTowOAYDVQQKEzFJVFNHIFRydXN0Q2VudGVyIGZ1ZXIgc29u
c3RpZ2UgTGVpc3R1bmdzZXJicmluZ2VyMTkwNwYDVQQLEzBEZXV0c2NoZSBSZW50
ZW52ZXJzaWNoZXJ1bmcgS25hcHBzY2hhZnQtQmFobi1TZWUxFDASBgNVBAsTC0lL
MTA5OTA1MDAzMRQwEgYDVQQDEwtNYXJjbyBMb25nbzCCAiIwDQYJKoZIhvcNAQEB
BQADggIPADCCAgoCggIBAIAkL03AX9q0ns8n3L/EnhjmllPQi9xl5VtvrgnOkJjy
1IEwf6dun+HutZmFpOKLMXGamg5O6HmkUdRfjTUG1+NRnczc20YP8KZSMG5nuF9i
azjIAzynUxk3g5joV8HmmpZUlXHONeJe3rYWhB2yODiOB5vWiUo9TVf2uk3DjFIS
bcTya2c7wvTRYHUmKyNEGe/AHnfQPlvu/VsiiefQDGwls8A0TXgdbWo1qMXG7jG3
f0s3crHZcaLeFRJpIurOxLOQnxCTis1+4gqUJbUMzLpPmOlA28if5Kb0cXFG89DK
UccabAXSf1fT+/1G9oFVcaioIyCrVTntxSGrdTWankJmm5b438h2eyoyxXZduC+g
WnUhVjDNww2d3Z2K6BPol0Vi66ff2Flhjg/m8wkE2OIt7GtewfHKnHidbWpB6VUq
cURBCfZUsE6ENj7BrknRbV5tV0K+iUou6odBHkYk+ikkYjKsabEr+LXirdPUcUbM
2ExIojGMV3tbih6hYJ9aEPl9XkNz0iEcx2f/SujL6fh5Q+o8xRw5qL5eUE2ww/wJ
fJg0mlNZYUTBpP/a3nclHxMfxtwfuLKDHaXCsi5C80EtcZCfwYqXahc5ddRjujjc
fBkesvIehJiVnEpFcqejB0H//m6NvYY/eOGQXJkEjUjezaM2Q3jlSBXKEGPc6cB5
AgMBAAEwPQYJKoZIhvcNAQEKMDCgDTALBglghkgBZQMEAgGhGjAYBgkqhkiG9w0B
AQgwCwYJYIZIAWUDBAIBogMCASADggIBAFip1KcLylK0xVBPcRVMjydCOJckB47j
rhyaznSwEntPvCAGxzlyxnoLIDhw5uh/K94hf2BMFMGkmNf9uX7qK7bxoMRV+IYx
78ZKvf9ARQfCQSc7qlOP1Dpiu+QmP6MVyKutrhilTxO5dNnIa2MvaPlTPhgUFAle
+8NfJkk8M0iJFGrD3+aUZpyXOlDUspz+aYs9GPvhHe0PjdoPmffPwk06PJrAOBJQ
NQzTmJZlhadV6EbxebJTyL6y3Dgu5HmWTdLsyGWZI2jQ9sWxmEqpAJ1QdCLuPP87
maBwAjjHuAqDCp9nLiMnjKNe9ZLVKgfjIuxvwkupFZN78px5MHg/Il08PT58wO6a
t9Nxx6ZhvdzazPLLs3WbnH/kUCjbhHYNeWvSAPQ0mrOh/EuFP5NiXqucxnvQx/Kq
6195+C35wds/xZJI2R4R5nvV015H9VyhFfJOfhEsPA1pw03ggRRpcF+Hkzyu0Dex
mIUG8Egca5ztCjr0F+XYTvrXM4L/RWaQQ3LslPLWTW8oHwTUytgcGGQHiDlv6vjq
vHCs7GJuxjLcjRRYkf8Ck+hpRK+9JaT7BbxAPILEaRJN/K3rTyKDtakAWFjWhdMJ
lv9V4Ip794XGRzPNZDeh/F4qg/NUCRI/YimhOa4vF+x10FP7hOITBIAncb3fCO5A
qF7l6fgFaTTV

`
