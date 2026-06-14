import crypto from 'crypto'
import morgan from 'morgan'
import logger from '../utils/logger.js'

morgan.token('id', (req) => req.id)
morgan.token('user', (req) => req.user?._id?.toString() || 'anonymous')

const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID()
  res.setHeader('X-Request-Id', req.id)
  next()
}

const requestLogger = morgan(
  ':method :url :status :response-time ms user=:user req=:id',
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }
)

export { requestId, requestLogger }
