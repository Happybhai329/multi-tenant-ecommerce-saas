# API Documentation

Base URL: `http://localhost:5000/api` locally. In production, use the deployed backend origin plus `/api`.

Protected endpoints require:

```http
Authorization: Bearer <jwt>
```

Most success responses use this envelope:

```json
{
  "success": true,
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Human-readable error",
  "code": "OPTIONAL_MACHINE_CODE"
}
```

## Health

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Basic API and database health check |
| GET | `/status` | Public | Health payload plus runtime memory details |

## Authentication

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register a `customer` or `vendor`; direct `admin` registration is blocked |
| POST | `/auth/login` | Public | Login and receive `{ user, token }` |
| GET | `/auth/me` | Authenticated | Return the current authenticated user |

Registration body:

```json
{
  "name": "Customer User",
  "email": "customer@example.com",
  "password": "Password123!",
  "role": "customer"
}
```

## Stores

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/stores` | Public | List active stores with pagination |
| GET | `/stores/:slug` | Public | Fetch one active public store |
| POST | `/stores` | Vendor | Create the vendor's single store |
| GET | `/stores/my-store` | Vendor | Fetch the vendor's own store |
| PATCH | `/stores/my-store` | Vendor | Update the vendor's own store |

List responses return:

```json
{
  "success": true,
  "data": {
    "stores": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

## Products

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/products` | Public, optional auth | Browse/search products |
| GET | `/products/categories` | Public | List categories for active stores |
| GET | `/products/:slug` | Public, optional auth | Fetch a product detail by slug |
| POST | `/products` | Vendor | Create a product in the vendor's store |
| PATCH | `/products/:id` | Owning vendor | Update a product |
| PATCH | `/products/:id/stock` | Owning vendor | Update inventory count |
| DELETE | `/products/:id` | Owning vendor | Delete a product |

Supported browse query parameters:

| Parameter | Notes |
| --- | --- |
| `search` | Case-insensitive search across title, description, and category |
| `category` | Case-insensitive exact category match |
| `store` | Store ObjectId; public results only include active stores |
| `minPrice`, `maxPrice` | Numeric price range |
| `sort` | `price_asc`, `price_desc`, `newest`, or `rating` |
| `page`, `limit` | Pagination; `limit` is capped at 50 |
| `mine=true` | Vendor-only view of the authenticated vendor's products |
| `status` | Vendor/admin product status filter |

Public product responses only include published products from active stores. Vendor product management is scoped to the authenticated vendor's own store.

## Wishlist

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/wishlist` | Customer | Fetch the customer's wishlist |
| POST | `/wishlist/:productId` | Customer | Add a published product from an active store |
| DELETE | `/wishlist/:productId` | Customer | Remove a product from wishlist |

Wishlist responses return a wishlist object with a `products` array. Hidden, deleted, draft, or suspended-store products are filtered out of the response.

## Reviews

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/reviews/product/:productId` | Public | Fetch reviews for a visible product |
| POST | `/reviews` | Customer | Create one review per customer per visible product |
| DELETE | `/reviews/:id` | Review owner or admin | Delete a review |

Create body:

```json
{
  "product": "64f1a2b3c4d5e6f7a8b9c0d5",
  "rating": 5,
  "comment": "Great quality."
}
```

## Orders

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/orders` | Customer | Create one order per store represented in the cart |
| GET | `/orders/my-orders` | Customer or vendor | Customer sees own orders; vendor sees own store orders |
| GET | `/orders/:id` | Customer, vendor, admin | Fetch an order if authorized |
| PATCH | `/orders/:id/status` | Owning vendor | Advance order status |

Order creation requires published products from active stores with enough stock. Items from multiple stores are split into separate orders.

Allowed vendor status transitions:

```text
pending -> processing -> shipped -> delivered
```

`cancelled` and `delivered` are terminal states in the current API.

## Payments

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/payments/create-intent` | Customer | Create or reuse a pending Stripe payment intent for the customer's order |
| POST | `/payments/confirm-mock` | Customer | Confirm mock payment when `PAYMENT_MOCK_MODE=true` |
| GET | `/payments/:id` | Payment owner or admin | Fetch payment details |
| POST | `/payments/webhook` | Stripe | Handle Stripe webhook events with raw body signature verification |

Payment intent body:

```json
{
  "orderId": "64f1a2b3c4d5e6f7a8b9c0d7"
}
```

## Uploads

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/uploads/image` | Vendor | Upload one image file via multipart field `image` |

Supported file types: JPEG, PNG, WebP, GIF. Maximum file size: 5 MB. Cloudinary credentials must be configured for uploads to succeed.

## Analytics

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/analytics/overview` | Vendor | Fetch summary metrics, monthly revenue/order data, inventory counts, and recent orders for the vendor's store |

## Admin

All admin routes are guarded by `protect` and `authorize('admin')`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/admin/dashboard` | Platform statistics and recent activity |
| GET | `/admin/vendors` | Paginated vendor list with search/status filters |
| PATCH | `/admin/vendors/:id/status` | Activate or suspend a vendor; cascades to that vendor's store |
| GET | `/admin/stores` | Paginated store list with search/status filters |
| PATCH | `/admin/stores/:id/status` | Activate or suspend a store directly |
| GET | `/admin/users` | Paginated user list with search/role filters |
| PATCH | `/admin/users/:id/status` | Activate or suspend a user; vendor status syncs to store |

## Rate Limiting

Authentication endpoints are rate-limited in memory:

| Endpoint | Limit |
| --- | --- |
| `/auth/login` | 8 attempts per 15 minutes per IP/email combination |
| `/auth/register` | 5 attempts per hour per IP |

For smoke tests only, `RATE_LIMIT_BYPASS_KEY` can be set on the backend and sent as `x-bypass-rate-limit`.
