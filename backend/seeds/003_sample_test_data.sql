-- Sample Test Data for Financial Management System
-- This file contains sample data for testing all forms

-- Note: Replace user_id values with actual user IDs from your users table
-- Replace customer_id values with actual customer IDs after running this seed

-- Sample Customer (from Master Data)
INSERT INTO customers (
  company_name,
  legal_entity_name,
  customer_address,
  district,
  state,
  country,
  pin_code,
  gst_number,
  segment,
  zone,
  contact_email,
  contact_phone,
  status,
  created_by,
  created_at,
  updated_at
) VALUES (
  'Global Manufacturing Solutions',
  'Global Manufacturing Solutions Limited',
  '100 Corporate Plaza, Bandra Kurla Complex',
  'Mumbai Suburban',
  'Maharashtra',
  'India',
  '400051',
  '27AABCU9603R1Z5',
  'Domestic',
  'West',
  'procurement@gmsolutions.com',
  '+91-9876543211',
  'active',
  1, -- Replace with actual user_id
  NOW(),
  NOW()
);

-- Sample PO Entry
-- Note: customer_id should match the customer created above
INSERT INTO po_entries (
  customer_id,
  customer_name,
  legal_entity_name,
  customer_address,
  district,
  state,
  country,
  pin_code,
  gst_no,
  business_unit,
  segment,
  zone,
  contract_agreement_no,
  contract_agreement_date,
  po_no,
  po_date,
  letter_of_intent_no,
  letter_of_intent_date,
  letter_of_award_no,
  letter_of_award_date,
  tender_reference_no,
  tender_date,
  project_description,
  payment_type,
  payment_terms,
  payment_terms_clause_in_po,
  insurance_type,
  policy_no,
  policy_date,
  policy_company,
  policy_valid_upto,
  bank_guarantee_type,
  bank_guarantee_no,
  bank_guarantee_date,
  bank_guarantee_value,
  bank_name,
  bank_guarantee_validity,
  sales_manager,
  sales_head,
  business_head,
  project_manager,
  project_head,
  collection_incharge,
  sales_agent_name,
  sales_agent_commission,
  collection_agent_name,
  collection_agent_commission,
  delivery_schedule_clause,
  liquidated_damages_clause,
  last_date_of_delivery,
  po_validity,
  po_signed_concern_name,
  boq_enabled,
  boq_items,
  total_ex_works,
  total_freight_amount,
  gst,
  total_po_value,
  created_by,
  created_at,
  updated_at
) VALUES (
  1, -- Replace with actual customer_id
  'Global Manufacturing Solutions',
  'Global Manufacturing Solutions Limited',
  '100 Corporate Plaza, Bandra Kurla Complex',
  'Mumbai Suburban',
  'Maharashtra',
  'India',
  '400051',
  '27AABCU9603R1Z5',
  'Automation',
  'Domestic',
  'West',
  'CA/2024/001',
  '2024-01-15',
  'PO/GMS/2024/001',
  '2024-01-20',
  'LOI/GMS/2024/001',
  '2024-01-10',
  'LOA/GMS/2024/001',
  '2024-01-12',
  'TEN/GMS/2024/001',
  '2024-01-05',
  'Automation System for Manufacturing Plant',
  'Secured',
  'Net 45 with 20% Advance',
  '20% advance on PO, balance within 45 days of delivery',
  'Marine Insurance',
  'INS/2024/001',
  '2024-01-20',
  'ICICI Lombard',
  '2025-01-20',
  'Advance Bank Guarantee',
  'BG/2024/001',
  '2024-01-20',
  500000,
  'HDFC Bank',
  '2025-01-20',
  'Vikram Singh',
  'Ramesh Nair',
  'Anil Kapoor',
  'Suresh Kumar',
  'Rajesh Mehta',
  'Priya Sharma',
  'ABC Agencies',
  2.5,
  'XYZ Collections',
  1.5,
  'Delivery within 90 days from PO date',
  '0.5% per week delay, max 5%',
  '2024-04-20',
  '2024-07-20',
  'Global Manufacturing Solutions - Procurement',
  1,
  JSON_ARRAY(
    JSON_OBJECT(
      'materialDescription', 'PLC Control System - Model X200',
      'qty', '10',
      'uom', 'Nos',
      'unitPrice', '50000',
      'unitCost', '50000',
      'freight', '50000',
      'gst', '180000',
      'totalCost', '730000'
    ),
    JSON_OBJECT(
      'materialDescription', 'HMI Touch Screen - 15 inch',
      'qty', '20',
      'uom', 'Nos',
      'unitPrice', '25000',
      'unitCost', '25000',
      'freight', '50000',
      'gst', '90000',
      'totalCost', '690000'
    ),
    JSON_OBJECT(
      'materialDescription', 'VFD Drive - 5 HP',
      'qty', '15',
      'uom', 'Nos',
      'unitPrice', '30000',
      'unitCost', '30000',
      'freight', '30000',
      'gst', '81000',
      'totalCost', '531000'
    )
  ),
  1950000,
  130000,
  351000,
  2431000,
  1, -- Replace with actual user_id
  NOW(),
  NOW()
);

-- Sample Invoice
-- Note: customer_id should match the customer created above
INSERT INTO invoices (
  invoice_number,
  customer_id,
  issue_date,
  due_date,
  subtotal,
  tax_rate,
  tax_amount,
  total_amount,
  paid_amount,
  status,
  po_ref,
  payment_terms,
  notes,
  items,
  created_by,
  created_at,
  updated_at
) VALUES (
  'INV/GMS/2024/001',
  1, -- Replace with actual customer_id
  '2024-02-15',
  '2024-04-01',
  550000,
  18,
  99000,
  649000,
  128000,
  'sent',
  'PO/GMS/2024/001',
  'Net 45 with 20% Advance',
  'Invoice for first batch of PLC Control Systems',
  JSON_ARRAY(
    JSON_OBJECT(
      'description', 'PLC Control System - Model X200',
      'quantity', 10,
      'unitPrice', 50000,
      'total', 500000
    )
  ),
  1, -- Replace with actual user_id
  NOW(),
  NOW()
);

-- Sample Payment
-- Note: invoice_id should match the invoice created above
INSERT INTO payments (
  invoice_id,
  customer_id,
  amount,
  payment_date,
  payment_method,
  reference_number,
  status,
  notes,
  processed_by,
  created_at,
  updated_at
) VALUES (
  1, -- Replace with actual invoice_id
  1, -- Replace with actual customer_id
  128000,
  '2024-02-20',
  'bank_transfer',
  'TXN/2024/001',
  'completed',
  '20% advance payment as per PO terms',
  1, -- Replace with actual user_id
  NOW(),
  NOW()
);

-- Sample Payment MOM
INSERT INTO payment_moms (
  customer_id,
  linked_invoice_id,
  meeting_title,
  meeting_date,
  participants,
  agenda,
  discussion_notes,
  agreed_payment_terms,
  payment_amount,
  due_date,
  payment_type,
  interest_rate,
  status,
  created_by,
  created_at,
  updated_at
) VALUES (
  1, -- Replace with actual customer_id
  1, -- Replace with actual invoice_id
  'Payment Discussion - PO/GMS/2024/001',
  '2024-02-10',
  'Vikram Singh, Priya Patel, Amit Sharma, Rajesh Kumar',
  'Discussion on payment schedule and delivery timeline',
  'Customer agreed to release 20% advance within 7 days. Balance payment will be made within 45 days of delivery.',
  '20% advance (Rs. 1,28,000) on PO, balance (Rs. 3,84,000) within 45 days of delivery',
  512000,
  '2024-04-01',
  'Advance + Balance',
  1.5,
  'due',
  1, -- Replace with actual user_id
  NOW(),
  NOW()
);

-- Sample Action Items
-- Note: mom_id should match the payment_mom created above
INSERT INTO action_items (
  mom_id,
  title,
  owner_name,
  owner_email,
  due_date,
  status,
  notes
) VALUES (
  1, -- Replace with actual mom_id
  'Release 20% advance payment',
  'Priya Patel',
  'accounts@gmsolutions.com',
  '2024-02-17',
  'completed',
  'Advance payment released on 2024-02-20'
),
(
  1, -- Replace with actual mom_id
  'Complete delivery of first batch',
  'Suresh Kumar',
  'suresh.kumar@techcorp.com',
  '2024-03-31',
  'in_progress',
  'Manufacturing in progress, expected completion by March 25'
),
(
  1, -- Replace with actual mom_id
  'Process balance payment',
  'Priya Patel',
  'accounts@gmsolutions.com',
  '2024-04-15',
  'open',
  'Pending delivery completion'
);

