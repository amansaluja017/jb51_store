import React, { useState, useMemo } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  RefreshControl
} from 'react-native';
import { Search, Plus, Tag, Package, XCircle } from 'lucide-react-native';
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
}

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
}: CatalogScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  // Filter products by search query and selected category
  const filteredCatalogue = useMemo(() => {
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

  return (
    <View style={styles.tabContent}>
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

      {/* Products List with Drag-to-Refresh */}
      <ScrollView 
        contentContainerStyle={styles.scrollPadding}
        alwaysBounceVertical={true}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5E36"
              colors={['#FF5E36']}
              progressBackgroundColor="#ffffff"
            />
          ) : undefined
        }
      >
        {isLoading && products.length === 0 ? (
          <CatalogSkeleton />
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={44} color="#d4d4d8" />
            <Text style={styles.emptyTitle}>Catalogue Empty</Text>
            <Text style={styles.emptyLabel}>
              No products found on the server. Tap "Add Product" above or pull down to refresh.
            </Text>
          </View>
        ) : filteredCatalogue.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Search size={40} color="#d4d4d8" />
            <Text style={styles.emptyTitle}>No Matching Products</Text>
            <Text style={styles.emptyLabel}>
              No products match your active search or category filter.
            </Text>
            {(searchQuery.length > 0 || selectedCategory !== 'All') && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                style={styles.clearFilterBtn}
              >
                <Text style={styles.clearFilterText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={styles.countSummaryRow}>
              <Text style={styles.countSummaryText}>
                Showing {filteredCatalogue.length} {filteredCatalogue.length === 1 ? 'outfit' : 'outfits'}
                {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
              </Text>
            </View>

            {filteredCatalogue.map(product => (
              <CatalogItem 
                key={product.id || product.slug}
                product={product}
                onToggleStock={onToggleStock}
                onUpdateVisibility={onUpdateVisibility}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
                onViewDetails={onViewProductDetails}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

