import express from 'express'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { protect } from '../middleware/auth.js'
import { validateRegister, validateLogin } from '../middleware/validate.js'
import { loginRateLimiter, registerRateLimiter } from '../middleware/rateLimiter.js'
import { sendWelcomeEmail } from '../utils/emailService.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

const router = express.Router()

const requestMeta = (req) => ({
  requestId: req.id,
  ip: req.ip,
  userAgent: req.get('user-agent'),
})

// POST /api/auth/register
router.post('/register', registerRateLimiter, validateRegister, asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body
  const normalizedEmail = email.trim().toLowerCase()

  // Role protection on registration
  if (role === 'admin') {
    logger.event('auth.register.blocked', {
      ...requestMeta(req),
      email: normalizedEmail,
      reason: 'admin_registration',
    })
    res.status(400)
    throw new Error('Direct registration as administrator is not allowed')
  }

  const existingUser = await User.findOne({ email: normalizedEmail })
  if (existingUser) {
    logger.event('auth.register.failed', {
      ...requestMeta(req),
      email: normalizedEmail,
      reason: 'duplicate_email',
    })
    res.status(400)
    throw new Error('Email already registered')
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
  })

  // Send welcome email asynchronously (don't await to avoid blocking the response)
  sendWelcomeEmail(user.email, user.name, user.role).catch((err) => {
    logger.warn('Failed to send welcome email', {
      ...requestMeta(req),
      userId: user._id,
      error: err.message,
    })
  })

  logger.event('auth.register.success', {
    ...requestMeta(req),
    userId: user._id,
    email: user.email,
    role: user.role,
  })

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
router.post('/login', loginRateLimiter, validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const normalizedEmail = email.trim().toLowerCase()

  const user = await User.findOne({ email: normalizedEmail })
  if (!user) {
    logger.event('auth.login.failed', {
      ...requestMeta(req),
      email: normalizedEmail,
      reason: 'invalid_credentials',
    })
    res.status(401)
    throw new Error('Invalid email or password')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    logger.event('auth.login.failed', {
      ...requestMeta(req),
      email: normalizedEmail,
      reason: 'invalid_credentials',
    })
    res.status(401)
    throw new Error('Invalid email or password')
  }

  if (user.status === 'suspended') {
    logger.event('auth.login.blocked', {
      ...requestMeta(req),
      userId: user._id,
      email: user.email,
      reason: 'suspended',
    })
    res.status(403)
    throw new Error('Your account has been suspended. Please contact support.')
  }

  logger.event('auth.login.success', {
    ...requestMeta(req),
    userId: user._id,
    email: user.email,
    role: user.role,
  })

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
