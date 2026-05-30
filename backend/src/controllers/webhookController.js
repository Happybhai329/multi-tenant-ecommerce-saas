import stripe from '../config/stripe.js'
import Payment from '../models/Payment.js'
import Order from '../models/Order.js'

// POST /api/payments/webhook — Handle Stripe webhook events
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is not configured')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  let event

  try {
    // Verify the webhook signature using the raw body
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // ── Handle relevant event types ──
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object)
        break

      default:
        // Unhandled event type — acknowledge but ignore
        console.log(`ℹ Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`❌ Error processing webhook event ${event.type}:`, err.message)
    // Still return 200 so Stripe doesn't retry — we logged the error
    return res.status(200).json({ received: true, error: err.message })
  }

  // Acknowledge receipt to Stripe
  res.status(200).json({ received: true })
}

// ── Payment Success Handler ──
async function handlePaymentSuccess(paymentIntent) {
  console.log(`✅ Payment succeeded: ${paymentIntent.id}`)

  // Find our payment record by Stripe payment intent ID
  const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id })

  if (!payment) {
    console.warn(`⚠ No payment record found for intent: ${paymentIntent.id}`)
    return
  }

  // Skip if already processed
  if (payment.status === 'succeeded') {
    console.log(`ℹ Payment ${paymentIntent.id} already marked as succeeded`)
    return
  }

  // Update payment status
  payment.status = 'succeeded'
  payment.paidAt = new Date()
  await payment.save()

  // Update the associated order
  const order = await Order.findById(payment.order)
  if (order) {
    order.paymentStatus = 'paid'
    order.orderStatus = 'processing'
    await order.save()
    console.log(`✅ Order ${order.orderNumber} updated: paid + processing`)
  }
}

// ── Payment Failure Handler ──
async function handlePaymentFailure(paymentIntent) {
  console.log(`❌ Payment failed: ${paymentIntent.id}`)

  const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id })

  if (!payment) {
    console.warn(`⚠ No payment record found for intent: ${paymentIntent.id}`)
    return
  }

  // Skip if already processed
  if (payment.status === 'failed') {
    console.log(`ℹ Payment ${paymentIntent.id} already marked as failed`)
    return
  }

  // Update payment status
  payment.status = 'failed'
  await payment.save()

  // Keep order paymentStatus as pending (customer can retry)
  const order = await Order.findById(payment.order)
  if (order) {
    order.paymentStatus = 'pending'
    await order.save()
    console.log(`ℹ Order ${order.orderNumber} payment status remains pending`)
  }
}

export { handleWebhook }
