import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import { createStore, getAllStores, getMyStore, getStoreBySlug } from '../controllers/storeController.js'

const router = express.Router()

// Public routes
router.get('/', getAllStores)

// Vendor-only routes
router.post('/', protect, authorize('vendor'), createStore)
router.get('/my-store', protect, authorize('vendor'), getMyStore)

// Public — must be last (catch-all param)
router.get('/:slug', getStoreBySlug)

export default router
