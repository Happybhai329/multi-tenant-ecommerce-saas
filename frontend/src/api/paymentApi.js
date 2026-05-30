import api from './axios'

// POST /api/payments/create-intent — create Stripe payment intent
export const createPaymentIntent = (orderId) => {
  return api.post('/payments/create-intent', { orderId })
}

// GET /api/payments/:id — fetch payment details
export const fetchPaymentById = (id) => {
  return api.get(`/payments/${id}`)
}
