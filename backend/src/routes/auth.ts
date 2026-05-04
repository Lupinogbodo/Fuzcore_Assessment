import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

interface SignupBody {
  name: string
  email: string
  password: string
}

interface LoginBody {
  email: string
  password: string
}

// Helper to generate JWT
function generateToken(id: string, email: string): string {
  return jwt.sign({ id, email }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  })
}

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as SignupBody

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        data: null,
        error: 'Missing required fields: name, email, password',
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name',
      [name, email, passwordHash]
    )

    const user = result.rows[0]
    const token = generateToken(user.id, user.email)

    res.status(201).json({
      data: { token, user: { id: user.id, name: user.name, email: user.email } },
      error: null,
    })
  } catch (error: any) {
    // Handle unique constraint error on email
    if (error.code === '23505') {
      return res.status(400).json({
        data: null,
        error: 'Email already exists',
      })
    }

    console.error('Signup error:', error)
    res.status(500).json({
      data: null,
      error: 'Failed to create account',
    })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginBody

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        data: null,
        error: 'Missing email or password',
      })
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])

    if (result.rows.length === 0) {
      return res.status(401).json({
        data: null,
        error: 'Invalid email or password',
      })
    }

    const user = result.rows[0]

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return res.status(401).json({
        data: null,
        error: 'Invalid email or password',
      })
    }

    const token = generateToken(user.id, user.email)

    res.json({
      data: { token, user: { id: user.id, name: user.name, email: user.email } },
      error: null,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      data: null,
      error: 'Failed to log in',
    })
  }
})

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  // Stateless logout - client just drops the token
  res.json({
    data: 'ok',
    error: null,
  })
})

// GET /api/auth/me (protected)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        data: null,
        error: 'Not authenticated',
      })
    }

    // Fetch fresh user data
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        data: null,
        error: 'User not found',
      })
    }

    res.json({
      data: result.rows[0],
      error: null,
    })
  } catch (error) {
    console.error('Auth me error:', error)
    res.status(500).json({
      data: null,
      error: 'Failed to fetch user',
    })
  }
})

export default router
