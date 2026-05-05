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
  Image,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../../services/supabase';

interface VendorProfile {
  id: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  business_name: string;
  contact_person: string;
  business_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  tax_id?: string;
  payment_terms: string;
  is_active: boolean;
  rating: number;
  total_orders: number;
  total_revenue: number;
  bio?: string;
  specialties: string[];
}

export const VendorProfileScreen = () => {
  const { user, salonId, signOut } = useAuth();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBio, setEditingBio] = useState('');
  const [editingSpecialties, setEditingSpecialties] = useState('');

  useEffect(() => {
    loadProfile();
  }, [salonId, user?.id]);

  const loadProfile = async () => {
    try {
      if (!salonId || !user?.id) return;

      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          profiles(first_name, last_name, email, phone)
        `)
        .eq('salon_id', salonId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProfile({
        ...data,
        bio: data.bio || '',
        specialties: data.specialties || [],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (!profile || !user?.id) return;

      const { error } = await supabase
        .from('vendors')
        .update({
          bio: editingBio,
          specialties: editingSpecialties.split(',').map(s => s.trim()).filter(Boolean),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      setShowEditModal(false);
      loadProfile();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const openEditModal = () => {
    if (!profile) return;
    setEditingBio(profile.bio);
    setEditingSpecialties(profile.specialties.join(', '));
    setShowEditModal(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={`full-${i}`} style={styles.star}>★</Text>);
    }
    if (hasHalfStar) {
      stars.push(<Text key="half" style={styles.star}>★</Text>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Text key={`empty-${i}`} style={styles.emptyStar}>★</Text>);
    }

    return stars;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../../../../assets/default-avatar.png')}
            style={styles.avatar}
          />
          <View style={[styles.statusBadge, profile.is_active ? styles.activeStatus : styles.inactiveStatus]}>
            <Text style={styles.statusText}>
              {profile.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <Text style={styles.profileName}>{profile.business_name}</Text>
        <Text style={styles.profileRole}>Vendor</Text>
        <View style={styles.ratingContainer}>
          {renderStars(profile.rating)}
          <Text style={styles.ratingText}>({profile.rating.toFixed(1)})</Text>
        </View>
      </View>

      {/* Business Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contact Person</Text>
          <Text style={styles.infoValue}>{profile.contact_person}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{profile.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{profile.phone}</Text>
        </View>
        {profile.website && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Website</Text>
            <Text style={styles.infoValue}>{profile.website}</Text>
          </View>
        )}
        {profile.tax_id && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tax ID</Text>
            <Text style={styles.infoValue}>{profile.tax_id}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Terms</Text>
          <Text style={styles.infoValue}>{profile.payment_terms}</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Address</Text>
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>{profile.business_address}</Text>
          <Text style={styles.addressText}>
            {profile.city}, {profile.state} {profile.zip_code}
          </Text>
          <Text style={styles.addressText}>{profile.country}</Text>
        </View>
      </View>

      {/* Professional Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Information</Text>
        {profile.specialties.length > 0 && (
          <View style={styles.specialtiesContainer}>
            <Text style={styles.infoLabel}>Specialties</Text>
            <View style={styles.specialtiesChips}>
              {profile.specialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyChip}>
                  <Text style={styles.specialtyChipText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {profile.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.infoLabel}>Bio</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>{profile.total_orders}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>${profile.total_revenue.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>
              ${profile.total_orders > 0 ? (profile.total_revenue / profile.total_orders).toFixed(0) : '0'}
            </Text>
            <Text style={styles.metricLabel}>Avg Order</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={openEditModal}>
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut}>
          <Text style={styles.actionButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editingBio}
                onChangeText={setEditingBio}
                placeholder="Tell us about your business..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Specialties</Text>
              <TextInput
                style={styles.input}
                value={editingSpecialties}
                onChangeText={setEditingSpecialties}
                placeholder="e.g., Hair Products, Equipment, Furniture"
              />
              <Text style={styles.inputHint}>Separate specialties with commas</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#dc3545',
    marginTop: 50,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatus: {
    backgroundColor: '#28a745',
  },
  inactiveStatus: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    color: '#ffc107',
    fontSize: 16,
  },
  emptyStar: {
    color: '#e0e0e0',
    fontSize: 16,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  addressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  specialtiesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specialtiesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  specialtyChip: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  bioContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    padding: 20,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#007bff',
    marginHorizontal: 20,
    marginVertical: 8,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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