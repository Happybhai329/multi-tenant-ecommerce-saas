# Production Deployment Notes - Zalima SaaS

This document summarizes the configurations and environment variables required to successfully deploy the application to Render and Vercel.

---

## Deployed URLs

* **Frontend (Vercel)**: `https://zalima-ecommerce.vercel.app` (Replace with your actual Vercel project domain)
* **Backend (Render)**: `https://zalima-ecommerce-api.onrender.com` (Replace with your actual Render web service domain)

---

## Required Environment Variables

### Backend (Render Web Service)

| Environment Variable | Required / Optional | Value / Description |
| :--- | :--- | :--- |
| `NODE_ENV` | Required | `production` |
| `PORT` | Optional | `10000` (Render handles this dynamically) |
| `MONGO_URI` | Required | MongoDB Atlas connection string |
| `JWT_SECRET` | Required | Cryptographically secure string (minimum 32 chars) |
| `JWT_EXPIRE` | Optional | Session lifespan (e.g. `7d`) |
| `CLIENT_URLS` | Required | Deployed frontend URL(s), comma-separated. E.g.: `https://zalima-ecommerce.vercel.app` |
| `RATE_LIMIT_BYPASS_KEY` | Optional | Secret key to bypass register rate limiting for smoke test runs |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key (`sk_test_...` enables Mock Stripe Mode automatically if used) |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signature key |
| `CLOUDINARY_CLOUD_NAME`| Optional | Cloudinary cloud name (required for image upload success) |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API Key |
| `CLOUDINARY_API_SECRET`| Optional | Cloudinary API Secret |
| `SMTP_HOST` | Optional | SMTP Mail Host (falls back to Ethereal accounts if left blank) |
| `SMTP_PORT` | Optional | SMTP Mail Port (e.g. `587`) |
| `SMTP_USER` | Optional | SMTP Authentication Username |
| `SMTP_PASS` | Optional | SMTP Authentication Password |
| `FROM_EMAIL` | Optional | Platform outgoing address (e.g. `"Zalima SaaS" <noreply@zalima.com>`) |

### Frontend (Vercel Project)

| Environment Variable | Required | Value / Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | Absolute URL to the backend API. E.g. `https://zalima-ecommerce-api.onrender.com/api` |

---

## Deployment-Specific Fixes Applied

1. **CORS Preview Support**: Configured CORS origin detection to dynamically allow Vercel previews (`https://*.vercel.app`) preventing pre-release/staging browser blocks.
2. **SPA Router Deep Links**: Frontend includes `/frontend/vercel.json` rewrite routing all virtual paths to `index.html` to prevent 404 errors on browser refresh.
3. **Cloudinary Graceful Failure**: Addressed unhandled 500 image upload exceptions. If Cloudinary variables are missing, backend uploads return a clear `503 Service Unavailable` error outlining the missing settings.
4. **Mock Integrations fallback**: Active mock check for Stripe (`sk_test_xxx`) allowing checkout flows to run successfully in demonstration/preview mode.
5. **Rate Limiting Bypasses**: Enabled bypass header (`x-bypass-rate-limit`) in `rateLimiter.js` for executing end-to-end smoke tests against live production staging systems.
