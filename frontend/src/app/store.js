import { configureStore } from '@reduxjs/toolkit'
import { createListenerMiddleware } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import productReducer from '../features/products/productSlice'
import cartReducer from '../features/cart/cartSlice'

// ── Persist cart to localStorage on every change ──
const cartPersistListener = createListenerMiddleware()

cartPersistListener.startListening({
  predicate: (action) => action.type.startsWith('cart/'),
  effect: (_action, listenerApi) => {
    const cartItems = listenerApi.getState().cart.items
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    } catch (err) {
      console.error('Failed to persist cart:', err)
    }
  },
})

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(cartPersistListener.middleware),
})

export default store
