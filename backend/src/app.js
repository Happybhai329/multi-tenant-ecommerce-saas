import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import testRoutes from './routes/testRoutes.js'
import storeRoutes from './routes/storeRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

// ── Stripe webhook needs raw body — must be registered BEFORE express.json() ──
// The route-level express.raw() in paymentRoutes handles this,
// but we must also skip express.json() for the webhook path.
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next()
  } else {
    express.json()(req, res, next)
  }
})

app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.get('/', (req, res) => {
  res.json({ message: 'API is running...' })
})

app.use('/api/auth', authRoutes)
app.use('/api/test', testRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/uploads', uploadRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
