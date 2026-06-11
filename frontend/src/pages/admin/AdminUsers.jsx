import { useState, useEffect } from 'react'
import { getUsers, updateUserStatus } from '../../api/adminApi'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const fetchUsersList = async () => {
    try {
      setLoading(true)
      const response = await getUsers({
        search: searchTerm,
        role: roleFilter,
      })
      if (response.data.success) {
        setUsers(response.data.users)
      } else {
        setError(response.data.message || 'Failed to load users')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching user lists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsersList()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, roleFilter])

  const handleToggleStatus = async (userId, currentStatus, role) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
    let confirmMsg = `Are you sure you want to set this user to ${nextStatus.toUpperCase()}?`
    if (role === 'vendor') {
      confirmMsg += ' Note: Suspending a vendor will also suspend their store and hide their products from public view.'
    }
    if (!window.confirm(confirmMsg)) return

    try {
      const response = await updateUserStatus(userId, nextStatus)
      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, status: nextStatus } : user
          )
        )
      } else {
        alert(response.data.message || 'Failed to update user status')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">User Accounts</h2>
        <p className="text-gray-400 text-sm">Oversee all customer, vendor, and administrative accounts on the platform.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-950 border border-gray-800 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Dropdown */}
        <div className="w-full sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Main User List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 bg-red-950/10">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-950 text-gray-400 text-xs uppercase border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">User Info</th>
                  <th className="px-6 py-4 font-semibold text-center">Role</th>
                  <th className="px-6 py-4 font-semibold">Joined Date</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      No users matched your query.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-850/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-base">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${
                            u.role === 'admin'
                              ? 'bg-purple-950/40 text-purple-400 border border-purple-500/20'
                              : u.role === 'vendor'
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                              : 'bg-blue-950/40 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            u.status === 'suspended'
                              ? 'bg-red-950/40 text-red-400 border-red-500/20'
                              : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            u.status === 'suspended' ? 'bg-red-450 animate-pulse' : 'bg-emerald-400'
                          }`}></span>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role === 'admin' ? (
                          <span className="text-xs text-gray-500 italic px-3">System Admin</span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(u._id, u.status, u.role)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              u.status === 'suspended'
                                ? 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-555/20'
                                : 'bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-555/20'
                            }`}
                          >
                            {u.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
