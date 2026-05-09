import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StaffScheduleScreen } from '../screens/staff/StaffScheduleScreen';
import { StaffAppointmentsScreen } from '../screens/staff/StaffAppointmentsScreen';
import { StaffClientsScreen } from '../screens/staff/StaffClientsScreen';
import { StaffProfileScreen } from '../screens/staff/StaffProfileScreen';

const Tab = createBottomTabNavigator();

export const StaffNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Schedule':
              iconName = 'schedule';
              break;
            case 'Appointments':
              iconName = 'event';
              break;
            case 'Clients':
              iconName = 'people';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Schedule"
        component={StaffScheduleScreen}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen
        name="Appointments"
        component={StaffAppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Tab.Screen
        name="Clients"
        component={StaffClientsScreen}
        options={{ title: 'Clients' }}
      />
      <Tab.Screen
        name="Profile"
        component={StaffProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};