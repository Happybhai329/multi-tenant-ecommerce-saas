import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../../api/wishlistApi'

export const getWishlist = createAsyncThunk(
  'wishlist/getWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWishlist()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist')
    }
  }
)

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiAddToWishlist(productId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist')
    }
  }
)

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiRemoveFromWishlist(productId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist')
    }
  }
)

const initialState = {
  items: [], // Array of product objects
  loading: false,
  error: null,
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Wishlist
      .addCase(getWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload?.products || []
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add to Wishlist
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items = action.payload?.products || []
      })
      // Remove from Wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = action.payload?.products || []
      })
  },
})

export const { clearWishlist } = wishlistSlice.actions

export const selectWishlistItems = (state) => state.wishlist.items
export const selectWishlistLoading = (state) => state.wishlist.loading
export const selectWishlistError = (state) => state.wishlist.error

// Helper selector to check if a product is in wishlist
export const selectIsInWishlist = (state, productId) => {
  return state.wishlist.items.some(
    (item) => (typeof item === 'object' ? item._id === productId : item === productId)
  )
}

export default wishlistSlice.reducer
