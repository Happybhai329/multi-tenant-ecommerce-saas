import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import { validateStoreCreate, validateStoreUpdate } from '../middleware/validate.js'
import { createStore, getAllStores, getMyStore, getStoreBySlug, updateMyStore } from '../controllers/storeController.js'

const router = express.Router()

// Public routes
router.get('/', getAllStores)

// Vendor-only routes
router.post('/', protect, authorize('vendor'), validateStoreCreate, createStore)
router.get('/my-store', protect, authorize('vendor'), getMyStore)
router.patch('/my-store', protect, authorize('vendor'), validateStoreUpdate, updateMyStore)

// Public — must be last (catch-all param)
router.get('/:slug', getStoreBySlug)

export default router
