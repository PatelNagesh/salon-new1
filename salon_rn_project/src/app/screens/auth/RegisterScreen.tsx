import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { UserRole } from '../../../types/auth.types';

interface RegisterScreenProps {
  onLoginPress: () => void;
  onBackPress: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onLoginPress,
  onBackPress,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [salonName, setSalonName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (selectedRole === 'OWNER' && !salonName) {
      Alert.alert('Error', 'Salon name is required for owner registration');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, selectedRole, salonName || undefined);
      Alert.alert(
        'Success',
        'Registration successful! Please check your email to verify your account.',
        [{ text: 'OK', onPress: onLoginPress }]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string; description: string }[] = [
    { value: 'CUSTOMER', label: 'Customer', description: 'Book services and manage appointments' },
    { value: 'STAFF', label: 'Staff Member', description: 'Provide services to customers' },
    { value: 'MANAGER', label: 'Manager', description: 'Manage daily operations and staff' },
    { value: 'OWNER', label: 'Salon Owner', description: 'Own and manage a salon business' },
    { value: 'VENDOR', label: 'Vendor', description: 'Supply products to salons' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our salon management platform</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>I want to join as:</Text>
            <View style={styles.roleList}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleCard,
                    selectedRole === role.value && styles.roleCardSelected,
                  ]}
                  onPress={() => setSelectedRole(role.value)}
                >
                  <Text
                    style={[
                      styles.roleTitle,
                      selectedRole === role.value && styles.roleTitleSelected,
                    ]}
                  >
                    {role.label}
                  </Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedRole === 'OWNER' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Salon Name</Text>
              <TextInput
                style={styles.input}
                value={salonName}
                onChangeText={setSalonName}
                placeholder="Enter your salon name"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onLoginPress}>
              <Text style={styles.registerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  roleList: {
    gap: 12,
  },
  roleCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  roleCardSelected: {
    backgroundColor: '#e7f3ff',
    borderColor: '#007bff',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  roleTitleSelected: {
    color: '#007bff',
  },
  roleDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#6c757d',
    fontSize: 14,
  },
  registerLink: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
});