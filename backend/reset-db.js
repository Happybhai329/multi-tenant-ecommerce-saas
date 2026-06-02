import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const reset = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/multi_tenant_ecommerce'
    const conn = await mongoose.connect(mongoUri)
    console.log(`Connected to MongoDB: ${conn.connection.host}`)
    
    // Drop the database
    await conn.connection.db.dropDatabase()
    console.log('Database successfully cleared/reset!')
    
    process.exit(0)
  } catch (error) {
    console.error('Error resetting database:', error.message)
    process.exit(1)
  }
}

reset()
