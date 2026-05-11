# Phase 7: API Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           React Native App                                │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Screens    │  │  Components  │  │    Hooks     │  │   Utils      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │                 │         │
│         └─────────────────┴─────────────────┴─────────────────┘         │
│                                   │                                     │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            API Layer                                     │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        Controllers                                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │  │   Auth   │ │  Salon   │ │ Service  │ │  Staff   │ │ Customer │ │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │  │
│  │       │            │            │            │            │         │  │
│  │  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ │  │
│  │  │ Booking  │ │  Vendor  │ │ Product  │ │Inventory │ │  Order   │ │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │  │
│  └───────┼────────────┼────────────┼────────────┼────────────┼────────┘  │
│          │            │            │            │            │           │
│  ┌───────┴────────────┴────────────┴────────────┴────────────┴────────┐  │
│  │                        Services                                   │  │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │  │
│  │  │  Auth Service    │ │ Booking Flow Svc  │ │ Customer Mgmt Svc │    │  │
│  │  └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘    │  │
│  │  ┌────────┴─────────┐ ┌────────┴─────────┐ ┌────────┴─────────┐    │  │
│  │  │ Staff Mgmt Svc   │ │ Inventory Mgmt Svc│ │   Role Service   │    │  │
│  │  └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘    │  │
│  └───────────┼────────────────────┼────────────────────┼──────────────┘  │
│              │                    │                    │                  │
│  ┌───────────┴────────────────────┴────────────────────┴──────────────┐  │
│  │                        Repositories                                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ Profile  │ │  Salon   │ │ Service  │ │  Staff   │ │ Customer │  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │  │
│  │  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐  │  │
│  │  │ Booking  │ │  Vendor  │ │ Product  │ │Inventory │ │  Order   │  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │  │
│  └───────┼────────────┼────────────┼────────────┼────────────┼────────┘  │
│          │            │            │            │            │           │
│  ┌───────┴────────────┴────────────┴────────────┴────────────┴────────┐  │
│  │                        Core Layer                                  │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │  │
│  │  │ Base Repo    │ │ Base Service │ │ Base Ctrl    │ │   Utils      │ │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │  │
│  │  │ Interfaces   │ │    Types     │ │ Exceptions   │ │  Validators  │ │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        Middleware                                   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │   Auth   │ │   Role   │ │ Validate │ │   Cache  │ │  Logger  │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Supabase Backend                                │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        Database Layer                               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ Profiles │ │  Salons  │ │ Services │ │  Staff   │ │Customers │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ Bookings │ │  Vendors │ │ Products │ │Inventory │ │  Orders  │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        Business Logic                               │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │  │
│  │  │   Functions  │ │   Triggers   │ │  Constraints  │ │     RLS      │ │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        Services                                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │   Auth   │ │ Database │ │ Storage  │ │ Realtime │ │  Edge Fn │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Request Flow
```
React Native App
    │
    ▼
Controller (Request Validation)
    │
    ▼
Middleware (Auth, Role, Cache, Logger)
    │
    ▼
Service (Business Logic)
    │
    ▼
Repository (Data Access)
    │
    ▼
Supabase (Database)
    │
    ▼
Response (Formatted)
    │
    ▼
React Native App
```

### Error Flow
```
Exception Thrown
    │
    ▼
Error Middleware
    │
    ▼
Logger (Log Error)
    │
    ▼
Error Formatter
    │
    ▼
Error Response
    │
    ▼
Client
```

## Repository Pattern Details

### Interface Definition
```typescript
interface IRepository<T> {
  findById(id: string): Promise<T>;
  findAll(options?: QueryOptions): Promise<T[]>;
  create(data: CreateDto): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

### Implementation Example
```typescript
class BookingRepository implements IRepository<Booking> {
  async findById(id: string): Promise<Booking> {
    // Database query
    // Caching logic
    // Error handling
  }

  async findAll(options?: QueryOptions): Promise<Booking[]> {
    // Database query with options
    // Pagination
    // Filtering
    // Sorting
  }

  // ... other methods
}
```

## Service Layer Details

### Interface Definition
```typescript
interface IService<T, C, U> {
  create(data: C): Promise<T>;
  findById(id: string): Promise<T>;
  findAll(options?: QueryOptions): Promise<T[]>;
  update(id: string, data: U): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### Implementation Example
```typescript
class BookingService implements IService<Booking, CreateBookingDto, UpdateBookingDto> {
  constructor(
    private bookingRepository: IBookingRepository,
    private serviceRepository: IServiceRepository,
    private staffRepository: IStaffRepository
  ) {}

  async create(data: CreateBookingDto): Promise<Booking> {
    // Business validation
    // Conflict checking
    // Price calculation
    // Transaction management
  }

  // ... other methods
}
```

## Controller Layer Details

### Interface Definition
```typescript
interface IController<T, C, U> {
  create(req: Request, res: Response): Promise<void>;
  findById(req: Request, res: Response): Promise<void>;
  findAll(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}
```

### Implementation Example
```typescript
class BookingController implements IController<Booking, CreateBookingDto, UpdateBookingDto> {
  constructor(
    private bookingService: IBookingService,
    private validator: IValidator
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    // Request validation
    // DTO transformation
    // Service call
    // Response formatting
  }

  // ... other methods
}
```

## Dependency Injection

### Service Dependencies
```
BookingService
├── BookingRepository
├── ServiceRepository
├── StaffRepository
├── CustomerRepository
└── CacheService
```

### Controller Dependencies
```
BookingController
├── BookingService
├── Validator
└── Logger
```

## Caching Strategy

### Cache Layers
```
Memory Cache (Fastest)
    ↓ Miss
Local Storage Cache (Fast)
    ↓ Miss
Database Cache (Medium)
    ↓ Miss
Database Query (Slowest)
```

### Cache Flow
```
Request
    │
    ▼
Check Cache
    │
    ├─ Hit → Return Cached Data
    │
    └─ Miss → Query Database
                │
                ▼
                Cache Result
                │
                ▼
                Return Data
```

## Security Layers

### Authentication Flow
```
Request
    │
    ▼
Auth Middleware
    │
    ├─ Extract Token
    │
    ├─ Validate Token
    │
    ├─ Get User Context
    │
    └─ Pass to Controller
```

### Authorization Flow
```
Request (with User Context)
    │
    ▼
Role Middleware
    │
    ├─ Check User Role
    │
    ├─ Check Required Permissions
    │
    ├─ Check Resource Ownership
    │
    └─ Allow/Deny Access
```

## Error Handling Flow

### Exception Hierarchy
```
BaseException
├── AuthException
│   ├── InvalidCredentialsException
│   ├── TokenExpiredException
│   └── InsufficientPermissionsException
├── ValidationException
│   ├── InvalidInputException
│   └── MissingFieldException
├── NotFoundException
│   ├── UserNotFoundException
│   └── ResourceNotFoundException
├── ConflictException
│   ├── DuplicateResourceException
│   └── ConcurrentModificationException
└── ForbiddenException
    ├── AccessDeniedException
    └── ResourceOwnershipException
```

### Error Response Format
```typescript
{
  success: false,
  error: {
    code: "AUTH_001",
    message: "Invalid credentials",
    details: {
      field: "email",
      value: "invalid@example.com"
    }
  },
  timestamp: "2026-05-11T10:00:00Z"
}
```

## Testing Strategy

### Test Pyramid
```
        E2E Tests (10%)
       /            \
      /              \
     /                \
    /                  \
   /                    \
  /                      \
 /                        \
Integration Tests (30%)
/                          \
/                            \
/                              \
/                                \
/                                  \
Unit Tests (60%)
```

### Test Coverage
```
Controllers: 80%
Services: 90%
Repositories: 85%
Utils: 95%
Validators: 90%
Middleware: 75%
```

## Performance Optimization

### Query Optimization
```
Before:
├── N+1 Queries
├── No Indexes
├── Full Table Scans
└── No Caching

After:
├── Batch Queries
├── Proper Indexes
├── Query Optimization
└── Strategic Caching
```

### Response Time Targets
```
Simple Queries: < 50ms
Complex Queries: < 200ms
Aggregations: < 500ms
Real-time Updates: < 100ms
```

## Migration Path

### Phase 1: Foundation
```
Current App
    │
    ▼
Create API Structure
    │
    ▼
Setup Infrastructure
    │
    ▼
Configure Tooling
```

### Phase 2: Implementation
```
API Structure
    │
    ▼
Implement Core Layer
    │
    ▼
Implement Repository Layer
    │
    ▼
Implement Service Layer
    │
    ▼
Implement Controller Layer
```

### Phase 3: Integration
```
API Layer
    │
    ▼
Copy Existing Services
    │
    ▼
Adapt to New Structure
    │
    ▼
Update React Native App
    │
    ▼
Test Integration
```

### Phase 4: Optimization
```
Integrated System
    │
    ▼
Performance Testing
    │
    ▼
Optimize Queries
    │
    ▼
Implement Caching
    │
    ▼
Final Testing
```

## Deployment Strategy

### Environment Setup
```
Development
    │
    ▼
Staging
    │
    ▼
Production
```

### Rollback Plan
```
Production Issue
    │
    ▼
Identify Problem
    │
    ▼
Rollback to Previous Version
    │
    │
    ├─ Database Rollback
    ├─ Code Rollback
    └─ Configuration Rollback
```

## Monitoring and Observability

### Metrics to Track
```
Request Rate
Response Time
Error Rate
Cache Hit Rate
Database Query Time
Memory Usage
CPU Usage
```

### Logging Strategy
```
Request Logs
    │
    ├─ Request ID
    ├─ User ID
    ├─ Timestamp
    ├─ Endpoint
    ├─ Method
    ├─ Parameters
    └─ Response Time

Error Logs
    │
    ├─ Error Code
    ├─ Error Message
    ├─ Stack Trace
    ├─ Context
    └─ User ID
```

## Documentation Structure

### API Documentation
```
docs/api/
├── ARCHITECTURE.md
├── REPOSITORY_PATTERN.md
├── API_REFERENCE.md
├── MIGRATION_GUIDE.md
├── DEPLOYMENT_GUIDE.md
└── TROUBLESHOOTING.md
```

### Code Documentation
```
Each file should have:
├── File description
├── Author
├── Date
├── Dependencies
└── Usage examples

Each function should have:
├── Description
├── Parameters
├── Returns
├── Throws
└── Examples
```

---

**Status**: Ready for Review
**Next Step**: Await approval to begin implementation
