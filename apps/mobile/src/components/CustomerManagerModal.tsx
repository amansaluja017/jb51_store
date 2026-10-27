import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Linking,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Search,
  Plus,
  Edit3,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Users,
  ArrowUpDown,
  UserPlus,
  Check,
  Receipt,
  ChevronRight,
  ChevronLeft,
  Calendar,
  CreditCard,
  Package,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react-native';
import { Customer, Order } from '../types';
import { colors } from '../theme/colors';
import { CustomerListSkeleton } from './SkeletonLoader';

export interface CustomerHistoryResponse {
  customer: Customer;
  totalOrders: number;
  totalSpend: number;
  avgOrderValue: number;
  orders: Order[];
}

export interface CustomerManagerModalProps {
  visible: boolean;
  customers?: Customer[];
  isLoading?: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onFetchPaginatedCustomers?: (params?: {
    search?: string;
    sortBy?: 'name-asc' | 'name-desc' | 'createdAt-desc' | 'createdAt-asc';
    page?: number;
    limit?: number;
  }) => Promise<{
    items: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  onFetchCustomerHistory: (customerId: string) => Promise<CustomerHistoryResponse>;
  onCreateCustomer: (data: {
    name: string;
    phoneNumber: string;
    email?: string;
    address?: string;
  }) => Promise<any>;
  onUpdateCustomer: (data: {
    id: string;
    name?: string;
    phoneNumber?: string;
    email?: string | null;
    address?: string | null;
  }) => Promise<any>;
  onDeleteCustomer: (id: string, name?: string, onSuccess?: () => void) => void;
  showAlert: (
    title: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'newest';

export const CustomerManagerModal: React.FC<CustomerManagerModalProps> = ({
  visible,
  customers = [],
  isLoading = false,
  onClose,
  onRefresh,
  onFetchPaginatedCustomers,
  onFetchCustomerHistory,
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  showAlert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  // Paginated remote customers state
  const [customerPage, setCustomerPage] = useState(1);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  const [customerTotalCount, setCustomerTotalCount] = useState(0);
  const [remoteCustomers, setRemoteCustomers] = useState<Customer[] | null>(null);
  const [isLoadingPaginated, setIsLoadingPaginated] = useState(false);

  // Customer History state (Loaded on demand from backend route)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [historyData, setHistoryData] = useState<CustomerHistoryResponse | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Full Order Details Sub-Modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Form Modal State (For Add / Edit)
  const [formVisible, setFormVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Trigger fetching customer order history via backend route
  const handleOpenHistory = async (cust: Customer) => {
    setSelectedCustomer(cust);
    setHistoryData(null);
    setIsLoadingHistory(true);
    try {
      const data = await onFetchCustomerHistory(cust.id);
      setHistoryData(data);
    } catch {
      // Alert already handled in hook
      setSelectedCustomer(null);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Open Add Customer Form
  const openAddForm = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormVisible(true);
  };

  // Open Edit Customer Form
  const openEditForm = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormName(cust.name || '');
    setFormPhone(cust.phoneNumber || '');
    setFormEmail(cust.email || '');
    setFormAddress(cust.address || '');
    setFormVisible(true);
  };

  // Fetch paginated customers from backend route
  const fetchPaginated = useCallback(
    async (pageToFetch = customerPage, query = searchQuery, sort = sortOption) => {
      if (!onFetchPaginatedCustomers) return;
      try {
        setIsLoadingPaginated(true);
        const mappedSort =
          sort === 'newest'
            ? 'createdAt-desc'
            : sort === 'name-desc'
            ? 'name-desc'
            : 'name-asc';

        const res = await onFetchPaginatedCustomers({
          page: pageToFetch,
          limit: 10,
          search: query.trim() || undefined,
          sortBy: mappedSort,
        });

        if (res) {
          setRemoteCustomers(res.items || []);
          setCustomerTotalPages(res.totalPages || 1);
          setCustomerTotalCount(res.total ?? 0);
          setCustomerPage(res.page || pageToFetch);
        }
      } catch (err) {
        console.error('[CustomerManagerModal] Error fetching paginated customers:', err);
      } finally {
        setIsLoadingPaginated(false);
      }
    },
    [onFetchPaginatedCustomers, customerPage, searchQuery, sortOption]
  );

  useEffect(() => {
    if (!visible || !onFetchPaginatedCustomers) return;

    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        setIsLoadingPaginated(true);
        const mappedSort =
          sortOption === 'newest'
            ? 'createdAt-desc'
            : sortOption === 'name-desc'
            ? 'name-desc'
            : 'name-asc';

        const res = await onFetchPaginatedCustomers({
          page: customerPage,
          limit: 10,
          search: searchQuery.trim() || undefined,
          sortBy: mappedSort,
        });

        if (!isCancelled && res) {
          setRemoteCustomers(res.items || []);
          setCustomerTotalPages(res.totalPages || 1);
          setCustomerTotalCount(res.total ?? 0);
        }
      } catch (err) {
        console.error('[CustomerManagerModal] Error fetching paginated customers:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingPaginated(false);
        }
      }
    }, searchQuery ? 250 : 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [visible, customerPage, sortOption, searchQuery, onFetchPaginatedCustomers]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setCustomerPage(1);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortOption(newSort);
    setCustomerPage(1);
  };

  const handleRefresh = async () => {
    if (onFetchPaginatedCustomers) {
      await fetchPaginated(customerPage);
    } else if (onRefresh) {
      onRefresh();
    }
  };

  const handleDeleteItem = (id: string, name?: string) => {
    onDeleteCustomer(id, name, () => {
      if (onFetchPaginatedCustomers) {
        if (remoteCustomers && remoteCustomers.length <= 1 && customerPage > 1) {
          setCustomerPage(p => p - 1);
        } else {
          fetchPaginated(customerPage);
        }
      }
    });
  };

  // Handle Form Submission (Create or Update)
  const handleSaveForm = async () => {
    const trimmedName = formName.trim();
    const trimmedPhone = formPhone.trim();
    const trimmedEmail = formEmail.trim();
    const trimmedAddress = formAddress.trim();

    if (!trimmedName) {
      showAlert('Name Required', 'Please enter a valid customer name.', 'error');
      return;
    }
    if (!trimmedPhone) {
      showAlert('Phone Required', 'Please enter a valid phone number.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCustomer) {
        const updated = await onUpdateCustomer({
          id: editingCustomer.id,
          name: trimmedName,
          phoneNumber: trimmedPhone,
          email: trimmedEmail || null,
          address: trimmedAddress || null,
        });
        if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
          setSelectedCustomer(updated);
        }
        if (onFetchPaginatedCustomers) {
          fetchPaginated(customerPage);
        }
      } else {
        await onCreateCustomer({
          name: trimmedName,
          phoneNumber: trimmedPhone,
          email: trimmedEmail || undefined,
          address: trimmedAddress || undefined,
        });
        if (onFetchPaginatedCustomers) {
          setCustomerPage(1);
          fetchPaginated(1, '', sortOption);
        }
      }
      setFormVisible(false);
    } catch {
      // Alert already handled inside hook
    } finally {
      setIsSaving(false);
    }
  };

  // Filter & Sort customers on frontend directory
  const filteredCustomers = useMemo(() => {
    if (onFetchPaginatedCustomers && remoteCustomers !== null) {
      return remoteCustomers;
    }
    let list = [...customers];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.phoneNumber.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q))
      );
    }

    if (sortOption === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === 'newest') {
      list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    return list;
  }, [customers, searchQuery, sortOption, onFetchPaginatedCustomers, remoteCustomers]);

  const displayTotalCount =
    onFetchPaginatedCustomers && remoteCustomers !== null
      ? customerTotalCount
      : customers.length;

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name[0] || 'C').toUpperCase();
  };

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    const url = `tel:${phoneNumber.replace(/\s+/g, '')}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  const handleEmail = (email: string) => {
    if (!email) return;
    const url = `mailto:${email.trim()}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        {/* Dynamic Header */}
        <View style={styles.header}>
          {selectedCustomer ? (
            <TouchableOpacity
              onPress={() => {
                setSelectedCustomer(null);
                setHistoryData(null);
              }}
              style={styles.backBtn}
              accessibilityLabel="Back to Customers List"
              accessibilityRole="button"
            >
              <ChevronLeft size={18} color="#09090b" />
              <Text style={styles.backBtnText}>Directory</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <X size={20} color="#09090b" />
            </TouchableOpacity>
          )}

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {selectedCustomer ? selectedCustomer.name : 'Manage Customers'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {selectedCustomer
                ? 'Client Order History'
                : `${displayTotalCount} registered ${
                    displayTotalCount === 1 ? 'client' : 'clients'
                  }`}
            </Text>
          </View>

          {selectedCustomer ? (
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <X size={18} color="#09090b" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={openAddForm}
              style={styles.addBtn}
              activeOpacity={0.8}
              accessibilityLabel="Add Customer"
              accessibilityRole="button"
            >
              <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* VIEW 1: MAIN DIRECTORY LIST */}
        {!selectedCustomer ? (
          <>
            {/* Search & Sort Controls */}
            <View style={styles.searchSection}>
              <View style={styles.searchBox}>
                <Search size={16} color="#71717a" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name, phone, email, city..."
                  placeholderTextColor="#a1a1aa"
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearchChange('')} style={styles.clearBtn}>
                    <X size={14} color="#71717a" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Sort Filter Tabs */}
              <View style={styles.sortRow}>
                <View style={styles.sortLabelWrap}>
                  <ArrowUpDown size={12} color="#71717a" />
                  <Text style={styles.sortLabel}>Sort:</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleSortChange('name-asc')}
                  style={[
                    styles.sortChip,
                    sortOption === 'name-asc' && styles.sortChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      sortOption === 'name-asc' && styles.sortChipTextActive,
                    ]}
                  >
                    A-Z
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSortChange('name-desc')}
                  style={[
                    styles.sortChip,
                    sortOption === 'name-desc' && styles.sortChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      sortOption === 'name-desc' && styles.sortChipTextActive,
                    ]}
                  >
                    Z-A
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSortChange('newest')}
                  style={[
                    styles.sortChip,
                    sortOption === 'newest' && styles.sortChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      sortOption === 'newest' && styles.sortChipTextActive,
                    ]}
                  >
                    Newest
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Customers List */}
            <FlatList
              data={filteredCustomers}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isLoadingPaginated || isLoading}
                  onRefresh={handleRefresh}
                  tintColor="#FF5E36"
                  colors={['#FF5E36']}
                />
              }
              ListEmptyComponent={
                isLoadingPaginated && (!remoteCustomers || remoteCustomers.length === 0) ? (
                  <CustomerListSkeleton />
                ) : (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconWrap}>
                      <Users size={36} color="#a1a1aa" />
                    </View>
                    <Text style={styles.emptyTitle}>
                      {searchQuery ? 'No Matching Customers' : 'No Customers Registered'}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                      {searchQuery
                        ? `No customer matches "${searchQuery}". Try modifying your query.`
                        : 'Add customer profiles to generate quick invoices and keep track of purchase histories.'}
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyAddBtn}
                      onPress={openAddForm}
                      activeOpacity={0.8}
                    >
                      <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.emptyAddBtnText}>Add First Customer</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
              ListFooterComponent={
                customerTotalPages > 1 ? (
                  <View style={styles.paginationBar}>
                    <Text style={styles.paginationInfo}>
                      Page {customerPage} of {customerTotalPages}
                      {customerTotalCount > 0 ? ` • ${customerTotalCount} total` : ''}
                    </Text>
                    <View style={styles.paginationControls}>
                      <TouchableOpacity
                        style={[
                          styles.pageButton,
                          customerPage <= 1 && styles.pageButtonDisabled,
                        ]}
                        onPress={() => setCustomerPage(p => Math.max(1, p - 1))}
                        disabled={customerPage <= 1}
                        accessibilityLabel="Previous page"
                        accessibilityRole="button"
                      >
                        <ChevronLeft
                          size={16}
                          color={customerPage <= 1 ? '#d4d4d8' : '#18181b'}
                        />
                      </TouchableOpacity>

                      <View style={styles.pageNumberBadge}>
                        <Text style={styles.pageNumberText}>
                          {customerPage} / {customerTotalPages}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.pageButton,
                          customerPage >= customerTotalPages && styles.pageButtonDisabled,
                        ]}
                        onPress={() =>
                          setCustomerPage(p => Math.min(customerTotalPages, p + 1))
                        }
                        disabled={customerPage >= customerTotalPages}
                        accessibilityLabel="Next page"
                        accessibilityRole="button"
                      >
                        <ChevronRight
                          size={16}
                          color={
                            customerPage >= customerTotalPages ? '#d4d4d8' : '#18181b'
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <View style={styles.customerCard}>
                  {/* Customer Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarWrap}>
                      <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                    </View>
                    <View style={styles.cardInfoWrap}>
                      <Text style={styles.customerName}>{item.name}</Text>
                      {item.createdAt && (
                        <Text style={styles.customerMeta}>
                          Added {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Details Rows */}
                  <View style={styles.detailsContainer}>
                    {/* Phone */}
                    <TouchableOpacity
                      style={styles.detailRow}
                      onPress={() => handleCall(item.phoneNumber)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.detailIconBox}>
                        <Phone size={13} color="#FF5E36" />
                      </View>
                      <Text style={styles.detailTextPhone}>{item.phoneNumber}</Text>
                    </TouchableOpacity>

                    {/* Email */}
                    {!!item.email && (
                      <TouchableOpacity
                        style={styles.detailRow}
                        onPress={() => handleEmail(item.email!)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.detailIconBox}>
                          <Mail size={13} color="#71717a" />
                        </View>
                        <Text style={styles.detailText} numberOfLines={1}>
                          {item.email}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Address */}
                    {!!item.address && (
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconBox}>
                          <MapPin size={13} color="#71717a" />
                        </View>
                        <Text style={styles.detailText} numberOfLines={2}>
                          {item.address}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Card Actions Footer: History, Edit, Delete */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.actionBtnHistory}
                      onPress={() => handleOpenHistory(item)}
                      activeOpacity={0.7}
                    >
                      <Receipt size={14} color="#FF5E36" style={{ marginRight: 6 }} />
                      <Text style={styles.actionBtnHistoryText}>History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnEdit}
                      onPress={() => openEditForm(item)}
                      activeOpacity={0.7}
                    >
                      <Edit3 size={14} color="#09090b" style={{ marginRight: 6 }} />
                      <Text style={styles.actionBtnEditText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnDelete}
                      onPress={() => handleDeleteItem(item.id, item.name)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color="#dc2626" style={{ marginRight: 6 }} />
                      <Text style={styles.actionBtnDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </>
        ) : (
          /* VIEW 2: SERVER-FETCHED CUSTOMER ORDER HISTORY VIEW */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.historyScrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingHistory}
                onRefresh={() => handleOpenHistory(selectedCustomer)}
                tintColor="#FF5E36"
                colors={['#FF5E36']}
              />
            }
          >
            {/* Customer Details Hero Card */}
            <View style={styles.customerProfileCard}>
              <View style={styles.profileHeaderRow}>
                <View style={styles.profileAvatarBig}>
                  <Text style={styles.profileAvatarBigText}>
                    {getInitials(selectedCustomer.name)}
                  </Text>
                </View>
                <View style={styles.profileTitleWrap}>
                  <Text style={styles.profileNameBig}>{selectedCustomer.name}</Text>
                  {selectedCustomer.createdAt && (
                    <Text style={styles.profileDateText}>
                      Client since{' '}
                      {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.profileEditBtn}
                  onPress={() => openEditForm(selectedCustomer)}
                  activeOpacity={0.7}
                >
                  <Edit3 size={15} color="#09090b" />
                </TouchableOpacity>
              </View>

              {/* Contact Chips */}
              <View style={styles.profileContactRow}>
                <TouchableOpacity
                  style={styles.profileContactChip}
                  onPress={() => handleCall(selectedCustomer.phoneNumber)}
                >
                  <Phone size={13} color="#FF5E36" />
                  <Text style={styles.profileContactChipText}>
                    {selectedCustomer.phoneNumber}
                  </Text>
                </TouchableOpacity>

                {selectedCustomer.email ? (
                  <TouchableOpacity
                    style={styles.profileContactChip}
                    onPress={() => handleEmail(selectedCustomer.email!)}
                  >
                    <Mail size={13} color="#71717a" />
                    <Text style={styles.profileContactChipText} numberOfLines={1}>
                      {selectedCustomer.email}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {selectedCustomer.address ? (
                <View style={styles.profileAddressRow}>
                  <MapPin size={13} color="#71717a" style={{ marginTop: 2 }} />
                  <Text style={styles.profileAddressText}>{selectedCustomer.address}</Text>
                </View>
              ) : null}

              {/* Server-Computed Metrics */}
              {isLoadingHistory ? (
                <View style={styles.metricsLoadingBox}>
                  <ActivityIndicator size="small" color="#FF5E36" />
                  <Text style={styles.metricsLoadingText}>Fetching order metrics...</Text>
                </View>
              ) : historyData ? (
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <ShoppingBag size={16} color="#FF5E36" style={{ marginBottom: 4 }} />
                    <Text style={styles.metricValue}>{historyData.totalOrders}</Text>
                    <Text style={styles.metricLabel}>Total Orders</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <TrendingUp size={16} color="#10B981" style={{ marginBottom: 4 }} />
                    <Text style={styles.metricValue}>
                      ₹{historyData.totalSpend.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.metricLabel}>Lifetime Spend</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Receipt size={16} color="#6366F1" style={{ marginBottom: 4 }} />
                    <Text style={styles.metricValue}>
                      ₹{historyData.avgOrderValue.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.metricLabel}>Avg. Order</Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Orders Section Heading */}
            <View style={styles.orderSectionHeadingRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Receipt size={16} color="#FF5E36" />
                <Text style={styles.orderSectionHeading}>
                  ORDER HISTORY ({historyData?.orders?.length || 0})
                </Text>
              </View>
              {historyData && historyData.orders.length > 0 && (
                <Text style={styles.orderSectionHelpText}>Tap order for details</Text>
              )}
            </View>

            {/* Orders List / Loading State */}
            {isLoadingHistory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF5E36" />
                <Text style={styles.loadingText}>Loading client order history...</Text>
              </View>
            ) : !historyData || historyData.orders.length === 0 ? (
              <View style={styles.noOrdersCard}>
                <View style={styles.noOrdersIconWrap}>
                  <ShoppingBag size={32} color="#a1a1aa" />
                </View>
                <Text style={styles.noOrdersTitle}>No Orders Recorded</Text>
                <Text style={styles.noOrdersSubtitle}>
                  This customer has no recorded orders in the database. Invoices
                  generated for this client will appear here automatically.
                </Text>
              </View>
            ) : (
              <View style={styles.ordersListContainer}>
                {historyData.orders.map((order, idx) => {
                  const statusNormalized = (order.status || 'Completed').toUpperCase();
                  const isPaid =
                    statusNormalized === 'PAID' || statusNormalized === 'COMPLETED';

                  return (
                    <TouchableOpacity
                      key={order.id || idx}
                      style={styles.orderItemCard}
                      onPress={() => setSelectedOrderDetails(order)}
                      activeOpacity={0.8}
                    >
                      {/* Order Card Top Bar */}
                      <View style={styles.orderItemTopBar}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={styles.orderNumberBadge}>
                            <Text style={styles.orderNumberText}>
                              {order.orderNumber ||
                                `#ORD-${order.id.slice(0, 6).toUpperCase()}`}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.orderStatusBadge,
                              isPaid ? styles.statusPaid : styles.statusPending,
                            ]}
                          >
                            <Text
                              style={[
                                styles.orderStatusText,
                                isPaid ? styles.statusTextPaid : styles.statusTextPending,
                              ]}
                            >
                              {order.status || 'Completed'}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.orderAmountHighlight}>
                          ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>

                      {/* Date & Payment Mode */}
                      <View style={styles.orderMetaRow}>
                        <View style={styles.orderMetaItem}>
                          <Calendar size={12} color="#71717a" />
                          <Text style={styles.orderMetaText}>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recent'}
                          </Text>
                        </View>
                        <View style={styles.orderMetaItem}>
                          <CreditCard size={12} color="#71717a" />
                          <Text style={styles.orderMetaText}>
                            {(order.paymentMethod || 'CASH').toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {/* Purchased Items Preview */}
                      {order.items && order.items.length > 0 && (
                        <View style={styles.orderItemsPreviewBox}>
                          {order.items.slice(0, 3).map((item, itemIdx) => (
                            <View key={itemIdx} style={styles.orderItemSnippetRow}>
                              <Package size={11} color="#71717a" style={{ marginRight: 6 }} />
                              <Text style={styles.orderItemSnippetText} numberOfLines={1}>
                                {item.quantity}x {item.productName}
                                {item.variantColor ? ` (${item.variantColor})` : ''}
                              </Text>
                              <Text style={styles.orderItemSnippetPrice}>
                                ₹
                                {(item.total || item.unitPrice * item.quantity).toLocaleString(
                                  'en-IN'
                                )}
                              </Text>
                            </View>
                          ))}
                          {order.items.length > 3 && (
                            <Text style={styles.orderItemsMoreText}>
                              +{order.items.length - 3} more items...
                            </Text>
                          )}
                        </View>
                      )}

                      {/* Card Bottom CTA */}
                      <View style={styles.orderCardFooter}>
                        <Text style={styles.orderFooterActionText}>
                          View Full Invoice Details
                        </Text>
                        <ChevronRight size={14} color="#FF5E36" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

        {/* Create / Edit Customer Sub-Modal */}
        <Modal
          visible={formVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setFormVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.formModalOverlay}
          >
            <View style={styles.formModalCard}>
              <View style={styles.formModalHeader}>
                <View style={styles.formHeaderTitleWrap}>
                  <View style={styles.formHeaderIcon}>
                    <UserPlus size={18} color="#FF5E36" />
                  </View>
                  <Text style={styles.formModalTitle}>
                    {editingCustomer ? 'Edit Customer' : 'New Customer Profile'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setFormVisible(false)}
                  style={styles.closeBtn}
                >
                  <X size={18} color="#71717a" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FULL NAME *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Jaswinder Kaur"
                    placeholderTextColor="#a1a1aa"
                    value={formName}
                    onChangeText={setFormName}
                    autoCapitalize="words"
                  />
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PHONE NUMBER *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. +91 98765 43210"
                    placeholderTextColor="#a1a1aa"
                    value={formPhone}
                    onChangeText={setFormPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS (OPTIONAL)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. client@example.com"
                    placeholderTextColor="#a1a1aa"
                    value={formEmail}
                    onChangeText={setFormEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ADDRESS / CITY (OPTIONAL)</Text>
                  <TextInput
                    style={[styles.formInput, styles.formInputMultiline]}
                    placeholder="e.g. Sector 14, Urban Estate, Kaithal"
                    placeholderTextColor="#a1a1aa"
                    value={formAddress}
                    onChangeText={setFormAddress}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  style={[styles.submitBtn, isSaving && styles.submitBtnDisabled]}
                  onPress={handleSaveForm}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.submitBtnText}>
                        {editingCustomer ? 'Update Customer' : 'Create Customer'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setFormVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Dedicated Full Order Details Sub-Modal */}
        <Modal
          visible={selectedOrderDetails !== null}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedOrderDetails(null)}
        >
          <View style={styles.orderDetailsModalOverlay}>
            <View style={styles.orderDetailsCard}>
              <View style={styles.orderDetailsHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.orderDetailsIconBox}>
                    <Receipt size={18} color="#FF5E36" />
                  </View>
                  <View>
                    <Text style={styles.orderDetailsTitle}>
                      {selectedOrderDetails?.orderNumber || 'Order Details'}
                    </Text>
                    <Text style={styles.orderDetailsSubtitle}>
                      {selectedOrderDetails?.createdAt
                        ? new Date(selectedOrderDetails.createdAt).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'Recent Transaction'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedOrderDetails(null)}
                  style={styles.closeBtn}
                >
                  <X size={18} color="#71717a" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
              >
                {/* Meta details bar */}
                <View style={styles.orderMetaBar}>
                  <View>
                    <Text style={styles.metaLabel}>PAYMENT METHOD</Text>
                    <Text style={styles.metaValue}>
                      {(selectedOrderDetails?.paymentMethod || 'CASH').toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.metaLabel}>ORDER STATUS</Text>
                    <Text
                      style={[
                        styles.metaValue,
                        { color: '#10B981', fontWeight: 'bold' },
                      ]}
                    >
                      {(selectedOrderDetails?.status || 'COMPLETED').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Items Breakdown Table */}
                <Text style={styles.breakdownHeading}>
                  PURCHASED ITEMS ({selectedOrderDetails?.items?.length || 0})
                </Text>
                <View style={styles.breakdownTable}>
                  {selectedOrderDetails?.items && selectedOrderDetails.items.length > 0 ? (
                    selectedOrderDetails.items.map((item, idx) => (
                      <View key={idx} style={styles.breakdownRow}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={styles.breakdownItemName}>{item.productName}</Text>
                          {item.variantColor && (
                            <Text style={styles.breakdownItemVariant}>
                              Color: {item.variantColor}
                            </Text>
                          )}
                          <Text style={styles.breakdownItemCalculation}>
                            {item.quantity} × ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                          </Text>
                        </View>
                        <Text style={styles.breakdownItemTotal}>
                          ₹
                          {Number(
                            item.total || item.unitPrice * item.quantity
                          ).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.breakdownEmpty}>No items recorded on this order.</Text>
                  )}
                </View>

                {/* Price Summary Breakdown */}
                <View style={styles.summaryBox}>
                  {selectedOrderDetails?.subtotal && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal</Text>
                      <Text style={styles.summaryText}>
                        ₹{Number(selectedOrderDetails.subtotal).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  )}

                  {Number(selectedOrderDetails?.discount || 0) > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Discount</Text>
                      <Text style={[styles.summaryText, { color: '#10B981' }]}>
                        -₹{Number(selectedOrderDetails?.discount).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  )}

                  {Number(selectedOrderDetails?.gst || 0) > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        GST / Tax{selectedOrderDetails?.taxRate && Number(selectedOrderDetails?.taxRate) > 0 ? ` (${selectedOrderDetails?.taxRate}%)` : ''}
                      </Text>
                      <Text style={styles.summaryText}>
                        +₹{Number(selectedOrderDetails?.gst).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                    <Text style={styles.summaryTotalLabel}>Grand Total</Text>
                    <Text style={styles.summaryTotalAmount}>
                      ₹{Number(selectedOrderDetails?.totalAmount || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {selectedOrderDetails?.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>ORDER NOTES</Text>
                    <Text style={styles.notesText}>{selectedOrderDetails.notes}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => setSelectedOrderDetails(null)}
                >
                  <Text style={styles.doneBtnText}>Close Details</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#09090b',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#09090b',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5E36',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF5E36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#09090b',
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  sortLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 4,
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortChipActive: {
    backgroundColor: '#FFF2EB',
    borderColor: '#FF5E36',
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717a',
  },
  sortChipTextActive: {
    color: '#FF5E36',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FFE0D1',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF5E36',
  },
  cardInfoWrap: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#09090b',
  },
  customerMeta: {
    fontSize: 11,
    color: '#a1a1aa',
    marginTop: 2,
  },
  detailsContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#f4f4f5',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconBox: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  detailTextPhone: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF5E36',
  },
  detailText: {
    fontSize: 13,
    color: '#52525b',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#f4f4f5',
  },
  actionBtnHistory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: '#FFE0D1',
    marginRight: 'auto',
  },
  actionBtnHistoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5E36',
  },
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#09090b',
  },
  actionBtnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  actionBtnDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  // History View Styles
  historyScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  customerProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarBig: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FFE0D1',
  },
  profileAvatarBigText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF5E36',
  },
  profileTitleWrap: {
    flex: 1,
  },
  profileNameBig: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#09090b',
  },
  profileDateText: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  profileEditBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  profileContactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  profileContactChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  profileAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 16,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: '#F4F4F5',
  },
  profileAddressText: {
    fontSize: 12,
    color: '#71717a',
    flex: 1,
    lineHeight: 16,
  },
  metricsLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#F4F4F5',
  },
  metricsLoadingText: {
    fontSize: 12,
    color: '#71717a',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: '#F4F4F5',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#09090b',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717a',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  orderSectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  orderSectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#71717a',
  },
  orderSectionHelpText: {
    fontSize: 11,
    color: '#a1a1aa',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#71717a',
    fontWeight: '500',
  },
  ordersListContainer: {
    gap: 12,
  },
  orderItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  orderItemTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderNumberBadge: {
    backgroundColor: '#09090b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  orderNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPaid: {
    backgroundColor: '#ECFDF5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  orderStatusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusTextPaid: {
    color: '#047857',
  },
  statusTextPending: {
    color: '#B45309',
  },
  orderAmountHighlight: {
    fontSize: 17,
    fontWeight: '800',
    color: '#09090b',
  },
  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  orderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  orderMetaText: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '500',
  },
  orderItemsPreviewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    marginBottom: 10,
  },
  orderItemSnippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemSnippetText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  orderItemSnippetPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#09090b',
    marginLeft: 8,
  },
  orderItemsMoreText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#F4F4F5',
  },
  orderFooterActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5E36',
  },
  noOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  noOrdersIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noOrdersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#09090b',
    marginBottom: 4,
  },
  noOrdersSubtitle: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#09090b',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Form Modal Styles
  formModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  formModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  formModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
  },
  formHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  formModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#09090b',
  },
  formContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#71717a',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#09090b',
  },
  formInputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5E36',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    shadowColor: '#FF5E36',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717a',
  },
  // Full Order Details Sub-Modal
  orderDetailsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  orderDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  orderDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#F4F4F5',
  },
  orderDetailsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  orderDetailsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#09090b',
  },
  orderDetailsSubtitle: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  orderMetaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#64748B',
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  breakdownHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#71717a',
    marginBottom: 10,
  },
  breakdownTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 18,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F4F4F5',
  },
  breakdownItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#09090b',
  },
  breakdownItemVariant: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  breakdownItemCalculation: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  breakdownItemTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090b',
  },
  breakdownEmpty: {
    fontSize: 12,
    color: '#a1a1aa',
    paddingVertical: 12,
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#71717a',
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#09090b',
  },
  summaryTotalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#E4E4E7',
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#09090b',
  },
  summaryTotalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF5E36',
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#64748B',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  doneBtn: {
    backgroundColor: '#09090b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  paginationInfo: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '500',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonDisabled: {
    backgroundColor: '#fafafa',
  },
  pageNumberBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 6,
    borderRadius: 6,
    backgroundColor: '#f4f4f5',
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#18181b',
  },
});

export default CustomerManagerModal;
