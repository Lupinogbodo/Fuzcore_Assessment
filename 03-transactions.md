# Prompt 03 — Transactions
**Commit after this:** `feat: transactions with type/category filter`

---

## What to Build
Transaction log with income/expense types, categories, and client-side + server-side filtering.

---

## Backend Tasks

### 1. DB Migration
```sql
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Seed Default Categories
After migration, insert these defaults for each new user (do it at signup time in the auth route):
```
Income: Sales, Freelance, Investment, Other Income
Expense: Rent, Utilities, Salaries, Marketing, Software, Travel, Other Expense
```
Or seed them as global (user_id nullable) if you prefer a shared pool — either is fine.

### 3. API Routes — all protected

**Categories**
- `GET /api/categories?type=income|expense` — list categories (filter by type if query param given).

**Transactions**
- `GET /api/transactions?type=income|expense&category_id=uuid&from=date&to=date` — list, all filters optional, ordered by `date DESC`.
- `POST /api/transactions` — create. Body: `{ amount, type, category_id?, description?, date }`.
- `DELETE /api/transactions/:id` — delete (ownership check).

---

## Frontend Tasks

### Page: `/transactions`

**Filter Bar** (above the list)
- Dropdown: All Types / Income / Expense
- Dropdown: All Categories (populated from `GET /api/categories`)
- These filters hit the API with query params (not just client-side filtering).

**Transaction List**
Columns: Date | Description | Category | Type | Amount

- Amount styled green for income, red for expense.
- "Add Transaction" button → modal form.

**Add Transaction Form**
- Amount (number, required)
- Type (select: income / expense — changing this reloads category options)
- Category (select, populated by type)
- Description (text)
- Date (date picker, defaults to today)

### Running Totals (optional but nice)
Show a summary bar above the list: **Total Income | Total Expenses | Net**. Calculate from the current filtered results.

---

## Acceptance Criteria
- [ ] Transaction list loads with date, description, category, type, amount.
- [ ] Filter by type updates the list.
- [ ] Filter by category updates the list.
- [ ] Can add a transaction — appears at top of list.
- [ ] Can delete a transaction — removed from list.
- [ ] Income amounts shown in green, expenses in red.
