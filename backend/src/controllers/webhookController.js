import stripe from '../config/stripe.js'
import Payment from '../models/Payment.js'
import Order from '../models/Order.js'
import env from '../config/env.js'
import { sendPaymentSuccessEmail } from '../utils/emailService.js'
import logger from '../utils/logger.js'

// POST /api/payments/webhook - Handle Stripe webhook events
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']

  if (!stripe || !env.stripeWebhookSecret) {
    logger.event('payment.webhook.blocked', {
      requestId: req.id,
      reason: !stripe ? 'stripe_not_configured' : 'webhook_secret_missing',
    })
    return res.status(503).json({ error: 'Payment webhook is not configured' })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret)
  } catch (err) {
    logger.event('payment.webhook.signature_failed', {
      requestId: req.id,
      error: err.message,
    })
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object)
        break

      default:
        logger.event('payment.webhook.unhandled', {
          requestId: req.id,
          eventType: event.type,
        })
    }
  } catch (err) {
    logger.event('payment.webhook.processing_failed', {
      requestId: req.id,
      eventType: event.type,
      error: err.message,
    })
    return res.status(200).json({ received: true, error: err.message })
  }

  res.status(200).json({ received: true })
}

async function handlePaymentSuccess(paymentIntent) {
  logger.event('payment.webhook.succeeded', {
    paymentIntentId: paymentIntent.id,
  })

  const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id })

  if (!payment) {
    logger.event('payment.webhook.payment_missing', {
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  if (payment.status === 'succeeded') {
    logger.event('payment.webhook.already_succeeded', {
      paymentIntentId: paymentIntent.id,
      paymentId: payment._id,
    })
    return
  }

  payment.status = 'succeeded'
  payment.paidAt = new Date()
  await payment.save()

  const order = await Order.findById(payment.order).populate('customer', 'name email')
  if (order) {
    order.paymentStatus = 'paid'
    order.orderStatus = 'processing'
    await order.save()

    logger.event('payment.order.updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentId: payment._id,
      status: 'paid',
    })

    if (order.customer && order.customer.email) {
      sendPaymentSuccessEmail(order.customer.email, payment.amount / 100, order.orderNumber)
        .catch((err) => logger.warn('Failed to send payment success email', {
          orderId: order._id,
          error: err.message,
        }))
    }
  }
}

async function handlePaymentFailure(paymentIntent) {
  logger.event('payment.webhook.failed', {
    paymentIntentId: paymentIntent.id,
  })

  const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id })

  if (!payment) {
    logger.event('payment.webhook.payment_missing', {
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  if (payment.status === 'failed') {
    logger.event('payment.webhook.already_failed', {
      paymentIntentId: paymentIntent.id,
      paymentId: payment._id,
    })
    return
  }

  payment.status = 'failed'
  await payment.save()

  const order = await Order.findById(payment.order)
  if (order) {
    order.paymentStatus = 'pending'
    await order.save()

    logger.event('payment.order.payment_failed', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentId: payment._id,
    })
  }
}

export { handleWebhook }
