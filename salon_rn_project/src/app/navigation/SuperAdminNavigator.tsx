import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../providers/AuthProvider';

// Placeholder screens for Super Admin
const AdminDashboardScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Super Admin Dashboard</Text>
    <Text style={styles.subtitle}>System Overview & Management</Text>
  </View>
);

const SalonsManagementScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Salons Management</Text>
    <Text style={styles.subtitle}>View and manage all salons</Text>
  </View>
);

const UsersManagementScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Users Management</Text>
    <Text style={styles.subtitle}>Manage system users and permissions</Text>
  </View>
);

const SystemSettingsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>System Settings</Text>
    <Text style={styles.subtitle}>Configure system-wide settings</Text>
  </View>
);

const ReportsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>System Reports</Text>
    <Text style={styles.subtitle}>View analytics and reports</Text>
  </View>
);

const Stack = createNativeStackNavigator();

export const SuperAdminNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen
        name="SalonsManagement"
        component={SalonsManagementScreen}
        options={{ title: 'Manage Salons' }}
      />
      <Stack.Screen
        name="UsersManagement"
        component={UsersManagementScreen}
        options={{ title: 'Manage Users' }}
      />
      <Stack.Screen
        name="SystemSettings"
        component={SystemSettingsScreen}
        options={{ title: 'System Settings' }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});