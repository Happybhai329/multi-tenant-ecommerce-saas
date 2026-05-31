import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import { getVendorAnalytics } from '../controllers/analyticsController.js'

const router = express.Router()

// GET /api/analytics/overview — vendor analytics dashboard data
router.get('/overview', protect, authorize('vendor'), getVendorAnalytics)

export default router
