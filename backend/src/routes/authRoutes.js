import express from 'express'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { protect } from '../middleware/auth.js'
import { validateRegister, validateLogin } from '../middleware/validate.js'
import { sendWelcomeEmail } from '../utils/emailService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = express.Router()

// POST /api/auth/register
router.post('/register', validateRegister, asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body

  // Role protection on registration
  if (role === 'admin') {
    res.status(400)
    throw new Error('Direct registration as administrator is not allowed')
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    res.status(400)
    throw new Error('Email already registered')
  }

  const user = await User.create({ name, email, password, role })

  // Send welcome email asynchronously (don't await to avoid blocking the response)
  sendWelcomeEmail(user.email, user.name, user.role).catch(err => console.error('Failed to send welcome email:', err))

  res.status(201).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token: generateToken(user),
    },
  })
}))

// POST /api/auth/login
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  if (user.status === 'suspended') {
    res.status(403)
    throw new Error('Your account has been suspended. Please contact support.')
  }

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token: generateToken(user),
    },
  })
}))

// GET /api/auth/me
router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        createdAt: req.user.createdAt,
      },
    },
  })
}))

export default router
