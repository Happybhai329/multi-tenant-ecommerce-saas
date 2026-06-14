import express from 'express'
import { protect, optionalAuth, authorize } from '../middleware/auth.js'
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

router.post('/', protect, authorize('vendor'), validateProductCreate, createProduct)
router.get('/', optionalAuth, getProducts)
router.get('/categories', getCategories)
router.get('/:slug', optionalAuth, getProductBySlug)
router.patch('/:id', protect, authorize('vendor'), verifyProductOwner, validateProductUpdate, updateProduct)
router.patch('/:id/stock', protect, authorize('vendor'), verifyProductOwner, validateProductStockUpdate, updateProductStock)
router.delete('/:id', protect, authorize('vendor'), verifyProductOwner, deleteProduct)

export default router
