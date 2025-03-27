import React, { createContext, useState, useContext, ReactNode } from 'react';

type UserRole = 'farmer' | 'retailer';

interface AppContextState {
  userRole: UserRole | null;
  setUserRole: (role: UserRole) => void;
  apiBaseUrl: string;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  // In a real app, this would be set based on environment and would use .env files
  const apiBaseUrl = 'http://192.168.1.100:5000/api';

  return (
    <AppContext.Provider value={{ userRole, setUserRole, apiBaseUrl }}>
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