import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authMiddleware, errorHandler } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import customersRoutes from './routes/customers.js'
import transactionsRoutes from './routes/transactions.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({ data: 'ok', error: null })
})

// Auth routes (no auth required)
app.use('/api/auth', authRoutes)

// Protected routes - apply auth middleware
app.use('/api', authMiddleware)

// Customer routes
app.use('/api/customers', customersRoutes)

// Transaction and category routes
app.use('/api', transactionsRoutes)

app.get('/api/hello', (req, res) => {
  res.json({
    data: { message: 'Hello from backend', user: req.user },
    error: null,
  })
})

// Error handler (must be last)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
