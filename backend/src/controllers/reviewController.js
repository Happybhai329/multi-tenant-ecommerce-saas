import Review from '../models/Review.js'
import Product from '../models/Product.js'
import Store from '../models/Store.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// Helper function to update product rating stats
const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ])

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // round to 1 decimal place
      reviewCount: stats[0].reviewCount
    })
  } else {
    // No reviews left
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      reviewCount: 0
    })
  }
}

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (Customer only)
const createReview = asyncHandler(async (req, res) => {
  const { product: productId, rating, comment } = req.body

  if (req.user.role === 'vendor') {
    res.status(403)
    throw new Error('Vendors cannot review products')
  }

  const product = await Product.findById(productId)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const store = await Store.findById(product.store).select('status')
  if (product.status !== 'published' || store?.status !== 'active') {
    res.status(400)
    throw new Error('This product is not available for review')
  }

  // Check if user already reviewed
  const alreadyReviewed = await Review.findOne({
    customer: req.user._id,
    product: productId
  })

  if (alreadyReviewed) {
    res.status(400)
    throw new Error('You have already reviewed this product')
  }

  const review = await Review.create({
    product: productId,
    customer: req.user._id,
    rating: Number(rating),
    comment
  })

  await updateProductRating(product._id)

  res.status(201).json({
    success: true,
    data: { review }
  })
})

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).select('status store')
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const store = await Store.findById(product.store).select('status')
  if (product.status !== 'published' || store?.status !== 'active') {
    res.status(404)
    throw new Error('Product not found')
  }

  const reviews = await Review.find({ product: req.params.productId })
    .populate('customer', 'name')
    .sort('-createdAt')

  res.json({
    success: true,
    data: { reviews }
  })
})

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    res.status(404)
    throw new Error('Review not found')
  }

  // Check ownership or admin
  if (review.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Not authorized to delete this review')
  }

  const productId = review.product

  await review.deleteOne()

  await updateProductRating(productId)

  res.json({
    success: true,
    data: { message: 'Review removed' }
  })
})

export { createReview, getProductReviews, deleteReview }
