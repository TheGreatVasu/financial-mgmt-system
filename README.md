# Financial Management System

A full-stack web application for managing customers, invoices, payments, and financial reports. Features authentication, notifications (email/WhatsApp), PDF/Excel export, and a modern React frontend with Node.js/Express backend.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Customer Management**: Complete CRUD operations with profile management
- **Invoice Management**: Create, edit, track invoices with status management
- **Payment Processing**: Record payments, reconcile with invoices
- **Financial Reports**: Receivables summaries and aging analysis
- **Dashboard**: Real-time KPIs and analytics
- **Notifications**: Email and WhatsApp integration (configured)
- **Export**: PDF and Excel export capabilities
- **Responsive UI**: Modern design that works on desktop and mobile

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (>=16.0.0)
- **Framework**: Express.js 4.18.2
- **Database**: MySQL 2 (via Knex.js 3.1.0) - **Primary Database**
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Validation**: express-validator 7.0.1
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston 3.10.0
- **Utilities**: bcryptjs, moment, nodemailer, pdfkit, exceljs, socket.io

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 4.5.0
- **Styling**: Tailwind CSS 3.3.5
- **Routing**: React Router DOM 6.20.1
- **HTTP Client**: Axios 1.6.2
- **Forms**: React Hook Form 7.48.2
- **Charts**: Recharts 2.8.0
- **UI Components**: Lucide React, Framer Motion, React Hot Toast

---

## 📁 Project Structure

```
financial-mgmt-system/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app configuration
│   │   ├── server.js           # Server entry point
│   │   ├── config/            # Configuration files
│   │   │   ├── db.js          # MySQL/Knex connection
│   │   │   ├── env.js         # Environment variables
│   │   │   └── cloudConfig.js # Cloud services config
│   │   ├── controllers/        # Request handlers (15 files)
│   │   ├── middlewares/       # Express middlewares
│   │   ├── models/            # Legacy Mongoose models (not used)
│   │   ├── routes/            # API route definitions (14 files)
│   │   ├── services/          # Business logic/services
│   │   └── utils/             # Utility functions
│   ├── migrations/            # Database migrations
│   ├── seeds/                 # Seed data
│   ├── tests/                 # Test files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── styles/            # Global styles
│   │   └── utils/             # Utility functions
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MySQL** 5.7+ or 8.0+ ([Download](https://dev.mysql.com/downloads/mysql/))
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd financial-mgmt-system
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up database** (see [Database Setup](#database-setup) section below)

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:3001`
   - Backend API: `http://localhost:5001`
   - Default login: `admin@financialsystem.com` / `admin123`

---

## 🗄 Database Setup

### Step 1: Install MySQL

**Windows:**
- Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
- Run installer and set root password

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get install mysql-server
sudo service mysql start
```

### Step 2: Create Database

```bash
mysql -u root -p -e "CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 3: Create Environment File

Create `backend/.env` file:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=financial_mgmt_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
FRONTEND_URL=http://localhost:3001

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**⚠️ Important:** Replace `your_mysql_password_here` with your actual MySQL root password!

### Step 4: Run Database Setup

```bash
cd backend
npm run db:setup
```

This command runs both migrations (creates tables) and seeds (adds sample data).

**Or run separately:**
```bash
npm run db:migrate  # Create tables
npm run db:seed    # Add sample data
```

### Step 5: Verify Setup

```bash
# Check tables exist
mysql -u root -p financial_mgmt_db -e "SHOW TABLES;"

# Check users exist
mysql -u root -p financial_mgmt_db -e "SELECT email, role FROM users;"
```

---

## 💻 Development

### Backend Scripts

```bash
cd backend

npm run dev        # Start development server (nodemon)
npm start          # Start production server
npm test           # Run tests
npm run db:migrate # Run database migrations
npm run db:seed    # Run database seeds
npm run db:setup   # Run migrations + seeds
```

### Frontend Scripts

```bash
cd frontend

npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Environment Variables

**Backend (`backend/.env`):**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MYSQL_HOST` | Yes | `localhost` | MySQL host |
| `MYSQL_PORT` | No | `3306` | MySQL port |
| `MYSQL_USER` | Yes | `root` | MySQL username |
| `MYSQL_PASSWORD` | Yes | - | MySQL password |
| `MYSQL_DATABASE` | Yes | `financial_mgmt_db` | Database name |
| `JWT_SECRET` | Yes | - | Secret for JWT tokens |
| `JWT_EXPIRE` | No | `7d` | JWT expiration |
| `PORT` | No | `5001` | Backend server port |
| `NODE_ENV` | No | `development` | Environment |
| `CORS_ORIGIN` | No | `http://localhost:3001` | Allowed CORS origin |
| `FRONTEND_URL` | No | `http://localhost:3001` | Frontend URL |

**Frontend (`frontend/.env`):**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `/api` | Backend API URL |

---

## 📡 API Documentation

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)
- `POST /api/auth/logout` - Logout (protected)

### Customers

- `GET /api/customers` - List customers (paginated, searchable)
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer (protected)
- `PUT /api/customers/:id` - Update customer (protected)
- `DELETE /api/customers/:id` - Delete customer (protected)

### Invoices

- `GET /api/invoices` - List invoices (filterable by status, customer, date range)
- `GET /api/invoices/:id` - Get invoice details
- `POST /api/invoices` - Create invoice (protected)
- `PUT /api/invoices/:id` - Update invoice (protected)
- `DELETE /api/invoices/:id` - Delete invoice (protected)

### Payments

- `GET /api/payments` - List payments (filterable)
- `POST /api/payments` - Create payment (protected, updates invoice paid_amount)

### Dashboard

- `GET /api/dashboard` - Get dashboard KPIs and data
- `GET /api/dashboard/stream` - SSE stream for real-time updates

### Reports

- `GET /api/reports` - Generate financial reports

### Health Check

- `GET /health` - API health status

**Note:** Most routes require JWT authentication. Include token in header: `Authorization: Bearer <token>`

### Example API Usage

```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@financialsystem.com","password":"admin123"}'

# Get customers (with token)
curl http://localhost:5001/api/customers \
  -H 'Authorization: Bearer <JWT_TOKEN>'
```

---

## 🏗 Architecture

### Database Architecture

The system uses **MySQL via Knex.js** as the primary database. Legacy Mongoose models exist but are not used.

**Database Tables:**
1. `users` - User authentication and profiles
2. `customers` - Customer management
3. `invoices` - Invoice records
4. `payments` - Payment transactions
5. `alerts` - System alerts/notifications
6. `payment_moms` - Minutes of Meeting for payments
7. `action_items` - Action items from MOMs
8. `audit_logs` - Audit trail

### Backend Architecture

**Layers:**
- **Routes** → Define API endpoints
- **Controllers** → Handle requests and responses
- **Services** → Business logic and data access
- **Models** → Legacy Mongoose models (not used)
- **Middlewares** → Authentication, error handling, logging

**Key Components:**
- `authMiddleware` - JWT verification
- `errorHandler` - Centralized error handling
- `requestLogger` - Request logging (Winston)
- Rate limiting - 100 requests/15 min per IP

### Frontend Architecture

**Structure:**
- **Pages** → Route components
- **Components** → Reusable UI components
- **Context** → Global state (Auth, Theme)
- **Hooks** → Custom React hooks
- **Services** → API client layer

**Key Features:**
- Protected routes via `ProtectedRoute` component
- Token stored in localStorage
- Auto-refresh on app load
- Responsive design with Tailwind CSS

---

## 🚀 Deployment

### Prerequisites

- Node.js 18+ installed on server
- MySQL database (local or remote)
- Domain name (optional, for production)

### Deployment Steps

1. **Clone repository on server**
   ```bash
   git clone <repository-url>
   cd financial-mgmt-system
   ```

2. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Set up database**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE financial_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   
   # Run migrations
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

4. **Create production `.env` file**
   ```env
   MYSQL_HOST=your-production-db-host
   MYSQL_PORT=3306
   MYSQL_USER=production_user
   MYSQL_PASSWORD=strong_password
   MYSQL_DATABASE=financial_mgmt_db
   JWT_SECRET=very-strong-random-secret-key
   JWT_EXPIRE=7d
   PORT=5001
   NODE_ENV=production
   CORS_ORIGIN=https://yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```

5. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

6. **Start backend (using PM2)**
   ```bash
   npm install -g pm2
   cd backend
   pm2 start src/server.js --name backend
   ```

7. **Serve frontend** (using Nginx)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Frontend
       location / {
           root /path/to/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Deployment Options

**Option 1: Traditional VPS**
- Use PM2 for process management
- Nginx as reverse proxy
- MySQL on same server or remote

**Option 2: Cloud Platforms**
- **Heroku**: Use ClearDB addon for MySQL
- **Railway**: Automatic MySQL setup
- **Render**: PostgreSQL option available

**Option 3: Docker**
- Use `docker-compose.yml` for containerized deployment
- Includes MySQL, backend, and frontend services

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (generate with `openssl rand -base64 32`)
- [ ] Use strong MySQL passwords
- [ ] Enable SSL/TLS for database connections
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable firewall (only allow necessary ports)
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Use HTTPS for frontend

---

## 🔧 Troubleshooting

### Common Issues

**"Cannot connect to MySQL"**
- Check MySQL service is running: `sudo service mysql status`
- Verify credentials in `.env` file
- Check firewall rules

**"Access denied for user"**
- Verify `MYSQL_USER` and `MYSQL_PASSWORD` in `.env`
- Check MySQL user has proper permissions

**"Unknown database"**
- Create database: `mysql -u root -p -e "CREATE DATABASE financial_mgmt_db;"`
- Run migrations: `npm run db:migrate`

**"Table already exists"**
- Migrations already ran - this is OK
- To reset: `knex migrate:rollback --all` (⚠️ deletes data)

**"Port already in use"**
- Change `PORT` in `.env` to different port (e.g., `5002`)
- Or kill process using port: `lsof -ti :5001 | xargs kill`

**"Invalid token"**
- Token may have expired (default: 7 days)
- Log in again to get new token
- Verify `JWT_SECRET` matches between servers

**"CORS error"**
- Check `CORS_ORIGIN` in `.env` matches frontend URL
- Ensure backend allows frontend origin

**"Module not found"**
- Run `npm install` in both `backend/` and `frontend/` folders
- Delete `node_modules` and reinstall if needed

### Database Backup

**Manual backup:**
```bash
mysqldump -u root -p financial_mgmt_db > backup_$(date +%Y%m%d).sql
```

**Restore:**
```bash
mysql -u root -p financial_mgmt_db < backup_20250115.sql
```

---

## 📊 Database Schema

### Core Tables

**users**
- `id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `is_active`, `last_login`, `phone_number`, `avatar_url`, `preferences`

**customers**
- `id`, `customer_code`, `company_name`, `contact_email`, `contact_phone`, `status`, `created_by`

**invoices**
- `id`, `invoice_number`, `customer_id`, `issue_date`, `due_date`, `subtotal`, `tax_rate`, `tax_amount`, `total_amount`, `paid_amount`, `status`, `items` (JSON)

**payments**
- `id`, `payment_code`, `invoice_id`, `customer_id`, `amount`, `payment_date`, `method`, `reference`, `status`, `processed_by`

**alerts**
- `id`, `type`, `message`, `read_flag`, `created_at`

**payment_moms**
- `id`, `mom_id`, `meeting_title`, `meeting_date`, `participants`, `agenda`, `discussion_notes`, `agreed_payment_terms`, `customer_id`, `linked_invoice_id`, `payment_amount`, `due_date`, `status`

**action_items**
- `id`, `action_id`, `title`, `owner_name`, `owner_email`, `due_date`, `status`, `notes`

**audit_logs**
- `id`, `action`, `entity`, `entity_id`, `performed_by`, `ip_address`, `user_agent`, `changes` (JSON), `created_at`

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run specific test file
npm test -- auth.test.js
```

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License

---

## 🙏 Acknowledgements

Built with Express, React, Vite, Tailwind CSS, MySQL, Knex.js, Winston, and more.

---

## 📞 Support

For issues and questions:
- Check [Troubleshooting](#troubleshooting) section
- Review error logs in `backend/logs/`
- Check database connection: `mysql -u root -p -e "SELECT 1;"`

---

**Last Updated:** January 2025
