export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const notFound = (req, res, next) => {
  res.status(404)
  next(new Error(`Not found - ${req.originalUrl}`))
}

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
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
    message = 'Not authorized, token invalid'
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Not authorized, token expired'
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
}
