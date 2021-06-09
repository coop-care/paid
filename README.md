# PAID

PAID, also known as "Pflegeabrechnung in Deutschland", is a library written in typescript for care billing with payers in Germany ("Pflegekassen" and "Krankenkassen") according to § 105 SGB XI and § 302 SGB V.


## Include PAID library in your project

### Install
```bash
npm install paid-care
```

## Usage

### 1. Get data

First we need to download some data: 
- Institution data (who pays the receipts, where to send the receipts to and how, to whom to encrypt the receipts, ...)
- Public keys of institutions to encrypt to
- Hilfsmittelverzeichnis (catalogue of invoicable therapeutic appliances)

The data could potentially change daily but should at least be fetched once a quarter of a year.

```typescript
import fetchPublicKeyInfos from "pki/fetcher"
import fetchInstitutions from "kostentraeger/fetcher"

const publicKeyInfos = await fetchPublicKeyInfos()
const institutionsParseResult = await fetchInstitutions()
const institutionsList = institutionsParseResult.map(it => it.institutionsList)
```

### 2. Stringify, Revive data

TODO: maybe this could all be under the hood: 
1. Just one fetchData() which fetches everything in a "giant" JSON
2. the main class of the library could accept that data optionally, if it is not supplied, it will
   fallback to the data shipped in the dist so a "zero conf" is possible

This data should be persisted in a file or `localStorage` because the download is quite large and
the parsing a bit laborious because there are many validity checks. The data can be stringified
to JSON and revived like this:

```typescript
import { institutionListReplacer, institutionListReviver } from "kostentraeger/types"
import { ikPublicKeyInfoReplacer, ikPublicKeyInfoReviver } from "pki/types"

// stringify the data (for persisting it somewhere)
const pkInfosString = JSON.stringify(publicKeyInfos, ikPublicKeyInfoReplacer)
const institutionsListString = JSON.stringify(institutionsList, institutionListReplacer)

// revive the data
const publicKeyInfos2 = JSON.parse(pkInfosString, ikPublicKeyInfoReviver)
const institutionsList2 = JSON.parse(institutionsListString, institutionListReviver)
```

### 3. Send Receipts

TODO

## Build PAID library

### Install
```bash
npm install
```

### Run tests
```bash
npm run test
```
### Build
```bash
npm run build
```
