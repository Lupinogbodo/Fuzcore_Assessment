import { Router, Request, Response } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ data: null, error: 'Unauthorized' })
    }

    const statsResult = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0)::numeric(12,2) AS total_revenue,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0)::numeric(12,2) AS total_expenses
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    )

    const outstandingResult = await pool.query(
      `SELECT COALESCE(SUM(ii.quantity * ii.unit_price), 0)::numeric(12,2) AS outstanding_invoices
       FROM invoices i
       JOIN invoice_items ii ON ii.invoice_id = i.id
       WHERE i.user_id = $1 AND i.status IN ('draft', 'sent')`,
      [userId]
    )

    const recentTransactionsResult = await pool.query(
      `SELECT t.id, t.amount, t.type, t.description, t.date, c.name AS category_name
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = $1
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT 5`,
      [userId]
    )

    const totalRevenue = Number(statsResult.rows[0]?.total_revenue || 0)
    const totalExpenses = Number(statsResult.rows[0]?.total_expenses || 0)
    const outstandingInvoices = Number(outstandingResult.rows[0]?.outstanding_invoices || 0)

    res.json({
      data: {
        totalRevenue,
        totalExpenses,
        net: totalRevenue - totalExpenses,
        outstandingInvoices,
        recentTransactions: recentTransactionsResult.rows,
      },
      error: null,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ data: null, error: 'Failed to load dashboard' })
  }
})

export default router
