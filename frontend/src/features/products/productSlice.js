import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../api/productApi'

// Async thunks
export const getVendorProducts = createAsyncThunk(
  'products/getVendorProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchVendorProducts()
      return response.data.products
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch products'
      )
    }
  }
)

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await createProduct(productData)
      return response.data.product
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to create product'
      )
    }
  }
)

export const editProduct = createAsyncThunk(
  'products/editProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateProduct(id, data)
      return response.data.product
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update product'
      )
    }
  }
)

export const removeProduct = createAsyncThunk(
  'products/removeProduct',
  async (id, { rejectWithValue }) => {
    try {
      await deleteProduct(id)
      return id
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete product'
      )
    }
  }
)

const initialState = {
  items: [],
  loading: false,
  error: null,
  successMessage: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(getVendorProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getVendorProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(getVendorProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add product
      .addCase(addProduct.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
        state.successMessage = 'Product created successfully'
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Edit product
      .addCase(editProduct.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        )
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.successMessage = 'Product updated successfully'
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Remove product
      .addCase(removeProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((item) => item._id !== action.payload)
        state.successMessage = 'Product deleted successfully'
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearProductError, clearSuccessMessage } = productSlice.actions
export default productSlice.reducer
