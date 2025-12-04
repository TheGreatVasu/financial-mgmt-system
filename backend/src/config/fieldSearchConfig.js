// Central mapping for shared fields across forms/tables.
// You can extend this to add or remove fields and sources.
//
// Each key is a logical field identifier used by the frontend (fieldKey).
// Each value defines:
//  - label: Human readable label (for docs / debugging)
//  - sources: Array of { table, column } pairs that will be searched

module.exports = {
  customerName: {
    label: 'Customer Name',
    sources: [
      // Only use master data records with id >= 8 to skip old seed data
      { table: 'customers', column: 'company_name', minId: 8 },
      { table: 'customers', column: 'name', minId: 8 },
      { table: 'po_entries', column: 'customer_name' },
      { table: 'payments', column: 'customer_name' },
      { table: 'payment_moms', column: 'customer_name' }, // may not exist in all schemas
      { table: 'sales_invoice_master', column: 'customer_name' },
    ],
  },
  projectName: {
    label: 'Project / Business Unit / Sales Order',
    sources: [
      { table: 'sales_invoice_master', column: 'business_unit' },
      { table: 'sales_invoice_master', column: 'sales_order_no' },
      { table: 'po_entries', column: 'description' },
      { table: 'payments', column: 'project_name' },
    ],
  },
  packageName: {
    label: 'Package / Material Description',
    sources: [
      { table: 'sales_invoice_master', column: 'material_description' },
      { table: 'payments', column: 'package_name' },
    ],
  },
  poNumber: {
    label: 'PO Number',
    sources: [
      { table: 'po_entries', column: 'po_no' },
      { table: 'sales_invoice_master', column: 'po_no' },
      { table: 'invoices', column: 'po_ref' },
    ],
  },
  invoiceNumber: {
    label: 'Invoice Number',
    sources: [
      { table: 'invoices', column: 'invoice_number' },
      { table: 'sales_invoice_master', column: 'gst_tax_invoice_no' },
      { table: 'sales_invoice_master', column: 'internal_invoice_no' },
      { table: 'payments', column: 'invoice_id' },
    ],
  },
  gstNumber: {
    label: 'GST Number',
    sources: [
      { table: 'customers', column: 'gst_number', minId: 8 },
      { table: 'po_entries', column: 'gst_no' },
    ],
  },
  email: {
    label: 'Email',
    sources: [
      { table: 'users', column: 'email' },
      { table: 'customers', column: 'email_id', minId: 8 },
    ],
  },
  phone: {
    label: 'Phone',
    sources: [
      { table: 'users', column: 'phone_number' },
      { table: 'customers', column: 'contact_person_number', minId: 8 },
    ],
  },
  status: {
    label: 'Status',
    sources: [
      { table: 'invoices', column: 'status' },
      { table: 'payments', column: 'status' },
      { table: 'payment_moms', column: 'status' },
    ],
  },
};


