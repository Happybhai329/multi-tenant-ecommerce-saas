import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { editProduct, getVendorProducts, clearProductError, clearSuccessMessage } from '../../features/products/productSlice'
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

const getInitialForm = (product) => ({
  title: product.title || '',
  description: product.description || '',
  category: product.category || '',
  price: product.price?.toString() || '',
  stock: product.stock?.toString() || '',
  status: product.status || 'draft',
})

const getInitialImages = (product) => {
  if (!product.images || product.images.length === 0) return []

  return product.images
    .filter((img) => img && (typeof img === 'object' ? img.url : img))
    .map((img, index) => {
      if (typeof img === 'object' && img.url) {
        return {
          url: img.url,
          publicId: img.publicId || `legacy-${index}`,
          isPrimary: img.isPrimary === true,
        }
      }

      return {
        url: img,
        publicId: `legacy-${index}`,
        isPrimary: index === 0,
      }
    })
}

function ProductLoadingState() {
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

function EditProductPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: products, loading, error, successMessage } = useSelector(
    (state) => state.products
  )

  useEffect(() => {
    if (products.length === 0) {
      dispatch(getVendorProducts())
    }
  }, [dispatch, products.length])

  useEffect(() => {
    if (successMessage) {
      dispatch(clearSuccessMessage())
      navigate('/vendor/products')
    }
  }, [successMessage, navigate, dispatch])

  useEffect(() => {
    return () => {
      dispatch(clearProductError())
    }
  }, [dispatch])

  const product = products.find((p) => p._id === id)

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
          Back to Products
        </button>
      </div>
    )
  }

  if (!product) {
    return <ProductLoadingState />
  }

  return <EditProductForm key={product._id} product={product} loading={loading} error={error} />
}

function EditProductForm({ product, loading, error }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState(() => getInitialForm(product))
  const [images, setImages] = useState(() => getInitialImages(product))
  const [validationErrors, setValidationErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
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
      editProduct({
        id: product._id,
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

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Edit Product</h2>
        <p className="text-gray-400 text-sm mt-1">
          Update the product details below.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => dispatch(clearProductError())} className="text-red-400 hover:text-red-300 cursor-pointer">x</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900 border border-gray-800 rounded-xl p-6">
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

        <ImageUploader images={images} onChange={setImages} />

        <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-emerald-200/50 border-t-white animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
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
