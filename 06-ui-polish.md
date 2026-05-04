# Prompt 06 — UI Polish & Design System
**Commit after this:** `feat: ui polish — design system, layout, and visual refinement`

---

## Goal
Transform the functional app into something that looks and feels premium. A small-business owner should open this and feel like they're using a tool that respects their time and taste — clean, confident, and calm.

---

## Design Direction: **Refined Utilitarian**

Think: a well-designed SaaS tool — not a startup landing page.
- **Mood:** Crisp, calm, professional. Like Linear or Stripe's dashboard.
- **Not:** Bubbly consumer app, purple gradient AI aesthetic, or generic Bootstrap.

---

## 1. Design Tokens — set these CSS variables globally

Add to your `index.css` or `globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');

:root {
  /* Typography */
  --font-sans: 'Geist', sans-serif;
  --font-mono: 'Geist Mono', monospace;

  /* Neutral scale */
  --color-bg:          #0f0f10;
  --color-surface:     #18181b;
  --color-surface-2:   #1f1f23;
  --color-border:      #2a2a2f;
  --color-border-subtle: #222226;

  /* Text */
  --color-text-primary:   #f4f4f5;
  --color-text-secondary: #8b8b97;
  --color-text-muted:     #52525b;

  /* Accent */
  --color-accent:       #6ee7b7;   /* soft emerald — money = green, but refined */
  --color-accent-dim:   #064e3b;
  --color-danger:       #f87171;
  --color-danger-dim:   #450a0a;
  --color-warning:      #fbbf24;

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px var(--color-border);
  --shadow-modal: 0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px var(--color-border);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
```

> **Why dark?** Accounting apps are stared at for long sessions. Dark reduces eye fatigue and makes green numbers pop naturally.

---

## 2. Layout Shell

### Sidebar Navigation
Replace any top nav with a **fixed left sidebar** (240px wide):

```
┌──────────────────────────────────────────────────────┐
│ [sidebar 240px]  │  [main content area, flex-grow]   │
│                  │                                    │
│  ◆ LedgerApp     │  <page content here>               │
│                  │                                    │
│  ○ Dashboard     │                                    │
│  ○ Customers     │                                    │
│  ○ Transactions  │                                    │
│  ○ Invoices      │                                    │
│                  │                                    │
│  ─────────────── │                                    │
│  [user avatar]   │                                    │
│  name / logout   │                                    │
└──────────────────────────────────────────────────────┘
```

**Sidebar styles:**
- Background: `var(--color-surface)`, right border: `1px solid var(--color-border)`
- Logo: bold mono font, accent color dot
- Nav links: full-width, 40px height, `var(--radius-sm)`, hover bg `var(--color-surface-2)`
- Active link: accent-colored left border (`3px solid var(--color-accent)`), text fully bright
- User section pinned to bottom with a subtle top border separator

**Main content area:**
- `padding: var(--space-8) var(--space-10)`
- Max width: `960px`, centered with `margin: 0 auto`

---

## 3. Component Styles

### Page Header
Every page gets a consistent header:
```jsx
<div className="page-header">
  <div>
    <h1>Customers</h1>         {/* 24px, weight 500 */}
    <p>12 total</p>            {/* secondary color, 13px */}
  </div>
  <button className="btn-primary">Add Customer</button>
</div>
```
```css
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border-subtle);
}
.page-header h1 { font-size: 22px; font-weight: 500; letter-spacing: -0.3px; }
.page-header p  { color: var(--color-text-secondary); font-size: 13px; margin-top: 2px; }
```

### Buttons
```css
.btn-primary {
  background: var(--color-accent);
  color: #0a0a0a;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.88; }

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.btn-ghost:hover { background: var(--color-surface-2); color: var(--color-text-primary); }

.btn-danger {
  background: var(--color-danger-dim);
  color: var(--color-danger);
  border: 1px solid transparent;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
}
```

### Cards / Panels
```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
}
```

### Data Table
```css
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.data-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-text-secondary);
  font-size: 13px;
}
.data-table td:first-child { color: var(--color-text-primary); font-weight: 500; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--color-surface-2); }
```
Wrap tables in `.card` so they get the rounded border container.

### Form Inputs
```css
.field { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-5); }
.field label { font-size: 12px; font-weight: 500; color: var(--color-text-secondary); letter-spacing: 0.03em; }
.input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 9px 12px;
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  transition: border-color 0.15s;
  width: 100%;
}
.input:focus { outline: none; border-color: var(--color-accent); }
.input::placeholder { color: var(--color-text-muted); }
select.input { cursor: pointer; }
```

### Modal / Slide-over
```css
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
  animation: fadeIn 0.15s ease;
}
.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-modal);
  animation: slideUp 0.2s ease;
}
@keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
```

---

## 4. Status Badges

Used on invoices and transaction types:

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
}
.badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

.badge-draft   { background: #27272a; color: #71717a; }
.badge-sent    { background: #1e3a5f; color: #60a5fa; }
.badge-paid    { background: var(--color-accent-dim); color: var(--color-accent); }
.badge-income  { background: var(--color-accent-dim); color: var(--color-accent); }
.badge-expense { background: var(--color-danger-dim); color: var(--color-danger); }
```

---

## 5. Amount Formatting

All monetary amounts should use a helper:

```ts
// src/lib/format.ts
export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
```

- Income amounts: wrap in `<span style="color: var(--color-accent)">` 
- Expense amounts: wrap in `<span style="color: var(--color-danger)">`
- Use monospace font (`var(--font-mono)`) for all currency values in tables.

---

## 6. Empty States

Every list page needs an empty state (don't show a blank table):

```jsx
<div className="empty-state">
  <div className="empty-icon">⬡</div>
  <p>No customers yet</p>
  <span>Add your first customer to get started.</span>
</div>
```

```css
.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-8);
  color: var(--color-text-muted);
}
.empty-icon { font-size: 32px; margin-bottom: var(--space-4); opacity: 0.3; }
.empty-state p { font-size: 15px; color: var(--color-text-secondary); margin-bottom: var(--space-2); }
.empty-state span { font-size: 13px; }
```

---

## 7. Loading State

Replace spinners with a subtle skeleton shimmer:

```css
.skeleton {
  background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-2) 50%, var(--color-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius-sm);
  height: 16px;
}
@keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }
```

For tables, render 5 skeleton rows while loading (each row has 3–4 skeleton cells).

---

## 8. Auth Pages (Login / Signup)

These are standalone — no sidebar.

```
┌──────────────────────────────────────────┐
│                                          │
│         ◆ LedgerApp                      │  (centered, ~40vh from top)
│                                          │
│   ┌──────────────────────────────┐       │
│   │  Sign in to your account     │       │
│   │                              │       │
│   │  Email     [_____________]   │       │
│   │  Password  [_____________]   │       │
│   │                              │       │
│   │  [    Sign In    ]           │       │
│   │                              │       │
│   │  No account? Sign up →       │       │
│   └──────────────────────────────┘       │
│                                          │
└──────────────────────────────────────────┘
```

- Full-height dark background with a very subtle radial gradient behind the card.
- Card: `.card` style, max-width 400px, centered.
- Logo text: `font-family: var(--font-mono); color: var(--color-accent);`

---

## 9. Dashboard Stat Cards

```css
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); }
.stat-value { font-size: 28px; font-weight: 500; font-family: var(--font-mono); letter-spacing: -0.5px; }
.stat-value.positive { color: var(--color-accent); }
.stat-value.negative { color: var(--color-danger); }
```

Grid layout: `display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4);`

---

## Acceptance Criteria
- [ ] Consistent dark theme across all pages using CSS variables.
- [ ] Sidebar navigation with active state highlighted.
- [ ] All tables have hover states, correct column widths, and muted headers.
- [ ] Buttons have three variants: primary (accent), ghost, danger.
- [ ] Modals animate in with fade + slide.
- [ ] Status badges render correctly on invoices and transactions.
- [ ] Currency values use monospace font and correct colours.
- [ ] Empty states show on all list pages when data is absent.
- [ ] Loading skeletons replace spinners.
- [ ] Auth pages are centered, standalone (no sidebar).
