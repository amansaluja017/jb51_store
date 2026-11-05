import React, { createContext, useContext, useMemo } from 'react';
import { useAuthData } from '../hooks/appData/useAuthData';

export type AuthContextType = ReturnType<typeof useAuthData> & {
  isSuperAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  showAlert?: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
  onLogoutCleanup?: () => void;
}

export function AuthProvider({ children, showAlert, onLogoutCleanup }: AuthProviderProps) {
  const authData = useAuthData({ showAlert, onLogoutCleanup });

  const isSuperAdmin = authData.currentUser?.role === 'superadmin';

  const value = useMemo<AuthContextType>(
    () => ({
      ...authData,
      isSuperAdmin,
    }),
    [authData, isSuperAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const useAuthContext = useAuth;

