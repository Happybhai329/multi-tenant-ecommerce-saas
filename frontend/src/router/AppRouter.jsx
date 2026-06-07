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
import WishlistPage from '../pages/storefront/WishlistPage'

// Cart pages
import CartPage from '../pages/cart/CartPage'
import CheckoutPage from '../pages/cart/CheckoutPage'

// Order pages
import OrdersPage from '../pages/orders/OrdersPage'
import OrderDetailPage from '../pages/orders/OrderDetailPage'
import PaymentPage from '../pages/orders/PaymentPage'
import PaymentSuccessPage from '../pages/orders/PaymentSuccessPage'
import PaymentFailedPage from '../pages/orders/PaymentFailedPage'

// Dashboard pages
import CustomerDashboard from '../pages/CustomerDashboard'
import AdminDashboard from '../pages/AdminDashboard'

// Vendor dashboard pages
import VendorDashboardHome from '../pages/vendor/VendorDashboardHome'
import VendorProductListPage from '../pages/vendor/ProductListPage'
import AddProductPage from '../pages/vendor/AddProductPage'
import EditProductPage from '../pages/vendor/EditProductPage'
import VendorOrdersPage from '../pages/vendor/VendorOrdersPage'
import VendorOrderDetailPage from '../pages/vendor/VendorOrderDetailPage'
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
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          {/* Cart */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Customer Orders */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
            <Route
            path="/orders/:id"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id/pay"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/success"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PaymentSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/failed"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PaymentFailedPage />
              </ProtectedRoute>
            }
          />
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
          <Route path="orders/:id" element={<VendorOrderDetailPage />} />
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
