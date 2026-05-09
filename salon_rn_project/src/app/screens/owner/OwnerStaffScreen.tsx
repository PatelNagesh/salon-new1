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
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../../services/supabase';


interface StaffMember {
  id: string;
  user_id: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  role: string;
  hourly_rate: number;
  is_active: boolean;
  hire_date: string;
  commission_rate: number;
}

export const OwnerStaffScreen = () => {
  const { salonId, hasPermission } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'STAFF',
    hourlyRate: '',
    commissionRate: '',
  });

  useEffect(() => {
    loadStaff();
  }, [salonId]);

  const loadStaff = async () => {
    try {
      if (!salonId) return;

      const { data, error } = await supabase
        .from('staff_members')
        .select(`
          *,
          profiles(
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('salon_id', salonId)
        .order('hire_date', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStaff();
    setRefreshing(false);
  };

  const handleAddStaff = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // First, create the user's profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'tempPassword123!', // In production, you'd send this via email
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          },
        },
      });

      if (authError) throw authError;

      // Create profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user?.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        });

      if (profileError) throw profileError;

      // Create staff member entry
      const { error: staffError } = await supabase
        .from('staff_members')
        .insert({
          user_id: authData.user?.id,
          salon_id: salonId,
          role: formData.role,
          hourly_rate: parseFloat(formData.hourlyRate) || 0,
          commission_rate: parseFloat(formData.commissionRate) || 0,
          is_active: true,
          hire_date: new Date().toISOString(),
        });

      if (staffError) throw staffError;

      // Assign role to user
      const { error: roleError } = await supabase.rpc('update_user_role', {
        user_id: authData.user?.id,
        new_role: formData.role,
        salon_id: salonId,
      });

      if (roleError) throw roleError;

      Alert.alert('Success', 'Staff member added successfully');
      setShowAddModal(false);
      resetForm();
      loadStaff();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleToggleActive = async (staffId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('staff_members')
        .update({ is_active: !isActive })
        .eq('id', staffId);

      if (error) throw error;
      loadStaff();
    } catch (error) {
      Alert.alert('Error', 'Failed to update staff status');
    }
  };

  const handleDeleteStaff = (staffMember: StaffMember) => {
    Alert.alert(
      'Delete Staff Member',
      `Are you sure you want to remove ${staffMember.profiles.first_name} ${staffMember.profiles.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove staff member entry
              await supabase
                .from('staff_members')
                .delete()
                .eq('id', staffMember.id);

              // Remove user role
              await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', staffMember.user_id)
                .eq('salon_id', salonId);

              Alert.alert('Success', 'Staff member removed');
              loadStaff();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove staff member');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'STAFF',
      hourlyRate: '',
      commissionRate: '',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading staff...</Text>
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
        <Text style={styles.headerTitle}>Staff Management</Text>
        {hasPermission('staff.create') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Staff</Text>
          </TouchableOpacity>
        )}
      </View>

      {staff.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No staff members found</Text>
          <Text style={styles.emptySubtext}>Add your first staff member to get started</Text>
        </View>
      ) : (
        <View style={styles.staffList}>
          {staff.map((staffMember) => (
            <View key={staffMember.id} style={styles.staffCard}>
              <View style={styles.staffInfo}>
                <Text style={styles.staffName}>
                  {staffMember.profiles.first_name} {staffMember.profiles.last_name}
                </Text>
                <Text style={styles.staffEmail}>{staffMember.profiles.email}</Text>
                <Text style={styles.staffPhone}>{staffMember.profiles.phone}</Text>
                <View style={styles.staffDetails}>
                  <Text style={styles.staffRole}>Role: {staffMember.role}</Text>
                  <Text style={styles.staffRate}>
                    Rate: ${staffMember.hourly_rate}/hr
                  </Text>
                  {staffMember.commission_rate > 0 && (
                    <Text style={styles.staffCommission}>
                      Commission: {staffMember.commission_rate}%
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.staffActions}>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Active</Text>
                  <Switch
                    value={staffMember.is_active}
                    onValueChange={() =>
                      handleToggleActive(staffMember.id, staffMember.is_active)
                    }
                    disabled={!hasPermission('staff.manage')}
                  />
                </View>
                {hasPermission('staff.delete') && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteStaff(staffMember)}
                  >
                    <Text style={styles.deleteButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add Staff Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Staff Member</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="staff@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                placeholder="First name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                placeholder="Last name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Role</Text>
              <View style={styles.roleButtons}>
                {['STAFF', 'MANAGER'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      formData.role === role && styles.roleButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role })}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        formData.role === role && styles.roleButtonTextActive,
                      ]}
                    >
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hourly Rate ($)</Text>
              <TextInput
                style={styles.input}
                value={formData.hourlyRate}
                onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Commission Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={formData.commissionRate}
                onChangeText={(text) => setFormData({ ...formData, commissionRate: text })}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddStaff}>
              <Text style={styles.saveButtonText}>Add Staff Member</Text>
            </TouchableOpacity>
          </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
  staffList: {
    padding: 20,
  },
  staffCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  staffEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  staffPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  staffDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  staffRole: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
  },
  staffRate: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  staffCommission: {
    fontSize: 12,
    color: '#6f42c1',
    fontWeight: '500',
  },
  staffActions: {
    alignItems: 'center',
    gap: 12,
  },
  switchContainer: {
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});