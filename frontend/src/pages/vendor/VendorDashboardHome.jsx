import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getVendorProducts } from '../../features/products/productSlice'

function VendorDashboardHome() {
  const { user } = useSelector((state) => state.auth)
  const { items: products, loading } = useSelector((state) => state.products)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getVendorProducts())
  }, [dispatch])

  const publishedCount = products.filter((p) => p.status === 'published').length
  const draftCount = products.filter((p) => p.status === 'draft').length
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)

  const stats = [
    {
      label: 'Total Products',
      value: loading ? '...' : products.length,
      color: 'text-blue-400',
      bg: 'bg-blue-600/20 border-blue-500/30',
    },
    {
      label: 'Published',
      value: loading ? '...' : publishedCount,
      color: 'text-emerald-400',
      bg: 'bg-emerald-600/20 border-emerald-500/30',
    },
    {
      label: 'Drafts',
      value: loading ? '...' : draftCount,
      color: 'text-yellow-400',
      bg: 'bg-yellow-600/20 border-yellow-500/30',
    },
    {
      label: 'Total Stock',
      value: loading ? '...' : totalStock,
      color: 'text-purple-400',
      bg: 'bg-purple-600/20 border-purple-500/30',
    },
  ]

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-400 mt-1">
          Here's an overview of your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} border rounded-xl p-5`}
          >
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/vendor/products/new"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add New Product
          </Link>
          <Link
            to="/vendor/products"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboardHome
