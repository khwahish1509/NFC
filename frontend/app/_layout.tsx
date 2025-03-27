import React from 'react';
import { Stack } from 'expo-router';
import { AppProvider } from '../contexts/AppContext';
import { StatusBar } from 'expo-status-bar';

// The root layout defines the structure shared by all routes
export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f5f5f5' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="farmer" />
        <Stack.Screen name="retailer" />
      </Stack>
    </AppProvider>
  );
}
