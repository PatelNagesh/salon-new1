import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRealtimeConnection } from '../hooks/useRealtime';

interface RealtimeIndicatorProps {
  size?: number;
  showLabel?: boolean;
}

export function RealtimeIndicator({ size = 8, showLabel = false }: RealtimeIndicatorProps) {
  const connectionState = useRealtimeConnection();

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.indicator,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isConnected ? '#10B981' : isConnecting ? '#F59E0B' : '#EF4444',
          },
          isConnecting && styles.pulsing,
        ]}
      />
      {showLabel && (
        <Text style={styles.label}>
          {isConnected ? 'Live' : isConnecting ? 'Connecting...' : 'Offline'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  indicator: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  pulsing: {
    opacity: 0.7,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
});
