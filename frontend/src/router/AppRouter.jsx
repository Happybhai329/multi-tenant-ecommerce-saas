import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Layouts
import PublicLayout from '../components/PublicLayout'
import VendorLayout from '../components/vendor/VendorLayout'

// Auth & Shared
import ProtectedRoute from '../components/ProtectedRoute'
import NotFound from '../pages/NotFound'

// Public pages
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'

// Storefront pages
import StoreListPage from '../pages/storefront/StoreListPage'
import StorePage from '../pages/storefront/StorePage'
import ProductListPage from '../pages/storefront/ProductListPage'
import ProductPage from '../pages/storefront/ProductPage'

// Dashboard pages
import CustomerDashboard from '../pages/CustomerDashboard'
import AdminDashboard from '../pages/AdminDashboard'

// Vendor dashboard pages
import VendorDashboardHome from '../pages/vendor/VendorDashboardHome'
import VendorProductListPage from '../pages/vendor/ProductListPage'
import AddProductPage from '../pages/vendor/AddProductPage'
import EditProductPage from '../pages/vendor/EditProductPage'
import VendorOrdersPage from '../pages/vendor/VendorOrdersPage'
import VendorSettingsPage from '../pages/vendor/VendorSettingsPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public pages (with shared Navbar + Footer) ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Storefront */}
          <Route path="/stores" element={<StoreListPage />} />
          <Route path="/stores/:slug" element={<StorePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
        </Route>

        {/* ── Customer Dashboard ── */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Vendor Dashboard (nested under VendorLayout) ── */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<VendorDashboardHome />} />
          <Route path="products" element={<VendorProductListPage />} />
          <Route path="products/new" element={<AddProductPage />} />
          <Route path="products/:id/edit" element={<EditProductPage />} />
          <Route path="orders" element={<VendorOrdersPage />} />
          <Route path="settings" element={<VendorSettingsPage />} />
        </Route>

        {/* ── Admin Dashboard ── */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Catch-all ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
