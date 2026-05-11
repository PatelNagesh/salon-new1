import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { InventoryManagementService } from '../inventoryManagement.service';
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
          lte: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(),
            })),
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
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
    raw: jest.fn((val) => val),
  },
}));

describe('InventoryManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLowStockAlerts', () => {
    it('should return low stock alerts', async () => {
      const mockInventory = [
        {
          id: 'inventory-1',
          quantity: 5,
          reorder_level: 10,
          reorder_quantity: 20,
          last_restocked: '2026-05-01',
          products: {
            id: 'product-1',
            name: 'Shampoo',
            vendor_id: 'vendor-1',
          },
        },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          lte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockInventory,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await InventoryManagementService.getLowStockAlerts('salon-1');

      expect(result).toHaveLength(1);
      expect(result[0].inventoryId).toBe('inventory-1');
      expect(result[0].productName).toBe('Shampoo');
      expect(result[0].currentQuantity).toBe(5);
      expect(result[0].reorderLevel).toBe(10);
      expect(result[0].urgency).toBe('high');
    });

    it('should calculate urgency correctly', async () => {
      const mockInventory = [
        {
          id: 'inventory-1',
          quantity: 8,
          reorder_level: 10,
          reorder_quantity: 20,
          last_restocked: '2026-05-01',
          products: {
            id: 'product-1',
            name: 'Shampoo',
            vendor_id: 'vendor-1',
          },
        },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          lte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockInventory,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await InventoryManagementService.getLowStockAlerts('salon-1');

      expect(result[0].urgency).toBe('medium');
    });
  });

  describe('getReorderSuggestions', () => {
    it('should return reorder suggestions', async () => {
      const mockInventory = [
        {
          id: 'inventory-1',
          quantity: 5,
          reorder_level: 10,
          reorder_quantity: 20,
          products: {
            id: 'product-1',
            name: 'Shampoo',
            vendor_id: 'vendor-1',
            price: 15,
          },
        },
      ];

      const mockVendor = {
        id: 'vendor-1',
        name: 'ABC Supplies',
        lead_time_days: 5,
      };

      const mockSelect = jest.fn()
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockInventory,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockVendor,
              error: null,
            }),
          }),
        });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await InventoryManagementService.getReorderSuggestions('salon-1');

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('product-1');
      expect(result[0].productName).toBe('Shampoo');
      expect(result[0].vendorName).toBe('ABC Supplies');
      expect(result[0].suggestedQuantity).toBeGreaterThan(0);
      expect(result[0].estimatedCost).toBeGreaterThan(0);
      expect(result[0].leadTimeDays).toBe(5);
    });
  });

  describe('getInventoryTracking', () => {
    it('should return inventory tracking data', async () => {
      const mockInventory = {
        id: 'inventory-1',
        product_id: 'product-1',
        quantity: 50,
        last_restocked: '2026-05-01',
      };

      const mockProduct = {
        name: 'Shampoo',
      };

      const mockAdjustments = [
        {
          id: 'adj-1',
          adjustment_type: 'addition',
          quantity: 10,
        },
        {
          id: 'adj-2',
          adjustment_type: 'removal',
          quantity: 5,
        },
      ];

      const mockSelect = jest.fn()
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockInventory,
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProduct,
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockAdjustments,
              error: null,
            }),
          }),
        });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await InventoryManagementService.getInventoryTracking('inventory-1');

      expect(result).not.toBeNull();
      expect(result?.productId).toBe('product-1');
      expect(result?.productName).toBe('Shampoo');
      expect(result?.currentQuantity).toBe(50);
      expect(result?.totalAdded).toBe(10);
      expect(result?.totalRemoved).toBe(5);
    });
  });

  describe('logStockAdjustment', () => {
    it('should log stock adjustment', async () => {
      const mockInventory = {
        product_id: 'product-1',
        quantity: 50,
      };

      const mockAdjustment = {
        id: 'adj-1',
        inventory_id: 'inventory-1',
        adjustment_type: 'addition',
        quantity: 10,
        previous_quantity: 50,
        new_quantity: 60,
        reason: 'Restock',
        adjusted_by: 'user-1',
        adjusted_at: '2026-05-11T10:00:00Z',
      };

      const mockSelect = jest.fn()
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockInventory,
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockAdjustment,
              error: null,
            }),
          }),
        });

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockAdjustment,
            error: null,
          }),
        }),
      });

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ insert: mockInsert })
        .mockReturnValueOnce({ update: mockUpdate });

      const result = await InventoryManagementService.logStockAdjustment(
        'inventory-1',
        'addition',
        10,
        'Restock',
        'user-1'
      );

      expect(result.id).toBe('adj-1');
      expect(result.adjustmentType).toBe('addition');
      expect(result.quantity).toBe(10);
      expect(result.newQuantity).toBe(60);
    });
  });

  describe('getStockAdjustmentHistory', () => {
    it('should return stock adjustment history', async () => {
      const mockAdjustments = [
        {
          id: 'adj-1',
          inventory_id: 'inventory-1',
          product_id: 'product-1',
          adjustment_type: 'addition',
          quantity: 10,
          previous_quantity: 50,
          new_quantity: 60,
          reason: 'Restock',
          adjusted_by: 'user-1',
          adjusted_at: '2026-05-11T10:00:00Z',
        },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockAdjustments,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await InventoryManagementService.getStockAdjustmentHistory('inventory-1', 10);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('adj-1');
      expect(result[0].adjustmentType).toBe('addition');
    });
  });

  describe('getFastMovingProducts', () => {
    it('should return fast-moving products', async () => {
      const mockOrderItems = [
        {
          quantity: 10,
          products: {
            id: 'product-1',
            name: 'Shampoo',
            price: 15,
          },
        },
        {
          quantity: 8,
          products: {
            id: 'product-2',
            name: 'Conditioner',
            price: 12,
          },
        },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        gte: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockOrderItems,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await InventoryManagementService.getFastMovingProducts('salon-1', 30, 10);

      expect(result).toHaveLength(2);
      expect(result[0].productId).toBe('product-1');
      expect(result[0].totalQuantity).toBe(10);
      expect(result[0].totalRevenue).toBe(150);
    });
  });

  describe('getSlowMovingProducts', () => {
    it('should return slow-moving products', async () => {
      const mockInventory = [
        {
          id: 'inventory-1',
          quantity: 100,
          last_restocked: '2026-04-01',
          products: {
            id: 'product-1',
            name: 'Rare Product',
            price: 50,
          },
        },
      ];

      const mockSales = [];

      const mockSelect = jest.fn()
        .mockReturnValueOnce({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockInventory,
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockResolvedValue({
                data: mockSales,
                error: null,
              }),
            }),
          }),
        });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await InventoryManagementService.getSlowMovingProducts('salon-1', 30, 10);

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('product-1');
      expect(result[0].productName).toBe('Rare Product');
      expect(result[0].dailySalesRate).toBeLessThan(0.1);
    });
  });
});
