import { supabase } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeEvent = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  old: any;
  new: any;
};

export type RealtimeCallback = (event: RealtimeEvent) => void;

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();
  private static callbacks: Map<string, Set<RealtimeCallback>> = new Map();
  private static connectionState: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

  // Get connection state
  static getConnectionState(): 'connected' | 'disconnected' | 'connecting' {
    return this.connectionState;
  }

  // Subscribe to table changes
  static subscribeToTable(
    table: string,
    callback: RealtimeCallback,
    filter?: string
  ): RealtimeChannel {
    const channelName = `realtime:${table}:${filter || 'all'}`;

    // Create channel if it doesn't exist
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: filter,
          },
          (payload) => {
            const event: RealtimeEvent = {
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              table: payload.table || table,
              old: payload.old,
              new: payload.new,
            };

            // Notify all callbacks for this table
            const callbacks = this.callbacks.get(table);
            if (callbacks) {
              callbacks.forEach(cb => cb(event));
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.connectionState = 'connected';
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this.connectionState = 'disconnected';
          } else if (status === 'SUBSCRIBING') {
            this.connectionState = 'connecting';
          }
        });

      this.channels.set(channelName, channel);
    }

    // Add callback for this table
    if (!this.callbacks.has(table)) {
      this.callbacks.set(table, new Set());
    }
    this.callbacks.get(table)!.add(callback);

    return this.channels.get(channelName)!;
  }

  // Unsubscribe from table changes
  static unsubscribeFromTable(table: string, callback?: RealtimeCallback): void {
    // Remove specific callback or all callbacks for this table
    if (callback) {
      const callbacks = this.callbacks.get(table);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.callbacks.delete(table);
          // Unsubscribe from channel if no more callbacks
          this.channels.forEach((channel, channelName) => {
            if (channelName.startsWith(`realtime:${table}:`)) {
              supabase.removeChannel(channel);
              this.channels.delete(channelName);
            }
          });
        }
      }
    } else {
      // Remove all callbacks for this table
      this.callbacks.delete(table);
      // Unsubscribe from all channels for this table
      this.channels.forEach((channel, channelName) => {
        if (channelName.startsWith(`realtime:${table}:`)) {
          supabase.removeChannel(channel);
          this.channels.delete(channelName);
        }
      });
    }
  }

  // Subscribe to bookings
  static subscribeToBookings(
    callback: RealtimeCallback,
    salonId?: string
  ): RealtimeChannel {
    const filter = salonId ? `salon_id=eq.${salonId}` : undefined;
    return this.subscribeToTable('bookings', callback, filter);
  }

  // Subscribe to inventory
  static subscribeToInventory(
    callback: RealtimeCallback,
    salonId?: string
  ): RealtimeChannel {
    const filter = salonId ? `salon_id=eq.${salonId}` : undefined;
    return this.subscribeToTable('inventory', callback, filter);
  }

  // Subscribe to orders
  static subscribeToOrders(
    callback: RealtimeCallback,
    salonId?: string
  ): RealtimeChannel {
    const filter = salonId ? `salon_id=eq.${salonId}` : undefined;
    return this.subscribeToTable('orders', callback, filter);
  }

  // Unsubscribe from all
  static unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.callbacks.clear();
    this.connectionState = 'disconnected';
  }

  // Get active subscriptions
  static getActiveSubscriptions(): string[] {
    return Array.from(this.channels.keys());
  }
}
