// Central mapping of UI field names to backend logical field keys.
// This lets us automatically link fields across forms without
// duplicating logic in each component.
//
// Example:
//  - "customerName" and "customer_name" both map to "customerName"
//  - "poNo" maps to "poNumber"
//
// To extend: just add new entries to the arrays below.

const FIELD_KEY_BY_NAME = {
  // Customer / client
  customerName: 'customerName',
  customer_name: 'customerName',
  clientName: 'customerName',

  // Project / business unit
  projectName: 'projectName',
  businessUnit: 'projectName',
  salesOrderNo: 'projectName',

  // Package / material
  packageName: 'packageName',
  materialDescription: 'packageName',

  // PO
  poNo: 'poNumber',
  poNumber: 'poNumber',
  po_ref: 'poNumber',

  // Invoice
  invoiceNumber: 'invoiceNumber',
  invoice_number: 'invoiceNumber',

  // GST
  gstNo: 'gstNumber',
  gstNumber: 'gstNumber',

  // Contact
  email: 'email',
  emailId: 'email',
  contactEmailId: 'email',

  phone: 'phone',
  phoneNumber: 'phone',
  contactNumber: 'phone',
  contactPersonNumber: 'phone',

  // Status
  status: 'status',
}

// Optional per-field behaviour configuration for SmartDropdown
// so we can tweak interactions without touching every form.
const FIELD_BEHAVIOR_BY_KEY = {
  customerName: { openOnFocus: true },
  projectName: { openOnFocus: true },
  packageName: { openOnFocus: true },
  poNumber: { openOnFocus: true },
  invoiceNumber: { openOnFocus: true },
  email: { openOnFocus: true },
  phone: { openOnFocus: true },
  gstNumber: { openOnFocus: true },
  status: { openOnFocus: false },
}

export function getSharedFieldKey(fieldName) {
  if (!fieldName) return undefined
  const key = String(fieldName).trim()
  if (!key) return undefined
  return FIELD_KEY_BY_NAME[key] || undefined
}

export function isSharedField(fieldName) {
  return !!getSharedFieldKey(fieldName)
}

export function getFieldBehavior(fieldName) {
  const key = getSharedFieldKey(fieldName)
  if (!key) return {}
  return FIELD_BEHAVIOR_BY_KEY[key] || {}
}


