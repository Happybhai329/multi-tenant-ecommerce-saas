import api from './axios'

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
