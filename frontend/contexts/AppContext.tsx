import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { setApiBaseUrl } from '../services/APIService';

type UserRole = 'farmer' | 'retailer';

interface AppContextState {
  userRole: UserRole | null;
  setUserRole: (role: UserRole) => void;
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  // Set a default API URL based on environment
  // In a real app, this would come from environment variables or configuration
  const defaultApiUrl = Platform.OS === 'web' 
    ? 'http://localhost:5000/api' 
    : 'http://10.0.2.2:5000/api'; // 10.0.2.2 is the special IP to access the host from an Android emulator
  
  const [apiBaseUrl, setApiBaseUrlState] = useState(defaultApiUrl);
  
  // Update the API URL whenever it changes in the context
  const updateApiBaseUrl = (url: string) => {
    setApiBaseUrlState(url);
    setApiBaseUrl(url); // This updates the URL in the API service
  };

  // Initialize API URL
  useEffect(() => {
    setApiBaseUrl(apiBaseUrl);
  }, []);

  return (
    <AppContext.Provider 
      value={{ 
        userRole, 
        setUserRole, 
        apiBaseUrl, 
        setApiBaseUrl: updateApiBaseUrl 
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextState => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 