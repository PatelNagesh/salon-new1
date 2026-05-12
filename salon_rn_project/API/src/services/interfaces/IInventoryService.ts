/**
 * Inventory Service Interface
 * Defines the contract for inventory-related business operations
 */

import type { Inventory, CreateInventoryDto, UpdateInventoryDto, QueryOptions } from '../../core/types/common.types';

export interface IInventoryService {
  /**
   * Create a new inventory record
   */
  create(dto: CreateInventoryDto): Promise<Inventory>;

  /**
   * Find inventory by ID
   */
  findById(id: string): Promise<Inventory>;

  /**
   * Find all inventory records with optional query options
   */
  findAll(options?: QueryOptions): Promise<Inventory[]>;

  /**
   * Update an existing inventory record
   */
  update(id: string, dto: UpdateInventoryDto): Promise<Inventory>;

  /**
   * Delete an inventory record
   */
  delete(id: string): Promise<void>;

  /**
   * Find inventory by salon ID
   */
  findBySalonId(salonId: string): Promise<Inventory[]>;

  /**
   * Find inventory by product ID
   */
  findByProductId(productId: string): Promise<Inventory[]>;

  /**
   * Find low stock items for a salon
   */
  findLowStock(salonId: string): Promise<Inventory[]>;

  /**
   * Find inventory items expiring within a date range
   */
  findByExpiryDate(startDate: Date, endDate: Date): Promise<Inventory[]>;

  /**
   * Update inventory quantity
   */
  updateQuantity(id: string, quantity: number): Promise<Inventory>;

  /**
   * Adjust inventory quantity by a delta
   */
  adjustQuantity(id: string, adjustment: number): Promise<Inventory>;

  /**
   * Get total inventory value for a salon
   */
  getInventoryValue(salonId: string): Promise<number>;

  /**
   * Get inventory items expiring soon
   */
  getExpiringSoon(salonId: string, days?: number): Promise<Inventory[]>;

  /**
   * Restock inventory
   */
  restock(id: string, quantity: number): Promise<Inventory>;

  /**
   * Consume inventory
   */
  consume(id: string, quantity: number): Promise<Inventory>;
}
