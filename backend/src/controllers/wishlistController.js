import Wishlist from '../models/Wishlist.js'
import Product from '../models/Product.js'

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ customer: req.user._id }).populate({
      path: 'products',
      select: 'title price comparePrice images slug category averageRating reviewCount stock store',
      populate: {
        path: 'store',
        select: 'name slug',
      },
    })

    if (!wishlist) {
      // Create empty wishlist if it doesn't exist
      wishlist = await Wishlist.create({ customer: req.user._id, products: [] })
    }

    // Filter out products that might have been deleted from the database
    wishlist.products = wishlist.products.filter((p) => p != null)

    res.json(wishlist)
  } catch (error) {
    next(error)
  }
}

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params

    // Verify product exists
    const product = await Product.findById(productId)
    if (!product) {
      res.status(404)
      throw new Error('Product not found')
    }

    let wishlist = await Wishlist.findOne({ customer: req.user._id })

    if (!wishlist) {
      wishlist = await Wishlist.create({
        customer: req.user._id,
        products: [productId],
      })
    } else {
      // Check if product already in wishlist
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId)
        await wishlist.save()
      }
    }

    // Repopulate for frontend response
    await wishlist.populate({
      path: 'products',
      select: 'title price comparePrice images slug category averageRating reviewCount stock store',
      populate: {
        path: 'store',
        select: 'name slug',
      },
    })

    res.status(201).json(wishlist)
  } catch (error) {
    next(error)
  }
}

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params

    let wishlist = await Wishlist.findOne({ customer: req.user._id })

    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId.toString()
      )
      await wishlist.save()

      // Repopulate for frontend response
      await wishlist.populate({
        path: 'products',
        select: 'title price comparePrice images slug category averageRating reviewCount stock store',
        populate: {
          path: 'store',
          select: 'name slug',
        },
      })
    }

    res.json(wishlist)
  } catch (error) {
    next(error)
  }
}
