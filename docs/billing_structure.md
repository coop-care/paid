# Documentation on how the billing data is split up

There is no central agency to send the billing data to. Instead, there are over hundred statutory 
health insurances which each set up own rules which institution exactly will pay the bills for which
individual services provided and which institution the bills must be sent to and which key to use
to encrypt the data. 
Furthermore, the billing data even for one recipient must be split into individual files that are
grouped by accounting month and type of service provided. In the files itself, the billing data is
further grouped by more parameters. 

In effect, the billing data needs to be arranged in a highly hierarchical structure. This 
documentation aims to detail by what factors the data is split up and give a big picture about this.

## Terms

### Leistungserbringer

A *Leistungserbringer* (=health care service provider) is the institution that does the health care
services and wants to bill it, f.e. doctors, ambulatory care providers etc..

### Teilprojekt 

The billing of health care services is split up into 7 different *Teilprojekte* (=sub projects):

- 1: Doctors
- 2: Dentists
- 3: Pharmacies
- 4a: Hospitals
- 4b: Rehabilitation institutions
- 5: Other health care service providers
- 6: Care facilities

For each of these, the structure of the billing files is substantially different. I.e. services
provided in subproject 5 and subproject 6 must be in separate bills.

Subproject 5 and 6 are relevant for this project.

### Kostenträger and Datenannahmestelle

Each statutory health insurance defines which institution(s) are the *Kostenträger* (=payer). This
may f.e. be the health insurance itself or any other institution, such as a (more) central 
accounting office.

Each payer, in turn, defines which institution(s) are the *Datenannahmestelle* (=where to send the
bills to). Again, this may be the institution itself, or yet another institution, such as a 
contractor that manages the processing of the bills.

A quirk here is that the contractor may not have the key to decrypt the encrypted bills himself 
and thus will basically just forward the bills internally to the one that has the key. 

**Important:** The payer, the institution where to send the bill to and the key to use for
encryption do not only differ per statutory health insurance! Each may differ depending on...:

- where the health care service provider is located
- the area of activity the health care service provider is allocated to. The exact definition of and
  which areas exist differ for each sub project. The following areas of activity exist:
  - for [Other health care service providers](https://github.com/coop-care/paid/blob/main/src/sgb-v/codes.ts#L5-L57)
  - for [Care facilities](https://github.com/coop-care/paid/blob/main/src/sgb-xi/codes.ts#L81-L94)
- and finally the date at which the bill is sent (the rules on where to send what are continuously 
  updated)

To summarize, it depends on where the patient is insured, the date, and the health care service 
provider. **If** the latter can be allocated to multiple areas of activity, then it even depends on
the individual area of activity he provided the service in.

### Abrechnungsfall

An *Abrechnungsfall* (=billing case) contains all the individual services provided by one health
care service provider to one insuree (in one area of activity).

Depending on the sub project, the *Abrechnungsfall* further contains a number of *Einsätze* 
(=home visits), which in turn contain a number of *Abrechnungsposition*s.

### Abrechnungsposition / Leistung

An *Abrechnungsposition* (~bill item) or *Leistung* (~service provided) describes one individual service
provided by a health care service provider to one insuree. Each individual service has a unique
identification number (*Positionsnummer*) and a price.

## Structure

Using quotes here to denote what needs to be repeated. Think of it as a giant nested for-loop.

> **For each combination of Teilprojekt**
> > **and Datenannahmestelle:**
> > > 
> > > There is **billing data for one Datenannahmestelle**, to be sent to one email address.
> > > 
> > > This data consists of a number of pairs of billing-files attached to that email. Each pair 
> > > consists of a 
> > > - *Auftragsdatei*, which contains metadata of the bill, like f.e. to whom the Nutzdatendatei  
> > >   is encrypted to
> > > - and a *Nutzdatendatei*, which is the actual encrypted billing data.
> > > 
> > > As for the individual billing-files:
> > > 
> > > **For each combination of encryption key,**
> > > > **accounting month**
> > > > > **and area of activity of the Leistungserbringer:**
> > > > > > 
> > > > > > There is **a pair of billing-files** in the email.
> > > > > > 
> > > > > > Note that the exact definition of and which areas of acticity exist differ for each sub  
> > > > > > project *and may be different to the definition in the section about Kostenträger* 
> > > > > > above. The following areas of activity exist:
> > > > > > - [Other health care service providers](https://github.com/coop-care/paid/blob/main/src/sgb-v/codes.ts#L457-L473)
> > > > > > - [Care facilities](https://github.com/coop-care/paid/blob/main/src/sgb-xi/codes.ts#L81-L94)
> > > > > > 
> > > > > > The structure of a *Nutzdatendatei* may be substantially different for each sub project,
> > > > > > but at least for subproject 5 and subproject 6, the basic structure is the same:
> > > > > > 
> > > > > > **For each Leistungserbringer¹**
> > > > > > > **For each Kostenträger**
> > > > > > > > 
> > > > > > > > There is a **Summary** (aka *Sammelrechnung*) of all bills associated to that one 
> > > > > > > > *Kostenträger*.
> > > > > > > > 
> > > > > > > > And then...
> > > > > > > > 
> > > > > > > > **For each health care insurance**
> > > > > > > > > 
> > > > > > > > > There is a **Summary** (aka *Gesamtrechnung*), followed by
> > > > > > > > > a **List of bills** (aka *Nutzdaten*)
> > > > > > > > > of all bills associated to that one health care insurance.
> > > > > > > > > 
> > > > > > > > > The *Abrechnungsposition*en in the bill itself are usually further grouped by 
> > > > > > > > > to which *Einsatz* they belong to, which themselves are further
> > > > > > > > > grouped by to which *Abrechnungsfall* they belong. But as mentioned, at this point
> > > > > > > > > this very much depends on for which sub group this bill is for.
>
> ¹ If the billing is done by an *Abrechnungszentrum* (~clearing office) with collecting power
>   and not by the *Leistungserbringer* himself, the grouping is actually reversed: First for each
>   *Kostenträger*, then for each *Leistungserbringer*.
