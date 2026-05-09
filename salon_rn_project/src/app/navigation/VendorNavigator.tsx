import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VendorInventoryScreen } from '../screens/vendor/VendorInventoryScreen';
import { VendorOrdersScreen } from '../screens/vendor/VendorOrdersScreen';
import { VendorProductsScreen } from '../screens/vendor/VendorProductsScreen';
import { VendorProfileScreen } from '../screens/vendor/VendorProfileScreen';

const Tab = createBottomTabNavigator();

export const VendorNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Inventory"
        component={VendorInventoryScreen}
        options={{ title: 'Inventory' }}
      />
      <Tab.Screen
        name="Orders"
        component={VendorOrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen
        name="Products"
        component={VendorProductsScreen}
        options={{ title: 'Products' }}
      />
      <Tab.Screen
        name="Profile"
        component={VendorProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};