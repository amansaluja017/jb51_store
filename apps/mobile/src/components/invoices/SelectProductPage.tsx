import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  ShoppingBag,
  Package,
  Check,
  ArrowUpDown,
  Filter,
} from 'lucide-react-native';
import { Product, isProductInStock } from '../../types';
import { ProductSelectorSkeleton } from '../SkeletonLoader';

export interface SelectProductPageProps {
  products: Product[];
  categories?: string[];
  selectedProductId: string | null;
  onSelectProduct: (prod: Product) => void;
  onBack: () => void;
  isLoading?: boolean;
  onFetchPaginatedProducts?: (params: {
    search?: string;
    category?: string;
    inStockOnly?: boolean;
    sortBy?: SortOption;
    page?: number;
    limit?: number;
  }) => Promise<any>;
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc';

const PAGE_SIZE = 8;

export const SelectProductPage: React.FC<SelectProductPageProps> = ({
  products,
  categories = [],
  selectedProductId,
  onSelectProduct,
  onBack,
  isLoading = false,
  onFetchPaginatedProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [page, setPage] = useState(1);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [remoteData, setRemoteData] = useState<{
    items: Product[];
    total: number;
    totalPages: number;
    page: number;
  } | null>(null);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);

  // Hit the backend route for sorting, filter, search, and pagination
  useEffect(() => {
    if (!onFetchPaginatedProducts) return;

    let isCancelled = false;
    const fetchRemote = async () => {
      setIsFetchingRemote(true);
      try {
        const res = await onFetchPaginatedProducts({
          search: searchQuery.trim() || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          inStockOnly: inStockOnly ? true : undefined,
          sortBy,
          page,
          limit: PAGE_SIZE,
        });
        if (!isCancelled && res && Array.isArray(res.items)) {
          setRemoteData(res);
        }
      } catch (err) {
        console.error('[SelectProductPage remote fetch error]:', err);
      } finally {
        if (!isCancelled) setIsFetchingRemote(false);
      }
    };

    const timer = setTimeout(fetchRemote, searchQuery ? 250 : 0);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCategory, inStockOnly, sortBy, page, onFetchPaginatedProducts]);

  // Derive unique categories
  const categoryList = useMemo(() => {
    const set = new Set<string>();
    if (categories && categories.length > 0) {
      categories.forEach((c) => {
        if (c && c.trim()) set.add(c.trim());
      });
    }
    products.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return ['All', ...Array.from(set)];
  }, [categories, products]);

  // Filter & sort
  const filteredAndSorted = useMemo(() => {
    let list = [...products];

    // Search filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const slug = (p.slug || '').toLowerCase();
        return name.includes(q) || cat.includes(q) || slug.includes(q);
      });
    }

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(
        (p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // In-stock filter
    if (inStockOnly) {
      list = list.filter((p) => isProductInStock(p));
    }

    // Sorting
    list.sort((a, b) => {
      const priceA = Number(a.sellingPrice || a.price || 0);
      const priceB = Number(b.sellingPrice || b.price || 0);
      const nameA = (a.name || '').trim();
      const nameB = (b.name || '').trim();

      const getStockCount = (prod: Product) => {
        if (!prod.variants || prod.variants.length === 0) return 0;
        return prod.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      };

      switch (sortBy) {
        case 'name-asc':
          return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
        case 'name-desc':
          return nameB.localeCompare(nameA, 'en', { sensitivity: 'base' });
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'stock-desc':
          return getStockCount(b) - getStockCount(a);
        default:
          return 0;
      }
    });

    return list;
  }, [products, searchQuery, selectedCategory, inStockOnly, sortBy]);

  // Reset page when filters or sort change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, inStockOnly, sortBy]);

  const totalCount = remoteData ? remoteData.total : filteredAndSorted.length;
  const totalPages = remoteData ? Math.max(1, remoteData.totalPages) : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const displayProducts = useMemo(() => {
    if (remoteData) {
      return remoteData.items;
    }
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [remoteData, filteredAndSorted, safePage]);

  const sortLabels: Record<SortOption, string> = {
    'name-asc': 'Name (A → Z)',
    'name-desc': 'Name (Z → A)',
    'price-asc': 'Price: Low → High',
    'price-desc': 'Price: High → Low',
    'stock-desc': 'Highest Stock',
  };

  const startRecord = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(safePage * PAGE_SIZE, totalCount);

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Select Product</Text>
          <Text style={styles.headerSubtitle}>
            {totalCount} {totalCount === 1 ? 'item' : 'items'} available
          </Text>
        </View>

        <View style={{ width: 48 }} />
      </View>

      {/* Search & Sort Controls Section */}
      <View style={styles.controlsSection}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={15} color="#a1a1aa" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search product name, category..."
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

        {/* Sort Trigger & Stock Filter Bar */}
        <View style={styles.filterActionRow}>
          {/* Sort Selector Trigger */}
          <TouchableOpacity
            style={styles.sortTriggerBtn}
            onPress={() => setShowSortDropdown((prev) => !prev)}
            accessibilityRole="button"
          >
            <ArrowUpDown size={13} color="#FF5E36" style={{ marginRight: 6 }} />
            <Text style={styles.sortTriggerBtnText} numberOfLines={1}>
              {sortLabels[sortBy]}
            </Text>
          </TouchableOpacity>

          {/* In-Stock Toggle */}
          <TouchableOpacity
            style={[styles.stockToggleChip, inStockOnly && styles.stockToggleChipActive]}
            onPress={() => setInStockOnly((prev) => !prev)}
            accessibilityRole="button"
          >
            <Check size={12} color={inStockOnly ? '#ffffff' : '#71717a'} style={{ marginRight: 4 }} />
            <Text style={[styles.stockToggleChipText, inStockOnly && styles.stockToggleChipTextActive]}>
              In Stock Only
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown for Sort Options */}
        {showSortDropdown && (
          <View style={styles.sortDropdownMenu}>
            {(Object.keys(sortLabels) as SortOption[]).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.sortMenuItem, sortBy === opt && styles.sortMenuItemActive]}
                onPress={() => {
                  setSortBy(opt);
                  setShowSortDropdown(false);
                }}
              >
                <Text style={[styles.sortMenuItemText, sortBy === opt && styles.sortMenuItemTextActive]}>
                  {sortLabels[opt]}
                </Text>
                {sortBy === opt && <Check size={14} color="#FF5E36" />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Category Horizontal Pills */}
        {categoryList.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillsScroll}
          >
            {categoryList.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Product List */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isLoading || isFetchingRemote ? (
          <ProductSelectorSkeleton />
        ) : totalCount === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={36} color="#a1a1aa" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query, clearing category filters, or unchecking "In Stock Only".
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setInStockOnly(false);
              }}
              style={styles.clearFiltersBtn}
              accessibilityRole="button"
            >
              <Text style={styles.clearFiltersBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayProducts.map((prod) => {
            const isSelected = selectedProductId === prod.id;
            const inStock = isProductInStock(prod);
            const price = prod.sellingPrice || prod.price;
            const hasMrpDiscount = prod.mrp && prod.mrp > price;
            const variantsCount = prod.variants?.length || 0;
            const thumbnail = prod.images?.[0];

            return (
              <TouchableOpacity
                key={prod.id}
                style={[styles.productCard, isSelected && styles.productCardSelected]}
                onPress={() => onSelectProduct(prod)}
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                {/* Thumbnail */}
                <View style={styles.imageWrapper}>
                  {thumbnail ? (
                    <Image source={{ uri: thumbnail }} style={styles.productImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Package size={22} color="#a1a1aa" />
                    </View>
                  )}
                </View>

                {/* Details */}
                <View style={styles.productDetails}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.productName, isSelected && styles.productNameSelected]} numberOfLines={2}>
                      {prod.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Check size={11} color="#ffffff" />
                        <Text style={styles.selectedBadgeText}>Selected</Text>
                      </View>
                    )}
                  </View>

                  {/* Badges: Category & Stock */}
                  <View style={styles.badgesRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{prod.category || 'General'}</Text>
                    </View>
                    <View style={[styles.stockBadge, inStock ? styles.stockBadgeIn : styles.stockBadgeOut]}>
                      <Text style={[styles.stockBadgeText, inStock ? styles.stockBadgeTextIn : styles.stockBadgeTextOut]}>
                        {inStock ? 'In Stock' : 'Out of Stock'}
                      </Text>
                    </View>
                    {variantsCount > 0 && (
                      <Text style={styles.variantsBadgeText}>
                        • {variantsCount} {variantsCount === 1 ? 'variant' : 'variants'}
                      </Text>
                    )}
                  </View>

                  {/* Price */}
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>₹{price.toLocaleString('en-IN')}</Text>
                    {hasMrpDiscount && (
                      <Text style={styles.mrpText}>₹{prod.mrp.toLocaleString('en-IN')}</Text>
                    )}
                  </View>
                </View>

                {/* Check / Arrow */}
                <View style={[styles.selectIndicator, isSelected && styles.selectIndicatorActive]}>
                  <Check size={14} color={isSelected ? '#ffffff' : '#a1a1aa'} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Pagination Bar */}
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
    </View>
  );
};

export default SelectProductPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#18181b',
    marginLeft: 2,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 1,
  },
  controlsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#18181b',
    paddingVertical: 0,
  },
  filterActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sortTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '55%',
  },
  sortTriggerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c2410c',
  },
  stockToggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stockToggleChipActive: {
    backgroundColor: '#10b981',
  },
  stockToggleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
  },
  stockToggleChipTextActive: {
    color: '#ffffff',
  },
  sortDropdownMenu: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    marginTop: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sortMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  sortMenuItemActive: {
    backgroundColor: '#fff7ed',
  },
  sortMenuItemText: {
    fontSize: 13,
    color: '#3f3f46',
  },
  sortMenuItemTextActive: {
    color: '#c2410c',
    fontWeight: '700',
  },
  categoryPillsScroll: {
    paddingVertical: 8,
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#f4f4f5',
    marginRight: 6,
  },
  categoryPillActive: {
    backgroundColor: '#FF5E36',
  },
  categoryPillText: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productCardSelected: {
    borderColor: '#FF5E36',
    backgroundColor: '#fff7ed',
  },
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f4f4f5',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetails: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
    marginRight: 8,
    flex: 1,
  },
  productNameSelected: {
    color: '#c2410c',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5E36',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
    gap: 4,
  },
  categoryBadge: {
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71717a',
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockBadgeIn: {
    backgroundColor: '#dcfce7',
  },
  stockBadgeOut: {
    backgroundColor: '#fee2e2',
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  stockBadgeTextIn: {
    color: '#15803d',
  },
  stockBadgeTextOut: {
    color: '#b91c1c',
  },
  variantsBadgeText: {
    fontSize: 10,
    color: '#a1a1aa',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF5E36',
    marginRight: 6,
  },
  mrpText: {
    fontSize: 11,
    color: '#a1a1aa',
    textDecorationLine: 'line-through',
  },
  selectIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectIndicatorActive: {
    backgroundColor: '#FF5E36',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3f3f46',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  clearFiltersBtn: {
    backgroundColor: '#FF5E36',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  clearFiltersBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
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
