# Prompt 02 — Customers
**Commit after this:** `feat: customer list, add, edit, delete`

---

## What to Build
Full CRUD for customers. Each customer belongs to the logged-in user.

---

## Backend Tasks

### 1. DB Migration
```sql
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. API Routes (`/api/customers`) — all protected
- `GET /api/customers` — list all customers for `req.user.id`, ordered by `name ASC`.
- `POST /api/customers` — create customer. Body: `{ name, email?, phone?, address? }`.
- `PUT /api/customers/:id` — update. Only allow if customer's `user_id` matches `req.user.id`.
- `DELETE /api/customers/:id` — delete. Same ownership check.

All responses use `{ data: ..., error: null }` / `{ data: null, error: "..." }` shape.

---

## Frontend Tasks

### Page: `/customers`
- Table/list showing: Name, Email, Phone, Actions (Edit, Delete).
- "Add Customer" button → opens a modal or slide-over form.
- Edit button → opens same form pre-filled.
- Delete button → confirm dialog, then delete and refresh list.

### Form Fields
- Name (required)
- Email
- Phone
- Address (textarea)

### UX Details
- Show a loading skeleton while fetching.
- Show inline error if save fails.
- After save/delete, refetch the list (or update local state optimistically).

### API calls (using `src/lib/api.ts`)
```ts
getCustomers()           // GET /api/customers
createCustomer(data)     // POST /api/customers
updateCustomer(id, data) // PUT /api/customers/:id
deleteCustomer(id)       // DELETE /api/customers/:id
```

---

## Acceptance Criteria
- [ ] Customer list loads on page visit.
- [ ] Can add a new customer — appears in list immediately.
- [ ] Can edit a customer — changes reflected in list.
- [ ] Can delete a customer — removed from list.
- [ ] Cannot access another user's customers (backend ownership check).
