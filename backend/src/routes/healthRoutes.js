import express from 'express'
import mongoose from 'mongoose'
import env from '../config/env.js'

const router = express.Router()

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

const getHealthPayload = () => {
  const readyState = mongoose.connection.readyState
  const databaseStatus = DB_STATES[readyState] || 'unknown'
  const isHealthy = readyState === 1

  return {
    success: true,
    status: isHealthy ? 'ok' : 'degraded',
    service: 'multi-tenant-ecommerce-api',
    version: env.appVersion,
    environment: env.nodeEnv,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: databaseStatus,
      readyState,
      name: mongoose.connection.name || null,
      host: mongoose.connection.host || null,
    },
  }
}

router.get('/health', (_req, res) => {
  const payload = getHealthPayload()
  res.status(payload.status === 'ok' ? 200 : 503).json(payload)
})

router.get('/status', (_req, res) => {
  res.json({
    ...getHealthPayload(),
    monitoring: {
      uptimeSeconds: Math.round(process.uptime()),
      memory: process.memoryUsage(),
    },
  })
})

export default router
