import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeService, RealtimeEvent } from '../services/realtime';
import { Booking } from '../services/booking.service';
import { Inventory } from '../services/database/InventoryService';
import { Order } from '../services/database/OrderService';

export function useBookingsRealtime(salonId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const callbackRef = useRef<((event: RealtimeEvent) => void) | null>(null);

  useEffect(() => {
    callbackRef.current = (event: RealtimeEvent) => {
      if (event.eventType === 'INSERT') {
        setBookings(prev => [...prev, event.new as Booking]);
      } else if (event.eventType === 'UPDATE') {
        setBookings(prev => prev.map(b => b.id === event.new.id ? event.new as Booking : b));
      } else if (event.eventType === 'DELETE') {
        setBookings(prev => prev.filter(b => b.id !== event.old.id));
      }
    };

    const channel = RealtimeService.subscribeToBookings(
      callbackRef.current,
      salonId
    );

    setIsConnected(RealtimeService.getConnectionState() === 'connected');

    return () => {
      RealtimeService.unsubscribeFromBookings(salonId, callbackRef.current!);
    };
  }, [salonId]);

  return { bookings, isConnected, error };
}

export function useInventoryRealtime(salonId?: string) {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const callbackRef = useRef<((event: RealtimeEvent) => void) | null>(null);

  useEffect(() => {
    callbackRef.current = (event: RealtimeEvent) => {
      if (event.eventType === 'INSERT') {
        setInventory(prev => [...prev, event.new as Inventory]);
      } else if (event.eventType === 'UPDATE') {
        setInventory(prev => prev.map(i => i.id === event.new.id ? event.new as Inventory : i));
      } else if (event.eventType === 'DELETE') {
        setInventory(prev => prev.filter(i => i.id !== event.old.id));
      }
    };

    const channel = RealtimeService.subscribeToInventory(
      callbackRef.current,
      salonId
    );

    setIsConnected(RealtimeService.getConnectionState() === 'connected');

    return () => {
      RealtimeService.unsubscribeFromInventory(salonId, callbackRef.current!);
    };
  }, [salonId]);

  return { inventory, isConnected, error };
}

export function useOrdersRealtime(salonId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const callbackRef = useRef<((event: RealtimeEvent) => void) | null>(null);

  useEffect(() => {
    callbackRef.current = (event: RealtimeEvent) => {
      if (event.eventType === 'INSERT') {
        setOrders(prev => [...prev, event.new as Order]);
      } else if (event.eventType === 'UPDATE') {
        setOrders(prev => prev.map(o => o.id === event.new.id ? event.new as Order : o));
      } else if (event.eventType === 'DELETE') {
        setOrders(prev => prev.filter(o => o.id !== event.old.id));
      }
    };

    const channel = RealtimeService.subscribeToOrders(
      callbackRef.current,
      salonId
    );

    setIsConnected(RealtimeService.getConnectionState() === 'connected');

    return () => {
      RealtimeService.unsubscribeFromOrders(salonId, callbackRef.current!);
    };
  }, [salonId]);

  return { orders, isConnected, error };
}

export function useRealtimeConnection() {
  const [connectionState, setConnectionState] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(RealtimeService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return connectionState;
}
