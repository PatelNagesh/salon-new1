import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { supabase } from '../supabase';
import { BookingFlowService } from '../bookingFlow.service';
import { CustomerManagementService } from '../customerManagement.service';
import { StaffManagementService } from '../staffManagement.service';
import { InventoryManagementService } from '../inventoryManagement.service';

describe('Integration Tests - Booking Flow', () => {
  let testSalonId: string;
  let testServiceId: string;
  let testStaffId: string;
  let testCustomerId: string;

  beforeAll(async () => {
    // Setup test data
    const { data: salon } = await supabase
      .from('salons')
      .insert({
        name: 'Test Salon',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
      })
      .select()
      .single();

    testSalonId = salon.id;

    const { data: service } = await supabase
      .from('services')
      .insert({
        salon_id: testSalonId,
        name: 'Test Service',
        description: 'Test service description',
        price: 50,
        duration: 60,
        category_id: null,
      })
      .select()
      .single();

    testServiceId = service.id;

    const { data: staff } = await supabase
      .from('staff_members')
      .insert({
        salon_id: testSalonId,
        name: 'Test Staff',
        email: 'staff@test.com',
        phone: '123-456-7890',
        commission_rate: 20,
        is_active: true,
      })
      .select()
      .single();

    testStaffId = staff.id;

    const { data: customer } = await supabase
      .from('customers')
      .insert({
        salon_id: testSalonId,
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '123-456-7890',
      })
      .select()
      .single();

    testCustomerId = customer.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase.from('bookings').delete().eq('salon_id', testSalonId);
    await supabase.from('customers').delete().eq('salon_id', testSalonId);
    await supabase.from('staff_members').delete().eq('salon_id', testSalonId);
    await supabase.from('services').delete().eq('salon_id', testSalonId);
    await supabase.from('salons').delete().eq('id', testSalonId);
  });

  describe('Complete Booking Flow', () => {
    it('should complete full booking flow', async () => {
      // Step 1: Get available time slots
      const timeSlots = await BookingFlowService.getAvailableTimeSlots(
        testSalonId,
        testServiceId,
        testStaffId,
        '2026-12-01'
      );

      expect(Array.isArray(timeSlots)).toBe(true);

      // Step 2: Check for conflicts
      const conflictCheck = await BookingFlowService.checkBookingConflict(
        testStaffId,
        '2026-12-01T10:00:00Z',
        '2026-12-01T11:00:00Z'
      );

      expect(conflictCheck.hasConflict).toBeDefined();

      // Step 3: Calculate price
      const price = await BookingFlowService.calculateBookingPrice(testServiceId);

      expect(price).toBe(50);

      // Step 4: Create booking
      const booking = await BookingFlowService.createBookingWithPrice({
        salonId: testSalonId,
        serviceId: testServiceId,
        staffId: testStaffId,
        customerId: testCustomerId,
        date: '2026-12-01',
        timeSlot: '2026-12-01T10:00:00Z',
        notes: 'Test booking',
      });

      expect(booking).toBeDefined();
      expect(booking.id).toBeDefined();

      // Step 5: Update booking status
      const updatedBooking = await BookingFlowService.updateBookingStatus(
        booking.id,
        'completed'
      );

      expect(updatedBooking.status).toBe('completed');

      // Step 6: Get booking summary
      const summary = await BookingFlowService.getBookingSummary(booking.id);

      expect(summary).toBeDefined();
      expect(summary.booking).toBeDefined();
      expect(summary.service).toBeDefined();
      expect(summary.staff).toBeDefined();
      expect(summary.customer).toBeDefined();
    });

    it('should handle booking cancellation', async () => {
      const booking = await BookingFlowService.createBookingWithPrice({
        salonId: testSalonId,
        serviceId: testServiceId,
        staffId: testStaffId,
        customerId: testCustomerId,
        date: '2026-12-02',
        timeSlot: '2026-12-02T14:00:00Z',
      });

      const cancelledBooking = await BookingFlowService.cancelBooking(booking.id);

      expect(cancelledBooking.status).toBe('cancelled');
    });

    it('should handle no-show booking', async () => {
      const booking = await BookingFlowService.createBookingWithPrice({
        salonId: testSalonId,
        serviceId: testServiceId,
        staffId: testStaffId,
        customerId: testCustomerId,
        date: '2026-12-03',
        timeSlot: '2026-12-03T15:00:00Z',
      });

      const noShowBooking = await BookingFlowService.markNoShow(booking.id);

      expect(noShowBooking.status).toBe('no-show');
    });
  });
});

describe('Integration Tests - Customer Management', () => {
  let testSalonId: string;
  let testCustomerId: string;

  beforeAll(async () => {
    const { data: salon } = await supabase
      .from('salons')
      .insert({
        name: 'Test Salon 2',
        address: '456 Test St',
        phone: '987-654-3210',
        email: 'test2@example.com',
      })
      .select()
      .single();

    testSalonId = salon.id;

    const { data: customer } = await supabase
      .from('customers')
      .insert({
        salon_id: testSalonId,
        name: 'Test Customer 2',
        email: 'customer2@test.com',
        phone: '987-654-3210',
      })
      .select()
      .single();

    testCustomerId = customer.id;
  });

  afterAll(async () => {
    await supabase.from('customer_notes').delete().eq('customer_id', testCustomerId);
    await supabase.from('customers').delete().eq('id', testCustomerId);
    await supabase.from('salons').delete().eq('id', testSalonId);
  });

  describe('Customer Management Flow', () => {
    it('should manage customer notes', async () => {
      // Add note
      const note = await CustomerManagementService.addCustomerNote(
        testCustomerId,
        'Test note',
        'user-1',
        false
      );

      expect(note.id).toBeDefined();
      expect(note.note).toBe('Test note');

      // Get notes
      const notes = await CustomerManagementService.getCustomerNotes(testCustomerId);

      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe(note.id);

      // Update note
      const updatedNote = await CustomerManagementService.updateCustomerNote(
        note.id,
        'Updated note',
        true
      );

      expect(updatedNote.note).toBe('Updated note');
      expect(updatedNote.isPrivate).toBe(true);

      // Delete note
      await CustomerManagementService.deleteCustomerNote(note.id);

      const notesAfterDelete = await CustomerManagementService.getCustomerNotes(testCustomerId);

      expect(notesAfterDelete).toHaveLength(0);
    });

    it('should manage loyalty points', async () => {
      const initialPoints = await CustomerManagementService.getLoyaltyPoints(testCustomerId);

      expect(initialPoints).toBeGreaterThanOrEqual(0);

      const addedPoints = await CustomerManagementService.addLoyaltyPoints(testCustomerId, 50);

      expect(addedPoints).toBe(initialPoints + 50);

      const redeemedPoints = await CustomerManagementService.redeemLoyaltyPoints(testCustomerId, 20);

      expect(redeemedPoints).toBe(addedPoints - 20);
    });

    it('should generate referral code', async () => {
      const referralCode = await CustomerManagementService.generateReferralCode(testCustomerId);

      expect(referralCode).toBeDefined();
      expect(referralCode).toContain('REF');
      expect(referralCode.length).toBeGreaterThan(3);
    });

    it('should get customer summary', async () => {
      const summary = await CustomerManagementService.getCustomerSummary(testCustomerId);

      expect(summary).toBeDefined();
      expect(summary.customer).toBeDefined();
      expect(summary.stats).toBeDefined();
      expect(summary.visitHistory).toBeDefined();
      expect(summary.notes).toBeDefined();
      expect(summary.referralInfo).toBeDefined();
    });
  });
});

describe('Integration Tests - Staff Management', () => {
  let testSalonId: string;
  let testStaffId: string;

  beforeAll(async () => {
    const { data: salon } = await supabase
      .from('salons')
      .insert({
        name: 'Test Salon 3',
        address: '789 Test St',
        phone: '555-123-4567',
        email: 'test3@example.com',
      })
      .select()
      .single();

    testSalonId = salon.id;

    const { data: staff } = await supabase
      .from('staff_members')
      .insert({
        salon_id: testSalonId,
        name: 'Test Staff 3',
        email: 'staff3@test.com',
        phone: '555-123-4567',
        commission_rate: 15,
        is_active: true,
      })
      .select()
      .single();

    testStaffId = staff.id;
  });

  afterAll(async () => {
    await supabase.from('staff_schedules').delete().eq('staff_id', testStaffId);
    await supabase.from('staff_members').delete().eq('id', testStaffId);
    await supabase.from('salons').delete().eq('id', testSalonId);
  });

  describe('Staff Management Flow', () => {
    it('should manage staff schedule', async () => {
      // Update schedule
      const schedule = await StaffManagementService.updateStaffSchedule(testStaffId, 1, {
        isWorking: true,
        startTime: '09:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
      });

      expect(schedule.staffId).toBe(testStaffId);
      expect(schedule.dayOfWeek).toBe(1);
      expect(schedule.isWorking).toBe(true);

      // Get weekly schedule
      const weeklySchedule = await StaffManagementService.getStaffWeeklySchedule(testStaffId);

      expect(Array.isArray(weeklySchedule)).toBe(true);
    });

    it('should check staff availability', async () => {
      const availability = await StaffManagementService.checkStaffAvailability(
        testStaffId,
        '2026-12-01',
        '10:00',
        '11:00'
      );

      expect(availability).toBeDefined();
      expect(availability.staffId).toBe(testStaffId);
      expect(availability.isAvailable).toBeDefined();
    });

    it('should calculate staff performance', async () => {
      const performance = await StaffManagementService.getStaffPerformance(testStaffId);

      expect(performance).toBeDefined();
      expect(performance.staffId).toBe(testStaffId);
      expect(performance.totalBookings).toBeGreaterThanOrEqual(0);
      expect(performance.completionRate).toBeGreaterThanOrEqual(0);
    });

    it('should update staff commission rate', async () => {
      await StaffManagementService.updateStaffCommissionRate(testStaffId, 25);

      const { data: staff } = await supabase
        .from('staff_members')
        .select('commission_rate')
        .eq('id', testStaffId)
        .single();

      expect(staff?.commission_rate).toBe(25);
    });
  });
});

describe('Integration Tests - Inventory Management', () => {
  let testSalonId: string;
  let testVendorId: string;
  let testProductId: string;
  let testInventoryId: string;

  beforeAll(async () => {
    const { data: salon } = await supabase
      .from('salons')
      .insert({
        name: 'Test Salon 4',
        address: '321 Test St',
        phone: '111-222-3333',
        email: 'test4@example.com',
      })
      .select()
      .single();

    testSalonId = salon.id;

    const { data: vendor } = await supabase
      .from('vendors')
      .insert({
        salon_id: testSalonId,
        name: 'Test Vendor',
        contact_person: 'John Doe',
        email: 'vendor@test.com',
        phone: '111-222-3333',
        lead_time_days: 5,
      })
      .select()
      .single();

    testVendorId = vendor.id;

    const { data: product } = await supabase
      .from('products')
      .insert({
        vendor_id: testVendorId,
        name: 'Test Product',
        description: 'Test product description',
        price: 10,
        sku: 'TEST-001',
      })
      .select()
      .single();

    testProductId = product.id;

    const { data: inventory } = await supabase
      .from('inventory')
      .insert({
        salon_id: testSalonId,
        product_id: testProductId,
        quantity: 50,
        reorder_level: 10,
        reorder_quantity: 20,
        last_restocked: new Date().toISOString(),
      })
      .select()
      .single();

    testInventoryId = inventory.id;
  });

  afterAll(async () => {
    await supabase.from('stock_adjustments').delete().eq('inventory_id', testInventoryId);
    await supabase.from('inventory').delete().eq('id', testInventoryId);
    await supabase.from('products').delete().eq('id', testProductId);
    await supabase.from('vendors').delete().eq('id', testVendorId);
    await supabase.from('salons').delete().eq('id', testSalonId);
  });

  describe('Inventory Management Flow', () => {
    it('should log stock adjustments', async () => {
      const adjustment = await InventoryManagementService.logStockAdjustment(
        testInventoryId,
        'addition',
        10,
        'Restock',
        'user-1'
      );

      expect(adjustment.id).toBeDefined();
      expect(adjustment.adjustmentType).toBe('addition');
      expect(adjustment.quantity).toBe(10);

      // Get adjustment history
      const history = await InventoryManagementService.getStockAdjustmentHistory(testInventoryId);

      expect(history).toHaveLength(1);
      expect(history[0].id).toBe(adjustment.id);
    });

    it('should get low stock alerts', async () => {
      // Update inventory to low stock level
      await supabase
        .from('inventory')
        .update({ quantity: 5 })
        .eq('id', testInventoryId);

      const alerts = await InventoryManagementService.getLowStockAlerts(testSalonId);

      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].inventoryId).toBe(testInventoryId);
      expect(alerts[0].urgency).toBe('high');
    });

    it('should get reorder suggestions', async () => {
      const suggestions = await InventoryManagementService.getReorderSuggestions(testSalonId);

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].productId).toBe(testProductId);
    });

    it('should get inventory tracking', async () => {
      const tracking = await InventoryManagementService.getInventoryTracking(testInventoryId);

      expect(tracking).toBeDefined();
      expect(tracking.productId).toBe(testProductId);
      expect(tracking.currentQuantity).toBeGreaterThanOrEqual(0);
    });

    it('should get inventory summary', async () => {
      const summary = await InventoryManagementService.getInventorySummary(testSalonId);

      expect(summary).toBeDefined();
      expect(summary.totalProducts).toBeGreaterThan(0);
      expect(summary.lowStockAlerts).toBeDefined();
      expect(summary.reorderSuggestions).toBeDefined();
    });
  });
});
