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
  TextInput,
  Modal,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../../services/supabase';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  total_visits: number;
  total_spent: number;
  last_visit: string;
  preferred_services: string[];
  notes?: string;
}

export const StaffClientsScreen = () => {
  const { user, salonId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientNotes, setClientNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, [salonId, searchQuery]);

  const loadClients = async () => {
    try {
      if (!salonId || !user?.id) return;

      // Get all customers who had appointments with this staff member
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          customer_id,
          status,
          services(name),
          start_time
        `)
        .eq('salon_id', salonId)
        .eq('staff_id', user.id)
        .eq('status', 'completed');

      if (bookingsError) throw bookingsError;

      // Group bookings by customer and calculate stats
      const clientMap: { [key: string]: Client } = {};

      bookings?.forEach((booking) => {
        const customerId = booking.customer_id;

        if (!clientMap[customerId]) {
          clientMap[customerId] = {
            id: customerId,
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            total_visits: 0,
            total_spent: 0,
            last_visit: booking.start_time,
            preferred_services: [],
          };
        }

        const client = clientMap[customerId];
        client.total_visits++;

        if (new Date(booking.start_time) > new Date(client.last_visit)) {
          client.last_visit = booking.start_time;
        }

        // Add service to preferred services
        if ((booking as any).services?.name) {
          if (!client.preferred_services.includes((booking as any).services.name)) {
            client.preferred_services.push((booking as any).services.name);
          }
        }
      });

      // Get customer profiles
      const customerIds = Object.keys(clientMap);
      if (customerIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', customerIds);

        if (profileError) throw profileError;

        profiles?.forEach((profile) => {
          if (clientMap[profile.id]) {
            clientMap[profile.id].first_name = profile.first_name;
            clientMap[profile.id].last_name = profile.last_name;
            clientMap[profile.id].email = profile.email;
            clientMap[profile.id].phone = profile.phone;
          }
        });

        // Get total spent for each client
        for (const clientId of customerIds) {
          const { data: clientBookings } = await supabase
            .from('bookings')
            .select('services(price)')
            .eq('customer_id', clientId)
            .eq('staff_id', user.id)
            .eq('status', 'completed');

          const totalSpent = clientBookings?.reduce(
            (sum, booking: any) => sum + (booking.services?.price || 0),
            0
          ) || 0;

          clientMap[clientId].total_spent = totalSpent;
        }
      }

      // Get staff notes for clients
      const { data: notesData } = await supabase
        .from('staff_client_notes')
        .select('customer_id, notes')
        .eq('staff_id', user.id);

      notesData?.forEach((note) => {
        if (clientMap[note.customer_id]) {
          clientMap[note.customer_id].notes = note.notes;
        }
      });

      let clientsList = Object.values(clientMap);

      // Apply search filter
      if (searchQuery) {
        clientsList = clientsList.filter(client =>
          `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.phone.includes(searchQuery)
        );
      }

      // Sort by last visit (most recent first)
      clientsList.sort((a, b) => new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime());

      setClients(clientsList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('staff_client_notes')
        .upsert({
          staff_id: user?.id,
          customer_id: selectedClient.id,
          notes: clientNotes,
        });

      if (error) throw error;

      Alert.alert('Success', 'Notes saved successfully');
      setShowNotesModal(false);
      loadClients();
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes');
    }
  };

  const openNotesModal = (client: Client) => {
    setSelectedClient(client);
    setClientNotes(client.notes || '');
    setShowNotesModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading clients...</Text>
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
        <Text style={styles.headerTitle}>My Clients</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{clients.length}</Text>
          <Text style={styles.statLabel}>Total Clients</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {clients.reduce((sum, c) => sum + c.total_visits, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Visits</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            ${clients.reduce((sum, c) => sum + c.total_spent, 0).toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>

      {clients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No clients found' : 'No clients yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try adjusting your search' : 'Your clients will appear here after their first appointment'}
          </Text>
        </View>
      ) : (
        <View style={styles.clientsList}>
          {clients.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientCard}
              onPress={() => openNotesModal(client)}
            >
              <View style={styles.clientHeader}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>
                    {client.first_name} {client.last_name}
                  </Text>
                  <Text style={styles.clientContact}>{client.email}</Text>
                  <Text style={styles.clientContact}>{client.phone}</Text>
                </View>
                <View style={styles.clientStats}>
                  <Text style={styles.statValue}>{client.total_visits} visits</Text>
                  <Text style={styles.statValue}>${client.total_spent.toFixed(0)}</Text>
                </View>
              </View>

              <View style={styles.clientDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Visit:</Text>
                  <Text style={styles.detailValue}>{formatDate(client.last_visit)}</Text>
                </View>

                {client.preferred_services.length > 0 && (
                  <View style={styles.servicesContainer}>
                    <Text style={styles.servicesLabel}>Preferred Services:</Text>
                    <View style={styles.servicesChips}>
                      {client.preferred_services.slice(0, 3).map((service, index) => (
                        <View key={index} style={styles.serviceChip}>
                          <Text style={styles.serviceChipText}>{service}</Text>
                        </View>
                      ))}
                      {client.preferred_services.length > 3 && (
                        <View style={styles.serviceChip}>
                          <Text style={styles.serviceChipText}>
                            +{client.preferred_services.length - 3} more
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {client.notes && (
                  <View style={styles.notesPreview}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText} numberOfLines={2}>
                      {client.notes}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.notesButton}>
                <Text style={styles.notesButtonText}>View Details</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Client Notes Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Client Details</Text>
            <TouchableOpacity onPress={() => setShowNotesModal(false)}>
              <Text style={styles.modalCloseButton}>Close</Text>
            </TouchableOpacity>
          </View>

          {selectedClient && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.clientDetailSection}>
                <Text style={styles.detailSectionTitle}>Client Information</Text>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Name:</Text>
                  <Text style={styles.detailInfoValue}>
                    {selectedClient.first_name} {selectedClient.last_name}
                  </Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Email:</Text>
                  <Text style={styles.detailInfoValue}>{selectedClient.email}</Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Phone:</Text>
                  <Text style={styles.detailInfoValue}>{selectedClient.phone}</Text>
                </View>
              </View>

              <View style={styles.clientDetailSection}>
                <Text style={styles.detailSectionTitle}>Visit History</Text>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Total Visits:</Text>
                  <Text style={styles.detailInfoValue}>{selectedClient.total_visits}</Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Total Spent:</Text>
                  <Text style={styles.detailInfoValue}>${selectedClient.total_spent.toFixed(2)}</Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Last Visit:</Text>
                  <Text style={styles.detailInfoValue}>
                    {new Date(selectedClient.last_visit).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.clientDetailSection}>
                <Text style={styles.detailSectionTitle}>Preferred Services</Text>
                <View style={styles.servicesChips}>
                  {selectedClient.preferred_services.map((service, index) => (
                    <View key={index} style={styles.serviceChip}>
                      <Text style={styles.serviceChipText}>{service}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.clientDetailSection}>
                <Text style={styles.detailSectionTitle}>My Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  value={clientNotes}
                  onChangeText={setClientNotes}
                  placeholder="Add notes about this client..."
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
                <TouchableOpacity style={styles.saveNotesButton} onPress={handleSaveNotes}>
                  <Text style={styles.saveNotesButtonText}>Save Notes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
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
  clientsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  clientCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  clientContact: {
    fontSize: 14,
    color: '#666',
  },
  clientStats: {
    alignItems: 'flex-end',
  },
  clientDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  servicesContainer: {
    marginTop: 8,
  },
  servicesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  servicesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceChip: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceChipText: {
    fontSize: 12,
    color: '#495057',
  },
  notesPreview: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
  },
  notesButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  notesButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#007bff',
  },
  modalContent: {
    padding: 20,
  },
  clientDetailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailInfoLabel: {
    fontSize: 16,
    color: '#666',
    width: 120,
  },
  detailInfoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  saveNotesButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveNotesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});