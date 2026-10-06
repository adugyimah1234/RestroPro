# RESTROPro SaaS POS

Point‑of‑Sale (POS) system for restaurants, cafes, hotels, and food trucks.

**Tech stack**

- **Frontend**: React.js, Vite, Tailwind CSS, DaisyUI
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MySQL with Sequelize ORM
- **Deployment**: Docker / Cloud (e.g., AWS, DigitalOcean)

---

## 🚀 Features

- Multi‑tenant SaaS: Create and manage independent businesses
- User authentication: Admins, staff, and roles with JWT
- Real-time updates: Socket.IO for kitchen & order status syncing
- Menu & product management: Categories, items, pricing, modifiers
- Order processing: POS UI, kitchen display, invoice/bill printing, QR ordering
- Table management: Floor plans, table statuses, split‑check support
- Inventory tracking
- Reports & analytics: ApexCharts powered sales summaries, daily/weekly reports
- AI Assistant: Integrated Google Gemini AI for smart insights
- Settings: Tax, tips, payment methods (Cash, Card, Stripe, Paystack), receipts

---

## 🎞️ Getting Started

### Prerequisites

- Node.js ≥ 18
- MySQL ≥ 8
- Git
- (Optional) Docker

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/your‑org/restropro-pos.git
   cd restropro-pos
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in `backend/` using `backend/.env.example` as a template:

   ```env
   DATABASE_URL="mysql://root:yourpassword@localhost:3306/restropro_saas"
   JWT_SECRET="restro_jwt_secret"
   JWT_EXPIRY="15m"
   JWT_EXPIRY_REFRESH="30d"
   COOKIE_EXPIRY=900000
   COOKIE_EXPIRY_REFRESH=2592000000
   PASSWORD_SALT=10
   FRONTEND_DOMAIN="http://localhost:5173"
   FRONTEND_DOMAIN_COOKIE="localhost"
   PORT=4000
   ```

   Initialize database (migrations & seeders):

   ```bash
   npm run migrate
   npm run seed
   ```

   Start backend server:

   ```bash
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend
   npm install
   ```

   Create or update `.env` in `frontend/`:

   ```env
   VITE_BACKEND="http://localhost:4000/api/v1"
   VITE_BACKEND_SOCKET_IO="http://localhost:4000"
   VITE_BACKEND_IMAGES_BASE_URL="http://localhost:4000"
   VITE_FRONTEND_DOMAIN="http://localhost:5173"
   ```

   Start frontend development server:

   ```bash
   npm run dev
   ```

   Your app should now be accessible at `http://localhost:5173`.

---

## 🧰 Available Scripts

### Backend (Node.js / Express / Sequelize)

- `npm run dev`: Start development server with hot reload (`nodemon`)
- `npm start`: Start production server
- `npm run migrate`: Run Sequelize database migrations
- `npm run seed`: Run initial seeders

### Frontend (React.js / Vite / Tailwind)

- `npm run dev`: Launch Vite development server (`http://localhost:5173`)
- `npm run build`: Create optimized production build
- `npm run preview`: Preview production build locally

---

## ⚙️ Project Structure

```
.
├── backend
│   ├── src
│   │   ├── controllers/   # API logic
│   │   ├── models/        # Sequelize schema
│   │   ├── routes/        # Express routing
│   │   ├── middlewares/   # JWT auth, validation
│   │   ├── services/      # Business logic
│   │   ├── config/        # Environment & server settings
│   ├── migrations/        # Sequelize migrations
│   ├── seeders/           # Initial data seeders
│   └── index.js
└── frontend
    ├── src
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Application pages/views
    │   ├── styles/        # CSS & Tailwind styling
    │   ├── context/       # React Context
    │   ├── hooks/         # Custom React hooks
    │   ├── services/      # Axios API calls
    │   └── assets/        # Images, icons, static assets
    ├── public/
    ├── vite.config.js
    └── tailwind.config.js
```

---

## ⚙️ Key Environment Variables

### Backend (`backend/.env`)

 Name             | Description                                          | Default
 ---------------- | ---------------------------------------------------- | --------------------------------------------------------
 `DATABASE_URL`   | MySQL connection URL (`mysql://user:pass@host/db`)   | `mysql://root:root@localhost:3306/restropro_saas`
 `JWT_SECRET`     | JWT signing key                                      | *(set secret)*
 `FRONTEND_DOMAIN`| Frontend origin for CORS                             | `http://localhost:5173`
 `GEMINI_API_KEY` | Google Gemini AI Key                                 | *(optional)*
 `STRIPE_SECRET`  | Stripe secret key                                    | *(optional)*

### Frontend (`frontend/.env`)

 Name                         | Description                   | Default
 ---------------------------- | ----------------------------- | -----------------------------
 `VITE_BACKEND`               | API base URL                  | `http://localhost:4000/api/v1`
 `VITE_BACKEND_SOCKET_IO`     | Socket.IO server URL          | `http://localhost:4000`
 `VITE_BACKEND_IMAGES_BASE_URL`| Image uploads server base URL | `http://localhost:4000`

---

## 📝 License

Licensed under the **[insert license here]**.
