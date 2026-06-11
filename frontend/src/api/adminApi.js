import api from './axios'

// GET /api/admin/dashboard — fetch super admin platform metrics and data
export const getAdminDashboard = () => {
  return api.get('/admin/dashboard')
}

// GET /api/admin/vendors — fetch vendors with optional search and status filter
export const getVendors = (params = {}) => {
  return api.get('/admin/vendors', { params })
}

// PATCH /api/admin/vendors/:id/status — suspend or activate vendor
export const updateVendorStatus = (id, status) => {
  return api.patch(`/admin/vendors/${id}/status`, { status })
}

// GET /api/admin/stores — fetch stores with optional search and status filter
export const getStores = (params = {}) => {
  return api.get('/admin/stores', { params })
}

// PATCH /api/admin/stores/:id/status — suspend or activate store
export const updateStoreStatus = (id, status) => {
  return api.patch(`/admin/stores/${id}/status`, { status })
}

// GET /api/admin/users — fetch users with optional search and role filter
export const getUsers = (params = {}) => {
  return api.get('/admin/users', { params })
}

// PATCH /api/admin/users/:id/status — suspend or activate general user (and store if vendor)
export const updateUserStatus = (id, status) => {
  return api.patch(`/admin/users/${id}/status`, { status })
}
