import React, { useState, useMemo, useEffect } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { useDebounce } from '../hooks/useDebounce';
import { Search, Plus, Tag, Package, XCircle, ChevronLeft, ChevronRight, Sparkles, RotateCw } from 'lucide-react-native';
import CatalogItem from '../components/CatalogItem';
import { CatalogSkeleton } from '../components/SkeletonLoader';
import { Product, PaginatedProductsResponse } from '../types';
import { Pagination } from '../components/ui';
import { isAbortError } from '../services/searchService';
import { useScrollMemory } from '../utils/scrollMemory';
import { triggerHaptic } from '../utils/haptics';
import styles from './CatalogScreen.styles';

export interface ProductSuggestionItem {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  price?: number;
  sellingPrice?: number;
}

export interface ProductSuggestionsData {
  products?: ProductSuggestionItem[];
  categories?: string[];
  tags?: string[];
}

export interface CatalogScreenProps {
  products: Product[];
  categories?: string[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isLoading: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onRefreshCategories?: () => Promise<void> | void;
  onAddProduct: () => void;
  onManageCategories: () => void;
  onToggleStock: (product: Product) => void;
  onUpdateVisibility: (product: Product, status: 'listed' | 'unListed') => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (slug: string, name: string) => void;
  onViewProductDetails?: (product: Product) => void;
  onFetchPaginatedProducts?: (params?: {
    search?: string;
    category?: string;
    inStockOnly?: boolean;
    sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc' | 'default';
    page?: number;
    limit?: number;
  }) => Promise<PaginatedProductsResponse>;
  onSearchProducts?: (params: {
    query?: string;
    category?: string;
    inStockOnly?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<{ items: Product[]; total?: number; metrics?: unknown }>;
  onGetProductSuggestions?: (query: string) => Promise<ProductSuggestionsData>;
}

const PAGE_SIZE = 8;

export default function CatalogScreen({
  products,
  categories = [],
  searchQuery,
  setSearchQuery,
  isLoading,
  refreshing,
  onRefresh,
  onRefreshCategories,
  onAddProduct,
  onManageCategories,
  onToggleStock,
  onUpdateVisibility,
  onEditProduct,
  onDeleteProduct,
  onViewProductDetails,
  onFetchPaginatedProducts,
  onSearchProducts,
  onGetProductSuggestions,
}: CatalogScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const keyboardHeight = useKeyboardHeight();
  const [page, setPage] = useState(1);
  const [remoteData, setRemoteData] = useState<{
    items: Product[];
    total: number;
    totalPages: number;
    page: number;
  } | null>(null);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { scrollViewRef, onScroll: handleScrollOffset } = useScrollMemory('catalog');

  // Debounced search query (500ms) - waits until user stops typing before querying backend
  const debouncedSearch = useDebounce(searchQuery.trim(), 500);
  const isSearchTyping = searchQuery.trim() !== debouncedSearch;
  const [suggestions, setSuggestions] = useState<ProductSuggestionsData | null>(null);

  // Derive unique categories from both API categories and products
  const categoryList = useMemo(() => {
    const list = new Set<string>();
    if (categories && categories.length > 0) {
      categories.forEach(c => {
        if (c && c.trim()) list.add(c.trim());
      });
    }
    products.forEach(p => {
      if (p.category && p.category.trim()) list.add(p.category.trim());
    });
    return Array.from(list);
  }, [categories, products]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  // Fetch Suggestions from backend pg_trgm route (only after typing stops)
  useEffect(() => {
    if (isSearchTyping) return;

    let isMounted = true;
    if (debouncedSearch && onGetProductSuggestions) {
      onGetProductSuggestions(debouncedSearch)
        .then((res) => {
          if (isMounted && res) {
            setSuggestions(res);
          }
        })
        .catch((err: unknown) => {
          if (isAbortError(err)) return;
          if (isMounted) setSuggestions(null);
        });
    } else {
      setSuggestions(null);
    }
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, isSearchTyping, onGetProductSuggestions]);

  // Hit backend search route using ILIKE or paginated route (only after typing stops)
  useEffect(() => {
    if (isSearchTyping) return;

    let isMounted = true;
    const fetchBackendProducts = async () => {
      setIsFetchingRemote(true);
      try {
        if (debouncedSearch && onSearchProducts) {
          // Backend ILIKE search route on product name, description, tags
          const searchRes = await onSearchProducts({
            query: debouncedSearch,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            limit: PAGE_SIZE,
          });
          if (isMounted && searchRes) {
            const items = searchRes.items || [];
            const total = searchRes.total ?? items.length;
            setRemoteData({
              items,
              total,
              totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
              page,
            });
          }
        } else if (onFetchPaginatedProducts) {
          const res = await onFetchPaginatedProducts({
            search: debouncedSearch || undefined,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            page,
            limit: PAGE_SIZE,
          });
          if (isMounted && res) {
            setRemoteData({
              items: res.items || [],
              total: res.total || 0,
              totalPages: res.totalPages || Math.max(1, Math.ceil((res.total || 0) / PAGE_SIZE)),
              page: res.page || page,
            });
          }
        }
      } catch (err: unknown) {
        if (isAbortError(err)) return;
        console.warn('[CatalogScreen fetch error]:', err);
      } finally {
        if (isMounted) setIsFetchingRemote(false);
      }
    };

    fetchBackendProducts();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, isSearchTyping, selectedCategory, page, refreshKey, onSearchProducts, onFetchPaginatedProducts]);

  const displayedProducts = remoteData
    ? remoteData.items
    : products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCount = remoteData
    ? remoteData.total
    : products.length;

  const totalPages = remoteData
    ? remoteData.totalPages
    : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);
  const startRecord = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(safePage * PAGE_SIZE, totalCount);

  const handleToggleStock = (prod: Product) => {
    onToggleStock(prod);
    setRefreshKey(k => k + 1);
  };

  const handleUpdateVisibility = (prod: Product, status: 'listed' | 'unListed') => {
    onUpdateVisibility(prod, status);
    setRefreshKey(k => k + 1);
  };

  const handleDeleteProduct = (slug: string, name: string) => {
    onDeleteProduct(slug, name);
    setRefreshKey(k => k + 1);
  };

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    onRefresh?.();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
      style={styles.tabContent}
    >
      {/* Search & Actions Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={14} color="#a1a1aa" />
          <TextInput 
            placeholder="Search products or categories..."
            placeholderTextColor="#a1a1aa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <XCircle size={14} color="#a1a1aa" />
            </TouchableOpacity>
          )}
        </View>

        {/* Backend pg_trgm Suggestions Bar */}
        {debouncedSearch.length > 0 && suggestions && ((suggestions.categories?.length || 0) > 0 || (suggestions.tags?.length || 0) > 0 || (suggestions.products?.length || 0) > 0) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6, maxHeight: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 }}>
              <Sparkles size={11} color="#FF5E36" />
              {suggestions.categories?.map((cat) => (
                <TouchableOpacity
                  key={`cat-${cat}`}
                  onPress={() => setSelectedCategory(cat)}
                  style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e4e4e7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}
                >
                  <Text style={{ fontSize: 10, color: '#18181b', fontWeight: '600' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
              {suggestions.tags?.map((tag) => (
                <TouchableOpacity
                  key={`tag-${tag}`}
                  onPress={() => setSearchQuery(tag)}
                  style={{ backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#ffedd5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}
                >
                  <Text style={{ fontSize: 10, color: '#FF5E36', fontWeight: '500' }}>#{tag}</Text>
                </TouchableOpacity>
              ))}
              {suggestions.products?.slice(0, 3).map((prod) => (
                <TouchableOpacity
                  key={`prod-${prod.id}`}
                  onPress={() => setSearchQuery(prod.name)}
                  style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e4e4e7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}
                >
                  <Text style={{ fontSize: 10, color: '#52525b' }} numberOfLines={1}>{prod.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onManageCategories} style={styles.categoriesButton} accessibilityRole="button">
            <Tag size={13} color="#09090b" />
            <Text style={styles.categoriesButtonText}>Manage Categories</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onAddProduct} style={styles.addButton} accessibilityRole="button">
            <Plus size={13} color="#fff" />
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Pills Filter Bar */}
      {categoryList.length > 0 && (
        <View style={styles.categoryPillsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillsScroll}
          >
            {onRefreshCategories && (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('light');
                  onRefreshCategories();
                }}
                style={styles.categoryReloadPill}
                accessibilityRole="button"
                accessibilityLabel="Reload categories"
                activeOpacity={0.7}
              >
                <RotateCw size={12} color="#71717a" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setSelectedCategory('All')}
              style={[
                styles.categoryPill,
                selectedCategory === 'All' && styles.categoryPillActive
              ]}
              accessibilityRole="button"
              accessibilityLabel="Show all categories"
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === 'All' && styles.categoryPillTextActive
                ]}
              >
                All ({products.length})
              </Text>
            </TouchableOpacity>

            {categoryList.map(cat => {
              const count = products.filter(
                p => p.category?.toLowerCase() === cat.toLowerCase()
              ).length;
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();

              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(isActive ? 'All' : cat)}
                  style={[
                    styles.categoryPill,
                    isActive && styles.categoryPillActive
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${cat}`}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      isActive && styles.categoryPillTextActive
                    ]}
                  >
                    {cat} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Products List with Drag-to-Refresh & Bottom Pagination */}
      <ScrollView 
        ref={scrollViewRef}
        onScroll={handleScrollOffset}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollPadding,
          keyboardHeight > 0 && { paddingBottom: keyboardHeight + 80 }
        ]}
        alwaysBounceVertical={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF5E36"
            colors={['#FF5E36']}
            progressBackgroundColor="#ffffff"
          />
        }
      >
        {(isLoading || isFetchingRemote) && (!refreshing || displayedProducts.length === 0) ? (
          <CatalogSkeleton />
        ) : totalCount === 0 ? (
          <View style={styles.emptyContainer}>
            {searchQuery || selectedCategory !== 'All' ? (
              <>
                <Search size={40} color="#d4d4d8" />
                <Text style={styles.emptyTitle}>No Matching Products</Text>
                <Text style={styles.emptyLabel}>
                  No products match your active search or category filter.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  style={styles.clearFilterBtn}
                >
                  <Text style={styles.clearFilterText}>Reset Filters</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Package size={44} color="#d4d4d8" />
                <Text style={styles.emptyTitle}>Catalogue Empty</Text>
                <Text style={styles.emptyLabel}>
                  No products found on the server. Tap "Add Product" above or pull down to refresh.
                </Text>
              </>
            )}
          </View>
        ) : (
          <>
            {totalPages > 1 ? (
              <View style={styles.countSummaryRow}>
                <Text style={styles.countSummaryText}>
                  Showing {startRecord}–{endRecord} of {totalCount} {totalCount === 1 ? 'outfit' : 'outfits'}
                  {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                </Text>
              </View>
            ) : selectedCategory !== 'All' ? (
              <View style={styles.countSummaryRow}>
                <Text style={styles.countSummaryText}>
                  {totalCount} {totalCount === 1 ? 'outfit' : 'outfits'} in {selectedCategory}
                </Text>
              </View>
            ) : null}

            {displayedProducts.map(product => (
              <CatalogItem 
                key={product.id || product.slug}
                product={product}
                onToggleStock={handleToggleStock}
                onUpdateVisibility={handleUpdateVisibility}
                onEdit={onEditProduct}
                onDelete={handleDeleteProduct}
                onViewDetails={onViewProductDetails}
              />
            ))}

            {/* Bottom Pagination */}
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalCount={totalCount}
              itemLabel={totalCount === 1 ? 'item' : 'items'}
              onPageChange={setPage}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
