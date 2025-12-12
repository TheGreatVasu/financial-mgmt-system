# Sample Data Guide for Financial Management System

This document provides sample data for testing all forms in the system.

---

## 1. Master Data Wizard - Sample Data

### Step 1: Company Profile
```json
{
  "companyName": "TechCorp Industries Pvt Ltd",
  "legalEntityName": "TechCorp Industries Private Limited",
  "corporateAddress": "123 Industrial Park, Sector 18",
  "corporateDistrict": "Gurgaon",
  "corporateState": "Haryana",
  "corporateCountry": "India",
  "corporatePinCode": "122015",
  "correspondenceAddress": "456 Business Tower, MG Road",
  "correspondenceDistrict": "Gurgaon",
  "correspondenceState": "Haryana",
  "correspondenceCountry": "India",
  "correspondencePinCode": "122001",
  "otherOfficeType": "Plant Address",
  "otherOfficeAddress": "789 Manufacturing Unit, Industrial Area",
  "otherOfficeGst": "06AABCU9603R1Z5",
  "otherOfficeDistrict": "Faridabad",
  "otherOfficeState": "Haryana",
  "otherOfficeCountry": "India",
  "otherOfficePinCode": "121003",
  "primaryContactName": "Rajesh Kumar",
  "primaryContactNumber": "+91-9876543210",
  "primaryContactEmail": "rajesh.kumar@techcorp.com"
}
```

### Step 2: Customer Profile
```json
{
  "customerName": "Global Manufacturing Solutions",
  "legalEntityName": "Global Manufacturing Solutions Limited",
  "corporateOfficeAddress": "100 Corporate Plaza, Bandra Kurla Complex",
  "correspondenceAddress": "100 Corporate Plaza, Bandra Kurla Complex",
  "district": "Mumbai Suburban",
  "state": "Maharashtra",
  "country": "India",
  "pinCode": "400051",
  "segment": "Domestic",
  "gstNumber": "27AABCU9603R1Z5",
  "poIssuingAuthority": "Procurement Department",
  "designation": "Procurement Manager",
  "contactNumber": "+91-9876543211",
  "emailId": "procurement@gmsolutions.com"
}
```

### Step 3: Consignee Profile
```json
{
  "consigneeName": "GMS Warehouse - Delhi",
  "consigneeAddress": "200 Logistics Hub, Sector 25",
  "consigneeCity": "Delhi",
  "consigneeState": "Delhi",
  "consigneeCountry": "India",
  "consigneePinCode": "110025",
  "consigneeGstNumber": "07AABCU9603R1Z5",
  "consigneeContactPerson": "Amit Sharma",
  "consigneeContactNumber": "+91-9876543212",
  "consigneeEmail": "warehouse.delhi@gmsolutions.com"
}
```

### Step 4: Payer Profile
```json
{
  "payerName": "Global Manufacturing Solutions - Accounts Payable",
  "payerAddress": "100 Corporate Plaza, Bandra Kurla Complex, Accounts Department",
  "payerCity": "Mumbai",
  "payerState": "Maharashtra",
  "payerCountry": "India",
  "payerPinCode": "400051",
  "payerGstNumber": "27AABCU9603R1Z5",
  "payerContactPerson": "Priya Patel",
  "payerContactNumber": "+91-9876543213",
  "payerEmail": "accounts@gmsolutions.com"
}
```

### Step 5: Employee Profile
```json
{
  "teamMemberName": "Vikram Singh",
  "employeeId": "EMP001",
  "role": "Sales Manager",
  "department": "Sales",
  "contactNumber": "+91-9876543214",
  "emailId": "vikram.singh@techcorp.com",
  "reportingManager": "Ramesh Nair",
  "location": "Gurgaon",
  "accessLevel": "Manager",
  "remarks": "Handles key accounts in North region"
}
```

### Step 6: Payment Terms
```json
{
  "paymentTermName": "Net 45 with 20% Advance",
  "creditPeriod": "45 days",
  "advanceRequired": "Yes",
  "advancePercentage": "20",
  "balancePaymentDueDays": "45",
  "latePaymentInterest": "1.5% per month",
  "billingCycle": "Monthly",
  "paymentMethod": "Bank Transfer",
  "bankName": "HDFC Bank",
  "bankAccountNumber": "50200012345678",
  "ifscCode": "HDFC0001234",
  "upiId": "techcorp@hdfc",
  "notes": "Standard payment terms for domestic customers"
}
```

### Step 7: Additional Step
```json
{
  "defaultCurrency": "INR",
  "defaultTax": "18",
  "invoicePrefix": "INV",
  "quotationPrefix": "QUO",
  "enableBOQ": "Yes",
  "enableAutoInvoice": "No",
  "notificationEmail": "notifications@techcorp.com",
  "smsNotification": "Yes",
  "allowPartialDelivery": "Yes",
  "serviceCharge": "0",
  "remarks": "Standard configuration for domestic operations"
}
```

---

## 2. PO Entry - Sample Data

```json
{
  "customerName": "Global Manufacturing Solutions",
  "legalEntityName": "Global Manufacturing Solutions Limited",
  "customerAddress": "100 Corporate Plaza, Bandra Kurla Complex",
  "district": "Mumbai Suburban",
  "state": "Maharashtra",
  "country": "India",
  "pinCode": "400051",
  "gstNo": "27AABCU9603R1Z5",
  "businessUnit": "Automation",
  "segment": "Domestic",
  "zone": "West",
  
  "contractAgreementNo": "CA/2024/001",
  "contractAgreementDate": "2024-01-15",
  "poNo": "PO/GMS/2024/001",
  "poDate": "2024-01-20",
  "letterOfIntentNo": "LOI/GMS/2024/001",
  "letterOfIntentDate": "2024-01-10",
  "letterOfAwardNo": "LOA/GMS/2024/001",
  "letterOfAwardDate": "2024-01-12",
  "tenderReferenceNo": "TEN/GMS/2024/001",
  "tenderDate": "2024-01-05",
  "projectDescription": "Automation System for Manufacturing Plant",
  
  "paymentType": "Secured",
  "paymentTerms": "Net 45 with 20% Advance",
  "paymentTermsClauseInPO": "20% advance on PO, balance within 45 days of delivery",
  
  "insuranceType": "Marine Insurance",
  "policyNo": "INS/2024/001",
  "policyDate": "2024-01-20",
  "policyCompany": "ICICI Lombard",
  "policyValidUpto": "2025-01-20",
  "policyClauseInPO": "Marine insurance coverage for transit",
  "policyRemarks": "Standard marine insurance",
  
  "bankGuaranteeType": "Advance Bank Guarantee",
  "bankGuaranteeNo": "BG/2024/001",
  "bankGuaranteeDate": "2024-01-20",
  "bankGuaranteeValue": "500000",
  "bankName": "HDFC Bank",
  "bankGuaranteeValidity": "2025-01-20",
  "bankGuaranteeReleaseValidityClauseInPO": "BG valid until project completion",
  "bankGuaranteeRemarks": "ABG for advance payment",
  
  "salesManager": "Vikram Singh",
  "salesHead": "Ramesh Nair",
  "businessHead": "Anil Kapoor",
  "projectManager": "Suresh Kumar",
  "projectHead": "Rajesh Mehta",
  "collectionIncharge": "Priya Sharma",
  "salesAgentName": "ABC Agencies",
  "salesAgentCommission": "2.5",
  "collectionAgentName": "XYZ Collections",
  "collectionAgentCommission": "1.5",
  
  "deliveryScheduleClause": "Delivery within 90 days from PO date",
  "liquidatedDamagesClause": "0.5% per week delay, max 5%",
  "lastDateOfDelivery": "2024-04-20",
  "poValidity": "2024-07-20",
  "poSignedConcernName": "Global Manufacturing Solutions - Procurement",
  
  "boqEnabled": true,
  "boqItems": [
    {
      "materialDescription": "PLC Control System - Model X200",
      "qty": "10",
      "uom": "Nos",
      "unitPrice": "50000",
      "unitCost": "50000",
      "freight": "50000",
      "gst": "180000",
      "totalCost": "730000"
    },
    {
      "materialDescription": "HMI Touch Screen - 15 inch",
      "qty": "20",
      "uom": "Nos",
      "unitPrice": "25000",
      "unitCost": "25000",
      "freight": "50000",
      "gst": "90000",
      "totalCost": "690000"
    },
    {
      "materialDescription": "VFD Drive - 5 HP",
      "qty": "15",
      "uom": "Nos",
      "unitPrice": "30000",
      "unitCost": "30000",
      "freight": "30000",
      "gst": "81000",
      "totalCost": "531000"
    }
  ],
  
  "totalExWorks": "1950000",
  "totalFreightAmount": "130000",
  "gst": "351000",
  "totalPOValue": "2431000"
}
```

---

## 3. Invoice - Sample Data

```json
{
  "keyId": "",
  "gstTaxInvoiceNo": "INV/GMS/2024/001",
  "gstTaxInvoiceDate": "2024-02-15",
  "internalInvoiceNo": "INT/2024/001",
  "invoiceType": "GST",
  "businessUnit": "Automation",
  "customerId": "1",
  "customerName": "Global Manufacturing Solutions",
  "segment": "Domestic",
  "region": "West",
  "zone": "West",
  "salesOrderNo": "SO/2024/001",
  "accountManagerName": "Vikram Singh",
  "poNoReference": "PO/GMS/2024/001",
  "poDate": "2024-01-20",
  "poEntryId": "1",
  
  "materialDescriptionType": "Equipment",
  "stateOfSupply": "Maharashtra",
  "qty": "10",
  "unit": "Nos",
  "currency": "INR",
  "basicRate": "50000",
  "basicValue": "500000",
  "freightInvoiceNo": "FRT/2024/001",
  "freightRate": "5000",
  "freightValue": "50000",
  "sgstOutput": "45000",
  "cgstOutput": "45000",
  "igstOutput": "0",
  "ugstOutput": "0",
  "totalGst": "90000",
  "tcs": "0",
  "subTotal": "550000",
  "totalInvoiceValue": "640000",
  
  "consigneeNameAddress": "GMS Warehouse - Delhi, 200 Logistics Hub, Sector 25",
  "consigneeCity": "Delhi",
  "payerNameAddress": "Global Manufacturing Solutions - Accounts Payable, 100 Corporate Plaza",
  "city": "Mumbai",
  "lorryReceiptNo": "LR/2024/001",
  "lorryReceiptDate": "2024-02-20",
  "transporterName": "ABC Transport",
  "deliveryChallanNo": "DC/2024/001",
  "deliveryChallanDate": "2024-02-18",
  
  "paymentText": "Net 45 with 20% Advance",
  "paymentTerms": "Net 45 with 20% Advance",
  "firstDueDate": "2024-04-01",
  "firstDueAmount": "512000",
  "paymentReceivedAmountFirstDue": "128000",
  "receiptDateFirstDue": "2024-02-20",
  "firstDueBalance": "384000",
  "notDueFirstDue": "0",
  "overDueFirstDue": "0",
  "noOfDaysOfPaymentReceiptFirstDue": "0",
  
  "secondDueDate": "2024-04-15",
  "secondDueAmount": "0",
  "paymentReceivedAmountSecondDue": "0",
  "receiptDateSecondDue": "",
  "secondDueBalance": "0",
  "notDueSecondDue": "0",
  "overDueSecondDue": "0",
  "noOfDaysOfPaymentReceiptSecondDue": "0",
  
  "thirdDueDate": "",
  "thirdDueAmount": "0",
  "paymentReceivedAmountThirdDue": "0",
  "receiptDateThirdDue": "",
  "thirdDueBalance": "0",
  "notDueThirdDue": "0",
  "overDueThirdDue": "0",
  "noOfDaysOfPaymentReceiptThirdDue": "0",
  
  "totalBalance": "512000",
  "notDueTotal": "512000",
  "overDueTotal": "0",
  
  "notes": "Invoice for first batch of PLC Control Systems"
}
```

---

## 4. MOM (Minutes of Meeting) - Sample Data

```json
{
  "meetingTitle": "Payment Discussion - PO/GMS/2024/001",
  "meetingDate": "2024-02-10",
  "participants": "Vikram Singh, Priya Patel, Amit Sharma, Rajesh Kumar",
  "agenda": "Discussion on payment schedule and delivery timeline",
  "discussionNotes": "Customer agreed to release 20% advance within 7 days. Balance payment will be made within 45 days of delivery. Delivery expected by end of March 2024.",
  
  "customerName": "Global Manufacturing Solutions",
  "projectName": "Automation System for Manufacturing Plant",
  "packageName": "Phase 1 - Control Systems",
  "paymentAmount": "512000",
  "paymentType": "1st Due",
  "bankName": "HDFC Bank",
  "bankCreditDate": "2024-02-20",
  
  "agreedPaymentTerms": "20% advance (Rs. 1,28,000) on PO, balance (Rs. 3,84,000) within 45 days of delivery",
  "paymentAmount": "512000",
  "dueDate": "2024-04-01",
  "paymentType": "Advance + Balance",
  "interestRate": "1.5% per month for late payment",
  
  "linkedInvoiceId": "1",
  "linkedPoEntryId": "1",
  
  "actionItems": [
    {
      "title": "Release 20% advance payment",
      "ownerName": "Priya Patel",
      "ownerEmail": "accounts@gmsolutions.com",
      "dueDate": "2024-02-17",
      "status": "completed",
      "notes": "Advance payment released on 2024-02-20"
    },
    {
      "title": "Complete delivery of first batch",
      "ownerName": "Suresh Kumar",
      "ownerEmail": "suresh.kumar@techcorp.com",
      "dueDate": "2024-03-31",
      "status": "in_progress",
      "notes": "Manufacturing in progress, expected completion by March 25"
    },
    {
      "title": "Process balance payment",
      "ownerName": "Priya Patel",
      "ownerEmail": "accounts@gmsolutions.com",
      "dueDate": "2024-04-15",
      "status": "open",
      "notes": "Pending delivery completion"
    }
  ]
}
```

---

## 5. Customer - Sample Data (Alternative Entry)

```json
{
  "companyName": "Metro Engineering Works",
  "legalEntityName": "Metro Engineering Works Private Limited",
  "customerAddress": "500 Industrial Estate, Phase 2",
  "district": "Noida",
  "state": "Uttar Pradesh",
  "country": "India",
  "pinCode": "201301",
  "gstNumber": "09AABCU9603R1Z5",
  "segment": "Domestic",
  "zone": "North",
  "businessType": "OEM",
  "contactEmail": "info@metroengg.com",
  "contactPhone": "+91-9876543220",
  "status": "active"
}
```

---

## 6. Payment - Sample Data

```json
{
  "invoiceId": "1",
  "customerId": "1",
  "amount": "128000",
  "paymentDate": "2024-02-20",
  "paymentMethod": "bank_transfer",
  "referenceNumber": "TXN/2024/001",
  "bankName": "HDFC Bank",
  "notes": "20% advance payment as per PO terms",
  "status": "completed"
}
```

---

## Quick Test Sequence

1. **Start with Master Data Wizard:**
   - Fill all 7 steps with the sample data above
   - Submit - This creates the customer in the system

2. **Create PO Entry:**
   - Select customer "Global Manufacturing Solutions" (auto-filled from master data)
   - Fill PO details with sample data
   - Enable BOQ and add items
   - Submit

3. **Create Invoice:**
   - Select PO Entry from dropdown (auto-fills customer, PO details, payment terms)
   - Fill invoice details
   - Submit

4. **Create MOM:**
   - Link to invoice and PO entry
   - Fill meeting details
   - Add action items
   - Submit

5. **Record Payment:**
   - Select invoice
   - Enter payment details
   - Submit

---

## Notes

- All dates are in YYYY-MM-DD format
- GST numbers follow Indian format: 27AABCU9603R1Z5
- Amounts are in INR (Indian Rupees)
- Customer IDs and Invoice IDs will be auto-generated by the system
- When selecting PO Entry in Invoice form, customer and related fields auto-fill
- Payment terms from Master Data are available in all forms

---

**Last Updated:** January 2025

