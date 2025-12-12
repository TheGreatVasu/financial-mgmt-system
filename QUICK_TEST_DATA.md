# Quick Test Data - Copy & Paste Ready

## 🚀 Quick Start Test Data

### 1. Master Data - Company Profile
```
Company Name: TechCorp Industries Pvt Ltd
Legal Entity: TechCorp Industries Private Limited
Corporate Address: 123 Industrial Park, Sector 18, Gurgaon, Haryana 122015
Primary Contact: Rajesh Kumar, +91-9876543210, rajesh.kumar@techcorp.com
```

### 2. Master Data - Customer Profile
```
Customer Name: Global Manufacturing Solutions
Legal Entity: Global Manufacturing Solutions Limited
Address: 100 Corporate Plaza, Bandra Kurla Complex, Mumbai 400051
GST: 27AABCU9603R1Z5
Segment: Domestic
Contact: procurement@gmsolutions.com, +91-9876543211
```

### 3. PO Entry - Quick Fill
```
Customer: Global Manufacturing Solutions (select from dropdown)
PO No: PO/GMS/2024/001
PO Date: 2024-01-20
Contract Agreement No: CA/2024/001
Payment Terms: Net 45 with 20% Advance
Total PO Value: 2431000

BOQ Items:
1. PLC Control System - 10 Nos @ 50000 = 500000
2. HMI Touch Screen - 20 Nos @ 25000 = 500000
3. VFD Drive - 15 Nos @ 30000 = 450000
```

### 4. Invoice - Quick Fill
```
Select PO Entry: PO/GMS/2024/001 (auto-fills customer)
GST Tax Invoice No: INV/GMS/2024/001
GST Tax Invoice Date: 2024-02-15
Invoice Type: GST
Business Unit: Automation
Total Invoice Value: 640000
Payment Terms: Net 45 with 20% Advance (auto-filled)
```

### 5. MOM - Quick Fill
```
Meeting Title: Payment Discussion - PO/GMS/2024/001
Meeting Date: 2024-02-10
Customer: Global Manufacturing Solutions
Project: Automation System for Manufacturing Plant
Payment Amount: 512000
Payment Type: 1st Due
```

### 6. Payment - Quick Fill
```
Invoice: INV/GMS/2024/001 (select from dropdown)
Amount: 128000
Payment Date: 2024-02-20
Method: Bank Transfer
Reference: TXN/2024/001
```

---

## 📋 Test Checklist

- [ ] Create Master Data (all 7 steps)
- [ ] Verify customer appears in Customers list
- [ ] Create PO Entry with customer selection
- [ ] Verify PO Entry links to customer
- [ ] Create Invoice with PO Entry selection
- [ ] Verify auto-fill works (customer, PO details, payment terms)
- [ ] Create MOM linked to invoice
- [ ] Record payment against invoice
- [ ] Verify all relationships are maintained

---

## 🔗 Data Relationships

```
Master Data Customer
    ↓
Customers Table (synced)
    ↓
PO Entry (linked via customer_id)
    ↓
Invoice (linked via customer_id + po_ref)
    ↓
MOM (linked via invoice_id)
    ↓
Payment (linked via invoice_id)
```

---

## 💡 Tips

1. **Start Fresh**: Clear existing test data before testing
2. **Follow Order**: Master Data → PO Entry → Invoice → MOM → Payment
3. **Use Dropdowns**: Select from dropdowns to maintain relationships
4. **Check Auto-fill**: Verify fields auto-populate when selecting related records
5. **Validate Links**: Check that customer_id, invoice_id, etc. are properly linked

---

**Happy Testing! 🎉**

