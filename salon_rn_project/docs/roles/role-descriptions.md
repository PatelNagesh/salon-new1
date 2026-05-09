# Role Descriptions

Detailed descriptions of each user role in the Salon Management System.

## Table of Contents
1. [Role Overview](#role-overview)
2. [Super Admin](#super-admin)
3. [Salon Owner](#salon-owner)
4. [Manager](#manager)
5. [Staff](#staff)
6. [Customer](#customer)
7. [Vendor](#vendor)
8. [Role Comparison](#role-comparison)

---

## Role Overview

The Salon Management System supports six distinct user roles, each designed for specific stakeholders in the salon ecosystem.

### Role Hierarchy

```
Super Admin
    │
    ├── Salon Owner
    │       │
    │       └── Manager
    │               │
    │               └── Staff
    │
    ├── Customer
    │
    └── Vendor
```

### Role Summary

| Role | Primary Focus | Access Level | User Type |
|------|---------------|--------------|-----------|
| Super Admin | Platform management | System-wide | Administrator |
| Salon Owner | Business management | Multi-salon | Business Owner |
| Manager | Operations management | Single salon | Manager |
| Staff | Service delivery | Personal | Service Provider |
| Customer | Service booking | Personal | End User |
| Vendor | Product supply | Inventory | Supplier |

---

## Super Admin

### Description
Platform administrator with complete system access and oversight capabilities.

### Responsibilities

#### System Management
- Configure platform-wide settings
- Manage system users across all salons
- Monitor platform health and performance
- Handle system-level issues and emergencies

#### User Management
- Create and manage super admin accounts
- Assign and revoke salon owner roles
- Handle escalated user issues
- Review and audit system access

#### Analytics & Oversight
- View platform-wide analytics
- Monitor salon performance metrics
- Track system usage patterns
- Generate platform reports

### Capabilities

#### Full System Access
- Access all salon data
- Modify system configuration
- Override any permission restriction
- Perform emergency actions

#### Administrative Functions
- Manage database migrations
- Configure authentication settings
- Set up new salons
- Handle security incidents

### Use Cases

1. **System Configuration**
   - Configure authentication providers
   - Set up payment gateways
   - Configure notification systems

2. **User Management**
   - Create salon owner accounts
   - Reset user passwords
   - Handle account recovery

3. **Platform Monitoring**
   - Monitor system performance
   - Review error logs
   - Track user activity

4. **Emergency Access**
   - Resolve critical issues
   - Override permission restrictions
   - Perform system recovery

### Limitations
- Cannot modify business logic without deployment
- Cannot access encrypted user passwords
- Must follow audit trail requirements

---

## Salon Owner

### Description
Business owner with full control over one or more salons and complete business management capabilities.

### Responsibilities

#### Business Management
- Manage multiple salon locations
- Oversee business operations
- Make strategic business decisions
- Monitor financial performance

#### Staff Management
- Hire and manage staff members
- Create staff schedules
- Set staff permissions
- Handle staff performance

#### Service Management
- Create and manage service catalog
- Set service pricing
- Configure service duration
- Manage service availability

#### Customer Relations
- Manage customer relationships
- Handle customer issues
- Review customer feedback
- Implement loyalty programs

#### Financial Management
- Monitor revenue and expenses
- Generate financial reports
- Manage payroll
- Track business metrics

### Capabilities

#### Multi-Salon Management
- Manage multiple salon locations
- Compare performance across locations
- Transfer staff between locations
- Consolidate reporting

#### Full Business Control
- Modify salon settings
- Configure business hours
- Set pricing strategies
- Manage inventory

#### Staff Administration
- Create staff accounts
- Assign staff roles
- Manage staff schedules
- Review staff performance

#### Analytics & Reporting
- View business analytics
- Generate financial reports
- Track key performance indicators
- Export business data

### Use Cases

1. **Business Setup**
   - Create new salon locations
   - Configure business settings
   - Set up services and pricing

2. **Staff Management**
   - Hire new staff members
   - Create staff schedules
   - Assign roles and permissions

3. **Financial Oversight**
   - Review daily revenue
   - Monitor expenses
   - Generate monthly reports

4. **Customer Service**
   - Handle escalated customer issues
   - Review customer feedback
   - Implement service improvements

### Limitations
- Cannot access other owners' salon data
- Cannot modify system configuration
- Cannot assign super admin roles

---

## Manager

### Description
Salon manager with operational control over daily salon activities.

### Responsibilities

#### Operations Management
- Oversee daily operations
- Manage staff schedules
- Ensure service quality
- Handle customer issues

#### Staff Coordination
- Coordinate staff activities
- Manage daily schedules
- Assign staff to bookings
- Monitor staff performance

#### Booking Management
- Manage appointment bookings
- Handle booking conflicts
- Optimize schedule utilization
- Manage cancellations

#### Customer Service
- Assist customers
- Handle inquiries
- Resolve issues
- Collect feedback

### Capabilities

#### Operational Control
- View salon information
- Manage staff schedules
- View and edit bookings
- View customer information

#### Limited Administration
- Cannot create/delete staff
- Cannot modify salon settings
- Cannot access financial reports
- Cannot manage inventory

#### Reporting
- View operational reports
- Monitor staff performance
- Track booking metrics
- Generate daily summaries

### Use Cases

1. **Daily Operations**
   - Open/close salon
   - Manage staff assignments
   - Handle walk-in customers

2. **Schedule Management**
   - Create staff schedules
   - Assign bookings to staff
   - Handle schedule changes

3. **Customer Service**
   - Assist with bookings
   - Handle customer inquiries
   - Resolve service issues

4. **Performance Monitoring**
   - Monitor staff performance
   - Track booking metrics
   - Review customer feedback

### Limitations
- Cannot create or delete staff
- Cannot modify salon settings
- Cannot access financial data
- Cannot manage inventory

---

## Staff

### Description
Service provider with access to personal schedule and booking management.

### Responsibilities

#### Service Delivery
- Provide services to customers
- Maintain service quality
- Follow service protocols
- Meet customer expectations

#### Schedule Management
- View personal schedule
- Manage availability
- Request time off
- Update profile information

#### Booking Management
- View assigned bookings
- Create bookings for customers
- Update booking status
- Handle customer interactions

#### Customer Interaction
- Interact with customers
- Provide service information
- Collect customer feedback
- Maintain professional relationships

### Capabilities

#### Personal Access
- View personal schedule
- View assigned bookings
- Create new bookings
- Edit own profile

#### Service Information
- View service catalog
- Access service details
- View service pricing
- Check service availability

#### Limited Administration
- Cannot modify services
- Cannot access other staff data
- Cannot view business analytics

### Use Cases

1. **Service Delivery**
   - Perform scheduled services
   - Provide quality service
   - Meet customer expectations

2. **Schedule Management**
   - View daily schedule
   - Check availability
   - Request time off

3. **Booking Management**
   - View assigned bookings
   - Create bookings for customers
   - Update booking status

4. **Customer Interaction**
   - Greet customers
   - Provide service information
   - Collect feedback

### Limitations
- Cannot modify services
- Cannot access other staff data
- Cannot view business analytics
- Cannot manage inventory

---

## Customer

### Description
End-user with access to service browsing and booking capabilities.

### Responsibilities

#### Service Discovery
- Browse available services
- View service details
- Compare service options
- Check pricing

#### Booking Management
- Book appointments
- View booking history
- Cancel bookings
- Reschedule appointments

#### Profile Management
- Maintain personal profile
- Update contact information
- Manage preferences
- View booking history

### Capabilities

#### Service Access
- View service catalog
- Access service details
- Check availability
- View pricing

#### Booking Functions
- Create new bookings
- View own bookings
- Cancel own bookings
- View booking history

#### Profile Management
- Edit own profile
- Update contact information
- Manage preferences

### Use Cases

1. **Service Browsing**
   - Browse available services
   - View service details
   - Compare service options

2. **Booking Appointments**
   - Book appointments
   - Select preferred time
   - Choose service provider

3. **Managing Bookings**
   - View booking history
   - Cancel bookings
   - Reschedule appointments

4. **Profile Management**
   - Update personal information
   - Manage preferences
   - View booking history

### Limitations
- Cannot modify services
- Cannot access business data
- Cannot view other customers' data
- Cannot manage inventory

---

## Vendor

### Description
Product supplier with access to inventory management and order processing.

### Responsibilities

#### Inventory Management
- Monitor inventory levels
- Update product information
- Manage stock quantities
- Track product movement

#### Order Processing
- Receive and process orders
- Update order status
- Manage deliveries
- Handle returns

#### Product Management
- Create product listings
- Update product details
- Set pricing
- Manage product categories

#### Supply Chain
- Coordinate deliveries
- Manage supplier relationships
- Track shipments
- Handle logistics

### Capabilities

#### Inventory Access
- View inventory levels
- Manage stock quantities
- Update product information
- Track product movement

#### Order Management
- View orders
- Create orders
- Update order status
- Process returns

#### Product Administration
- Create products
- Edit product details
- Set pricing
- Manage categories

### Use Cases

1. **Inventory Management**
   - Monitor stock levels
   - Update inventory
   - Track product movement

2. **Order Processing**
   - Receive orders
   - Process shipments
   - Update order status

3. **Product Management**
   - Create product listings
   - Update product details
   - Set pricing

4. **Supply Chain**
   - Coordinate deliveries
   - Track shipments
   - Manage logistics

### Limitations
- Cannot access customer data
- Cannot view business analytics
- Cannot modify services
- Cannot access booking data

---

## Role Comparison

### Access Level Comparison

| Feature | Super Admin | Owner | Manager | Staff | Customer | Vendor |
|---------|-------------|-------|---------|-------|----------|--------|
| **System Access** | | | | | | |
| Platform settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| User management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| System analytics | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Salon Access** | | | | | | |
| View all salons | ✅ | Own | Own | ❌ | ❌ | ❌ |
| Edit salon settings | ✅ | Own | ❌ | ❌ | ❌ | ❌ |
| Create salons | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Staff Access** | | | | | | |
| View all staff | ✅ | Own | Own | ❌ | ❌ | ❌ |
| Create staff | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit staff | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete staff | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Schedule staff | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Service Access** | | | | | | |
| View services | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create services | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit services | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete services | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Booking Access** | | | | | | |
| View all bookings | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View own bookings | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create bookings | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit bookings | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cancel bookings | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Customer Access** | | | | | | |
| View all customers | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create customers | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit customers | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete customers | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Report Access** | | | | | | |
| View reports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Export reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Inventory Access** | | | | | | |
| View inventory | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Manage inventory | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Create products | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Edit products | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Profile Access** | | | | | | |
| Edit own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Responsibility Comparison

| Responsibility | Super Admin | Owner | Manager | Staff | Customer | Vendor |
|-----------------|-------------|-------|---------|-------|----------|--------|
| System configuration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| User management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Business strategy | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Financial management | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Staff management | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Service management | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Operations management | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Service delivery | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Service booking | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Inventory management | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Order processing | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Role Assignment Workflow

### New User Registration

```
1. User signs up
   ↓
2. Default role: CUSTOMER
   ↓
3. User can request role upgrade
   ↓
4. Owner/Manager approves request
   ↓
5. Role assigned
```

### Role Promotion

```
Customer → Staff (by Owner)
   ↓
Staff → Manager (by Owner)
   ↓
Manager → Owner (by Super Admin)
```

### Role Demotion

```
Manager → Staff (by Owner)
   ↓
Staff → Customer (by Owner)
```

---

## Security Considerations

### Role-Based Security

Each role has specific security considerations:

#### Super Admin
- Requires multi-factor authentication
- Activity logging required
- Regular access reviews
- Emergency access procedures

#### Owner
- Business data isolation
- Audit trail for financial data
- Limited system access
- Regular security training

#### Manager
- Operational data access only
- Time-based access restrictions
- Activity monitoring
- Limited financial access

#### Staff
- Personal data access only
- Customer data privacy
- Service quality tracking
- Performance monitoring

#### Customer
- Personal data protection
- Booking privacy
- Profile security
- Preference management

#### Vendor
- Inventory data access
- Order processing security
- Supply chain privacy
- Product information protection

---

## Next Steps

1. [Review Permission Matrix](permission-matrix.md)
2. [Check Authorization Implementation](../security/authorization.md)
3. [Review Security Best Practices](../security/best-practices.md)

---

**Last Updated**: 2026-05-09
**Version**: 1.0.0
