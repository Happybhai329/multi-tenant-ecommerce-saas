import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { editProduct, getVendorProducts, clearProductError, clearSuccessMessage } from '../../features/products/productSlice'

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Garden',
  'Sports',
  'Toys',
  'Health & Beauty',
  'Automotive',
  'Food & Beverages',
  'Other',
]

function EditProductPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: products, loading, error, successMessage } = useSelector(
    (state) => state.products
  )

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    status: 'draft',
  })
  const [imageUrls, setImageUrls] = useState([''])
  const [validationErrors, setValidationErrors] = useState({})
  const [initialized, setInitialized] = useState(false)

  // Load products if not in state
  useEffect(() => {
    if (products.length === 0) {
      dispatch(getVendorProducts())
    }
  }, [dispatch, products.length])

  // Initialize form with product data
  useEffect(() => {
    if (!initialized && products.length > 0) {
      const product = products.find((p) => p._id === id)
      if (product) {
        setForm({
          title: product.title || '',
          description: product.description || '',
          category: product.category || '',
          price: product.price?.toString() || '',
          stock: product.stock?.toString() || '',
          status: product.status || 'draft',
        })
        setImageUrls(
          product.images && product.images.length > 0
            ? [...product.images]
            : ['']
        )
        setInitialized(true)
      }
    }
  }, [products, id, initialized])

  // Redirect on success
  useEffect(() => {
    if (successMessage) {
      dispatch(clearSuccessMessage())
      navigate('/vendor/products')
    }
  }, [successMessage, navigate, dispatch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearProductError())
    }
  }, [dispatch])

  const product = products.find((p) => p._id === id)

  // Product not found
  if (!loading && products.length > 0 && !product) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg text-sm">
          Product not found. It may have been deleted.
        </div>
        <button
          onClick={() => navigate('/vendor/products')}
          className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          ← Back to Products
        </button>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleImageChange = (index, value) => {
    const updated = [...imageUrls]
    updated[index] = value
    setImageUrls(updated)
  }

  const addImageField = () => {
    setImageUrls([...imageUrls, ''])
  }

  const removeImageField = (index) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index))
    } else {
      setImageUrls([''])
    }
  }

  const validate = () => {
    const errors = {}
    if (!form.title.trim()) errors.title = 'Title is required'
    if (!form.category) errors.category = 'Category is required'
    if (!form.price || parseFloat(form.price) < 0) errors.price = 'Valid price is required'
    if (form.stock !== '' && parseInt(form.stock) < 0) errors.stock = 'Stock cannot be negative'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const images = imageUrls.filter((url) => url.trim() !== '')

    dispatch(
      editProduct({
        id,
        data: {
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          price: parseFloat(form.price),
          stock: form.stock ? parseInt(form.stock) : 0,
          status: form.status,
          images,
        },
      })
    )
  }

  // Loading state while fetching product
  if (!initialized) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="ml-3 text-gray-400">Loading product...</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Edit Product</h2>
        <p className="text-gray-400 text-sm mt-1">
          Update the product details below.
        </p>
      </div>

      {/* API Error */}
      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => dispatch(clearProductError())} className="text-red-400 hover:text-red-300 cursor-pointer">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900 border border-gray-800 rounded-xl p-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-gray-950 border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors ${
              validationErrors.title ? 'border-red-500' : 'border-gray-800'
            }`}
            placeholder="Product title"
          />
          {validationErrors.title && <p className="mt-1 text-xs text-red-500">{validationErrors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors resize-vertical"
            placeholder="Product description"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-gray-950 border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors ${
              validationErrors.category ? 'border-red-500' : 'border-gray-800'
            }`}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {validationErrors.category && <p className="mt-1 text-xs text-red-500">{validationErrors.category}</p>}
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
              Price ($) <span className="text-red-400">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-950 border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors ${
                validationErrors.price ? 'border-red-500' : 'border-gray-800'
              }`}
              placeholder="0.00"
            />
            {validationErrors.price && <p className="mt-1 text-xs text-red-500">{validationErrors.price}</p>}
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-1">
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-950 border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors ${
                validationErrors.stock ? 'border-red-500' : 'border-gray-800'
              }`}
              placeholder="0"
            />
            {validationErrors.stock && <p className="mt-1 text-xs text-red-500">{validationErrors.stock}</p>}
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Image URLs */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Image URLs
          </label>
          <div className="space-y-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="px-2 py-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addImageField}
            className="mt-2 text-sm text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            + Add another image URL
          </button>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/vendor/products')}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProductPage
