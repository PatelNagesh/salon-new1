# Migration Guide

## Overview

This guide provides step-by-step instructions for migrating from direct Supabase access to the new Repository Pattern API layer.

## Prerequisites

- Node.js 18+ installed
- Existing React Native app with Supabase integration
- Git repository with current code

## Migration Steps

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js zod lodash date-fns
```

### Step 2: Copy API Layer

```bash
# Copy the API directory to your project
cp -r API/ ./src/api/

# Or if using a separate repository
git clone <api-repo-url> ./src/api
```

### Step 3: Update Imports

**Before:**
```typescript
import { supabase } from '../supabase/client';
```

**After:**
```typescript
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';
import { BookingService } from '../api/services/implementations/BookingService';
```

### Step 4: Migrate Services

#### Example: Booking Service Migration

**Before:**
```typescript
// services/BookingService.ts
import { supabase } from '../supabase/client';

export const BookingService = {
  async getBookings() {
    const { data } = await supabase.from('bookings').select('*');
    return data;
  },

  async createBooking(booking) {
    const { data } = await supabase.from('bookings').insert(booking).select();
    return data;
  }
};
```

**After:**
```typescript
// services/BookingService.ts
import { BookingRepository } from '../api/repositories/implementations/BookingRepository';
import { BookingService as ApiBookingService } from '../api/services/implementations/BookingService';

const bookingRepository = new BookingRepository();
const bookingService = new ApiBookingService(bookingRepository);

export const BookingService = {
  async getBookings() {
    return await bookingService.findAll();
  },

  async createBooking(booking) {
    return await bookingService.create(booking);
  }
};
```

### Step 5: Migrate Screens

#### Example: Booking Screen Migration

**Before:**
```typescript
// screens/BookingScreen.tsx
import { supabase } from '../supabase/client';
import { useState, useEffect } from 'react';

export default function BookingScreen() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    const { data } = await supabase.from('bookings').select('*');
    setBookings(data);
  }

  async function createBooking(booking) {
    const { data } = await supabase.from('bookings').insert(booking).select();
    setBookings([...bookings, data]);
  }

  return (
    // JSX
  );
}
```

**After:**
```typescript
// screens/BookingScreen.tsx
import { BookingService } from '../services/BookingService';
import { useState, useEffect } from 'react';

export default function BookingScreen() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    const data = await BookingService.getBookings();
    setBookings(data);
  }

  async function createBooking(booking) {
    const data = await BookingService.createBooking(booking);
    setBookings([...bookings, data]);
  }

  return (
    // JSX
  );
}
```

### Step 6: Update Error Handling

**Before:**
```typescript
try {
  const { data, error } = await supabase.from('bookings').insert(booking);
  if (error) {
    console.error('Error creating booking:', error);
  }
} catch (err) {
  console.error('Unexpected error:', err);
}
```

**After:**
```typescript
try {
  const data = await BookingService.createBooking(booking);
  console.log('Booking created:', data);
} catch (error) {
  if (error instanceof NotFoundException) {
    console.error('Resource not found:', error.message);
  } else if (error instanceof ValidationException) {
    console.error('Validation error:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Step 7: Update Type Definitions

**Before:**
```typescript
interface Booking {
  id: string;
  customer_id: string;
  staff_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
}
```

**After:**
```typescript
import type { Booking } from '../api/types/common.types';

// Use the imported type
```

### Step 8: Update Configuration

**Before:**
```typescript
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
```

**After:**
```typescript
import { getSupabaseClient } from '../api/config/supabase.config';

const supabase = getSupabaseClient();
```

### Step 9: Update Tests

**Before:**
```typescript
import { supabase } from '../supabase/client';

describe('BookingService', () => {
  it('should create booking', async () => {
    const booking = await BookingService.createBooking({
      customer_id: 'test-id',
      // ...
    });
    expect(booking).toBeDefined();
  });
});
```

**After:**
```typescript
import { BookingService } from '../services/BookingService';
import { MockBookingRepository } from '../tests/mocks/BookingRepository';

describe('BookingService', () => {
  it('should create booking', async () => {
    const booking = await BookingService.createBooking({
      customerId: 'test-id',
      // ...
    });
    expect(booking).toBeDefined();
  });
});
```

### Step 10: Remove Old Code

```bash
# Remove old service files
rm -rf services/old/

# Remove old Supabase client if no longer needed
# rm -rf supabase/client.ts
```

## Migration Checklist

### Phase 1: Preparation
- [ ] Backup current code
- [ ] Create new branch for migration
- [ ] Install new dependencies
- [ ] Copy API layer to project

### Phase 2: Configuration
- [ ] Update environment variables
- [ ] Configure Supabase client
- [ ] Update TypeScript configuration
- [ ] Update Jest configuration

### Phase 3: Service Migration
- [ ] Migrate BookingService
- [ ] Migrate CustomerService
- [ ] Migrate StaffService
- [ ] Migrate SalonService
- [ ] Migrate ServiceService
- [ ] Migrate VendorService
- [ ] Migrate ProductService
- [ ] Migrate InventoryService
- [ ] Migrate OrderService

### Phase 4: Screen Migration
- [ ] Migrate BookingScreen
- [ ] Migrate CustomerScreen
- [ ] Migrate StaffScreen
- [ ] Migrate SalonScreen
- [ ] Migrate ServiceScreen
- [ ] Migrate VendorScreen
- [ ] Migrate ProductScreen
- [ ] Migrate InventoryScreen
- [ ] Migrate OrderScreen

### Phase 5: Testing
- [ ] Update unit tests
- [ ] Update integration tests
- [ ] Run test suite
- [ ] Fix any failing tests

### Phase 6: Cleanup
- [ ] Remove old service files
- [ ] Remove old Supabase client
- [ ] Update imports
- [ ] Remove unused dependencies

### Phase 7: Verification
- [ ] Test all screens manually
- [ ] Test all API endpoints
- [ ] Test error handling
- [ ] Test performance
- [ ] Test with different user roles

## Common Issues and Solutions

### Issue 1: Type Mismatches

**Problem:**
```typescript
Type 'string' is not assignable to type 'UUID'
```

**Solution:**
```typescript
// Use proper UUID validation
import { uuidSchema } from '../api/validators/common.validators';

const validatedId = uuidSchema.parse(id);
```

### Issue 2: Missing Imports

**Problem:**
```typescript
Module not found: Can't resolve '../api/repositories'
```

**Solution:**
```typescript
// Update tsconfig.json paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@api/*": ["./src/api/*"]
    }
  }
}
```

### Issue 3: Async/Await Issues

**Problem:**
```typescript
Type 'void' is not assignable to type 'Promise<Booking>'
```

**Solution:**
```typescript
// Make sure to return the promise
async createBooking(booking: CreateBookingDto): Promise<Booking> {
  return await this.bookingService.create(booking);
}
```

### Issue 4: Error Handling

**Problem:**
```typescript
Property 'code' does not exist on type 'Error'
```

**Solution:**
```typescript
// Use custom exception types
import { BaseException } from '../api/exceptions/BaseException';

if (error instanceof BaseException) {
  console.error(error.code, error.message);
}
```

## Rollback Plan

If migration fails, you can rollback:

```bash
# Reset to previous commit
git reset --hard HEAD~1

# Or checkout previous branch
git checkout previous-branch

# Or restore from backup
cp -r backup/ ./
```

## Testing After Migration

### Manual Testing Checklist

- [ ] Login works correctly
- [ ] Can create bookings
- [ ] Can view bookings
- [ ] Can update bookings
- [ ] Can cancel bookings
- [ ] Can manage customers
- [ ] Can manage staff
- [ ] Can manage services
- [ ] Can manage inventory
- [ ] Can manage vendors
- [ ] Error handling works correctly
- [ ] Loading states work correctly
- [ ] Real-time updates work correctly

### Automated Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run integration tests
npm test -- integration

# Run E2E tests
npm test -- e2e
```

## Performance Considerations

### Before Migration

- Direct Supabase calls
- No caching
- No error handling
- No type safety

### After Migration

- Repository pattern abstraction
- Built-in caching
- Comprehensive error handling
- Full type safety
- Slight overhead (negligible)

### Performance Tips

1. **Enable Caching**: Cache frequently accessed data
2. **Use Pagination**: Don't fetch all data at once
3. **Optimize Queries**: Use specific queries instead of `select('*')`
4. **Batch Operations**: Use batch operations when possible
5. **Lazy Loading**: Load data only when needed

## Support

If you encounter issues during migration:

1. Check the [API Documentation](./API_DOCUMENTATION.md)
2. Check the [Repository Pattern Documentation](./REPOSITORY_PATTERN.md)
3. Review the [Implementation Tracker](../docs/api/PHASE_7_IMPLEMENTATION_TRACKER.md)
4. Contact the development team

---

**Last Updated**: 2026-05-12
**Version**: 1.0.0
