import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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
  Crown,
  CreditCard,
  Code,
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
  onClose,
  onOpenCustomers,
  onOpenCredits,
  onOpenCategories,
  onOpenInquiries,
  onOpenAccount,
  onLogout,
  customersCount,
  creditsDueCount,
  pendingInquiriesCount,
  currentUser,
  onOpenDeveloperSection,
}) => {
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
