import Wishlist from '../models/Wishlist.js'
import Product from '../models/Product.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const wishlistProductSelect = 'title price comparePrice images slug category averageRating reviewCount stock store status'
const wishlistStoreSelect = 'name slug status'

const populateWishlistProducts = (wishlist) => wishlist.populate({
  path: 'products',
  select: wishlistProductSelect,
  populate: {
    path: 'store',
    select: wishlistStoreSelect,
  },
})

const isVisibleProduct = (product) => (
  product?.status === 'published' && product.store?.status === 'active'
)

const buildWishlistResponse = async (wishlist) => {
  await populateWishlistProducts(wishlist)

  const data = wishlist.toObject()
  data.products = data.products
    .filter(isVisibleProduct)
    .map((product) => {
      const visibleProduct = { ...product }
      delete visibleProduct.status
      if (visibleProduct.store) {
        visibleProduct.store = { ...visibleProduct.store }
        delete visibleProduct.store.status
      }
      return visibleProduct
    })

  return data
}

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ customer: req.user._id })

  if (!wishlist) {
    // Create empty wishlist if it doesn't exist
    wishlist = await Wishlist.create({ customer: req.user._id, products: [] })
  }

  res.json({
    success: true,
    data: await buildWishlistResponse(wishlist),
  })
})

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params

  // Verify product exists
  const product = await Product.findById(productId).populate('store', 'status')
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  if (product.status !== 'published' || product.store?.status !== 'active') {
    res.status(400)
    throw new Error('Product is not available for wishlist')
  }

  let wishlist = await Wishlist.findOne({ customer: req.user._id })

  if (!wishlist) {
    wishlist = await Wishlist.create({
      customer: req.user._id,
      products: [productId],
    })
  } else {
    // Check if product already in wishlist
    if (!wishlist.products.some((id) => id.toString() === productId.toString())) {
      wishlist.products.push(productId)
      await wishlist.save()
    }
  }

  res.status(201).json({
    success: true,
    data: await buildWishlistResponse(wishlist),
  })
})

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params

  let wishlist = await Wishlist.findOne({ customer: req.user._id })

  if (wishlist) {
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId.toString()
    )
    await wishlist.save()
  }

  res.json({
    success: true,
    data: wishlist ? await buildWishlistResponse(wishlist) : null,
  })
})

export { getWishlist, addToWishlist, removeFromWishlist }
