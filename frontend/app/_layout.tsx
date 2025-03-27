import { Stack } from 'expo-router';
import React from 'react';
import { AppProvider } from '../contexts/AppContext';
import { StatusBar } from 'expo-status-bar';

export default function AppLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
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
