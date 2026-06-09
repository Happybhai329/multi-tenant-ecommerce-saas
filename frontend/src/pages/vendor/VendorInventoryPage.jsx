import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getVendorProducts, updateProductStockThunk, clearProductError } from '../../features/products/productSlice'

function VendorInventoryPage() {
  const { items: products, loading, error } = useSelector((state) => state.products)
  const dispatch = useDispatch()
  const [filter, setFilter] = useState('all') // all, in_stock, low_stock, out_of_stock
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    dispatch(getVendorProducts())
  }, [dispatch])

  const handleEditClick = (product) => {
    setEditingId(product._id)
    setEditValue(product.stock.toString())
  }

  const handleSaveStock = async (id) => {
    const stockVal = parseInt(editValue, 10)
    if (!isNaN(stockVal) && stockVal >= 0) {
      await dispatch(updateProductStockThunk({ id, stock: stockVal }))
    }
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const getStockStatusInfo = (product) => {
    const threshold = product.lowStockThreshold || 5
    if (product.stock === 0) return { label: 'Out of Stock', color: 'red' }
    if (product.stock <= threshold) return { label: 'Low Stock', color: 'yellow' }
    return { label: 'In Stock', color: 'emerald' }
  }

  const filteredProducts = products.filter((p) => {
    const statusInfo = getStockStatusInfo(p)
    if (filter === 'all') return true
    if (filter === 'in_stock') return statusInfo.label === 'In Stock'
    if (filter === 'low_stock') return statusInfo.label === 'Low Stock'
    if (filter === 'out_of_stock') return statusInfo.label === 'Out of Stock'
    return true
  })

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
          <p className="text-gray-400 text-sm mt-1">
            Track and update your product stock levels
          </p>
        </div>
      </div>

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

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        {['all', 'in_stock', 'low_stock', 'out_of_stock'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {f === 'all' && 'All Products'}
            {f === 'in_stock' && 'In Stock'}
            {f === 'low_stock' && 'Low Stock'}
            {f === 'out_of_stock' && 'Out of Stock'}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && products.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-400">Loading inventory...</span>
        </div>
      )}

      {/* Product Table */}
      {!loading && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Stock Quantity
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                    Quick Update
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const statusInfo = getStockStatusInfo(product)
                    const isEditing = editingId === product._id

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
                              <p className="text-sm font-medium text-white truncate max-w-[200px]" title={product.title}>
                                {product.title}
                              </p>
                              <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-900/50 text-${statusInfo.color}-400 border border-${statusInfo.color}-800/50`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 px-2 py-1 bg-gray-950 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveStock(product._id)
                                if (e.key === 'Escape') handleCancelEdit()
                              }}
                            />
                          ) : (
                            <span className="text-sm font-medium text-white">
                              {product.stock}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSaveStock(product._id)}
                                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-gray-300 bg-gray-800 rounded-lg transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditClick(product)}
                              className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors cursor-pointer"
                            >
                              Edit Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-400 text-sm">
                      No products found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorInventoryPage
