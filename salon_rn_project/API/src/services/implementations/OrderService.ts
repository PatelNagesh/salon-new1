/**
 * Order Service Implementation
 * Handles all order-related business logic
 */

import { BaseService } from '../../core/base/BaseService';
import { IOrderService } from '../interfaces/IOrderService';
import { IOrderRepository } from '../../repositories/interfaces/IOrderRepository';
import { IVendorRepository } from '../../repositories/interfaces/IVendorRepository';
import { ISalonRepository } from '../../repositories/interfaces/ISalonRepository';
import { IInventoryRepository } from '../../repositories/interfaces/IInventoryRepository';
import type { Order, CreateOrderDto, UpdateOrderDto, QueryOptions } from '../../core/types/common.types';
import { ValidationException, NotFoundException, ConflictException } from '../../exceptions';
import { Logger } from '../../core/utils/logger.util';

export class OrderService extends BaseService implements IOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private vendorRepository: IVendorRepository,
    private salonRepository: ISalonRepository,
    private inventoryRepository: IInventoryRepository
  ) {
    super();
    this.logger = new Logger('OrderService');
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    // Validate business rules
    await this.validateOrder(dto);

    const order = await this.orderRepository.create(dto);

    this.logger.info('Order created successfully:', order.id);
    return order;
  }

  async findById(id: string): Promise<Order> {
    return await this.orderRepository.findById(id);
  }

  async findAll(options?: QueryOptions): Promise<Order[]> {
    return await this.orderRepository.findAll(options);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findById(id);

    // Validate status transition
    if (dto.status && !this.isValidStatusTransition(order.status, dto.status)) {
      throw new ValidationException(`Invalid status transition from ${order.status} to ${dto.status}`);
    }

    const updated = await this.orderRepository.update(id, dto);

    this.logger.info('Order updated successfully:', id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id);

    if (['processing', 'shipped'].includes(order.status)) {
      throw new ValidationException('Cannot delete order that is being processed or shipped');
    }

    await this.orderRepository.delete(id);

    this.logger.info('Order deleted successfully:', id);
  }

  async findBySalonId(salonId: string): Promise<Order[]> {
    return await this.orderRepository.findBySalonId(salonId);
  }

  async findByVendorId(vendorId: string): Promise<Order[]> {
    return await this.orderRepository.findByVendorId(vendorId);
  }

  async findByStatus(status: string): Promise<Order[]> {
    return await this.orderRepository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return await this.orderRepository.findByDateRange(startDate, endDate);
  }

  async getPendingOrders(salonId: string): Promise<Order[]> {
    return await this.orderRepository.findByStatus('pending');
  }

  async getProcessingOrders(salonId: string): Promise<Order[]> {
    return await this.orderRepository.findByStatus('processing');
  }

  async getShippedOrders(salonId: string): Promise<Order[]> {
    return await this.orderRepository.findByStatus('shipped');
  }

  async getDeliveredOrders(salonId: string): Promise<Order[]> {
    return await this.orderRepository.findByStatus('delivered');
  }

  async getCancelledOrders(salonId: string): Promise<Order[]> {
    return await this.orderRepository.findByStatus('cancelled');
  }

  async process(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id);

    if (order.status !== 'pending') {
      throw new ValidationException('Only pending orders can be processed');
    }

    await this.orderRepository.update(id, { status: 'processing' });

    this.logger.info('Order processed successfully:', id);
  }

  async ship(id: string, trackingNumber?: string): Promise<void> {
    const order = await this.orderRepository.findById(id);

    if (order.status !== 'processing') {
      throw new ValidationException('Only processing orders can be shipped');
    }

    await this.orderRepository.update(id, {
      status: 'shipped',
      trackingNumber
    });

    this.logger.info('Order shipped successfully:', id);
  }

  async deliver(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id);

    if (order.status !== 'shipped') {
      throw new ValidationException('Only shipped orders can be delivered');
    }

    await this.orderRepository.update(id, { status: 'delivered' });

    // Update inventory
    await this.updateInventory(order);

    this.logger.info('Order delivered successfully:', id);
  }

  async cancel(id: string, reason?: string): Promise<void> {
    const order = await this.orderRepository.findById(id);

    if (['shipped', 'delivered'].includes(order.status)) {
      throw new ValidationException('Cannot cancel shipped or delivered orders');
    }

    await this.orderRepository.update(id, {
      status: 'cancelled',
      cancellationReason: reason
    });

    this.logger.info('Order cancelled successfully:', id);
  }

  private async validateOrder(dto: CreateOrderDto): Promise<void> {
    // Validate salon exists
    const salon = await this.salonRepository.findById(dto.salonId);
    if (!salon) {
      throw new NotFoundException('Salon', dto.salonId);
    }

    // Validate vendor exists
    const vendor = await this.vendorRepository.findById(dto.vendorId);
    if (!vendor) {
      throw new NotFoundException('Vendor', dto.vendorId);
    }

    // Validate items
    if (!dto.items || dto.items.length === 0) {
      throw new ValidationException('Order must have at least one item');
    }

    // Validate total amount
    const calculatedTotal = dto.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    if (Math.abs(calculatedTotal - dto.totalAmount) > 0.01) {
      throw new ValidationException('Total amount does not match item totals');
    }

    // Validate expected delivery date
    if (dto.expectedDeliveryDate) {
      const deliveryDate = new Date(dto.expectedDeliveryDate);
      const today = new Date();

      if (deliveryDate < today) {
        throw new ValidationException('Expected delivery date cannot be in the past');
      }
    }
  }

  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private async updateInventory(order: Order): Promise<void> {
    for (const item of order.items) {
      const inventoryItems = await this.inventoryRepository.findByProductId(item.productId);

      for (const inventory of inventoryItems) {
        if (inventory.salonId === order.salonId) {
          await this.inventoryRepository.restock(inventory.id, item.quantity);
        }
      }
    }
  }
}
