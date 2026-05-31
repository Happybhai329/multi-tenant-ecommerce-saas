import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠ STRIPE_SECRET_KEY is not set in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
})

export default stripe
