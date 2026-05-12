# Salon Management API

A professional-grade API layer for the Salon Management System, built with TypeScript and following the Repository Pattern.

## Overview

This API provides a clean, type-safe interface for managing salon operations including bookings, staff, customers, services, inventory, and more. It serves as a bridge between the React Native frontend and the Supabase backend.

## Features

- ✅ **Repository Pattern**: Clean separation of concerns with dedicated layers
- ✅ **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **Validation**: Zod-based validation for all inputs
- ✅ **Error Handling**: Centralized error handling with custom exceptions
- ✅ **Caching**: Built-in caching support for performance optimization
- ✅ **Middleware**: Authentication, authorization, logging, and validation middleware
- ✅ **Configuration**: Environment-specific configuration management
- ✅ **Testing**: Comprehensive test coverage

## Architecture

```
Controllers (Request Handling)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Supabase (Database)
```

## Installation

```bash
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Configuration
API_VERSION=1.0.0
API_BASE_URL=/api/v1
API_TIMEOUT=30000

# Cache Configuration
CACHE_ENABLED=true
CACHE_DEFAULT_TTL=300

# Logger Configuration
LOG_LEVEL=info
LOG_ENABLE_CONSOLE=true
LOG_ENABLE_FILE=false

# Environment
NODE_ENV=development
PORT=3000
```

## Usage

### Basic Usage

```typescript
import { getSupabaseClient } from './api';

// Get Supabase client
const supabase = getSupabaseClient();

// Use the client
const { data, error } = await supabase
  .from('bookings')
  .select('*');
```

### Using Repositories

```typescript
import { BookingRepository } from './api';

const bookingRepository = new BookingRepository();

// Find booking by ID
const booking = await bookingRepository.findById('booking-id');

// Create new booking
const newBooking = await bookingRepository.create({
  salonId: 'salon-id',
  customerId: 'customer-id',
  staffId: 'staff-id',
  serviceId: 'service-id',
  appointmentDate: '2026-05-15',
  startTime: '10:00',
  endTime: '10:30'
});
```

### Using Services

```typescript
import { BookingService } from './api';

const bookingService = new BookingService(bookingRepository);

// Create booking with business logic
const booking = await bookingService.create({
  salonId: 'salon-id',
  customerId: 'customer-id',
  staffId: 'staff-id',
  serviceId: 'service-id',
  appointmentDate: '2026-05-15',
  startTime: '10:00',
  endTime: '10:30'
});
```

### Using Validators

```typescript
import { bookingValidator } from './api';

// Validate booking data
const data = {
  salonId: 'salon-id',
  customerId: 'customer-id',
  staffId: 'staff-id',
  serviceId: 'service-id',
  appointmentDate: '2026-05-15',
  startTime: '10:00',
  endTime: '10:30'
};

const validatedData = bookingValidator.validateCreate(data);
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token

### Profiles
- `GET /profiles` - List profiles
- `POST /profiles` - Create profile
- `GET /profiles/:id` - Get profile by ID
- `PUT /profiles/:id` - Update profile
- `DELETE /profiles/:id` - Delete profile

### Salons
- `GET /salons` - List salons
- `POST /salons` - Create salon
- `GET /salons/:id` - Get salon by ID
- `PUT /salons/:id` - Update salon
- `DELETE /salons/:id` - Delete salon

### Services
- `GET /services` - List services
- `POST /services` - Create service
- `GET /services/:id` - Get service by ID
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service

### Staff
- `GET /staff` - List staff
- `POST /staff` - Create staff
- `GET /staff/:id` - Get staff by ID
- `PUT /staff/:id` - Update staff
- `DELETE /staff/:id` - Delete staff

### Customers
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `GET /customers/:id` - Get customer by ID
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Bookings
- `GET /bookings` - List bookings
- `POST /bookings` - Create booking
- `GET /bookings/:id` - Get booking by ID
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Delete booking

### Vendors
- `GET /vendors` - List vendors
- `POST /vendors` - Create vendor
- `GET /vendors/:id` - Get vendor by ID
- `PUT /vendors/:id` - Update vendor
- `DELETE /vendors/:id` - Delete vendor

### Products
- `GET /products` - List products
- `POST /products` - Create product
- `GET /products/:id` - Get product by ID
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Inventory
- `GET /inventory` - List inventory
- `POST /inventory` - Create inventory record
- `GET /inventory/:id` - Get inventory by ID
- `PUT /inventory/:id` - Update inventory
- `DELETE /inventory/:id` - Delete inventory

### Orders
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

## Error Handling

All errors follow a consistent format:

```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Error message",
    details: { ... }
  },
  timestamp: "2026-05-12T10:00:00Z"
}
```

### Error Codes

- `AUTH_001` - Invalid credentials
- `AUTH_002` - Token expired
- `VAL_001` - Invalid input
- `NOT_FOUND_001` - Resource not found
- `CONFLICT_001` - Duplicate resource
- `FORBIDDEN_001` - Access denied
- `SERVER_001` - Internal server error

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Documentation

- [API Documentation](./docs/API_DOCUMENTATION.md) - Complete API reference
- [Architecture Documentation](../docs/api/API_ARCHITECTURE.md) - System architecture
- [Implementation Tracker](../docs/api/PHASE_7_IMPLEMENTATION_TRACKER.md) - Implementation progress

## Contributing

1. Follow the Repository Pattern
2. Write tests for all new code
3. Update documentation
4. Follow the commit message format: `phase-7-task-#N: description`

## License

MIT

## Support

For support and questions, please contact the development team.
