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
import { Search, Plus, Tag, Package, XCircle, ChevronLeft, ChevronRight } from 'lucide-react-native';
import CatalogItem from '../components/CatalogItem';
import { CatalogSkeleton } from '../components/SkeletonLoader';
import { Product } from '../types';
import styles from './CatalogScreen.styles';

interface CatalogScreenProps {
  products: Product[];
  categories?: string[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isLoading: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
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
    page?: number;
    limit?: number;
  }) => Promise<any>;
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
  onAddProduct,
  onManageCategories,
  onToggleStock,
  onUpdateVisibility,
  onEditProduct,
  onDeleteProduct,
  onViewProductDetails,
  onFetchPaginatedProducts,
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
  }, [searchQuery, selectedCategory]);



  // Client-side fallback if remote endpoint is unavailable
  const localFiltered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter(product => {
      const matchesSearch =
        !q ||
        (product.name && product.name.toLowerCase().includes(q)) ||
        (product.category && product.category.toLowerCase().includes(q)) ||
        (product.slug && product.slug.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' ||
        (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const displayedProducts = onFetchPaginatedProducts && remoteData 
    ? remoteData.items 
    : localFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCount = onFetchPaginatedProducts && remoteData 
    ? remoteData.total 
    : localFiltered.length;

  const totalPages = onFetchPaginatedProducts && remoteData 
    ? remoteData.totalPages 
    : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);
  const startRecord = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(safePage * PAGE_SIZE, totalCount);

  // Generate page numbers for the bottom pagination bar: e.g. [1, 2, 3, 4] or [1, '...', 4, 5, '...', 10]
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (safePage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (safePage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

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

            {/* Pagination Numbers at Bottom of Page */}
            {totalPages > 1 && (
              <View style={styles.paginationSection}>
                <View style={styles.paginationNumbersRow}>
                  {/* Previous Page Button */}
                  <TouchableOpacity
                    style={[styles.pageButton, safePage <= 1 && styles.pageButtonDisabled]}
                    onPress={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    accessibilityLabel="Previous page"
                    accessibilityRole="button"
                  >
                    <ChevronLeft size={16} color={safePage <= 1 ? '#d4d4d8' : '#18181b'} />
                  </TouchableOpacity>

                  {/* Numbered Page Buttons */}
                  {pageNumbers.map((pNum, idx) => {
                    if (pNum === '...') {
                      return (
                        <View key={`ellipsis-${idx}`} style={styles.pageEllipsis}>
                          <Text style={styles.pageEllipsisText}>...</Text>
                        </View>
                      );
                    }

                    const isCurrent = pNum === safePage;
                    return (
                      <TouchableOpacity
                        key={`page-${pNum}`}
                        style={[styles.pageNumberBtn, isCurrent && styles.pageNumberBtnActive]}
                        onPress={() => setPage(pNum as number)}
                        accessibilityLabel={`Page ${pNum}`}
                        accessibilityRole="button"
                      >
                        <Text style={[styles.pageNumberBtnText, isCurrent && styles.pageNumberBtnTextActive]}>
                          {pNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Next Page Button */}
                  <TouchableOpacity
                    style={[styles.pageButton, safePage >= totalPages && styles.pageButtonDisabled]}
                    onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    accessibilityLabel="Next page"
                    accessibilityRole="button"
                  >
                    <ChevronRight size={16} color={safePage >= totalPages ? '#d4d4d8' : '#18181b'} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.paginationInfoText}>
                  Page {safePage} of {totalPages} ({totalCount} total {totalCount === 1 ? 'item' : 'items'})
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
