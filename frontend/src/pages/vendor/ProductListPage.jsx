import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  getVendorProducts,
  removeProduct,
  clearProductError,
  clearSuccessMessage,
} from '../../features/products/productSlice'

function ProductListPage() {
  const { items: products, loading, error, successMessage } = useSelector(
    (state) => state.products
  )
  const dispatch = useDispatch()
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    dispatch(getVendorProducts())
  }, [dispatch])

  // Auto-clear success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearSuccessMessage()), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, dispatch])

  const handleDelete = (id) => {
    dispatch(removeProduct(id))
    setDeleteConfirm(null)
  }

  const getStatusBadge = (status) => {
    if (status === 'published') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-800/50">
          Published
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300 border border-yellow-800/50">
        Draft
      </span>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Products</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage your product catalog
          </p>
        </div>
        <Link
          to="/vendor/products/new"
          className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 px-4 py-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => dispatch(clearProductError())}
            className="text-red-400 hover:text-red-300 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && products.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-400">Loading products...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No products yet</h3>
          <p className="text-gray-400 mb-4">Get started by adding your first product.</p>
          <Link
            to="/vendor/products/new"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Your First Product
          </Link>
        </div>
      )}

      {/* Product Table */}
      {products.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {products.map((product) => {
                  const getImageUrl = (imgs) => {
                    if (!imgs || imgs.length === 0) return null
                    const primary = imgs.find(img => img && typeof img === 'object' && img.isPrimary)
                    if (primary) return primary.url
                    return typeof imgs[0] === 'object' ? imgs[0].url : imgs[0]
                  }
                  const imgUrl = getImageUrl(product.images)

                  return (
                    <tr key={product._id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={product.title}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-800"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{product.title}</p>
                            <p className="text-xs text-gray-500">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        ${product.price?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/vendor/products/${product._id}/edit`}
                            className="px-3 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-800/50 rounded-lg transition-colors"
                          >
                            Edit
                          </Link>
                          {deleteConfirm === product._id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-gray-300 bg-gray-800 rounded-lg transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(product._id)}
                              className="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 rounded-lg transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductListPage
