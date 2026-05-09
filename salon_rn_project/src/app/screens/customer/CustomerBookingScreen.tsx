import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../../services/supabase';


interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  service: {
    name: string;
    price: number;
  };
  staff: {
    first_name: string;
    last_name: string;
  };
}

export const CustomerBookingScreen = () => {
  const { user, salonId } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showServices, setShowServices] = useState(true);

  useEffect(() => {
    loadData();
  }, [salonId]);

  const loadData = async () => {
    try {
      if (!salonId) return;

      // Load services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .order('name');

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Load user bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(name, price),
          staff:staff_members(
            profiles(first_name, last_name)
          )
        `)
        .eq('customer_id', user?.id)
        .order('start_time', { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    // Navigate to booking details
    Alert.alert(
      'Book Service',
      `Would you like to book ${service.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: () => {
            // Navigate to date/time selection
            Alert.alert('Coming Soon', 'Date/time selection will be implemented');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#007bff';
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
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
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showServices && styles.toggleButtonActive]}
          onPress={() => setShowServices(true)}
        >
          <Text style={[styles.toggleButtonText, showServices && styles.toggleButtonTextActive]}>
            Book Service
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !showServices && styles.toggleButtonActive]}
          onPress={() => setShowServices(false)}
        >
          <Text style={[styles.toggleButtonText, !showServices && styles.toggleButtonTextActive]}>
            My Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {showServices ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          {services.length === 0 ? (
            <Text style={styles.emptyText}>No services available</Text>
          ) : (
            services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => handleBookService(service)}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  <Text style={styles.serviceDuration}>Duration: {service.duration} minutes</Text>
                </View>
                <View style={styles.servicePricing}>
                  <Text style={styles.servicePrice}>${service.price.toFixed(2)}</Text>
                  <Text style={styles.bookText}>Book</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Bookings</Text>
          {bookings.length === 0 ? (
            <Text style={styles.emptyText}>No bookings yet</Text>
          ) : (
            bookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingService}>{booking.service?.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(booking.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.bookingTime}>
                  {new Date(booking.start_time).toLocaleString()}
                </Text>
                <Text style={styles.bookingStaff}>
                  Staff: {(booking.staff as any)?.profiles?.first_name} {(booking.staff as any)?.profiles?.last_name}
                </Text>
                <Text style={styles.bookingPrice}>${booking.service?.price.toFixed(2)}</Text>
              </View>
            ))
          )}
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
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#007bff',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  section: {
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  serviceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
  },
  servicePricing: {
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 8,
  },
  bookText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007bff',
  },
  bookingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingService: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
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
  bookingTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  bookingStaff: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  bookingPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
  },
});