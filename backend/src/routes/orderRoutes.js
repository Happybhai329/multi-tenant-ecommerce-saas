import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import { validateOrderCreate, validateOrderStatusUpdate } from '../middleware/validate.js'
import { createOrder, getMyOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js'
import { verifyOrderAccess, verifyOrderStoreOwner } from '../middleware/ownership.js'

const router = express.Router()

// POST /api/orders — create order (customer only)
router.post('/', protect, authorize('customer'), validateOrderCreate, createOrder)

// GET /api/orders/my-orders — list orders (customer or vendor)
router.get('/my-orders', protect, getMyOrders)

// GET /api/orders/:id — single order detail (customer, vendor, or admin)
router.get('/:id', protect, verifyOrderAccess, getOrderById)

// PATCH /api/orders/:id/status — update order status (vendor only)
router.patch('/:id/status', protect, authorize('vendor'), verifyOrderStoreOwner, validateOrderStatusUpdate, updateOrderStatus)

export default router
