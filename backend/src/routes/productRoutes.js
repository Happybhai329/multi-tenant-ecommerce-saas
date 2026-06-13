import express from 'express'
import { protect, authorize } from '../middleware/auth.js'
import {
  createProduct,
  getProducts,
  getCategories,
  getProductBySlug,
  updateProduct,
  updateProductStock,
  deleteProduct,
} from '../controllers/productController.js'
import { verifyProductOwner } from '../middleware/ownership.js'
import {
  validateProductCreate,
  validateProductUpdate,
  validateProductStockUpdate,
} from '../middleware/validate.js'

const router = express.Router()

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next()

  try {
    const { default: jwt } = await import('jsonwebtoken')
    const { default: User } = await import('../models/User.js')
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
  } catch {
    // token invalid or expired — continue as unauthenticated
  }
  next()
}

router.post('/', protect, authorize('vendor'), validateProductCreate, createProduct)
router.get('/', optionalAuth, getProducts)
router.get('/categories', getCategories)
router.get('/:slug', optionalAuth, getProductBySlug)
router.patch('/:id', protect, authorize('vendor'), verifyProductOwner, validateProductUpdate, updateProduct)
router.patch('/:id/stock', protect, authorize('vendor'), verifyProductOwner, validateProductStockUpdate, updateProductStock)
router.delete('/:id', protect, authorize('vendor'), verifyProductOwner, deleteProduct)

export default router
