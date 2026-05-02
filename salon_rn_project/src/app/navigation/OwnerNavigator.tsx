import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-vector-icons';
import { useAuth } from '../../providers/AuthProvider';

// Placeholder screens - implement these later
const DashboardScreen = () => {
  const { hasPermission } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Owner Dashboard</Text>
      {hasPermission('reports.view') && <Text>Financial Reports: ✅</Text>}
      {hasPermission('staff.manage') && <Text>Staff Management: ✅</Text>}
      {hasPermission('salon.manage') && <Text>Salon Settings: ✅</Text>}
    </View>
  );
};

const StaffScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>Staff Management</Text>
  </View>
);

const ScheduleScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>Schedule</Text>
  </View>
);

const ReportsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>Reports</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>Settings</Text>
  </View>
);

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
            case 'Schedule':
              iconName = 'calendar';
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
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Staff"
        component={StaffScreen}
        options={{ title: 'Staff' }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};