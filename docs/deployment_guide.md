# Deployment Guide - Multi-Tenant Ecommerce SaaS

This guide explains how to set up and deploy the multi-tenant ecommerce application to production. 

---

## 1. Database Setup: MongoDB Atlas

MongoDB Atlas hosts the database in the cloud.

1. **Create an Account / Login**: Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. **Create a Cluster**: 
   - Deploy a free-tier M0 Cluster in your preferred region.
3. **Database Access (User)**:
   - Create a database user with read/write privileges (e.g., `db_user` and a strong password).
4. **Network Access (IP Whitelist)**:
   - Go to **Network Access** > **Add IP Address**.
   - For Render compatibility, add **`0.0.0.0/0`** (Allow access from anywhere). 
     > [!IMPORTANT]
     > Render web services do not have static egress IP addresses unless configured via a proxy, so whitelisting all IPs is required for connectivity.
5. **Get Connection String**:
   - Go to **Database** > **Connect** > **Drivers** (Node.js).
   - Copy the connection string. It will look like:
     `mongodb+srv://db_user:<password>@cluster0.xxxx.mongodb.net/multi_tenant_ecommerce?retryWrites=true&w=majority`

---

## 2. Backend Deployment: Render

The Express backend runs as a Web Service on Render.

1. **Prepare Source Code**: Ensure your code is pushed to a GitHub repository.
2. **Create a Render Web Service**:
   - Sign in to [Render](https://render.com).
   - Click **New** > **Web Service**.
   - Connect your GitHub repository.
3. **Configure Settings**:
   - **Name**: `multi-tenant-ecommerce-api`
   - **Language**: `Node`
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js` (or `npm start`)
   - **Instance Type**: `Free`
4. **Environment Variables**: Add the following keys in Render's **Environment** tab:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render overrides this automatically, but safe to set)
   - `MONGO_URI` = *(Your MongoDB Atlas connection URI)*
   - `JWT_SECRET` = *(Generate a strong, random string at least 32 characters long)*
   - `JWT_EXPIRE` = `7d`
   - `CLIENT_URLS` = `https://<your-frontend>.vercel.app` *(The URL of your deployed Vercel frontend)*
   - `STRIPE_SECRET_KEY` = *(Stripe secret API key)*
   - `STRIPE_WEBHOOK_SECRET` = *(Optional, for Stripe webhook verification)*
   - `CLOUDINARY_CLOUD_NAME` = *(Cloudinary cloud name)*
   - `CLOUDINARY_API_KEY` = *(Cloudinary API key)*
   - `CLOUDINARY_API_SECRET` = *(Cloudinary API secret)*
   - `SMTP_HOST` = *(SMTP host)*
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = *(SMTP user name)*
   - `SMTP_PASS` = *(SMTP password)*
   - `FROM_EMAIL` = `"Platform Alerts <noreply@yourdomain.com>"`
5. **Health Check Routing**:
   - Go to **Advanced** in your Render Web Service.
   - Set **Health Check Path** to `/api/health`.

---

## 3. Frontend Deployment: Vercel

The React/Vite client is built and served via Vercel.

1. **Create a Vercel Project**:
   - Sign in to [Vercel](https://vercel.com).
   - Click **Add New** > **Project** and select your GitHub repository.
2. **Configure Settings**:
   - **Framework Preset**: `Vite` (Vercel automatically detects this)
   - **Root Directory**: Select `frontend` (Click **Edit** next to project root and navigate to the `frontend` folder).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Configure Environment Variables**:
   - Add `VITE_API_BASE_URL` = `https://<your-backend-service>.onrender.com/api` (Replace with your actual Render Web Service URL).
4. **Single-Page Application (SPA) Routing**:
   - The frontend includes `vercel.json` which maps all virtual routes back to `/index.html`. This ensures deep linking (e.g. reloading `/orders/123`) works seamlessly.
5. **Deploy**:
   - Click **Deploy**. Vercel will build and serve your frontend.

---

## 4. Third-Party Integration Verification

Ensure the following integrations are configured correctly:

### Stripe Payment Setup
- If `STRIPE_SECRET_KEY` is not provided or starts with `sk_test_xxx`, the backend activates **Mock Stripe Mode**. You will see:
  `INFO Stripe is configured with dummy/placeholder key. Enabling Mock Stripe Mode.`
- To process real test payments, configure a valid Stripe API key.

### Cloudinary Uploads
- Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are correctly populated. If any are missing, image uploads will fail.

### SMTP Mail Server
- If `SMTP_HOST` and `SMTP_USER` are not configured, the service will log:
  `WARN SMTP configuration (SMTP_HOST, SMTP_USER, SMTP_PASS) is incomplete; email service will fall back to Ethereal test accounts.`
- For staging/production delivery, configure your transactional mail credentials (e.g., SendGrid, Mailgun, AWS SES).
