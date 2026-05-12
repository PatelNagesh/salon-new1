# Salon Management API - Documentation

## Overview

The Salon Management API provides a comprehensive RESTful API for managing salon operations including bookings, staff, customers, services, inventory, and more.

**Version**: 1.0.0
**Base URL**: `/api/v1`
**Content Type**: `application/json`

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Filtering and Sorting](#filtering-and-sorting)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
- [Data Models](#data-models)

---

## Authentication

All API endpoints (except authentication endpoints) require authentication using a JWT token.

### Authentication Flow

1. **Login**: Obtain an access token by providing credentials
2. **Use Token**: Include the token in the `Authorization` header
3. **Refresh**: Use the refresh token to obtain a new access token

### Request Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Authentication Endpoints

#### Login

```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "staff_member"
    }
  },
  "timestamp": "2026-05-12T10:00:00Z"
}
```

#### Register

```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Refresh Token

```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-05-12T10:00:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  },
  "timestamp": "2026-05-12T10:00:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2026-05-12T10:00:00Z"
}
```

---

## Error Handling

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_001` | Invalid credentials | 401 |
| `AUTH_002` | Token expired | 401 |
| `AUTH_003` | Invalid token | 401 |
| `AUTH_004` | Insufficient permissions | 403 |
| `VAL_001` | Invalid input | 400 |
| `VAL_002` | Missing field | 400 |
| `NOT_FOUND_001` | User not found | 404 |
| `NOT_FOUND_002` | Resource not found | 404 |
| `CONFLICT_001` | Duplicate resource | 409 |
| `FORBIDDEN_001` | Access denied | 403 |
| `SERVER_001` | Internal server error | 500 |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND_002",
    "message": "Resource not found",
    "details": {
      "resource": "booking",
      "id": "550e8400-e29b-41d4-a716-446655440000"
    }
  },
  "timestamp": "2026-05-12T10:00:00Z"
}
```

---

## Pagination

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-based) |
| `limit` | integer | 20 | Items per page (max 100) |

### Example

```http
GET /api/v1/bookings?page=2&limit=10
```

---

## Filtering and Sorting

### Filtering

Use query parameters to filter results:

```http
GET /api/v1/bookings?status=confirmed&salonId=550e8400-e29b-41d4-a716-446655440000
```

### Sorting

Use `sort` and `order` parameters:

```http
GET /api/v1/bookings?sort=createdAt&order=desc
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort` | string | `createdAt` | Field to sort by |
| `order` | string | `desc` | Sort direction (`asc` or `desc`) |

---

## Rate Limiting

- **Standard Rate Limit**: 100 requests per minute
- **Authenticated Rate Limit**: 1000 requests per minute
- **Admin Rate Limit**: 10000 requests per minute

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620777600
```

---

## Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login user |
| POST | `/auth/register` | Register new user |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/verify-email` | Verify email address |
| POST | `/auth/change-password` | Change password |

### Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles` | List profiles |
| POST | `/profiles` | Create profile |
| GET | `/profiles/:id` | Get profile by ID |
| PUT | `/profiles/:id` | Update profile |
| DELETE | `/profiles/:id` | Delete profile |
| GET | `/profiles/me` | Get current user profile |

### Salons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/salons` | List salons |
| POST | `/salons` | Create salon |
| GET | `/salons/:id` | Get salon by ID |
| PUT | `/salons/:id` | Update salon |
| DELETE | `/salons/:id` | Delete salon |
| GET | `/salons/:id/stats` | Get salon statistics |

### Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | List services |
| POST | `/services` | Create service |
| GET | `/services/:id` | Get service by ID |
| PUT | `/services/:id` | Update service |
| DELETE | `/services/:id` | Delete service |
| GET | `/salons/:salonId/services` | Get services by salon |

### Staff

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/staff` | List staff |
| POST | `/staff` | Create staff |
| GET | `/staff/:id` | Get staff by ID |
| PUT | `/staff/:id` | Update staff |
| DELETE | `/staff/:id` | Delete staff |
| GET | `/salons/:salonId/staff` | Get staff by salon |
| GET | `/staff/:id/schedule` | Get staff schedule |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List customers |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Get customer by ID |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |
| GET | `/salons/:salonId/customers` | Get customers by salon |
| GET | `/customers/:id/history` | Get customer history |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | List bookings |
| POST | `/bookings` | Create booking |
| GET | `/bookings/:id` | Get booking by ID |
| PUT | `/bookings/:id` | Update booking |
| DELETE | `/bookings/:id` | Delete booking |
| GET | `/customers/:customerId/bookings` | Get bookings by customer |
| GET | `/staff/:staffId/bookings` | Get bookings by staff |
| GET | `/salons/:salonId/bookings` | Get bookings by salon |
| GET | `/bookings/available-slots` | Get available time slots |
| POST | `/bookings/:id/cancel` | Cancel booking |
| POST | `/bookings/:id/confirm` | Confirm booking |

### Vendors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vendors` | List vendors |
| POST | `/vendors` | Create vendor |
| GET | `/vendors/:id` | Get vendor by ID |
| PUT | `/vendors/:id` | Update vendor |
| DELETE | `/vendors/:id` | Delete vendor |
| GET | `/salons/:salonId/vendors` | Get vendors by salon |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products |
| POST | `/products` | Create product |
| GET | `/products/:id` | Get product by ID |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| GET | `/salons/:salonId/products` | Get products by salon |
| GET | `/vendors/:vendorId/products` | Get products by vendor |
| GET | `/products/low-stock` | Get low stock products |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | List inventory |
| POST | `/inventory` | Create inventory record |
| GET | `/inventory/:id` | Get inventory by ID |
| PUT | `/inventory/:id` | Update inventory |
| DELETE | `/inventory/:id` | Delete inventory |
| GET | `/salons/:salonId/inventory` | Get inventory by salon |
| GET | `/products/:productId/inventory` | Get inventory by product |
| POST | `/inventory/:id/adjust` | Adjust inventory quantity |
| GET | `/inventory/low-stock` | Get low stock items |
| GET | `/inventory/expiring-soon` | Get expiring items |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List orders |
| POST | `/orders` | Create order |
| GET | `/orders/:id` | Get order by ID |
| PUT | `/orders/:id` | Update order |
| DELETE | `/orders/:id` | Delete order |
| GET | `/salons/:salonId/orders` | Get orders by salon |
| GET | `/vendors/:vendorId/orders` | Get orders by vendor |
| GET | `/orders/:id/status` | Get order status |
| GET | `/orders/:id/items` | Get order items |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/salon/:id` | Get salon analytics |
| GET | `/analytics/staff/:id` | Get staff analytics |
| GET | `/analytics/revenue` | Get revenue analytics |
| GET | `/analytics/bookings` | Get booking analytics |
| GET | `/analytics/customers` | Get customer analytics |
| GET | `/analytics/inventory` | Get inventory analytics |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |

---

## Data Models

### User Roles

| Role | Description |
|------|-------------|
| `super_admin` | Full system access |
| `salon_owner` | Manage own salon |
| `staff_member` | Staff operations |
| `customer` | Customer operations |

### Booking Status

| Status | Description |
|--------|-------------|
| `pending` | Awaiting confirmation |
| `confirmed` | Confirmed booking |
| `in_progress` | Service in progress |
| `completed` | Service completed |
| `cancelled` | Booking cancelled |
| `no_show` | Customer did not show up |

### Service Status

| Status | Description |
|--------|-------------|
| `active` | Available for booking |
| `inactive` | Temporarily unavailable |
| `archived` | No longer offered |

### Staff Status

| Status | Description |
|--------|-------------|
| `active` | Active staff member |
| `inactive` | Temporarily inactive |
| `on_leave` | On leave |
| `terminated` | No longer employed |

---

## Usage Examples

### Create a Booking

```javascript
const response = await fetch('/api/v1/bookings', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <access_token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    salonId: '550e8400-e29b-41d4-a716-446655440000',
    customerId: '550e8400-e29b-41d4-a716-446655440001',
    staffId: '550e8400-e29b-41d4-a716-446655440002',
    serviceId: '550e8400-e29b-41d4-a716-446655440003',
    appointmentDate: '2026-05-15',
    startTime: '10:00',
    endTime: '10:30',
    notes: 'First time customer'
  })
});

const data = await response.json();
console.log(data);
```

### Get Available Time Slots

```javascript
const response = await fetch(
  '/api/v1/bookings/available-slots?salonId=550e8400-e29b-41d4-a716-446655440000&date=2026-05-15&serviceId=550e8400-e29b-41d4-a716-446655440003',
  {
    headers: {
      'Authorization': 'Bearer <access_token>'
    }
  }
);

const data = await response.json();
console.log(data);
```

### List Bookings with Pagination

```javascript
const response = await fetch(
  '/api/v1/bookings?page=1&limit=20&status=confirmed&sort=appointmentDate&order=asc',
  {
    headers: {
      'Authorization': 'Bearer <access_token>'
    }
  }
);

const data = await response.json();
console.log(data);
```

---

## SDK Integration

### JavaScript/TypeScript

```typescript
import { SalonAPI } from '@salon-management/sdk';

const api = new SalonAPI({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key'
});

// Create a booking
const booking = await api.bookings.create({
  salonId: '...',
  customerId: '...',
  staffId: '...',
  serviceId: '...',
  appointmentDate: '2026-05-15',
  startTime: '10:00',
  endTime: '10:30'
});
```

---

## Support

For support and questions:
- Email: support@example.com
- Documentation: https://docs.example.com
- API Status: https://status.example.com

---

**Last Updated**: 2026-05-12
**API Version**: 1.0.0
