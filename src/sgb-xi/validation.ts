/** based on document: Pflege, Technische Anlage 1 für Abrechnung auf maschinell verwertbaren Datenträgern
  * see docs/documents.md for more info
  */

/*
TODO validation errors:

all required values are filled
every IK has 9 numeric digits
((rechnungsart == 1 || rechnungsart == 3) && careProvider.absenderIK == careProvider.rechnungsstellerIK)
    || (rechnungsart == 2 && careProvider.absenderIK != careProvider.rechnungsstellerIK)
controlReference > 0
filename.length == 9
rechnungsnummer.length <= 14 && /^[a-z0-9][a-z0-9/-]*[a-z0-9]$/i.test(rechnungsnummer)
einzelrechnungsnummer.length <= 6
versichertennummer.length <= 20
eindeutigeBelegnummer.length <= 10 && /^[a-zA-Z0-9][a-zA-Z0-9/-]*[a-zA-Z0-9]$/.test(eindeutigeBelegnummer)
required parameters depending on other parameters to fill ELS segment details field
leistung.leistungsart == "06" && !!leistung.hilfsmittel
Object.values(sondertarifJeKostentraegerIK).each.length == 3

*/

/*
TODO validation warnings:

every Careprovider name and ansprechpartner (name + phone) has maximum length of 30
firstName.length <= 45
lastName.length <= 45
street.length <= 46
houseNumber.length <= 9
postalCode.length <= 10
city.length <= 40
beschreibungZuschlagsart.length <= 50
genehmigungskennzeichen.length <= 15
bezeichnungPflegehilfsmittel.length <= 30
inventarnummerPflegehilfsmittel.length <= 15

*/