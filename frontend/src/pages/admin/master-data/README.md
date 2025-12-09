# Master Data Wizard - Complete Implementation

A comprehensive 5-step wizard for setting up master data in the Financial Management System.

## 📋 Steps Overview

### Step 1: Company Profile
Captures essential company information including legal details, location, and contact information.

**Fields:**
- Company Name
- Legal Entity Name
- Corporate Office Address
- Correspondence Address
- District, State, Country, Pin Code
- GSTIN, PAN Number, CIN Number
- Business Type (Proprietorship/Partnership/Pvt Ltd/Public Ltd)
- Business Unit
- Website, Email ID, Contact Number

**Validation:** Zod schema with regex patterns for GSTIN, PAN, phone numbers, URLs

### Step 2: Customer Profile
Customer master data configuration with the fields required by the master data page.

**Fields:**
- Logo
- Customer Name
- Legal Entity Name
- Corporate Office Address
- Correspondence Address
- District, State, Country, Pin Code
- Segment (Domestic / Export)
- GST No
- PO Issuing Authority / Contact Person Name
- Designation
- Contact Person Contact No
- Email ID

**Validation:** Email, phone, pin code, and required field validations

### Step 3: Payment Terms
Payment configuration including bank details and billing cycles.

**Fields:**
- Payment Term Name
- Credit Period (Days)
- Advance Required (Yes/No) → Shows Advance % if Yes
- Balance Payment Due Days
- Late Payment Interest %
- Billing Cycle (Monthly/Quarterly/Yearly)
- Payment Method (Bank Transfer/UPI/Cheque)
- Bank Name, Account Number, IFSC Code
- UPI ID (if UPI selected)
- Notes

**Dynamic Fields:** Bank and UPI fields show based on payment method selection

### Step 4: Team Profiles
Team member configuration with role-based access control.

**Fields:**
- Team Member Name & Employee ID
- Role (Manager/Accountant/Sales/Operations)
- Department
- Contact Number, Email ID
- Reporting Manager
- Location
- Access Level (Admin/Standard/Viewer)
- Remarks

**Validation:** Email, phone, and required field validations

### Step 5: Additional Step
System configuration for automation and notifications.

**Fields:**
- Default Currency
- Default Tax %
- Invoice Prefix & Quotation Prefix
- Enable BOQ (Yes/No)
- Enable Auto-Invoice (Yes/No)
- Notification Email
- SMS Notification (Yes/No)
- Allow Partial Delivery (Yes/No)
- Service Charge %
- Remarks

**Final Action:** Submit button to complete all master data setup

## 🏗️ Architecture

### Component Structure
```
MasterDataWizard (index.tsx)
├── Step1CompanyProfile.tsx
├── Step2CustomerProfile.tsx
├── Step3PaymentTerms.tsx
├── Step4TeamProfiles.tsx
└── Step5AdditionalStep.tsx
```

### State Management
- Uses React state for wizard navigation
- `useMasterDataWizard` hook for reusable state logic
- Form data persisted in parent component
- Data accessible via `getAllData()` method

### Validation
- **React Hook Form** for form handling
- **Zod** for schema validation
- Real-time error display
- Regex patterns for:
  - GSTIN: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
  - PAN: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`
  - IFSC: `^[A-Z]{4}[0][A-Z0-9]{6}$`
  - Phone: `^\d{10}$`
  - Pin Code: `^\d{5,6}$`

### Styling
- Tailwind CSS for responsive design
- Grid layout: `grid grid-cols-2 gap-6`
- White card with shadow: `bg-white rounded-xl shadow-sm`
- Focus states and error states
- Mobile responsive via Tailwind breakpoints

## 🚀 Usage

### Basic Implementation
```tsx
import MasterDataWizard from '@/pages/admin/master-data'

export default function AdminPage() {
  return <MasterDataWizard />
}
```

### Using the Hook
```tsx
import { useMasterDataWizard } from '@/hooks/useMasterDataWizard'

function MyComponent() {
  const {
    currentStep,
    masterData,
    goToNextStep,
    goToPreviousStep,
    getAllData,
  } = useMasterDataWizard()

  const handleSubmit = () => {
    const allData = getAllData()
    console.log(allData)
  }

  return (
    // Your component
  )
}
```

### API Integration
```tsx
import masterDataService from '@/services/masterDataService'

// Submit all data
const handleFinalSubmit = async (data) => {
  try {
    const response = await masterDataService.submitMasterData(data)
    console.log('Success:', response)
  } catch (error) {
    console.error('Error:', error.message)
  }
}

// Update specific section
const updateCompany = async (companyData) => {
  try {
    const response = await masterDataService.updateCompanyProfile(companyData)
    console.log('Company updated:', response)
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

## 📁 File Structure
```
frontend/src/
├── pages/admin/master-data/
│   ├── index.tsx                  # Main wizard component
│   ├── Step1CompanyProfile.tsx    # Step 1
│   ├── Step2CustomerProfile.tsx   # Step 2
│   ├── Step3PaymentTerms.tsx      # Step 3
│   ├── Step4TeamProfiles.tsx      # Step 4
│   └── Step5AdditionalStep.tsx    # Step 5
├── hooks/
│   └── useMasterDataWizard.ts     # Custom hook
├── services/
│   └── masterDataService.ts       # API service
└── README.md                       # This file
```

## 🎨 UI Features

### Progress Indicator
- Visual step counter (1-5)
- Color-coded progress (current/completed/pending)
- Progress bar showing completion percentage

### Navigation Buttons
- Previous button (disabled on Step 1)
- Next button (Steps 1-4)
- Submit button (Step 5) - Green color for emphasis

### Form Validation
- Real-time error messages
- Field-level error highlighting
- Red border on validation failure
- Error text below each field

### Responsive Design
- 2-column grid layout
- Adapts to different screen sizes
- Full-width on mobile (can be enhanced)
- White card container with shadows

## 🔌 API Endpoints (Backend Required)

### Endpoints to Create
```
POST   /api/admin/master-data              # Submit all data
GET    /api/admin/master-data              # Get existing data
GET    /api/admin/master-data/status       # Get completion status
PUT    /api/admin/master-data/company-profile
PUT    /api/admin/master-data/customer-profile
PUT    /api/admin/master-data/payment-terms
PUT    /api/admin/master-data/team-profiles
PUT    /api/admin/master-data/additional-step
```

## 🧪 Data Types

### CompanyProfileData
```typescript
{
  companyName: string
  legalEntityName: string
  corporateOfficeAddress: string
  district: string
  state: string
  country: string
  pinCode: string
  correspondenceAddress: string
  gstin: string
  panNumber: string
  cinNumber: string
  businessType: 'Proprietorship' | 'Partnership' | 'Pvt Ltd' | 'Public Ltd'
  businessUnit: string
  website?: string
  emailId: string
  contactNumber: string
}
```

### CustomerProfileData
```typescript
{
  customerName: string
  customerCode: string
  gstin: string
  panNumber: string
  companyType: string
  segment: string
  region: string
  zone: string
  billingAddress: string
  shippingAddress: string
  contactPersonName: string
  contactPersonNumber: string
  contactEmailId: string
  creditPeriod: string
  paymentTerms: string
  deliveryTerms: string
  projectManager: string
  anyHold: 'Yes' | 'No'
  remarks?: string
}
```

### PaymentTermsData
```typescript
{
  paymentTermName: string
  creditPeriod: string
  advanceRequired: 'Yes' | 'No'
  advancePercentage?: string
  balancePaymentDueDays: string
  latePaymentInterest: string
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly'
  paymentMethod: 'Bank Transfer' | 'UPI' | 'Cheque'
  bankName: string
  bankAccountNumber: string
  ifscCode: string
  upiId?: string
  notes?: string
}
```

### TeamProfileData
```typescript
{
  teamMemberName: string
  employeeId: string
  role: 'Manager' | 'Accountant' | 'Sales' | 'Operations'
  department: string
  contactNumber: string
  emailId: string
  reportingManager: string
  location: string
  accessLevel: 'Admin' | 'Standard' | 'Viewer'
  remarks?: string
}
```

### AdditionalStepData
```typescript
{
  defaultCurrency: string
  defaultTax: string
  invoicePrefix: string
  quotationPrefix: string
  enableBOQ: 'Yes' | 'No'
  enableAutoInvoice: 'Yes' | 'No'
  notificationEmail: string
  smsNotification: 'Yes' | 'No'
  allowPartialDelivery: 'Yes' | 'No'
  serviceCharge: string
  remarks?: string
}
```

## 🛠️ Customization

### Adding a New Step
1. Create new component file: `StepXNewStep.tsx`
2. Define Zod schema
3. Create form with FormField component
4. Add to MasterDataWizard index.tsx
5. Add to useMasterDataWizard hook

### Changing Field Validation
Edit the respective Zod schema:
```tsx
const companyProfileSchema = z.object({
  // Modify validation here
})
```

### Styling Changes
- Update Tailwind classes in components
- Modify colors, spacing, and typography
- Adjust grid columns: `grid-cols-2` → `grid-cols-3`

### Adding Conditional Fields
Use `watch()` from react-hook-form:
```tsx
const advanceRequired = watch('advanceRequired')

// Then conditionally render:
{advanceRequired === 'Yes' && <FormField ... />}
```

## 📦 Dependencies

Required packages (already in your project):
- `react-hook-form`
- `@hookform/resolvers`
- `zod`
- `tailwindcss`
- `axios` (for API calls)

## 🐛 Known Limitations

1. Mobile layout needs optimization (currently 2-column on all sizes)
2. No file upload support (can be added)
3. No form save/auto-save functionality
4. Confirmation dialog on page leave not implemented
5. No multi-language support

## 🚀 Future Enhancements

- [ ] Add file upload for company documents
- [ ] Implement auto-save functionality
- [ ] Add confirmation dialog on unsaved changes
- [ ] Add multi-language support
- [ ] Add dark mode support
- [ ] Add step completion indicators
- [ ] Add export functionality
- [ ] Add form templates for different industries

## 📞 Support

For issues or questions, check:
1. Zod validation schema for field requirements
2. API service for endpoint implementations
3. Component props for customization options

---

**Created:** December 2, 2025  
**Status:** Production Ready
