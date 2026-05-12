# Repository Pattern Documentation

## Overview

The Repository Pattern is a design pattern that mediates between the domain and data mapping layers, acting like an in-memory domain object collection. In the Salon Management System API, the Repository Pattern provides a clean abstraction for data access operations.

## Why Repository Pattern?

### Benefits

1. **Separation of Concerns**: Separates business logic from data access logic
2. **Testability**: Easy to mock repositories for unit testing
3. **Maintainability**: Centralized data access logic
4. **Flexibility**: Easy to swap database implementations
5. **Type Safety**: Full TypeScript support with proper interfaces

### When to Use

- When you need to abstract database operations
- When you want to test business logic independently of data access
- When you need to support multiple data sources
- When you want to implement caching strategies

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Controllers                           │
│                  (Request Handling)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                      Services                            │
│                  (Business Logic)                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Repositories                           │
│                  (Data Access)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase                              │
│                  (Database)                              │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Base Repository Interface

```typescript
export interface IRepository<T> {
  findById(id: string): Promise<T>;
  findAll(options?: QueryOptions): Promise<T[]>;
  create(data: CreateDto): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

### 2. Base Repository Implementation

```typescript
export abstract class BaseRepository<T> implements IRepository<T> {
  protected tableName: string;
  protected cacheEnabled: boolean;

  constructor(tableName: string, cacheEnabled: boolean = true) {
    this.tableName = tableName;
    this.cacheEnabled = cacheEnabled;
  }

  async findById(id: string): Promise<T> {
    // Implementation
  }

  async findAll(options?: QueryOptions): Promise<T[]> {
    // Implementation
  }

  async create(data: CreateDto): Promise<T> {
    // Implementation
  }

  async update(id: string, data: UpdateDto): Promise<T> {
    // Implementation
  }

  async delete(id: string): Promise<void> {
    // Implementation
  }

  async exists(id: string): Promise<boolean> {
    // Implementation
  }
}
```

### 3. Entity-Specific Repository Interface

```typescript
export interface IBookingRepository extends IRepository<Booking> {
  findByCustomerId(customerId: string): Promise<Booking[]>;
  findByStaffId(staffId: string): Promise<Booking[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Booking[]>;
  findByStatus(status: BookingStatus): Promise<Booking[]>;
  findAvailableSlots(date: Date, serviceId: string): Promise<TimeSlot[]>;
}
```

### 4. Entity-Specific Repository Implementation

```typescript
export class BookingRepository extends BaseRepository<Booking> implements IBookingRepository {
  constructor() {
    super('bookings');
  }

  async findByCustomerId(customerId: string): Promise<Booking[]> {
    // Implementation
  }

  async findByStaffId(staffId: string): Promise<Booking[]> {
    // Implementation
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
    // Implementation
  }

  async findByStatus(status: BookingStatus): Promise<Booking[]> {
    // Implementation
  }

  async findAvailableSlots(date: Date, serviceId: string): Promise<TimeSlot[]> {
    // Implementation
  }
}
```

## Repository Methods

### CRUD Operations

#### Create

```typescript
async create(data: CreateDto): Promise<T> {
  const { data: result, error } = await supabase
    .from(this.tableName)
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new DatabaseException(error.message);
  }

  return result;
}
```

#### Read

```typescript
async findById(id: string): Promise<T> {
  const { data: result, error } = await supabase
    .from(this.tableName)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new NotFoundException(this.tableName, id);
  }

  return result;
}

async findAll(options?: QueryOptions): Promise<T[]> {
  let query = supabase.from(this.tableName).select('*');

  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + options.limit - 1);
  }

  const { data: result, error } = await query;

  if (error) {
    throw new DatabaseException(error.message);
  }

  return result || [];
}
```

#### Update

```typescript
async update(id: string, data: UpdateDto): Promise<T> {
  const { data: result, error } = await supabase
    .from(this.tableName)
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new DatabaseException(error.message);
  }

  return result;
}
```

#### Delete

```typescript
async delete(id: string): Promise<void> {
  const { error } = await supabase
    .from(this.tableName)
    .delete()
    .eq('id', id);

  if (error) {
    throw new DatabaseException(error.message);
  }
}
```

### Custom Query Methods

```typescript
async findByCustomerId(customerId: string): Promise<Booking[]> {
  const { data: result, error } = await supabase
    .from(this.tableName)
    .select('*')
    .eq('customer_id', customerId)
    .order('appointment_date', { ascending: true });

  if (error) {
    throw new DatabaseException(error.message);
  }

  return result || [];
}

async findAvailableSlots(date: Date, serviceId: string): Promise<TimeSlot[]> {
  // Complex query implementation
  const { data: result, error } = await supabase
    .from(this.tableName)
    .select('*')
    .eq('appointment_date', date.toISOString().split('T')[0])
    .eq('service_id', serviceId)
    .in('status', ['pending', 'confirmed']);

  if (error) {
    throw new DatabaseException(error.message);
  }

  // Process results to find available slots
  return this.calculateAvailableSlots(result || []);
}
```

## Caching Strategy

### Cache Implementation

```typescript
async findById(id: string): Promise<T> {
  // Check cache first
  if (this.cacheEnabled) {
    const cached = await cache.get(`${this.tableName}:${id}`);
    if (cached) {
      return cached;
    }
  }

  // Fetch from database
  const entity = await this.fetchFromDatabase(id);

  // Cache the result
  if (this.cacheEnabled) {
    await cache.set(`${this.tableName}:${id}`, entity, CacheTTL.USER_DATA);
  }

  return entity;
}
```

### Cache Invalidation

```typescript
async update(id: string, data: UpdateDto): Promise<T> {
  const result = await this.updateInDatabase(id, data);

  // Invalidate cache
  if (this.cacheEnabled) {
    await cache.delete(`${this.tableName}:${id}`);
    await cache.deletePattern(`${this.tableName}:list:*`);
  }

  return result;
}
```

## Error Handling

### Exception Hierarchy

```typescript
BaseException
├── DatabaseException
├── NotFoundException
├── ConflictException
└── ValidationException
```

### Error Handling in Repositories

```typescript
async findById(id: string): Promise<T> {
  try {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new DatabaseException(error.message);
    }

    if (!data) {
      throw new NotFoundException(this.tableName, id);
    }

    return data;
  } catch (error) {
    if (error instanceof BaseException) {
      throw error;
    }
    throw new DatabaseException(`Failed to find ${this.tableName}: ${error.message}`);
  }
}
```

## Testing

### Unit Testing Repositories

```typescript
describe('BookingRepository', () => {
  let repository: BookingRepository;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    repository = new BookingRepository(mockSupabase);
  });

  it('should find booking by ID', async () => {
    const booking = await repository.findById('booking-id');
    expect(booking).toBeDefined();
    expect(booking.id).toBe('booking-id');
  });

  it('should throw NotFoundException for non-existent booking', async () => {
    await expect(repository.findById('non-existent')).rejects.toThrow(NotFoundException);
  });
});
```

### Mocking Repositories

```typescript
class MockBookingRepository implements IBookingRepository {
  private data: Map<string, Booking> = new Map();

  async findById(id: string): Promise<Booking> {
    const booking = this.data.get(id);
    if (!booking) {
      throw new NotFoundException('Booking', id);
    }
    return booking;
  }

  // ... other methods
}
```

## Best Practices

### 1. Always Use Interfaces

```typescript
// Good
export interface IBookingRepository extends IRepository<Booking> {
  findByCustomerId(customerId: string): Promise<Booking[]>;
}

// Bad
export class BookingRepository {
  // No interface
}
```

### 2. Handle Errors Gracefully

```typescript
// Good
async findById(id: string): Promise<T> {
  try {
    const result = await this.fetchFromDatabase(id);
    return result;
  } catch (error) {
    logger.error(`Failed to find ${this.tableName}: ${error.message}`);
    throw new DatabaseException(`Failed to find ${this.tableName}`);
  }
}

// Bad
async findById(id: string): Promise<T> {
  return await this.fetchFromDatabase(id);
}
```

### 3. Use Caching Appropriately

```typescript
// Good - Cache frequently accessed data
async findById(id: string): Promise<T> {
  const cached = await cache.get(`${this.tableName}:${id}`);
  if (cached) {
    return cached;
  }
  const result = await this.fetchFromDatabase(id);
  await cache.set(`${this.tableName}:${id}`, result, CacheTTL.USER_DATA);
  return result;
}

// Bad - Don't cache real-time data
async findRealtimeBookings(): Promise<Booking[]> {
  // Don't cache real-time data
  return await this.fetchFromDatabase();
}
```

### 4. Validate Inputs

```typescript
// Good
async findById(id: string): Promise<T> {
  if (!id || typeof id !== 'string') {
    throw new ValidationException('Invalid ID format');
  }
  return await this.fetchFromDatabase(id);
}

// Bad
async findById(id: string): Promise<T> {
  return await this.fetchFromDatabase(id);
}
```

### 5. Use Transactions for Complex Operations

```typescript
async createBookingWithPayment(booking: CreateBookingDto, payment: CreatePaymentDto): Promise<Booking> {
  return await supabase.rpc('create_booking_with_payment', {
    p_booking: booking,
    p_payment: payment
  });
}
```

## Common Patterns

### 1. Pagination

```typescript
async findAllPaginated(page: number = 1, limit: number = 20): Promise<PaginatedResult<T>> {
  const offset = (page - 1) * limit;

  const { data, count } = await Promise.all([
    supabase.from(this.tableName)
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1),
    supabase.from(this.tableName)
      .select('*', { count: 'exact', head: true })
  ]);

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
}
```

### 2. Filtering

```typescript
async findAllWithFilters(filters: FilterOptions): Promise<T[]> {
  let query = supabase.from(this.tableName).select('*');

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data } = await query;
  return data || [];
}
```

### 3. Sorting

```typescript
async findAllSorted(sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<T[]> {
  const { data } = await supabase
    .from(this.tableName)
    .select('*')
    .order(sortBy, { ascending: sortOrder === 'asc' });

  return data || [];
}
```

### 4. Searching

```typescript
async search(query: string): Promise<T[]> {
  const { data } = await supabase
    .from(this.tableName)
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

  return data || [];
}
```

## Migration Guide

### From Direct Supabase Access to Repository Pattern

**Before:**
```typescript
const { data } = await supabase
  .from('bookings')
  .select('*')
  .eq('customer_id', customerId);
```

**After:**
```typescript
const bookingRepository = new BookingRepository();
const bookings = await bookingRepository.findByCustomerId(customerId);
```

### Benefits of Migration

1. **Type Safety**: Full TypeScript support
2. **Error Handling**: Consistent error handling
3. **Caching**: Built-in caching support
4. **Testing**: Easy to mock and test
5. **Maintainability**: Centralized data access logic

## Conclusion

The Repository Pattern provides a clean, maintainable way to handle data access in the Salon Management System API. By following the patterns and best practices outlined in this documentation, you can ensure that your data access layer is robust, testable, and maintainable.

---

**Last Updated**: 2026-05-12
**Version**: 1.0.0
