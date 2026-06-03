import api from './axios'

// GET /api/products — fetch all published products (public)
export const fetchPublicProducts = (params = {}) => {
  return api.get('/products', { params })
}

// GET /api/products/:slug — fetch a single product by slug (public)
export const fetchProductBySlug = (slug) => {
  return api.get(`/products/${slug}`)
}

// GET /api/products?mine=true — fetch vendor's own products (all statuses)
export const fetchVendorProducts = () => {
  return api.get('/products', { params: { mine: 'true' } })
}

// POST /api/products — create a new product
export const createProduct = (productData) => {
  return api.post('/products', productData)
}

// PATCH /api/products/:id — update an existing product
export const updateProduct = (id, productData) => {
  return api.patch(`/products/${id}`, productData)
}

// DELETE /api/products/:id — delete a product
export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`)
}

// --- REVIEWS ---

// POST /api/reviews
export const createReview = (reviewData) => {
  return api.post('/reviews', reviewData)
}

// GET /api/reviews/product/:productId
export const getProductReviews = (productId) => {
  return api.get(`/reviews/product/${productId}`)
}

// DELETE /api/reviews/:id
export const deleteReview = (id) => {
  return api.delete(`/reviews/${id}`)
}
