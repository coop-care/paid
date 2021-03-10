
export declare enum FileType {
    Test = 0, // "Testdatei"
    Trial = 1, // "Erprobungsdatei"
    Real = 2, // "Echtdatei"
}

/*
External parameters:

# Transmission:
senderID "IK Absender"
receiverID "IK Empfänger"
transmissionIndex
filename
fileType
processingCode "Verarbeitungskennzeichen", Anlage 3, Abschnitt 2.3

# Invoice:
payerID "IK Kostenträger"
insuranceID "IK Pflegekasse"
invoiceNumber
invoiceCode "Rechnungsart", Anlage 3, Abschnitt 2.1
billingCode "Abrechnungscode", Anlage 3, Abschnitt 2.2.1
payScaleCode "Tarifkennzeichen" Anlage 3, Abschnitt 2.2.2
typeOfServiceCode "Art der abgegebenen Leistung" Anlage 3, Abschnitt 2.4

# Provider:
providerID "IK Leistungserbringer (oder Abrechnungsstelle mit Inkassovollmacht)"
vatExemptionCode "Grund UST-Befreiung" Anlage 3, Abschnitt 2.13

# Client:
insuranceNumber
careLevelCode "Pflegegrad" Anlage 3, Abschnitt 2.15

# Service:
serviceStartDate
serviceEndDate
remunerationCode "Vergütungsart" Anlage 3, Abschnitt 2.5
qualificationDependentRemunerationCode "Qualifikationsabhängige Vergütung" Anlage 3, Abschnitt 2.6
serviceCode "Leistung" Anlage 3, Abschnitt 2.7, Untergruppen je nach Vergütungsart
unitPrice
quantity
distanceKilometers
pointValue
pointScore

*/