import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import styles from './SelectCustomerPage.styles';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  User,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Check,
  ArrowUpDown,
  UserX,
} from 'lucide-react-native';
import { Customer } from '../../types';
import { CustomerListSkeleton } from '../SkeletonLoader';

export interface SelectCustomerPageProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (cust: Customer) => void;
  onBack: () => void;
  onOpenAddCustomerModal: () => void;
  isLoading?: boolean;
  onFetchPaginatedCustomers?: (params: {
    search?: string;
    sortBy?: 'name-asc' | 'name-desc';
    page?: number;
    limit?: number;
  }) => Promise<any>;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const PAGE_SIZE = 8;

export const SelectCustomerPage: React.FC<SelectCustomerPageProps> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onBack,
  onOpenAddCustomerModal,
  isLoading = false,
  onFetchPaginatedCustomers,
  refreshing,
  onRefresh,
}) => {
  const keyboardHeight = useKeyboardHeight();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [remoteData, setRemoteData] = useState<{
    items: Customer[];
    total: number;
    totalPages: number;
    page: number;
  } | null>(null);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);

  // Hit the backend route for sorting, search, and pagination
  useEffect(() => {
    if (!onFetchPaginatedCustomers) return;

    let isCancelled = false;
    const fetchRemote = async () => {
      setIsFetchingRemote(true);
      try {
        const res = await onFetchPaginatedCustomers({
          search: searchQuery.trim() || undefined,
          sortBy: sortOrder === 'asc' ? 'name-asc' : 'name-desc',
          page,
          limit: PAGE_SIZE,
        });
        if (!isCancelled && res && Array.isArray(res.items)) {
          setRemoteData(res);
        }
      } catch (err) {
        console.error('[SelectCustomerPage remote fetch error]:', err);
      } finally {
        if (!isCancelled) setIsFetchingRemote(false);
      }
    };

    const timer = setTimeout(fetchRemote, searchQuery ? 250 : 0);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, sortOrder, page, onFetchPaginatedCustomers]);

  // Client-side fallback if route is not passed
  const localFilteredAndSorted = useMemo(() => {
    let list = [...customers];
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter((c) => {
        const name = (c.name || '').toLowerCase();
        const phone = (c.phoneNumber || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        const address = (c.address || '').toLowerCase();
        return (
          name.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          address.includes(q)
        );
      });
    }

    list.sort((a, b) => {
      const nameA = (a.name || '').trim();
      const nameB = (b.name || '').trim();
      const cmp = nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [customers, searchQuery, sortOrder]);

  // Reset to page 1 when search or sorting changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortOrder]);

  const totalCount = remoteData ? remoteData.total : localFilteredAndSorted.length;
  const totalPages = remoteData ? Math.max(1, remoteData.totalPages) : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const displayCustomers = useMemo(() => {
    if (remoteData) {
      return remoteData.items;
    }
    const start = (safePage - 1) * PAGE_SIZE;
    return localFilteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [remoteData, localFilteredAndSorted, safePage]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
    }
    return (name.slice(0, 2) || 'CU').toUpperCase();
  };

  const getAvatarBg = (name: string) => {
    const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  const startRecord = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(safePage * PAGE_SIZE, totalCount);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
      style={styles.container}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Back to invoice form"
          accessibilityRole="button"
        >
          <ChevronLeft size={20} color="#18181b" />
          <Text style={styles.backButtonText}>Form</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Select Customer</Text>
          <Text style={styles.headerSubtitle}>
            {totalCount} {totalCount === 1 ? 'customer' : 'customers'} found
          </Text>
        </View>

        <TouchableOpacity
          onPress={onOpenAddCustomerModal}
          style={styles.addCustomerHeaderBtn}
          accessibilityLabel="Add new customer"
          accessibilityRole="button"
        >
          <UserPlus size={14} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.addCustomerHeaderBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Alphabetical Sort Bar */}
      <View style={styles.controlsSection}>
        {/* Search Input */}
        <View style={styles.searchBar}>
          <Search size={15} color="#a1a1aa" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search name, phone, or email..."
            placeholderTextColor="#a1a1aa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={14} color="#a1a1aa" />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort by Alphabet Controls */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Alphabetical Sort:</Text>
          <View style={styles.sortButtonsContainer}>
            <TouchableOpacity
              style={[styles.sortButton, sortOrder === 'asc' && styles.sortButtonActive]}
              onPress={() => setSortOrder('asc')}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortOrder === 'asc' && styles.sortButtonTextActive,
                ]}
              >
                A → Z
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortButton, sortOrder === 'desc' && styles.sortButtonActive]}
              onPress={() => setSortOrder('desc')}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortOrder === 'desc' && styles.sortButtonTextActive,
                ]}
              >
                Z → A
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content / Customer Cards */}
      <ScrollView
        contentContainerStyle={[
          styles.listContainer,
          keyboardHeight > 0 && { paddingBottom: keyboardHeight + 80 }
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5E36"
              colors={['#FF5E36']}
            />
          ) : undefined
        }
      >
        {isLoading || isFetchingRemote ? (
          <CustomerListSkeleton />
        ) : totalCount === 0 ? (
          <View style={styles.emptyContainer}>
            <UserX size={36} color="#a1a1aa" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matching customers' : 'No customers in database'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try searching with different keywords or add a new customer.'
                : 'Add your first customer to get started.'}
            </Text>
            <TouchableOpacity
              onPress={onOpenAddCustomerModal}
              style={styles.emptyAddBtn}
              accessibilityRole="button"
            >
              <UserPlus size={14} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.emptyAddBtnText}>Add Customer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayCustomers.map((cust) => {
            const isSelected = selectedCustomerId === cust.id;
            const initials = getInitials(cust.name || 'CU');
            const bg = getAvatarBg(cust.name || 'C');

            return (
              <TouchableOpacity
                key={cust.id}
                style={[styles.customerCard, isSelected && styles.customerCardSelected]}
                onPress={() => onSelectCustomer(cust)}
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                {/* Avatar Icon */}
                <View style={[styles.avatar, { backgroundColor: bg }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>

                {/* Customer Details */}
                <View style={styles.customerInfo}>
                  <View style={styles.customerNameRow}>
                    <Text style={[styles.customerName, isSelected && styles.customerNameSelected]}>
                      {cust.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Check size={11} color="#ffffff" />
                        <Text style={styles.selectedBadgeText}>Selected</Text>
                      </View>
                    )}
                  </View>

                  {/* Phone */}
                  <View style={styles.metaRow}>
                    <Phone size={12} color="#71717a" style={{ marginRight: 5 }} />
                    <Text style={styles.metaText}>
                      {cust.phoneNumber || 'No phone number'}
                    </Text>
                  </View>

                  {/* Email */}
                  {cust.email ? (
                    <View style={styles.metaRow}>
                      <Mail size={12} color="#71717a" style={{ marginRight: 5 }} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {cust.email}
                      </Text>
                    </View>
                  ) : null}

                  {/* Address */}
                  {cust.address ? (
                    <View style={styles.metaRow}>
                      <MapPin size={12} color="#71717a" style={{ marginRight: 5 }} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {cust.address}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Action Arrow */}
                <View style={[styles.selectIndicator, isSelected && styles.selectIndicatorActive]}>
                  <Check size={14} color={isSelected ? '#ffffff' : '#a1a1aa'} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Pagination Bar (when customers exist) */}
      {totalCount > 0 && (
        <View style={styles.paginationBar}>
          <Text style={styles.paginationInfo}>
            {startRecord}–{endRecord} of {totalCount}
          </Text>

          <View style={styles.paginationControls}>
            <TouchableOpacity
              style={[styles.pageButton, safePage <= 1 && styles.pageButtonDisabled]}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              accessibilityLabel="Previous page"
              accessibilityRole="button"
            >
              <ChevronLeft size={16} color={safePage <= 1 ? '#d4d4d8' : '#18181b'} />
            </TouchableOpacity>

            <View style={styles.pageNumberBadge}>
              <Text style={styles.pageNumberText}>
                {safePage} / {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.pageButton, safePage >= totalPages && styles.pageButtonDisabled]}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              accessibilityLabel="Next page"
              accessibilityRole="button"
            >
              <ChevronRight size={16} color={safePage >= totalPages ? '#d4d4d8' : '#18181b'} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default SelectCustomerPage;

