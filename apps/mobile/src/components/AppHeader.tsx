import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MessageCircle, User, LogOut } from 'lucide-react-native';
import { TabType } from './NavigationTabBar';
import styles from '../styles/App.styles';

export interface AppHeaderProps {
  activeTab: TabType;
  pendingInquiriesCount: number;
  onOpenInquiries: () => void;
  onOpenAccount: () => void;
  onLogout: () => void;
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
      return 'Atelier Portal';
  }
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  pendingInquiriesCount,
  onOpenInquiries,
  onOpenAccount,
  onLogout,
}) => {
  return (
    <View style={styles.appHeader}>
      <View style={styles.headerTitleWrapper}>
        <Text style={styles.headerSubtitle}>JB51 Atelier</Text>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {getTabTitle(activeTab)}
        </Text>
      </View>
      <View style={styles.headerRightActions}>
        <TouchableOpacity
          onPress={onOpenInquiries}
          style={[styles.headerActionBtn, pendingInquiriesCount > 0 && styles.headerActionBtnActive]}
          accessibilityLabel="Customer Inquiries"
          accessibilityRole="button"
        >
          <MessageCircle size={17} color={pendingInquiriesCount > 0 ? '#FF5E36' : '#09090b'} />
          {pendingInquiriesCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {pendingInquiriesCount > 9 ? '9+' : pendingInquiriesCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenAccount}
          style={styles.headerActionBtn}
          accessibilityLabel="Account Settings"
          accessibilityRole="button"
        >
          <User size={18} color="#09090b" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onLogout}
          style={styles.logoutBtn}
          accessibilityLabel="Log out"
          accessibilityRole="button"
        >
          <LogOut size={16} color="#71717a" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AppHeader;
