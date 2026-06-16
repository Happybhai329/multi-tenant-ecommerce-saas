import api from './axios'

// POST /api/payments/create-intent — create Stripe payment intent
export const createPaymentIntent = (orderId) => {
  return api.post('/payments/create-intent', { orderId })
}

// GET /api/payments/:id — fetch payment details
export const fetchPaymentById = (id) => {
  return api.get(`/payments/${id}`)
}

// POST /api/payments/confirm-mock — confirm mock payment
export const confirmMockPayment = (paymentIntentId, status) => {
  return api.post('/payments/confirm-mock', { paymentIntentId, status })
}
