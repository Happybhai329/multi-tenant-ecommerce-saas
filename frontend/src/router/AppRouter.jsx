import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import CustomerDashboard from '../pages/CustomerDashboard'
import AdminDashboard from '../pages/AdminDashboard'
import ProtectedRoute from '../components/ProtectedRoute'
import NotFound from '../pages/NotFound'

// Vendor dashboard layout & pages
import VendorLayout from '../components/vendor/VendorLayout'
import VendorDashboardHome from '../pages/vendor/VendorDashboardHome'
import ProductListPage from '../pages/vendor/ProductListPage'
import AddProductPage from '../pages/vendor/AddProductPage'
import EditProductPage from '../pages/vendor/EditProductPage'
import VendorOrdersPage from '../pages/vendor/VendorOrdersPage'
import VendorSettingsPage from '../pages/vendor/VendorSettingsPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Vendor Dashboard — nested routes under VendorLayout */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<VendorDashboardHome />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/new" element={<AddProductPage />} />
          <Route path="products/:id/edit" element={<EditProductPage />} />
          <Route path="orders" element={<VendorOrdersPage />} />
          <Route path="settings" element={<VendorSettingsPage />} />
        </Route>

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

