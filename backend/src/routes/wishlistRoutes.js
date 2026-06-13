import express from 'express'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// All wishlist routes require authentication and customer role
router.use(protect, authorize('customer'))

router.route('/')
  .get(getWishlist)

router.route('/:productId')
  .post(addToWishlist)
  .delete(removeFromWishlist)

export default router
