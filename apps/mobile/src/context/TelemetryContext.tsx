import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useUi } from './UiContext';
import { useAnalyticsData } from '../hooks/appData/useAnalyticsData';

export type TelemetryContextType = ReturnType<typeof useAnalyticsData>;

const TelemetryContext = createContext<TelemetryContextType | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const ui = useUi();

  const analyticsData = useAnalyticsData({
    trpcRequest: auth.trpcRequest,
    isAuthenticated: auth.isAuthenticated,
    activeTab: ui.activeSection,
  });

  return <TelemetryContext.Provider value={analyticsData}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry(): TelemetryContextType {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}

