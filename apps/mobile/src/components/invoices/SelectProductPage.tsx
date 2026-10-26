import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import styles from './SelectProductPage.styles';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';
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
  Ban,
} from 'lucide-react-native';
import { Product, isProductInStock, isProductDiscontinued } from '../../types';
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
  refreshing?: boolean;
  onRefresh?: () => void;
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
  refreshing,
  onRefresh,
}) => {
  const keyboardHeight = useKeyboardHeight();
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
          const sanitizedItems = res.items.filter((p: Product) => !isProductDiscontinued(p));
          setRemoteData({
            ...res,
            items: sanitizedItems,
            total: res.total !== undefined ? res.total : sanitizedItems.length,
          });
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

  // Derive unique categories (exclude discontinued)
  const categoryList = useMemo(() => {
    const set = new Set<string>();
    if (categories && categories.length > 0) {
      categories.forEach((c) => {
        if (c && c.trim()) set.add(c.trim());
      });
    }
    products
      .filter((p) => !isProductDiscontinued(p))
      .forEach((p) => {
        if (p.category && p.category.trim()) set.add(p.category.trim());
      });
    return ['All', ...Array.from(set)];
  }, [categories, products]);

  // Filter & sort (exclude discontinued)
  const filteredAndSorted = useMemo(() => {
    let list = products.filter((p) => !isProductDiscontinued(p));

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
      return (remoteData.items || []).filter((p) => !isProductDiscontinued(p));
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
                style={[
                  styles.productCard,
                  isSelected && styles.productCardSelected,
                  !inStock && styles.productCardDisabled,
                ]}
                onPress={() => {
                  if (inStock) {
                    onSelectProduct(prod);
                  }
                }}
                disabled={!inStock}
                activeOpacity={inStock ? 0.7 : 1}
                accessibilityRole="button"
                accessibilityState={{ disabled: !inStock }}
              >
                {/* Thumbnail */}
                <View style={[styles.imageWrapper, !inStock && styles.imageWrapperDisabled]}>
                  {thumbnail ? (
                    <Image
                      source={{ uri: thumbnail }}
                      style={[styles.productImage, !inStock && { opacity: 0.55 }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Package size={22} color={!inStock ? '#d4d4d8' : '#a1a1aa'} />
                    </View>
                  )}
                </View>

                {/* Details */}
                <View style={styles.productDetails}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.productName,
                        isSelected && styles.productNameSelected,
                        !inStock && styles.productNameDisabled,
                      ]}
                      numberOfLines={2}
                    >
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
                        {inStock ? 'In Stock' : 'Out of Stock (Disabled)'}
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
                    <Text style={[styles.productPrice, !inStock && styles.productPriceDisabled]}>
                      ₹{price.toLocaleString('en-IN')}
                    </Text>
                    {hasMrpDiscount && (
                      <Text style={styles.mrpText}>₹{prod.mrp.toLocaleString('en-IN')}</Text>
                    )}
                  </View>
                </View>

                {/* Check / Ban Indicator */}
                <View
                  style={[
                    styles.selectIndicator,
                    isSelected && styles.selectIndicatorActive,
                    !inStock && styles.selectIndicatorDisabled,
                  ]}
                >
                  {inStock ? (
                    <Check size={14} color={isSelected ? '#ffffff' : '#a1a1aa'} />
                  ) : (
                    <Ban size={13} color="#ef4444" />
                  )}
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
    </KeyboardAvoidingView>
  );
};

export default SelectProductPage;

