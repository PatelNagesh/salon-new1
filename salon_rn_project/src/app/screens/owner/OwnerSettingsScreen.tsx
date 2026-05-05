import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../../services/supabase';
import * as SecureStore from 'expo-secure-store';

interface SalonSettings {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  tax_rate: number;
  gratuity_rate: number;
  cancellation_policy: string;
  booking_buffer_minutes: number;
  auto_reminders: boolean;
  advance_booking_days: number;
  require_deposit: boolean;
  deposit_amount: number;
  timezone: string;
}

export const OwnerSettingsScreen = () => {
  const { salonId, hasPermission } = useAuth();
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<Partial<SalonSettings>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [salonId]);

  const loadSettings = async () => {
    try {
      if (!salonId) return;

      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('id', salonId)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load salon settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      if (!salonId) return;

      const { error } = await supabase
        .from('salons')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', salonId);

      if (error) throw error;

      Alert.alert('Success', 'Settings updated successfully');
      setShowEditModal(false);
      loadSettings();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    if (!settings) return;
    setFormData({ ...settings });
    setShowEditModal(true);
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value: boolean | string,
    onToggle?: (value: boolean) => void,
    editable: boolean = true
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {typeof value === 'boolean' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          disabled={!editable}
        />
      ) : (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load settings</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Salon Settings</Text>
        {hasPermission('salon.manage') && (
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Business Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Information</Text>
        {renderSettingItem('Salon Name', 'Your salon name', settings.name, undefined, false)}
        {renderSettingItem('Phone', 'Contact phone', settings.phone, undefined, false)}
        {renderSettingItem('Email', 'Contact email', settings.email, undefined, false)}
        {renderSettingItem('Address', 'Physical location', settings.address, undefined, false)}
        {renderSettingItem('Location', `${settings.city}, ${settings.state}`, '', undefined, false)}
      </View>

      {/* Booking Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking Settings</Text>
        {renderSettingItem(
          'Auto Reminders',
          'Send automatic reminders to customers',
          settings.auto_reminders,
          undefined,
          false
        )}
        {renderSettingItem(
          'Booking Buffer',
          'Time between appointments',
          `${settings.booking_buffer_minutes} minutes`,
          undefined,
          false
        )}
        {renderSettingItem(
          'Advance Booking',
          'How far ahead customers can book',
          `${settings.advance_booking_days} days`,
          undefined,
          false
        )}
        {renderSettingItem(
          'Require Deposit',
          'Require deposit for booking',
          settings.require_deposit,
          undefined,
          false
        )}
        {settings.require_deposit && renderSettingItem(
          'Deposit Amount',
          'Required deposit amount',
          `$${settings.deposit_amount.toFixed(2)}`,
          undefined,
          false
        )}
      </View>

      {/* Financial Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Settings</Text>
        {renderSettingItem(
          'Tax Rate',
          'Sales tax percentage',
          `${(settings.tax_rate * 100).toFixed(1)}%`,
          undefined,
          false
        )}
        {renderSettingItem(
          'Suggested Gratuity',
          'Default gratuity rate',
          `${(settings.gratuity_rate * 100).toFixed(0)}%`,
          undefined,
          false
        )}
      </View>

      {/* Policies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Policies</Text>
        <View style={styles.policyContainer}>
          <Text style={styles.policyTitle}>Cancellation Policy</Text>
          <Text style={styles.policyText}>{settings.cancellation_policy || 'Not set'}</Text>
        </View>
      </View>

      {/* System Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System</Text>
        {renderSettingItem(
          'Timezone',
          'Your local timezone',
          settings.timezone,
          undefined,
          false
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {hasPermission('salon.manage') && (
          <>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Export Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Import Services</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Backup Settings</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Edit Settings Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Salon Settings</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Salon Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Salon name"
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
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="salon@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="123 Main St"
                multiline
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="City"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                  placeholder="State"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>ZIP Code</Text>
                <TextInput
                  style={styles.input}
                  value={formData.zip_code}
                  onChangeText={(text) => setFormData({ ...formData, zip_code: text })}
                  placeholder="12345"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Country</Text>
                <TextInput
                  style={styles.input}
                  value={formData.country}
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                  placeholder="Country"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tax Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={formData.tax_rate?.toString()}
                onChangeText={(text) => setFormData({ ...formData, tax_rate: parseFloat(text) / 100 })}
                placeholder="8.5"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Booking Buffer (minutes)</Text>
              <TextInput
                style={styles.input}
                value={formData.booking_buffer_minutes?.toString()}
                onChangeText={(text) => setFormData({ ...formData, booking_buffer_minutes: parseInt(text) })}
                placeholder="15"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Advance Booking (days)</Text>
              <TextInput
                style={styles.input}
                value={formData.advance_booking_days?.toString()}
                onChangeText={(text) => setFormData({ ...formData, advance_booking_days: parseInt(text) })}
                placeholder="30"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
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
  editButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007bff',
  },
  policyContainer: {
    padding: 20,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  policyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#6c757d',
    marginHorizontal: 20,
    marginVertical: 8,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#dc3545',
    marginTop: 50,
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
  inputRow: {
    flexDirection: 'row',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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