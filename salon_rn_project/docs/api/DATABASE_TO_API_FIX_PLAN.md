# Database-to-API-to-Application Flow Fix Implementation Plan
# Salon Management System - Phase 7 API Implementation

## Overview

This plan addresses all critical issues identified in the audit report to ensure proper database-to-API-to-application flow.

**Estimated Total Time**: 8-12 hours
**Priority**: CRITICAL
**Risk Level**: HIGH

---

## Phase 1: Fix Critical Repository Issues (4-5 hours)

### Task 1.1: Fix IRepository Interface (30 minutes)

**File**: `API/src/core/interfaces/IRepository.ts`

**Current Issue**: IRepository doesn't accept generic type parameters for CreateDto and UpdateDto.

**Solution**:
```typescript
export interface IRepository<T, C = CreateDto, U = UpdateDto> {
  findById(id: string): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<T[]>;
  create(data: C): Promise<T>;
  update(id: string, data: U): Promise<T>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  count(options?: QueryOptions): Promise<number>;
}
```

**Steps**:
1. Update IRepository interface to accept generic type parameters
2. Update BaseRepository to match the new interface signature
3. Run TypeScript compiler to verify

---

### Task 1.2: Fix BaseRepository Implementation (30 minutes)

**File**: `API/src/core/base/BaseRepository.ts`

**Current Issue**: BaseRepository expects abstract methods but concrete implementations don't provide them.

**Solution**:
```typescript
export abstract class BaseRepository<T, C = CreateDto, U = UpdateDto> implements IRepository<T, C, U> {
  // ... existing code ...

  protected abstract findByIdFromDatabase(id: string): Promise<T | null>;
  protected abstract findAllFromDatabase(options?: QueryOptions): Promise<T[]>;
  protected abstract createInDatabase(data: C): Promise<T>;
  protected abstract updateInDatabase(id: string, data: U): Promise<T>;
  protected abstract deleteFromDatabase(id: string): Promise<void>;
  protected abstract countFromDatabase(options?: QueryOptions): Promise<number>;
}
```

**Steps**:
1. Update BaseRepository generic signature
2. Ensure all abstract methods are properly defined
3. Run TypeScript compiler to verify

---

### Task 1.3: Fix Booking Repository (1 hour)

**Files**:
- `API/src/repositories/interfaces/IBookingRepository.ts`
- `API/src/repositories/implementations/BookingRepository.ts`

**Current Issue**: Booking model doesn't match database schema.

**Solution**:
```typescript
export interface Booking {
  id: string;
  salonId: string;
  customerId: string;
  serviceId: string;
  staffMemberId: string;  // Changed from staffId
  startTime: string;      // Changed from date + timeSlot
  endTime: string;        // Changed from date + timeSlot + duration
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';  // Updated enum
  notes?: string;
  totalPrice: number;     // Changed from price
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  salonId: string;
  customerId: string;
  serviceId: string;
  staffMemberId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateBookingDto {
  serviceId?: string;
  staffMemberId?: string;
  startTime?: string;
  endTime?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}
```

**Steps**:
1. Update IBookingRepository interface with correct field names
2. Update BookingRepository implementation
3. Update mapToEntity method to use correct field mappings
4. Update create method to calculate total_price from service price
5. Run TypeScript compiler to verify

---

### Task 1.4: Fix Customer Repository (1 hour)

**Files**:
- `API/src/repositories/interfaces/ICustomerRepository.ts`
- `API/src/repositories/implementations/CustomerRepository.ts`

**Current Issue**: Customer model doesn't match database schema.

**Solution**:
```typescript
export interface Customer {
  id: string;
  userId: string;
  salonId: string;        // Added
  totalSpent: number;     // Added
  visitCount: number;     // Added
  lastVisit?: string;     // Added
  notes?: string;
  birthday?: string;      // Added
  referralSource?: string; // Added
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  userId: string;
  salonId: string;
  notes?: string;
  birthday?: string;
  referralSource?: string;
}

export interface UpdateCustomerDto {
  totalSpent?: number;
  visitCount?: number;
  lastVisit?: string;
  notes?: string;
  birthday?: string;
  referralSource?: string;
}
```

**Steps**:
1. Update ICustomerRepository interface with correct fields
2. Update CustomerRepository implementation
3. Update mapToEntity method to use correct field mappings
4. Remove profile-related fields (firstName, lastName, email, phone, address, etc.)
5. Run TypeScript compiler to verify

---

### Task 1.5: Fix Staff Repository (1 hour)

**Files**:
- `API/src/repositories/interfaces/IStaffRepository.ts`
- `API/src/repositories/implementations/StaffRepository.ts`

**Current Issue**: Staff model doesn't match database schema.

**Solution**:
```typescript
export interface Staff {
  id: string;
  userId: string;
  salonId: string;
  role: 'STAFF' | 'MANAGER' | 'LEAD_STYLIST';  // Added
  hourlyRate?: number;
  commissionRate?: number;
  isActive: boolean;      // Changed from status enum
  hireDate: string;
  terminationDate?: string;  // Added
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffDto {
  userId: string;
  salonId: string;
  role: 'STAFF' | 'MANAGER' | 'LEAD_STYLIST';
  hourlyRate?: number;
  commissionRate?: number;
  hireDate: string;
}

export interface UpdateStaffDto {
  role?: 'STAFF' | 'MANAGER' | 'LEAD_STYLIST';
  hourlyRate?: number;
  commissionRate?: number;
  isActive?: boolean;
  terminationDate?: string;
}
```

**Steps**:
1. Update IStaffRepository interface with correct fields
2. Update StaffRepository implementation
3. Update mapToEntity method to use correct field mappings
4. Remove profile-related fields (firstName, lastName, email, phone, specializations)
5. Run TypeScript compiler to verify

---

## Phase 2: Create Missing Entity Interfaces (1-2 hours)

### Task 2.1: Create Product Entity Interface (30 minutes)

**File**: `API/src/repositories/interfaces/IProductRepository.ts`

**Solution**:
```typescript
export interface Product {
  id: string;
  vendorId: string;
  salonId: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  price: number;
  cost?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  vendorId: string;
  salonId: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  price: number;
  cost?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  sku?: string;
  category?: string;
  price?: number;
  cost?: number;
  isActive?: boolean;
}

export interface IProductRepository extends IRepository<Product, CreateProductDto, UpdateProductDto> {
  findByVendorId(vendorId: string): Promise<Product[]>;
  findByCategory(category: string): Promise<Product[]>;
  findActive(): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;
  findLowStock(threshold: number): Promise<Product[]>;
}
```

---

### Task 2.2: Create Service Entity Interface (30 minutes)

**File**: `API/src/repositories/interfaces/IServiceRepository.ts`

**Solution**:
```typescript
export interface Service {
  id: string;
  salonId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  salonId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  imageUrl?: string;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  category?: string;
  isActive?: boolean;
  imageUrl?: string;
}

export interface IServiceRepository extends IRepository<Service, CreateServiceDto, UpdateServiceDto> {
  findBySalonId(salonId: string): Promise<Service[]>;
  findByCategory(category: string): Promise<Service[]>;
  findActive(): Promise<Service[]>;
  searchByName(query: string): Promise<Service[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Service[]>;
  findByDuration(minDuration: number, maxDuration: number): Promise<Service[]>;
}
```

---

### Task 2.3: Create Inventory Entity Interface (30 minutes)

**File**: `API/src/repositories/interfaces/IInventoryRepository.ts`

**Solution**:
```typescript
export interface Inventory {
  id: string;
  productId: string;
  salonId: string;
  quantity: number;
  reorderLevel: number;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryDto {
  productId: string;
  salonId: string;
  quantity: number;
  reorderLevel?: number;
}

export interface UpdateInventoryDto {
  quantity?: number;
  reorderLevel?: number;
  lastRestocked?: string;
}

export interface IInventoryRepository extends IRepository<Inventory, CreateInventoryDto, UpdateInventoryDto> {
  findByProductId(productId: string): Promise<Inventory[]>;
  findBySalonId(salonId: string): Promise<Inventory[]>;
  findByStatus(status: 'in_stock' | 'low_stock' | 'out_of_stock'): Promise<Inventory[]>;
  findBySalonAndProduct(salonId: string, productId: string): Promise<Inventory | null>;
  findOutOfStock(): Promise<Inventory[]>;
  existsBySalonAndProduct(salonId: string, productId: string): Promise<boolean>;
}
```

---

## Phase 3: Update Repository Implementations (2-3 hours)

### Task 3.1: Update ProductRepository (45 minutes)

**File**: `API/src/repositories/implementations/ProductRepository.ts`

**Steps**:
1. Update class to extend BaseRepository<Product, CreateProductDto, UpdateProductDto>
2. Implement abstract methods: findByIdFromDatabase, findAllFromDatabase, etc.
3. Update mapToEntity method
4. Implement all interface methods
5. Run TypeScript compiler to verify

---

### Task 3.2: Update ServiceRepository (45 minutes)

**File**: `API/src/repositories/implementations/ServiceRepository.ts`

**Steps**:
1. Update class to extend BaseRepository<Service, CreateServiceDto, UpdateServiceDto>
2. Implement abstract methods: findByIdFromDatabase, findAllFromDatabase, etc.
3. Update mapToEntity method
4. Implement all interface methods
5. Run TypeScript compiler to verify

---

### Task 3.3: Update InventoryRepository (45 minutes)

**File**: `API/src/repositories/implementations/InventoryRepository.ts`

**Steps**:
1. Update class to extend BaseRepository<Inventory, CreateInventoryDto, UpdateInventoryDto>
2. Implement abstract methods: findByIdFromDatabase, findAllFromDatabase, etc.
3. Update mapToEntity method
4. Implement all interface methods
5. Run TypeScript compiler to verify

---

### Task 3.4: Update OrderRepository (45 minutes)

**File**: `API/src/repositories/implementations/OrderRepository.ts`

**Steps**:
1. Verify Order interface matches database schema
2. Update class to extend BaseRepository<Order, CreateOrderDto, UpdateOrderDto>
3. Implement abstract methods: findByIdFromDatabase, findAllFromDatabase, etc.
4. Update mapToEntity method
5. Implement all interface methods
6. Run TypeScript compiler to verify

---

## Phase 4: Verification and Testing (1-2 hours)

### Task 4.1: TypeScript Compilation Verification (30 minutes)

**Command**:
```bash
cd API && npx tsc --noEmit
```

**Expected Result**: 0 errors

---

### Task 4.2: Database Schema Verification (30 minutes)

**SQL Query**:
```sql
-- Verify all tables exist and have correct columns
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

**Expected Result**: All tables have correct columns matching API models

---

### Task 4.3: Integration Testing (1 hour)

**Test Cases**:
1. Create a booking and verify it's stored correctly
2. Create a customer and verify it's stored correctly
3. Create a staff member and verify it's stored correctly
4. Query bookings by date range
5. Query customers by salon
6. Query staff by role

**Expected Result**: All tests pass

---

## Phase 5: Documentation and Cleanup (30 minutes)

### Task 5.1: Update API Documentation (15 minutes)

**Files**:
- `docs/api/API_ARCHITECTURE.md`
- `docs/api/REPOSITORY_PATTERN.md`

**Steps**:
1. Update architecture documentation with correct field mappings
2. Update repository pattern documentation
3. Add examples of proper usage

---

### Task 5.2: Clean Up Code (15 minutes)

**Steps**:
1. Remove unused imports
2. Format code with Prettier
3. Run ESLint
4. Fix any linting issues

---

## Success Criteria

### Functional Requirements
- ✅ All TypeScript compilation errors resolved (0 errors)
- ✅ All repository interfaces properly defined with correct types
- ✅ All repository implementations properly extend BaseRepository
- ✅ All API models match database schema
- ✅ All CRUD operations work correctly
- ✅ All integration tests pass

### Non-Functional Requirements
- ✅ Type safety (100% TypeScript compilation)
- ✅ Code quality (ESLint passing)
- ✅ Database integrity (foreign keys valid)
- ✅ Consistent naming conventions (camelCase in API, snake_case in database)

### Quality Requirements
- ✅ Clean code (SOLID principles)
- ✅ Consistent patterns (follow existing codebase)
- ✅ Proper error handling
- ✅ Comprehensive documentation

---

## Risk Mitigation

### Risk 1: Breaking Changes to Existing Code
**Mitigation**: Test each change thoroughly before committing, use feature flags if needed

### Risk 2: Data Loss During Migration
**Mitigation**: Backup database before making changes, test on development environment first

### Risk 3: Performance Degradation
**Mitigation**: Profile queries before and after changes, optimize slow queries

### Risk 4: Missing Dependencies
**Mitigation**: Verify all imports and dependencies before compilation

---

## Implementation Order

1. **Phase 1.1**: Fix IRepository Interface (30 min)
2. **Phase 1.2**: Fix BaseRepository Implementation (30 min)
3. **Phase 1.3**: Fix Booking Repository (1 hour)
4. **Phase 1.4**: Fix Customer Repository (1 hour)
5. **Phase 1.5**: Fix Staff Repository (1 hour)
6. **Phase 2.1**: Create Product Entity Interface (30 min)
7. **Phase 2.2**: Create Service Entity Interface (30 min)
8. **Phase 2.3**: Create Inventory Entity Interface (30 min)
9. **Phase 3.1**: Update ProductRepository (45 min)
10. **Phase 3.2**: Update ServiceRepository (45 min)
11. **Phase 3.3**: Update InventoryRepository (45 min)
12. **Phase 3.4**: Update OrderRepository (45 min)
13. **Phase 4.1**: TypeScript Compilation Verification (30 min)
14. **Phase 4.2**: Database Schema Verification (30 min)
15. **Phase 4.3**: Integration Testing (1 hour)
16. **Phase 5.1**: Update API Documentation (15 min)
17. **Phase 5.2**: Clean Up Code (15 min)

**Total Estimated Time**: 8-12 hours

---

## Next Steps After Implementation

1. Complete Phase 7 API Implementation
2. Update React Native app to use corrected API layer
3. Run comprehensive integration tests
4. Prepare for Phase 8 (if applicable)
5. Deploy to staging environment
6. Monitor for issues
7. Deploy to production

---

## References

- Audit Report: `docs/api/DATABASE_TO_API_AUDIT_REPORT.md`
- API Architecture: `docs/api/API_ARCHITECTURE.md`
- Repository Pattern: `docs/api/REPOSITORY_PATTERN.md`
- Database Schema: `docs/database/DATABASE_IMPLEMENTATION_PLAN.md`
- Implementation Tracker: `docs/api/PHASE_7_IMPLEMENTATION_TRACKER.md`

---

**Plan Created By**: Claude Code
**Plan Version**: 1.0
**Last Updated**: 2026-05-13
