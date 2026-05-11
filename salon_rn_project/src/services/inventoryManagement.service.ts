import { supabase } from '../supabase';
import { InventoryService } from './InventoryService';
import { ProductService } from './ProductService';

export interface LowStockAlert {
  inventoryId: string;
  productId: string;
  productName: string;
  currentQuantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  urgency: 'low' | 'medium' | 'high';
  lastRestocked: string;
  estimatedDaysUntilStockout?: number;
}

export interface ReorderSuggestion {
  productId: string;
  productName: string;
  vendorId: string;
  vendorName: string;
  currentQuantity: number;
  suggestedQuantity: number;
  estimatedCost: number;
  leadTimeDays: number;
  urgency: 'low' | 'medium' | 'high';
}

export interface StockAdjustment {
  id: string;
  inventoryId: string;
  productId: string;
  adjustmentType: 'addition' | 'removal' | 'correction';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
}

export interface InventoryTracking {
  productId: string;
  productName: string;
  currentQuantity: number;
  totalAdded: number;
  totalRemoved: number;
  totalSold: number;
  averageDailyUsage: number;
  daysOfStockRemaining: number;
  lastRestocked: string;
  nextRestockSuggestion?: string;
}

export class InventoryManagementService {
  // Get low stock alerts
  static async getLowStockAlerts(salonId: string): Promise<LowStockAlert[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          reorder_level,
          reorder_quantity,
          last_restocked,
          products (
            id,
            name,
            vendor_id
          )
        `)
        .eq('salon_id', salonId)
        .lte('quantity', supabase.raw('reorder_level'))
        .order('quantity', { ascending: true });

      if (error) throw error;

      const alerts: LowStockAlert[] = [];

      for (const item of data || []) {
        const product = item.products;
        const currentQuantity = item.quantity;
        const reorderLevel = item.reorder_level;
        const reorderQuantity = item.reorder_quantity;

        // Calculate urgency
        let urgency: 'low' | 'medium' | 'high' = 'low';
        const ratio = currentQuantity / reorderLevel;

        if (ratio <= 0.25) {
          urgency = 'high';
        } else if (ratio <= 0.5) {
          urgency = 'medium';
        }

        // Estimate days until stockout
        const tracking = await this.getInventoryTracking(item.id);
        const estimatedDaysUntilStockout = tracking?.daysOfStockRemaining;

        alerts.push({
          inventoryId: item.id,
          productId: product.id,
          productName: product.name,
          currentQuantity,
          reorderLevel,
          reorderQuantity,
          urgency,
          lastRestocked: item.last_restocked,
          estimatedDaysUntilStockout,
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error getting low stock alerts:', error);
      throw error;
    }
  }

  // Get reorder suggestions
  static async getReorderSuggestions(salonId: string): Promise<ReorderSuggestion[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          reorder_level,
          reorder_quantity,
          products (
            id,
            name,
            vendor_id,
            price
          )
        `)
        .eq('salon_id', salonId)
        .lte('quantity', supabase.raw('reorder_level'))
        .order('quantity', { ascending: true });

      if (error) throw error;

      const suggestions: ReorderSuggestion[] = [];

      for (const item of data || []) {
        const product = item.products;
        const currentQuantity = item.quantity;
        const reorderLevel = item.reorder_level;
        const reorderQuantity = item.reorder_quantity;

        // Get vendor information
        const { data: vendor } = await supabase
          .from('vendors')
          .select('name, lead_time_days')
          .eq('id', product.vendor_id)
          .single();

        // Calculate urgency
        let urgency: 'low' | 'medium' | 'high' = 'low';
        const ratio = currentQuantity / reorderLevel;

        if (ratio <= 0.25) {
          urgency = 'high';
        } else if (ratio <= 0.5) {
          urgency = 'medium';
        }

        // Calculate suggested quantity and cost
        const suggestedQuantity = Math.max(reorderQuantity, reorderLevel * 2 - currentQuantity);
        const estimatedCost = suggestedQuantity * product.price;

        suggestions.push({
          productId: product.id,
          productName: product.name,
          vendorId: product.vendor_id,
          vendorName: vendor?.name || 'Unknown',
          currentQuantity,
          suggestedQuantity,
          estimatedCost,
          leadTimeDays: vendor?.lead_time_days || 7,
          urgency,
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting reorder suggestions:', error);
      throw error;
    }
  }

  // Get inventory tracking data
  static async getInventoryTracking(inventoryId: string): Promise<InventoryTracking | null> {
    try {
      const { data: inventory, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', inventoryId)
        .single();

      if (error) throw error;

      if (!inventory) return null;

      // Get product information
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', inventory.product_id)
        .single();

      // Get stock adjustments
      const { data: adjustments } = await supabase
        .from('stock_adjustments')
        .select('*')
        .eq('inventory_id', inventoryId)
        .order('adjusted_at', { ascending: false });

      // Calculate totals
      let totalAdded = 0;
      let totalRemoved = 0;
      let totalSold = 0;

      for (const adjustment of adjustments || []) {
        if (adjustment.adjustment_type === 'addition') {
          totalAdded += adjustment.quantity;
        } else if (adjustment.adjustment_type === 'removal') {
          totalRemoved += adjustment.quantity;
        } else if (adjustment.adjustment_type === 'correction') {
          // Corrections are handled differently
        }
      }

      // Get sales data
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('quantity')
        .eq('product_id', inventory.product_id);

      totalSold = (orderItems || []).reduce((sum: number, item: any) => sum + item.quantity, 0);

      // Calculate average daily usage
      const daysSinceRestock = inventory.last_restocked
        ? Math.max(1, Math.floor((Date.now() - new Date(inventory.last_restocked).getTime()) / (1000 * 60 * 60 * 24)))
        : 30;

      const averageDailyUsage = totalSold / daysSinceRestock;

      // Calculate days of stock remaining
      const daysOfStockRemaining = averageDailyUsage > 0
        ? Math.floor(inventory.quantity / averageDailyUsage)
        : 999;

      // Calculate next restock suggestion
      const nextRestockSuggestion = daysOfStockRemaining <= 7
        ? new Date(Date.now() + (7 - daysOfStockRemaining) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      return {
        productId: inventory.product_id,
        productName: product?.name || 'Unknown',
        currentQuantity: inventory.quantity,
        totalAdded,
        totalRemoved,
        totalSold,
        averageDailyUsage,
        daysOfStockRemaining,
        lastRestocked: inventory.last_restocked,
        nextRestockSuggestion,
      };
    } catch (error) {
      console.error('Error getting inventory tracking:', error);
      throw error;
    }
  }

  // Log stock adjustment
  static async logStockAdjustment(
    inventoryId: string,
    adjustmentType: 'addition' | 'removal' | 'correction',
    quantity: number,
    reason: string,
    adjustedBy: string
  ): Promise<StockAdjustment> {
    try {
      // Get current inventory quantity
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('id', inventoryId)
        .single();

      if (inventoryError) throw inventoryError;

      const previousQuantity = inventory.quantity;
      let newQuantity = previousQuantity;

      if (adjustmentType === 'addition') {
        newQuantity += quantity;
      } else if (adjustmentType === 'removal') {
        newQuantity -= quantity;
      } else if (adjustmentType === 'correction') {
        newQuantity = quantity;
      }

      // Log the adjustment
      const { data, error } = await supabase
        .from('stock_adjustments')
        .insert({
          inventory_id: inventoryId,
          adjustment_type: adjustmentType,
          quantity,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          reason,
          adjusted_by: adjustedBy,
        })
        .select()
        .single();

      if (error) throw error;

      // Update inventory quantity
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', inventoryId);

      if (updateError) throw updateError;

      return {
        id: data.id,
        inventoryId: data.inventory_id,
        productId: inventory.product_id,
        adjustmentType: data.adjustment_type,
        quantity: data.quantity,
        previousQuantity: data.previous_quantity,
        newQuantity: data.new_quantity,
        reason: data.reason,
        adjustedBy: data.adjusted_by,
        adjustedAt: data.adjusted_at,
      };
    } catch (error) {
      console.error('Error logging stock adjustment:', error);
      throw error;
    }
  }

  // Get stock adjustment history
  static async getStockAdjustmentHistory(
    inventoryId: string,
    limit: number = 50
  ): Promise<StockAdjustment[]> {
    try {
      const { data, error } = await supabase
        .from('stock_adjustments')
        .select('*')
        .eq('inventory_id', inventoryId)
        .order('adjusted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((adjustment: any) => ({
        id: adjustment.id,
        inventoryId: adjustment.inventory_id,
        productId: adjustment.product_id,
        adjustmentType: adjustment.adjustment_type,
        quantity: adjustment.quantity,
        previousQuantity: adjustment.previous_quantity,
        newQuantity: adjustment.new_quantity,
        reason: adjustment.reason,
        adjustedBy: adjustment.adjusted_by,
        adjustedAt: adjustment.adjusted_at,
      }));
    } catch (error) {
      console.error('Error getting stock adjustment history:', error);
      throw error;
    }
  }

  // Get inventory summary
  static async getInventorySummary(salonId: string) {
    try {
      const [lowStockAlerts, reorderSuggestions, inventory] = await Promise.all([
        this.getLowStockAlerts(salonId),
        this.getReorderSuggestions(salonId),
        InventoryService.getInventoryBySalon(salonId),
      ]);

      const totalProducts = inventory.length;
      const lowStockCount = lowStockAlerts.length;
      const totalValue = inventory.reduce((sum: number, item: any) => sum + (item.quantity * item.products?.price || 0), 0);
      const estimatedReorderCost = reorderSuggestions.reduce((sum: number, s: any) => sum + s.estimatedCost, 0);

      return {
        totalProducts,
        lowStockCount,
        totalValue,
        estimatedReorderCost,
        lowStockAlerts,
        reorderSuggestions,
        inventory,
      };
    } catch (error) {
      console.error('Error getting inventory summary:', error);
      throw error;
    }
  }

  // Get fast-moving products
  static async getFastMovingProducts(salonId: string, days: number = 30, limit: number = 10): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('order_items')
        .select(`
          quantity,
          products (
            id,
            name,
            price
          )
        `)
        .gte('created_at', startDate.toISOString())
        .order('quantity', { ascending: false })
        .limit(limit * 2);

      if (error) throw error;

      // Aggregate by product
      const productSales: Record<string, any> = {};

      for (const item of data || []) {
        const productId = item.products.id;
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            productName: item.products.name,
            price: item.products.price,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        productSales[productId].totalQuantity += item.quantity;
        productSales[productId].totalRevenue += item.quantity * item.products.price;
      }

      return Object.values(productSales)
        .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting fast-moving products:', error);
      throw error;
    }
  }

  // Get slow-moving products
  static async getSlowMovingProducts(salonId: string, days: number = 30, limit: number = 10): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: inventory, error } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          last_restocked,
          products (
            id,
            name,
            price
          )
        `)
        .eq('salon_id', salonId)
        .order('last_restocked', { ascending: false });

      if (error) throw error;

      // Get sales for each product
      const slowMoving = [];

      for (const item of inventory || []) {
        const { data: sales } = await supabase
          .from('order_items')
          .select('quantity')
          .eq('product_id', item.products.id)
          .gte('created_at', startDate.toISOString());

        const totalSold = (sales || []).reduce((sum: number, s: any) => sum + s.quantity, 0);

        // Calculate days in stock
        const daysInStock = item.last_restocked
          ? Math.floor((Date.now() - new Date(item.last_restocked).getTime()) / (1000 * 60 * 60 * 24))
          : 30;

        // Calculate daily sales rate
        const dailySalesRate = totalSold / daysInStock;

        // Consider slow-moving if daily sales rate is very low
        if (dailySalesRate < 0.1 && item.quantity > 0) {
          slowMoving.push({
            productId: item.products.id,
            productName: item.products.name,
            price: item.products.price,
            currentQuantity: item.quantity,
            totalSold,
            daysInStock,
            dailySalesRate,
          });
        }
      }

      return slowMoving
        .sort((a: any, b: any) => a.dailySalesRate - b.dailySalesRate)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting slow-moving products:', error);
      throw error;
    }
  }

  // Create purchase order from reorder suggestions
  static async createPurchaseOrderFromSuggestions(
    salonId: string,
    suggestionIds: string[],
    createdBy: string
  ): Promise<any> {
    try {
      const suggestions = await this.getReorderSuggestions(salonId);
      const selectedSuggestions = suggestions.filter((s: any) =>
        suggestionIds.includes(`${s.productId}-${s.vendorId}`)
      );

      if (selectedSuggestions.length === 0) {
        throw new Error('No valid suggestions selected');
      }

      // Group by vendor
      const vendorGroups: Record<string, any[]> = {};

      for (const suggestion of selectedSuggestions) {
        if (!vendorGroups[suggestion.vendorId]) {
          vendorGroups[suggestion.vendorId] = [];
        }
        vendorGroups[suggestion.vendorId].push(suggestion);
      }

      // Create purchase orders for each vendor
      const purchaseOrders = [];

      for (const [vendorId, items] of Object.entries(vendorGroups)) {
        const totalCost = items.reduce((sum: number, item: any) => sum + item.estimatedCost, 0);

        const { data, error } = await supabase
          .from('purchase_orders')
          .insert({
            vendor_id: vendorId,
            salon_id: salonId,
            total_amount: totalCost,
            status: 'pending',
            created_by: createdBy,
          })
          .select()
          .single();

        if (error) throw error;

        // Add items to purchase order
        for (const item of items) {
          await supabase.from('purchase_order_items').insert({
            purchase_order_id: data.id,
            product_id: item.productId,
            quantity: item.suggestedQuantity,
            unit_price: item.estimatedCost / item.suggestedQuantity,
          });
        }

        purchaseOrders.push(data);
      }

      return purchaseOrders;
    } catch (error) {
      console.error('Error creating purchase order from suggestions:', error);
      throw error;
    }
  }
}
