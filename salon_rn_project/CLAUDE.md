# Salon Project - Claude Code Setup & Instructions

## 🎯 Project Overview

This is a **Multi-Role Salon Management System** built with React Native CLI, designed to serve four distinct user roles with comprehensive business management capabilities.

### Core Business Purpose
- **Digital transformation** of salon operations
- **Role-based access** for different stakeholders
- **Real-time booking** and inventory management
- **Analytics & reporting** for business intelligence

## 👥 User Roles & Capabilities

### 1. **Super Admin**
- System configuration
- User management across all salons
- Global analytics and oversight
- Platform health monitoring

### 2. **Salon Owner**
- Multi-salon management
- Staff scheduling & payroll
- Financial reporting & P&L
- Customer relationship management
- Vendor & inventory management

### 3. **Staff Members**
- Appointment management
- Service execution tracking
- Personal schedule viewing
- Customer interaction history

### 4. **Customers**
- Appointment booking
- Service browsing
- History tracking
- Personal profile management

## 🛠 Tech Stack

### Frontend (React Native)
- **Core**: React Native 0.84.1, React 19.2.3
- **State Management**: Zustand (planned)
- **Navigation**: React Navigation (stack-based)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **UI**: Custom components with safe-area handling
- **TypeScript**: Full type safety

### Backend (Supabase)
- **Auth**: Multi-role JWT authentication
- **Database**: PostgreSQL with RLS policies
- **Storage**: File management for profiles/services
- **Realtime**: Live booking updates
- **Edge Functions**: Custom business logic

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer App  │    │    Staff App    │    │   Owner App     │
│                 │    │                 │    │                 │
│ - Browse        │    │ - Dashboard     │    │ - Multi-Salon   │
│ - Book          │    │ - Schedule      │    │ - Analytics     │
│ - History       │    │ - Services      │    │ - Staff Mgmt    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Supabase      │
                    │                 │
                    │ - Auth          │
                    │ - Database      │
                    │ - Storage       │
                    │ - Realtime      │
                    └─────────────────┘
```

## 🤖 Claude Code Integration

### When to Use Claude Code CLI

#### 1. **Feature Development**
```
claude-code "Add a new booking screen with calendar view and time slot selection"
```
**Agent needed**: `general-purpose`
**Why**: Complex feature requiring multiple components, API integration, and navigation

#### 2. **Database Schema Design**
```
claude-code "Design the database schema for salon services with pricing and duration"
```
**Agent needed**: `Plan` agent for architecture, then `general-purpose` for implementation
**Why**: Requires planning, SQL knowledge, and understanding of relationships

#### 3. **Authentication Flow**
```
claude-code "Implement multi-role authentication with Supabase and role-based navigation"
```
**Agent needed**: `general-purpose`
**Why**: Security-critical feature requiring auth expertise and navigation setup

#### 4. **UI Component Creation**
```
claude-code "Create a reusable ServiceCard component with image, name, price, and booking button"
```
**Agent needed**: Direct implementation (no agent needed)
**Why**: Single component with clear requirements

#### 5. **Bug Fixes**
```
claude-code "Fix the navigation issue when staff user tries to access owner screens"
```
**Agent needed**: Direct implementation or `Explore` agent
**Why**: Requires code investigation and targeted fixes

### Agent Types to Use

#### **Plan Agent** (for architectural decisions)
Use when:
- Designing new modules
- Planning complex features
- Architectural trade-offs needed
- Database schema changes

Example:
```
claude-code --agent plan "Plan the analytics module for salon owners with daily/monthly reports"
```

#### **General Purpose Agent** (for implementation)
Use when:
- Building complete features
- Multi-file changes
- API integration
- Complex business logic

Example:
```
claude-code --agent general-purpose "Implement the complete booking flow from service selection to confirmation"
```

#### **Explore Agent** (for investigation)
Use when:
- Understanding codebase
- Finding specific implementations
- Bug investigation
- Code review

Example:
```
claude-code --agent explore "Find how authentication is currently handled and what's missing"
```

## 📋 Development Workflow

### 1. **Setup Phase**
```bash
# Install dependencies
npm install

# Configure Supabase
# Create .env with SUPABASE_URL and SUPABASE_ANON_KEY

# Start development server
npm start
```

### 2. **Feature Development Process**
1. **Plan** (Use Plan Agent)
   - Define requirements
   - Design architecture
   - Identify dependencies

2. **Implement** (Use General Purpose Agent)
   - Create components
   - Write services
   - Update navigation

3. **Test** (Manual/CLI)
   - Test on device/simulator
   - Verify role permissions
   - Check API responses

4. **Commit** (Use Caveman Commit Skill)
   ```
   /caveman-commit
   ```

### 3. **Code Review**
```
claude-code --agent explore "Review the authentication implementation for security issues"
```

## 🎯 Specific Project Requirements

### Must-Have Features
1. **Multi-Role Authentication**
   - JWT with role claims
   - Secure token storage
   - Auto token refresh

2. **Real-Time Booking**
   - Live availability
   - Conflict prevention
   - Instant notifications

3. **Role-Based Dashboards**
   - Custom UI per role
   - Permission checks
   - Data filtering

4. **Offline Support**
   - Cached data
   - Queue actions
   - Sync on reconnect

### Security Requirements
- Row Level Security (RLS) in Supabase
- Client-side permission checks
- Secure storage (Keychain)
- API request validation

### Performance Targets
- < 2s initial load
- < 500ms navigation transitions
- Smooth 60fps animations
- Efficient image loading

## 🔧 Claude Code Skills to Develop

### Custom Skills for This Project
1. **Salon Feature Skill**
   - Quick booking flow creation
   - Service management
   - Staff scheduling

2. **Supabase Integration Skill**
   - Auth setup
   - Query optimization
   - Realtime subscriptions

3. **Role-Based UI Skill**
   - Permission-based components
   - Dynamic navigation
   - Data filtering

## 📈 Recommended Development Sequence

### Phase 1: Foundation (Week 1-2)
1. Setup Supabase project
2. Implement authentication
3. Create base navigation
4. Build role-based routing

### Phase 2: Core Features (Week 3-4)
1. Service catalog
2. Booking system
3. Staff dashboard
4. Customer interface

### Phase 3: Advanced Features (Week 5-6)
1. Analytics dashboard
2. Vendor management
3. Notifications
4. Payment integration

### Phase 4: Polish & Launch (Week 7-8)
1. Performance optimization
2. Error handling
3. Testing
4. Deployment prep

## 🚀 Quick Start Commands

```bash
# Create a new feature
claude-code "Add customer profile screen with edit capabilities"

# Plan a complex module
claude-code --agent plan "Design the inventory management system for salon vendors"

# Explore existing code
claude-code --agent explore "How is navigation structured for different roles?"

# Generate commit message
/caveman-commit

# Review changes
claude-code --agent explore "Review recent changes for authentication security"
```

## 📚 Additional Resources

- [Supabase React Native Docs](https://supabase.com/docs/guides/getting-started/react-native)
- [React Navigation Docs](https://reactnavigation.org/)
- [React Native Official Docs](https://reactnative.dev/)
- [Project Documentation](./doc/Application Purpose & User Roles.pdf)

---

**Remember**: This is a production-ready enterprise application. Focus on security, scalability, and user experience. Always test role-based permissions thoroughly!