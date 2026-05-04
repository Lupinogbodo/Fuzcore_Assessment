# Accounting App — Copilot Prompt Guide

## Project Summary
A small-business accounting app built with **React + TypeScript** (frontend), **Express** (backend), and **PostgreSQL** (via Docker). Users manage customers, transactions, and invoices.

## Stack
- Frontend: React, TypeScript, Vite
- Backend: Express, TypeScript
- DB: PostgreSQL (Docker)
- Auth: JWT (stored in httpOnly cookies or localStorage)
- Styling: Tailwind CSS (or whatever the repo already uses)

## Prerequisites
- **Node.js** 16+ (with npm/yarn)
- **Docker** & **Docker Compose** (for PostgreSQL)
- **Git**
- Text editor (VS Code recommended)

## Project Setup

### 1. Initialize Project Structure
```
accounting-app/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components
│   │   ├── lib/             # Utilities (api.ts, format.ts, etc.)
│   │   ├── context/         # Auth context, other state
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                  # Express + TypeScript
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── db.ts            # Database connection
│   │   └── server.ts        # Express setup
│   ├── migrations/          # SQL migration files (001_init.sql, etc.)
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml       # PostgreSQL service
├── .env                      # Environment variables (git-ignored)
└── .env.example              # Template for .env
```

### 2. Environment Variables
Create `.env` in project root:
```
# Backend
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/accounting_db
JWT_SECRET=your_long_random_secret_here_minimum_32_chars

# Frontend (Vite)
VITE_API_URL=http://localhost:5000

# Optional (for stretch features)
GEMINI_API_KEY=your_api_key_here
OPENAI_API_KEY=your_api_key_here
```

### 3. Install Dependencies
```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

**Key packages to install (backend):**
- `express`, `typescript`, `bcrypt`, `jsonwebtoken`, `pg` (PostgreSQL client), `dotenv`, `cors`

**Key packages to install (frontend):**
- `react`, `react-router-dom`, `axios` or `fetch`, context/Zustand for state

### 4. Start PostgreSQL & Run Migrations
```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Run migrations (manually execute SQL files from /backend/migrations in order)
# Or create a migration runner script
```

---

## Prompt Files & Commit Map

| File | Feature | Suggested Commit Message |
|------|---------|--------------------------|
| `01-auth.md` | Sign up, log in, log out | `feat: add authentication (signup/login/logout)` |
| `02-customers.md` | Customer CRUD | `feat: customer list, add, edit, delete` |
| `03-transactions.md` | Transactions + filters | `feat: transactions with type/category filter` |
| `04-invoices.md` | Invoice create/view/status | `feat: invoices with line items and status lifecycle` |
| `05-stretch.md` | Dashboard, PDF, AI categorisation | `feat: dashboard, PDF export, AI categorisation` |
| `06-ui-polish.md` | Design system & UI refinement | `feat: ui polish — design system, layout, and visual refinement` |

---

## Development Workflow

### Running the App Locally

**Terminal 1 — Frontend (Vite dev server):**
```bash
cd frontend
npm run dev
# Opens http://localhost:5173
```

**Terminal 2 — Backend (Express server):**
```bash
cd backend
npm run dev  # or ts-node src/server.ts
# Runs on http://localhost:5000
```

**Terminal 3 — Database:**
```bash
docker-compose up
# PostgreSQL available at localhost:5432
```

---

## API Response Format

All endpoints (except `/api/auth/*`) must be protected by auth middleware.

**Success:**
```json
{
  "data": { /* actual payload */ },
  "error": null
}
```

**Error:**
```json
{
  "data": null,
  "error": "Human-readable error message"
}
```

**Status Codes:**
- `200` — Success
- `201` — Created
- `400` — Bad request (validation error)
- `401` — Unauthorized (missing/bad token)
- `403` — Forbidden (ownership check failed)
- `404` — Not found
- `500` — Server error

---

## Database Migrations Strategy

1. Create numbered SQL files in `/backend/migrations/` (e.g., `001_create_users.sql`, `002_create_customers.sql`)
2. Run migrations in order at startup OR manually execute via PostgreSQL client
3. Keep migrations append-only — never modify existing migrations
4. Each prompt file indicates required migrations in its "DB Migration" section

## How to Use These Files
1. Open the relevant `.md` file in your editor.
2. Copy the **entire file** as your copilot prompt (GitHub Copilot Chat, Cursor, or Claude).
3. Let the AI generate code, review it, tweak where needed.
4. Commit once the feature works end-to-end.
5. Move to the next file.

## General Rules for the AI
- Always keep existing code structure intact unless explicitly told to refactor.
- Add DB migrations as plain SQL files in `/migrations` or inline in the prompt where noted.
- All API routes must be protected by auth middleware (except `/auth/*`).
- Return consistent JSON: `{ data: ..., error: null }` on success, `{ data: null, error: "..." }` on failure.
- Frontend should show loading states and basic error messages.
