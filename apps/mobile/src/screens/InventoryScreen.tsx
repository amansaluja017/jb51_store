import React, { useState, useMemo } from 'react';
import {
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  RefreshControl,
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
  Layers,
  Eye,
  ImageOff,
  Sparkles,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  History,
} from 'lucide-react-native';
import { InventorySkeleton } from '../components/SkeletonLoader';
import { Product, Variant, InventoryTransaction, isProductInStock } from '../types';
import InventoryHistoryModal from '../components/InventoryHistoryModal';
import styles from './InventoryScreen.styles';

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
  onFetchPaginatedStock?: (params?: {
    search?: string;
    category?: string;
    stockFilter?: 'all' | 'inStock' | 'outOfStock' | 'lowStock' | 'reserved';
    sortBy?: 'default' | 'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc';
    page?: number;
    limit?: number;
  }) => Promise<any>;
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
  onRecordTransaction: _onRecordTransaction,
  transactions = [],
  isLoadingTransactions = false,
  onFetchTransactions,
  onViewProductDetails,
  showAlert: _showAlert,
  onFetchPaginatedStock,
}: InventoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<StockFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  type SortOption = 'default' | 'stockAsc' | 'stockDesc';
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  const [remoteStockData, setRemoteStockData] = useState<{
    items: Product[];
    total: number;
    totalPages: number;
    page: number;
    metrics?: {
      totalProducts: number;
      inStockProducts: number;
      outOfStockProducts: number;
      lowStockProducts: number;
      hasReservedProducts: number;
      totalStockUnits: number;
      totalReservedUnits: number;
    };
  } | null>(null);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [collapsedSlugs, setCollapsedSlugs] = useState<Record<string, boolean>>({});
  const [allCollapsed, setAllCollapsed] = useState<boolean>(true);
  
  // History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Fetch transactions on mount
  React.useEffect(() => {
    onFetchTransactions?.();
  }, []);

  // Reset page to 1 whenever search, filter, category or sort changes
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, activeFilter, selectedCategory, sortBy]);

  // Query backend route for paginated stock & store-wide metrics
  React.useEffect(() => {
    if (!onFetchPaginatedStock) return;

    let isCancelled = false;
    const fetchRemote = async () => {
      setIsFetchingRemote(true);
      try {
        const res = await onFetchPaginatedStock({
          search: searchQuery.trim() || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          stockFilter: activeFilter,
          sortBy: sortBy === 'stockAsc' ? 'stock-asc' : sortBy === 'stockDesc' ? 'stock-desc' : 'default',
          page,
          limit: PAGE_SIZE,
        });
        if (!isCancelled && res && Array.isArray(res.items)) {
          setRemoteStockData(res);
        }
      } catch (err) {
        console.error('[InventoryScreen pagination error]:', err);
      } finally {
        if (!isCancelled) setIsFetchingRemote(false);
      }
    };

    const timer = setTimeout(fetchRemote, searchQuery ? 250 : 0);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, activeFilter, selectedCategory, sortBy, page, refreshKey, onFetchPaginatedStock]);

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

  // Helper to compute a product's current total stock
  const getProductTotalStock = (p: Product) => {
    const variants = pendingStockEdits[p.slug] || p.variants || [];
    return variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  };

  // Sort and filter products (local fallback)
  const sortedAndFilteredProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'stockAsc') {
      list.sort((a, b) => getProductTotalStock(a) - getProductTotalStock(b));
    } else if (sortBy === 'stockDesc') {
      list.sort((a, b) => getProductTotalStock(b) - getProductTotalStock(a));
    }
    return list;
  }, [filteredProducts, sortBy, pendingStockEdits]);

  const activeMetrics = remoteStockData?.metrics || metrics;

  const displayedProducts = onFetchPaginatedStock && remoteStockData
    ? remoteStockData.items
    : sortedAndFilteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCount = onFetchPaginatedStock && remoteStockData
    ? remoteStockData.total
    : sortedAndFilteredProducts.length;

  const totalPages = onFetchPaginatedStock && remoteStockData
    ? remoteStockData.totalPages
    : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);
  const startRecord = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(safePage * PAGE_SIZE, totalCount);

  // Generate page numbers for bottom pagination: e.g. [1, 2, 3, 4] or [1, '...', 4, 5, '...', 10]
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

  // Toggle collapse for single product
  const toggleProductCollapse = (slug: string) => {
    setCollapsedSlugs(prev => {
      const current = prev[slug] !== undefined ? prev[slug] : allCollapsed;
      return {
        ...prev,
        [slug]: !current,
      };
    });
  };


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
      setRefreshKey(k => k + 1);
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

  const handleToggleStockInternal = (product: Product) => {
    onToggleStock(product);
    setRefreshKey(k => k + 1);
  };

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    onRefresh?.();
  };

  return (
    <View style={styles.container}>
      {/* Main Inventory Scroll Area */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollPadding}
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF5E36"
            colors={['#FF5E36']}
          />
        }
      >
        {/* 1. Analytics Card Section (KPI Metrics Dashboard) */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsHeaderRow}>
            <View style={styles.metricsHeaderLeft}>
              <Package size={15} color="#5A1827" />
              <Text style={styles.metricsSectionTitle}>Stock Ledger Snapshot</Text>
            </View>
            <View style={styles.metricsTotalPill}>
              <Text style={styles.metricsTotalPillText}>{activeMetrics.totalStockUnits} units total</Text>
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
              <Text style={styles.metricValue}>{activeMetrics.totalProducts}</Text>
              <Text style={styles.metricSub}>{activeMetrics.totalStockUnits} total units</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardInStock]}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIconBox, { backgroundColor: '#DDEEE5' }]}>
                  <CheckCircle2 size={13} color="#1F4E3D" />
                </View>
                <Text style={[styles.metricLabel, { color: '#1F4E3D' }]}>In Stock</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#1F4E3D' }]}>{activeMetrics.inStockProducts}</Text>
              <Text style={[styles.metricSub, { color: '#2E6853' }]}>Ready to order</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardOutOfStock]}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIconBox, { backgroundColor: '#FCE4E0' }]}>
                  <AlertCircle size={13} color="#B95C3F" />
                </View>
                <Text style={[styles.metricLabel, { color: '#B95C3F' }]}>Out of Stock</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#5A1827' }]}>{activeMetrics.outOfStockProducts}</Text>
              <Text style={[styles.metricSub, { color: '#A34A30' }]}>Needs restock</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardLowStock]}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIconBox, { backgroundColor: '#FCEECC' }]}>
                  <Sparkles size={13} color="#D97A35" />
                </View>
                <Text style={[styles.metricLabel, { color: '#C06826' }]}>Low Stock</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#A6561B' }]}>{activeMetrics.lowStockProducts}</Text>
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
                  {activeMetrics.totalReservedUnits} units held across {activeMetrics.hasReservedProducts} {activeMetrics.hasReservedProducts === 1 ? 'outfit' : 'outfits'}
                </Text>
              </View>
            </View>
            {activeMetrics.hasReservedProducts > 0 && (
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

        {/* 2. Search Bar & History Options AFTER Analytics Section */}
        <View style={styles.searchAndHistorySection}>
          <View style={styles.searchAndHistoryRow}>
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

        {/* 3. Tools Row: Sort Options & Collapse All */}
        <View style={styles.toolsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortPillsScroll}>
            <TouchableOpacity
              onPress={() => setSortBy('default')}
              style={[styles.sortPill, sortBy === 'default' && styles.sortPillActive]}
            >
              <Text style={[styles.sortPillText, sortBy === 'default' && styles.sortPillTextActive]}>
                Default
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSortBy('stockAsc')}
              style={[styles.sortPill, sortBy === 'stockAsc' && styles.sortPillActive]}
            >
              <ArrowUpDown size={11} color={sortBy === 'stockAsc' ? '#ffffff' : '#71717a'} style={{ marginRight: 4 }} />
              <Text style={[styles.sortPillText, sortBy === 'stockAsc' && styles.sortPillTextActive]}>
                Stock: Low → High
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSortBy('stockDesc')}
              style={[styles.sortPill, sortBy === 'stockDesc' && styles.sortPillActive]}
            >
              <ArrowUpDown size={11} color={sortBy === 'stockDesc' ? '#ffffff' : '#71717a'} style={{ marginRight: 4 }} />
              <Text style={[styles.sortPillText, sortBy === 'stockDesc' && styles.sortPillTextActive]}>
                Stock: High → Low
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 4. Status Filter Tabs */}
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
                All ({activeMetrics.totalProducts})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('inStock')}
              style={[styles.filterTab, activeFilter === 'inStock' && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeFilter === 'inStock' && styles.filterTabTextActive]}>
                In Stock ({activeMetrics.inStockProducts})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('outOfStock')}
              style={[styles.filterTab, activeFilter === 'outOfStock' && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeFilter === 'outOfStock' && styles.filterTabTextActive]}>
                Out of Stock ({activeMetrics.outOfStockProducts})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('lowStock')}
              style={[styles.filterTab, activeFilter === 'lowStock' && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeFilter === 'lowStock' && styles.filterTabTextActive]}>
                Low Stock ({activeMetrics.lowStockProducts})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('reserved')}
              style={[styles.filterTab, activeFilter === 'reserved' && styles.filterTabActiveReserved]}
            >
              <Lock size={11} color={activeFilter === 'reserved' ? '#ffffff' : '#C0603A'} style={{ marginRight: 4 }} />
              <Text style={[styles.filterTabText, activeFilter === 'reserved' && styles.filterTabTextActive]}>
                Reserved ({activeMetrics.hasReservedProducts})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Product Inventory Items */}
        {(isLoading || isFetchingRemote) && (!refreshing || displayedProducts.length === 0) ? (
          <InventorySkeleton />
        ) : totalCount === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={44} color="#d4d4d8" />
            <Text style={styles.emptyTitle}>No Outfits Found</Text>
            <Text style={styles.emptySubtitle}>
              No products match your current search, stock status, or sort filters.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setSelectedCategory('All');
                setSortBy('default');
              }}
              style={styles.resetFilterBtn}
            >
              <Text style={styles.resetFilterBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsList}>
            {displayedProducts.map(product => {
              const workingVariants = getWorkingVariants(product);
              const hasPendingChanges = !!pendingStockEdits[product.slug];
              const isSaving = !!savingSlugs[product.slug];
              const isCollapsed = collapsedSlugs[product.slug] !== undefined ? collapsedSlugs[product.slug] : allCollapsed;
              const shouldShowVariants = hasPendingChanges || !isCollapsed;

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
                      onValueChange={() => handleToggleStockInternal(product)}
                      trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {/* Variants Management Section (Collapsible) */}
                  <View style={styles.variantsSection}>
                    <TouchableOpacity
                      onPress={() => toggleProductCollapse(product.slug)}
                      activeOpacity={0.7}
                      style={styles.variantsHeaderToggleRow}
                    >
                      <View style={styles.variantsHeaderLeft}>
                        <Layers size={13} color="#FF5E36" />
                        <View>
                          <Text style={styles.variantsHeaderTitle}>
                            Variants ({workingVariants.length})
                          </Text>
                          <Text style={styles.variantsHeaderSubtitle}>
                            {totalCurrentStock} available • {totalCurrentReserved} reserved
                          </Text>
                        </View>
                      </View>

                      <View style={styles.variantsHeaderRightPill}>
                        <Text style={styles.variantsHeaderRightText}>
                          {shouldShowVariants ? 'Collapse' : 'Manage Stock'}
                        </Text>
                        {shouldShowVariants ? (
                          <ChevronUp size={14} color="#71717a" style={{ marginLeft: 3 }} />
                        ) : (
                          <ChevronDown size={14} color="#FF5E36" style={{ marginLeft: 3 }} />
                        )}
                      </View>
                    </TouchableOpacity>

                    {shouldShowVariants ? (
                      <>
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
                  </>
                ) : (
                      /* Collapsed Summary Strip */
                      <TouchableOpacity
                        onPress={() => toggleProductCollapse(product.slug)}
                        activeOpacity={0.7}
                        style={styles.collapsedVariantStrip}
                      >
                        <View style={styles.collapsedSwatchesRow}>
                          {workingVariants.slice(0, 5).map((v, i) => (
                            <View
                              key={i}
                              style={[
                                styles.miniSwatchDot,
                                { backgroundColor: getColorHex(v.color, v.hexCode) },
                              ]}
                            />
                          ))}
                          {workingVariants.length > 5 && (
                            <Text style={styles.miniSwatchMoreText}>+{workingVariants.length - 5}</Text>
                          )}
                        </View>
                        <Text style={styles.collapsedActionHint}>Tap to manage variant stock</Text>
                      </TouchableOpacity>
                    )}
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
            {/* Bottom Pagination Numbers (only shown after data exceeds the page limit) */}
            {totalPages > 1 && (
              <View style={styles.paginationSection}>
                <View style={styles.paginationNumbersRow}>
                  <TouchableOpacity
                    style={[styles.pageButton, safePage <= 1 && styles.pageButtonDisabled]}
                    onPress={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    accessibilityLabel="Previous page"
                    accessibilityRole="button"
                  >
                    <ChevronLeft size={16} color={safePage <= 1 ? '#d4d4d8' : '#18181b'} />
                  </TouchableOpacity>

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
                  Page {safePage} of {totalPages} ({totalCount} total items)
                </Text>
              </View>
            )}
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

