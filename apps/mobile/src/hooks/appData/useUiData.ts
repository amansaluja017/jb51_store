import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { TabType } from '../../components/NavigationTabBar';
import { CustomAlertConfig } from '../../components/CustomAlert';

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

  const [alertConfig, setAlertConfig] = useState<CustomAlertConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'confirm' = 'info',
    onConfirm?: () => void
  ) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Pinging server...');
    try {
      await trpcRequest('health');
      setSyncMessage('Server online');
    } catch {
      setSyncMessage('Server offline - Sandbox active');
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

