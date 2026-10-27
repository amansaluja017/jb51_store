import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  MessageCircle,
  Search,
  ArrowUpDown,
  ChevronDown,
  Check,
  RefreshCw,
} from 'lucide-react-native';
import InquiryItem from './InquiryItem';
import { Inquiry } from '../types';

export type InquirySortOption = 'recent' | 'oldest' | 'name-asc' | 'name-desc';
export type InquiryStatusFilter = 'all' | 'pending' | 'resolved';

interface InquiriesModalProps {
  visible: boolean;
  onClose: () => void;
  inquiries: Inquiry[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    pendingCount: number;
    resolvedCount: number;
  };
  sortBy?: InquirySortOption;
  onSortChange?: (sort: InquirySortOption) => void;
  statusFilter?: InquiryStatusFilter;
  onStatusFilterChange?: (filter: InquiryStatusFilter) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onFetchPaginatedInquiries?: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: InquiryStatusFilter;
    sortBy?: InquirySortOption;
    append?: boolean;
  }) => Promise<any>;
  onResolveInquiry: (id: string, name: string) => void;
}

const SORT_OPTIONS: { id: InquirySortOption; label: string; description: string }[] = [
  { id: 'recent', label: 'Recent First', description: 'Newest inquiries received first' },
  { id: 'oldest', label: 'Oldest First', description: 'Earliest inquiries first' },
  { id: 'name-asc', label: 'Client Name (A → Z)', description: 'Alphabetical by customer name' },
  { id: 'name-desc', label: 'Client Name (Z → A)', description: 'Reverse alphabetical by customer name' },
];

export default function InquiriesModal({
  visible,
  onClose,
  inquiries,
  isLoading = false,
  pagination,
  sortBy = 'recent',
  onSortChange,
  statusFilter = 'all',
  onStatusFilterChange,
  searchQuery = '',
  onSearchChange,
  onFetchPaginatedInquiries,
  onResolveInquiry,
}: InquiriesModalProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [activeFilter, setActiveFilter] = useState<InquiryStatusFilter>(statusFilter);
  const [activeSort, setActiveSort] = useState<InquirySortOption>(sortBy);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync internal state if prop updates externally
  useEffect(() => {
    setActiveFilter(statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    setActiveSort(sortBy);
  }, [sortBy]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search trigger
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchTextChange = (text: string) => {
    setLocalSearch(text);
    onSearchChange?.(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onFetchPaginatedInquiries?.({
        page: 1,
        search: text,
        status: activeFilter,
        sortBy: activeSort,
        append: false,
      });
    }, 350);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange?.('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onFetchPaginatedInquiries?.({
      page: 1,
      search: '',
      status: activeFilter,
      sortBy: activeSort,
      append: false,
    });
  };

  const handleSelectFilter = (filter: InquiryStatusFilter) => {
    setActiveFilter(filter);
    onStatusFilterChange?.(filter);
    onFetchPaginatedInquiries?.({
      page: 1,
      status: filter,
      search: localSearch,
      sortBy: activeSort,
      append: false,
    });
  };

  const handleSelectSort = (sort: InquirySortOption) => {
    setActiveSort(sort);
    onSortChange?.(sort);
    setSortSheetOpen(false);
    onFetchPaginatedInquiries?.({
      page: 1,
      sortBy: sort,
      status: activeFilter,
      search: localSearch,
      append: false,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onFetchPaginatedInquiries?.({
        page: 1,
        status: activeFilter,
        sortBy: activeSort,
        search: localSearch,
        append: false,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!pagination?.hasMore || isLoadingMore || isLoading) return;
    setIsLoadingMore(true);
    try {
      await onFetchPaginatedInquiries?.({
        page: pagination.page + 1,
        status: activeFilter,
        sortBy: activeSort,
        search: localSearch,
        append: true,
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const activeSortLabel = useMemo(() => {
    const opt = SORT_OPTIONS.find((s) => s.id === activeSort);
    return opt ? opt.label : 'Recent First';
  }, [activeSort]);

  const pendingCount = pagination?.pendingCount ?? inquiries.filter((i) => i.status !== 'Resolved').length;
  const resolvedCount = pagination?.resolvedCount ?? inquiries.filter((i) => i.status === 'Resolved').length;
  const totalCount = pagination?.total ?? inquiries.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconBox}>
              <MessageCircle size={18} color="#FF5E36" />
            </View>
            <View>
              <View style={styles.titleWithBadge}>
                <Text style={styles.headerTitle}>Customer Inquiries</Text>
                {pendingCount > 0 && (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>{pendingCount} new</Text>
                  </View>
                )}
              </View>
              <Text style={styles.headerSubtitle}>Direct customer WhatsApp, Web & concierge chats</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.refreshBtn}
              accessibilityLabel="Refresh inquiries list"
              activeOpacity={0.7}
              disabled={isLoading || refreshing}
            >
              <RefreshCw
                size={16}
                color={isLoading || refreshing ? '#FF5E36' : '#52525b'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close inquiries modal"
            >
              <X size={18} color="#09090b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search & Filter Section */}
        <View style={styles.filterSection}>
          <View style={styles.searchBar}>
            <Search size={14} color="#a1a1aa" />
            <TextInput
              placeholder="Search by client, outfit, or phone..."
              placeholderTextColor="#a1a1aa"
              value={localSearch}
              onChangeText={handleSearchTextChange}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {localSearch.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearSearchBtn}>
                <X size={14} color="#71717a" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.statusTabsRow}>
            <TouchableOpacity
              onPress={() => handleSelectFilter('all')}
              style={[styles.statusTab, activeFilter === 'all' && styles.statusTabActive]}
            >
              <Text style={[styles.statusTabText, activeFilter === 'all' && styles.statusTabTextActive]}>
                All ({totalCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectFilter('pending')}
              style={[styles.statusTab, activeFilter === 'pending' && styles.statusTabActive]}
            >
              <Text style={[styles.statusTabText, activeFilter === 'pending' && styles.statusTabTextActive]}>
                Active ({pendingCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectFilter('resolved')}
              style={[styles.statusTab, activeFilter === 'resolved' && styles.statusTabActive]}
            >
              <Text style={[styles.statusTabText, activeFilter === 'resolved' && styles.statusTabTextActive]}>
                Resolved ({resolvedCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sort Selection Row */}
          <View style={styles.sortBar}>
            <Text style={styles.sortCountLabel}>
              Showing {inquiries.length} of {totalCount} inquiries
            </Text>
            <TouchableOpacity
              onPress={() => setSortSheetOpen(true)}
              style={styles.sortSelectorBtn}
              activeOpacity={0.7}
            >
              <ArrowUpDown size={12} color="#FF5E36" />
              <Text style={styles.sortSelectorText}>{activeSortLabel}</Text>
              <ChevronDown size={12} color="#71717a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Inquiries List */}
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#FF5E36"
              colors={['#FF5E36']}
            />
          }
        >
          {isLoading && inquiries.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF5E36" />
              <Text style={styles.loadingText}>Fetching inquiries...</Text>
            </View>
          ) : inquiries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageCircle size={44} color="#d4d4d8" />
              <Text style={styles.emptyTitle}>No Inquiries Found</Text>
              <Text style={styles.emptySubtitle}>
                {localSearch
                  ? 'No inquiries match your active search criteria.'
                  : activeFilter === 'pending'
                  ? 'Great job! No pending customer inquiries right now.'
                  : activeFilter === 'resolved'
                  ? 'No resolved inquiries to display.'
                  : 'No client inquiries recorded yet.'}
              </Text>
            </View>
          ) : (
            <>
              {inquiries.map((inq) => (
                <InquiryItem
                  key={inq.id}
                  inquiry={inq}
                  onResolve={onResolveInquiry}
                />
              ))}

              {/* Load More Pagination Section */}
              {pagination?.hasMore ? (
                <View style={styles.loadMoreContainer}>
                  <TouchableOpacity
                    onPress={handleLoadMore}
                    style={styles.loadMoreBtn}
                    activeOpacity={0.8}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Text style={styles.loadMoreText}>
                          Load More (Page {pagination.page + 1} of {pagination.totalPages})
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : inquiries.length > 0 ? (
                <View style={styles.endOfListContainer}>
                  <Text style={styles.endOfListText}>All {totalCount} inquiries loaded</Text>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>

        {/* Sort Selection Bottom Sheet / Modal */}
        <Modal
          visible={sortSheetOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setSortSheetOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSortSheetOpen(false)}
          >
            <View style={styles.sortSheetCard}>
              <View style={styles.sortSheetHeader}>
                <View style={styles.sortHeaderIconRow}>
                  <ArrowUpDown size={16} color="#FF5E36" />
                  <Text style={styles.sortSheetTitle}>Sort Inquiries</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSortSheetOpen(false)}
                  style={styles.sheetCloseBtn}
                >
                  <X size={16} color="#09090b" />
                </TouchableOpacity>
              </View>

              <View style={styles.sortOptionsList}>
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = activeSort === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => handleSelectSort(opt.id)}
                      style={[
                        styles.sortOptionItem,
                        isSelected && styles.sortOptionItemSelected,
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={styles.sortOptionTextWrap}>
                        <Text
                          style={[
                            styles.sortOptionLabel,
                            isSelected && styles.sortOptionLabelSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text style={styles.sortOptionDesc}>{opt.description}</Text>
                      </View>
                      {isSelected && (
                        <View style={styles.sortCheckBadge}>
                          <Check size={14} color="#ffffff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fff0ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#09090b',
  },
  pendingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#FF5E36',
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f4f4f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#09090b',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  statusTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#f4f4f5',
  },
  statusTabActive: {
    backgroundColor: '#09090b',
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717a',
  },
  statusTabTextActive: {
    color: '#ffffff',
  },

  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  sortCountLabel: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '500',
  },
  sortSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff0ed',
    borderWidth: 1,
    borderColor: '#ffd5cc',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sortSelectorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#09090b',
  },

  listContent: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#71717a',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#09090b',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    maxWidth: 260,
  },

  loadMoreContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadMoreBtn: {
    backgroundColor: '#09090b',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  endOfListContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  endOfListText: {
    fontSize: 11,
    color: '#a1a1aa',
    fontWeight: '500',
  },

  /* Sort Sheet Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sortSheetCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 14,
  },
  sortSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    paddingBottom: 12,
  },
  sortHeaderIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortSheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#09090b',
  },
  sheetCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortOptionsList: {
    gap: 8,
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  sortOptionItemSelected: {
    backgroundColor: '#fff0ed',
    borderColor: '#FF5E36',
  },
  sortOptionTextWrap: {
    flex: 1,
    gap: 2,
  },
  sortOptionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  sortOptionLabelSelected: {
    color: '#FF5E36',
  },
  sortOptionDesc: {
    fontSize: 11,
    color: '#71717a',
  },
  sortCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF5E36',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
