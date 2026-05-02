---
name: Tech Stack Requirements
description: Technical requirements and constraints for the salon project
type: project
---

# Technical Stack Requirements

## Frontend Requirements
- React Native CLI 0.84.1 (not Expo)
- TypeScript for type safety
- Safe area handling for iOS/Android compatibility
- Custom component library (not UI frameworks for now)

## Backend Requirements
- Supabase for authentication, database, and storage
- PostgreSQL with Row Level Security (RLS)
- Real-time subscriptions for live booking updates
- Edge functions for custom business logic

## Authentication Requirements
- JWT-based authentication with role claims
- Secure token storage using React Native Keychain
- Automatic token refresh
- Role-based access control (RBAC)

## Performance Requirements
- Initial app load < 2 seconds
- Navigation transitions < 500ms
- Smooth 60fps animations
- Efficient image loading and caching

## Security Requirements
- All API requests authenticated
- Client-side permission validation
- HTTPS enforcement in production
- Data encryption at rest and in transit

## State Management
- Zustand for simplicity and performance
- Persistent storage for user preferences
- Real-time state updates via Supabase subscriptions

## Navigation Structure
- Stack-based navigation per role
- Deep linking support
- Tab navigation for main sections
- Modal presentation for overlays