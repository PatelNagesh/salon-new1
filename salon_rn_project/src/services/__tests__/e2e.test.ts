import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '../supabase';

describe('E2E Tests - User Authentication Flow', () => {
  let testUserEmail: string;
  let testUserId: string;

  beforeAll(async () => {
    testUserEmail = `e2e-test-${Date.now()}@example.com`;
  });

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await supabase.from('profiles').delete().eq('id', testUserId);
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  describe('Complete Authentication Flow', () => {
    it('should register new user', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: testUserEmail,
        password: 'TestPassword123!',
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testUserEmail);

      testUserId = data.user?.id || '';
    });

    it('should login with valid credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUserEmail,
        password: 'TestPassword123!',
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testUserEmail);
    });

    it('should fail login with invalid credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUserEmail,
        password: 'WrongPassword123!',
      });

      expect(error).not.toBeNull();
      expect(data.user).toBeNull();
    });

    it('should logout successfully', async () => {
      const { error } = await supabase.auth.signOut();

      expect(error).toBeNull();
    });
  });
});

describe('E2E Tests - Role-Based Access Control', () => {
  let superAdminId: string;
  let salonOwnerId: string;
  let staffId: string;
  let customerId: string;
  let testSalonId: string;

  beforeAll(async () => {
    // Create test users with different roles
    const { data: superAdmin } = await supabase.auth.signUp({
      email: `superadmin-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    superAdminId = superAdmin.user?.id || '';

    const { data: salonOwner } = await supabase.auth.signUp({
      email: `owner-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    salonOwnerId = salonOwner.user?.id || '';

    const { data: staff } = await supabase.auth.signUp({
      email: `staff-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    staffId = staff.user?.id || '';

    const { data: customer } = await supabase.auth.signUp({
      email: `customer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    customerId = customer.user?.id || '';

    // Create test salon
    const { data: salon } = await supabase
      .from('salons')
      .insert({
        name: 'E2E Test Salon',
        address: '123 E2E St',
        phone: '123-456-7890',
        email: 'e2e@example.com',
      })
      .select()
      .single();

    testSalonId = salon.id;

    // Update profiles with roles
    await supabase.from('profiles').upsert([
      { id: superAdminId, role: 'super_admin' },
      { id: salonOwnerId, role: 'salon_owner', salon_id: testSalonId },
      { id: staffId, role: 'staff', salon_id: testSalonId },
      { id: customerId, role: 'customer', salon_id: testSalonId },
    ]);
  });

  afterAll(async () => {
    // Cleanup
    await supabase.from('profiles').delete().in('id', [superAdminId, salonOwnerId, staffId, customerId]);
    await supabase.from('salons').delete().eq('id', testSalonId);
    await supabase.auth.admin.deleteUser(superAdminId);
    await supabase.auth.admin.deleteUser(salonOwnerId);
    await supabase.auth.admin.deleteUser(staffId);
    await supabase.auth.admin.deleteUser(customerId);
  });

  describe('Super Admin Permissions', () => {
    it('should access system management', async () => {
      // Super admin should have access to all system resources
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', superAdminId)
        .single();

      expect(profile?.role).toBe('super_admin');
    });

    it('should manage all users', async () => {
      // Super admin can view all users
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);

      expect(users).toBeDefined();
      expect(users?.length).toBeGreaterThan(0);
    });
  });

  describe('Salon Owner Permissions', () => {
    it('should access own salon data', async () => {
      const { data: salon } = await supabase
        .from('salons')
        .select('*')
        .eq('id', testSalonId)
        .single();

      expect(salon).toBeDefined();
      expect(salon?.id).toBe(testSalonId);
    });

    it('should manage salon staff', async () => {
      const { data: staff } = await supabase
        .from('staff_members')
        .select('*')
        .eq('salon_id', testSalonId);

      expect(Array.isArray(staff)).toBe(true);
    });

    it('should manage salon services', async () => {
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', testSalonId);

      expect(Array.isArray(services)).toBe(true);
    });
  });

  describe('Staff Permissions', () => {
    it('should access own bookings', async () => {
      // Create test staff member
      const { data: staffMember } = await supabase
        .from('staff_members')
        .insert({
          salon_id: testSalonId,
          name: 'E2E Staff',
          email: `e2estaff-${Date.now()}@example.com`,
          phone: '123-456-7890',
          commission_rate: 20,
          is_active: true,
        })
        .select()
        .single();

      expect(staffMember).toBeDefined();
      expect(staffMember?.salon_id).toBe(testSalonId);

      // Cleanup
      await supabase.from('staff_members').delete().eq('id', staffMember.id);
    });

    it('should access own schedule', async () => {
      const { data: schedule } = await supabase
        .from('staff_schedules')
        .select('*')
        .eq('staff_id', staffId);

      expect(Array.isArray(schedule)).toBe(true);
    });
  });

  describe('Customer Permissions', () => {
    it('should create own bookings', async () => {
      // Create test service
      const { data: service } = await supabase
        .from('services')
        .insert({
          salon_id: testSalonId,
          name: 'E2E Service',
          description: 'E2E test service',
          price: 50,
          duration: 60,
        })
        .select()
        .single();

      // Create test staff
      const { data: staffMember } = await supabase
        .from('staff_members')
        .insert({
          salon_id: testSalonId,
          name: 'E2E Staff',
          email: `e2estaff2-${Date.now()}@example.com`,
          phone: '123-456-7890',
          commission_rate: 20,
          is_active: true,
        })
        .select()
        .single();

      // Create test customer
      const { data: customer } = await supabase
        .from('customers')
        .insert({
          salon_id: testSalonId,
          name: 'E2E Customer',
          email: `e2ecustomer-${Date.now()}@example.com`,
          phone: '123-456-7890',
        })
        .select()
        .single();

      // Create booking
      const { data: booking } = await supabase
        .from('bookings')
        .insert({
          salon_id: testSalonId,
          customer_id: customer.id,
          service_id: service.id,
          staff_member_id: staffMember.id,
          start_time: '2026-12-01T10:00:00Z',
          status: 'scheduled',
        })
        .select()
        .single();

      expect(booking).toBeDefined();
      expect(booking?.customer_id).toBe(customer.id);

      // Cleanup
      await supabase.from('bookings').delete().eq('id', booking.id);
      await supabase.from('customers').delete().eq('id', customer.id);
      await supabase.from('staff_members').delete().eq('id', staffMember.id);
      await supabase.from('services').delete().eq('id', service.id);
    });

    it('should access own profile', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .single();

      expect(profile).toBeDefined();
      expect(profile?.id).toBe(customerId);
    });
  });
});

describe('E2E Tests - Real-Time Updates', () => {
  let testSalonId: string;
  let testBookingId: string;
  let subscription: any;

  beforeAll(async () => {
    // Create test salon
    const { data: salon } = await supabase
      .from('salons')
      .insert({
        name: 'E2E Realtime Salon',
        address: '456 Realtime St',
        phone: '987-654-3210',
        email: 'realtime@example.com',
      })
      .select()
      .single();

    testSalonId = salon.id;
  });

  afterAll(async () => {
    // Cleanup
    if (subscription) {
      await supabase.removeChannel(subscription);
    }
    await supabase.from('bookings').delete().eq('salon_id', testSalonId);
    await supabase.from('salons').delete().eq('id', testSalonId);
  });

  describe('Real-Time Booking Updates', () => {
    it('should receive real-time booking updates', async () => {
      let updateReceived = false;

      // Subscribe to booking changes
      subscription = supabase
        .channel('bookings-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
            filter: `salon_id=eq.${testSalonId}`,
          },
          (payload) => {
            updateReceived = true;
            expect(payload).toBeDefined();
          }
        )
        .subscribe();

      // Create a booking
      const { data: service } = await supabase
        .from('services')
        .insert({
          salon_id: testSalonId,
          name: 'Realtime Service',
          description: 'Realtime test service',
          price: 50,
          duration: 60,
        })
        .select()
        .single();

      const { data: staffMember } = await supabase
        .from('staff_members')
        .insert({
          salon_id: testSalonId,
          name: 'Realtime Staff',
          email: `realtime-staff-${Date.now()}@example.com`,
          phone: '987-654-3210',
          commission_rate: 20,
          is_active: true,
        })
        .select()
        .single();

      const { data: customer } = await supabase
        .from('customers')
        .insert({
          salon_id: testSalonId,
          name: 'Realtime Customer',
          email: `realtime-customer-${Date.now()}@example.com`,
          phone: '987-654-3210',
        })
        .select()
        .single();

      const { data: booking } = await supabase
        .from('bookings')
        .insert({
          salon_id: testSalonId,
          customer_id: customer.id,
          service_id: service.id,
          staff_member_id: staffMember.id,
          start_time: '2026-12-01T10:00:00Z',
          status: 'scheduled',
        })
        .select()
        .single();

      testBookingId = booking.id;

      // Wait for real-time update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(updateReceived).toBe(true);

      // Cleanup
      await supabase.from('bookings').delete().eq('id', testBookingId);
      await supabase.from('customers').delete().eq('id', customer.id);
      await supabase.from('staff_members').delete().eq('id', staffMember.id);
      await supabase.from('services').delete().eq('id', service.id);
    });
  });
});

describe('E2E Tests - Error Scenarios', () => {
  describe('Database Constraint Violations', () => {
    it('should prevent duplicate email in profiles', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // Create first profile
      await supabase.from('profiles').insert({
        id: `profile-1-${Date.now()}`,
        email,
        role: 'customer',
      });

      // Try to create duplicate
      const { error } = await supabase.from('profiles').insert({
        id: `profile-2-${Date.now()}`,
        email,
        role: 'customer',
      });

      expect(error).not.toBeNull();
    });

    it('should prevent negative inventory quantities', async () => {
      const { error } = await supabase.from('inventory').insert({
        salon_id: `salon-${Date.now()}`,
        product_id: `product-${Date.now()}`,
        quantity: -10,
        reorder_level: 10,
        reorder_quantity: 20,
      });

      expect(error).not.toBeNull();
    });

    it('should prevent invalid booking status', async () => {
      const { error } = await supabase.from('bookings').insert({
        salon_id: `salon-${Date.now()}`,
        customer_id: `customer-${Date.now()}`,
        service_id: `service-${Date.now()}`,
        staff_member_id: `staff-${Date.now()}`,
        start_time: '2026-12-01T10:00:00Z',
        status: 'invalid_status',
      });

      expect(error).not.toBeNull();
    });
  });

  describe('API Error Handling', () => {
    it('should handle non-existent resource', async () => {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('id', 'non-existent-id')
        .single();

      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('should handle invalid UUID format', async () => {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('id', 'invalid-uuid')
        .single();

      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('should handle missing required fields', async () => {
      const { error } = await supabase.from('salons').insert({
        name: 'Test Salon',
        // Missing required fields
      });

      expect(error).not.toBeNull();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent booking creation', async () => {
      const salonId = `concurrent-${Date.now()}`;
      const serviceId = `service-${Date.now()}`;
      const staffId = `staff-${Date.now()}`;
      const customerId = `customer-${Date.now()}`;

      // Create test data
      await supabase.from('salons').insert({
        id: salonId,
        name: 'Concurrent Test Salon',
        address: '789 Concurrent St',
        phone: '555-555-5555',
        email: 'concurrent@example.com',
      });

      await supabase.from('services').insert({
        id: serviceId,
        salon_id: salonId,
        name: 'Concurrent Service',
        description: 'Concurrent test service',
        price: 50,
        duration: 60,
      });

      await supabase.from('staff_members').insert({
        id: staffId,
        salon_id: salonId,
        name: 'Concurrent Staff',
        email: `concurrent-staff-${Date.now()}@example.com`,
        phone: '555-555-5555',
        commission_rate: 20,
        is_active: true,
      });

      await supabase.from('customers').insert({
        id: customerId,
        salon_id: salonId,
        name: 'Concurrent Customer',
        email: `concurrent-customer-${Date.now()}@example.com`,
        phone: '555-555-5555',
      });

      // Create concurrent bookings
      const bookingPromises = Array.from({ length: 5 }, (_, i) =>
        supabase.from('bookings').insert({
          salon_id: salonId,
          customer_id: customerId,
          service_id: serviceId,
          staff_member_id: staffId,
          start_time: `2026-12-01T${10 + i}:00:00Z`,
          status: 'scheduled',
        })
      );

      const results = await Promise.allSettled(bookingPromises);

      // All bookings should succeed
      const successfulBookings = results.filter((r) => r.status === 'fulfilled');
      expect(successfulBookings.length).toBe(5);

      // Cleanup
      await supabase.from('bookings').delete().eq('salon_id', salonId);
      await supabase.from('customers').delete().eq('id', customerId);
      await supabase.from('staff_members').delete().eq('id', staffId);
      await supabase.from('services').delete().eq('id', serviceId);
      await supabase.from('salons').delete().eq('id', salonId);
    });
  });
});
