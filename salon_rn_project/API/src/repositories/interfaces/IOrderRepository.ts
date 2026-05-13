import { IRepository } from '../../core/interfaces/IRepository';

/**
 * Order entity interface
 */
export interface Order {
  id: string;
  vendorId: string;
  salonId: string;
  orderDate: string;
  expectedDelivery?: string;
  status: 'pending' | 'ordered' | 'delivered' | 'cancelled';
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create order DTO
 */
export interface CreateOrderDto {
  vendorId: string;
  salonId: string;
  orderDate?: string;
  expectedDelivery?: string;
  status?: 'pending' | 'ordered' | 'delivered' | 'cancelled';
  totalAmount: number;
  notes?: string;
}

/**
 * Update order DTO
 */
export interface UpdateOrderDto {
  orderDate?: string;
  expectedDelivery?: string;
  status?: 'pending' | 'ordered' | 'delivered' | 'cancelled';
  totalAmount?: number;
  notes?: string;
}

/**
 * Order repository interface
 */
export interface IOrderRepository extends IRepository<Order, CreateOrderDto, UpdateOrderDto> {
  findByVendorId(vendorId: string): Promise<Order[]>;
  findBySalonId(salonId: string): Promise<Order[]>;
  findByStatus(status: 'pending' | 'ordered' | 'delivered' | 'cancelled'): Promise<Order[]>;
  findByDateRange(startDate: string, endDate: string): Promise<Order[]>;
  findPending(): Promise<Order[]>;
  findDelivered(): Promise<Order[]>;
  findCancelled(): Promise<Order[]>;
  findByVendorAndStatus(vendorId: string, status: 'pending' | 'ordered' | 'delivered' | 'cancelled'): Promise<Order[]>;
}
