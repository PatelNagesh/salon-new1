import { supabase, Database } from '../supabase';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update'];

export class OrderService {
  // Get order by ID
  static async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  // Get all orders for a salon
  static async getOrdersBySalon(salonId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('salon_id', salonId)
        .order('order_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  // Get orders by vendor
  static async getOrdersByVendor(vendorId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('order_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting vendor orders:', error);
      throw error;
    }
  }

  // Get order with details
  static async getOrderWithDetails(id: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:vendors(*),
          order_items (
            *,
            product:products(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting order with details:', error);
      throw error;
    }
  }

  // Create order
  static async createOrder(order: OrderInsert): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Update order
  static async updateOrder(id: string, updates: OrderUpdate): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Delete order
  static async deleteOrder(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // Get orders by status
  static async getOrdersByStatus(salonId: string, status: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('salon_id', salonId)
        .eq('status', status)
        .order('order_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw error;
    }
  }

  // Get pending orders
  static async getPendingOrders(salonId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('salon_id', salonId)
        .in('status', ['pending', 'ordered'])
        .order('expected_delivery', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting pending orders:', error);
      throw error;
    }
  }

  // Order Items
  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting order items:', error);
      throw error;
    }
  }

  static async createOrderItem(item: OrderItemInsert): Promise<OrderItem> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }

  static async updateOrderItem(id: string, updates: OrderItemUpdate): Promise<OrderItem> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order item:', error);
      throw error;
    }
  }

  static async deleteOrderItem(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting order item:', error);
      throw error;
    }
  }

  // Search orders
  static async searchOrders(salonId: string, query: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:vendors(*)
        `)
        .eq('salon_id', salonId)
        .or(`vendor.company_name.ilike.%${query}%,notes.ilike.%${query}%`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    }
  }
}
