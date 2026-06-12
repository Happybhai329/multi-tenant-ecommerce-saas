import express from 'express'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { protect } from '../middleware/auth.js'
import { validateRegister, validateLogin } from '../middleware/validate.js'
import { sendWelcomeEmail } from '../utils/emailService.js'

const router = express.Router()

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Role protection on registration
    if (role === 'admin') {
      return res.status(400).json({ success: false, message: 'Direct registration as administrator is not allowed' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    const user = await User.create({ name, email, password, role })

    // Send welcome email asynchronously (don't await to avoid blocking the response)
    sendWelcomeEmail(user.email, user.name, user.role).catch(err => console.error('Failed to send welcome email:', err))

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token: generateToken(user),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' })
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token: generateToken(user),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      createdAt: req.user.createdAt,
    },
  })
})

export default router
