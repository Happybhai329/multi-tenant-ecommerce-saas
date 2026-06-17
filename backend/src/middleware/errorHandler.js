import logger from '../utils/logger.js'
import env from '../config/env.js'

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const notFound = (req, res, next) => {
  res.status(404)
  next(new Error(`Not found - ${req.originalUrl}`))
}

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode)
  let message = err.message

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ')
  }

  // Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    message = `Duplicate field value entered: ${field}. Please use another value.`
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid format for field ${err.path}: ${err.value}`
  }

  // JsonWebTokenError / TokenExpiredError
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    err.code = 'AUTH_TOKEN_INVALID'
    message = 'Your session is invalid. Please sign in again.'
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    err.code = 'AUTH_TOKEN_EXPIRED'
    message = 'Your session has expired. Please sign in again.'
  }

  if (statusCode >= 500) {
    logger.error('Request failed', {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      error: message,
    })
  } else if (statusCode === 429 || statusCode === 401 || statusCode === 403) {
    logger.warn('Request rejected', {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      code: err.code,
      error: message,
    })
  }

  const response = {
    success: false,
    message,
  }

  if (err.code) {
    response.code = err.code
  }

  if (!env.isProduction) {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}
