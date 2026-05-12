/**
 * Inventory Repository Implementation
 * Handles all inventory-related database operations
 */

import { BaseRepository } from '../../core/base/BaseRepository';
import { IInventoryRepository } from '../interfaces/IInventoryRepository';
import type { Inventory, CreateInventoryDto, UpdateInventoryDto, QueryOptions } from '../../core/types/common.types';
import { DatabaseException, NotFoundException } from '../../exceptions';
import { getSupabaseClient } from '../../config/supabase.config';

export class InventoryRepository extends BaseRepository<Inventory> implements IInventoryRepository {
  constructor() {
    super('inventory');
  }

  async findBySalonId(salonId: string): Promise<Inventory[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseException(`Failed to find inventory for salon: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error finding inventory for salon: ${error}`);
    }
  }

  async findByProductId(productId: string): Promise<Inventory[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseException(`Failed to find inventory for product: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error finding inventory for product: ${error}`);
    }
  }

  async findLowStock(salonId: string): Promise<Inventory[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('salon_id', salonId)
        .lte('quantity', 'minimum_quantity')
        .order('quantity', { ascending: true });

      if (error) {
        throw new DatabaseException(`Failed to find low stock items: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error finding low stock items: ${error}`);
    }
  }

  async findByExpiryDate(startDate: Date, endDate: Date): Promise<Inventory[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .gte('expiry_date', startDate.toISOString())
        .lte('expiry_date', endDate.toISOString())
        .order('expiry_date', { ascending: true });

      if (error) {
        throw new DatabaseException(`Failed to find inventory by expiry date: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error finding inventory by expiry date: ${error}`);
    }
  }

  async updateQuantity(id: string, quantity: number): Promise<Inventory> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseException(`Failed to update inventory quantity: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundException(this.tableName, id);
      }

      // Invalidate cache
      if (this.cacheEnabled) {
        await this.invalidateCache(id);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseException || error instanceof NotFoundException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error updating inventory quantity: ${error}`);
    }
  }

  async adjustQuantity(id: string, adjustment: number): Promise<Inventory> {
    try {
      const supabase = getSupabaseClient();
      const { data: current } = await supabase
        .from(this.tableName)
        .select('quantity')
        .eq('id', id)
        .single();

      if (!current) {
        throw new NotFoundException(this.tableName, id);
      }

      const newQuantity = Math.max(0, current.quantity + adjustment);

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseException(`Failed to adjust inventory quantity: ${error.message}`);
      }

      // Invalidate cache
      if (this.cacheEnabled) {
        await this.invalidateCache(id);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseException || error instanceof NotFoundException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error adjusting inventory quantity: ${error}`);
    }
  }

  async getInventoryValue(salonId: string): Promise<number> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('quantity, products!inner(cost)')
        .eq('salon_id', salonId);

      if (error) {
        throw new DatabaseException(`Failed to calculate inventory value: ${error.message}`);
      }

      const totalValue = (data || []).reduce((sum, item) => {
        return sum + (item.quantity * (item.products?.cost || 0));
      }, 0);

      return totalValue;
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error calculating inventory value: ${error}`);
    }
  }
}
