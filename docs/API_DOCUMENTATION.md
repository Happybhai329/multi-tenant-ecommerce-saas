# API Documentation

Base URL: `http://localhost:5000/api`

All endpoints return JSON responses. Authentication required endpoints use JWT tokens in the Authorization header.

## Authentication

### Register User
**POST** `/api/auth/register`

Register a new user (customer or vendor). Admin registration is blocked.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "customer"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Login User
**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Get Current User
**GET** `/api/auth/me`

Get currently authenticated user details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## Stores

### Get All Stores
**GET** `/api/stores`

Retrieve all active stores.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Apex Tech Store",
      "description": "Electronics and desk gear",
      "logo": "https://example.com/logo.jpg",
      "banner": "https://example.com/banner.jpg",
      "slug": "apex-tech-store",
      "owner": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
        "name": "Maya Chen"
      },
      "status": "active"
    }
  ]
}
```

### Get Store by Slug
**GET** `/api/stores/:slug`

Retrieve a specific store by its slug.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Apex Tech Store",
    "description": "Electronics and desk gear",
    "logo": "https://example.com/logo.jpg",
    "banner": "https://example.com/banner.jpg",
    "slug": "apex-tech-store",
    "owner": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "name": "Maya Chen"
    },
    "status": "active"
  }
}
```

### Create Store
**POST** `/api/stores`

Create a new store (vendor only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My Store",
  "description": "A great store",
  "logo": "https://example.com/logo.jpg",
  "banner": "https://example.com/banner.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
    "name": "My Store",
    "description": "A great store",
    "logo": "https://example.com/logo.jpg",
    "banner": "https://example.com/banner.jpg",
    "slug": "my-store",
    "owner": "64f1a2b3c4d5e6f7a8b9c0d3",
    "status": "active"
  }
}
```

### Get My Store
**GET** `/api/stores/my-store`

Get the authenticated vendor's store.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
    "name": "My Store",
    "description": "A great store",
    "logo": "https://example.com/logo.jpg",
    "banner": "https://example.com/banner.jpg",
    "slug": "my-store",
    "owner": "64f1a2b3c4d5e6f7a8b9c0d3",
    "status": "active"
  }
}
```

### Update My Store
**PATCH** `/api/stores/my-store`

Update the authenticated vendor's store.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Store Name",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
    "name": "Updated Store Name",
    "description": "Updated description",
    "logo": "https://example.com/logo.jpg",
    "banner": "https://example.com/banner.jpg",
    "slug": "updated-store-name",
    "owner": "64f1a2b3c4d5e6f7a8b9c0d3",
    "status": "active"
  }
}
```

## Products

### Get Products
**GET** `/api/products`

Retrieve all products with optional filtering.

**Query Parameters:**
- `category`: Filter by category
- `store`: Filter by store ID
- `search`: Search in title and description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Example:** `/api/products?category=Electronics&page=1&limit=10`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
      "title": "UltraWireless Pro Earbuds",
      "description": "Active noise cancellation...",
      "price": 89.99,
      "comparePrice": 109.99,
      "category": "Electronics",
      "stock": 20,
      "status": "published",
      "slug": "ultrawireless-pro-earbuds",
      "images": [
        {
          "url": "https://example.com/image.jpg",
          "publicId": "image_id",
          "isPrimary": true
        }
      ],
      "store": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
        "name": "Apex Tech Store",
        "slug": "apex-tech-store"
      },
      "averageRating": 4.5,
      "reviewCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Get Product by Slug
**GET** `/api/products/:slug`

Retrieve a specific product by its slug.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
    "title": "UltraWireless Pro Earbuds",
    "description": "Active noise cancellation...",
    "price": 89.99,
    "comparePrice": 109.99,
    "category": "Electronics",
    "stock": 20,
    "status": "published",
    "slug": "ultrawireless-pro-earbuds",
    "images": [
      {
        "url": "https://example.com/image.jpg",
        "publicId": "image_id",
        "isPrimary": true
      }
    ],
    "store": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Apex Tech Store",
      "slug": "apex-tech-store"
    },
    "averageRating": 4.5,
    "reviewCount": 2
  }
}
```

### Create Product
**POST** `/api/products`

Create a new product (vendor only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Product",
  "description": "Product description",
  "price": 29.99,
  "comparePrice": 39.99,
  "category": "Electronics",
  "stock": 50,
  "lowStockThreshold": 10,
  "status": "published",
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "publicId": "image_id",
      "isPrimary": true
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "title": "New Product",
    "description": "Product description",
    "price": 29.99,
    "comparePrice": 39.99,
    "category": "Electronics",
    "stock": 50,
    "lowStockThreshold": 10,
    "status": "published",
    "slug": "new-product",
    "images": [
      {
        "url": "https://example.com/image.jpg",
        "publicId": "image_id",
        "isPrimary": true
      }
    ],
    "store": "64f1a2b3c4d5e6f7a8b9c0d2",
    "createdBy": "64f1a2b3c4d5e6f7a8b9c0d3",
    "averageRating": 0,
    "reviewCount": 0
  }
}
```

### Update Product
**PATCH** `/api/products/:id`

Update a product (vendor only, product owner).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Product Title",
  "price": 34.99,
  "stock": 45
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "title": "Updated Product Title",
    "description": "Product description",
    "price": 34.99,
    "comparePrice": 39.99,
    "category": "Electronics",
    "stock": 45,
    "lowStockThreshold": 10,
    "status": "published",
    "slug": "updated-product-title",
    "images": [
      {
        "url": "https://example.com/image.jpg",
        "publicId": "image_id",
        "isPrimary": true
      }
    ],
    "store": "64f1a2b3c4d5e6f7a8b9c0d2",
    "createdBy": "64f1a2b3c4d5e6f7a8b9c0d3",
    "averageRating": 0,
    "reviewCount": 0
  }
}
```

### Update Product Stock
**PATCH** `/api/products/:id/stock`

Update product stock quantity (vendor only, product owner).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "stock": 100
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "stock": 100
  }
}
```

### Delete Product
**DELETE** `/api/products/:id`

Delete a product (vendor only, product owner).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Get Categories
**GET** `/api/products/categories`

Retrieve all unique product categories.

**Response (200):**
```json
{
  "success": true,
  "data": ["Electronics", "Office", "Grocery", "Clothing"]
}
```

## Orders

### Create Order
**POST** `/api/orders`

Create a new order (customer only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "product": "64f1a2b3c4d5e6f7a8b9c0d5",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62704",
    "phone": "555-0199"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d7",
    "customer": "64f1a2b3c4d5e6f7a8b9c0d1",
    "store": "64f1a2b3c4d5e6f7a8b9c0d2",
    "items": [
      {
        "product": "64f1a2b3c4d5e6f7a8b9c0d5",
        "title": "UltraWireless Pro Earbuds",
        "price": 89.99,
        "quantity": 2,
        "image": "https://example.com/image.jpg"
      }
    ],
    "subtotal": 179.98,
    "totalAmount": 179.98,
    "shippingAddress": {
      "fullName": "John Doe",
      "address": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62704",
      "phone": "555-0199"
    },
    "paymentStatus": "pending",
    "orderStatus": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get My Orders
**GET** `/api/orders/my-orders`

Retrieve orders for the authenticated user (customer or vendor).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d7",
      "items": [
        {
          "product": "64f1a2b3c4d5e6f7a8b9c0d5",
          "title": "UltraWireless Pro Earbuds",
          "price": 89.99,
          "quantity": 2,
          "image": "https://example.com/image.jpg"
        }
      ],
      "totalAmount": 179.98,
      "paymentStatus": "paid",
      "orderStatus": "processing",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "store": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
        "name": "Apex Tech Store"
      }
    }
  ]
}
```

### Get Order by ID
**GET** `/api/orders/:id`

Retrieve a specific order (customer, vendor, or admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d7",
    "customer": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "store": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Apex Tech Store"
    },
    "items": [
      {
        "product": "64f1a2b3c4d5e6f7a8b9c0d5",
        "title": "UltraWireless Pro Earbuds",
        "price": 89.99,
        "quantity": 2,
        "image": "https://example.com/image.jpg"
      }
    ],
    "totalAmount": 179.98,
    "shippingAddress": {
      "fullName": "John Doe",
      "address": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62704",
      "phone": "555-0199"
    },
    "paymentStatus": "paid",
    "orderStatus": "processing",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Order Status
**PATCH** `/api/orders/:id/status`

Update order status (vendor only, store owner).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "orderStatus": "shipped"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d7",
    "orderStatus": "shipped",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

## Admin

### Get Admin Dashboard
**GET** `/api/admin/dashboard`

Retrieve platform-wide statistics (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalVendors": 25,
    "totalStores": 25,
    "totalProducts": 500,
    "totalOrders": 1000,
    "totalRevenue": 50000,
    "activeVendors": 20,
    "pendingStores": 3
  }
}
```

### Get Vendors
**GET** `/api/admin/vendors`

Retrieve all vendors (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "name": "Maya Chen",
      "email": "maya@example.com",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Update Vendor Status
**PATCH** `/api/admin/vendors/:id/status`

Update vendor status (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
    "status": "suspended"
  }
}
```

### Get Stores
**GET** `/api/admin/stores`

Retrieve all stores (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Apex Tech Store",
      "slug": "apex-tech-store",
      "status": "active",
      "owner": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
        "name": "Maya Chen"
      }
    }
  ]
}
```

### Update Store Status
**PATCH** `/api/admin/stores/:id/status`

Update store status (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "status": "suspended"
  }
}
```

### Get Users
**GET** `/api/admin/users`

Retrieve all users (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Update User Status
**PATCH** `/api/admin/users/:id/status`

Update user status (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "status": "suspended"
  }
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error, invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting on authentication endpoints:
- Register: 5 requests per 15 minutes per IP
- Login: 10 requests per 15 minutes per IP

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets
