import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useSelector((state) => state.auth)
  const location = useLocation()

  // 1. If not logged in, redirect to login page and remember where they wanted to go
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. If logged in but role is not authorized, redirect to their correct dashboard
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    if (user?.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />
    }
    if (user?.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  // 3. User is authorized, render child components
  return children
}

export default ProtectedRoute
