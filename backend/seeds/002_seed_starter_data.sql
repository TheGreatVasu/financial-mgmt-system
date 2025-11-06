-- ============================================
-- Financial Management System - Starter Data
-- ============================================
-- This seed file creates starter login credentials and sample data
-- 
-- Default Login Credentials:
-- Email: admin@financialsystem.com
-- Password: admin123
-- 
-- Email: demo@financialsystem.com  
-- Password: demo123
-- ============================================

-- Starter Users (with proper password hashes)
-- Password for admin and vasu: admin123
-- Password for demo: demo123
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active) VALUES
('admin', 'admin@financialsystem.com', '$2a$12$Ve8O3MDlvuAaKGERpDd57.OdM//34WBMS7JzIa8NWZPjnpUl/1asq', 'Admin', 'User', 'admin', 1),
('demo', 'demo@financialsystem.com', '$2a$12$.8uWCqbZegQlputRDTh0i.zCHhjI2TNZVK86qw6Ywd7hbdmkd4gM2', 'Demo', 'User', 'user', 1),
('vasu', 'vasu@financialsystem.com', '$2a$12$Ve8O3MDlvuAaKGERpDd57.OdM//34WBMS7JzIa8NWZPjnpUl/1asq', 'Vasu', 'Sharma', 'admin', 1)
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- Sample Customers
INSERT INTO customers (customer_code, company_name, contact_email, contact_phone, status, created_by) VALUES
('CUST0001', 'Acme Corporation', 'contact@acmecorp.com', '+91-9876543210', 'active', 1),
('CUST0002', 'Tech Solutions Ltd', 'info@techsolutions.com', '+91-9876543211', 'active', 1),
('CUST0003', 'Global Industries', 'sales@globalind.com', '+91-9876543212', 'active', 1),
('CUST0004', 'Digital Services Inc', 'hello@digitalservices.com', '+91-9876543213', 'active', 1),
('CUST0005', 'Prime Manufacturing', 'contact@primemfg.com', '+91-9876543214', 'active', 1)
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name);

-- Sample Invoices
INSERT INTO invoices (invoice_number, customer_id, issue_date, due_date, subtotal, tax_rate, tax_amount, total_amount, paid_amount, status, created_by) VALUES
('INV20250001', 1, DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 100000.00, 18.00, 18000.00, 118000.00, 56000.00, 'sent', 1),
('INV20250002', 2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 20 DAY), 150000.00, 18.00, 27000.00, 177000.00, 0.00, 'sent', 1),
('INV20250003', 3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY), 200000.00, 18.00, 36000.00, 236000.00, 100000.00, 'sent', 1),
('INV20250004', 4, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 75000.00, 18.00, 13500.00, 88500.00, 0.00, 'draft', 1),
('INV20250005', 5, DATE_SUB(CURDATE(), INTERVAL 45 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY), 50000.00, 18.00, 9000.00, 59000.00, 0.00, 'overdue', 1),
('INV20250006', 1, DATE_SUB(CURDATE(), INTERVAL 30 DAY), CURDATE(), 120000.00, 18.00, 21600.00, 141600.00, 141600.00, 'paid', 1),
('INV20250007', 2, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 80000.00, 18.00, 14400.00, 94400.00, 50000.00, 'sent', 1)
ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount);

-- Sample Payments
INSERT INTO payments (payment_code, invoice_id, customer_id, amount, payment_date, method, reference, status, processed_by) VALUES
('PAY0001', 1, 1, 56000.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'bank_transfer', 'NEFT123456', 'completed', 1),
('PAY0002', 3, 3, 100000.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'upi', 'UPI789012', 'completed', 1),
('PAY0003', 6, 1, 141600.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'bank_transfer', 'NEFT345678', 'completed', 1),
('PAY0004', 7, 2, 50000.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'credit_card', 'CC901234', 'completed', 1),
('PAY0005', 2, 2, 50000.00, CURDATE(), 'bank_transfer', 'NEFT567890', 'pending', 1)
ON DUPLICATE KEY UPDATE amount = VALUES(amount);

-- Sample Payment MOMs
INSERT INTO payment_moms (mom_id, meeting_title, meeting_date, participants, agenda, discussion_notes, agreed_payment_terms, customer_id, payment_amount, due_date, payment_type, interest_rate, status, smart, calendar, ai_summary, created_by) VALUES
('MOM0001', 'Collection Review with Acme Corp', DATE_SUB(CURDATE(), INTERVAL 7 DAY), '["Mr. Rajender Gurung", "Mr. Jaspreet Chopra", "Mr. Yugesh Mutha", "Mr. Sanket Samant"]', 'Collection Planning', 'Discussed payment schedule and collection strategy', 'Agreed to pay ₹56,000 by next week', 1, 56000.00, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'milestone', 0.00, 'due', '{"totalPayable":56000,"pendingDues":56000,"computedInterest":0}', '{}', 'Meeting focused on payment collection for outstanding invoices', 1),
('MOM0002', 'Payment Terms Discussion - Tech Solutions', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '["Mr. John Doe", "Ms. Jane Smith"]', 'Payment Terms Negotiation', 'Reviewed payment terms and agreed on new schedule', 'Payment of ₹1,00,000 due within 15 days', 2, 100000.00, DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'milestone', 0.00, 'planned', '{"totalPayable":100000,"pendingDues":100000,"computedInterest":0}', '{}', 'Agreed on revised payment schedule', 1),
('MOM0003', 'Overdue Invoice Follow-up', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '["Mr. Prime Contact"]', 'Overdue Payment Collection', 'Discussed overdue invoice and payment plan', 'Agreed to clear overdue amount with interest', 5, 59000.00, DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'final', 2.00, 'overdue', '{"totalPayable":62940,"pendingDues":59000,"computedInterest":3940}', '{}', 'Urgent follow-up on overdue payment with interest charges', 1)
ON DUPLICATE KEY UPDATE meeting_title = VALUES(meeting_title);

-- Sample Action Items
INSERT INTO action_items (action_id, title, owner_name, owner_email, due_date, status, notes) VALUES
('A1', 'Update Q3 capacity plan based on reprioritized features', 'Vasu', 'vasu@financialsystem.com', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'open', 'Referencing MOM0001 decision'),
('A2', 'Purchase the new software license and share credentials', 'Admin', 'admin@financialsystem.com', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'open', 'Referencing MOM0002 decision'),
('A3', 'Send Beta Test V2 deployment instructions to the team', 'Demo', 'demo@financialsystem.com', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'open', 'Referencing MOM0003 decision'),
('A4', 'Follow up with Acme Corp for payment collection', 'Vasu', 'vasu@financialsystem.com', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'open', 'Payment due from MOM0001'),
('A5', 'Review and approve Tech Solutions payment terms', 'Admin', 'admin@financialsystem.com', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'open', 'New payment schedule needs approval')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Sample Alerts
INSERT INTO alerts (type, message, read_flag) VALUES
('warning', '3 invoices due today', 0),
('danger', '2 invoices overdue 30+ days', 0),
('success', 'Payment received: ₹45,000', 0),
('info', 'New customer registered: Digital Services Inc', 0),
('warning', 'Payment pending: PAY0005', 0),
('success', 'Invoice INV20250006 marked as paid', 0),
('danger', 'Invoice INV20250005 is overdue by 15 days', 0)
ON DUPLICATE KEY UPDATE message = VALUES(message);

-- Sample Audit Logs
INSERT INTO audit_logs (action, entity, entity_id, performed_by, ip_address, user_agent, changes) VALUES
('create', 'invoice', 1, 1, '127.0.0.1', 'Mozilla/5.0', '{"invoice_number":"INV20250001","total_amount":118000}'),
('create', 'payment', 1, 1, '127.0.0.1', 'Mozilla/5.0', '{"payment_code":"PAY0001","amount":56000}'),
('create', 'customer', 1, 1, '127.0.0.1', 'Mozilla/5.0', '{"customer_code":"CUST0001","company_name":"Acme Corporation"}'),
('update', 'invoice', 1, 1, '127.0.0.1', 'Mozilla/5.0', '{"paid_amount":56000,"status":"sent"}'),
('login', 'user', 1, 1, '127.0.0.1', 'Mozilla/5.0', '{"provider":"local"}')
ON DUPLICATE KEY UPDATE changes = VALUES(changes);

