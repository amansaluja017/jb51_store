import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Package,
  CheckCircle2,
  AlertCircle,
  Search,
  XCircle,
  Plus,
  Minus,
  Save,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  Tag,
  Eye,
  ImageOff,
  Sparkles,
  Lock,
  ChevronRight,
  History,
} from 'lucide-react-native';
import { InventorySkeleton } from '../components/SkeletonLoader';
import { Product, Variant, InventoryTransaction, isProductInStock } from '../types';
import InventoryHistoryModal from '../components/InventoryHistoryModal';

interface InventoryScreenProps {
  products: Product[];
  categories?: string[];
  isLoading: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onToggleStock: (product: Product) => void;
  onUpdateInventory: (product: Product, updatedVariants: Variant[], forceInStock?: boolean) => Promise<void>;
  onRecordTransaction?: (data: {
    productId: string;
    productVariantId?: string | null;
    type: 'sale' | 'purchase';
    quantity: number;
    name: string;
    phoneNumber?: string;
    email?: string;
    notes?: string;
    unitPrice?: number;
    totalAmount?: number;
  }) => Promise<void>;
  transactions?: InventoryTransaction[];
  isLoadingTransactions?: boolean;
  onFetchTransactions?: () => Promise<void>;
  onViewProductDetails?: (product: Product) => void;
  showAlert: (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm', onConfirm?: () => void) => void;
}

type StockFilter = 'all' | 'inStock' | 'outOfStock' | 'lowStock' | 'reserved';

const LOW_STOCK_THRESHOLD = 5;

const formatCurrency = (val: number) => {
  return `₹${val.toLocaleString('en-IN')}`;
};

const getColorHex = (colorName?: string, explicitHex?: string): string => {
  if (explicitHex && explicitHex.trim()) {
    return explicitHex.trim();
  }
  if (!colorName) return '#e4e4e7';
  const name = colorName.toLowerCase();
  if (name.includes('ivory') || name.includes('white') || name.includes('cream')) return '#FAF8F5';
  if (name.includes('black') || name.includes('noir')) return '#18181b';
  if (name.includes('red') || name.includes('crimson') || name.includes('maroon') || name.includes('ruby')) return '#9E1B32';
  if (name.includes('green') || name.includes('emerald') || name.includes('olive') || name.includes('mint')) return '#0B6623';
  if (name.includes('blue') || name.includes('navy') || name.includes('royal') || name.includes('indigo')) return '#1E3A8A';
  if (name.includes('yellow') || name.includes('gold') || name.includes('mustard')) return '#D97706';
  if (name.includes('pink') || name.includes('rose') || name.includes('blush') || name.includes('magenta')) return '#DB2777';
  if (name.includes('purple') || name.includes('violet') || name.includes('lavender') || name.includes('plum')) return '#7C3AED';
  if (name.includes('orange') || name.includes('rust') || name.includes('peach') || name.includes('terracotta')) return '#EA580C';
  if (name.includes('brown') || name.includes('beige') || name.includes('tan') || name.includes('camel')) return '#854D0E';
  if (name.includes('grey') || name.includes('gray') || name.includes('silver') || name.includes('charcoal')) return '#71717A';
  return '#e4e4e7';
};

export default function InventoryScreen({
  products,
  categories = [],
  isLoading,
  refreshing,
  onRefresh,
  onToggleStock,
  onUpdateInventory,
  onRecordTransaction,
  transactions = [],
  isLoadingTransactions = false,
  onFetchTransactions,
  onViewProductDetails,
  showAlert,
}: InventoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<StockFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Fetch transactions on mount
  React.useEffect(() => {
    onFetchTransactions?.();
  }, []);

  // Local pending variant stock edits: { [productSlug]: Variant[] }
  const [pendingStockEdits, setPendingStockEdits] = useState<Record<string, Variant[]>>({});
  const [savingSlugs, setSavingSlugs] = useState<Record<string, boolean>>({});

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

  // Overall metrics calculation
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    let inStockProducts = 0;
    let outOfStockProducts = 0;
    let lowStockProducts = 0;
    let hasReservedProducts = 0;
    let totalStockUnits = 0;
    let totalReservedUnits = 0;

    products.forEach(product => {
      const isInStock = isProductInStock(product);
      if (isInStock) {
        inStockProducts++;
      } else {
        outOfStockProducts++;
      }

      const variants = product.variants || [];
      const prodStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
      const prodReserved = variants.reduce((acc, v) => acc + (Number(v.reservedStock) || 0), 0);

      totalStockUnits += prodStock;
      totalReservedUnits += prodReserved;

      if (prodReserved > 0) {
        hasReservedProducts++;
      }

      if (isInStock && prodStock > 0 && prodStock <= LOW_STOCK_THRESHOLD) {
        lowStockProducts++;
      }
    });

    return {
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts,
      hasReservedProducts,
      totalStockUnits,
      totalReservedUnits,
    };
  }, [products]);

  // Filter products by search, stock filter, and category
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return products.filter(product => {
      const matchesSearch =
        !q ||
        (product.name && product.name.toLowerCase().includes(q)) ||
        (product.category && product.category.toLowerCase().includes(q)) ||
        (product.slug && product.slug.toLowerCase().includes(q)) ||
        (product.variants || []).some(v => v.color && v.color.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' ||
        (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());

      if (!matchesSearch || !matchesCategory) return false;

      const isInStock = isProductInStock(product);
      const variants = product.variants || [];
      const totalUnits = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
      const prodReserved = variants.reduce((acc, v) => acc + (Number(v.reservedStock) || 0), 0);

      if (activeFilter === 'inStock') {
        return isInStock;
      }
      if (activeFilter === 'outOfStock') {
        return !isInStock;
      }
      if (activeFilter === 'lowStock') {
        return isInStock && totalUnits > 0 && totalUnits <= LOW_STOCK_THRESHOLD;
      }
      if (activeFilter === 'reserved') {
        return prodReserved > 0;
      }
      return true;
    });
  }, [products, searchQuery, activeFilter, selectedCategory]);

  // Helper to get working variants (either modified pending or original)
  const getWorkingVariants = (product: Product): Variant[] => {
    return pendingStockEdits[product.slug] || product.variants || [];
  };

  // Adjust available stock for a variant
  const handleVariantStockChange = (product: Product, variantIndex: number, newStock: number) => {
    const validStock = Math.max(0, Math.floor(newStock));
    const currentVariants = getWorkingVariants(product);
    const updated = currentVariants.map((v, idx) =>
      idx === variantIndex ? { ...v, stock: validStock } : v
    );

    setPendingStockEdits(prev => ({
      ...prev,
      [product.slug]: updated,
    }));
  };

  // Adjust reserved stock for a variant
  const handleVariantReservedStockChange = (product: Product, variantIndex: number, newReserved: number) => {
    const validReserved = Math.max(0, Math.floor(newReserved));
    const currentVariants = getWorkingVariants(product);
    const updated = currentVariants.map((v, idx) =>
      idx === variantIndex ? { ...v, reservedStock: validReserved } : v
    );

    setPendingStockEdits(prev => ({
      ...prev,
      [product.slug]: updated,
    }));
  };

  // Restock all variants of a product by +N units available
  const handleBatchAddStock = (product: Product, addQty: number) => {
    const currentVariants = getWorkingVariants(product);
    const updated = currentVariants.map(v => ({
      ...v,
      stock: Math.max(0, (Number(v.stock) || 0) + addQty),
    }));

    setPendingStockEdits(prev => ({
      ...prev,
      [product.slug]: updated,
    }));
  };

  // Clear all reserved units for a product
  const handleClearAllReserved = (product: Product) => {
    const currentVariants = getWorkingVariants(product);
    const updated = currentVariants.map(v => ({
      ...v,
      reservedStock: 0,
    }));

    setPendingStockEdits(prev => ({
      ...prev,
      [product.slug]: updated,
    }));
  };

  // Reset pending edits for a product
  const handleDiscardChanges = (slug: string) => {
    setPendingStockEdits(prev => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  };

  // Save changes for a product
  const handleSaveProductStock = async (product: Product) => {
    const editedVariants = pendingStockEdits[product.slug];
    if (!editedVariants) return;

    setSavingSlugs(prev => ({ ...prev, [product.slug]: true }));
    try {
      await onUpdateInventory(product, editedVariants);
      // Remove from pending on success
      setPendingStockEdits(prev => {
        const next = { ...prev };
        delete next[product.slug];
        return next;
      });
      // Refresh transactions history immediately
      await onFetchTransactions?.();
    } catch (err: any) {
      console.error('[Inventory Update Error]:', err);
    } finally {
      setSavingSlugs(prev => ({ ...prev, [product.slug]: false }));
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Search & Filter Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Search size={15} color="#a1a1aa" />
          <TextInput
            placeholder="Search inventory by name, slug, color..."
            placeholderTextColor="#a1a1aa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <XCircle size={15} color="#a1a1aa" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pill Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            onPress={() => setSelectedCategory('All')}
            style={[styles.categoryPill, selectedCategory === 'All' && styles.categoryPillActive]}
          >
            <Text style={[styles.categoryPillText, selectedCategory === 'All' && styles.categoryPillTextActive]}>
              All Categories
            </Text>
          </TouchableOpacity>
          {categoryList.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
            >
              <Text style={[styles.categoryPillText, selectedCategory === cat && styles.categoryPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Inventory Scroll Area */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollPadding}
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
        {/* Top Quick Actions: Transaction History */}
        <View style={styles.topActionsRow}>
          <TouchableOpacity
            onPress={() => {
              onFetchTransactions?.();
              setHistoryModalOpen(true);
            }}
            style={styles.historyBtn}
            activeOpacity={0.8}
          >
            <History size={15} color="#18181b" />
            <Text style={styles.historyBtnText}>History</Text>
            {transactions.length > 0 && (
              <View style={styles.historyBadge}>
                <Text style={styles.historyBadgeText}>{transactions.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* KPI Metrics Dashboard Card */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsHeaderRow}>
            <View style={styles.metricsHeaderLeft}>
              <Package size={15} color="#5A1827" />
              <Text style={styles.metricsSectionTitle}>Stock Ledger Snapshot</Text>
            </View>
            <View style={styles.metricsTotalPill}>
              <Text style={styles.metricsTotalPillText}>{metrics.totalStockUnits} units total</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.metricCardTotal]}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIconBox, { backgroundColor: '#F2ECE1' }]}>
                  <Package size={13} color="#1F1A1B" />
                </View>
                <Text style={styles.metricLabel}>Total Styles</Text>
              </View>
              <Text style={styles.metricValue}>{metrics.totalProducts}</Text>
              <Text style={styles.metricSub}>{metrics.totalStockUnits} total units</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardInStock]}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIconBox, { backgroundColor: '#DDEEE5' }]}>
                  <CheckCircle2 size={13} color="#1F4E3D" />
                </View>
                <Text style={[styles.metricLabel, { color: '#1F4E3D' }]}>In Stock</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#1F4E3D' }]}>{metrics.inStockProducts}</Text>
              <Text style={[styles.metricSub, { color: '#2E6853' }]}>Ready to order</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardOutOfStock]}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIconBox, { backgroundColor: '#FCE4E0' }]}>
                  <AlertCircle size={13} color="#B95C3F" />
                </View>
                <Text style={[styles.metricLabel, { color: '#B95C3F' }]}>Out of Stock</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#5A1827' }]}>{metrics.outOfStockProducts}</Text>
              <Text style={[styles.metricSub, { color: '#A34A30' }]}>Needs restock</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardLowStock]}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIconBox, { backgroundColor: '#FCEECC' }]}>
                  <Sparkles size={13} color="#D97A35" />
                </View>
                <Text style={[styles.metricLabel, { color: '#C06826' }]}>Low Stock</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#A6561B' }]}>{metrics.lowStockProducts}</Text>
              <Text style={[styles.metricSub, { color: '#C06826' }]}>≤ {LOW_STOCK_THRESHOLD} pcs left</Text>
            </View>
          </View>

          {/* Reserved Stock Callout Banner */}
          <View style={styles.reservedBanner}>
            <View style={styles.reservedBannerLeft}>
              <View style={styles.reservedBannerIcon}>
                <Lock size={13} color="#B95C3F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reservedBannerTitle}>Customer Holds & Tailoring Reserves</Text>
                <Text style={styles.reservedBannerSub}>
                  {metrics.totalReservedUnits} units held across {metrics.hasReservedProducts} {metrics.hasReservedProducts === 1 ? 'outfit' : 'outfits'}
                </Text>
              </View>
            </View>
            {metrics.hasReservedProducts > 0 && (
              <TouchableOpacity
                onPress={() => setActiveFilter(activeFilter === 'reserved' ? 'all' : 'reserved')}
                style={[styles.reservedBannerBtn, activeFilter === 'reserved' && styles.reservedBannerBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.reservedBannerBtnText, activeFilter === 'reserved' && styles.reservedBannerBtnTextActive]}>
                  {activeFilter === 'reserved' ? 'Showing Holds' : 'View Holds'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.filterTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsScroll}
          >
            <TouchableOpacity
              onPress={() => setActiveFilter('all')}
              style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeFilter === 'all' && styles.filterTabTextActive]}>
                All ({metrics.totalProducts})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('inStock')}
              style={[styles.filterTab, activeFilter === 'inStock' && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeFilter === 'inStock' && styles.filterTabTextActive]}>
                In Stock ({metrics.inStockProducts})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('outOfStock')}
              style={[styles.filterTab, activeFilter === 'outOfStock' && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeFilter === 'outOfStock' && styles.filterTabTextActive]}>
                Out of Stock ({metrics.outOfStockProducts})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('lowStock')}
              style={[styles.filterTab, activeFilter === 'lowStock' && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeFilter === 'lowStock' && styles.filterTabTextActive]}>
                Low Stock ({metrics.lowStockProducts})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('reserved')}
              style={[styles.filterTab, activeFilter === 'reserved' && styles.filterTabActiveReserved]}
            >
              <Lock size={11} color={activeFilter === 'reserved' ? '#ffffff' : '#C0603A'} style={{ marginRight: 4 }} />
              <Text style={[styles.filterTabText, activeFilter === 'reserved' && styles.filterTabTextActive]}>
                Reserved ({metrics.hasReservedProducts})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Product Inventory Items */}
        {isLoading && products.length === 0 ? (
          <InventorySkeleton />
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={44} color="#d4d4d8" />
            <Text style={styles.emptyTitle}>No Outfits Found</Text>
            <Text style={styles.emptySubtitle}>
              No products match your current search or stock status filters.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setSelectedCategory('All');
              }}
              style={styles.resetFilterBtn}
            >
              <Text style={styles.resetFilterBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsList}>
            {filteredProducts.map(product => {
              const workingVariants = getWorkingVariants(product);
              const hasPendingChanges = !!pendingStockEdits[product.slug];
              const isSaving = !!savingSlugs[product.slug];

              const totalCurrentStock = workingVariants.reduce(
                (acc, v) => acc + (Number(v.stock) || 0),
                0
              );
              const totalCurrentReserved = workingVariants.reduce(
                (acc, v) => acc + (Number(v.reservedStock) || 0),
                0
              );
              const isCurrentlyInStock = isProductInStock(product);
              const rawImage = product.images && product.images.length > 0 ? product.images[0] : null;

              return (
                <View key={product.id || product.slug} style={styles.productCard}>
                  {/* Product Header Row */}
                  <TouchableOpacity
                    onPress={() => onViewProductDetails?.(product)}
                    activeOpacity={0.7}
                    style={styles.cardHeaderRow}
                    accessibilityRole="button"
                    accessibilityLabel={`View details for ${product.name}`}
                  >
                    {rawImage ? (
                      <Image source={{ uri: rawImage }} style={styles.productThumb} resizeMode="cover" />
                    ) : (
                      <View style={[styles.productThumb, styles.noThumb]}>
                        <ImageOff size={20} color="#a1a1aa" />
                      </View>
                    )}

                    <View style={styles.productHeaderMeta}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <View style={styles.productSubRow}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText} numberOfLines={1}>
                            {product.category || 'Uncategorized'}
                          </Text>
                        </View>
                        <Text style={styles.productPrice}>
                          {formatCurrency(product.sellingPrice ?? product.price ?? 0)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardHeaderRight}>
                      <View
                        style={[
                          styles.stockBadge,
                          isCurrentlyInStock ? styles.stockBadgeInStock : styles.stockBadgeOutOfStock,
                        ]}
                      >
                        <View
                          style={[
                            styles.stockDot,
                            isCurrentlyInStock ? styles.stockDotInStock : styles.stockDotOutOfStock,
                          ]}
                        />
                        <Text
                          style={[
                            styles.stockBadgeText,
                            isCurrentlyInStock ? styles.stockBadgeTextInStock : styles.stockBadgeTextOutOfStock,
                          ]}
                        >
                          {isCurrentlyInStock ? 'In Stock' : 'Out of Stock'}
                        </Text>
                      </View>
                      <View style={styles.cardHeaderCountsCol}>
                        <Text style={styles.totalUnitsText}>{totalCurrentStock} avail</Text>
                        {totalCurrentReserved > 0 && (
                          <View style={styles.headerReservedPill}>
                            <Lock size={9} color="#c2410c" style={{ marginRight: 2 }} />
                            <Text style={styles.headerReservedPillText}>{totalCurrentReserved} held</Text>
                          </View>
                        )}
                      </View>
                      <ChevronRight size={14} color="#a1a1aa" style={{ marginTop: 2 }} />
                    </View>
                  </TouchableOpacity>

                  {/* Master In-Stock Toggle Row */}
                  <View style={styles.masterToggleRow}>
                    <View style={styles.switchInfo}>
                      <View style={styles.switchTitleRow}>
                        <Eye size={13} color="#FF5E36" />
                        <Text style={styles.switchLabel}>Storefront Availability</Text>
                      </View>
                      <Text style={styles.switchSub}>
                        {isCurrentlyInStock ? 'Active in client store & checkout flow' : 'Marked unavailable for purchase'}
                      </Text>
                    </View>
                    <Switch
                      value={isCurrentlyInStock}
                      onValueChange={() => onToggleStock(product)}
                      trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {/* Variants Management Section */}
                  <View style={styles.variantsSection}>
                    <View style={styles.variantsHeader}>
                      <View style={styles.variantsHeaderTop}>
                        <View style={styles.variantsHeaderLeft}>
                          <Layers size={13} color="#FF5E36" />
                          <View>
                            <Text style={styles.variantsHeaderTitle}>Variants & Stock Matrix</Text>
                            <Text style={styles.variantsHeaderSubtitle}>
                              {totalCurrentStock} available • {totalCurrentReserved} reserved
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.quickAddRow}>
                        <TouchableOpacity
                          onPress={() => handleBatchAddStock(product, 5)}
                          style={styles.quickAddBtn}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.quickAddBtnText}>+5 Avail</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleBatchAddStock(product, 10)}
                          style={styles.quickAddBtn}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.quickAddBtnText}>+10 Avail</Text>
                        </TouchableOpacity>
                        {totalCurrentReserved > 0 && (
                          <TouchableOpacity
                            onPress={() => handleClearAllReserved(product)}
                            style={styles.clearReservedBtn}
                            activeOpacity={0.7}
                          >
                            <RotateCcw size={10} color="#c2410c" />
                            <Text style={styles.clearReservedBtnText}>Clear Holds ({totalCurrentReserved})</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <View style={styles.variantsList}>
                      {workingVariants.map((variant, vIdx) => {
                        const stockVal = Number(variant.stock) || 0;
                        const reservedVal = Number(variant.reservedStock) || 0;
                        const swatchColor = getColorHex(variant.color, variant.hexCode);
                        const isOos = stockVal === 0;
                        const hasReserved = reservedVal > 0;

                        return (
                          <View key={`variant_${vIdx}`} style={styles.variantCard}>
                            {/* Variant Top Meta */}
                            <View style={styles.variantTopRow}>
                              <View style={styles.variantLeft}>
                                <View
                                  style={[
                                    styles.colorSwatch,
                                    { backgroundColor: swatchColor },
                                    swatchColor.toLowerCase() === '#ffffff' || swatchColor.toLowerCase() === '#faf8f5'
                                      ? styles.swatchBorder
                                      : null,
                                  ]}
                                />
                                <View style={styles.variantNameCol}>
                                  <Text style={styles.variantColorTitle}>{variant.color || 'Standard'}</Text>
                                  {variant.size ? (
                                    <View style={styles.variantSizeBadge}>
                                      <Text style={styles.variantSizeText}>{variant.size}</Text>
                                    </View>
                                  ) : null}
                                </View>
                              </View>

                              <View style={styles.variantStatusBadges}>
                                <View
                                  style={[
                                    styles.variantStatusBadge,
                                    isOos ? styles.variantStatusOos : styles.variantStatusAvail,
                                  ]}
                                >
                                  <View
                                    style={[
                                      styles.variantDot,
                                      isOos ? styles.variantDotOos : styles.variantDotAvail,
                                    ]}
                                  />
                                  <Text
                                    style={[
                                      styles.variantStatusText,
                                      isOos ? styles.variantStatusTextOos : styles.variantStatusTextAvail,
                                    ]}
                                  >
                                    {stockVal} avail
                                  </Text>
                                </View>
                                {hasReserved && (
                                  <View style={[styles.variantStatusBadge, styles.variantStatusReserved]}>
                                    <Lock size={10} color="#c2410c" style={{ marginRight: 3 }} />
                                    <Text style={styles.variantStatusTextReserved}>
                                      {reservedVal} held
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>

                            {/* Dual Management Row: Available Stock & Reserved Stock */}
                            <View style={styles.variantDualEditors}>
                              {/* Available Stock Group */}
                              <View style={styles.variantEditorCol}>
                                <Text style={styles.editorColLabel}>AVAILABLE STOCK</Text>
                                <View style={styles.stepperContainer}>
                                  <TouchableOpacity
                                    onPress={() => handleVariantStockChange(product, vIdx, stockVal - 1)}
                                    style={[styles.stepperBtn, stockVal <= 0 && styles.stepperBtnDisabled]}
                                    disabled={stockVal <= 0}
                                    activeOpacity={0.7}
                                  >
                                    <Minus size={13} color={stockVal <= 0 ? '#d4d4d8' : '#18181b'} />
                                  </TouchableOpacity>

                                  <TextInput
                                    style={[styles.stockInput, isOos && styles.stockInputOos]}
                                    keyboardType="number-pad"
                                    value={String(stockVal)}
                                    onChangeText={val => {
                                      const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
                                      handleVariantStockChange(product, vIdx, isNaN(parsed) ? 0 : parsed);
                                    }}
                                    selectTextOnFocus
                                  />

                                  <TouchableOpacity
                                    onPress={() => handleVariantStockChange(product, vIdx, stockVal + 1)}
                                    style={[styles.stepperBtn, styles.stepperBtnPlus]}
                                    activeOpacity={0.7}
                                  >
                                    <Plus size={13} color="#FF5E36" />
                                  </TouchableOpacity>
                                </View>
                              </View>

                              <View style={styles.editorDivider} />

                              {/* Reserved Stock Group */}
                              <View style={styles.variantEditorCol}>
                                <View style={styles.editorColHeaderRow}>
                                  <Text style={[styles.editorColLabel, hasReserved && styles.editorColLabelReserved]}>
                                    CUSTOMER HOLDS
                                  </Text>
                                  {hasReserved && (
                                    <TouchableOpacity
                                      onPress={() => handleVariantReservedStockChange(product, vIdx, 0)}
                                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                      style={styles.resetReservedMiniBtn}
                                      accessibilityLabel="Release reserved stock to 0"
                                    >
                                      <RotateCcw size={10} color="#c2410c" />
                                    </TouchableOpacity>
                                  )}
                                </View>
                                <View style={styles.stepperContainer}>
                                  <TouchableOpacity
                                    onPress={() => handleVariantReservedStockChange(product, vIdx, reservedVal - 1)}
                                    style={[
                                      styles.stepperBtn,
                                      reservedVal <= 0 && styles.stepperBtnDisabled,
                                    ]}
                                    disabled={reservedVal <= 0}
                                    activeOpacity={0.7}
                                  >
                                    <Minus size={13} color={reservedVal <= 0 ? '#d4d4d8' : '#c2410c'} />
                                  </TouchableOpacity>

                                  <TextInput
                                    style={[
                                      styles.stockInput,
                                      styles.reservedStockInput,
                                      hasReserved && styles.reservedStockInputActive,
                                    ]}
                                    keyboardType="number-pad"
                                    value={String(reservedVal)}
                                    onChangeText={val => {
                                      const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
                                      handleVariantReservedStockChange(product, vIdx, isNaN(parsed) ? 0 : parsed);
                                    }}
                                    selectTextOnFocus
                                  />

                                  <TouchableOpacity
                                    onPress={() => handleVariantReservedStockChange(product, vIdx, reservedVal + 1)}
                                    style={[styles.stepperBtn, styles.stepperBtnReservedPlus]}
                                    activeOpacity={0.7}
                                  >
                                    <Plus size={13} color="#c2410c" />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {/* Action Bar (Appears when modifications exist) */}
                  {hasPendingChanges && (
                    <View style={styles.saveActionBar}>
                      <TouchableOpacity
                        onPress={() => handleDiscardChanges(product.slug)}
                        style={styles.discardBtn}
                        disabled={isSaving}
                      >
                        <RotateCcw size={14} color="#71717a" />
                        <Text style={styles.discardBtnText}>Discard</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleSaveProductStock(product)}
                        style={styles.saveStockBtn}
                        disabled={isSaving}
                        activeOpacity={0.8}
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <>
                            <Save size={14} color="#ffffff" />
                            <Text style={styles.saveStockBtnText}>Save Changes</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>


      {/* Admin Inventory Transaction History Modal */}
      <InventoryHistoryModal
        visible={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        transactions={transactions}
        isLoading={isLoadingTransactions}
        onRefresh={() => onFetchTransactions?.()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  searchHeader: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#18181b',
    paddingVertical: 0,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
  },
  categoryPillActive: {
    backgroundColor: '#18181b',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },

  scrollBody: {
    flex: 1,
  },
  scrollPadding: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
    gap: 14,
  },

  // KPI Dashboard
  metricsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAE3D2',
    shadowColor: '#1F1A1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  metricsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metricsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F1A1B',
    letterSpacing: -0.2,
  },
  metricsTotalPill: {
    backgroundColor: '#FAF6EF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE3D2',
  },
  metricsTotalPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#5A1827',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
    minHeight: 88,
  },
  metricCardTotal: {
    backgroundColor: '#FAF8F5',
    borderColor: '#EAE3D2',
  },
  metricCardInStock: {
    backgroundColor: '#F0F7F4',
    borderColor: '#CBE4D8',
  },
  metricCardOutOfStock: {
    backgroundColor: '#FCF2F0',
    borderColor: '#F6D3CD',
  },
  metricCardLowStock: {
    backgroundColor: '#FEF9EF',
    borderColor: '#F7E5BF',
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metricIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#524749',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F1A1B',
    letterSpacing: -0.5,
  },
  metricSub: {
    fontSize: 10.5,
    color: '#82787A',
    marginTop: 2,
    fontWeight: '500',
  },

  // Reserved Stock Banner Callout
  reservedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF4EB',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EAE0CF',
  },
  reservedBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  reservedBannerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F4E7D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservedBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C1E16',
  },
  reservedBannerSub: {
    fontSize: 11,
    color: '#C0603A',
    marginTop: 1,
    fontWeight: '500',
  },
  reservedBannerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1F1A1B',
  },
  reservedBannerBtnActive: {
    backgroundColor: '#FF5E36',
  },
  reservedBannerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FDFBF7',
  },
  reservedBannerBtnTextActive: {
    color: '#ffffff',
  },

  // Filter Tabs
  filterTabsWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE3D2',
  },
  filterTabsScroll: {
    padding: 4,
    gap: 6,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: '#1F1A1B',
  },
  filterTabActiveReserved: {
    backgroundColor: '#C0603A',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717a',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },

  // Products List
  productsList: {
    gap: 14,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f4f4f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productThumb: {
    width: 54,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
  },
  noThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productHeaderMeta: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  productSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: 110,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#71717a',
  },
  productCategory: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '500',
  },
  dotSeparator: {
    fontSize: 11,
    color: '#d4d4d8',
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18181b',
  },

  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  stockBadgeInStock: {
    backgroundColor: '#ecfdf5',
  },
  stockBadgeOutOfStock: {
    backgroundColor: '#fef2f2',
  },
  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  stockDotInStock: {
    backgroundColor: '#10b981',
  },
  stockDotOutOfStock: {
    backgroundColor: '#ef4444',
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  stockBadgeTextInStock: {
    color: '#15803d',
  },
  stockBadgeTextOutOfStock: {
    color: '#b91c1c',
  },
  cardHeaderCountsCol: {
    alignItems: 'flex-end',
    marginTop: 2,
  },
  totalUnitsText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#71717a',
  },
  headerReservedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 2,
    borderWidth: 0.5,
    borderColor: '#fed7aa',
  },
  headerReservedPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#c2410c',
  },

  // Master Switch Row
  masterToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  switchInfo: {
    flex: 1,
    marginRight: 8,
  },
  switchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18181b',
  },
  switchSub: {
    fontSize: 10.5,
    color: '#71717a',
    marginTop: 2,
  },

  // Variants Section
  variantsSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  variantsHeader: {
    marginBottom: 10,
    gap: 8,
  },
  variantsHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  variantsHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  variantsHeaderSubtitle: {
    fontSize: 10,
    color: '#a1a1aa',
    marginTop: 1,
    fontWeight: '500',
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickAddBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 6,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  quickAddBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#18181b',
  },
  clearReservedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  clearReservedBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#c2410c',
  },

  variantsList: {
    gap: 8,
  },
  variantCard: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f4f4f5',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  variantTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  colorSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  swatchBorder: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
  },
  variantNameCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  variantColorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18181b',
  },
  variantSizeBadge: {
    backgroundColor: '#e4e4e7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  variantSizeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#27272a',
  },
  variantStatusBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  variantStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  variantStatusAvail: {
    backgroundColor: '#ecfdf5',
    borderWidth: 0.5,
    borderColor: '#a7f3d0',
  },
  variantStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  variantStatusTextAvail: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  variantStatusOos: {
    backgroundColor: '#fef2f2',
    borderWidth: 0.5,
    borderColor: '#fecaca',
  },
  variantStatusTextOos: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b91c1c',
  },
  variantStatusReserved: {
    backgroundColor: '#fff7ed',
    borderWidth: 0.5,
    borderColor: '#fed7aa',
  },
  variantStatusTextReserved: {
    fontSize: 10,
    fontWeight: '700',
    color: '#c2410c',
  },
  variantDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  variantDotAvail: {
    backgroundColor: '#10b981',
  },
  variantDotOos: {
    backgroundColor: '#ef4444',
  },

  // Dual Controls Row
  variantDualEditors: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  variantEditorCol: {
    flex: 1,
    alignItems: 'center',
  },
  editorColHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 5,
  },
  editorColLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#a1a1aa',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  editorColLabelReserved: {
    color: '#c2410c',
    marginBottom: 0,
  },
  resetReservedMiniBtn: {
    padding: 2,
  },
  editorDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#f4f4f5',
    marginHorizontal: 6,
  },

  // Steppers
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnPlus: {
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
  },
  stepperBtnReserved: {
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
  },
  stepperBtnReservedPlus: {
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
  },
  stepperBtnDisabled: {
    backgroundColor: '#fafafa',
    borderColor: '#f4f4f5',
  },
  stockInput: {
    minWidth: 38,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#18181b',
    paddingVertical: 0,
    paddingHorizontal: 2,
  },
  stockInputOos: {
    color: '#dc2626',
    borderColor: '#fecaca',
    backgroundColor: '#fff5f5',
  },
  reservedStockInput: {
    borderColor: '#e4e4e7',
  },
  reservedStockInputActive: {
    color: '#c2410c',
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
  },

  // Save changes action bar
  saveActionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
  },
  discardBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
  },
  saveStockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF5E36',
  },
  saveStockBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Empty & loading
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#71717a',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181b',
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#71717a',
    textAlign: 'center',
    maxWidth: 260,
  },
  resetFilterBtn: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#18181b',
  },
  resetFilterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  historyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#18181b',
  },
  historyBadge: {
    backgroundColor: '#FF5E36',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
});
