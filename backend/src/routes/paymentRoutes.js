import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import { createPaymentIntent, getPaymentById, confirmMockPayment } from '../controllers/paymentController.js'
import { handleWebhook } from '../controllers/webhookController.js'

const router = express.Router()

// POST /api/payments/webhook — Stripe webhook (raw body, no auth)
// NOTE: This route uses express.raw() middleware — configured in app.js
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook)

// POST /api/payments/create-intent — create Stripe payment intent (customer only)
router.post('/create-intent', protect, authorize('customer'), createPaymentIntent)

// POST /api/payments/confirm-mock — confirm mock payment (customer only)
router.post('/confirm-mock', protect, authorize('customer'), confirmMockPayment)

// GET /api/payments/:id — get payment details (customer or admin)
router.get('/:id', protect, getPaymentById)

export default router
