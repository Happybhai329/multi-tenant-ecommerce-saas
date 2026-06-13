import Order from '../models/Order.js'
import Payment from '../models/Payment.js'
import stripe from '../config/stripe.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// POST /api/payments/create-intent — Create a Stripe payment intent for an order
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body

  if (!orderId) {
    res.status(400)
    throw new Error('Order ID is required')
  }

  const order = await Order.findById(orderId)
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized to pay for this order')
  }

  if (order.paymentStatus === 'paid') {
    res.status(400)
    throw new Error('This order has already been paid')
  }

  const existingPayment = await Payment.findOne({ order: orderId, status: 'pending' })
  if (existingPayment) {
    return res.json({
      success: true,
      data: {
        message: 'Existing payment intent found',
        clientSecret: existingPayment.clientSecret,
        paymentId: existingPayment._id,
        paymentIntentId: existingPayment.paymentIntentId,
      },
    })
  }

  const amountInCents = Math.round(order.totalAmount * 100)

  if (amountInCents < 50) {
    res.status(400)
    throw new Error('Order amount is too small. Minimum charge is $0.50')
  }

  let paymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: req.user._id.toString(),
      },
    })
  } catch (stripeErr) {
    res.status(400)
    throw new Error(`Payment error: ${stripeErr.message}`)
  }

  const payment = await Payment.create({
    order: order._id,
    customer: req.user._id,
    amount: amountInCents,
    currency: 'usd',
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: 'pending',
  })

  order.payment = payment._id
  await order.save()

  res.status(201).json({
    success: true,
    data: {
      message: 'Payment intent created successfully',
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      paymentIntentId: paymentIntent.id,
    },
  })
})

// GET /api/payments/:id — Get payment details
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate({
      path: 'order',
      select: 'orderNumber items totalAmount subtotal orderStatus paymentStatus shippingAddress',
    })
    .populate('customer', 'name email')

  if (!payment) {
    res.status(404)
    throw new Error('Payment not found')
  }

  const isOwner = payment.customer._id.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    res.status(403)
    throw new Error('Not authorized to view this payment')
  }

  res.json({
    success: true,
    data: { payment },
  })
})

export { createPaymentIntent, getPaymentById }
