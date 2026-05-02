import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../providers/AuthProvider';
import { AuthNavigator } from './AuthNavigator';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import role-specific navigators (placeholders for now)
import { OwnerNavigator } from './OwnerNavigator';
import { StaffNavigator } from './StaffNavigator';
import { CustomerNavigator } from './CustomerNavigator';
import { VendorNavigator } from './VendorNavigator';
import { SuperAdminNavigator } from './SuperAdminNavigator';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Splash Screen Component
const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <ActivityIndicator size="large" color="#007bff" />
    <Text style={{ marginTop: 20, fontSize: 16, color: '#333' }}>Loading...</Text>
  </View>
);

export const AppNavigator = () => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <AuthNavigator />;
  }

  // Route to appropriate navigator based on role
  const getRoleNavigator = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <SuperAdminNavigator />;
      case 'OWNER':
      case 'MANAGER':
        return <OwnerNavigator />;
      case 'STAFF':
        return <StaffNavigator />;
      case 'VENDOR':
        return <VendorNavigator />;
      case 'CUSTOMER':
        return <CustomerNavigator />;
      default:
        // Fallback to customer navigator if role is not recognized
        return <CustomerNavigator />;
    }
  };

  return getRoleNavigator();
};