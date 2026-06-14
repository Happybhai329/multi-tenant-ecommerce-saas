import 'dotenv/config'

import app from './src/app.js'
import env, { validateEnv } from './src/config/env.js'
import connectDB from './src/config/db.js'
import logger from './src/utils/logger.js'

const start = async () => {
  const warnings = validateEnv()
  warnings.forEach((warning) => logger.warn(warning))

  await connectDB()
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`, {
      environment: env.nodeEnv,
      version: env.appVersion,
      allowedOrigins: env.clientUrls,
    })
  })
}

start().catch((err) => {
  logger.error('Failed to start server', { error: err.message })
  process.exit(1)
})
