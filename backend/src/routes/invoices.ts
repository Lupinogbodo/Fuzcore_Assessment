import { Router, Request, Response } from 'express'
import pool from '../db.js'

const router = Router()

interface InvoiceItemPayload {
  description: string
  quantity: number
  unit_price: number
}

interface InvoicePayload {
  customer_id: string
  due_date?: string
  notes?: string | null
  items: InvoiceItemPayload[]
}

function padSequence(value: number) {
  return String(value).padStart(4, '0')
}

async function generateInvoiceNumber(userId: string, issueDate: string) {
  const year = new Date(issueDate).getFullYear()
  const countResult = await pool.query(
    'SELECT COUNT(*) AS count FROM invoices WHERE user_id = $1 AND EXTRACT(YEAR FROM issue_date) = $2',
    [userId, year]
  )
  const nextSequence = Number(countResult.rows[0].count || 0) + 1
  return `INV-${year}-${padSequence(nextSequence)}`
}

// GET /api/invoices?status=draft|sent|paid
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const status = req.query.status as string | undefined
    const params: any[] = [userId]
    let where = 'WHERE i.user_id = $1'

    if (status === 'draft' || status === 'sent' || status === 'paid') {
      params.push(status)
      where += ` AND i.status = $${params.length}`
    }

    const result = await pool.query(
      `SELECT i.id,
              i.invoice_number,
              i.status,
              i.issue_date,
              i.due_date,
              c.name AS customer_name,
              COALESCE(SUM(ii.quantity * ii.unit_price), 0)::numeric(12,2) AS total
       FROM invoices i
       JOIN customers c ON c.id = i.customer_id
       LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
       ${where}
       GROUP BY i.id, c.name
       ORDER BY i.issue_date DESC, i.created_at DESC`,
      params
    )

    res.json({ data: result.rows, error: null })
  } catch (error) {
    console.error('Get invoices error:', error)
    res.status(500).json({ data: null, error: 'Failed to load invoices' })
  }
})

// GET /api/invoices/:id
router.get('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const invoiceId = req.params.id

    const invoiceResult = await pool.query(
      `SELECT i.id,
              i.invoice_number,
              i.status,
              i.issue_date,
              i.due_date,
              i.notes,
              c.id AS customer_id,
              c.name AS customer_name,
              c.email AS customer_email,
              c.phone AS customer_phone,
              c.address AS customer_address,
              COALESCE(SUM(ii.quantity * ii.unit_price), 0)::numeric(12,2) AS total
       FROM invoices i
       JOIN customers c ON c.id = i.customer_id
       LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
       WHERE i.id = $1 AND i.user_id = $2
       GROUP BY i.id, c.id, c.name, c.email, c.phone, c.address`,
      [invoiceId, userId]
    )

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: 'Invoice not found' })
    }

    const invoice = invoiceResult.rows[0]
    const itemsResult = await pool.query(
      'SELECT id, description, quantity, unit_price FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at ASC',
      [invoiceId]
    )

    res.json({
      data: {
        ...invoice,
        items: itemsResult.rows,
      },
      error: null,
    })
  } catch (error) {
    console.error('Get invoice detail error:', error)
    res.status(500).json({ data: null, error: 'Failed to load invoice' })
  }
})

// POST /api/invoices
router.post('/invoices', async (req: Request, res: Response) => {
  const client = await pool.connect()

  try {
    const userId = req.user?.id
    const { customer_id, due_date, notes, items } = req.body as InvoicePayload

    if (!userId) {
      return res.status(401).json({ data: null, error: 'Unauthorized' })
    }

    if (!customer_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ data: null, error: 'Customer and line items are required' })
    }

    const issueDate = new Date().toISOString().slice(0, 10)
    const invoiceNumber = await generateInvoiceNumber(userId, issueDate)

    await client.query('BEGIN')

    const invoiceResult = await client.query(
      'INSERT INTO invoices (user_id, customer_id, invoice_number, due_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id, invoice_number, status, issue_date, due_date, notes',
      [userId, customer_id, invoiceNumber, due_date || null, notes || null]
    )

    const invoiceId = invoiceResult.rows[0].id
    const itemsInsert = items.map((item) =>
      client.query(
        'INSERT INTO invoice_items (invoice_id, description, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [invoiceId, item.description, item.quantity, item.unit_price]
      )
    )

    await Promise.all(itemsInsert)
    await client.query('COMMIT')

    res.status(201).json({ data: invoiceResult.rows[0], error: null })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Create invoice error:', error)
    res.status(500).json({ data: null, error: 'Failed to create invoice' })
  } finally {
    client.release()
  }
})

// PATCH /api/invoices/:id/status
router.patch('/invoices/:id/status', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const invoiceId = req.params.id
    const status = req.body.status as string

    if (status !== 'sent' && status !== 'paid') {
      return res.status(400).json({ data: null, error: 'Invalid status' })
    }

    const currentResult = await pool.query(
      'SELECT status FROM invoices WHERE id = $1 AND user_id = $2',
      [invoiceId, userId]
    )

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: 'Invoice not found' })
    }

    const currentStatus = currentResult.rows[0].status
    if (currentStatus === 'draft' && status === 'sent') {
      // allowed
    } else if (currentStatus === 'sent' && status === 'paid') {
      // allowed
    } else {
      return res.status(400).json({ data: null, error: 'Invalid status transition' })
    }

    const updatedResult = await pool.query(
      'UPDATE invoices SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING id, status',
      [status, invoiceId, userId]
    )

    res.json({ data: updatedResult.rows[0], error: null })
  } catch (error) {
    console.error('Update invoice status error:', error)
    res.status(500).json({ data: null, error: 'Failed to update invoice status' })
  }
})

// DELETE /api/invoices/:id
router.delete('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const invoiceId = req.params.id

    const invoiceResult = await pool.query(
      'SELECT status FROM invoices WHERE id = $1 AND user_id = $2',
      [invoiceId, userId]
    )

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: 'Invoice not found' })
    }

    if (invoiceResult.rows[0].status !== 'draft') {
      return res.status(400).json({ data: null, error: 'Only draft invoices can be deleted' })
    }

    await pool.query('DELETE FROM invoices WHERE id = $1 AND user_id = $2', [invoiceId, userId])
    res.json({ data: { success: true }, error: null })
  } catch (error) {
    console.error('Delete invoice error:', error)
    res.status(500).json({ data: null, error: 'Failed to delete invoice' })
  }
})

export default router
