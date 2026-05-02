---
name: Project Overview
description: Core understanding of the salon management system and its requirements
type: project
---

# Salon Management System Project Overview

## Project Identity
Multi-role salon management platform built with React Native and Supabase, designed for enterprise-level salon operations.

## Key Business Requirements
- Support 4 distinct user roles (Super Admin, Owner, Staff, Customer)
- Real-time booking and scheduling system
- Multi-salon management capabilities
- Comprehensive analytics and reporting
- Vendor and inventory management
- Mobile-first responsive design

## Technical Architecture Decisions
- **Frontend**: React Native CLI (not Expo) for native performance
- **Backend**: Supabase for rapid development with PostgreSQL
- **Authentication**: Supabase Auth with JWT tokens
- **State Management**: Zustand (planned) for simplicity
- **Navigation**: React Navigation with role-based stacks

## Why This Approach
- React Native CLI chosen over Expo for native module flexibility
- Supabase selected for integrated auth/database/storage solution
- Role-based architecture essential for business model
- Real-time features critical for booking system

## Current Status
- Project scaffolded with React Native CLI
- Supabase dependency added but not configured
- Base app structure with safe area handling
- Documentation complete, ready for development