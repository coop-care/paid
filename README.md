# PAID

PAID, also known as "Pflegeabrechnung in Deutschland", is a library written in typescript for care billing with payers in Germany ("Pflegekassen" and "Krankenkassen") according to § 105 SGB XI and § 302 SGB V.


## Include PAID library in your project

### Install
```bash
npm install paid-care
```

## Usage

### 1. Get data, serialize

First we need to download & parse some data: 
- Institution data (who pays the receipts, where to send the receipts to and how, to whom to encrypt the receipts, ...)
- Public keys of institutions to encrypt to

The data should be persisted in a file or `localStorage`. It can potentially change daily but should
at least be fetched once a quarter of a year.

```typescript
import fetchInstitutionLists from "kostentraeger/fetcher"
import { serializeInstitutionLists } from "kostentraeger/json_serializer"

const institutionListsParseResult = await fetchInstitutionLists()
// each item in the kostentraegerParseResult array contains fileName and warnings in case you want to log them
const stringifiedInstitutionLists = serializeInstitutionLists(institutionListsParseResult.map(it => it.institutionList))
```

### 2. deserialize, use

```typescript
import { InstitutionListsIndex } from "kostentraeger/index"
import { deserializeInstitutionLists } from "kostentraeger/json_serializer"

const institutionLists = deserializeInstitutionLists(stringifiedInstitutionLists)
const index = new InstitutionListsIndex(institutionLists)
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
