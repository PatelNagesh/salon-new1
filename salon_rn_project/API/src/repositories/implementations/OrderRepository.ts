import { BaseRepository } from '../../core/base/BaseRepository';
import { IOrderRepository, Order, CreateOrderDto, UpdateOrderDto } from '../interfaces/IOrderRepository';
import { supabase } from '../../config/supabase.config';
import { Logger } from '../../core/utils/logger.util';
import { NotFoundException, ConflictException } from '../../exceptions';

/**
 * Order repository implementation
 */
export class OrderRepository extends BaseRepository<Order, CreateOrderDto, UpdateOrderDto> implements IOrderRepository {
  protected tableName = 'orders';
  private logger = new Logger('OrderRepository');

  async findById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error finding order by id:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error finding all orders:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        salon_id: dto.salonId,
        vendor_id: dto.vendorId,
        order_number: dto.orderNumber,
        order_date: dto.orderDate,
        expected_delivery_date: dto.expectedDeliveryDate,
        total_amount: dto.totalAmount,
        notes: dto.notes
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating order:', error);
      throw new ConflictException('Order', dto.orderNumber);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const updateData: any = {};
    if (dto.expectedDeliveryDate !== undefined) updateData.expected_delivery_date = dto.expectedDeliveryDate;
    if (dto.actualDeliveryDate !== undefined) updateData.actual_delivery_date = dto.actualDeliveryDate;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.totalAmount !== undefined) updateData.total_amount = dto.totalAmount;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating order:', error);
      throw new NotFoundException('Order', id);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting order:', error);
      return false;
    }

    return true;
  }

  async findBySalonId(salonId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('salon_id', salonId);

    if (error) {
      this.logger.error('Error finding orders by salon id:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByVendorId(vendorId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('vendor_id', vendorId);

    if (error) {
      this.logger.error('Error finding orders by vendor id:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      this.logger.error('Error finding order by order number:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findByStatus(status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status);

    if (error) {
      this.logger.error('Error finding orders by status:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .gte('order_date', startDate)
      .lte('order_date', endDate);

    if (error) {
      this.logger.error('Error finding orders by date range:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async existsByOrderNumber(orderNumber: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  private mapToEntity(data: any): Order {
    return {
      id: data.id,
      salonId: data.salon_id,
      vendorId: data.vendor_id,
      orderNumber: data.order_number,
      orderDate: data.order_date,
      expectedDeliveryDate: data.expected_delivery_date,
      actualDeliveryDate: data.actual_delivery_date,
      status: data.status,
      totalAmount: data.total_amount,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
