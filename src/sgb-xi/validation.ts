/*
TODO validation errors:

all required values are filled
every IK has 9 numeric digits
filename.length == 9
invoiceNumber.length <= 14 && /^[a-zA-Z0-9][a-zA-Z0-9/-]*[a-zA-Z0-9]$/.test(invoiceNumber)
singleInvoiceNumber.length <= 6
insuranceNumber.length <= 20
documentNumber.length <= 10 && /^[a-zA-Z0-9][a-zA-Z0-9/-]*[a-zA-Z0-9]$/.test(documentNumber)
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
additionTitle.length <= 50
approvalIdentifier.length <= 15
assistiveTechnologyTitle.length <= 30
inventoryNumber.length <= 15

*/