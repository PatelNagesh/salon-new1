import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Placeholder screens
const InventoryScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Inventory</Text>
  </View>
);

const OrdersScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>Orders</Text>
  </View>
);

const ProductsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>Products</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>My Profile</Text>
  </View>
);

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
        component={InventoryScreen}
        options={{ title: 'Inventory' }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: 'Products' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};