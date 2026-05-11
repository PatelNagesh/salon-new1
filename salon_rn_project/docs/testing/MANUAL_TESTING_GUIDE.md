# Phase 6: Manual Testing Guide

## Overview
This document provides comprehensive manual testing procedures for the Salon Management System Phase 6 implementation.

## Prerequisites

### Environment Setup
1. **Development Environment**
   - Node.js 18+ installed
   - React Native CLI installed
   - iOS Simulator or Android Emulator running
   - Supabase project configured

2. **Test Data**
   - Seed data applied to database
   - Test users created for each role
   - Test salon, services, staff, and customers available

### Test Accounts
Create the following test accounts:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Super Admin | admin@test.com | Test123! | System management |
| Salon Owner | owner@test.com | Test123! | Salon operations |
| Staff | staff@test.com | Test123! | Staff operations |
| Customer | customer@test.com | Test123! | Customer operations |

## Testing Checklist

### 1. Authentication Testing

#### 1.1 User Registration
- [ ] Register new user with valid email
- [ ] Register with invalid email format (should fail)
- [ ] Register with weak password (should fail)
- [ ] Register with existing email (should fail)
- [ ] Verify email confirmation flow
- [ ] Check profile creation after registration

#### 1.2 User Login
- [ ] Login with valid credentials
- [ ] Login with invalid email (should fail)
- [ ] Login with invalid password (should fail)
- [ ] Login with unverified email (should fail)
- [ ] Test remember me functionality
- [ ] Test auto-login on app restart

#### 1.3 User Logout
- [ ] Logout successfully
- [ ] Verify session cleared
- [ ] Test redirect to login screen
- [ ] Verify no data leakage after logout

#### 1.4 Password Reset
- [ ] Request password reset
- [ ] Verify reset email received
- [ ] Reset password with valid token
- [ ] Reset with expired token (should fail)
- [ ] Login with new password

### 2. Role-Based Access Control Testing

#### 2.1 Super Admin
- [ ] Access system dashboard
- [ ] View all salons
- [ ] Create new salon
- [ ] Edit salon details
- [ ] Delete salon (with confirmation)
- [ ] View all users
- [ ] Manage user roles
- [ ] View system analytics
- [ ] Access system settings

#### 2.2 Salon Owner
- [ ] Access salon dashboard
- [ ] View own salon only
- [ ] Cannot access other salons
- [ ] Manage staff members
- [ ] Create staff member
- [ ] Edit staff details
- [ ] Delete staff member
- [ ] Manage services
- [ ] Create service
- [ ] Edit service details
- [ ] Delete service
- [ ] View bookings
- [ ] Manage customers
- [ ] View inventory
- [ ] Manage vendors
- [ ] View salon analytics
- [ ] Access salon reports

#### 2.3 Staff Member
- [ ] Access staff dashboard
- [ ] View own schedule
- [ ] Cannot access other staff schedules
- [ ] View assigned bookings
- [ ] Update booking status
- [ ] View services
- [ ] Cannot edit services
- [ ] View customer information
- [ ] Cannot edit customer details
- [ ] Access own profile
- [ ] Update own profile

#### 2.4 Customer
- [ ] Access customer dashboard
- [ ] Browse services
- [ ] View salon information
- [ ] Create booking
- [ ] View own bookings
- [ ] Cancel own booking
- [ ] Cannot access other bookings
- [ ] View own profile
- [ ] Update own profile
- [ ] Cannot access staff areas
- [ ] Cannot access inventory

### 3. Booking Flow Testing

#### 3.1 Service Selection
- [ ] Browse available services
- [ ] Filter services by category
- [ ] Search services by name
- [ ] View service details
- [ ] View service pricing
- [ ] View service duration

#### 3.2 Staff Selection
- [ ] View available staff for service
- [ ] View staff profiles
- [ ] View staff ratings
- [ ] Select preferred staff

#### 3.3 Time Slot Selection
- [ ] View available time slots
- [ ] Select date from calendar
- [ ] View time availability
- [ ] Select time slot
- [ ] Verify no double-booking

#### 3.4 Booking Creation
- [ ] Create booking with all details
- [ ] Add booking notes
- [ ] Verify booking price calculation
- [ ] Confirm booking
- [ ] Receive booking confirmation

#### 3.5 Booking Management
- [ ] View booking details
- [ ] Update booking status
- [ ] Cancel booking
- [ ] Reschedule booking
- [ ] View booking history

#### 3.6 Booking Completion
- [ ] Mark booking as completed
- [ ] Verify customer stats update
- [ ] Verify staff commission calculation
- [ ] Add completion notes

### 4. Customer Management Testing

#### 4.1 Customer Profile
- [ ] View customer profile
- [ ] Edit customer details
- [ ] Update contact information
- [ ] Upload profile picture

#### 4.2 Customer Statistics
- [ ] View total visits
- [ ] View total spent
- [ ] View average spending
- [ ] View last visit date
- [ ] View favorite service

#### 4.3 Customer Notes
- [ ] Add customer note
- [ ] View customer notes
- [ ] Edit customer note
- [ ] Delete customer note
- [ ] Mark note as private

#### 4.4 Referral Program
- [ ] Generate referral code
- [ ] View referral code
- [ ] Track referred customers
- [ ] View referral bonus
- [ ] Apply referral bonus

#### 4.5 Loyalty Program
- [ ] View loyalty points
- [ ] Add loyalty points
- [ ] Redeem loyalty points
- [ ] View points history

#### 4.6 Customer Search
- [ ] Search by name
- [ ] Search by phone
- [ ] Search by email
- [ ] View search results
- [ ] Filter results

### 5. Staff Management Testing

#### 5.1 Staff Profile
- [ ] Create staff profile
- [ ] View staff details
- [ ] Edit staff information
- [ ] Update commission rate
- [ ] Activate/deactivate staff

#### 5.2 Staff Schedule
- [ ] View weekly schedule
- [ ] Update daily schedule
- [ ] Set working hours
- [ ] Add break times
- [ ] Set day off

#### 5.3 Staff Performance
- [ ] View performance metrics
- [ ] View total bookings
- [ ] View completion rate
- [ ] View total revenue
- [ ] View average revenue

#### 5.4 Staff Commission
- [ ] Calculate commission
- [ ] View commission details
- [ ] Update commission rate
- [ ] View commission history

#### 5.5 Staff Availability
- [ ] Check availability for date
- [ ] Check availability for time slot
- [ ] View available staff
- [ ] Filter by service

#### 5.6 Staff Ranking
- [ ] View staff ranking
- [ ] Sort by performance
- [ ] Sort by revenue
- [ ] View top performers

### 6. Inventory Management Testing

#### 6.1 Inventory Overview
- [ ] View all inventory items
- [ ] Filter by category
- [ ] Search by product name
- [ ] Sort by quantity
- [ ] Sort by reorder level

#### 6.2 Low Stock Alerts
- [ ] View low stock items
- [ ] Check urgency levels
- [ ] View reorder suggestions
- [ ] Estimate days until stockout

#### 6.3 Stock Adjustments
- [ ] Add stock
- [ ] Remove stock
- [ ] Correct stock quantity
- [ ] Add adjustment reason
- [ ] View adjustment history

#### 6.4 Inventory Tracking
- [ ] View inventory tracking
- [ ] View total added
- [ ] View total removed
- [ ] View average daily usage
- [ ] View days of stock remaining

#### 6.5 Reorder Management
- [ ] View reorder suggestions
- [ ] Create purchase order
- [ ] Update purchase order
- [ ] Track order status

#### 6.6 Product Analytics
- [ ] View fast-moving products
- [ ] View slow-moving products
- [ ] View product trends
- [ ] View sales history

### 7. Real-Time Features Testing

#### 7.1 Booking Updates
- [ ] Receive booking creation notification
- [ ] Receive booking update notification
- [ ] Receive booking cancellation notification
- [ ] Update booking list in real-time
- [ ] Show live booking indicator

#### 7.2 Inventory Updates
- [ ] Receive inventory change notification
- [ ] Update inventory levels in real-time
- [ ] Show low stock alert in real-time
- [ ] Update reorder suggestions

#### 7.3 Order Updates
- [ ] Receive order creation notification
- [ ] Receive order status update
- [ ] Update order list in real-time
- [ ] Show live order indicator

#### 7.4 Connection Status
- [ ] Show connected status
- [ ] Show disconnected status
- [ ] Show connecting status
- [ ] Handle reconnection
- [ ] Show real-time indicator

### 8. UI/UX Testing

#### 8.1 Navigation
- [ ] Navigate between screens
- [ ] Use back button
- [ ] Use bottom navigation
- [ ] Use drawer navigation
- [ ] Test deep links

#### 8.2 Forms
- [ ] Fill out booking form
- [ ] Validate form inputs
- [ ] Show error messages
- [ ] Clear form data
- [ ] Save form data

#### 8.3 Lists
- [ ] Scroll through long lists
- [ ] Pull to refresh
- [ ] Load more items
- [ ] Filter list items
- [ ] Sort list items

#### 8.4 Modals
- [ ] Open confirmation modal
- [ ] Cancel modal action
- [ ] Confirm modal action
- [ ] Close modal with backdrop

#### 8.5 Loading States
- [ ] Show loading spinner
- [ ] Show skeleton screens
- [ ] Handle loading errors
- [ ] Show empty states

### 9. Performance Testing

#### 9.1 Load Time
- [ ] App startup time < 3s
- [ ] Screen navigation < 500ms
- [ ] Data fetch < 2s
- [ ] Image loading < 1s

#### 9.2 Scroll Performance
- [ ] Smooth scrolling at 60fps
- [ ] No dropped frames
- [ ] Efficient list rendering
- [ ] Lazy loading working

#### 9.3 Memory Usage
- [ ] No memory leaks
- [ ] Proper cleanup on unmount
- [ ] Efficient state management
- [ ] Optimized re-renders

### 10. Error Handling Testing

#### 10.1 Network Errors
- [ ] Handle offline mode
- [ ] Show network error message
- [ ] Retry failed requests
- [ ] Cache data offline

#### 10.2 API Errors
- [ ] Handle 400 errors
- [ ] Handle 401 errors
- [ ] Handle 403 errors
- [ ] Handle 404 errors
- [ ] Handle 500 errors

#### 10.3 Validation Errors
- [ ] Show form validation errors
- [ ] Highlight invalid fields
- [ ] Provide error messages
- [ ] Allow correction

#### 10.4 Permission Errors
- [ ] Show access denied message
- [ ] Redirect to appropriate screen
- [ ] Hide unauthorized features
- [ ] Show permission explanation

### 11. Cross-Platform Testing

#### 11.1 iOS Testing
- [ ] Test on iPhone simulator
- [ ] Test on iPad simulator
- [ ] Test on different iOS versions
- [ ] Test on different screen sizes
- [ ] Test with safe areas

#### 11.2 Android Testing
- [ ] Test on Android emulator
- [ ] Test on different Android versions
- [ ] Test on different screen sizes
- [ ] Test with different densities
- [ ] Test with navigation bars

### 12. Accessibility Testing

#### 12.1 Screen Reader
- [ ] Test with VoiceOver (iOS)
- [ ] Test with TalkBack (Android)
- [ ] Verify all elements accessible
- [ ] Verify proper labels

#### 12.2 Visual Accessibility
- [ ] Test with increased text size
- [ ] Test with high contrast
- [ ] Test with reduced motion
- [ ] Test with color blind mode

#### 12.3 Touch Targets
- [ ] Verify minimum touch target size
- [ ] Test with different finger sizes
- [ ] Verify spacing between elements
- [ ] Test reachability

## Test Results Template

### Test Session Information
- **Date**: _______________
- **Tester**: _______________
- **Environment**: _______________
- **Device**: _______________
- **OS Version**: _______________

### Test Results Summary
| Category | Total Tests | Passed | Failed | Blocked |
|----------|-------------|--------|--------|---------|
| Authentication | | | | |
| RBAC | | | | |
| Booking Flow | | | | |
| Customer Management | | | | |
| Staff Management | | | | |
| Inventory Management | | | | |
| Real-Time Features | | | | |
| UI/UX | | | | |
| Performance | | | | |
| Error Handling | | | | |
| Cross-Platform | | | | |
| Accessibility | | | | |
| **TOTAL** | | | | |

### Issues Found
| ID | Severity | Description | Steps to Reproduce | Status |
|----|----------|-------------|-------------------|--------|
| | | | | |

### Notes
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

## Sign-Off

### Tester Approval
- [ ] All critical issues resolved
- [ ] All high priority issues resolved
- [ ] All medium priority issues documented
- [ ] All low priority issues documented
- [ ] Performance requirements met
- [ ] Accessibility requirements met
- [ ] Cross-platform compatibility verified

### Stakeholder Approval
- [ ] Product Owner approved
- [ ] QA Lead approved
- [ ] Development Lead approved

**Final Approval**: _______________ **Date**: _______________
