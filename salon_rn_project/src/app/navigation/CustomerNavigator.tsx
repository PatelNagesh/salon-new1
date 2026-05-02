import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Placeholder screens
const BookScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Book Appointment</Text>
  </View>
);

const AppointmentsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>My Appointments</Text>
  </View>
);

const ServicesScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>Services</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>My Profile</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export const CustomerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Book"
        component={BookScreen}
        options={{ title: 'Book' }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{ title: 'Services' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};