import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import testRoutes from './routes/testRoutes.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
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

app.use(notFound)
app.use(errorHandler)

export default app
