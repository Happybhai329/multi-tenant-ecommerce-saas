# Architecture Overview

This document describes the architecture of the multi-tenant e-commerce platform, including frontend structure, backend structure, database models, authentication flow, and tenant isolation approach.

## System Architecture

The platform follows a classic three-tier architecture:

```
┌─────────────────┐
│   Frontend      │  React SPA (Vite)
│   (Client)      │  Redux Toolkit
└────────┬────────┘
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend      │  Express.js
│   (Server)     │  JWT Auth
└────────┬────────┘
         │ Mongoose ODM
         │
┌────────▼────────┐
│   Database      │  MongoDB
│   (Data)        │  Multi-tenant
└─────────────────┘
```

## Frontend Structure

### Directory Layout

```
frontend/src/
├── api/                    # API service layer
│   ├── axios.js           # Axios instance with interceptors
│   ├── authApi.js         # Authentication endpoints
│   ├── storeApi.js        # Store endpoints
│   ├── productApi.js      # Product endpoints
│   ├── orderApi.js        # Order endpoints
│   └── ...
├── components/            # Reusable UI components
│   ├── common/           # Button, Input, Modal, etc.
│   ├── layout/           # Header, Footer, Sidebar
│   └── ...
├── features/              # Redux slices
│   ├── authSlice.js      # Auth state management
│   ├── cartSlice.js      # Shopping cart
│   └── ...
├── pages/                 # Page components
│   ├── customer/         # Customer-facing pages
│   │   ├── HomePage.jsx
│   │   ├── ProductPage.jsx
│   │   ├── CartPage.jsx
│   │   └── CheckoutPage.jsx
│   ├── vendor/           # Vendor dashboard pages
│   │   ├── VendorDashboard.jsx
│   │   ├── ProductsPage.jsx
│   │   └── AnalyticsPage.jsx
│   ├── admin/            # Admin dashboard pages
│   │   └── AdminDashboard.jsx
│   └── auth/             # Auth pages
│       ├── LoginPage.jsx
│       └── RegisterPage.jsx
├── router/                # Route configuration
│   └── AppRouter.jsx     # React Router setup
├── App.jsx               # Root component
└── main.jsx              # Entry point
```

### Key Frontend Patterns

**State Management:**
- Redux Toolkit for global state (auth, cart, user data)
- Local component state for UI-specific data
- React Query pattern for API caching (optional enhancement)

**Routing:**
- React Router v7 for client-side routing
- Protected routes for authenticated users
- Role-based route guards (customer, vendor, admin)

**API Layer:**
- Centralized API service functions
- Axios interceptors for token injection
- Error handling with user-friendly messages

**Component Architecture:**
- Page components (route-level)
- Layout components (Header, Footer)
- Reusable UI components (Button, Card, Modal)
- Feature-specific components (ProductCard, OrderItem)

## Backend Structure

### Directory Layout

```
backend/src/
├── config/                # Configuration files
│   └── env.js            # Environment variables
├── controllers/           # Route handlers (business logic)
│   ├── authController.js
│   ├── storeController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── paymentController.js
│   └── adminController.js
├── middleware/            # Express middleware
│   ├── auth.js           # JWT authentication
│   ├── errorHandler.js   # Error handling
│   ├── validate.js       # Request validation
│   ├── rateLimiter.js    # Rate limiting
│   ├── ownership.js      # Resource ownership verification
│   └── requestLogger.js  # Request logging
├── models/               # Mongoose schemas
│   ├── User.js
│   ├── Store.js
│   ├── Product.js
│   ├── Order.js
│   ├── Payment.js
│   ├── Review.js
│   └── Wishlist.js
├── routes/               # API route definitions
│   ├── authRoutes.js
│   ├── storeRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── adminRoutes.js
│   └── ...
├── utils/                # Helper functions
│   ├── generateToken.js  # JWT token generation
│   ├── emailService.js   # Email sending
│   └── logger.js         # Logging utility
└── app.js                # Express app configuration
```

### Key Backend Patterns

**Layered Architecture:**
- Routes: Define endpoints and attach middleware
- Controllers: Handle business logic
- Models: Define data structure and validation
- Middleware: Cross-cutting concerns (auth, validation)

**Authentication:**
- JWT tokens for stateless authentication
- Role-based authorization (customer, vendor, admin)
- Protected routes with middleware

**Error Handling:**
- Centralized error handler middleware
- Custom error classes
- Consistent error response format

**Validation:**
- Request validation middleware
- Mongoose schema validation
- Custom validators for business rules

**Logging:**
- Structured logging with request IDs
- Event logging for important actions
- Development vs production log levels

## Database Models

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: Enum ['customer', 'vendor', 'admin'] (default: customer),
  status: Enum ['active', 'suspended'] (default: active),
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- One-to-one with Store (if vendor)
- One-to-many with Orders (if customer)
- One-to-many with Products (if vendor)
- One-to-many with Reviews (if customer)

### Store Model

```javascript
{
  name: String (required, max 100),
  slug: String (unique, auto-generated),
  description: String (max 500),
  logo: String (Cloudinary URL),
  banner: String (Cloudinary URL),
  owner: ObjectId (ref: User, required, unique),
  status: Enum ['active', 'suspended'] (default: active),
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- Belongs to User (owner)
- Has many Products
- Has many Orders

### Product Model

```javascript
{
  title: String (required, max 200),
  slug: String (auto-generated),
  description: String (max 2000),
  price: Number (required, min 0),
  comparePrice: Number (min 0),
  category: String (required),
  images: [{
    url: String (required),
    publicId: String (required),
    isPrimary: Boolean
  }],
  stock: Number (required, min 0),
  lowStockThreshold: Number (default 5),
  status: Enum ['draft', 'published'] (default: draft),
  store: ObjectId (ref: Store, required),
  createdBy: ObjectId (ref: User, required),
  averageRating: Number (min 0, max 5, default 0),
  reviewCount: Number (min 0, default 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Virtual:**
- `stockStatus`: 'in_stock', 'low_stock', 'out_of_stock'

**Relationships:**
- Belongs to Store
- Belongs to User (creator)
- Has many Reviews
- Has many OrderItems

### Order Model

```javascript
{
  customer: ObjectId (ref: User, required),
  store: ObjectId (ref: Store, required),
  items: [{
    product: ObjectId (ref: Product),
    title: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  subtotal: Number,
  totalAmount: Number,
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },
  paymentStatus: Enum ['pending', 'paid', 'failed'],
  orderStatus: Enum ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  payment: ObjectId (ref: Payment),
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- Belongs to User (customer)
- Belongs to Store
- Has one Payment
- Has many OrderItems (embedded)

### Payment Model

```javascript
{
  order: ObjectId (ref: Product, required),
  customer: ObjectId (ref: User, required),
  amount: Number (required, in cents),
  currency: String (default: 'usd'),
  paymentIntentId: String (Stripe),
  clientSecret: String (Stripe),
  status: Enum ['pending', 'succeeded', 'failed'],
  paidAt: Date,
  createdAt: Date
}
```

**Relationships:**
- Belongs to Order
- Belongs to User (customer)

### Review Model

```javascript
{
  product: ObjectId (ref: Product, required),
  customer: ObjectId (ref: User, required),
  rating: Number (required, min 1, max 5),
  comment: String,
  createdAt: Date
}
```

**Relationships:**
- Belongs to Product
- Belongs to User (customer)

### Wishlist Model

```javascript
{
  customer: ObjectId (ref: User, required, unique),
  products: [ObjectId (ref: Product)]
}
```

**Relationships:**
- Belongs to User (customer)
- Has many Products (referenced)

## Authentication Flow

### Registration Flow

```
1. User submits registration form
   ↓
2. Frontend: POST /api/auth/register
   ↓
3. Backend: Validate input
   - Check if email exists
   - Block admin registration
   ↓
4. Backend: Hash password with bcrypt
   ↓
5. Backend: Create user in database
   ↓
6. Backend: Generate JWT token
   ↓
7. Backend: Send welcome email (async)
   ↓
8. Backend: Return user + token
   ↓
9. Frontend: Store token in localStorage
   ↓
10. Frontend: Redirect to dashboard
```

### Login Flow

```
1. User submits login form
   ↓
2. Frontend: POST /api/auth/login
   ↓
3. Backend: Validate input
   ↓
4. Backend: Find user by email
   ↓
5. Backend: Compare password with bcrypt
   ↓
6. Backend: Check account status (not suspended)
   ↓
7. Backend: Generate JWT token
   ↓
8. Backend: Return user + token
   ↓
9. Frontend: Store token in localStorage
   ↓
10. Frontend: Redirect to dashboard
```

### Protected Route Flow

```
1. User navigates to protected route
   ↓
2. Frontend: Check if token exists
   ↓
3. Frontend: Include token in Authorization header
   ↓
4. Backend: Verify JWT signature
   ↓
5. Backend: Extract user from token
   ↓
6. Backend: Attach user to request object
   ↓
7. Backend: Check role authorization (if needed)
   ↓
8. Backend: Proceed to controller
   ↓
9. Frontend: Display data or error
```

### Token Structure

```javascript
{
  userId: ObjectId,
  email: String,
  role: String,
  iat: Number (issued at),
  exp: Number (expiration)
}
```

## Tenant Isolation Approach

The platform uses a **shared database, shared schema** multi-tenancy approach with row-level security.

### Isolation Strategies

**1. User-Level Isolation**
- Each user has a unique ID
- Users can only access their own data
- Role-based access control (RBAC)

**2. Store-Level Isolation**
- Each store belongs to one vendor
- Products are scoped to stores
- Orders are scoped to stores
- Vendors can only manage their own store

**3. Ownership Verification**
- Middleware checks resource ownership
- `verifyProductOwner`: Ensures vendor owns the product
- `verifyOrderStoreOwner`: Ensures vendor owns the order's store
- `verifyOrderAccess`: Ensures user has access to order

### Data Access Patterns

**Customer Access:**
- Can view all published products across all stores
- Can only access their own orders, wishlist, reviews
- Cannot access vendor or admin endpoints

**Vendor Access:**
- Can only access their own store
- Can only manage their own products
- Can only view orders for their store
- Cannot access other vendors' data

**Admin Access:**
- Can view all users, stores, products, orders
- Can moderate vendors and stores
- Can update user and store statuses

### Database-Level Isolation

**Query Scoping:**
```javascript
// Vendor can only see their products
const products = await Product.find({ 
  store: vendor.storeId,
  createdBy: vendor.userId 
})

// Customer can only see their orders
const orders = await Order.find({ 
  customer: customer.userId 
})
```

**Middleware Enforcement:**
```javascript
// Ownership middleware
const verifyProductOwner = async (req, res, next) => {
  const product = await Product.findById(req.params.id)
  if (product.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }
  next()
}
```

**Indexing for Performance:**
- Products indexed by `store` and `status`
- Orders indexed by `customer` and `store`
- Users indexed by `email` and `status`

## Security Architecture

### Authentication Security
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens with expiration (7 days)
- Token stored in localStorage (consider httpOnly cookies for production)
- Rate limiting on auth endpoints

### API Security
- CORS configured for specific origins
- Helmet.js for security headers
- Request validation with Joi
- SQL injection prevention (NoSQL injection checks)
- XSS protection (input sanitization)

### Data Security
- Environment variables for secrets
- No sensitive data in logs
- Role-based access control
- Resource ownership verification

## Scalability Considerations

### Current Architecture
- Single MongoDB instance
- Single Express server
- Suitable for small to medium scale

### Future Scaling Options
**Database:**
- MongoDB Atlas (auto-scaling)
- Read replicas for high read volume
- Sharding for very large datasets

**Backend:**
- Horizontal scaling with load balancer
- Microservices separation (auth, orders, payments)
- Redis for caching and sessions

**Frontend:**
- CDN for static assets
- Server-side rendering (Next.js)
- Progressive Web App (PWA)

## Technology Rationale

**MERN Stack:**
- JavaScript everywhere (consistent language)
- Large ecosystem and community
- Rapid development
- Easy to hire developers

**MongoDB:**
- Flexible schema (good for multi-tenant)
- Document model (fits e-commerce data)
- Horizontal scaling
- Rich query capabilities

**Express.js:**
- Minimal and flexible
- Large middleware ecosystem
- Easy to learn
- Good performance

**React:**
- Component-based architecture
- Virtual DOM for performance
- Large ecosystem
- Redux for state management

**Stripe:**
- Industry standard for payments
- Excellent documentation
- Strong security
- Easy integration

**Cloudinary:**
- Image optimization
- CDN delivery
- Easy upload API
- Free tier available
