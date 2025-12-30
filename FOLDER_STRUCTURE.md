# Financial Management System - Folder Structure

```
financial-mgmt-system/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── env.js
│   │   │   └── cloudConfig.js
│   │   ├── controllers/          # 22 controller files
│   │   ├── routes/               # 19 route files
│   │   ├── services/             # 14 service files
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── requestLogger.js
│   │   └── utils/
│   ├── migrations/               # Database migration files
│   ├── seeds/                    # Database seed files
│   ├── scripts/                  # Utility scripts
│   ├── templates/                # Excel templates
│   ├── uploads/
│   │   └── avatars/
│   ├── logs/
│   ├── package.json
│   ├── knexfile.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── charts/           # Chart components
│   │   │   ├── dashboard/
│   │   │   ├── excel/            # Excel viewer components
│   │   │   ├── filters/
│   │   │   ├── forms/
│   │   │   ├── invoices/
│   │   │   ├── layout/
│   │   │   ├── master-data/
│   │   │   ├── onboarding/
│   │   │   ├── sections/
│   │   │   ├── tables/
│   │   │   ├── tour/
│   │   │   └── ui/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── customers/
│   │   │   ├── dashboard/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   └── po-entry/
│   │   ├── services/             # API service files
│   │   ├── context/              # React contexts
│   │   ├── hooks/                # Custom React hooks
│   │   ├── config/
│   │   ├── utils/
│   │   └── styles/
│   ├── public/
│   │   └── sample-files/
│   ├── dist/                     # Build output
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env
│
├── PRODUCTION_READINESS_REPORT.md
└── vercel.json
```

## Key Directories

### Backend
- **src/controllers/** - Request handlers for business logic
- **src/routes/** - API route definitions
- **src/services/** - Business logic and data access
- **migrations/** - Database schema changes
- **seeds/** - Initial database data

### Frontend
- **src/components/** - Reusable UI components
- **src/pages/** - Page-level components
- **src/services/** - API client services
- **src/context/** - React context providers
- **src/hooks/** - Custom React hooks

