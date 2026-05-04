import { Router, Request, Response } from 'express'
import pool from '../db.js'

const router = Router()

interface TransactionPayload {
  amount: number
  type: 'income' | 'expense'
  category_id?: string | null
  description?: string | null
  date?: string
}

// GET /api/categories?type=income|expense
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const type = req.query.type as string | undefined
    const params = [userId]
    let sql = 'SELECT id, name, type FROM categories WHERE user_id = $1'

    if (type === 'income' || type === 'expense') {
      params.push(type)
      sql += ` AND type = $${params.length}`
    }

    sql += ' ORDER BY name ASC'

    const result = await pool.query(sql, params)
    res.json({ data: result.rows, error: null })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ data: null, error: 'Failed to load categories' })
  }
})

// GET /api/transactions
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const type = req.query.type as string | undefined
    const categoryId = req.query.category_id as string | undefined
    const fromDate = req.query.from as string | undefined
    const toDate = req.query.to as string | undefined

    const clauses: string[] = ['t.user_id = $1']
    const params: any[] = [userId]

    if (type === 'income' || type === 'expense') {
      params.push(type)
      clauses.push(`t.type = $${params.length}`)
    }

    if (categoryId) {
      params.push(categoryId)
      clauses.push(`t.category_id = $${params.length}`)
    }

    if (fromDate) {
      params.push(fromDate)
      clauses.push(`t.date >= $${params.length}`)
    }

    if (toDate) {
      params.push(toDate)
      clauses.push(`t.date <= $${params.length}`)
    }

    const whereClause = `WHERE ${clauses.join(' AND ')}`
    const sql = `SELECT t.id, t.amount, t.type, t.description, t.date, t.category_id, c.name AS category_name FROM transactions t LEFT JOIN categories c ON c.id = t.category_id ${whereClause} ORDER BY t.date DESC, t.created_at DESC`

    const result = await pool.query(sql, params)
    res.json({ data: result.rows, error: null })
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({ data: null, error: 'Failed to load transactions' })
  }
})

// POST /api/transactions
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { amount, type, category_id, description, date } = req.body as TransactionPayload

    if (!amount || !type) {
      return res.status(400).json({ data: null, error: 'Amount and type are required' })
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ data: null, error: 'Type must be income or expense' })
    }

    const transactionDate = date || new Date().toISOString().slice(0, 10)

    const insertResult = await pool.query(
      'INSERT INTO transactions (user_id, amount, type, category_id, description, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, amount, type, category_id || null, description || null, transactionDate]
    )

    const transactionId = insertResult.rows[0].id
    const result = await pool.query(
      'SELECT t.id, t.amount, t.type, t.description, t.date, t.category_id, c.name AS category_name FROM transactions t LEFT JOIN categories c ON c.id = t.category_id WHERE t.id = $1',
      [transactionId]
    )

    res.status(201).json({ data: result.rows[0], error: null })
  } catch (error) {
    console.error('Create transaction error:', error)
    res.status(500).json({ data: null, error: 'Failed to create transaction' })
  }
})

// DELETE /api/transactions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const transactionId = req.params.id

    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [transactionId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ data: null, error: 'Transaction not found' })
    }

    res.json({ data: { success: true }, error: null })
  } catch (error) {
    console.error('Delete transaction error:', error)
    res.status(500).json({ data: null, error: 'Failed to delete transaction' })
  }
})

export default router
