import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import env from './config/env.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { requestId, requestLogger } from './middleware/requestLogger.js'
import authRoutes from './routes/authRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import storeRoutes from './routes/storeRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { protect, authorize } from './middleware/auth.js'

const app = express()

app.disable('x-powered-by')

app.use(helmet())
app.use(requestId)
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true)
    }

    // Exact match in CLIENT_URLS
    if (env.clientUrls.includes(origin)) {
      return callback(null, true)
    }

    // Allow Vercel preview/deployment URLs (e.g., https://*.vercel.app)
    if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true)
    }

    const error = new Error(`CORS policy does not allow this origin: ${origin}`)
    error.statusCode = 403
    error.code = 'CORS_ORIGIN_DENIED'
    return callback(error)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
}))
app.use(requestLogger)

// ── Stripe webhook needs raw body — must be registered BEFORE express.json() ──
// The route-level express.raw() in paymentRoutes handles this,
// but we must also skip express.json() for the webhook path.
app.use((req, res, next) => {
  if (req.path === '/api/payments/webhook') {
    next()
  } else {
    express.json()(req, res, next)
  }
})

app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.json({ message: 'API is running...' })
})

app.use('/api', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/admin', protect, authorize('admin'), adminRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
