# Prompt 05 — Stretch Goals
**Commit after each sub-feature:** see individual commit messages below.

Pick any of these in order of confidence/time. Each is independent.

---

## A. Dashboard
**Commit:** `feat: dashboard with revenue, expenses, and outstanding invoices summary`

### Page: `/` (home, redirect here after login)

**Summary Cards**
- Total Revenue (sum of all `income` transactions)
- Total Expenses (sum of all `expense` transactions)
- Net (Revenue − Expenses)
- Outstanding Invoices (sum of totals for invoices with status `draft` or `sent`)

**Backend**
- `GET /api/dashboard` — returns:
  ```json
  {
    "data": {
      "totalRevenue": 12000.00,
      "totalExpenses": 4500.00,
      "net": 7500.00,
      "outstandingInvoices": 3200.00,
      "recentTransactions": [ ...last 5... ]
    }
  }
  ```

**Frontend**
- 4 stat cards at the top.
- A small recent transactions table below (last 5, no filters).
- Link each card/section to the relevant full page.

---

## B. PDF Export for Invoices
**Commit:** `feat: PDF export for invoices`

Use `pdfkit` (backend) or `@react-pdf/renderer` (frontend). Backend approach is simpler.

### Backend
- `GET /api/invoices/:id/pdf` — streams a PDF response with:
  - Business name (from user name) + "INVOICE" heading
  - Invoice number, issue date, due date
  - Customer name + address
  - Line items table (description, qty, unit price, line total)
  - Grand total
  - Notes (if any)
- Set headers: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="INV-XXXX.pdf"`

### Frontend
- Add "Download PDF" button on `/invoices/:id` page.
- Button calls `GET /api/invoices/:id/pdf` and triggers browser download.
  ```ts
  const res = await fetch(`/api/invoices/${id}/pdf`, { headers: { Authorization: ... } });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `invoice-${id}.pdf`; a.click();
  ```

---

## C. AI Categorisation (Gemini / OpenAI)
**Commit:** `feat: AI-suggested category for transactions`

### What it does
When the user types a transaction description, suggest a matching category automatically.

### Backend
- `POST /api/ai/suggest-category` — body: `{ description: string, type: "income" | "expense" }`.
- Call Gemini (or OpenAI) with a prompt like:
  ```
  Given this transaction description: "{description}"
  And transaction type: "{type}"
  From these categories: {comma-separated list of category names}
  Return ONLY the single best matching category name, nothing else.
  ```
- Return `{ data: { category: "Software" } }`.
- If AI fails, return `{ data: { category: null } }` — never throw.

**Install:** `npm install @google/generative-ai` (Gemini) or `npm install openai`.
**Env var needed:** `GEMINI_API_KEY` or `OPENAI_API_KEY`.

### Frontend (Add Transaction form)
- After user types in the Description field and blurs (or after 600ms debounce):
  - Call `POST /api/ai/suggest-category`.
  - If a category is returned, auto-select it in the Category dropdown.
  - Show a small "✨ AI suggested" badge next to the dropdown.
  - User can still manually override.

---

## D. CSV Import for Transactions
**Commit:** `feat: CSV bulk import for transactions`

### Backend
- `POST /api/transactions/import` — accepts `multipart/form-data` with a `file` field.
- Parse CSV with `csv-parse` (`npm install csv-parse`).
- Expected CSV columns: `date, description, amount, type, category`
- Match `category` by name (case-insensitive) against user's categories; skip if not found.
- Insert all valid rows in a single DB transaction.
- Return `{ data: { imported: N, skipped: M } }`.

### Frontend
- On `/transactions` page, add an "Import CSV" button.
- Opens a file picker (accept `.csv`).
- On select, POST to `/api/transactions/import`.
- Show result: "Imported 12 transactions, 2 skipped."
- Refresh list after import.

### Sample CSV format (show in UI as a hint):
```
date,description,amount,type,category
2025-01-15,Client payment,1500.00,income,Sales
2025-01-16,AWS bill,120.00,expense,Software
```

---

## Notes
- Don't try to do all four. Pick what fits your remaining time.
- A + B are the safest bets (no external API keys needed).
- C requires an API key but is a good demo moment.
- D is straightforward if you've done backend file uploads before.
