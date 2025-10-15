INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active)
VALUES ('admin', 'admin@example.com', '$2a$12$E2o2oZlJg1bOa1pFJv3DuegqM5X0G3j2v7xYVJzLQKxwQ7D7V1/ue', 'Admin', 'User', 'admin', 1)
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO customers (customer_code, company_name, contact_email, contact_phone, status)
VALUES ('CUST0001','Acme Corp','acme@example.com','+91-9999999999','active')
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name);

INSERT INTO invoices (invoice_number, customer_id, issue_date, due_date, subtotal, tax_rate, tax_amount, total_amount, paid_amount, status)
VALUES ('INV20250001', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 100000, 18, 18000, 118000, 56000, 'sent')
ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount);

INSERT INTO payments (payment_code, invoice_id, customer_id, amount, payment_date, method, reference, status)
VALUES ('PAY0001', 1, 1, 56000, NOW(), 'bank_transfer', 'NEFT123', 'completed')
ON DUPLICATE KEY UPDATE amount = VALUES(amount);

INSERT INTO alerts (type, message)
VALUES ('warning','3 invoices due today'),('danger','2 invoices overdue 30+ days'),('success','Payment received: ₹45,000');


