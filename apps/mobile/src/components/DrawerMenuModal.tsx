import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Users,
  Tag,
  MessageCircle,
  User,
  LogOut,
  ChevronRight,
  Package,
  FileText,
  Star,
  Sparkles,
  LayoutDashboard,
  Shirt,
  CreditCard,
} from 'lucide-react-native';
import { TabType } from './NavigationTabBar';
import { colors } from '../theme/colors';

export interface DrawerMenuModalProps {
  visible: boolean;
  activeTab: TabType;
  onClose: () => void;
  onOpenCustomers: () => void;
  onOpenCredits: () => void;
  onOpenCategories: () => void;
  onOpenInquiries: () => void;
  onOpenAccount: () => void;
  onSelectTab: (tab: TabType) => void;
  onLogout: () => void;
  customersCount: number;
  creditsDueCount?: number;
  pendingInquiriesCount: number;
  currentUser?: { email?: string; userName?: string } | null;
}

export const DrawerMenuModal: React.FC<DrawerMenuModalProps> = ({
  visible,
  activeTab,
  onClose,
  onOpenCustomers,
  onOpenCredits,
  onOpenCategories,
  onOpenInquiries,
  onOpenAccount,
  onSelectTab,
  onLogout,
  customersCount,
  creditsDueCount,
  pendingInquiriesCount,
  currentUser,
}) => {
  // Navigation sections with Overview prominently included
  const sections: {
    key: TabType;
    label: string;
    subtitle: string;
    icon: React.ComponentType<any>;
    isActive: boolean;
  }[] = [
    {
      key: 'dashboard',
      label: 'Overview',
      subtitle: 'Dashboard pulse & store performance',
      icon: LayoutDashboard,
      isActive: activeTab === 'dashboard' || activeTab === 'analytics',
    },
    {
      key: 'catalogue',
      label: 'Catalogue',
      subtitle: 'Products, suits & collections',
      icon: Shirt,
      isActive: activeTab === 'catalogue',
    },
    {
      key: 'inventory',
      label: 'Inventory',
      subtitle: 'Stock balances & transactions',
      icon: Package,
      isActive: activeTab === 'inventory',
    },
    {
      key: 'invoices',
      label: 'Invoices',
      subtitle: 'Invoice creator & order ledger',
      icon: FileText,
      isActive: activeTab === 'invoices',
    },
    {
      key: 'reviews',
      label: 'Reviews',
      subtitle: 'Customer ratings & feedback',
      icon: Star,
      isActive: activeTab === 'reviews',
    },
  ];

  const getActiveSectionName = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'analytics':
        return 'Overview';
      case 'catalogue':
        return 'Catalogue';
      case 'inventory':
        return 'Inventory';
      case 'invoices':
        return 'Invoices';
      case 'reviews':
        return 'Reviews';
      default:
        return 'Overview';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={drawerStyles.overlay}>
        {/* Backdrop tap to close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={drawerStyles.backdrop} />
        </TouchableWithoutFeedback>

        <SafeAreaView edges={['top', 'bottom', 'left']} style={drawerStyles.drawerContainer}>
          {/* Header */}
          <View style={drawerStyles.drawerHeader}>
            <View>
              <View style={drawerStyles.brandBadge}>
                <Sparkles size={11} color={colors.primary.DEFAULT} />
                <Text style={drawerStyles.brandBadgeText}>ATELIER ADMIN</Text>
              </View>
              <Text style={drawerStyles.drawerTitle}>JB51 Store</Text>
              <Text style={drawerStyles.drawerSubtitle}>
                {currentUser?.email || currentUser?.userName || 'Administrator'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={drawerStyles.closeBtn}
              accessibilityLabel="Close Menu"
              accessibilityRole="button"
            >
              <X size={20} color="#71717a" />
            </TouchableOpacity>
          </View>

          {/* Current Section Active Status Pill */}
          <View style={drawerStyles.currentStatusBanner}>
            <Text style={drawerStyles.currentStatusLabel}>CURRENT SECTION</Text>
            <View style={drawerStyles.currentStatusPill}>
              <View style={drawerStyles.activeDot} />
              <Text style={drawerStyles.currentStatusText}>{getActiveSectionName()}</Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={drawerStyles.scrollContent}
          >
            {/* Primary Admin Actions */}
            <Text style={drawerStyles.sectionHeading}>MANAGEMENT</Text>

            {/* Manage Customers */}
            <TouchableOpacity
              style={drawerStyles.menuItem}
              onPress={() => {
                onClose();
                onOpenCustomers();
              }}
              activeOpacity={0.7}
            >
              <View style={drawerStyles.iconBox}>
                <Users size={18} color="#09090b" />
              </View>
              <View style={drawerStyles.menuItemContent}>
                <View style={drawerStyles.menuItemTitleRow}>
                  <Text style={drawerStyles.menuItemTitle}>Manage Customers</Text>
                  {customersCount > 0 && (
                    <View style={drawerStyles.counterBadge}>
                      <Text style={drawerStyles.counterBadgeText}>{customersCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={drawerStyles.menuItemDescription}>
                  View, add, edit, or remove client profiles
                </Text>
              </View>
              <ChevronRight size={18} color="#a1a1aa" />
            </TouchableOpacity>

            {/* Manage Credits */}
            <TouchableOpacity
              style={drawerStyles.menuItem}
              onPress={() => {
                onClose();
                onOpenCredits();
              }}
              activeOpacity={0.7}
            >
              <View style={drawerStyles.iconBox}>
                <CreditCard size={18} color="#09090b" />
              </View>
              <View style={drawerStyles.menuItemContent}>
                <View style={drawerStyles.menuItemTitleRow}>
                  <Text style={drawerStyles.menuItemTitle}>Manage Credits</Text>
                  {creditsDueCount !== undefined && creditsDueCount > 0 && (
                    <View style={drawerStyles.dueBadge}>
                      <Text style={drawerStyles.dueBadgeText}>{creditsDueCount} Due</Text>
                    </View>
                  )}
                </View>
                <Text style={drawerStyles.menuItemDescription}>
                  Customer balances, dues & payment tracking
                </Text>
              </View>
              <ChevronRight size={18} color="#a1a1aa" />
            </TouchableOpacity>

            {/* Product Categories */}
            <TouchableOpacity
              style={drawerStyles.menuItem}
              onPress={() => {
                onClose();
                onOpenCategories();
              }}
              activeOpacity={0.7}
            >
              <View style={drawerStyles.iconBox}>
                <Tag size={18} color="#09090b" />
              </View>
              <View style={drawerStyles.menuItemContent}>
                <Text style={drawerStyles.menuItemTitle}>Product Categories</Text>
                <Text style={drawerStyles.menuItemDescription}>
                  Organize collections & dress types
                </Text>
              </View>
              <ChevronRight size={18} color="#a1a1aa" />
            </TouchableOpacity>

            {/* Inquiries */}
            <TouchableOpacity
              style={drawerStyles.menuItem}
              onPress={() => {
                onClose();
                onOpenInquiries();
              }}
              activeOpacity={0.7}
            >
              <View style={drawerStyles.iconBox}>
                <MessageCircle
                  size={18}
                  color={pendingInquiriesCount > 0 ? '#FF5E36' : '#09090b'}
                />
              </View>
              <View style={drawerStyles.menuItemContent}>
                <View style={drawerStyles.menuItemTitleRow}>
                  <Text style={drawerStyles.menuItemTitle}>Customer Inquiries</Text>
                  {pendingInquiriesCount > 0 && (
                    <View style={drawerStyles.alertBadge}>
                      <Text style={drawerStyles.alertBadgeText}>
                        {pendingInquiriesCount} new
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={drawerStyles.menuItemDescription}>
                  Review client questions & bespoke orders
                </Text>
              </View>
              <ChevronRight size={18} color="#a1a1aa" />
            </TouchableOpacity>

            {/* Account Settings */}
            <TouchableOpacity
              style={drawerStyles.menuItem}
              onPress={() => {
                onClose();
                onOpenAccount();
              }}
              activeOpacity={0.7}
            >
              <View style={drawerStyles.iconBox}>
                <User size={18} color="#09090b" />
              </View>
              <View style={drawerStyles.menuItemContent}>
                <Text style={drawerStyles.menuItemTitle}>Account Settings</Text>
                <Text style={drawerStyles.menuItemDescription}>
                  Admin credentials & security
                </Text>
              </View>
              <ChevronRight size={18} color="#a1a1aa" />
            </TouchableOpacity>

            {/* Sections & Navigation */}
            <Text style={[drawerStyles.sectionHeading, { marginTop: 22 }]}>SECTIONS & JUMP</Text>

            <View style={drawerStyles.navSectionsList}>
              {sections.map((sec) => (
                <TouchableOpacity
                  key={sec.key}
                  style={[
                    drawerStyles.navCard,
                    sec.isActive && drawerStyles.navCardActive,
                  ]}
                  onPress={() => {
                    onClose();
                    onSelectTab(sec.key);
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      drawerStyles.navIconBox,
                      sec.isActive && drawerStyles.navIconBoxActive,
                    ]}
                  >
                    <sec.icon
                      size={18}
                      color={sec.isActive ? '#FF5E36' : '#09090b'}
                    />
                  </View>
                  <View style={drawerStyles.navContent}>
                    <Text
                      style={[
                        drawerStyles.navTitle,
                        sec.isActive && drawerStyles.navTitleActive,
                      ]}
                    >
                      {sec.label}
                    </Text>
                    <Text style={drawerStyles.navSubtitle}>
                      {sec.subtitle}
                    </Text>
                  </View>
                  {sec.isActive ? (
                    <View style={drawerStyles.activeBadge}>
                      <View style={drawerStyles.activeDot} />
                      <Text style={drawerStyles.activeBadgeText}>ACTIVE</Text>
                    </View>
                  ) : (
                    <ChevronRight size={16} color="#d4d4d8" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer with Logout */}
          <View style={drawerStyles.drawerFooter}>
            <TouchableOpacity
              style={drawerStyles.logoutBtn}
              onPress={() => {
                onClose();
                onLogout();
              }}
              activeOpacity={0.7}
            >
              <LogOut size={18} color="#dc2626" />
              <Text style={drawerStyles.logoutBtnText}>Sign Out of Atelier</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const drawerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  drawerContainer: {
    width: '84%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
    borderRightWidth: 1,
    borderColor: '#e4e4e7',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 14,
    paddingBottom: 14,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  brandBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#FF5E36',
  },
  drawerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#09090b',
  },
  drawerSubtitle: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  currentStatusLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#64748B',
  },
  currentStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0D1',
  },
  currentStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5E36',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#a1a1aa',
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
    marginRight: 8,
  },
  menuItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
  menuItemDescription: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  counterBadge: {
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  counterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717a',
  },
  dueBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  dueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  alertBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  navSectionsList: {
    gap: 8,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  navCardActive: {
    backgroundColor: '#FFF8F5',
    borderColor: '#FF5E36',
    borderWidth: 1.5,
    shadowColor: '#FF5E36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navIconBoxActive: {
    backgroundColor: '#FFE0D1',
  },
  navContent: {
    flex: 1,
    marginRight: 8,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
  navTitleActive: {
    fontWeight: '700',
    color: '#09090b',
  },
  navSubtitle: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 1,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE0D1',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5E36',
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5E36',
    letterSpacing: 0.5,
  },
  drawerFooter: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#f4f4f5',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default DrawerMenuModal;
