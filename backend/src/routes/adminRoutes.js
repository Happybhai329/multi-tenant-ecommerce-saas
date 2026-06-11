import express from 'express'
import {
  getAdminDashboard,
  getVendors,
  updateVendorStatus,
  getStores,
  updateStoreStatus,
  getUsers,
  updateUserStatus,
} from '../controllers/adminController.js'

const router = express.Router()

// Admin dashboard overview
router.get('/dashboard', getAdminDashboard)

// Vendor management
router.get('/vendors', getVendors)
router.patch('/vendors/:id/status', updateVendorStatus)

// Store management
router.get('/stores', getStores)
router.patch('/stores/:id/status', updateStoreStatus)

// User management
router.get('/users', getUsers)
router.patch('/users/:id/status', updateUserStatus)

export default router
