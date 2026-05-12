# API Usage Examples

This document provides practical code examples for using the Salon Management System API. Each example demonstrates common use cases and best practices.

## Table of Contents

1. [Authentication](#authentication)
2. [Bookings](#bookings)
3. [Customers](#customers)
4. [Staff](#staff)
5. [Services](#services)
6. [Salons](#salons)
7. [Vendors](#vendors)
8. [Products](#products)
9. [Inventory](#inventory)
10. [Orders](#orders)
11. [Error Handling](#error-handling)
12. [Pagination](#pagination)
13. [Filtering and Sorting](#filtering-and-sorting)
14. [Caching](#caching)

## Authentication

### Login

```typescript
import { AuthService } from '../api/services/implementations/AuthService';
import { LoginDto } from '../api/dto/requests/auth.dto';

const authService = new AuthService();

async function login(email: string, password: string) {
  try {
    const loginDto: LoginDto = {
      email,
      password
    };

    const result = await authService.login(loginDto);

    console.log('Login successful:', result);
    // Store token for subsequent requests
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));

    return result;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Usage
login('user@example.com', 'password123');
```

### Register

```typescript
import { AuthService } from '../api/services/implementations/AuthService';
import { RegisterDto } from '../api/dto/requests/auth.dto';

const authService = new AuthService();

async function register(email: string, password: string, name: string) {
  try {
    const registerDto: RegisterDto = {
      email,
      password,
      name
    };

    const result = await authService.register(registerDto);

    console.log('Registration successful:', result);
    return result;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Usage
register('newuser@example.com', 'password123', 'John Doe');
```

### Logout

```typescript
import { AuthService } from '../api/services/implementations/AuthService';

const authService = new AuthService();

async function logout() {
  try {
    await authService.logout();

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    console.log('Logout successful');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

// Usage
logout();
```

## Bookings

### Create Booking

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';
import { CreateBookingDto } from '../api/dto/requests/booking.dto';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function createBooking(bookingData: CreateBookingDto) {
  try {
    const booking = await bookingService.create(bookingData);

    console.log('Booking created:', booking);
    return booking;
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
}

// Usage
createBooking({
  customerId: 'uuid-customer-id',
  staffId: 'uuid-staff-id',
  serviceId: 'uuid-service-id',
  appointmentDate: '2026-05-15',
  startTime: '10:00',
  endTime: '11:00',
  status: 'pending',
  notes: 'First time customer'
});
```

### Get Booking by ID

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function getBooking(bookingId: string) {
  try {
    const booking = await bookingService.findById(bookingId);

    console.log('Booking found:', booking);
    return booking;
  } catch (error) {
    if (error instanceof NotFoundException) {
      console.error('Booking not found');
    } else {
      console.error('Failed to get booking:', error);
    }
    throw error;
  }
}

// Usage
getBooking('uuid-booking-id');
```

### Get All Bookings

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';
import { QueryOptions } from '../api/types/common.types';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function getAllBookings(options?: QueryOptions) {
  try {
    const bookings = await bookingService.findAll(options);

    console.log('Bookings found:', bookings.length);
    return bookings;
  } catch (error) {
    console.error('Failed to get bookings:', error);
    throw error;
  }
}

// Usage
getAllBookings({
  filters: { status: 'confirmed' },
  orderBy: { field: 'appointment_date', ascending: true },
  limit: 20,
  offset: 0
});
```

### Get Bookings by Customer

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function getCustomerBookings(customerId: string) {
  try {
    const bookings = await bookingService.findByCustomerId(customerId);

    console.log('Customer bookings:', bookings);
    return bookings;
  } catch (error) {
    console.error('Failed to get customer bookings:', error);
    throw error;
  }
}

// Usage
getCustomerBookings('uuid-customer-id');
```

### Update Booking

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';
import { UpdateBookingDto } from '../api/dto/requests/booking.dto';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function updateBooking(bookingId: string, updates: UpdateBookingDto) {
  try {
    const booking = await bookingService.update(bookingId, updates);

    console.log('Booking updated:', booking);
    return booking;
  } catch (error) {
    console.error('Failed to update booking:', error);
    throw error;
  }
}

// Usage
updateBooking('uuid-booking-id', {
  status: 'confirmed',
  notes: 'Customer confirmed appointment'
});
```

### Cancel Booking

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function cancelBooking(bookingId: string) {
  try {
    await bookingService.cancel(bookingId);

    console.log('Booking cancelled successfully');
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    throw error;
  }
}

// Usage
cancelBooking('uuid-booking-id');
```

### Get Available Time Slots

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function getAvailableSlots(date: Date, serviceId: string) {
  try {
    const slots = await bookingService.getAvailableSlots(date, serviceId);

    console.log('Available slots:', slots);
    return slots;
  } catch (error) {
    console.error('Failed to get available slots:', error);
    throw error;
  }
}

// Usage
getAvailableSlots(new Date('2026-05-15'), 'uuid-service-id');
```

## Customers

### Create Customer

```typescript
import { CustomerService } from '../api/services/implementations/CustomerService';
import { CustomerRepository } from '../api/repositories/implementations/CustomerRepository';
import { CreateCustomerDto } from '../api/dto/requests/customer.dto';

const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);

async function createCustomer(customerData: CreateCustomerDto) {
  try {
    const customer = await customerService.create(customerData);

    console.log('Customer created:', customer);
    return customer;
  } catch (error) {
    console.error('Failed to create customer:', error);
    throw error;
  }
}

// Usage
createCustomer({
  userId: 'uuid-user-id',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  dateOfBirth: '1990-01-01',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  }
});
```

### Get Customer by ID

```typescript
import { CustomerService } from '../api/services/implementations/CustomerService';
import { CustomerRepository } from '../api/repositories/implementations/CustomerRepository';

const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);

async function getCustomer(customerId: string) {
  try {
    const customer = await customerService.findById(customerId);

    console.log('Customer found:', customer);
    return customer;
  } catch (error) {
    console.error('Failed to get customer:', error);
    throw error;
  }
}

// Usage
getCustomer('uuid-customer-id');
```

### Update Customer

```typescript
import { CustomerService } from '../api/services/implementations/CustomerService';
import { CustomerRepository } from '../api/repositories/implementations/CustomerRepository';
import { UpdateCustomerDto } from '../api/dto/requests/customer.dto';

const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);

async function updateCustomer(customerId: string, updates: UpdateCustomerDto) {
  try {
    const customer = await customerService.update(customerId, updates);

    console.log('Customer updated:', customer);
    return customer;
  } catch (error) {
    console.error('Failed to update customer:', error);
    throw error;
  }
}

// Usage
updateCustomer('uuid-customer-id', {
  phone: '+9876543210',
  address: {
    street: '456 New St',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    country: 'USA'
  }
});
```

### Get Customer Booking History

```typescript
import { CustomerService } from '../api/services/implementations/CustomerService';
import { CustomerRepository } from '../api/repositories/implementations/CustomerRepository';

const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);

async function getCustomerHistory(customerId: string) {
  try {
    const history = await customerService.getBookingHistory(customerId);

    console.log('Customer booking history:', history);
    return history;
  } catch (error) {
    console.error('Failed to get customer history:', error);
    throw error;
  }
}

// Usage
getCustomerHistory('uuid-customer-id');
```

## Staff

### Create Staff Member

```typescript
import { StaffService } from '../api/services/implementations/StaffService';
import { StaffRepository } from '../api/repositories/implementations/StaffRepository';
import { CreateStaffDto } from '../api/dto/requests/staff.dto';

const staffRepository = new StaffRepository();
const staffService = new StaffService(staffRepository);

async function createStaff(staffData: CreateStaffDto) {
  try {
    const staff = await staffService.create(staffData);

    console.log('Staff created:', staff);
    return staff;
  } catch (error) {
    console.error('Failed to create staff:', error);
    throw error;
  }
}

// Usage
createStaff({
  salonId: 'uuid-salon-id',
  userId: 'uuid-user-id',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+1234567890',
  role: 'stylist',
  specializations: ['haircut', 'coloring'],
  hourlyRate: 50,
  commissionRate: 0.2
});
```

### Get Staff Schedule

```typescript
import { StaffService } from '../api/services/implementations/StaffService';
import { StaffRepository } from '../api/repositories/implementations/StaffRepository';

const staffRepository = new StaffRepository();
const staffService = new StaffService(staffRepository);

async function getStaffSchedule(staffId: string, startDate: Date, endDate: Date) {
  try {
    const schedule = await staffService.getSchedule(staffId, startDate, endDate);

    console.log('Staff schedule:', schedule);
    return schedule;
  } catch (error) {
    console.error('Failed to get staff schedule:', error);
    throw error;
  }
}

// Usage
getStaffSchedule(
  'uuid-staff-id',
  new Date('2026-05-01'),
  new Date('2026-05-31')
);
```

### Get Staff Performance

```typescript
import { StaffService } from '../api/services/implementations/StaffService';
import { StaffRepository } from '../api/repositories/implementations/StaffRepository';

const staffRepository = new StaffRepository();
const staffService = new StaffService(staffRepository);

async function getStaffPerformance(staffId: string, startDate: Date, endDate: Date) {
  try {
    const performance = await staffService.getPerformance(staffId, startDate, endDate);

    console.log('Staff performance:', performance);
    return performance;
  } catch (error) {
    console.error('Failed to get staff performance:', error);
    throw error;
  }
}

// Usage
getStaffPerformance(
  'uuid-staff-id',
  new Date('2026-05-01'),
  new Date('2026-05-31')
);
```

## Services

### Create Service

```typescript
import { ServiceService } from '../api/services/implementations/ServiceService';
import { ServiceRepository } from '../api/repositories/implementations/ServiceRepository';
import { CreateServiceDto } from '../api/dto/requests/service.dto';

const serviceRepository = new ServiceRepository();
const serviceService = new ServiceService(serviceRepository);

async function createService(serviceData: CreateServiceDto) {
  try {
    const service = await serviceService.create(serviceData);

    console.log('Service created:', service);
    return service;
  } catch (error) {
    console.error('Failed to create service:', error);
    throw error;
  }
}

// Usage
createService({
  salonId: 'uuid-salon-id',
  name: 'Haircut',
  description: 'Professional haircut service',
  category: 'hair',
  duration: 30,
  price: 50,
  isActive: true
});
```

### Get Services by Category

```typescript
import { ServiceService } from '../api/services/implementations/ServiceService';
import { ServiceRepository } from '../api/repositories/implementations/ServiceRepository';

const serviceRepository = new ServiceRepository();
const serviceService = new ServiceService(serviceRepository);

async function getServicesByCategory(category: string) {
  try {
    const services = await serviceService.findByCategory(category);

    console.log('Services in category:', services);
    return services;
  } catch (error) {
    console.error('Failed to get services by category:', error);
    throw error;
  }
}

// Usage
getServicesByCategory('hair');
```

## Salons

### Create Salon

```typescript
import { SalonService } from '../api/services/implementations/SalonService';
import { SalonRepository } from '../api/repositories/implementations/SalonRepository';
import { CreateSalonDto } from '../api/dto/requests/salon.dto';

const salonRepository = new SalonRepository();
const salonService = new SalonService(salonRepository);

async function createSalon(salonData: CreateSalonDto) {
  try {
    const salon = await salonService.create(salonData);

    console.log('Salon created:', salon);
    return salon;
  } catch (error) {
    console.error('Failed to create salon:', error);
    throw error;
  }
}

// Usage
createSalon({
  ownerId: 'uuid-owner-id',
  name: 'Beauty Salon',
  description: 'Full-service beauty salon',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  phone: '+1234567890',
  email: 'contact@beautysalon.com',
  businessHours: {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '20:00' },
    saturday: { open: '10:00', close: '18:00' },
    sunday: { open: 'closed', close: 'closed' }
  }
});
```

## Vendors

### Create Vendor

```typescript
import { VendorService } from '../api/services/implementations/VendorService';
import { VendorRepository } from '../api/repositories/implementations/VendorRepository';
import { CreateVendorDto } from '../api/dto/requests/vendor.dto';

const vendorRepository = new VendorRepository();
const vendorService = new VendorService(vendorRepository);

async function createVendor(vendorData: CreateVendorDto) {
  try {
    const vendor = await vendorService.create(vendorData);

    console.log('Vendor created:', vendor);
    return vendor;
  } catch (error) {
    console.error('Failed to create vendor:', error);
    throw error;
  }
}

// Usage
createVendor({
  salonId: 'uuid-salon-id',
  name: 'Beauty Supply Co',
  contactPerson: 'John Johnson',
  email: 'john@beautysupply.com',
  phone: '+1234567890',
  address: {
    street: '456 Supply St',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    country: 'USA'
  },
  paymentTerms: 'NET30',
  notes: 'Primary hair product supplier'
});
```

## Products

### Create Product

```typescript
import { ProductService } from '../api/services/implementations/ProductService';
import { ProductRepository } from '../api/repositories/implementations/ProductRepository';
import { CreateProductDto } from '../api/dto/requests/product.dto';

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

async function createProduct(productData: CreateProductDto) {
  try {
    const product = await productService.create(productData);

    console.log('Product created:', product);
    return product;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}

// Usage
createProduct({
  salonId: 'uuid-salon-id',
  vendorId: 'uuid-vendor-id',
  name: 'Premium Shampoo',
  description: 'High-quality shampoo for all hair types',
  category: 'haircare',
  sku: 'SHAM-001',
  price: 25.99,
  cost: 15.00,
  unit: 'bottle',
  isActive: true
});
```

## Inventory

### Create Inventory Item

```typescript
import { InventoryService } from '../api/services/implementations/InventoryService';
import { InventoryRepository } from '../api/repositories/implementations/InventoryRepository';
import { CreateInventoryDto } from '../api/dto/requests/inventory.dto';

const inventoryRepository = new InventoryRepository();
const inventoryService = new InventoryService(inventoryRepository);

async function createInventoryItem(inventoryData: CreateInventoryDto) {
  try {
    const inventory = await inventoryService.create(inventoryData);

    console.log('Inventory item created:', inventory);
    return inventory;
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    throw error;
  }
}

// Usage
createInventoryItem({
  salonId: 'uuid-salon-id',
  productId: 'uuid-product-id',
  quantity: 100,
  minimumQuantity: 20,
  location: 'Shelf A1',
  expiryDate: '2026-12-31'
});
```

### Update Inventory Quantity

```typescript
import { InventoryService } from '../api/services/implementations/InventoryService';
import { InventoryRepository } from '../api/repositories/implementations/InventoryRepository';

const inventoryRepository = new InventoryRepository();
const inventoryService = new InventoryService(inventoryRepository);

async function updateInventoryQuantity(inventoryId: string, quantity: number) {
  try {
    await inventoryService.updateQuantity(inventoryId, quantity);

    console.log('Inventory quantity updated');
  } catch (error) {
    console.error('Failed to update inventory quantity:', error);
    throw error;
  }
}

// Usage
updateInventoryQuantity('uuid-inventory-id', 80);
```

## Orders

### Create Order

```typescript
import { OrderService } from '../api/services/implementations/OrderService';
import { OrderRepository } from '../api/repositories/implementations/OrderRepository';
import { CreateOrderDto } from '../api/dto/requests/order.dto';

const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);

async function createOrder(orderData: CreateOrderDto) {
  try {
    const order = await orderService.create(orderData);

    console.log('Order created:', order);
    return order;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}

// Usage
createOrder({
  salonId: 'uuid-salon-id',
  vendorId: 'uuid-vendor-id',
  items: [
    {
      productId: 'uuid-product-id',
      quantity: 10,
      unitPrice: 15.00
    }
  ],
  totalAmount: 150.00,
  status: 'pending',
  expectedDeliveryDate: '2026-05-20'
});
```

## Error Handling

### Basic Error Handling

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';
import {
  NotFoundException,
  ValidationException,
  ConflictException,
  DatabaseException
} from '../api/exceptions';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function handleBooking(bookingId: string) {
  try {
    const booking = await bookingService.findById(bookingId);
    console.log('Booking found:', booking);
    return booking;
  } catch (error) {
    if (error instanceof NotFoundException) {
      console.error('Booking not found:', error.message);
    } else if (error instanceof ValidationException) {
      console.error('Validation error:', error.message);
    } else if (error instanceof ConflictException) {
      console.error('Conflict error:', error.message);
    } else if (error instanceof DatabaseException) {
      console.error('Database error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

// Usage
handleBooking('uuid-booking-id');
```

### Advanced Error Handling with Retry

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';
import { DatabaseException } from '../api/exceptions';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function handleBookingWithRetry(bookingId: string, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const booking = await bookingService.findById(bookingId);
      console.log('Booking found:', booking);
      return booking;
    } catch (error) {
      lastError = error;

      if (error instanceof DatabaseException && attempt < maxRetries) {
        console.log(`Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        break;
      }
    }
  }

  console.error('All attempts failed:', lastError);
  throw lastError;
}

// Usage
handleBookingWithRetry('uuid-booking-id');
```

## Pagination

### Basic Pagination

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';
import { QueryOptions } from '../api/types/common.types';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function getBookingsPaginated(page: number = 1, limit: number = 20) {
  try {
    const options: QueryOptions = {
      offset: (page - 1) * limit,
      limit: limit,
      orderBy: { field: 'appointment_date', ascending: true }
    };

    const bookings = await bookingService.findAll(options);

    console.log(`Page ${page} of bookings:`, bookings.length);
    return bookings;
  } catch (error) {
    console.error('Failed to get paginated bookings:', error);
    throw error;
  }
}

// Usage
getBookingsPaginated(1, 20);
```

### Pagination with Total Count

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function getBookingsWithPagination(page: number = 1, limit: number = 20) {
  try {
    const { data, total } = await bookingService.findAllPaginated(page, limit);

    const result = {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    console.log('Paginated result:', result);
    return result;
  } catch (error) {
    console.error('Failed to get paginated bookings:', error);
    throw error;
  }
}

// Usage
getBookingsWithPagination(1, 20);
```

## Filtering and Sorting

### Filter by Status

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';
import { QueryOptions } from '../api/types/common.types';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function getBookingsByStatus(status: string) {
  try {
    const options: QueryOptions = {
      filters: { status },
      orderBy: { field: 'appointment_date', ascending: true }
    };

    const bookings = await bookingService.findAll(options);

    console.log(`Bookings with status ${status}:`, bookings);
    return bookings;
  } catch (error) {
    console.error('Failed to filter bookings:', error);
    throw error;
  }
}

// Usage
getBookingsByStatus('confirmed');
```

### Filter by Date Range

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function getBookingsByDateRange(startDate: Date, endDate: Date) {
  try {
    const bookings = await bookingService.findByDateRange(startDate, endDate);

    console.log('Bookings in date range:', bookings);
    return bookings;
  } catch (error) {
    console.error('Failed to get bookings by date range:', error);
    throw error;
  }
}

// Usage
getBookingsByDateRange(
  new Date('2026-05-01'),
  new Date('2026-05-31')
);
```

### Sort by Multiple Fields

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';
import { QueryOptions } from '../api/types/common.types';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function getBookingsSorted() {
  try {
    const options: QueryOptions = {
      orderBy: { field: 'appointment_date', ascending: true }
    };

    const bookings = await bookingService.findAll(options);

    console.log('Sorted bookings:', bookings);
    return bookings;
  } catch (error) {
    console.error('Failed to sort bookings:', error);
    throw error;
  }
}

// Usage
getBookingsSorted();
```

## Caching

### Enable Caching

```typescript
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';

// Create repository with caching enabled
const bookingRepository = new BookingRepository();

// Caching is enabled by default
// You can disable it if needed
// bookingRepository.setCacheEnabled(false);
```

### Manual Cache Invalidation

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';

const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);

async function updateBookingAndInvalidateCache(bookingId: string, updates: any) {
  try {
    // Update booking (this automatically invalidates cache)
    const booking = await bookingService.update(bookingId, updates);

    console.log('Booking updated and cache invalidated:', booking);
    return booking;
  } catch (error) {
    console.error('Failed to update booking:', error);
    throw error;
  }
}

// Usage
updateBookingAndInvalidateCache('uuid-booking-id', { status: 'confirmed' });
```

### Clear All Cache

```typescript
import { CacheManager } from '../api/utils/cache.util';

const cacheManager = new CacheManager();

async function clearAllCache() {
  try {
    await cacheManager.clear();

    console.log('All cache cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error);
    throw error;
  }
}

// Usage
clearAllCache();
```

## Complete Example: Booking Flow

```typescript
import { BookingService } from '../api/services/implementations/BookingService';
import { CustomerService } from '../api/services/implementations/CustomerService';
import { ServiceService } from '../api/services/implementations/ServiceService';
import { StaffService } from '../api/services/implementations/StaffService';
import {
  BookingRepository,
  CustomerRepository,
  ServiceRepository,
  StaffRepository
} from '../api/repositories/implementations';
import { CreateBookingDto } from '../api/dto/requests/booking.dto';

// Initialize services
const bookingRepository = new BookingRepository();
const customerRepository = new CustomerRepository();
const serviceRepository = new ServiceRepository();
const staffRepository = new StaffRepository();

const bookingService = new BookingService(bookingRepository);
const customerService = new CustomerService(customerRepository);
const serviceService = new ServiceService(serviceRepository);
const staffService = new StaffService(staffRepository);

async function completeBookingFlow(
  customerId: string,
  serviceId: string,
  staffId: string,
  appointmentDate: string,
  startTime: string
) {
  try {
    // Step 1: Verify customer exists
    const customer = await customerService.findById(customerId);
    console.log('Customer verified:', customer.name);

    // Step 2: Verify service exists
    const service = await serviceService.findById(serviceId);
    console.log('Service verified:', service.name);

    // Step 3: Verify staff exists
    const staff = await staffService.findById(staffId);
    console.log('Staff verified:', staff.name);

    // Step 4: Calculate end time based on service duration
    const endTime = calculateEndTime(startTime, service.duration);

    // Step 5: Check availability
    const availableSlots = await bookingService.getAvailableSlots(
      new Date(appointmentDate),
      serviceId
    );

    const isAvailable = availableSlots.some(
      slot => slot.startTime === startTime && slot.endTime === endTime
    );

    if (!isAvailable) {
      throw new Error('Time slot not available');
    }

    // Step 6: Create booking
    const bookingData: CreateBookingDto = {
      customerId,
      staffId,
      serviceId,
      appointmentDate,
      startTime,
      endTime,
      status: 'pending'
    };

    const booking = await bookingService.create(bookingData);
    console.log('Booking created successfully:', booking);

    return booking;
  } catch (error) {
    console.error('Booking flow failed:', error);
    throw error;
  }
}

function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

// Usage
completeBookingFlow(
  'uuid-customer-id',
  'uuid-service-id',
  'uuid-staff-id',
  '2026-05-15',
  '10:00'
);
```

## Best Practices

### 1. Always Handle Errors

```typescript
// Good
try {
  const booking = await bookingService.findById(id);
  return booking;
} catch (error) {
  console.error('Failed to get booking:', error);
  throw error;
}

// Bad
const booking = await bookingService.findById(id);
return booking;
```

### 2. Use Type Safety

```typescript
// Good
import type { Booking } from '../api/types/common.types';

async function getBooking(id: string): Promise<Booking> {
  return await bookingService.findById(id);
}

// Bad
async function getBooking(id: string) {
  return await bookingService.findById(id);
}
```

### 3. Validate Input

```typescript
// Good
import { uuidSchema } from '../api/validators/common.validators';

async function getBooking(id: string) {
  const validatedId = uuidSchema.parse(id);
  return await bookingService.findById(validatedId);
}

// Bad
async function getBooking(id: string) {
  return await bookingService.findById(id);
}
```

### 4. Use Pagination

```typescript
// Good
async function getAllBookings(page: number = 1, limit: number = 20) {
  return await bookingService.findAll({
    offset: (page - 1) * limit,
    limit
  });
}

// Bad
async function getAllBookings() {
  return await bookingService.findAll();
}
```

### 5. Cache Appropriately

```typescript
// Good - Cache frequently accessed data
async function getCustomer(id: string) {
  return await customerService.findById(id);
}

// Bad - Don't cache real-time data
async function getRealtimeBookings() {
  return await bookingService.findAll();
}
```

---

**Last Updated**: 2026-05-12
**Version**: 1.0.0
