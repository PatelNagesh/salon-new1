import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-vector-icons/MaterialIcons';
import { OwnerDashboardScreen } from '../screens/owner/OwnerDashboardScreen';
import { OwnerStaffScreen } from '../screens/owner/OwnerStaffScreen';
import { OwnerServicesScreen } from '../screens/owner/OwnerServicesScreen';
import { OwnerReportsScreen } from '../screens/owner/OwnerReportsScreen';
import { OwnerSettingsScreen } from '../screens/owner/OwnerSettingsScreen';

const Tab = createBottomTabNavigator();

export const OwnerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'Staff':
              iconName = 'people';
              break;
            case 'Services':
              iconName = 'content-cut';
              break;
            case 'Reports':
              iconName = 'bar-chart';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          // You can return any component that you like here!
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={OwnerDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Staff"
        component={OwnerStaffScreen}
        options={{ title: 'Staff' }}
      />
      <Tab.Screen
        name="Services"
        component={OwnerServicesScreen}
        options={{ title: 'Services' }}
      />
      <Tab.Screen
        name="Reports"
        component={OwnerReportsScreen}
        options={{ title: 'Reports' }}
      />
      <Tab.Screen
        name="Settings"
        component={OwnerSettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};