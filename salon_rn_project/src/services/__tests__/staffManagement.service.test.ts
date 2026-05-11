import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { StaffManagementService } from '../staffManagement.service';
import { supabase } from '../supabase';

// Mock Supabase client
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
        in: jest.fn(() => ({
          single: jest.fn(),
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            in: jest.fn(),
          })),
        })),
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

describe('StaffManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStaffScheduleForDay', () => {
    it('should return staff schedule for a specific day', async () => {
      const mockSchedule = {
        id: 'schedule-1',
        staff_id: 'staff-1',
        day_of_week: 1,
        is_working: true,
        start_time: '09:00',
        end_time: '17:00',
        break_start_time: '12:00',
        break_end_time: '13:00',
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockSchedule,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await StaffManagementService.getStaffScheduleForDay('staff-1', 1);

      expect(result).not.toBeNull();
      expect(result?.staffId).toBe('staff-1');
      expect(result?.dayOfWeek).toBe(1);
      expect(result?.isWorking).toBe(true);
      expect(result?.startTime).toBe('09:00');
      expect(result?.endTime).toBe('17:00');
    });

    it('should return null when no schedule found', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await StaffManagementService.getStaffScheduleForDay('staff-1', 1);

      expect(result).toBeNull();
    });
  });

  describe('updateStaffSchedule', () => {
    it('should update staff schedule', async () => {
      const mockSchedule = {
        id: 'schedule-1',
        staff_id: 'staff-1',
        day_of_week: 1,
        is_working: true,
        start_time: '09:00',
        end_time: '18:00',
        break_start_time: '12:00',
        break_end_time: '13:00',
      };

      const mockUpsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockSchedule,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        upsert: mockUpsert,
      });

      const result = await StaffManagementService.updateStaffSchedule('staff-1', 1, {
        isWorking: true,
        startTime: '09:00',
        endTime: '18:00',
      });

      expect(result.staffId).toBe('staff-1');
      expect(result.endTime).toBe('18:00');
    });
  });

  describe('getStaffWeeklySchedule', () => {
    it('should return staff weekly schedule', async () => {
      const mockSchedules = [
        {
          id: 'schedule-1',
          staff_id: 'staff-1',
          day_of_week: 1,
          is_working: true,
          start_time: '09:00',
          end_time: '17:00',
        },
        {
          id: 'schedule-2',
          staff_id: 'staff-1',
          day_of_week: 2,
          is_working: true,
          start_time: '09:00',
          end_time: '17:00',
        },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockSchedules,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await StaffManagementService.getStaffWeeklySchedule('staff-1');

      expect(result).toHaveLength(2);
      expect(result[0].dayOfWeek).toBe(1);
      expect(result[1].dayOfWeek).toBe(2);
    });
  });

  describe('getStaffPerformance', () => {
    it('should return staff performance metrics', async () => {
      const mockBookings = [
        { id: 'booking-1', status: 'completed', service_id: 'service-1' },
        { id: 'booking-2', status: 'completed', service_id: 'service-2' },
        { id: 'booking-3', status: 'cancelled', service_id: 'service-1' },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockResolvedValue({
              data: mockBookings,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await StaffManagementService.getStaffPerformance('staff-1');

      expect(result.staffId).toBe('staff-1');
      expect(result.totalBookings).toBe(3);
      expect(result.completedBookings).toBe(2);
      expect(result.cancelledBookings).toBe(1);
      expect(result.completionRate).toBeCloseTo(66.67, 1);
    });
  });

  describe('calculateStaffCommission', () => {
    it('should calculate staff commission', async () => {
      const mockStaff = {
        id: 'staff-1',
        commission_rate: 20,
      };

      const mockBookings = [
        { service_id: 'service-1' },
        { service_id: 'service-2' },
      ];

      const mockServices = [
        { price: 50 },
        { price: 75 },
      ];

      const mockSelect = jest.fn()
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockStaff,
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockServices,
              error: null,
            }),
          }),
        });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({
                data: mockBookings,
                error: null,
              }),
            }),
          }),
        });

      const result = await StaffManagementService.calculateStaffCommission(
        'staff-1',
        '2026-04-11',
        '2026-05-11'
      );

      expect(result.staffId).toBe('staff-1');
      expect(result.commissionRate).toBe(20);
      expect(result.totalRevenue).toBe(125);
      expect(result.commissionAmount).toBe(25);
    });
  });

  describe('checkStaffAvailability', () => {
    it('should check staff availability', async () => {
      const mockSchedule = {
        staff_id: 'staff-1',
        day_of_week: 1,
        is_working: true,
        start_time: '09:00',
        end_time: '17:00',
      };

      const mockBookings = [];

      const mockSelect = jest.fn()
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSchedule,
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockResolvedValue({
                  data: mockBookings,
                  error: null,
                }),
              }),
            }),
          }),
        });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await StaffManagementService.checkStaffAvailability(
        'staff-1',
        '2026-05-12',
        '10:00',
        '11:00'
      );

      expect(result.isAvailable).toBe(true);
      expect(result.staffId).toBe('staff-1');
    });

    it('should return not available when not working', async () => {
      const mockSchedule = {
        staff_id: 'staff-1',
        day_of_week: 1,
        is_working: false,
        start_time: '09:00',
        end_time: '17:00',
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockSchedule,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await StaffManagementService.checkStaffAvailability(
        'staff-1',
        '2026-05-12',
        '10:00',
        '11:00'
      );

      expect(result.isAvailable).toBe(false);
    });
  });

  describe('updateStaffCommissionRate', () => {
    it('should update staff commission rate', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      });

      await StaffManagementService.updateStaffCommissionRate('staff-1', 25);

      expect(mockUpdate).toHaveBeenCalledWith({ commission_rate: 25 });
    });
  });

  describe('getStaffRanking', () => {
    it('should return staff ranking by performance', async () => {
      const mockStaff = [
        { id: 'staff-1', name: 'John Doe', is_active: true },
        { id: 'staff-2', name: 'Jane Smith', is_active: true },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockStaff,
          error: null,
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await StaffManagementService.getStaffRanking('salon-1', 10);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('staff-1');
    });
  });
});
