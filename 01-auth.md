# Prompt 01 — Authentication
**Commit after this:** `feat: add authentication (signup/login/logout)`

---

## What to Build
Full auth flow: sign up, log in, log out. All non-auth routes must reject unauthenticated requests.

---

## Backend Tasks

### 1. DB Migration
Create a `users` table if it doesn't exist:
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Auth Routes (`/api/auth`)
- `POST /api/auth/signup` — accepts `{ name, email, password }`, hashes password with bcrypt (salt 10), inserts user, returns JWT.
- `POST /api/auth/login` — accepts `{ email, password }`, verifies password, returns JWT.
- `POST /api/auth/logout` — stateless, just returns `{ data: "ok" }` (client drops the token).
- `GET /api/auth/me` — protected, returns current user `{ id, name, email }`.

### 3. JWT Middleware
Create `middleware/auth.ts`:
- Reads `Authorization: Bearer <token>` header.
- Verifies with `jsonwebtoken`.
- Attaches `req.user = { id, email }` on success.
- Returns 401 on failure.
- Apply this middleware to all routes **except** `/api/auth/*`.

### 4. Environment Variables Needed
```
JWT_SECRET=some_long_random_string
```
Add to `.env` and `docker-compose.yml` if not present.

---

## Frontend Tasks

### Pages
- `/signup` — form with Name, Email, Password fields + submit button.
- `/login` — form with Email, Password + submit button. Link to signup.
- Redirect to `/` (dashboard or customers) on success.

### Auth State
- Store JWT in `localStorage` under key `token`.
- Create an `AuthContext` (or Zustand store) exposing `user`, `login()`, `logout()`, `isLoading`.
- On app load, call `GET /api/auth/me` with the stored token to rehydrate user state.
- `logout()` clears localStorage and redirects to `/login`.

### Route Guard
- Create a `<ProtectedRoute>` component that redirects to `/login` if no user is authenticated.
- Wrap all non-auth routes with it.

### API Helper
Create `src/lib/api.ts`:
- Base `fetch` wrapper that automatically attaches `Authorization: Bearer <token>` header.
- Throws or returns error string on non-2xx responses.

---

## Acceptance Criteria
- [ ] Can sign up with a new email → redirected to app.
- [ ] Can log in with existing credentials → redirected to app.
- [ ] Visiting a protected route while logged out → redirected to `/login`.
- [ ] `GET /api/auth/me` returns 401 with no/bad token.
- [ ] Logout clears session and redirects.
