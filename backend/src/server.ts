import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authMiddleware, errorHandler } from './middleware/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ data: 'ok', error: null })
})

// Protected routes example (to be replaced by actual routes)
app.use('/api', authMiddleware)

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
