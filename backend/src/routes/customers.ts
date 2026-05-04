import { Router, Request, Response } from 'express'
import pool from '../db.js'

const router = Router()

interface CustomerPayload {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}

// GET /api/customers
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const result = await pool.query(
      'SELECT id, name, email, phone, address FROM customers WHERE user_id = $1 ORDER BY name ASC',
      [userId]
    )

    res.json({
      data: result.rows,
      error: null,
    })
  } catch (error) {
    console.error('Get customers error:', error)
    res.status(500).json({
      data: null,
      error: 'Failed to load customers',
    })
  }
})

// POST /api/customers
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { name, email, phone, address } = req.body as CustomerPayload

    if (!name || !name.trim()) {
      return res.status(400).json({ data: null, error: 'Name is required' })
    }

    const result = await pool.query(
      'INSERT INTO customers (user_id, name, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, address',
      [userId, name.trim(), email || null, phone || null, address || null]
    )

    res.status(201).json({
      data: result.rows[0],
      error: null,
    })
  } catch (error) {
    console.error('Create customer error:', error)
    res.status(500).json({
      data: null,
      error: 'Failed to create customer',
    })
  }
})

// PUT /api/customers/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const customerId = req.params.id
    const { name, email, phone, address } = req.body as CustomerPayload

    if (!name || !name.trim()) {
      return res.status(400).json({ data: null, error: 'Name is required' })
    }

    const result = await pool.query(
      'UPDATE customers SET name = $1, email = $2, phone = $3, address = $4 WHERE id = $5 AND user_id = $6 RETURNING id, name, email, phone, address',
      [name.trim(), email || null, phone || null, address || null, customerId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        data: null,
        error: 'Customer not found',
      })
    }

    res.json({
      data: result.rows[0],
      error: null,
    })
  } catch (error) {
    console.error('Update customer error:', error)
    res.status(500).json({
      data: null,
      error: 'Failed to update customer',
    })
  }
})

// DELETE /api/customers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const customerId = req.params.id

    const result = await pool.query(
      'DELETE FROM customers WHERE id = $1 AND user_id = $2 RETURNING id',
      [customerId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        data: null,
        error: 'Customer not found',
      })
    }

    res.json({
      data: { success: true },
      error: null,
    })
  } catch (error) {
    console.error('Delete customer error:', error)
    res.status(500).json({
      data: null,
      error: 'Failed to delete customer',
    })
  }
})

export default router
