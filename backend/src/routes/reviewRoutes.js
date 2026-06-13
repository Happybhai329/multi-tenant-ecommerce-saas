import express from 'express'
import { createReview, getProductReviews, deleteReview } from '../controllers/reviewController.js'
import { protect, authorize } from '../middleware/auth.js'
import { validateReviewCreate } from '../middleware/validate.js'

const router = express.Router()

router.post('/', protect, authorize('customer'), validateReviewCreate, createReview)
router.get('/product/:productId', getProductReviews)
router.delete('/:id', protect, deleteReview)

export default router
