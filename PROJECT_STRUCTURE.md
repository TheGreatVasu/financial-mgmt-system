# 📁 Financial Management System - Complete Project Structure

This document provides a clear, organized view of the entire project structure to help you understand the codebase.

---

## 🗂️ Root Directory Structure

```
financial-mgmt-system/
├── backend/              # Node.js/Express Backend Server
├── frontend/             # React/Vite Frontend Application
├── .gitignore           # Git ignore rules
├── README.md            # Main project documentation
├── PROJECT_SUMMARY.md    # Detailed project analysis
└── PROJECT_STRUCTURE.md  # This file - structure guide
```

---

## 🔧 Backend Structure (`/backend`)

### Core Application Files

```
backend/
├── src/
│   ├── server.js              # 🚀 ENTRY POINT - Starts the Express server
│   ├── app.js                 # Express app configuration & middleware setup
│   │
│   ├── config/                # Configuration files
│   │   ├── db.js              # MySQL database connection (Knex.js)
│   │   ├── env.js             # Environment variables loader
│   │   └── cloudConfig.js     # Cloud services configuration
│   │
│   ├── controllers/           # Request handlers (business logic entry points)
│   │   ├── authController.js           # Login, register, profile management
│   │   ├── customerController.js       # Customer CRUD operations
│   │   ├── invoiceController.js       # Invoice management
│   │   ├── paymentController.js       # Payment processing
│   │   ├── dashboardController.js      # Dashboard data aggregation
│   │   ├── reportController.js         # Financial reports generation
│   │   ├── poEntryController.js       # Purchase Order management
│   │   ├── momController.js           # Minutes of Meeting management
│   │   ├── actionItemsController.js   # Action items tracking
│   │   ├── googleSheetsController.js  # Google Sheets integration
│   │   ├── salesInvoiceDashboardController.js  # Sales invoice analytics
│   │   ├── salesInvoiceImportController.js      # Sales invoice import
│   │   ├── importController.js        # Excel import functionality
│   │   ├── notificationController.js  # System notifications
│   │   ├── sessionController.js       # User session management
│   │   ├── settingsController.js      # Application settings
│   │   ├── userController.js          # User management (admin)
│   │   ├── databaseController.js      # Database admin operations
│   │   ├── contactController.js        # Contact management
│   │   └── billingController.js       # Billing/subscription
│   │
│   ├── routes/                # API route definitions
│   │   ├── authRoutes.js              # /api/auth/*
│   │   ├── customerRoutes.js          # /api/customers/*
│   │   ├── invoiceRoutes.js           # /api/invoices/*
│   │   ├── paymentRoutes.js           # /api/payments/*
│   │   ├── dashboardRoutes.js        # /api/dashboard/*
│   │   ├── reportRoutes.js            # /api/reports/*
│   │   ├── poEntryRoutes.js           # /api/po-entry/*
│   │   ├── momRoutes.js               # /api/mom/*
│   │   ├── actionItemRoutes.js        # /api/action-items/*
│   │   ├── googleSheetsRoutes.js      # /api/google-sheets/*
│   │   ├── importRoutes.js            # /api/import/*
│   │   ├── notificationRoutes.js     # /api/notifications/*
│   │   ├── settingsRoutes.js          # /api/settings/*
│   │   └── userRoutes.js              # /api/users/*
│   │
│   ├── middlewares/           # Express middlewares
│   │   ├── authMiddleware.js          # JWT token verification
│   │   ├── errorHandler.js            # Centralized error handling
│   │   └── requestLogger.js            # Request logging (Winston)
│   │
│   ├── services/              # Business logic & external integrations
│   │   ├── repositories.js            # Database query layer (Knex)
│   │   ├── userRepo.js                # User-specific queries
│   │   ├── sessionRepo.js             # Session management queries
│   │   ├── actionItemsRepo.js         # Action items queries
│   │   ├── emailService.js            # Email sending (Nodemailer)
│   │   ├── whatsappService.js         # WhatsApp integration (placeholder)
│   │   ├── pdfService.js              # PDF generation
│   │   ├── excelService.js            # Excel file processing
│   │   ├── googleSheetsService.js     # Google Sheets API
│   │   ├── socketService.js           # Socket.io real-time communication
│   │   ├── realtimeService.js         # Real-time data streaming
│   │   ├── reminderService.js         # Payment reminders
│   │   ├── calendarService.js         # Calendar integration
│   │   └── aiService.js               # AI/ML services
│   │
│   ├── models/                # Legacy Mongoose models (NOT USED - can be removed)
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Invoice.js
│   │   ├── Payment.js
│   │   ├── PaymentMOM.js
│   │   ├── Report.js
│   │   └── AuditLog.js
│   │
│   └── utils/                 # Utility functions
│       ├── logger.js                  # Winston logger setup
│       ├── formatDate.js              # Date formatting helpers
│       ├── generateInvoiceNumber.js   # Invoice number generation
│       ├── calcPayments.js            # Payment calculations
│       └── portFinder.js              # Port management utilities
│
├── migrations/                # Database schema migrations (SQL)
│   ├── 202510150001_init_schema.sql
│   ├── 202510150002_add_missing_tables.sql
│   ├── 202510150003_add_phone_to_users.sql
│   ├── 202510150003_add_user_profile_fields.sql
│   ├── 202510150004_create_user_sessions.sql
│   ├── 202510150005_add_invoice_items.sql
│   ├── 202510150006_create_po_entries.sql
│   ├── 202510150007_fix_role_column.sql
│   ├── 202510150008_make_password_hash_nullable.sql
│   ├── 202510150009_fix_role_column_size.sql
│   ├── 202510150010_add_google_tokens.sql
│   ├── 202510160001_create_sales_invoice_master.js
│   ├── 202510160001_create_sales_invoice_master.sql
│   ├── 202510160002_create_user_dashboards.js
│   ├── 202510160003_fix_sales_invoice_created_by.js
│   └── 202510160003_fix_sales_invoice_created_by.sql
│
├── seeds/                     # Database seed data (initial data)
│   ├── 001_seed_core.sql
│   └── 002_seed_starter_data.sql
│
├── templates/                 # Excel templates
│   ├── Customer_PO_Entry_Template.xlsx
│   ├── import_format.xlsx
│   └── sample_import_file.xlsx
│
├── uploads/                   # User-uploaded files (avatars, etc.)
│   └── avatars/
│
├── logs/                      # Application logs (auto-generated, gitignored)
│   ├── combined.log          # All logs
│   └── error.log             # Error logs only
│
├── scripts/                   # Utility scripts
│   ├── create-import-template.js
│   └── create-po-entry-template.js
│
├── package.json               # Backend dependencies & scripts
├── package-lock.json          # Dependency lock file
├── knexfile.js                # Knex.js database configuration
├── nodemon.json               # Nodemon configuration (auto-restart)
├── setup-database.sh          # Database setup script
└── kill-port.sh               # Port cleanup script
```

---

## 🎨 Frontend Structure (`/frontend`)

### Core Application Files

```
frontend/
├── src/
│   ├── main.jsx               # 🚀 ENTRY POINT - React app initialization
│   ├── App.jsx                # Main app component with routing
│   │
│   ├── pages/                 # Page components (route-level components)
│   │   ├── index.jsx                 # Login page
│   │   ├── signup.jsx                # Registration page
│   │   ├── google-profile-completion.jsx  # Google OAuth profile setup
│   │   ├── loading.jsx                # Loading screen
│   │   ├── not-found.jsx              # 404 page
│   │   │
│   │   ├── dashboard.jsx              # Main dashboard
│   │   ├── dashboard/
│   │   │   ├── new-po.jsx            # New PO entry
│   │   │   ├── boq-entry.jsx         # BOQ entry
│   │   │   ├── boq-actual.jsx        # BOQ actuals
│   │   │   ├── inv-items.jsx         # Invoice items
│   │   │   ├── payment-summary.jsx   # Payment summary
│   │   │   ├── monthly-plan.jsx      # Monthly planning
│   │   │   ├── debtors-summary.jsx   # Debtors summary
│   │   │   ├── performance.jsx       # Performance metrics
│   │   │   └── others.jsx            # Other dashboard views
│   │   │
│   │   ├── customers/
│   │   │   ├── index.jsx             # Customer list
│   │   │   ├── new.jsx               # Create customer
│   │   │   ├── [id].jsx              # Customer detail page
│   │   │   └── po-entry.jsx          # Customer PO entry
│   │   │
│   │   ├── invoices/
│   │   │   ├── index.jsx             # Invoice list
│   │   │   └── [id].jsx              # Invoice detail
│   │   │
│   │   ├── admin/
│   │   │   ├── database.jsx          # Database management (admin)
│   │   │   └── users.jsx             # User management (admin)
│   │   │
│   │   ├── payments.jsx               # Payment management
│   │   ├── reports.jsx               # Financial reports
│   │   ├── po-entry/
│   │   │   └── index.jsx             # PO entry listing
│   │   ├── po-listing.jsx            # PO listing
│   │   ├── boq-details.jsx           # BOQ details
│   │   ├── contact.jsx               # Contact page
│   │   ├── contact-dashboard.jsx    # Contact dashboard
│   │   ├── alerts.jsx               # System alerts
│   │   ├── settings.jsx              # Application settings
│   │   ├── profile.jsx               # User profile
│   │   ├── subscription.jsx         # Billing/subscription
│   │   ├── excel.jsx                # Excel import/export
│   │   ├── sheet-history.jsx        # Google Sheets history
│   │   ├── home.jsx                 # Home page (marketing)
│   │   ├── features.jsx             # Features page (marketing)
│   │   └── pricing.jsx               # Pricing page (marketing)
│   │
│   ├── components/            # Reusable UI components
│   │   ├── layout/                   # Layout components
│   │   │   ├── AppLayout.jsx         # Main app layout wrapper
│   │   │   ├── DashboardLayout.jsx   # Dashboard-specific layout
│   │   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   │   ├── Navbar.jsx            # Top navigation bar
│   │   │   ├── DashboardHeader.jsx   # Dashboard header
│   │   │   └── Footer.jsx            # Footer component
│   │   │
│   │   ├── forms/                    # Form components
│   │   │   ├── LoginForm.jsx         # Login form
│   │   │   ├── CustomerForm.jsx      # Customer create/edit form
│   │   │   └── InvoiceForm.jsx      # Invoice create/edit form
│   │   │
│   │   ├── charts/                   # Chart components (Recharts)
│   │   │   ├── AgingAnalysisChart.jsx
│   │   │   ├── SalesTrendChart.jsx
│   │   │   ├── RegionalBreakupChart.jsx
│   │   │   ├── RegionZoneChart.jsx
│   │   │   ├── CustomerContributionChart.jsx
│   │   │   ├── CashInflowComparisonChart.jsx
│   │   │   ├── BusinessUnitChart.jsx
│   │   │   ├── TaxBreakupChart.jsx
│   │   │   ├── DeductionComparisonChart.jsx
│   │   │   ├── MonthlyInvoiceTrendChart.jsx
│   │   │   ├── PremiumGeoRevenueSection.jsx
│   │   │   ├── TopCustomersTable.jsx
│   │   │   └── AdvancedRevenueCharts.jsx
│   │   │
│   │   ├── tables/                   # Table components
│   │   │   └── SalesInvoiceMasterTable.jsx
│   │   │
│   │   ├── ui/                       # Generic UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── LineChart.jsx
│   │   │   ├── PieChart.jsx
│   │   │   ├── ImportModal.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   │
│   │   ├── invoices/                 # Invoice-specific components
│   │   │   └── InvoiceForm.jsx
│   │   │
│   │   ├── excel/                    # Excel-related components
│   │   │   ├── ExcelViewer.jsx
│   │   │   ├── ExcelSheet.jsx
│   │   │   └── AgSheet.jsx
│   │   │
│   │   ├── filters/                  # Filter components
│   │   │   └── SalesInvoiceFilterPanel.jsx
│   │   │
│   │   ├── dashboard/                # Dashboard-specific components
│   │   │   └── UploadQueueButton.jsx
│   │   │
│   │   ├── onboarding/               # Onboarding components
│   │   │   └── ExcelImportOnboarding.jsx
│   │   │
│   │   ├── sections/                 # Section components
│   │   │   └── ProductVideo.jsx
│   │   │
│   │   ├── tour/                      # Tour/guide components
│   │   │   └── TourProvider.jsx
│   │   │
│   │   └── tailadmin/                # TailAdmin theme components
│   │       ├── TailAdminDashboard.jsx
│   │       ├── SalesInvoiceDashboard.jsx
│   │       └── ecommerce/
│   │           ├── EcommerceMetrics.jsx
│   │           ├── StatisticsChart.jsx
│   │           ├── MonthlySalesChart.jsx
│   │           ├── RecentOrders.jsx
│   │           └── DemographicCard.jsx
│   │
│   ├── context/               # React Context providers (global state)
│   │   ├── AuthContext.jsx           # Authentication state
│   │   ├── CustomerContext.js       # Customer data state
│   │   ├── ImportContext.jsx        # Import operation state
│   │   └── ThemeContext.js           # Theme/dark mode state
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.js                # Authentication hook
│   │   ├── useCustomer.js            # Customer data hook
│   │   ├── useInvoice.js             # Invoice operations hook
│   │   ├── useRealtimeDashboard.js   # Real-time dashboard updates
│   │   └── useRealtimeSubscription.js # Real-time subscription hook
│   │
│   ├── services/              # API service layer (HTTP requests)
│   │   ├── apiClient.js              # Axios instance with interceptors
│   │   ├── authService.js            # Authentication API calls
│   │   ├── customerService.js        # Customer API calls
│   │   ├── invoiceService.js         # Invoice API calls
│   │   ├── paymentService.js         # Payment API calls
│   │   ├── dashboardService.js       # Dashboard API calls
│   │   ├── reportService.js          # Reports API calls
│   │   ├── salesInvoiceService.js    # Sales invoice API calls
│   │   ├── importService.js          # Import API calls
│   │   ├── momService.js              # MOM API calls
│   │   ├── sessionService.js         # Session API calls
│   │   ├── settingsService.js        # Settings API calls
│   │   ├── subscriptionService.js    # Subscription API calls
│   │   ├── databaseService.js        # Database admin API calls
│   │   ├── alertsService.js          # Alerts API calls
│   │   ├── publicService.js          # Public API calls
│   │   └── socketService.js          # Socket.io client
│   │
│   ├── styles/                # Stylesheets
│   │   ├── globals.css               # Global CSS styles
│   │   └── dashboard.module.css      # Dashboard module styles
│   │
│   └── utils/                 # Utility functions
│       ├── formatCurrency.js         # Currency formatting
│       ├── formatDate.js             # Date formatting
│       └── validators.js             # Form validation helpers
│
├── public/                    # Static assets
│   ├── favicon.ico
│   ├── logo.png
│   ├── icons.svg
│   ├── feature-analytics.svg
│   ├── feature-automation.svg
│   ├── product-hero.svg
│   └── sample-files/
│       ├── import-template.xlsx
│       └── Sales_Invoice_Import_Format.xlsx
│
├── index.html                 # HTML entry point
├── package.json               # Frontend dependencies & scripts
├── package-lock.json          # Dependency lock file
├── vite.config.js             # Vite build configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── vercel.json                # Vercel deployment configuration
```

---

## 🔄 Data Flow Architecture

### Request Flow (Frontend → Backend)

```
1. User Action (Frontend)
   ↓
2. Service Layer (services/*.js)
   - Makes HTTP request via apiClient.js
   - Handles authentication tokens
   ↓
3. API Route (routes/*.js)
   - Defines endpoint URL
   - Applies middlewares (auth, validation)
   ↓
4. Controller (controllers/*.js)
   - Validates request data
   - Calls service layer for business logic
   - Returns response
   ↓
5. Service/Repository (services/*.js)
   - Business logic implementation
   - Database queries via repositories.js
   ↓
6. Database (MySQL via Knex.js)
   - Executes SQL queries
   - Returns data
   ↓
7. Response flows back through layers
   ↓
8. Frontend updates UI
```

### Example: Creating a Customer

```
User fills form → CustomerForm.jsx
  ↓
Submits → customerService.js.createCustomer()
  ↓
HTTP POST → /api/customers
  ↓
customerRoutes.js → authMiddleware → customerController.js.createCustomer()
  ↓
Validates data → repositories.js.createCustomer()
  ↓
MySQL INSERT → customers table
  ↓
Returns customer data → Frontend updates customer list
```

---

## 🗄️ Database Schema Overview

### Core Tables

1. **users** - User accounts and authentication
2. **customers** - Customer master data
3. **invoices** - Invoice records
4. **payments** - Payment transactions
5. **payment_moms** - Minutes of Meeting for payments
6. **action_items** - Action items from MOMs
7. **po_entries** - Purchase Order entries
8. **alerts** - System alerts/notifications
9. **audit_logs** - Audit trail
10. **user_sessions** - Active user sessions
11. **sales_invoice_master** - Sales invoice data
12. **user_dashboards** - User dashboard configurations

---

## 📝 Key Files to Understand

### Backend Entry Points
- `backend/src/server.js` - Server startup
- `backend/src/app.js` - Express app configuration
- `backend/src/routes/*.js` - All API endpoints

### Frontend Entry Points
- `frontend/src/main.jsx` - React app initialization
- `frontend/src/App.jsx` - Routing configuration
- `frontend/src/pages/*.jsx` - All page components

### Configuration
- `backend/src/config/db.js` - Database connection
- `backend/src/config/env.js` - Environment variables
- `frontend/vite.config.js` - Build configuration
- `frontend/tailwind.config.js` - Styling configuration

### Authentication Flow
- `backend/src/middlewares/authMiddleware.js` - JWT verification
- `frontend/src/context/AuthContext.jsx` - Auth state management
- `frontend/src/services/authService.js` - Login/register API calls

---

## 🚀 How to Navigate This Codebase

1. **Start with Entry Points**: `server.js` (backend) and `main.jsx` (frontend)
2. **Follow the Routes**: Check `App.jsx` for frontend routes, `routes/*.js` for backend API routes
3. **Understand Controllers**: Each route maps to a controller function
4. **Check Services**: Business logic is in the services layer
5. **Review Components**: Reusable UI components are in `components/`
6. **Database Schema**: Check `migrations/` folder for table structures

---

## 📌 Important Notes

- **Models folder is legacy**: The `backend/src/models/` folder contains Mongoose models that are NOT used. The system uses Knex.js directly via `repositories.js`.
- **Logs are auto-generated**: The `backend/logs/` folder is gitignored and contains runtime logs.
- **Uploads are user-generated**: The `backend/uploads/` folder contains user-uploaded files (avatars, etc.).
- **Environment variables**: Both backend and frontend use `.env` files (not in repo for security).

---

**Last Updated**: January 2025

