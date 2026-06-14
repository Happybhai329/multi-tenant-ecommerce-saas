import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import env from '../config/env.js'
import logger from '../utils/logger.js'

const objectIdRegex = /^[0-9a-fA-F]{24}$/

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return null

  const [scheme, token] = authHeader.trim().split(/\s+/)
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null

  return token
}

const sendAuthError = (res, status, code, message) => {
  return res.status(status).json({
    success: false,
    code,
    message,
  })
}

const resolveAuthenticatedUser = async (req) => {
  const token = getBearerToken(req)

  if (!token) {
    return {
      error: {
        status: 401,
        code: 'AUTH_TOKEN_MISSING',
        message: 'Authentication required. Please sign in.',
      },
    }
  }

  let decoded

  try {
    decoded = jwt.verify(token, env.jwtSecret)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return {
        error: {
          status: 401,
          code: 'AUTH_TOKEN_EXPIRED',
          message: 'Your session has expired. Please sign in again.',
        },
      }
    }

    return {
      error: {
        status: 401,
        code: 'AUTH_TOKEN_INVALID',
        message: 'Your session is invalid. Please sign in again.',
      },
    }
  }

  if (!decoded?.id || !objectIdRegex.test(decoded.id)) {
    return {
      error: {
        status: 401,
        code: 'AUTH_TOKEN_INVALID',
        message: 'Your session is invalid. Please sign in again.',
      },
    }
  }

  const user = await User.findById(decoded.id).select('-password')

  if (!user) {
    return {
      error: {
        status: 401,
        code: 'AUTH_USER_NOT_FOUND',
        message: 'Your account could not be found. Please sign in again.',
      },
    }
  }

  if (user.status === 'suspended') {
    return {
      error: {
        status: 403,
        code: 'AUTH_ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended. Please contact support.',
      },
    }
  }

  return { user, tokenPayload: decoded }
}

const protect = async (req, res, next) => {
  const result = await resolveAuthenticatedUser(req)

  if (result.error) {
    logger.event('auth.access.denied', {
      requestId: req.id,
      code: result.error.code,
      path: req.originalUrl,
      ip: req.ip,
    })
    return sendAuthError(res, result.error.status, result.error.code, result.error.message)
  }

  req.user = result.user
  req.auth = result.tokenPayload
  next()
}

const optionalAuth = async (req, _res, next) => {
  if (!getBearerToken(req)) return next()

  const result = await resolveAuthenticatedUser(req)

  if (result.error) {
    logger.event('auth.optional.ignored', {
      requestId: req.id,
      code: result.error.code,
      path: req.originalUrl,
      ip: req.ip,
    })
    return next()
  }

  req.user = result.user
  req.auth = result.tokenPayload
  next()
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendAuthError(res, 401, 'AUTH_TOKEN_MISSING', 'Authentication required. Please sign in.')
    }

    if (!roles.includes(req.user.role)) {
      logger.event('auth.authorization.denied', {
        requestId: req.id,
        userId: req.user._id,
        role: req.user.role,
        allowedRoles: roles,
        path: req.originalUrl,
      })
      return sendAuthError(res, 403, 'AUTH_FORBIDDEN', 'You do not have permission to access this resource.')
    }

    next()
  }
}

export { protect, optionalAuth, authorize, getBearerToken }
