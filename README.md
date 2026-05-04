# Accounting App

A small-business accounting application built with React + TypeScript (frontend), Express (backend), and PostgreSQL (database).

## Quick Start

### Prerequisites
- Node.js 16+
- Docker & Docker Compose
- Git

### Setup

1. **Clone and install dependencies:**
   ```bash
   # Frontend
   cd frontend && npm install

   # Backend
   cd ../backend && npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings (JWT_SECRET should be changed)
   ```

3. **Start PostgreSQL:**
   ```bash
   docker-compose up -d
   ```

4. **Run migrations:**
   - Connect to PostgreSQL and execute SQL files from `backend/migrations/` in order
   - Or use a migration runner tool

5. **Start the app (in separate terminals):**
   ```bash
   # Terminal 1 - Frontend
   cd frontend && npm run dev

   # Terminal 2 - Backend
   cd backend && npm run dev
   ```

Frontend will open at http://localhost:5173  
Backend API at http://localhost:5000

## Project Structure

```
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components
│   │   ├── lib/             # Utilities (api.ts, format.ts)
│   │   ├── context/         # Auth context & state
│   │   └── App.tsx
│   └── package.json
│
├── backend/                  # Express + TypeScript
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, error handling
│   │   ├── db.ts            # Database connection
│   │   └── server.ts        # Express setup
│   ├── migrations/          # Database SQL migrations
│   └── package.json
│
├── docker-compose.yml       # PostgreSQL service
└── .env.example             # Environment template
```

## Feature Prompts

Work through each feature by following the prompt files in order:

1. **01-auth.md** - Authentication (signup/login/logout)
2. **02-customers.md** - Customer management
3. **03-transactions.md** - Transactions with filtering
4. **04-invoices.md** - Invoice management
5. **05-stretch.md** - Dashboard, PDF export, AI features
6. **06-ui-polish.md** - Design system & UI refinement

See [00-overview.md](00-overview.md) for full documentation.

## Development

### Build
```bash
cd frontend && npm run build
cd ../backend && npm run build
```

### Type Check
```bash
cd frontend && npm run type-check
cd ../backend && npm run type-check
```

## Database

PostgreSQL running in Docker at `localhost:5432`

**Connection string:** `postgresql://postgres:postgres@localhost:5432/accounting_db`

Migrations are SQL files in `/backend/migrations/` applied in numeric order.
