# Permission Matrix

Complete permission matrix for all user roles in the Salon Management System.

## Table of Contents
1. [Overview](#overview)
2. [Permission Categories](#permission-categories)
3. [Role Permission Matrix](#role-permission-matrix)
4. [Detailed Role Permissions](#detailed-role-permissions)
5. [Permission Implementation](#permission-implementation)
6. [Permission Hierarchy](#permission-hierarchy)

---

## Overview

The Salon Management System uses a **role-based access control (RBAC)** model with granular permissions. Each user role has specific permissions that determine what actions they can perform within the system.

### Permission Levels

1. **System Level**: Platform-wide operations
2. **Salon Level**: Operations within a specific salon
3. **Personal Level**: Operations on own data
4. **Read Only**: View-only access
5. **Full Access**: Complete CRUD operations

---

## Permission Categories

### System Permissions
| Permission | Description |
|------------|-------------|
| `system.config` | Configure system-wide settings |
| `system.manage_users` | Manage users across all salons |
| `system.view_analytics` | View platform-wide analytics |

### Salon Permissions
| Permission | Description |
|------------|-------------|
| `salon.view` | View salon information |
| `salon.edit` | Edit salon details |
| `salon.delete` | Delete salon |
| `salon.create` | Create new salon |

### Staff Permissions
| Permission | Description |
|------------|-------------|
| `staff.view` | View staff information |
| `staff.create` | Add new staff members |
| `staff.edit` | Edit staff details |
| `staff.delete` | Remove staff members |
| `staff.schedule` | Manage staff schedules |

### Service Permissions
| Permission | Description |
|------------|-------------|
| `service.view` | View service catalog |
| `service.create` | Add new services |
| `service.edit` | Edit service details |
| `service.delete` | Remove services |

### Booking Permissions
| Permission | Description |
|------------|-------------|
| `booking.view` | View all bookings |
| `booking.view_own` | View own bookings |
| `booking.create` | Create new bookings |
| `booking.edit` | Modify bookings |
| `booking.cancel` | Cancel bookings |
| `booking.complete` | Mark bookings as complete |

### Customer Permissions
| Permission | Description |
|------------|-------------|
| `customer.view` | View customer information |
| `customer.create` | Add new customers |
| `customer.edit` | Edit customer details |
| `customer.delete` | Remove customers |

### Report Permissions
| Permission | Description |
|------------|-------------|
| `reports.view` | View reports and analytics |
| `reports.export` | Export reports |

### Profile Permissions
| Permission | Description |
|------------|-------------|
| `profile.edit` | Edit own profile |

### Inventory Permissions
| Permission | Description |
|------------|-------------|
| `inventory.view` | View inventory |
| `inventory.manage` | Manage inventory levels |
| `product.create` | Add new products |
| `product.edit` | Edit product details |
| `order.view` | View orders |
| `order.create` | Create new orders |

---

## Role Permission Matrix

### Complete Permission Matrix

| Permission | Super Admin | Owner | Manager | Staff | Customer | Vendor |
|------------|-------------|-------|---------|-------|----------|--------|
| **System** | | | | | | |
| system.config | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| system.manage_users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| system.view_analytics | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Salon** | | | | | | |
| salon.view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| salon.edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| salon.delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| salon.create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Staff** | | | | | | |
| staff.view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| staff.create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| staff.edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| staff.delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| staff.schedule | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Service** | | | | | | |
| service.view | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| service.create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| service.edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| service.delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Booking** | | | | | | |
| booking.view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| booking.view_own | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| booking.create | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| booking.edit | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| booking.cancel | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| booking.complete | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Customer** | | | | | | |
| customer.view | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| customer.create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| customer.edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| customer.delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Reports** | | | | | | |
| reports.view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| reports.export | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Profile** | | | | | | |
| profile.edit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Inventory** | | | | | | |
| inventory.view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| inventory.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| product.create | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| product.edit | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| order.view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| order.create | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

### Legend
- ✅ = Permission granted
- ❌ = Permission denied

---

## Detailed Role Permissions

### Super Admin

**Description**: Platform administrator with full system access.

**Permissions**:
- All system permissions
- All salon permissions
- All staff permissions
- All service permissions
- All booking permissions
- All customer permissions
- All report permissions
- All inventory permissions

**Access Scope**:
- Platform-wide access
- Can manage all salons
- Can assign any role
- Can configure system settings

**Use Cases**:
- System configuration
- User management
- Platform analytics
- Emergency access

---

### Salon Owner

**Description**: Business owner with full control over their salon(s).

**Permissions**:
- All salon permissions (own salons only)
- All staff permissions (own salons only)
- All service permissions (own salons only)
- All booking permissions (own salons only)
- All customer permissions (own salons only)
- All report permissions (own salons only)
- Profile edit permission

**Access Scope**:
- Multi-salon management
- Full control over owned salons
- Can assign staff and manager roles
- Cannot access other owners' data

**Use Cases**:
- Business management
- Staff hiring and management
- Financial reporting
- Customer relationship management

---

### Manager

**Description**: Salon manager with operational control.

**Permissions**:
- View salon information
- View and schedule staff
- View services
- View and edit bookings
- View customers
- View reports
- Edit own profile

**Access Scope**:
- Single salon management
- Operational control
- Cannot create/delete staff
- Cannot modify salon settings

**Use Cases**:
- Daily operations
- Staff scheduling
- Booking management
- Customer service

---

### Staff

**Description**: Service provider with limited access.

**Permissions**:
- View services
- View and create bookings
- View own bookings
- Edit own profile

**Access Scope**:
- Personal schedule access
- Can create bookings for customers
- Cannot access other staff data
- Cannot modify services

**Use Cases**:
- Service delivery
- Booking management
- Customer interaction
- Schedule viewing

---

### Customer

**Description**: End-user with basic access.

**Permissions**:
- View services
- Create bookings
- View own bookings
- Cancel own bookings
- Edit own profile

**Access Scope**:
- Personal data access only
- Can book services
- Cannot access business data
- Cannot modify services

**Use Cases**:
- Service browsing
- Booking appointments
- Viewing history
- Profile management

---

### Vendor

**Description**: Product supplier with inventory access.

**Permissions**:
- View inventory
- Manage inventory levels
- Create and edit products
- View and create orders
- Edit own profile

**Access Scope**:
- Inventory management
- Order processing
- Product catalog management
- Cannot access customer data

**Use Cases**:
- Inventory management
- Order fulfillment
- Product catalog maintenance
- Supply chain operations

---

## Permission Implementation

### Client-Side Permission Check

```typescript
import { usePermission } from '../hooks/usePermission';

function BookingButton() {
  const { hasPermission } = usePermission();

  if (!hasPermission('booking.create')) {
    return null;
  }

  return <Button onPress={createBooking}>Book Now</Button>;
}
```

### Server-Side Permission Check

```typescript
// In service layer
class BookingService {
  static async createBooking(bookingData: BookingData) {
    const hasPermission = await AuthService.hasPermission('booking.create');

    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    // Create booking
  }
}
```

### Database-Level Permission Check

```sql
-- RLS Policy
CREATE POLICY "Staff can create bookings"
ON bookings FOR INSERT
WITH CHECK (
  has_permission(auth.uid(), 'booking.create')
  AND salon_id IN (
    SELECT salon_id FROM user_roles
    WHERE user_id = auth.uid()
  )
);
```

---

## Permission Hierarchy

### Role Hierarchy

```
Super Admin (Level 6)
    │
    ▼
Owner (Level 5)
    │
    ▼
Manager (Level 4)
    │
    ▼
Staff (Level 3)
    │
    ▼
Customer (Level 2)
    │
    ▼
Vendor (Level 2)
```

### Permission Inheritance

Higher-level roles inherit all permissions from lower-level roles within their scope.

**Example**: Owner inherits all Staff permissions plus additional management permissions.

### Permission Override

Super Admin can override any permission restriction for emergency access.

---

## Permission Assignment

### Automatic Assignment

| Role | Assignment Method |
|------|-------------------|
| Customer | Default for new users |
| Owner | During salon creation |
| Staff | By owner/manager |
| Manager | By owner |
| Vendor | By super admin |
| Super Admin | By super admin only |

### Manual Assignment

```typescript
// Assign staff role
await AuthService.updateUserRole('STAFF', salonId);

// Assign manager role
await AuthService.updateUserRole('MANAGER', salonId);
```

### Role Transition Rules

| From | To | Allowed By |
|------|-----|------------|
| Customer | Staff | Owner |
| Staff | Manager | Owner |
| Manager | Owner | Super Admin |
| Any | Super Admin | Super Admin only |
| Any | Customer | Owner |

---

## Permission Auditing

### Audit Log

All permission checks are logged for security auditing:

```typescript
interface PermissionAuditLog {
  userId: string;
  role: UserRole;
  permission: Permission;
  granted: boolean;
  timestamp: Date;
  resource: string;
  action: string;
}
```

### Access Review

Regular access reviews should be conducted:
- Monthly for high-privilege roles
- Quarterly for standard roles
- Annually for all roles

---

## Security Considerations

### Principle of Least Privilege

Users are granted only the minimum permissions necessary to perform their duties.

### Permission Revocation

Permissions are immediately revoked when:
- User role changes
- User is deactivated
- Salon relationship ends
- Security incident occurs

### Temporary Permissions

For special circumstances, temporary permissions can be granted with expiration:

```typescript
await AuthService.grantTemporaryPermission(
  userId,
  'reports.export',
  new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
);
```

---

## Next Steps

1. [Review Role Descriptions](role-descriptions.md)
2. [Check Authorization Implementation](../security/authorization.md)
3. [Review Security Best Practices](../security/best-practices.md)

---

**Last Updated**: 2026-05-09
**Version**: 1.0.0
