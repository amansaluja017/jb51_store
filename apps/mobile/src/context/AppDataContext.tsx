import React, { createContext, useContext } from 'react';
import { useAppData } from '../hooks/useAppData';

export type AppDataContextType = ReturnType<typeof useAppData>;

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const data = useAppData();
  return <AppDataContext.Provider value={data}>{children}</AppDataContext.Provider>;
}

export function useAppDataContext(): AppDataContextType {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppDataContext must be used within an AppDataProvider');
  }
  return context;
}

