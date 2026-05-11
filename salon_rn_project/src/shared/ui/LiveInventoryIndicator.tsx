import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useInventoryRealtime } from '../hooks/useRealtime';
import { useAuth } from '../hooks/useAuth';

interface LiveInventoryIndicatorProps {
  salonId?: string;
  onLowStock?: (items: any[]) => void;
}

export function LiveInventoryIndicator({ salonId, onLowStock }: LiveInventoryIndicatorProps) {
  const { salonId: userSalonId } = useAuth();
  const { inventory, isConnected } = useInventoryRealtime(salonId || userSalonId);

  const lowStockItems = inventory.filter(item => item.quantity <= item.reorder_level);

  React.useEffect(() => {
    if (lowStockItems.length > 0) {
      onLowStock?.(lowStockItems);
    }
  }, [lowStockItems.length, onLowStock]);

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={[styles.dot, isConnected && styles.connected]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Live' : 'Offline'}
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Low Stock Items</Text>
        <Text style={[styles.count, lowStockItems.length > 0 && styles.warning]}>
          {lowStockItems.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  connected: {
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoContainer: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
  },
  count: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  warning: {
    color: '#F59E0B',
  },
});
