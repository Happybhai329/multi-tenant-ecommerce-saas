import api from './axios'

// POST /api/orders — create order from cart
export const createOrder = (orderData) => {
  return api.post('/orders', orderData)
}

// GET /api/orders/my-orders — fetch current user's orders
export const fetchMyOrders = () => {
  return api.get('/orders/my-orders')
}

// GET /api/orders/:id — fetch single order by ID
export const fetchOrderById = (id) => {
  return api.get(`/orders/${id}`)
}

// PATCH /api/orders/:id/status — update order status (vendor)
export const updateOrderStatus = (id, orderStatus) => {
  return api.patch(`/orders/${id}/status`, { orderStatus })
}
