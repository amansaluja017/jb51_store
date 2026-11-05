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
import { useRouter, usePathname, type Href } from 'expo-router';
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
  Crown,
  CreditCard,
  Code,
  LayoutDashboard,
  Shirt,
  Layers,
  FileText,
  Star,
} from 'lucide-react-native';
import { TabType } from './NavigationTabBar';
import { colors } from '../theme/colors';

export interface DrawerMenuModalProps {
  visible: boolean;
  activeTab?: TabType;
  onClose: () => void;
  onOpenCustomers: () => void;
  onOpenCredits: () => void;
  onOpenCategories: () => void;
  onOpenInquiries: () => void;
  onOpenAccount: () => void;
  onSelectTab?: (tab: TabType) => void;
  onLogout: () => void;
  customersCount: number;
  creditsDueCount?: number;
  pendingInquiriesCount: number;
  currentUser?: { id?: string; email?: string; userName?: string; role?: string } | null;
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
  const router = useRouter();
  const currentPathname = usePathname();

  const ROUTE_TAB_MAP: Record<string, TabType> = {
    '/': 'dashboard',
    '/products-catalog': 'catalogue',
    '/stock': 'inventory',
    '/invoices': 'invoices',
    '/reviews': 'reviews',
  };

  const resolvedActiveTab: TabType = (
    ROUTE_TAB_MAP[currentPathname] ||
    activeTab ||
    'dashboard'
  );

  interface NavSectionItem {
    key: TabType;
    label: string;
    subtitle: string;
    route: Href;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    isActive: boolean;
  }

  const sections: NavSectionItem[] = [
    {
      key: 'dashboard',
      label: 'Overview',
      subtitle: 'Real-time metrics, pulse & telemetry',
      route: '/',
      icon: LayoutDashboard,
      isActive: resolvedActiveTab === 'dashboard' || resolvedActiveTab === 'analytics',
    },
    {
      key: 'catalogue',
      label: 'Products Catalog',
      subtitle: 'Browse, create, edit & manage outfits',
      route: '/products-catalog',
      icon: Shirt,
      isActive: resolvedActiveTab === 'catalogue',
    },
    {
      key: 'inventory',
      label: 'Stock & Inventory',
      subtitle: 'Unit counts, low stock alerts & log',
      route: '/stock',
      icon: Layers,
      isActive: resolvedActiveTab === 'inventory',
    },
    {
      key: 'invoices',
      label: 'Invoices & Orders',
      subtitle: 'Invoice creator, GST billing & ledger',
      route: '/invoices',
      icon: FileText,
      isActive: resolvedActiveTab === 'invoices',
    },
    {
      key: 'reviews',
      label: 'Customer Reviews',
      subtitle: 'Ratings, testimonial feed & approvals',
      route: '/reviews',
      icon: Star,
      isActive: resolvedActiveTab === 'reviews',
    },
  ];

  const getActiveSectionName = () => {
    switch (resolvedActiveTab) {
      case 'dashboard':
      case 'analytics':
        return 'Overview';
      case 'catalogue':
        return 'Products Catalog';
      case 'inventory':
        return 'Stock & Inventory';
      case 'invoices':
        return 'Invoices & Orders';
      case 'reviews':
        return 'Customer Reviews';
      default:
        return 'Overview';
    }
  };

  const handleNavigateToTab = (sec: NavSectionItem) => {
    onClose();
    if (onSelectTab) {
      onSelectTab(sec.key);
    } else {
      router.replace(sec.route);
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
                <Text style={drawerStyles.brandBadgeText}>
                  {currentUser?.role === 'superadmin' ? 'SUPER ADMIN' : 'STORE ADMIN'}
                </Text>
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
            {/* Primary Store Navigation with Separate Routes */}
            <Text style={drawerStyles.sectionHeading}>STORE PAGES & ROUTES</Text>

            <View style={[drawerStyles.navSectionsList, { marginBottom: 22 }]}>
              {sections.map((sec) => (
                <TouchableOpacity
                  key={sec.key}
                  style={[
                    drawerStyles.navCard,
                    sec.isActive && drawerStyles.navCardActive,
                  ]}
                  onPress={() => handleNavigateToTab(sec)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Navigate to ${sec.label}`}
                  accessibilityRole="button"
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text
                        style={[
                          drawerStyles.navTitle,
                          sec.isActive && drawerStyles.navTitleActive,
                        ]}
                      >
                        {sec.label}
                      </Text>
                      <View
                        style={{
                          backgroundColor: sec.isActive ? '#FFE0D1' : '#f4f4f5',
                          paddingHorizontal: 5,
                          paddingVertical: 1.5,
                          borderRadius: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: '600',
                            color: sec.isActive ? '#FF5E36' : '#71717a',
                            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                          }}
                        >
                          {sec.route as string}
                        </Text>
                      </View>
                    </View>
                    <Text style={drawerStyles.navSubtitle}>{sec.subtitle}</Text>
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

            {/* Management Actions */}
            <Text style={drawerStyles.sectionHeading}>MANAGEMENT & TOOLS</Text>

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
                  Taxonomy & catalogue organization
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
                <MessageCircle size={18} color="#09090b" />
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
                  Support tickets & customer messages
                </Text>
              </View>
              <ChevronRight size={18} color="#a1a1aa" />
            </TouchableOpacity>

            {/* Developer Section (Superadmin Only) */}
            {currentUser?.role === 'superadmin' && (
              <TouchableOpacity
                style={[drawerStyles.menuItem, { borderColor: '#ffdcd4' }]}
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
                      <Text style={{ fontSize: 9, color: '#fff', fontWeight: '800' }}>SUPERADMIN</Text>
                    </View>
                  </View>
                  <Text style={drawerStyles.menuItemDescription}>
                    Edit promo header, hero, ads, flash sale, FAQs & contact info
                  </Text>
                </View>
                <ChevronRight size={18} color="#a1a1aa" />
              </TouchableOpacity>
            )}

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
          </ScrollView>

          {/* Footer with Logout */}
          <View style={drawerStyles.drawerFooter}>
            <TouchableOpacity
              style={drawerStyles.logoutBtn}
              onPress={() => {
                onClose();
                onLogout();
              }}
              activeOpacity={0.8}
            >
              <LogOut size={16} color="#ef4444" />
              <Text style={drawerStyles.logoutBtnText}>Sign Out of Admin</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default DrawerMenuModal;
