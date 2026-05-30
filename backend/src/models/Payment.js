import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1 cent'],
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true,
      trim: true,
    },
    paymentIntentId: {
      type: String,
      required: [true, 'Payment intent ID is required'],
      unique: true,
    },
    clientSecret: {
      type: String,
      required: [true, 'Client secret is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

paymentSchema.index({ order: 1 })
paymentSchema.index({ paymentIntentId: 1 }, { unique: true })
paymentSchema.index({ customer: 1, createdAt: -1 })

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment
