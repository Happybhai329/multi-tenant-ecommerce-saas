import logger from '../utils/logger.js'

const buckets = new Map()

const defaultKeyGenerator = (req) => req.ip || req.socket?.remoteAddress || 'unknown'

const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 20,
  message = 'Too many requests. Please try again later.',
  keyGenerator = defaultKeyGenerator,
} = {}) => {
  return (req, res, next) => {
    // Bypass rate limiting in test environment or with a valid bypass header
    if (
      process.env.NODE_ENV === 'test' ||
      (process.env.RATE_LIMIT_BYPASS_KEY && req.headers['x-bypass-rate-limit'] === process.env.RATE_LIMIT_BYPASS_KEY)
    ) {
      return next()
    }

    const now = Date.now()
    const key = keyGenerator(req)
    const bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    bucket.count += 1

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
      logger.event('rate_limit.exceeded', {
        requestId: req.id,
        key,
        path: req.originalUrl,
        ip: req.ip,
        retryAfter,
      })
      res.setHeader('Retry-After', retryAfter)
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMITED',
        message,
        retryAfter,
      })
    }

    next()
  }
}

const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: 'Too many login attempts. Please wait a few minutes and try again.',
  keyGenerator: (req) => `login:${defaultKeyGenerator(req)}:${normalizeEmail(req.body?.email)}`,
})

const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many registration attempts. Please try again later.',
  keyGenerator: (req) => `register:${defaultKeyGenerator(req)}`,
})

setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}, 10 * 60 * 1000).unref()

export { createRateLimiter, loginRateLimiter, registerRateLimiter }
