# Salon Management System - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [State Management](#state-management)
7. [Navigation Architecture](#navigation-architecture)
8. [Service Layer](#service-layer)
9. [Database Architecture](#database-architecture)
10. [Technical Decisions](#technical-decisions)

---

## System Overview

The Salon Management System is a **multi-role React Native application** built with a **client-server architecture** using Supabase as the backend-as-a-service provider.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native Client                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │  State Layer │  │  Service     │      │
│  │              │  │              │  │  Layer       │      │
│  │ - Screens    │  │ - AuthProvider│  │ - AuthService│      │
│  │ - Components │  │ - Hooks      │  │ - BookingSvc │      │
│  │ - Navigators │  │ - Context    │  │ - SalonSvc   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST + Realtime
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Backend                         │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │  Database    │  │  Storage      │      │
│  │              │  │              │  │              │      │
│  │ - JWT        │  │ - PostgreSQL │  │ - Files       │      │
│  │ - RLS        │  │ - RLS        │  │ - Images      │      │
│  │ - Triggers   │  │ - Functions  │  │ - Documents   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture Patterns

### 1. Layered Architecture

The application follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│         Presentation Layer           │
│  (Screens, Components, Navigators)  │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│         Business Logic Layer        │
│  (Services, Hooks, Providers)      │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│         Data Access Layer           │
│  (Supabase Client, API Calls)       │
└─────────────────────────────────────┘
```

### 2. Provider Pattern

Authentication and global state are managed using the **Provider pattern**:

```typescript
// AuthProvider wraps the entire app
<AuthProvider>
  <AppNavigator />
</AuthProvider>
```

### 3. Service Pattern

Business logic is encapsulated in **service classes**:

```typescript
// Services handle all API interactions
AuthService.signIn(credentials)
BookingService.createBooking(bookingData)
SalonService.getAnalytics()
```

### 4. Hook Pattern

Custom hooks provide reusable stateful logic:

```typescript
// Hooks encapsulate complex logic
const { user, role, loading } = useAuth()
const { hasPermission } = usePermission()
const { salon } = useSalon()
```

---

## Component Architecture

### Directory Structure

```
src/
├── app/
│   ├── components/          # Shared UI components
│   │   └── ErrorBoundary.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePermission.ts
│   │   └── useSalon.ts
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── CustomerNavigator.tsx
│   │   ├── OwnerNavigator.tsx
│   │   ├── StaffNavigator.tsx
│   │   ├── VendorNavigator.tsx
│   │   └── SuperAdminNavigator.tsx
│   ├── providers/          # Context providers
│   │   └── AuthProvider.tsx
│   └── screens/            # Screen components
│       ├── auth/
│       ├── customer/
│       ├── owner/
│       ├── staff/
│       └── vendor/
├── services/              # API service layer
│   ├── auth.service.ts
│   ├── booking.service.ts
│   ├── salon.service.ts
│   ├── staff.service.ts
│   ├── customer.service.ts
│   └── supabase.ts
├── shared/                # Shared utilities
│   ├── constants/        # Constants and enums
│   ├── theme/            # Theme configuration
│   └── ui/               # Reusable UI components
└── types/                # TypeScript type definitions
    └── auth.types.ts
```

### Component Hierarchy

```
App
└── AuthProvider
    └── AppNavigator
        ├── AuthNavigator (when not authenticated)
        │   ├── LoginScreen
        │   └── RegisterScreen
        └── Role Navigators (when authenticated)
            ├── SuperAdminNavigator
            ├── OwnerNavigator
            ├── StaffNavigator
            ├── VendorNavigator
            └── CustomerNavigator
```

---

## Data Flow

### Authentication Flow

```
User Action
    │
    ▼
AuthService.signIn()
    │
    ▼
Supabase Auth API
    │
    ▼
JWT Token Generated
    │
    ▼
Token Stored (Keychain)
    │
    ▼
AuthProvider Updates State
    │
    ▼
AppNavigator Routes to Role Screen
```

### Booking Flow

```
Customer Selects Service
    │
    ▼
BookingService.getAvailableSlots()
    │
    ▼
Customer Selects Time Slot
    │
    ▼
BookingService.createBooking()
    │
    ▼
Supabase Database (with RLS)
    │
    ▼
Realtime Update to Staff
    │
    ▼
Staff Dashboard Updated
```

### Permission Check Flow

```
User Attempts Action
    │
    ▼
usePermission Hook
    │
    ▼
AuthService.hasPermission()
    │
    ▼
Supabase RPC Function
    │
    ▼
RLS Policy Evaluation
    │
    ▼
Action Allowed/Denied
```

---

## Security Architecture

### Authentication

1. **JWT-based Authentication**
   - Access tokens with short expiration
   - Refresh tokens for seamless renewal
   - Custom claims for role information

2. **Secure Storage**
   - React Native Keychain for token storage
   - Encrypted storage for sensitive data

3. **Session Management**
   - Automatic token refresh
   - Session timeout handling
   - Multi-device session support

### Authorization

1. **Row Level Security (RLS)**
   - Database-level access control
   - Role-based policies
   - Fine-grained permissions

2. **Client-side Permission Checks**
   - UI-level permission enforcement
   - Role-based navigation
   - Action-level authorization

3. **Permission Matrix**
   - Defined per role
   - Granular control
   - Audit trail

### Security Layers

```
┌─────────────────────────────────────┐
│     Client-Side Permission Checks    │
│  (UI hiding, navigation guards)     │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│     API-Level Authorization         │
│  (JWT validation, role checks)      │
└─────────────────────────────────────┘
                 │
┌─────────────────────────────────────┐
│     Database-Level Security         │
│  (RLS policies, encryption)          │
└─────────────────────────────────────┘
```

---

## State Management

### Authentication State

Managed by `AuthProvider`:

```typescript
interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  salonId: string | null;
}
```

### Local State

- **Component State**: React `useState` for UI state
- **Form State**: Controlled components for forms
- **Navigation State**: React Navigation state

### Server State

- **Supabase Queries**: Direct database queries
- **Realtime Subscriptions**: Live data updates
- **Caching**: Built-in Supabase caching

---

## Navigation Architecture

### Navigation Stack

```
AppNavigator (Root)
├── Auth Stack
│   ├── LoginScreen
│   └── RegisterScreen
└── Role Stacks (Tab-based)
    ├── SuperAdmin Stack
    ├── Owner Stack
    ├── Staff Stack
    ├── Vendor Stack
    └── Customer Stack
```

### Role-Based Routing

Navigation is determined by user role:

```typescript
const getRoleNavigator = () => {
  switch (role) {
    case 'SUPER_ADMIN': return <SuperAdminNavigator />;
    case 'OWNER': return <OwnerNavigator />;
    case 'STAFF': return <StaffNavigator />;
    case 'VENDOR': return <VendorNavigator />;
    case 'CUSTOMER': return <CustomerNavigator />;
  }
};
```

### Navigation Guards

- **Authentication Guard**: Redirects to login if not authenticated
- **Role Guard**: Prevents access to unauthorized screens
- **Permission Guard**: Checks specific permissions

---

## Service Layer

### Service Architecture

All API interactions are abstracted into service classes:

```typescript
// Base Service Pattern
class Service {
  protected static async query<T>(
    table: string,
    query: any
  ): Promise<T> {
    // Common query logic
  }
}

// Specific Services
class AuthService extends Service { /* ... */ }
class BookingService extends Service { /* ... */ }
class SalonService extends Service { /* ... */ }
```

### Service Responsibilities

1. **API Communication**
   - Supabase client interactions
   - Request/response handling
   - Error management

2. **Data Transformation**
   - API response formatting
   - Type conversion
   - Data validation

3. **Business Logic**
   - Permission checks
   - Data validation
   - Workflow orchestration

---

## Database Architecture

### Schema Overview

```
┌─────────────────┐
│   profiles      │
│   (user data)   │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐     ┌─────────────────┐
│   user_roles    │────▶│     salons      │
│   (role data)   │     │  (salon data)   │
└─────────────────┘     └─────────────────┘
         │
         │ 1:N
         │
┌────────▼────────┐     ┌─────────────────┐
│   bookings      │────▶│    services      │
│   (appointments)│     │  (service data)  │
└─────────────────┘     └─────────────────┘
```

### Key Tables

1. **profiles**: User profile information
2. **user_roles**: Role assignments and salon associations
3. **salons**: Salon business information
4. **services**: Service catalog
5. **bookings**: Appointment bookings
6. **staff**: Staff member information
7. **customers**: Customer profiles
8. **inventory**: Product inventory
9. **orders**: Vendor orders

### RLS Policies

Each table has Row Level Security policies:

```sql
-- Example: Bookings table
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Staff can view salon bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND salon_id = bookings.salon_id
      AND role IN ('OWNER', 'STAFF')
    )
  );
```

---

## Technical Decisions

### 1. React Native CLI vs Expo

**Decision**: React Native CLI

**Rationale**:
- Full control over native code
- No vendor lock-in
- Better performance optimization
- Easier native module integration

### 2. Supabase vs Custom Backend

**Decision**: Supabase

**Rationale**:
- Rapid development
- Built-in authentication
- Real-time capabilities
- PostgreSQL database
- Cost-effective for MVP

### 3. TypeScript vs JavaScript

**Decision**: TypeScript

**Rationale**:
- Type safety
- Better IDE support
- Reduced runtime errors
- Self-documenting code
- Easier refactoring

### 4. React Navigation vs Other Solutions

**Decision**: React Navigation

**Rationale**:
- Official React Native solution
- Deep linking support
- Type-safe navigation
- Large community
- Well-maintained

### 5. Keychain vs AsyncStorage

**Decision**: React Native Keychain

**Rationale**:
- Secure token storage
- Encrypted by default
- Platform-native security
- Biometric support

### 6. Service Layer Pattern

**Decision**: Service classes

**Rationale**:
- Separation of concerns
- Reusable business logic
- Easy testing
- Clear API boundaries

### 7. Provider Pattern for Auth

**Decision**: Context API with Provider

**Rationale**:
- Global state management
- No prop drilling
- React-native solution
- Easy to test

---

## Performance Considerations

### 1. Code Splitting

- Navigation-based code splitting
- Lazy loading of screens
- Optimized bundle size

### 2. Data Caching

- Supabase query caching
- Local state caching
- Optimistic updates

### 3. Image Optimization

- Lazy loading
- Image compression
- CDN delivery

### 4. Network Optimization

- Request batching
- Offline support
- Request deduplication

---

## Scalability Considerations

### 1. Database Scaling

- Indexed queries
- Efficient RLS policies
- Connection pooling

### 2. API Rate Limiting

- Supabase rate limits
- Client-side throttling
- Request queuing

### 3. Horizontal Scaling

- Stateless services
- CDN distribution
- Load balancing

---

## Future Enhancements

### 1. State Management

- Consider Zustand for complex state
- Implement persistence strategies
- Add state synchronization

### 2. Offline Support

- Implement offline queue
- Add conflict resolution
- Sync strategies

### 3. Performance

- Add performance monitoring
- Implement analytics
- Optimize render cycles

### 4. Testing

- Increase test coverage
- Add E2E tests
- Implement visual regression tests

---

## Conclusion

This architecture provides a solid foundation for the Salon Management System with:

- **Clear separation of concerns**
- **Strong security model**
- **Scalable design**
- **Maintainable codebase**
- **Type-safe development**

The architecture supports the multi-role requirements while maintaining flexibility for future enhancements.

---

**Last Updated**: 2026-05-09
**Version**: 1.0.0
