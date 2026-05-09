import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../../services/supabase';

interface StaffProfile {
  id: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  role: string;
  hourly_rate: number;
  commission_rate: number;
  is_active: boolean;
  hire_date: string;
  bio?: string;
  specialties: string[];
  certifications: Array<{
    name: string;
    issued_date: string;
    expiry_date?: string;
  }>;
  availability: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
}

export const StaffProfileScreen = () => {
  const { user, salonId, logout } = useAuth();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingBio, setEditingBio] = useState('');
  const [editingSpecialties, setEditingSpecialties] = useState('');

  useEffect(() => {
    loadProfile();
  }, [salonId, user?.id]);

  const loadProfile = async () => {
    try {
      if (!salonId || !user?.id) return;

      const { data, error } = await supabase
        .from('staff_members')
        .select(`
          *,
          profiles(first_name, last_name, email, phone),
          staff_certifications(
            name,
            issued_date,
            expiry_date
          ),
          staff_availability(
            day_of_week,
            start_time,
            end_time
          )
        `)
        .eq('salon_id', salonId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Transform the data to match the interface
      const transformedProfile: StaffProfile = {
        ...data,
        bio: data.bio || '',
        specialties: data.specialties || [],
        certifications: data.staff_certifications || [],
        availability: data.staff_availability || [],
      };

      setProfile(transformedProfile);
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
        .from('staff_members')
        .update({
          bio: editingBio,
          specialties: editingSpecialties.split(',').map((s: string) => s.trim()).filter(Boolean),
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
          onPress: logout,
        },
      ]
    );
  };

  const openEditModal = () => {
    if (!profile) return;
    setEditingBio(profile.bio || '');
    setEditingSpecialties(profile.specialties.join(', '));
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
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
        <Text style={styles.profileName}>
          {profile.profiles.first_name} {profile.profiles.last_name}
        </Text>
        <Text style={styles.profileRole}>{profile.role}</Text>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{profile.profiles.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{profile.profiles.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hire Date</Text>
          <Text style={styles.infoValue}>{formatDate(profile.hire_date)}</Text>
        </View>
      </View>

      {/* Professional Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hourly Rate</Text>
          <Text style={styles.infoValue}>${profile.hourly_rate.toFixed(2)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Commission Rate</Text>
          <Text style={styles.infoValue}>{profile.commission_rate}%</Text>
        </View>
        {profile.specialties.length > 0 && (
          <View style={styles.specialtiesContainer}>
            <Text style={styles.infoLabel}>Specialties</Text>
            <View style={styles.specialtiesChips}>
              {profile.specialties.map((specialty: any, index: any) => (
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

      {/* Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        {profile.availability.length > 0 ? (
          profile.availability.map((avail: { day_of_week: number; start_time: string; end_time: string; }, index: any) => (
            <View key={index} style={styles.availabilityRow}>
              <Text style={styles.availabilityDay}>{getDayName(avail.day_of_week)}</Text>
              <Text style={styles.availabilityTime}>
                {formatTime(avail.start_time)} - {formatTime(avail.end_time)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noAvailability}>No availability set</Text>
        )}
      </View>

      {/* Certifications */}
      {profile.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {profile.certifications.map((cert: { name: any; issued_date: string; expiry_date: string; }, index: any) => (
            <View key={index} style={styles.certificationCard}>
              <Text style={styles.certificationName}>{cert.name}</Text>
              <Text style={styles.certificationDate}>
                Issued: {formatDate(cert.issued_date)}
                {cert.expiry_date && ` • Expires: ${formatDate(cert.expiry_date)}`}
              </Text>
            </View>
          ))}
        </View>
      )}

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
                placeholder="Tell us about yourself..."
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
                placeholder="e.g., Hair Color, Cuts, Styling"
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
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  availabilityDay: {
    fontSize: 16,
    color: '#333',
    width: 100,
  },
  availabilityTime: {
    fontSize: 16,
    color: '#666',
  },
  noAvailability: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  certificationCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
  },
  certificationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  certificationDate: {
    fontSize: 14,
    color: '#666',
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