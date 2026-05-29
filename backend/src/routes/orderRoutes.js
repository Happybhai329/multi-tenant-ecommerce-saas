import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController.js'

const router = express.Router()

// POST /api/orders — create order (customer only)
router.post('/', protect, authorize('customer'), createOrder)

// GET /api/orders/my-orders — list orders (customer or vendor)
router.get('/my-orders', protect, getMyOrders)

// GET /api/orders/:id — single order detail (customer, vendor, or admin)
router.get('/:id', protect, getOrderById)

export default router
