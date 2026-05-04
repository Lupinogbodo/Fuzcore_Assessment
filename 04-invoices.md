# Prompt 04 — Invoices
**Commit after this:** `feat: invoices with line items and status lifecycle`

---

## What to Build
Invoice creation tied to customers, with line items and a status lifecycle: `draft → sent → paid`.

---

## Backend Tasks

### 1. DB Migration
```sql
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Invoice Number Generation
Auto-generate `invoice_number` on create as `INV-{year}-{padded sequence}`, e.g. `INV-2025-0001`.
Sequence can be a simple count of existing invoices for that user + 1.

### 3. API Routes — all protected

- `GET /api/invoices?status=draft|sent|paid` — list invoices with customer name and total. Join `customers` and sum `invoice_items`.
- `GET /api/invoices/:id` — full invoice with customer details and all line items.
- `POST /api/invoices` — create invoice + line items in a transaction. Body:
  ```json
  {
    "customer_id": "uuid",
    "due_date": "2025-06-01",
    "notes": "optional",
    "items": [
      { "description": "Web design", "quantity": 1, "unit_price": 500 }
    ]
  }
  ```
- `PATCH /api/invoices/:id/status` — update status. Body: `{ status: "sent" | "paid" }`. Only allow forward transitions.
- `DELETE /api/invoices/:id` — only if status is `draft`.

**Computed total** = sum of `quantity * unit_price` across all items. Return it in list and detail responses.

---

## Frontend Tasks

### Page: `/invoices`
- List: Invoice # | Customer | Issue Date | Due Date | Total | Status | Actions
- Status shown as a badge (grey=draft, blue=sent, green=paid).
- Filter bar: dropdown for status.
- "New Invoice" button → `/invoices/new`.

### Page: `/invoices/new`
- Select Customer (dropdown from `GET /api/customers`).
- Due Date picker.
- Notes textarea.
- **Line Items** section:
  - Table with rows: Description | Qty | Unit Price | Line Total (computed)
  - "Add Item" button appends a new empty row.
  - Remove button on each row.
  - Running **Invoice Total** shown below the table.
- Save as Draft / Cancel buttons.

### Page: `/invoices/:id`
- Read-only view of full invoice details + line items table.
- Status badge with action buttons:
  - If `draft` → "Mark as Sent" button
  - If `sent` → "Mark as Paid" button
  - If `paid` → no action
- Delete button (only shown if `draft`).

---

## Acceptance Criteria
- [ ] Can create an invoice with multiple line items.
- [ ] Invoice total computed correctly.
- [ ] Invoice number auto-generated (e.g. INV-2025-0001).
- [ ] List shows all invoices with status badges.
- [ ] Can advance status: draft → sent → paid.
- [ ] Cannot delete a sent or paid invoice.
- [ ] Invoice detail page shows all line items.
