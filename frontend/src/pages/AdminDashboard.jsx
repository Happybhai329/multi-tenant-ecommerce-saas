import { useState, useEffect } from 'react'
import { getAdminDashboard } from '../api/adminApi'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentRegistrations, setRecentRegistrations] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [recentStores, setRecentStores] = useState([])
  const [recentVendors, setRecentVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await getAdminDashboard()
        if (response.data.success) {
          setStats(response.data.statistics)
          setRecentRegistrations(response.data.recentRegistrations)
          setRecentOrders(response.data.recentOrders)
          setRecentStores(response.data.recentStores)
          setRecentVendors(response.data.recentVendors)
        } else {
          setError(response.data.message || 'Failed to load dashboard data')
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching dashboard metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl max-w-2xl mx-auto my-6 text-center">
        <h3 className="font-semibold text-lg mb-1">Error Loading Dashboard</h3>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Platform Overview</h2>
        <p className="text-gray-400 text-sm">Real-time metrics, tenant updates, and store registrations.</p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Revenue */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl hover:border-purple-500/30 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-1 text-white group-hover:text-purple-400 transition-colors">
                ${stats?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </h3>
            </div>
            <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl border border-purple-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl hover:border-blue-500/30 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Total Orders</p>
              <h3 className="text-3xl font-bold mt-1 text-white group-hover:text-blue-400 transition-colors">
                {stats?.totalOrders || 0}
              </h3>
            </div>
            <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Stores */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl hover:border-emerald-500/30 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Total Stores</p>
              <h3 className="text-3xl font-bold mt-1 text-white group-hover:text-emerald-400 transition-colors">
                {stats?.totalStores || 0}
              </h3>
            </div>
            <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 4: Products */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/30 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Total Products</p>
              <h3 className="text-3xl font-bold mt-1 text-white group-hover:text-amber-400 transition-colors">
                {stats?.totalProducts || 0}
              </h3>
            </div>
            <div className="p-3 bg-amber-600/10 text-amber-400 rounded-xl border border-amber-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Minor Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">Total Registered Users</span>
          <span className="text-xl font-bold text-white bg-gray-800 px-3 py-1 rounded-lg border border-gray-750">
            {stats?.totalUsers || 0}
          </span>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">Total Vendors</span>
          <span className="text-xl font-bold text-purple-400 bg-gray-800 px-3 py-1 rounded-lg border border-gray-750">
            {stats?.totalVendors || 0}
          </span>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">Total Customers</span>
          <span className="text-xl font-bold text-blue-400 bg-gray-800 px-3 py-1 rounded-lg border border-gray-750">
            {stats?.totalCustomers || 0}
          </span>
        </div>
      </div>

      {/* Moderation Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="text-sm text-emerald-400 font-medium">Active Stores</span>
          <span className="text-xl font-bold text-emerald-400">
            {stats?.activeStores || 0}
          </span>
        </div>
        <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="text-sm text-red-400 font-medium">Suspended Stores</span>
          <span className="text-xl font-bold text-red-400">
            {stats?.suspendedStores || 0}
          </span>
        </div>
        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="text-sm text-emerald-400 font-medium">Active Vendors</span>
          <span className="text-xl font-bold text-emerald-400">
            {stats?.activeVendors || 0}
          </span>
        </div>
        <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="text-sm text-red-400 font-medium">Suspended Vendors</span>
          <span className="text-xl font-bold text-red-400">
            {stats?.suspendedVendors || 0}
          </span>
        </div>
      </div>

      {/* Split section: Recent Orders & Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Recent Orders</h3>
            <span className="text-xs text-gray-400">Latest 5 sales</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-950 text-gray-400 text-xs uppercase border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order Number</th>
                  <th className="px-4 py-3 font-semibold">Store</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-500">No orders found on the platform yet.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-850/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-white truncate max-w-[150px]">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[120px]">
                        {order.store?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                            : order.orderStatus === 'pending'
                            ? 'bg-amber-950/40 text-amber-400 border-amber-500/20'
                            : 'bg-blue-950/40 text-blue-400 border-blue-500/20'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Recent Registrations</h3>
            <span className="text-xs text-gray-400">Latest 5 users</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-950 text-gray-400 text-xs uppercase border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-500">No users found.</td>
                  </tr>
                ) : (
                  recentRegistrations.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-850/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-950/40 text-purple-400 border border-purple-500/20'
                            : u.role === 'vendor'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                            : 'bg-blue-950/40 text-blue-400 border border-blue-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          u.status === 'suspended'
                            ? 'bg-red-950/40 text-red-400 border-red-500/20'
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Split section: Recent Stores & Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Stores */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Recent Stores</h3>
            <span className="text-xs text-gray-400">Latest 5 creations</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-950 text-gray-400 text-xs uppercase border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Store</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {!recentStores || recentStores.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-gray-500">No stores found.</td>
                  </tr>
                ) : (
                  recentStores.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-850/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white truncate max-w-[150px]">{s.name}</div>
                        <div className="text-xs text-gray-500">/{s.slug}</div>
                      </td>
                      <td className="px-4 py-3 truncate max-w-[120px]">
                        {s.owner?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          s.status === 'suspended'
                            ? 'bg-red-950/40 text-red-400 border-red-500/20'
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {s.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Vendors */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Recent Vendor Activity</h3>
            <span className="text-xs text-gray-400">Latest 5 vendors</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-950 text-gray-400 text-xs uppercase border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vendor</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {!recentVendors || recentVendors.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-gray-500">No vendors found.</td>
                  </tr>
                ) : (
                  recentVendors.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-850/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white truncate max-w-[150px]">{u.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          u.status === 'suspended'
                            ? 'bg-red-950/40 text-red-400 border-red-500/20'
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
