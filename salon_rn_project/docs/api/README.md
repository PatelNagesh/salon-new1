# API Documentation

This section contains comprehensive API documentation for all services in the Salon Management System.

## Available APIs

### Authentication API
[auth-api.md](auth-api.md) - Authentication and authorization endpoints

### Booking API
[booking-api.md](booking-api.md) - Booking and appointment management

### Salon API
[salon-api.md](salon-api.md) - Salon management and analytics

### Staff API
[staff-api.md](staff-api.md) - Staff management and scheduling

### Customer API
[customer-api.md](customer-api.md) - Customer profile and history

## API Standards

### Request Format
- Content-Type: `application/json`
- Authentication: Bearer token in Authorization header
- Timezone: UTC

### Response Format
```json
{
  "data": { /* response data */ },
  "error": null,
  "status": "success"
}
```

### Error Response
```json
{
  "data": null,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { /* additional details */ }
  },
  "status": "error"
}
```

## Authentication

All API endpoints require authentication except for:
- `POST /auth/signup`
- `POST /auth/signin`
- `POST /auth/reset-password`

Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per user
- Rate limit headers included in responses

## Pagination

List endpoints support pagination:

```
GET /api/resource?page=1&limit=20
```

Response includes pagination metadata:

```json
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Versioning

Current API version: `v1`

Include version in URL:

```
https://api.example.com/v1/resource
```

---

**Last Updated**: 2026-05-09
