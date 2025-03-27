import { Stack } from 'expo-router';
import React from 'react';
import { AppProvider } from '../contexts/AppContext';
import { StatusBar } from 'expo-status-bar';

// This is the root layout component
export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="farmer"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="retailer"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </AppProvider>
  );
}
