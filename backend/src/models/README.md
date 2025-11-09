# Models Directory

## ⚠️ Legacy Models - Not in Use

This directory contains **legacy Mongoose models** that are **NOT being used** in the current implementation.

The application now uses **MySQL via Knex.js** for all database operations.

### Current Status

- **User.js** - Already cleaned (empty file)
- **Customer.js** - Legacy Mongoose model (not used)
- **Invoice.js** - Legacy Mongoose model (not used)
- **Payment.js** - Legacy Mongoose model (not used)
- **PaymentMOM.js** - Legacy Mongoose model (not used)
- **Report.js** - Legacy Mongoose model (not used)
- **AuditLog.js** - Legacy Mongoose model (not used)

### Active Database Layer

All database operations are handled through:
- `backend/src/services/repositories.js` - Main repository layer
- `backend/src/services/userRepo.js` - User-specific operations
- Controllers use `getDb()` from `backend/src/config/db.js` to get MySQL connection

### Migration Status

The application has been migrated from MongoDB/Mongoose to MySQL. These model files are kept for reference but can be safely removed in a future cleanup.

