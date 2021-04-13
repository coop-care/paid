/*
TODO validation errors:

all required values are filled
every IK has 9 numeric digits
filename.length == 9
rechnungsnummer.length <= 14 && /^[a-zA-Z0-9][a-zA-Z0-9/-]*[a-zA-Z0-9]$/.test(rechnungsnummer)
einzelrechnungsnummer.length <= 6
versichertennummer.length <= 20
eindeutigeBelegnummer.length <= 10 && /^[a-zA-Z0-9][a-zA-Z0-9/-]*[a-zA-Z0-9]$/.test(eindeutigeBelegnummer)
required parameters depending on other parameters to fill ELS segment details field

*/

/*
TODO validation warnings:

every NAM name has maximum length of 30
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