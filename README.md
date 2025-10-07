## Financial Management System

A full‑stack web application for managing customers, invoices, payments, and financial reports. It includes authentication, notifications (email/WhatsApp), and export to PDF/Excel, with a modern React frontend and a Node.js/Express backend.

### Features
- Authentication and role‑based authorization
- Customer CRUD and profile management
- Invoice creation, editing, and status tracking
- Payment recording and reconciliation
- Reports for receivables and summaries
- Email and WhatsApp notifications
- PDF and Excel export
- Responsive UI (desktop and mobile)

### Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Winston, Nodemailer
- Frontend: React (Vite), Tailwind CSS, React Router, Axios

### Monorepo Structure
```text
financial-mgmt-system/
  backend/
    src/
      app.js
      server.js
      config/
      controllers/
      middlewares/
      models/
      routes/
      services/
      utils/
    tests/
    logs/
    package.json
  frontend/
    src/
      components/
      context/
      hooks/
      pages/
      services/
      styles/
      utils/
    public/
    package.json
  README.md
```

### Prerequisites
- Node.js 18+
- npm
- MongoDB (local or Atlas)

### Setup
1) Install dependencies
```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

2) Create backend environment file `backend/.env`
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/financial-mgmt
JWT_SECRET=change_me
JWT_EXPIRE=7d
# Email (SMTP)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_user
EMAIL_PASS=your_password
# Frontend / CORS
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Running Locally
Run backend and frontend in two terminals:
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```
Defaults: backend `http://localhost:5000`, frontend dev `http://localhost:3000`.
The frontend dev server proxies `/api/*` requests to `http://localhost:5000`.

### Scripts
Backend (`/backend`):
- `npm run dev` – start in dev mode (nodemon)
- `npm start` – start in production mode
- `npm test` – run Jest tests

Frontend (`/frontend`):
- `npm run dev` – start Vite dev server
- `npm run build` – create production build
- `npm run preview` – preview production build
- `npm run lint` – run ESLint

### API (examples)
- Health: GET `/health`
- Auth: POST `/api/auth/login`
- Customers: GET `/api/customers`, POST `/api/customers`, GET `/api/customers/:id`
- Invoices: GET `/api/invoices`, POST `/api/invoices`, GET `/api/invoices/:id`
- Payments: POST `/api/payments`
- Reports: GET `/api/reports`
- Notifications: under `/api/notifications`
- Contact: under `/api/contact`

Most routes require a JWT: `Authorization: Bearer <token>`.

### Testing
```bash
cd backend
npm test
```

### Contributing
1) Fork and create a feature branch
2) Commit with clear messages
3) Run tests and linters
4) Open a PR

### License
MIT

---

### Demo / Preview
- Frontend dev server: `http://localhost:3000`
- Example credentials: create via signup or seed your DB.

Screenshots or a short GIF can go here once available.

### Environment Variables
Configure these in `backend/.env`.

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Backend server port |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/financial-mgmt` | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret for signing JWTs |
| `JWT_EXPIRE` | No | `7d` | JWT expiration |
| `EMAIL_HOST` | Optional | `smtp.gmail.com` | SMTP host |
| `EMAIL_PORT` | Optional | `587` | SMTP port |
| `EMAIL_USER` | Optional | — | SMTP username |
| `EMAIL_PASS` | Optional | — | SMTP password |
| `FRONTEND_URL` | No | `http://localhost:3000` | Used in templates/CORS |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |

### Sample API Usage
Login and call an authenticated endpoint.

```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password"}'

# Example: list customers
curl -s http://localhost:5000/api/customers \
  -H 'Authorization: Bearer <JWT_TOKEN>'
```

Create a new customer:
```bash
curl -s -X POST http://localhost:5000/api/customers \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -d '{"name":"Acme Corp","email":"billing@acme.com"}'
```

### Deployment
Backend (Node):
```bash
cd backend
npm ci
npm start
```

Frontend (Vite build):
```bash
cd frontend
npm ci
npm run build
# serve ./dist with your HTTP server (e.g., Nginx, Node static, or Vercel)
```

Reverse proxy example (Nginx) is recommended to route `/api` to backend and serve frontend build.

### Troubleshooting
- MongoDB connection errors: verify `MONGODB_URI` and that MongoDB is reachable.
- JWT auth failures: ensure `JWT_SECRET` is set and token is sent as `Authorization: Bearer <token>`.
- 429 Too Many Requests: rate limit is 100 requests/15 min per IP on `/api/*`.
- CORS issues: confirm backend `CORS_ORIGIN` matches your frontend origin.
- Emails not sending: validate SMTP credentials and provider firewall rules.
- PDF/Excel export errors: check filesystem permissions and library versions.

### Roadmap
- Multi-currency support and exchange rates
- Recurring invoices and reminders
- Role management UI
- Advanced analytics dashboards
- Docker Compose for one‑command local setup

### FAQ
- Q: Can I use PostgreSQL instead of MongoDB?
  - A: Not currently; models use Mongoose. Contributions are welcome.
- Q: How do I change the default ports?
  - A: Update `PORT` in `backend/.env` and Vite dev server port via `vite.config.js` if desired.
- Q: Where do logs go?
  - A: Backend writes to `backend/logs/` via the Winston logger.

### Security Notes
- Never commit real secrets. Use `.env` locally and secret managers in production.
- Rotate `JWT_SECRET` and SMTP credentials periodically.
- Keep dependencies updated and run `npm audit` regularly.

### Acknowledgements
- Built with Express, React, Vite, Tailwind, Mongoose, Winston, and more.