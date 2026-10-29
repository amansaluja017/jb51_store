import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import drawerStyles from './DrawerMenuModal.styles';
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
  Crown,
  LayoutDashboard,
  Shirt,
  CreditCard,
  Code,
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
  onOpenDeveloperSection?: () => void;
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
  onOpenDeveloperSection,
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
                <Crown size={11} color={colors.primary.DEFAULT} />
                <Text style={drawerStyles.brandBadgeText}>STORE ADMIN</Text>
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

            {/* Developer Section (Web UI Configuration) */}
            <TouchableOpacity
              style={drawerStyles.menuItem}
              onPress={() => {
                onClose();
                if (onOpenDeveloperSection) {
                  onOpenDeveloperSection();
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[drawerStyles.iconBox, { backgroundColor: '#fff1ee' }]}>
                <Code size={18} color="#FF5E36" />
              </View>
              <View style={drawerStyles.menuItemContent}>
                <View style={drawerStyles.menuItemTitleRow}>
                  <Text style={[drawerStyles.menuItemTitle, { color: '#FF5E36' }]}>
                    Developer Section
                  </Text>
                  <View style={{ backgroundColor: '#FF5E36', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9, color: '#fff', fontWeight: '800' }}>WEB UI</Text>
                  </View>
                </View>
                <Text style={drawerStyles.menuItemDescription}>
                  Edit promo header, hero, ads, flash sale, FAQs & contact info
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
              <Text style={drawerStyles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default DrawerMenuModal;

