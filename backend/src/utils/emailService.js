import nodemailer from 'nodemailer'

// Configure reusable transporter
// We initialize lazily or fallback to Ethereal if no SMTP_HOST is provided
let transporter = null

const createTransporter = async () => {
  if (transporter) return transporter

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  } else {
    // Fallback to ethereal for local testing
    console.log('ℹ No SMTP config found. Creating Ethereal test account...')
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }

  return transporter
}

const sendMail = async (options) => {
  try {
    const tp = await createTransporter()
    const from = process.env.FROM_EMAIL || '"Multi-Tenant Ecom" <noreply@multitenantecom.com>'
    
    const info = await tp.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    console.log(`✅ Email sent: ${info.messageId}`)
    
    // Log ethereal url if it's a test account
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// ── Email Templates ──

export const sendWelcomeEmail = async (email, name, role) => {
  const roleDisplay = role === 'vendor' ? 'Vendor' : 'Customer'
  const subject = `Welcome to Multi-Tenant Ecommerce, ${name}!`
  const html = `
    <h2>Welcome, ${name}!</h2>
    <p>Thank you for registering as a <strong>${roleDisplay}</strong> on our platform.</p>
    <p>We're excited to have you on board. If you have any questions, feel free to reach out to our support team.</p>
    <br/>
    <p>Best regards,<br/>The Multi-Tenant Ecommerce Team</p>
  `
  return sendMail({ to: email, subject, html })
}

export const sendOrderConfirmationEmail = async (email, orderNumber, orderSummary, totalAmount) => {
  const subject = `Order Confirmation - #${orderNumber}`
  
  // Format items
  const itemsHtml = orderSummary.map(item => `
    <li>${item.quantity}x ${item.title} - $${item.price.toFixed(2)}</li>
  `).join('')

  const html = `
    <h2>Thank you for your order!</h2>
    <p>Your order <strong>#${orderNumber}</strong> has been placed successfully.</p>
    <h3>Order Summary:</h3>
    <ul>
      ${itemsHtml}
    </ul>
    <p><strong>Total Amount: $${totalAmount.toFixed(2)}</strong></p>
    <p>We will notify you once your order status updates.</p>
    <br/>
    <p>Best regards,<br/>The Multi-Tenant Ecommerce Team</p>
  `
  return sendMail({ to: email, subject, html })
}

export const sendPaymentSuccessEmail = async (email, paymentAmount, orderReference) => {
  const subject = `Payment Successful - Order #${orderReference}`
  const html = `
    <h2>Payment Received</h2>
    <p>We have successfully received your payment of <strong>$${paymentAmount.toFixed(2)}</strong> for order <strong>#${orderReference}</strong>.</p>
    <p>Your order is now being processed.</p>
    <br/>
    <p>Best regards,<br/>The Multi-Tenant Ecommerce Team</p>
  `
  return sendMail({ to: email, subject, html })
}

export const sendOrderStatusUpdateEmail = async (email, orderNumber, newStatus) => {
  const subject = `Order Update - #${orderNumber} is now ${newStatus}`
  const html = `
    <h2>Order Status Update</h2>
    <p>The status of your order <strong>#${orderNumber}</strong> has been updated to: <strong>${newStatus}</strong>.</p>
    <p>Thank you for shopping with us!</p>
    <br/>
    <p>Best regards,<br/>The Multi-Tenant Ecommerce Team</p>
  `
  return sendMail({ to: email, subject, html })
}
