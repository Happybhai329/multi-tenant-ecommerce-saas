import { createSlice } from '@reduxjs/toolkit'

// ── Load persisted cart from localStorage ──
let persistedItems = []
try {
  const stored = localStorage.getItem('cart')
  if (stored) {
    persistedItems = JSON.parse(stored)
  }
} catch (err) {
  console.error('Error loading cart from localStorage:', err)
  localStorage.removeItem('cart')
}

const initialState = {
  items: persistedItems,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: {
      reducer(state, action) {
        const { product, quantity } = action.payload
        const existing = state.items.find((item) => item._id === product._id)

        if (existing) {
          // Increment quantity, cap at stock
          existing.quantity = Math.min(
            existing.quantity + quantity,
            product.stock
          )
        } else {
          state.items.push({
            _id: product._id,
            title: product.title,
            slug: product.slug,
            price: product.price,
            comparePrice: product.comparePrice || null,
            image:
              product.images && product.images.length > 0
                ? product.images[0]
                : null,
            stock: product.stock,
            store: product.store
              ? { _id: product.store._id, name: product.store.name, slug: product.store.slug }
              : null,
            quantity,
          })
        }
      },
      prepare(product, quantity = 1) {
        return { payload: { product, quantity } }
      },
    },

    removeFromCart(state, action) {
      const productId = action.payload
      state.items = state.items.filter((item) => item._id !== productId)
    },

    updateQuantity(state, action) {
      const { productId, quantity } = action.payload
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item._id !== productId)
        return
      }
      const item = state.items.find((item) => item._id === productId)
      if (item) {
        item.quantity = Math.min(quantity, item.stock)
      }
    },

    clearCart(state) {
      state.items = []
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions

// ── Selectors ──
export const selectCartItems = (state) => state.cart.items

export const selectCartTotalItems = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export const selectCartTotalPrice = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

export default cartSlice.reducer
