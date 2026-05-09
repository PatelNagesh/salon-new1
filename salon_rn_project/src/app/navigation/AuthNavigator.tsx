import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { Alert, View, Text, TextInput, TouchableOpacity } from 'react-native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();


export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreenWrapper} />
      <Stack.Screen name="Register" component={RegisterScreenWrapper} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreenWrapper} />
    </Stack.Navigator>
  );
};

// Wrapper components to handle navigation
const LoginScreenWrapper = ({ navigation }: any) => {
  const handleRegisterPress = () => navigation.navigate('Register');
  const handleForgotPasswordPress = () => navigation.navigate('ForgotPassword');

  return (
    <LoginScreen
      onRegisterPress={handleRegisterPress}
      onForgotPasswordPress={handleForgotPasswordPress}
    />
  );
};

const RegisterScreenWrapper = ({ navigation }: any) => {
  const handleLoginPress = () => navigation.navigate('Login');
  const handleBackPress = () => navigation.goBack();

  return (
    <RegisterScreen
      onLoginPress={handleLoginPress}
      onBackPress={handleBackPress}
    />
  );
};

const ForgotPasswordScreenWrapper = ({ navigation }: any) => {
  const handleBackPress = () => navigation.goBack();

  return <ForgotPasswordScreen onBackPress={handleBackPress} />;
};

// Placeholder ForgotPasswordScreen
const ForgotPasswordScreen = ({ onBackPress }: { onBackPress: () => void }) => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { resetPassword } = require('../../providers/AuthProvider').useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert('Success', 'Password reset email sent! Please check your inbox.');
      onBackPress();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Reset Password
      </Text>
      <Text style={{ marginBottom: 20 }}>
        Enter your email address and we'll send you a link to reset your password.
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          fontSize: 16,
        }}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={{
          backgroundColor: '#007bff',
          padding: 14,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 20,
        }}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
          {loading ? 'Sending...' : 'Send Reset Email'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onBackPress}>
        <Text style={{ color: '#007bff', textAlign: 'center' }}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};