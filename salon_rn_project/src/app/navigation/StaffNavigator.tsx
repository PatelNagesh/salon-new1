import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../providers/AuthProvider';

// Placeholder screens
const ScheduleScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>My Schedule</Text>
  </View>
);

const AppointmentsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>Today's Appointments</Text>
  </View>
);

const ClientsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>My Clients</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>My Profile</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export const StaffNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{ title: 'Clients' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};