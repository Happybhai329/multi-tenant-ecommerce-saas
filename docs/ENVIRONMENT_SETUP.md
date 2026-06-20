# Environment Setup Guide

This guide covers setting up all external services required for the multi-tenant e-commerce platform.

## Backend Services

### MongoDB Atlas Setup

MongoDB Atlas is a cloud-hosted MongoDB service. Follow these steps to set it up:

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select a cloud provider and region closest to you
   - Name your cluster (e.g., "multi-tenant-ecommerce")
   - Click "Create"

3. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Add "0.0.0.0/0" (allows access from anywhere)
   - For production: Add specific IP addresses or use VPC peering
   - Click "Confirm"

4. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter username and password (save these securely)
   - Select "Read and write to any database"
   - Click "Create User"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select your Node.js version
   - Copy the connection string

6. **Configure Environment Variable**
   - Replace `<password>` with your database user password
   - Add to backend `.env`:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/multi_tenant_ecommerce?retryWrites=true&w=majority
   ```

**Alternative: Local MongoDB**
If you prefer to use MongoDB locally:
1. Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use this connection string:
```
MONGO_URI=mongodb://localhost:27017/multi_tenant_ecommerce
```

### Stripe Setup

Stripe handles payment processing. Follow these steps:

1. **Create Account**
   - Go to [Stripe](https://stripe.com)
   - Sign up for an account
   - Complete the onboarding process

2. **Get API Keys**
   - Go to "Developers" > "API keys"
   - You'll see two sets of keys: Test mode and Live mode
   - For development, use Test mode keys

3. **Copy Keys**
   - Copy the "Publishable key" (starts with `pk_test_`)
   - Copy the "Secret key" (starts with `sk_test_`)

4. **Configure Environment Variables**
   - Add to backend `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   PAYMENT_MOCK_MODE=true
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

5. **Webhook Setup (Optional for Development)**
   - For development, `PAYMENT_MOCK_MODE=true` bypasses Stripe
   - For production, you'll need to set up webhooks:
   - Go to "Developers" > "Webhooks"
   - Add endpoint: `https://your-backend-url.com/api/payments/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.failed`
   - Copy the webhook signing secret

6. **Frontend Configuration**
   - Add the publishable key to your frontend environment or directly in code:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

### Cloudinary Setup

Cloudinary handles image storage and optimization.

1. **Create Account**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for a free account

2. **Get Credentials**
   - After signing up, you'll be taken to the dashboard
   - Note your "Cloud name" from the dashboard

3. **Get API Keys**
   - Go to "Settings" > "Account" (or click the gear icon)
   - Scroll to "API Security"
   - You'll see:
     - API Key
     - API Secret (click "Show" to reveal)

4. **Configure Environment Variables**
   - Add to backend `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Upload Settings (Optional)**
   - Go to "Settings" > "Upload"
   - Configure upload presets if needed
   - Set image transformations, allowed formats, etc.

### Nodemailer Setup

Nodemailer sends transactional emails (welcome emails, order updates).

**Option 1: Use Ethereal (Recommended for Development)**

The app automatically falls back to Ethereal test accounts if SMTP credentials are not configured. No setup required.

**Option 2: Configure SMTP Provider**

For production, use a real SMTP service:

1. **Choose SMTP Provider**
   - Gmail (requires app password)
   - SendGrid
   - Mailgun
   - Amazon SES
   - Postmark

2. **Get SMTP Credentials**
   - Example for Gmail:
     - Enable 2-factor authentication
     - Go to Google Account > Security
     - Generate an App Password
     - Use the app password as SMTP_PASS

3. **Configure Environment Variables**
   - Add to backend `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FROM_EMAIL="Multi-Tenant Ecom <noreply@example.com>"
   ```

4. **Example SMTP Settings for Popular Providers**
   
   **SendGrid:**
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.your_sendgrid_api_key
   ```
   
   **Mailgun:**
   ```
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@your_domain.mailgun.org
   SMTP_PASS=your_mailgun_password
   ```

## Frontend Configuration

### API URL Configuration

The frontend needs to know where the backend API is located.

**Local Development:**

1. Use Vite's proxy for development:
   - Create `frontend/.env`:
   ```
   VITE_API_BASE_URL=/api
   ```
   - Vite proxy is configured in `vite.config.js` to forward `/api` requests to `http://localhost:5000`

**Production Deployment:**

1. When deploying to Vercel, set the environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```
   - Replace with your actual backend URL (e.g., Render deployment)

2. The frontend will use this base URL for all API requests

## Environment Variable Templates

### Backend (.env.example)

```bash
# ─── APPLICATION ENVIRONMENT CONFIGURATION ───
NODE_ENV=development
PORT=5000
APP_VERSION=1.0.0

# ─── DATABASE CONFIGURATION ───
MONGO_URI=mongodb://localhost:27017/multi_tenant_ecommerce

# ─── SECURITY & AUTHENTICATION ───
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRE=7d

# ─── CORS CONFIGURATION ───
CLIENT_URLS=http://localhost:5173

# ─── STRIPE INTEGRATION (PAYMENTS) ───
STRIPE_SECRET_KEY=sk_test_xxx
PAYMENT_MOCK_MODE=true
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ─── CLOUDINARY INTEGRATION (IMAGE UPLOAD) ───
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ─── SMTP EMAIL CONFIGURATION ───
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL="Multi-Tenant Ecom <noreply@example.com>"
```

### Frontend (.env.example)

```bash
# ─── FRONTEND CONFIGURATION ───
VITE_API_BASE_URL=/api
```

## Security Best Practices

1. **Never Commit .env Files**
   - `.env` files are in `.gitignore`
   - Only commit `.env.example` files

2. **Use Strong Secrets**
   - Generate random JWT secrets (at least 32 characters)
   - Use different secrets for development and production

3. **Rotate Keys Regularly**
   - Change API keys periodically
   - Update secrets if they're ever compromised

4. **Use Environment-Specific Configs**
   - Development: Use test keys and mock modes
   - Production: Use live keys and real services

5. **Limit API Access**
   - Use IP whitelisting for MongoDB Atlas
   - Configure CORS properly
   - Use rate limiting

## Testing Your Setup

After configuring all services, test them:

1. **Test MongoDB Connection**
   ```bash
   cd backend
   npm run dev
   ```
   - Check console for "Connected to MongoDB" message

2. **Test Stripe Integration**
   - Create a test product
   - Attempt checkout with test card: `4242 4242 4242 4242`

3. **Test Cloudinary Upload**
   - Create a product with an image
   - Verify image appears in Cloudinary dashboard

4. **Test Email Sending**
   - Register a new user
   - Check for welcome email (or Ethereal preview URL in console)

## Troubleshooting

### MongoDB Connection Issues
- Verify IP whitelist in Atlas
- Check username/password in connection string
- Ensure cluster is not paused (free tier pauses after inactivity)

### Stripe Payment Failures
- Verify you're using test mode keys
- Check `PAYMENT_MOCK_MODE` setting
- Ensure webhook endpoint is accessible (not using mock mode)

### Cloudinary Upload Errors
- Verify API key and secret are correct
- Check cloud name matches your account
- Ensure image size is within limits

### Email Not Sending
- Check SMTP credentials
- Verify SMTP host and port
- Try Ethereal fallback (leave SMTP blank)
- Check spam folder

## Next Steps

After setting up all services:
1. Seed the database with demo data: `npm run db:seed`
2. Start both backend and frontend servers
3. Test the application with demo credentials
4. Deploy to production when ready
