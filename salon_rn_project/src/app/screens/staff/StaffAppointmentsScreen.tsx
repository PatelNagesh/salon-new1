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

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
  service: {
    name: string;
    duration: number;
    price: number;
  };
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
}

export const StaffAppointmentsScreen = () => {
  const { user, salonId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'all'>('today');

  useEffect(() => {
    loadAppointments();
  }, [salonId, filter]);

  const loadAppointments = async () => {
    try {
      if (!salonId || !user?.id) return;

      let query = supabase
        .from('bookings')
        .select(`
          *,
          service:services(name, duration, price),
          customer:profiles(first_name, last_name, phone, email)
        `)
        .eq('salon_id', salonId)
        .eq('staff_id', user.id)
        .order('start_time', { ascending: true });

      // Apply date filter
      if (filter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query = query
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString());
      } else if (filter === 'upcoming') {
        const now = new Date();
        query = query.gte('start_time', now.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const handleStartAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'in-progress',
          started_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;
      Alert.alert('Success', 'Appointment started');
      loadAppointments();
    } catch (error) {
      Alert.alert('Error', 'Failed to start appointment');
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;
      Alert.alert('Success', 'Appointment completed');
      loadAppointments();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete appointment');
    }
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

  const formatDateTime = (timeString: string) => {
    const date = new Date(timeString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
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
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>

      <View style={styles.filterContainer}>
        {(['today', 'upcoming', 'all'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              filter === filterType && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === filterType && styles.filterButtonTextActive,
              ]}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No appointments found</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'today' ? "You don't have any appointments today" :
             filter === 'upcoming' ? "No upcoming appointments" :
             "No appointments scheduled"}
          </Text>
        </View>
      ) : (
        <View style={styles.appointmentsList}>
          {appointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.start_time);
            return (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.datetimeContainer}>
                    <Text style={styles.appointmentDate}>{date}</Text>
                    <Text style={styles.appointmentTime}>{time}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(appointment.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {appointment.status.replace('-', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{appointment.service.name}</Text>
                    <Text style={styles.serviceDuration}>
                      {appointment.service.duration} minutes • ${appointment.service.price.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>
                      {appointment.customer.first_name} {appointment.customer.last_name}
                    </Text>
                    <Text style={styles.customerContact}>{appointment.customer.phone}</Text>
                    <Text style={styles.customerContact}>{appointment.customer.email}</Text>
                  </View>

                  {appointment.notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{appointment.notes}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.appointmentActions}>
                  {appointment.status === 'checked-in' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.startButton]}
                      onPress={() => handleStartAppointment(appointment.id)}
                    >
                      <Text style={styles.actionButtonText}>Start Service</Text>
                    </TouchableOpacity>
                  )}
                  {appointment.status === 'in-progress' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={() => handleCompleteAppointment(appointment.id)}
                    >
                      <Text style={styles.actionButtonText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
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
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
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
    textAlign: 'center',
  },
  appointmentsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datetimeContainer: {
    alignItems: 'flex-start',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  serviceInfo: {
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  customerContact: {
    fontSize: 14,
    color: '#666',
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#007bff',
  },
  completeButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});