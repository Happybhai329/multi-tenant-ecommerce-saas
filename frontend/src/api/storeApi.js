import api from './axios'

// GET /api/stores/my-store — fetch vendor's own store
export const fetchMyStore = () => {
  return api.get('/stores/my-store')
}

// POST /api/stores — create a new store
export const createStore = (storeData) => {
  return api.post('/stores', storeData)
}

// PATCH /api/stores/my-store — update vendor's store (future use)
export const updateStore = (storeData) => {
  return api.patch('/stores/my-store', storeData)
}
