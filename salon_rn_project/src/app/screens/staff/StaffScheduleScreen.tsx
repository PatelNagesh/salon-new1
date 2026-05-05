import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../../services/supabase';

interface ScheduleItem {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  service: {
    name: string;
    duration: number;
    price: number;
  };
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export const StaffScheduleScreen = () => {
  const { user, salonId } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadSchedule();
  }, [salonId, selectedDate]);

  const loadSchedule = async () => {
    try {
      if (!salonId || !user?.id) return;

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(name, duration, price),
          customer:profiles(first_name, last_name, phone)
        `)
        .eq('salon_id', salonId)
        .eq('staff_id', user.id)
        .gte('start_time', startOfDay.toISOString())
        .lt('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSchedule();
    setRefreshing(false);
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'in-progress', checked_in_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;
      Alert.alert('Success', 'Checked in successfully');
      loadSchedule();
    } catch (error) {
      Alert.alert('Error', 'Failed to check in');
    }
  };

  const handleComplete = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;
      Alert.alert('Success', 'Service completed successfully');
      loadSchedule();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete service');
    }
  };

  const handleNoShow = async (bookingId: string) => {
    Alert.alert(
      'Mark as No-Show',
      'Are you sure this customer didn\'t show up?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark No-Show',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('bookings')
                .update({ status: 'no-show' })
                .eq('id', bookingId);

              if (error) throw error;
              Alert.alert('Success', 'Marked as no-show');
              loadSchedule();
            } catch (error) {
              Alert.alert('Error', 'Failed to update status');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#007bff';
      case 'checked-in':
      case 'in-progress':
        return '#28a745';
      case 'completed':
        return '#6c757d';
      case 'cancelled':
        return '#ffc107';
      case 'no-show':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
      </View>

      <View style={styles.dateNavigator}>
        <TouchableOpacity style={styles.dateNavButton} onPress={() => navigateDate('prev')}>
          <Text style={styles.dateNavText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.currentDate}>{formatDate(selectedDate)}</Text>
        <TouchableOpacity style={styles.dateNavButton} onPress={() => navigateDate('next')}>
          <Text style={styles.dateNavText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{schedule.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {schedule.filter(s => s.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {schedule.filter(s => ['scheduled', 'checked-in'].includes(s.status)).length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {schedule.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No appointments scheduled</Text>
          <Text style={styles.emptySubtext}>Enjoy your day off!</Text>
        </View>
      ) : (
        <View style={styles.scheduleList}>
          {schedule.map((item) => (
            <View key={item.id} style={styles.scheduleCard}>
              <View style={styles.timeSlot}>
                <Text style={styles.startTime}>{formatTime(item.start_time)}</Text>
                <Text style={styles.endTime}>{formatTime(item.end_time)}</Text>
              </View>
              <View style={styles.scheduleDetails}>
                <View style={styles.statusBadge}>
                  <Text style={[styles.statusText, { color: '#fff' }]}>
                    {item.status.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.serviceName}>{item.service.name}</Text>
                <Text style={styles.customerName}>
                  {item.customer.first_name} {item.customer.last_name}
                </Text>
                <Text style={styles.customerPhone}>{item.customer.phone}</Text>
                <Text style={styles.serviceDuration}>
                  {item.service.duration} min • ${item.service.price.toFixed(2)}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                {item.status === 'scheduled' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.checkInButton]}
                    onPress={() => handleCheckIn(item.id)}
                  >
                    <Text style={styles.actionButtonText}>Check In</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'in-progress' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => handleComplete(item.id)}
                  >
                    <Text style={styles.actionButtonText}>Complete</Text>
                  </TouchableOpacity>
                )}
                {['scheduled', 'checked-in'].includes(item.status) && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.noShowButton]}
                    onPress={() => handleNoShow(item.id)}
                  >
                    <Text style={styles.actionButtonText}>No Show</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dateNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  currentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  scheduleList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
  },
  timeSlot: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 8,
  },
  startTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  endTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scheduleDetails: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: '#007bff',
  },
  completeButton: {
    backgroundColor: '#28a745',
  },
  noShowButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});