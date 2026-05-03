import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomerBookingScreen } from '../screens/customer/CustomerBookingScreen';
import { CustomerHistoryScreen } from '../screens/customer/CustomerHistoryScreen';
import { CustomerProfileScreen } from '../screens/customer/CustomerProfileScreen';
import { CustomerSettingsScreen } from '../screens/customer/CustomerSettingsScreen';

const Tab = createBottomTabNavigator();

export const CustomerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tab.Screen
        name="Book"
        component={CustomerBookingScreen}
        options={{
          title: 'Book',
          tabBarLabel: 'Book',
        }}
      />
      <Tab.Screen
        name="History"
        component={CustomerHistoryScreen}
        options={{
          title: 'History',
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={CustomerSettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};