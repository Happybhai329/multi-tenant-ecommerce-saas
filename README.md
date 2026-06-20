# Multi-Tenant E-Commerce Platform

A multi-tenant e-commerce SaaS platform that enables multiple vendors to create and manage their own online stores within a shared marketplace. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### Customer Features
- Browse products across multiple stores
- Search and filter products by category
- Add products to cart and wishlist
- Secure checkout with Stripe integration
- Order tracking and history
- Product reviews and ratings

### Vendor Features
- Create and customize store profile
- Manage product inventory
- Track orders and update status
- View sales analytics and revenue
- Low stock alerts
- Product image uploads via Cloudinary

### Admin Features
- Platform-wide dashboard
- Vendor and store moderation
- User management
- System analytics and monitoring

## Tech Stack

### Frontend
- React 19 with Vite
- Tailwind CSS for styling
- Redux Toolkit for state management
- React Router for navigation
- Recharts for analytics visualization
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Stripe for payments
- Cloudinary for image storage
- Nodemailer for email notifications
- Helmet for security headers

## Project Structure

```
multi-tenant-ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route definitions
│   │   └── utils/           # Helper functions
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   └── seed.js              # Database seeding script
├── frontend/
│   ├── src/
│   │   ├── api/             # API service layer
│   │   ├── components/      # Reusable components
│   │   ├── features/        # Redux slices
│   │   ├── pages/           # Page components
│   │   └── router/          # Route configuration
│   ├── .env.example
│   └── package.json
└── docs/                    # Additional documentation
```

## Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Stripe account (for payments)
- Cloudinary account (for image uploads)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables (see Environment Variables section below)

5. Start development server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Environment Variables

### Backend (.env)

```bash
# Application
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/multi_tenant_ecommerce

# Authentication
JWT_SECRET=your-long-random-secret-key
JWT_EXPIRE=7d

# CORS
CLIENT_URLS=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
PAYMENT_MOCK_MODE=true
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional - falls back to Ethereal)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL="Multi-Tenant Ecom <noreply@example.com>"
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=/api
```

## Running Locally

1. Start MongoDB (if using local instance)
2. Configure backend `.env` with your credentials
3. Start backend: `cd backend && npm run dev`
4. Configure frontend `.env` (use `/api` for Vite proxy)
5. Start frontend: `cd frontend && npm run dev`
6. Access application at `http://localhost:5173`

## Database Seeding

To populate the database with demo data:

```bash
cd backend
npm run db:seed
```

This creates:
- 1 admin user
- 2 vendor users with stores
- 2 customer users
- 12 products across 2 stores
- Sample orders, payments, reviews, and wishlists

Demo credentials (password: `Password123!`):
- Admin: `admin@test.com`
- Vendor 1: `vendor1@test.com`
- Vendor 2: `vendor2@test.com`
- Customer 1: `customer1@test.com`
- Customer 2: `customer2@test.com`

## Deployment

### Backend Deployment (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Configure environment variables
5. Deploy

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Import project on Vercel
3. Configure environment variables
4. Deploy

## API Documentation

See `docs/API_DOCUMENTATION.md` for detailed API endpoint documentation with sample requests and responses.

## Architecture Overview

See `docs/ARCHITECTURE.md` for detailed architecture documentation including database models, authentication flow, and tenant isolation approach.

## Future Improvements

- Real-time notifications with WebSocket
- Advanced search with Elasticsearch
- Product recommendation engine
- Multi-language support
- Mobile app (React Native)
- Vendor subscription tiers
- Advanced analytics dashboard
- Inventory forecasting
- Customer support chat system
- Social media integration

## License

ISC
