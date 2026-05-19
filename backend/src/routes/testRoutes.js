import express from 'express'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// All test routes require authentication
router.use(protect)

// GET /api/test/customer — any authenticated user can access
router.get('/customer', authorize('customer', 'vendor', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome, customer route accessed successfully',
    user: {
      _id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    },
  })
})

// GET /api/test/vendor — only vendors and admins
router.get('/vendor', authorize('vendor', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome, vendor route accessed successfully',
    user: {
      _id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    },
  })
})

// GET /api/test/admin — only admins
router.get('/admin', authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome, admin route accessed successfully',
    user: {
      _id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    },
  })
})

export default router
