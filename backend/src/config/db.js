import mongoose from 'mongoose'
import env from './env.js'
import logger from '../utils/logger.js'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri)
    logger.info('MongoDB connected', {
      host: conn.connection.host,
      database: conn.connection.name,
    })
  } catch (err) {
    logger.error('MongoDB connection failed', { error: err.message })
    process.exit(1)
  }
}

export default connectDB
