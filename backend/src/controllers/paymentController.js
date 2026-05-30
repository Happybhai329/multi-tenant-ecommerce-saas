import Order from '../models/Order.js'
import Payment from '../models/Payment.js'
import stripe from '../config/stripe.js'

// POST /api/payments/create-intent — Create a Stripe payment intent for an order
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body

    // ── Validate request ──
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' })
    }

    // ── Find the order ──
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    // ── Validate ownership ──
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this order' })
    }

    // ── Check if order already has a successful payment ──
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'This order has already been paid' })
    }

    // ── Check for existing pending payment ──
    const existingPayment = await Payment.findOne({ order: orderId, status: 'pending' })
    if (existingPayment) {
      // Return the existing payment intent instead of creating a new one
      return res.json({
        success: true,
        message: 'Existing payment intent found',
        clientSecret: existingPayment.clientSecret,
        paymentId: existingPayment._id,
        paymentIntentId: existingPayment.paymentIntentId,
      })
    }

    // ── Convert totalAmount to cents (Stripe expects integer cents) ──
    const amountInCents = Math.round(order.totalAmount * 100)

    if (amountInCents < 50) {
      return res.status(400).json({
        success: false,
        message: 'Order amount is too small. Minimum charge is $0.50',
      })
    }

    // ── Create Stripe payment intent ──
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: req.user._id.toString(),
      },
    })

    // ── Save payment record ──
    const payment = await Payment.create({
      order: order._id,
      customer: req.user._id,
      amount: amountInCents,
      currency: 'usd',
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: 'pending',
    })

    // ── Link payment to order ──
    order.payment = payment._id
    await order.save()

    res.status(201).json({
      success: true,
      message: 'Payment intent created successfully',
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      paymentIntentId: paymentIntent.id,
    })
  } catch (err) {
    // Handle Stripe-specific errors
    if (err.type && err.type.startsWith('Stripe')) {
      return res.status(400).json({
        success: false,
        message: `Payment error: ${err.message}`,
      })
    }
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/payments/:id — Get payment details
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'order',
        select: 'orderNumber items totalAmount subtotal orderStatus paymentStatus shippingAddress',
      })
      .populate('customer', 'name email')

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' })
    }

    // ── Validate ownership — only the customer or admin can view ──
    const isOwner = payment.customer._id.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this payment' })
    }

    res.json({ success: true, payment })
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Payment not found' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

export { createPaymentIntent, getPaymentById }
