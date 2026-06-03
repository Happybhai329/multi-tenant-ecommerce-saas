import Review from '../models/Review.js'
import Product from '../models/Product.js'

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
export const createReview = async (req, res) => {
  try {
    const { product: productId, rating, comment } = req.body

    if (req.user.role === 'vendor') {
      return res.status(403).json({ success: false, message: 'Vendors cannot review products' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      customer: req.user._id,
      product: productId
    })

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' })
    }

    const review = await Review.create({
      product: productId,
      customer: req.user._id,
      rating: Number(rating),
      comment
    })

    await updateProductRating(product._id)

    res.status(201).json({ success: true, review })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('customer', 'name')
      .sort('-createdAt')

    res.json({ success: true, count: reviews.length, reviews })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    // Check ownership or admin
    if (review.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' })
    }

    const productId = review.product

    await review.deleteOne()

    await updateProductRating(productId)

    res.json({ success: true, message: 'Review removed' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
