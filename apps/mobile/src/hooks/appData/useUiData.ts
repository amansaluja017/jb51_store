import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import { TabType } from '../../components/NavigationTabBar';
import { CustomAlertConfig } from '../../components/CustomAlert';
import { ToastConfig, ToastType } from '../../components/ToastNotification';
import { triggerHaptic } from '../../utils/haptics';

interface UseUiDataProps {
  trpcRequest: <T = unknown>(path: string, options?: { method?: 'GET' | 'POST'; body?: unknown; input?: unknown }) => Promise<T>;
}

export function useUiData({ trpcRequest }: UseUiDataProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Standby');
  const [drawerMenuOpen, setDrawerMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  const tabValues = useRef<Record<TabType, Animated.Value>>({
    dashboard: new Animated.Value(activeTab === 'dashboard' ? 1 : 0),
    catalogue: new Animated.Value(activeTab === 'catalogue' ? 1 : 0),
    inventory: new Animated.Value(activeTab === 'inventory' ? 1 : 0),
    analytics: new Animated.Value(activeTab === 'analytics' ? 1 : 0),
    invoices: new Animated.Value(activeTab === 'invoices' ? 1 : 0),
    reviews: new Animated.Value(activeTab === 'reviews' ? 1 : 0),
  }).current;

  useEffect(() => {
    const tabs: TabType[] = ['dashboard', 'catalogue', 'inventory', 'analytics', 'invoices', 'reviews'];
    Animated.parallel(
      tabs.map(tab =>
        Animated.spring(tabValues[tab], {
          toValue: activeTab === tab ? 1 : 0,
          damping: 20,
          stiffness: 150,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [activeTab]);

  // Modal alert configuration (for confirmations and blocking errors)
  const [alertConfig, setAlertConfig] = useState<CustomAlertConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Floating toast notification configuration (for non-blocking feedback)
  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showToast = useCallback((
    title: string,
    message?: string,
    type: ToastType = 'info',
    durationMs?: number
  ) => {
    setToastConfig({
      visible: true,
      title,
      message,
      type,
      durationMs,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  const showAlert = useCallback((
    title: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'confirm' = 'info',
    onConfirm?: () => void
  ) => {
    // Route non-blocking success and info messages to the lightweight Toast system with haptics
    if ((type === 'success' || type === 'info') && !onConfirm) {
      showToast(title, message, type === 'success' ? 'success' : 'info');
      return;
    }

    // Critical errors or confirmation dialogs trigger a warning/error haptic and show the modal
    if (type === 'error') {
      triggerHaptic('error');
    } else if (type === 'confirm') {
      triggerHaptic('warning');
    }

    setAlertConfig({ visible: true, title, message, type, onConfirm });
  }, [showToast]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Pinging server...');
    try {
      await trpcRequest('health');
      setSyncMessage('Server online');
      showToast('Server Online', 'Connected to JB51 API backend', 'success');
    } catch {
      setSyncMessage('Server offline - Sandbox active');
      showToast('Server Offline', 'Working in offline / local cache mode', 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    tabValues,
    alertConfig,
    setAlertConfig,
    toastConfig,
    setToastConfig,
    showToast,
    hideToast,
    showAlert,
    isSyncing,
    setIsSyncing,
    syncMessage,
    setSyncMessage,
    handleManualSync,
    drawerMenuOpen,
    setDrawerMenuOpen,
    accountModalOpen,
    setAccountModalOpen,
  };
}

