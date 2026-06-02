import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addProduct, clearProductError, clearSuccessMessage } from '../../features/products/productSlice'
import ImageUploader from '../../components/vendor/ImageUploader'

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

function AddProductPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, successMessage } = useSelector((state) => state.products)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    status: 'draft',
  })
  const [images, setImages] = useState([])
  const [validationErrors, setValidationErrors] = useState({})

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear field validation on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }))
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

    dispatch(
      addProduct({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        price: parseFloat(form.price),
        stock: form.stock ? parseInt(form.stock) : 0,
        status: form.status,
        images,
      })
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Add New Product</h2>
        <p className="text-gray-400 text-sm mt-1">
          Fill in the details below to create a new product.
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

        {/* Image Upload */}
        <ImageUploader images={images} onChange={setImages} />

        {/* Submit Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Creating...' : 'Create Product'}
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

export default AddProductPage
