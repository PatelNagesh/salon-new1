import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CustomerManagementService } from '../customerManagement.service';
import { supabase } from '../supabase';

// Mock Supabase client
jest.mock('../supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
        or: jest.fn(() => ({
          limit: jest.fn(),
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
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

describe('CustomerManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomerStats', () => {
    it('should return customer statistics', async () => {
      const mockStats = {
        total_visits: 10,
        total_spent: 500,
        average_spending: 50,
        last_visit_date: '2026-05-10',
        favorite_service_id: 'service-1',
        loyalty_points: 100,
        referral_count: 2,
      };

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await CustomerManagementService.getCustomerStats('customer-1');

      expect(result.customerId).toBe('customer-1');
      expect(result.totalVisits).toBe(10);
      expect(result.totalSpent).toBe(500);
      expect(result.averageSpending).toBe(50);
      expect(result.loyaltyPoints).toBe(100);
    });

    it('should handle null stats', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await CustomerManagementService.getCustomerStats('customer-1');

      expect(result.totalVisits).toBe(0);
      expect(result.totalSpent).toBe(0);
      expect(result.loyaltyPoints).toBe(0);
    });
  });

  describe('getVisitHistory', () => {
    it('should return visit history', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          start_time: '2026-05-10T10:00:00Z',
          status: 'completed',
          notes: 'Great service',
          services: { name: 'Haircut', price: 50 },
          staff_members: { name: 'John Doe' },
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({
        data: mockBookings,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockReturnValue({
              limit: mockLimit,
            }),
          }),
        }),
      });

      const result = await CustomerManagementService.getVisitHistory('customer-1', 10);

      expect(result).toHaveLength(1);
      expect(result[0].bookingId).toBe('booking-1');
      expect(result[0].service).toBe('Haircut');
      expect(result[0].staff).toBe('John Doe');
      expect(result[0].amount).toBe(50);
    });
  });

  describe('addCustomerNote', () => {
    it('should add customer note', async () => {
      const mockNote = {
        id: 'note-1',
        customer_id: 'customer-1',
        note: 'Test note',
        created_by: 'user-1',
        created_at: '2026-05-11T10:00:00Z',
        is_private: false,
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockNote,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      const result = await CustomerManagementService.addCustomerNote(
        'customer-1',
        'Test note',
        'user-1',
        false
      );

      expect(result.id).toBe('note-1');
      expect(result.note).toBe('Test note');
      expect(result.isPrivate).toBe(false);
    });
  });

  describe('updateCustomerNote', () => {
    it('should update customer note', async () => {
      const mockNote = {
        id: 'note-1',
        customer_id: 'customer-1',
        note: 'Updated note',
        created_by: 'user-1',
        created_at: '2026-05-11T10:00:00Z',
        is_private: true,
      };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockNote,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      });

      const result = await CustomerManagementService.updateCustomerNote(
        'note-1',
        'Updated note',
        true
      );

      expect(result.note).toBe('Updated note');
      expect(result.isPrivate).toBe(true);
    });
  });

  describe('deleteCustomerNote', () => {
    it('should delete customer note', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      });

      await CustomerManagementService.deleteCustomerNote('note-1');

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('getReferralInfo', () => {
    it('should return referral information', async () => {
      const mockCustomer = {
        referral_code: 'REF123456',
        referred_by: 'customer-2',
      };

      const mockReferredCustomers = [
        { id: 'customer-3', referral_bonus_earned: 10 },
        { id: 'customer-4', referral_bonus_earned: 15 },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCustomer,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockReferredCustomers,
              error: null,
            }),
          }),
        });

      const result = await CustomerManagementService.getReferralInfo('customer-1');

      expect(result.referralCode).toBe('REF123456');
      expect(result.referredBy).toBe('customer-2');
      expect(result.referredCustomers).toHaveLength(2);
      expect(result.referralBonusEarned).toBe(25);
    });
  });

  describe('generateReferralCode', () => {
    it('should generate referral code', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      });

      const result = await CustomerManagementService.generateReferralCode('customer-1');

      expect(result).toContain('REF');
      expect(result.length).toBeGreaterThan(3);
    });
  });

  describe('getLoyaltyPoints', () => {
    it('should return loyalty points', async () => {
      const mockCustomer = {
        loyalty_points: 150,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCustomer,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await CustomerManagementService.getLoyaltyPoints('customer-1');

      expect(result).toBe(150);
    });

    it('should return 0 when no points', async () => {
      const mockCustomer = {
        loyalty_points: null,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCustomer,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await CustomerManagementService.getLoyaltyPoints('customer-1');

      expect(result).toBe(0);
    });
  });

  describe('addLoyaltyPoints', () => {
    it('should add loyalty points', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: 150,
        error: null,
      });

      const result = await CustomerManagementService.addLoyaltyPoints('customer-1', 50);

      expect(result).toBe(150);
      expect(supabase.rpc).toHaveBeenCalledWith('add_loyalty_points', {
        target_customer_id: 'customer-1',
        points_to_add: 50,
      });
    });
  });

  describe('redeemLoyaltyPoints', () => {
    it('should redeem loyalty points', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: 100,
        error: null,
      });

      const result = await CustomerManagementService.redeemLoyaltyPoints('customer-1', 50);

      expect(result).toBe(100);
      expect(supabase.rpc).toHaveBeenCalledWith('redeem_loyalty_points', {
        target_customer_id: 'customer-1',
        points_to_redeem: 50,
      });
    });
  });

  describe('searchCustomers', () => {
    it('should search customers by name', async () => {
      const mockCustomers = [
        { id: 'customer-1', name: 'John Doe', phone: '123-456-7890', email: 'john@example.com' },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockCustomers,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await CustomerManagementService.searchCustomers('salon-1', 'John', 10);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');
    });
  });

  describe('getTopCustomers', () => {
    it('should return top customers by spending', async () => {
      const mockCustomers = [
        { id: 'customer-1', name: 'John Doe', total_spent: 1000 },
        { id: 'customer-2', name: 'Jane Smith', total_spent: 800 },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockCustomers,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await CustomerManagementService.getTopCustomers('salon-1', 10);

      expect(result).toHaveLength(2);
      expect(result[0].total_spent).toBe(1000);
    });
  });
});
