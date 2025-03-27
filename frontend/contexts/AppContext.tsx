import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the app context type
interface AppContextType {
  apiUrl: string;
  userRole: 'farmer' | 'retailer' | null;
  setUserRole: (role: 'farmer' | 'retailer' | null) => void;
}

// Create context with default values
const AppContext = createContext<AppContextType>({
  apiUrl: '',
  userRole: null,
  setUserRole: () => {},
});

// Safe check for web environment
const isWebEnvironment = () => {
  try {
    return Platform.OS === 'web';
  } catch (error) {
    return false;
  }
};

// Define the provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<'farmer' | 'retailer' | null>(null);

  // Define API URL based on platform
  const apiUrl = isWebEnvironment()
    ? 'http://localhost:5000/api' // Web development URL
    : 'http://10.0.0.42:5000/api'; // Mobile device URL (using your IP)

  // Load saved user role from AsyncStorage on app start
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem('userRole');
        if (savedRole === 'farmer' || savedRole === 'retailer') {
          setUserRole(savedRole);
        }
      } catch (error) {
        console.error('Error loading user role:', error);
      }
    };

    loadUserRole();
  }, []);

  // Save user role to AsyncStorage when it changes
  useEffect(() => {
    const saveUserRole = async () => {
      try {
        if (userRole) {
          await AsyncStorage.setItem('userRole', userRole);
        } else {
          await AsyncStorage.removeItem('userRole');
        }
      } catch (error) {
        console.error('Error saving user role:', error);
      }
    };

    saveUserRole();
  }, [userRole]);

  return (
    <AppContext.Provider
      value={{
        apiUrl,
        userRole,
        setUserRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => useContext(AppContext); 