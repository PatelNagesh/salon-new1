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

interface LoginScreenProps {
  onRegisterPress: () => void;
  onForgotPasswordPress: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onRegisterPress,
  onForgotPasswordPress,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, selectedRole);
      // Navigation will be handled by auth state change
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'STAFF', label: 'Staff Member' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'OWNER', label: 'Salon Owner' },
    { value: 'VENDOR', label: 'Vendor' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

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
            <Text style={styles.label}>Select Your Role</Text>
            <View style={styles.roleContainer}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleButton,
                    selectedRole === role.value && styles.roleButtonSelected,
                  ]}
                  onPress={() => setSelectedRole(role.value)}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      selectedRole === role.value && styles.roleButtonTextSelected,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onForgotPasswordPress}>
            <Text style={styles.forgotPassword}>Forgot your password?</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onRegisterPress}>
              <Text style={styles.registerLink}>Sign Up</Text>
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
    justifyContent: 'center',
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 32,
    textAlign: 'center',
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
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
    minWidth: 100,
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#333',
  },
  roleButtonTextSelected: {
    color: '#fff',
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
  forgotPassword: {
    textAlign: 'center',
    marginTop: 16,
    color: '#007bff',
    fontSize: 14,
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