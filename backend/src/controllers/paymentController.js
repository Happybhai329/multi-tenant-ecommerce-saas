import Order from '../models/Order.js'
import Payment from '../models/Payment.js'
import stripe, { isMockStripeMode } from '../config/stripe.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// POST /api/payments/create-intent - Create a Stripe payment intent for an order
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body

  if (!stripe) {
    logger.event('payment.intent.blocked', {
      requestId: req.id,
      userId: req.user._id,
      reason: 'stripe_not_configured',
    })
    res.status(503)
    throw new Error('Payment service is not configured')
  }

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
    logger.event('payment.intent.reused', {
      requestId: req.id,
      userId: req.user._id,
      orderId,
      paymentId: existingPayment._id,
      paymentIntentId: existingPayment.paymentIntentId,
    })

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
    logger.event('payment.intent.failed', {
      requestId: req.id,
      userId: req.user._id,
      orderId,
      reason: stripeErr.message,
    })
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

  logger.event('payment.intent.created', {
    requestId: req.id,
    userId: req.user._id,
    orderId: order._id,
    orderNumber: order.orderNumber,
    paymentId: payment._id,
    paymentIntentId: paymentIntent.id,
    amount: amountInCents,
    currency: 'usd',
  })

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

// GET /api/payments/:id - Get payment details
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

// POST /api/payments/confirm-mock — confirm mock payment status in dev environment
const confirmMockPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, status } = req.body

  if (!isMockStripeMode) {
    logger.event('payment.mock.blocked', {
      requestId: req.id,
      userId: req.user._id,
      reason: 'mock_mode_disabled',
    })
    res.status(403)
    throw new Error('Mock payments are not enabled')
  }

  if (!paymentIntentId) {
    res.status(400)
    throw new Error('Payment Intent ID is required')
  }

  if (!['success', 'failed'].includes(status)) {
    res.status(400)
    throw new Error('Mock payment status must be success or failed')
  }

  const payment = await Payment.findOne({ paymentIntentId })
  if (!payment) {
    res.status(404)
    throw new Error('Payment record not found')
  }

  if (payment.customer.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized to confirm this payment')
  }

  if (status === 'success') {
    payment.status = 'succeeded'
    payment.paidAt = new Date()
    await payment.save()

    const order = await Order.findById(payment.order)
    if (order) {
      order.paymentStatus = 'paid'
      order.orderStatus = 'processing'
      await order.save()
    }
  } else {
    payment.status = 'failed'
    await payment.save()

    const order = await Order.findById(payment.order)
    if (order) {
      order.paymentStatus = 'pending'
      await order.save()
    }
  }

  res.json({
    success: true,
    message: 'Payment simulation updated successfully',
  })
})

export { createPaymentIntent, getPaymentById, confirmMockPayment }
