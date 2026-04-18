// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: { primary: '#10b981', background: '#0a0a0f', card: '#12121a', text: '#e4e4e7', border: '#1e1e2a', notification: '#10b981' },
        }}
      >
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
