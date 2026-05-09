/**
 * Salon Management System - Main App Entry Point
 *
 * This is the main entry point for the salon management system.
 * It integrates authentication, navigation, and error handling.
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/app/providers/AuthProvider';
import { AppNavigator } from './src/app/navigation/AppNavigator';
import { ErrorBoundary } from './src/app/components/ErrorBoundary';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ErrorBoundary>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
