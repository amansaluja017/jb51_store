import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu } from 'lucide-react-native';
import { TabType } from './NavigationTabBar';
import styles from '../styles/App.styles';

export interface AppHeaderProps {
  activeTab: TabType;
  onOpenMenu: () => void;
}

const getTabTitle = (tab: TabType): string => {
  switch (tab) {
    case 'dashboard':
    case 'analytics':
      return 'Overview';
    case 'catalogue':
      return 'Products List';
    case 'inventory':
      return 'Inventory';
    case 'invoices':
      return 'Invoice Creator';
    case 'reviews':
      return 'Customer Reviews';
    default:
      return 'Store Portal';
  }
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onOpenMenu,
}) => {
  return (
    <View style={styles.appHeader}>
      <TouchableOpacity
        onPress={onOpenMenu}
        style={styles.hamburgerBtn}
        accessibilityLabel="Navigation Menu"
        accessibilityRole="button"
      >
        <Menu size={20} color="#09090b" />
      </TouchableOpacity>
      <View style={styles.headerTitleWrapper}>
        <Text style={styles.headerSubtitle}>JB51</Text>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {getTabTitle(activeTab)}
        </Text>
      </View>
    </View>
  );
};

export default AppHeader;
