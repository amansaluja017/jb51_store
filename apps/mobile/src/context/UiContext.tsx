import React, { createContext, useContext, useMemo } from 'react';
import { usePathname } from 'expo-router';
import { useAuth } from './AuthContext';
import { useUiData } from '../hooks/appData/useUiData';
import { TabType } from '../components/NavigationTabBar';
import { getTabFromPathname } from '../utils/navigation';

export type UiContextType = ReturnType<typeof useUiData> & {
  activeSection: TabType;
};

const UiContext = createContext<UiContextType | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const pathname = usePathname();

  const uiData = useUiData({
    trpcRequest: auth.trpcRequest,
  });

  const activeSection = useMemo<TabType>(() => {
    return getTabFromPathname(pathname);
  }, [pathname]);

  const value = useMemo<UiContextType>(() => ({
    ...uiData,
    activeSection,
  }), [uiData, activeSection]);

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextType {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within a UiProvider');
  }
  return context;
}

