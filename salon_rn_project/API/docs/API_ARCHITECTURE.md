# API Architecture Documentation

## Overview

The Salon Management System API follows a layered architecture pattern with clear separation of concerns. This document provides a comprehensive overview of the API architecture, design patterns, and implementation details.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                        │
│                    (React Native Application)                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Controller Layer                         │
│                    (Request/Response Handling)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ BookingCtrl  │  │ CustomerCtrl │  │   StaffCtrl  │  ...      │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Middleware Layer                        │
│                    (Cross-Cutting Concerns)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth       │  │  Validation  │  │   Logging    │  ...      │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                           Service Layer                          │
│                      (Business Logic)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ BookingSvc   │  │ CustomerSvc  │  │   StaffSvc   │  ...      │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Repository Layer                         │
│                      (Data Access Abstraction)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ BookingRepo  │  │ CustomerRepo │  │   StaffRepo  │  ...      │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Database Layer                          │
│                      (Supabase PostgreSQL)                       │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Controller Layer

**Purpose**: Handle HTTP requests and responses

**Responsibilities**:
- Parse incoming requests
- Validate request data using DTOs
- Call appropriate service methods
- Format and return responses
- Handle HTTP-specific errors

**Key Components**:
- `BaseController`: Provides common controller functionality
- Entity Controllers: Handle specific entity operations
- Request DTOs: Define expected request structure
- Response DTOs: Define response structure

**Example**:
```typescript
export class BookingController extends BaseController {
  constructor(
    private bookingService: BookingService,
    private validator: Validator
  ) {
    super();
  }

  async createBooking(req: Request, res: Response): Promise<void> {
    // Validate request
    const dto = await this.validator.validate(CreateBookingDto, req.body);

    // Call service
    const booking = await this.bookingService.create(dto);

    // Return response
    this.success(res, booking, 201);
  }
}
```

### 2. Middleware Layer

**Purpose**: Handle cross-cutting concerns

**Responsibilities**:
- Authentication and authorization
- Request validation
- Logging and monitoring
- Error handling
- Rate limiting
- Caching

**Key Components**:
- `AuthMiddleware`: Verify JWT tokens and user roles
- `ValidationMiddleware`: Validate request data
- `LoggingMiddleware`: Log requests and responses
- `ErrorMiddleware`: Handle errors consistently
- `CacheMiddleware`: Implement caching strategies

**Example**:
```typescript
export class AuthMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = this.extractToken(req);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const decoded = await this.verifyToken(token);
    req.user = decoded;

    next();
  }

  async authorize(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenException('Insufficient permissions');
      }
      next();
    };
  }
}
```

### 3. Service Layer

**Purpose**: Implement business logic

**Responsibilities**:
- Implement business rules
- Coordinate multiple repository calls
- Handle transactions
- Validate business constraints
- Transform data between layers

**Key Components**:
- `BaseService`: Provides common service functionality
- Entity Services: Handle specific entity business logic
- Business Rules: Define validation and transformation rules

**Example**:
```typescript
export class BookingService extends BaseService {
  constructor(
    private bookingRepository: IBookingRepository,
    private staffRepository: IStaffRepository,
    private serviceRepository: IServiceRepository
  ) {
    super();
  }

  async create(dto: CreateBookingDto): Promise<Booking> {
    // Validate business rules
    await this.validateBooking(dto);

    // Check availability
    const isAvailable = await this.checkAvailability(dto);
    if (!isAvailable) {
      throw new ConflictException('Time slot not available');
    }

    // Create booking
    const booking = await this.bookingRepository.create(dto);

    // Invalidate cache
    await this.invalidateCache(dto.staffId, dto.appointmentDate);

    return booking;
  }

  private async validateBooking(dto: CreateBookingDto): Promise<void> {
    // Validate staff exists
    const staff = await this.staffRepository.findById(dto.staffId);
    if (!staff) {
      throw new NotFoundException('Staff', dto.staffId);
    }

    // Validate service exists
    const service = await this.serviceRepository.findById(dto.serviceId);
    if (!service) {
      throw new NotFoundException('Service', dto.serviceId);
    }

    // Validate time range
    if (dto.startTime >= dto.endTime) {
      throw new ValidationException('Start time must be before end time');
    }
  }
}
```

### 4. Repository Layer

**Purpose**: Abstract data access

**Responsibilities**:
- Execute database queries
- Handle data transformation
- Implement caching
- Manage database connections
- Handle database-specific errors

**Key Components**:
- `IRepository`: Base repository interface
- `BaseRepository`: Common repository functionality
- Entity Repositories: Specific entity data access
- Cache Manager: Handle caching strategies

**Example**:
```typescript
export class BookingRepository extends BaseRepository<Booking> implements IBookingRepository {
  constructor() {
    super('bookings');
  }

  async findByCustomerId(customerId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('customer_id', customerId)
      .order('appointment_date', { ascending: true });

    if (error) {
      throw new DatabaseException(error.message);
    }

    return data || [];
  }

  async findAvailableSlots(date: Date, serviceId: string): Promise<TimeSlot[]> {
    // Complex query implementation
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('appointment_date', date.toISOString().split('T')[0])
      .eq('service_id', serviceId)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      throw new DatabaseException(error.message);
    }

    return this.calculateAvailableSlots(data || []);
  }
}
```

### 5. Database Layer

**Purpose**: Persist and retrieve data

**Responsibilities**:
- Store data securely
- Ensure data integrity
- Handle transactions
- Provide query capabilities
- Manage connections

**Key Components**:
- Supabase Client: Database connection
- PostgreSQL: Database engine
- RLS Policies: Row-level security
- Indexes: Query optimization

## Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access logic

**Benefits**:
- Separates business logic from data access
- Makes testing easier with mock repositories
- Centralizes data access logic
- Supports multiple data sources

**Implementation**:
```typescript
// Interface
export interface IBookingRepository extends IRepository<Booking> {
  findByCustomerId(customerId: string): Promise<Booking[]>;
  findByStaffId(staffId: string): Promise<Booking[]>;
  findAvailableSlots(date: Date, serviceId: string): Promise<TimeSlot[]>;
}

// Implementation
export class BookingRepository extends BaseRepository<Booking> implements IBookingRepository {
  // Implementation
}
```

### 2. Service Layer Pattern

**Purpose**: Encapsulate business logic

**Benefits**:
- Separates business logic from presentation
- Promotes code reusability
- Makes testing easier
- Supports transaction management

**Implementation**:
```typescript
export class BookingService extends BaseService {
  async create(dto: CreateBookingDto): Promise<Booking> {
    // Business logic here
    const booking = await this.bookingRepository.create(dto);
    return booking;
  }
}
```

### 3. Dependency Injection

**Purpose**: Manage dependencies between components

**Benefits**:
- Loose coupling between components
- Easier testing with mocks
- Better code organization
- Supports configuration changes

**Implementation**:
```typescript
export class BookingController extends BaseController {
  constructor(
    private bookingService: BookingService,
    private validator: Validator
  ) {
    super();
  }
}
```

### 4. DTO Pattern

**Purpose**: Define data transfer objects

**Benefits**:
- Clear API contracts
- Type safety
- Validation
- Documentation

**Implementation**:
```typescript
export class CreateBookingDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  staffId: string;

  @IsUUID()
  serviceId: string;

  @IsDateString()
  appointmentDate: string;

  @IsTimeString()
  startTime: string;

  @IsTimeString()
  endTime: string;
}
```

### 5. Middleware Pattern

**Purpose**: Handle cross-cutting concerns

**Benefits**:
- Reusable components
- Clean separation of concerns
- Easy to add/remove functionality
- Consistent behavior across endpoints

**Implementation**:
```typescript
export class AuthMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Authentication logic
    next();
  }
}
```

## Data Flow

### Request Flow

```
1. Client sends request
   ↓
2. Controller receives request
   ↓
3. Middleware processes request (auth, validation, logging)
   ↓
4. Controller validates request DTO
   ↓
5. Controller calls service method
   ↓
6. Service validates business rules
   ↓
7. Service calls repository method
   ↓
8. Repository executes database query
   ↓
9. Repository returns data to service
   ↓
10. Service processes data
    ↓
11. Service returns data to controller
    ↓
12. Controller formats response DTO
    ↓
13. Controller sends response to client
```

### Error Flow

```
1. Error occurs at any layer
   ↓
2. Layer catches error
   ↓
3. Layer transforms to appropriate exception
   ↓
4. Exception propagates up
   ↓
5. Error middleware catches exception
   ↓
6. Error middleware formats error response
   ↓
7. Error middleware sends error response to client
```

## Security Architecture

### Authentication

**JWT-based Authentication**:
- Tokens issued by Supabase Auth
- Tokens contain user claims (id, role, salon_id)
- Tokens validated on each request
- Automatic token refresh

**Implementation**:
```typescript
export class AuthMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = this.extractToken(req);
    const decoded = await this.verifyToken(token);
    req.user = decoded;
    next();
  }
}
```

### Authorization

**Role-Based Access Control (RBAC)**:
- Roles: SUPER_ADMIN, SALON_OWNER, STAFF, CUSTOMER
- Permissions defined per role
- Checked on each request
- Enforced at multiple layers

**Implementation**:
```typescript
export class AuthMiddleware {
  async authorize(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenException('Insufficient permissions');
      }
      next();
    };
  }
}
```

### Data Security

**Row-Level Security (RLS)**:
- Database-level security
- Policies based on user role
- Automatic data filtering
- Prevents unauthorized access

**Implementation**:
```sql
-- Example RLS policy
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (auth.uid()::text = customer_id);
```

## Caching Strategy

### Cache Levels

**1. Repository Level Cache**:
- Cache individual entities
- Cache query results
- TTL-based expiration
- Automatic invalidation

**2. Service Level Cache**:
- Cache computed results
- Cache business logic outputs
- Longer TTL
- Manual invalidation

**3. Response Level Cache**:
- Cache HTTP responses
- Cache API responses
- Very short TTL
- ETag support

### Cache Implementation

```typescript
export class BaseRepository<T> {
  async findById(id: string): Promise<T> {
    // Check cache
    const cached = await cache.get(`${this.tableName}:${id}`);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const entity = await this.fetchFromDatabase(id);

    // Cache result
    await cache.set(`${this.tableName}:${id}`, entity, CacheTTL.USER_DATA);

    return entity;
  }

  async update(id: string, data: UpdateDto): Promise<T> {
    const result = await this.updateInDatabase(id, data);

    // Invalidate cache
    await cache.delete(`${this.tableName}:${id}`);
    await cache.deletePattern(`${this.tableName}:list:*`);

    return result;
  }
}
```

## Error Handling Architecture

### Exception Hierarchy

```
BaseException
├── AuthException
│   ├── UnauthorizedException
│   └── ForbiddenException
├── ValidationException
├── NotFoundException
├── ConflictException
├── DatabaseException
└── ApiException
```

### Error Response Format

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "timestamp": "2026-05-12T10:30:00Z",
    "path": "/api/bookings"
  }
}
```

### Error Handling Flow

```
1. Error occurs
   ↓
2. Layer catches error
   ↓
3. Layer transforms to appropriate exception
   ↓
4. Exception includes error code, message, details
   ↓
5. Error middleware catches exception
   ↓
6. Error middleware logs error
   ↓
7. Error middleware formats error response
   ↓
8. Error middleware sends response to client
```

## Performance Optimization

### Database Optimization

**1. Indexing**:
- Primary key indexes
- Foreign key indexes
- Composite indexes for common queries
- Partial indexes for filtered queries

**2. Query Optimization**:
- Use specific columns instead of `SELECT *`
- Use JOINs instead of multiple queries
- Use pagination for large result sets
- Use prepared statements

**3. Connection Pooling**:
- Reuse database connections
- Limit maximum connections
- Handle connection timeouts
- Monitor connection usage

### Caching Optimization

**1. Cache Strategy**:
- Cache frequently accessed data
- Use appropriate TTL values
- Implement cache invalidation
- Monitor cache hit rates

**2. Cache Levels**:
- Repository level cache
- Service level cache
- Response level cache
- CDN for static assets

### API Optimization

**1. Response Optimization**:
- Use compression (gzip)
- Minimize response size
- Use pagination
- Implement field selection

**2. Request Optimization**:
- Use batch operations
- Implement request batching
- Use webhooks for updates
- Implement rate limiting

## Testing Architecture

### Test Layers

**1. Unit Tests**:
- Test individual components
- Mock dependencies
- Fast execution
- High coverage

**2. Integration Tests**:
- Test component interactions
- Use test database
- Medium execution time
- Good coverage

**3. E2E Tests**:
- Test complete user flows
- Use real database
- Slow execution
- Critical path coverage

### Test Structure

```
tests/
├── unit/
│   ├── repositories/
│   ├── services/
│   └── controllers/
├── integration/
│   └── api/
└── e2e/
    └── flows/
```

### Test Coverage

**Target Coverage**:
- Overall: 80%
- Repositories: 90%
- Services: 85%
- Controllers: 75%

## Monitoring and Logging

### Logging Levels

**1. Error**: Critical errors requiring immediate attention
**2. Warn**: Warning messages for potential issues
**3. Info**: Informational messages about normal operations
**4. Debug**: Detailed debugging information

### Logging Strategy

**1. Structured Logging**:
- JSON format
- Consistent fields
- Correlation IDs
- Request tracing

**2. Log Aggregation**:
- Centralized logging
- Log retention
- Log analysis
- Alerting

### Monitoring Metrics

**1. Performance Metrics**:
- Response times
- Request rates
- Error rates
- Cache hit rates

**2. Business Metrics**:
- Booking rates
- User activity
- Revenue metrics
- Conversion rates

## Scalability Architecture

### Horizontal Scaling

**1. Stateless Services**:
- No session state
- External session storage
- Load balancing
- Auto-scaling

**2. Database Scaling**:
- Read replicas
- Connection pooling
- Query optimization
- Database sharding

### Vertical Scaling

**1. Resource Optimization**:
- Memory management
- CPU optimization
- I/O optimization
- Network optimization

## Deployment Architecture

### Environments

**1. Development**:
- Local development
- Test database
- Debug logging
- No caching

**2. Staging**:
- Production-like setup
- Test database
- Info logging
- Development caching

**3. Production**:
- Production setup
- Production database
- Error logging
- Production caching

### Deployment Strategy

**1. Continuous Integration**:
- Automated builds
- Automated tests
- Code quality checks
- Security scans

**2. Continuous Deployment**:
- Automated deployments
- Blue-green deployments
- Rollback capability
- Health checks

## Conclusion

The Salon Management System API architecture follows industry best practices with clear separation of concerns, comprehensive error handling, robust security, and excellent performance characteristics. The layered architecture makes the system maintainable, testable, and scalable.

---

**Last Updated**: 2026-05-12
**Version**: 1.0.0
