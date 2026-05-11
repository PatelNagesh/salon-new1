import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BookingFlowService } from '../bookingFlow.service';
import { supabase } from '../supabase';

// Mock Supabase client
jest.mock('../supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

describe('BookingFlowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableTimeSlots', () => {
    it('should return available time slots', async () => {
      const mockSlots = [
        { time: '09:00', available: true, staff_id: 'staff-1' },
        { time: '10:00', available: false, staff_id: 'staff-1' },
      ];

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockSlots,
        error: null,
      });

      const result = await BookingFlowService.getAvailableTimeSlots(
        'salon-1',
        'service-1',
        'staff-1',
        '2026-05-11'
      );

      expect(result).toHaveLength(2);
      expect(result[0].time).toBe('09:00');
      expect(result[0].available).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('get_available_time_slots', {
        target_salon_id: 'salon-1',
        target_service_id: 'service-1',
        target_staff_id: 'staff-1',
        booking_date: '2026-05-11',
      });
    });

    it('should handle empty results', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await BookingFlowService.getAvailableTimeSlots(
        'salon-1',
        'service-1',
        'staff-1',
        '2026-05-11'
      );

      expect(result).toEqual([]);
    });

    it('should throw error on RPC failure', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('RPC failed'),
      });

      await expect(
        BookingFlowService.getAvailableTimeSlots(
          'salon-1',
          'service-1',
          'staff-1',
          '2026-05-11'
        )
      ).rejects.toThrow('RPC failed');
    });
  });

  describe('checkBookingConflict', () => {
    it('should return no conflict when available', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: false,
        error: null,
      });

      const result = await BookingFlowService.checkBookingConflict(
        'staff-1',
        '2026-05-11T09:00:00Z',
        '2026-05-11T10:00:00Z'
      );

      expect(result.hasConflict).toBe(false);
      expect(result.conflictingBookings).toEqual([]);
    });

    it('should return conflict when booked', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await BookingFlowService.checkBookingConflict(
        'staff-1',
        '2026-05-11T09:00:00Z',
        '2026-05-11T10:00:00Z'
      );

      expect(result.hasConflict).toBe(true);
    });

    it('should handle exclude booking ID', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: false,
        error: null,
      });

      await BookingFlowService.checkBookingConflict(
        'staff-1',
        '2026-05-11T09:00:00Z',
        '2026-05-11T10:00:00Z',
        'booking-1'
      );

      expect(supabase.rpc).toHaveBeenCalledWith('check_booking_conflict', {
        target_staff_id: 'staff-1',
        new_start_time: '2026-05-11T09:00:00Z',
        new_end_time: '2026-05-11T10:00:00Z',
        exclude_booking_id: 'booking-1',
      });
    });
  });

  describe('calculateBookingPrice', () => {
    it('should return service price', async () => {
      const mockService = { id: 'service-1', price: 50, name: 'Haircut' };

      jest.mock('../database/ServiceService', () => ({
        ServiceService: {
          getServiceById: jest.fn().mockResolvedValue(mockService),
        },
      }));

      const { ServiceService } = await import('../database/ServiceService');

      const result = await BookingFlowService.calculateBookingPrice('service-1');

      expect(result).toBe(50);
      expect(ServiceService.getServiceById).toHaveBeenCalledWith('service-1');
    });

    it('should throw error when service not found', async () => {
      jest.mock('../database/ServiceService', () => ({
        ServiceService: {
          getServiceById: jest.fn().mockResolvedValue(null),
        },
      }));

      const { ServiceService } = await import('../database/ServiceService');

      await expect(
        BookingFlowService.calculateBookingPrice('service-1')
      ).rejects.toThrow('Service not found');
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status', async () => {
      const mockBooking = {
        id: 'booking-1',
        status: 'completed',
      };

      jest.mock('../booking.service', () => ({
        BookingService: {
          updateBookingStatus: jest.fn().mockResolvedValue(mockBooking),
        },
      }));

      const { BookingService } = await import('../booking.service');

      const result = await BookingFlowService.updateBookingStatus(
        'booking-1',
        'completed'
      );

      expect(result).toEqual(mockBooking);
      expect(BookingService.updateBookingStatus).toHaveBeenCalledWith(
        'booking-1',
        'completed'
      );
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking', async () => {
      const mockBooking = {
        id: 'booking-1',
        status: 'cancelled',
      };

      jest.mock('../booking.service', () => ({
        BookingService: {
          cancelBooking: jest.fn().mockResolvedValue(mockBooking),
        },
      }));

      const { BookingService } = await import('../booking.service');

      const result = await BookingFlowService.cancelBooking('booking-1');

      expect(result).toEqual(mockBooking);
      expect(BookingService.cancelBooking).toHaveBeenCalledWith('booking-1');
    });
  });

  describe('completeBooking', () => {
    it('should complete booking and update customer stats', async () => {
      const mockBooking = {
        id: 'booking-1',
        status: 'completed',
        customer_id: 'customer-1',
      };

      jest.mock('../booking.service', () => ({
        BookingService: {
          getBookingById: jest.fn().mockResolvedValue(mockBooking),
          completeBooking: jest.fn().mockResolvedValue(mockBooking),
        },
      }));

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await BookingFlowService.completeBooking('booking-1');

      expect(result).toEqual(mockBooking);
      expect(supabase.rpc).toHaveBeenCalledWith('update_customer_stats', {
        target_customer_id: 'customer-1',
      });
    });

    it('should not update stats when no customer ID', async () => {
      const mockBooking = {
        id: 'booking-1',
        status: 'completed',
        customer_id: null,
      };

      jest.mock('../booking.service', () => ({
        BookingService: {
          getBookingById: jest.fn().mockResolvedValue(mockBooking),
          completeBooking: jest.fn().mockResolvedValue(mockBooking),
        },
      }));

      const result = await BookingFlowService.completeBooking('booking-1');

      expect(result).toEqual(mockBooking);
      expect(supabase.rpc).not.toHaveBeenCalled();
    });
  });

  describe('markNoShow', () => {
    it('should mark booking as no-show', async () => {
      const mockBooking = {
        id: 'booking-1',
        status: 'no-show',
      };

      jest.mock('../booking.service', () => ({
        BookingService: {
          markNoShow: jest.fn().mockResolvedValue(mockBooking),
        },
      }));

      const { BookingService } = await import('../booking.service');

      const result = await BookingFlowService.markNoShow('booking-1');

      expect(result).toEqual(mockBooking);
      expect(BookingService.markNoShow).toHaveBeenCalledWith('booking-1');
    });
  });
});
