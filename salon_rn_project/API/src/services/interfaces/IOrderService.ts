/**
 * Order Service Interface
 * Defines the contract for order-related business operations
 */

import type { Order, CreateOrderDto, UpdateOrderDto, QueryOptions } from '../../core/types/common.types';

export interface IOrderService {
  /**
   * Create a new order
   */
  create(dto: CreateOrderDto): Promise<Order>;

  /**
   * Find order by ID
   */
  findById(id: string): Promise<Order>;

  /**
   * Find all orders with optional query options
   */
  findAll(options?: QueryOptions): Promise<Order[]>;

  /**
   * Update an existing order
   */
  update(id: string, dto: UpdateOrderDto): Promise<Order>;

  /**
   * Delete an order
   */
  delete(id: string): Promise<void>;

  /**
   * Find orders by salon ID
   */
  findBySalonId(salonId: string): Promise<Order[]>;

  /**
   * Find orders by vendor ID
   */
  findByVendorId(vendorId: string): Promise<Order[]>;

  /**
   * Find orders by status
   */
  findByStatus(status: string): Promise<Order[]>;

  /**
   * Find orders within a date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Order[]>;

  /**
   * Get pending orders for a salon
   */
  getPendingOrders(salonId: string): Promise<Order[]>;

  /**
   * Get processing orders for a salon
   */
  getProcessingOrders(salonId: string): Promise<Order[]>;

  /**
   * Get shipped orders for a salon
   */
  getShippedOrders(salonId: string): Promise<Order[]>;

  /**
   * Get delivered orders for a salon
   */
  getDeliveredOrders(salonId: string): Promise<Order[]>;

  /**
   * Get cancelled orders for a salon
   */
  getCancelledOrders(salonId: string): Promise<Order[]>;

  /**
   * Process a pending order
   */
  process(id: string): Promise<void>;

  /**
   * Ship a processing order
   */
  ship(id: string, trackingNumber?: string): Promise<void>;

  /**
   * Mark a shipped order as delivered
   */
  deliver(id: string): Promise<void>;

  /**
   * Cancel an order
   */
  cancel(id: string, reason?: string): Promise<void>;
}
