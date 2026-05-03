import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../../services/supabase';

interface BookingHistory {
  id: string;
  start_time: string;
  end_time: string;
  status: 'completed' | 'cancelled' | 'no-show';
  total_amount: number;
  service: {
    name: string;
    duration: number;
  };
  staff: {
    profiles: {
      first_name: string;
      last_name: string;
    };
  };
  salon: {
    name: string;
  };
}

export const CustomerHistoryScreen = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingHistory | null>(null);

  useEffect(() => {
    loadBookingHistory();
  }, []);

  const loadBookingHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(name, duration),
          staff:staff_members(
            profiles(first_name, last_name)
          ),
          salon:salons(name)
        `)
        .eq('customer_id', user?.id)
        .in('status', ['completed', 'cancelled', 'no-show'])
        .order('start_time', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      case 'no-show':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const renderBookingItem = ({ item }: { item: BookingHistory }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => setSelectedBooking(item)}
    >
      <View style={styles.bookingHeader}>
        <Text style={styles.serviceName}>{item.service?.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.start_time).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.start_time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{item.service?.duration} minutes</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Staff:</Text>
          <Text style={styles.detailValue}>
            {item.staff?.profiles?.first_name} {item.staff?.profiles?.last_name}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Salon:</Text>
          <Text style={styles.detailValue}>{item.salon?.name}</Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.totalAmount}>Total: ${item.total_amount?.toFixed(2)}</Text>
        {item.status === 'completed' && (
          <TouchableOpacity
            style={styles.rebookButton}
            onPress={() => {
              Alert.alert(
                'Rebook Service',
                `Would you like to book ${item.service?.name} again?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Book Again', onPress: () => {} },
                ]
              );
            }}
          >
            <Text style={styles.rebookButtonText}>Book Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading booking history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking History</Text>
        <Text style={styles.headerSubtitle}>
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No past bookings</Text>
          <Text style={styles.emptySubtext}>
            Your completed and cancelled bookings will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedBooking && (
        <View style={styles.detailModal}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setSelectedBooking(null)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <View style={styles.modalDetails}>
              <Text style={styles.modalDetailText}>
                Service: {selectedBooking.service?.name}
              </Text>
              <Text style={styles.modalDetailText}>
                Status: {selectedBooking.status}
              </Text>
              <Text style={styles.modalDetailText}>
                Date: {new Date(selectedBooking.start_time).toLocaleDateString()}
              </Text>
              <Text style={styles.modalDetailText}>
                Time: {new Date(selectedBooking.start_time).toLocaleTimeString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedBooking(null)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  list: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
  },
  rebookButton: {
    borderWidth: 1,
    borderColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rebookButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  detailModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    margin: 20,
    maxWidth: 400,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDetails: {
    marginBottom: 20,
  },
  modalDetailText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  modalCloseButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});