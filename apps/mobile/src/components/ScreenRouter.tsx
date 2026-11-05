import React from 'react';
import { View } from 'react-native';
import { TabType } from './NavigationTabBar';
import DashboardScreen from '../screens/DashboardScreen';
import CatalogScreen from '../screens/CatalogScreen';
import InventoryScreen from '../screens/InventoryScreen';
import InvoiceScreen from '../screens/InvoiceScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import {
  Product,
  Variant,
  Customer,
  Invoice,
  Order,
  Review,
  InventoryTransaction,
  AnalyticsOverviewData,
  ViewsAnalytics,
  ClicksAnalytics,
  ConversionAnalytics,
  ConversionFunnelAnalytics,
  ChannelRatioAnalytics,
  GrowthPulseAnalytics,
  PaymentModesAnalytics,
  DemandHighlightsAnalytics,
  ProductAnalyticsItem,
  InventorySummaryAnalytics,
  PaginatedCatalogueTelemetryResult,
  PaginatedProductsResponse,
  PaginatedInvoicesResponse,
  PaginatedOrdersResponse,
  PaginatedCustomersResponse,
  PaginatedStockResponse,
  PaginatedReviewsResponse,
  InventoryMetrics,
} from '../types';
import { ProductSuggestionsData } from '../screens/CatalogScreen';
import { InventorySuggestionItem } from '../screens/InventoryScreen';
import { ReviewSuggestionItem } from '../screens/ReviewsScreen';
import styles from '../styles/App.styles';

export interface ScreenRouterProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  // Dashboard & Analytics
  stats: {
    total: number;
    listed: number;
    oos: number;
    active: number;
  };
  analyticsMetrics: {
    isUnavailable?: boolean;
    views: number;
    waHits: number;
    igHits: number;
    wlHits: number;
    conversion: number;
    pipeline: number;
  };
  analyticsOverview?: AnalyticsOverviewData | null;
  allProductsAnalytics?: ProductAnalyticsItem[];
  activeAnalyticsProduct: Product | null;
  selectedAnalyticsSlug: string;
  setSelectedAnalyticsSlug: (slug: string) => void;
  showAnalyticsSelector: boolean;
  setShowAnalyticsSelector: (show: boolean) => void;
  isLoadingAnalytics?: boolean;
  viewsAnalytics?: ViewsAnalytics | null;
  clicksAnalytics?: ClicksAnalytics | null;
  conversionAnalytics?: ConversionAnalytics | null;
  funnelAnalytics?: ConversionFunnelAnalytics | null;
  channelRatioAnalytics?: ChannelRatioAnalytics | null;
  growthPulseAnalytics?: GrowthPulseAnalytics | null;
  paymentModesAnalytics?: PaymentModesAnalytics | null;
  demandHighlightsAnalytics?: DemandHighlightsAnalytics | null;
  catalogueTelemetryAnalytics?: ProductAnalyticsItem[];
  inventorySummaryAnalytics?: InventorySummaryAnalytics | null;
  fetchPaginatedCatalogueTelemetry?: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'views' | 'inquiries' | 'orders' | 'conversion' | 'revenue';
  }) => Promise<PaginatedCatalogueTelemetryResult>;
  // Shared
  products: Product[];
  categories: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  // Catalog actions
  onAddProduct: () => void;
  onManageCategories: () => void;
  onToggleStock: (prod: Product) => void;
  onUpdateVisibility: (prod: Product, status: 'listed' | 'unListed') => void;
  onEditProduct: (prod: Product) => void;
  onDeleteProduct: (slug: string, name: string) => void;
  onViewProductDetails: (prod: Product) => void;
  // Inventory actions
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
  transactions: InventoryTransaction[];
  isLoadingTransactions: boolean;
  onFetchTransactions: () => Promise<void>;
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'confirm', onConfirm?: () => void) => void;
  // Invoices & Orders
  customers: Customer[];
  invoices: Invoice[];
  orders: Order[];
  isLoadingInvoices: boolean;
  isLoadingOrders: boolean;
  isLoadingCustomers: boolean;
  onFetchCustomers: () => Promise<void>;
  onFetchPaginatedCustomers?: (params?: {
    search?: string;
    sortBy?: 'name-asc' | 'name-desc' | 'createdAt-desc' | 'createdAt-asc';
    page?: number;
    limit?: number;
  }) => Promise<PaginatedCustomersResponse>;
  onCreateCustomer: (data: { name: string; phoneNumber: string; email?: string; address?: string }) => Promise<Customer>;
  onFetchInvoices: () => Promise<void>;
  onFetchPaginatedInvoices?: (params?: {
    search?: string;
    mode?: 'all' | 'cash' | 'online' | 'credit';
    sortBy?: 'createdAt-desc' | 'createdAt-asc' | 'amount-desc' | 'amount-asc';
    page?: number;
    limit?: number;
  }) => Promise<PaginatedInvoicesResponse>;
  onFetchOrders: (force?: boolean) => Promise<void>;
  onFetchPaginatedOrders?: (params?: {
    search?: string;
    status?: string;
    sortBy?: 'createdAt-desc' | 'createdAt-asc' | 'totalAmount-desc' | 'totalAmount-asc';
    page?: number;
    limit?: number;
  }) => Promise<PaginatedOrdersResponse>;
  onCreateOrder: (orderData: Record<string, unknown>) => Promise<Order>;
  onUpdateInvoice?: (invoiceData: Partial<Invoice> & { id: string }) => Promise<Invoice>;
  onDeleteOrder?: (id: string, label: string) => Promise<void>;
  onFetchCredits?: () => Promise<unknown> | void;
  onFetchProducts?: () => Promise<void>;
  onFetchPaginatedProducts?: (params?: {
    search?: string;
    category?: string;
    inStockOnly?: boolean;
    sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc' | 'default';
    page?: number;
    limit?: number;
  }) => Promise<PaginatedProductsResponse>;
  onFetchPaginatedStock?: (params?: {
    search?: string;
    category?: string;
    stockFilter?: 'all' | 'inStock' | 'outOfStock' | 'lowStock' | 'reserved';
    sortBy?: 'default' | 'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc';
    page?: number;
    limit?: number;
  }) => Promise<PaginatedStockResponse>;
  isLoadingProducts?: boolean;
  // Reviews
  reviews: Review[];
  reviewCounts?: { all: number; approved: number; pending: number };
  isLoadingReviews: boolean;
  onFetchReviews: () => Promise<void>;
  onFetchPaginatedReviews?: (params?: {
    search?: string;
    approved?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<PaginatedReviewsResponse>;
  onAddReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'> & { email?: string | null; approved?: boolean }) => Promise<unknown> | void;
  onUpdateReview?: (reviewData: { id: string; name?: string; message?: string; stars?: number; image?: string | null; video?: string | null; instagramId?: string | null; phone?: string | null; location?: string | null; email?: string | null; approved?: boolean }) => Promise<unknown> | void;
  onDeleteReview: (review: Review) => void;
  onToggleReviewApproval: (review: Review) => Promise<void>;
  token: string | null;
  apiHost: string;
  // Search & Suggestions Backend Route Handlers
  onSearchProducts?: (params: { query?: string; category?: string; inStockOnly?: boolean; sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc' | 'newest' | 'default'; limit?: number }) => Promise<{ items: Product[]; total?: number; metrics?: unknown }>;
  onGetProductSuggestions?: (query: string) => Promise<ProductSuggestionsData>;
  onSearchInventory?: (params: { query?: string; category?: string; stockFilter?: 'all' | 'inStock' | 'outOfStock' | 'lowStock' | 'reserved'; sortBy?: 'default' | 'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc'; limit?: number }) => Promise<{ items: Product[]; total: number; metrics?: InventoryMetrics; query?: string }>;
  onGetInventorySuggestions?: (query: string) => Promise<InventorySuggestionItem[]>;
  onSearchInvoices?: (query: string) => Promise<Invoice[]>;
  onSearchOrders?: (query: string) => Promise<Order[]>;
  onSearchReviews?: (query: string) => Promise<Review[]>;
  onGetReviewSuggestions?: (query: string) => Promise<ReviewSuggestionItem[]>;
  currentUser?: { id?: string; email?: string; userName?: string; role?: string } | null;
  isSuperAdmin?: boolean;
}

export const ScreenRouter: React.FC<ScreenRouterProps> = ({
  activeTab,
  setActiveTab,
  stats,
  analyticsMetrics,
  analyticsOverview,
  allProductsAnalytics,
  activeAnalyticsProduct,
  selectedAnalyticsSlug,
  setSelectedAnalyticsSlug,
  showAnalyticsSelector,
  setShowAnalyticsSelector,
  isLoadingAnalytics,
  viewsAnalytics,
  clicksAnalytics,
  conversionAnalytics,
  funnelAnalytics,
  channelRatioAnalytics,
  growthPulseAnalytics,
  paymentModesAnalytics,
  demandHighlightsAnalytics,
  catalogueTelemetryAnalytics,
  inventorySummaryAnalytics,
  fetchPaginatedCatalogueTelemetry,
  products,
  categories,
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
  onUpdateInventory,
  onRecordTransaction,
  transactions,
  isLoadingTransactions,
  onFetchTransactions,
  showAlert,
  customers,
  invoices,
  orders,
  isLoadingInvoices,
  isLoadingOrders,
  isLoadingCustomers,
  onFetchCustomers,
  onFetchPaginatedCustomers,
  onCreateCustomer,
  onFetchInvoices,
  onFetchPaginatedInvoices,
  onFetchOrders,
  onFetchPaginatedOrders,
  onCreateOrder,
  onUpdateInvoice,
  onDeleteOrder,
  onFetchCredits,
  onFetchProducts,
  onFetchPaginatedProducts,
  onFetchPaginatedStock,
  isLoadingProducts,
  reviews,
  reviewCounts,
  isLoadingReviews,
  onFetchReviews,
  onFetchPaginatedReviews,
  onAddReview,
  onUpdateReview,
  onDeleteReview,
  onToggleReviewApproval,
  token,
  apiHost,
  onSearchProducts,
  onGetProductSuggestions,
  onSearchInventory,
  onGetInventorySuggestions,
  onSearchInvoices,
  onSearchOrders,
  onSearchReviews,
  onGetReviewSuggestions,
  currentUser,
  isSuperAdmin,
}) => {
  return (
    <View style={styles.screenView}>
      {(activeTab === 'dashboard' || activeTab === 'analytics') && (
        <DashboardScreen
          stats={stats}
          products={products}
          analyticsMetrics={analyticsMetrics}
          analyticsOverview={analyticsOverview}
          allProductsAnalytics={allProductsAnalytics}
          viewsAnalytics={viewsAnalytics}
          clicksAnalytics={clicksAnalytics}
          conversionAnalytics={conversionAnalytics}
          funnelAnalytics={funnelAnalytics}
          channelRatioAnalytics={channelRatioAnalytics}
          growthPulseAnalytics={growthPulseAnalytics}
          paymentModesAnalytics={paymentModesAnalytics}
          demandHighlightsAnalytics={demandHighlightsAnalytics}
          catalogueTelemetryAnalytics={catalogueTelemetryAnalytics}
          inventorySummaryAnalytics={inventorySummaryAnalytics}
          fetchPaginatedCatalogueTelemetry={fetchPaginatedCatalogueTelemetry}
          activeAnalyticsProduct={activeAnalyticsProduct}
          selectedAnalyticsSlug={selectedAnalyticsSlug}
          setSelectedAnalyticsSlug={setSelectedAnalyticsSlug}
          showAnalyticsSelector={showAnalyticsSelector}
          setShowAnalyticsSelector={setShowAnalyticsSelector}
          isLoading={isLoading}
          isLoadingAnalytics={isLoadingAnalytics}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onNavigateToTab={(tab) => setActiveTab(tab)}
          showAlert={showAlert}
        />
      )}
      {activeTab === 'catalogue' && (
        <CatalogScreen
          products={products}
          categories={categories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLoading={isLoading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onAddProduct={onAddProduct}
          onManageCategories={onManageCategories}
          onToggleStock={onToggleStock}
          onUpdateVisibility={onUpdateVisibility}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          onViewProductDetails={onViewProductDetails}
          onFetchPaginatedProducts={onFetchPaginatedProducts}
          onSearchProducts={onSearchProducts}
          onGetProductSuggestions={onGetProductSuggestions}
        />
      )}
      {activeTab === 'inventory' && (
        <InventoryScreen
          products={products}
          categories={categories}
          isLoading={isLoading || isLoadingTransactions}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onToggleStock={onToggleStock}
          onUpdateInventory={onUpdateInventory}
          onRecordTransaction={onRecordTransaction}
          transactions={transactions}
          isLoadingTransactions={isLoadingTransactions}
          onFetchTransactions={onFetchTransactions}
          onViewProductDetails={onViewProductDetails}
          showAlert={showAlert}
          onFetchPaginatedStock={onFetchPaginatedStock}
          onSearchInventory={onSearchInventory}
          onGetInventorySuggestions={onGetInventorySuggestions}
        />
      )}
      {activeTab === 'invoices' && (
        <InvoiceScreen
          products={products}
          categories={categories}
          customers={customers}
          invoices={invoices}
          orders={orders}
          showAlert={showAlert}
          isLoading={isLoadingInvoices}
          isLoadingOrders={isLoadingOrders}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onFetchCustomers={onFetchCustomers}
          onCreateCustomer={onCreateCustomer}
          onFetchInvoices={onFetchInvoices}
          onFetchPaginatedInvoices={onFetchPaginatedInvoices}
          onFetchOrders={onFetchOrders}
          onFetchPaginatedOrders={onFetchPaginatedOrders}
          onCreateOrder={onCreateOrder}
          onUpdateInvoice={onUpdateInvoice}
          onDeleteOrder={onDeleteOrder}
          onFetchCredits={onFetchCredits}
          onFetchProducts={onFetchProducts}
          isLoadingCustomers={isLoadingCustomers}
          isLoadingProducts={isLoadingProducts}
          onFetchPaginatedCustomers={onFetchPaginatedCustomers}
          onFetchPaginatedProducts={onFetchPaginatedProducts}
          onSearchInvoices={onSearchInvoices}
          onSearchOrders={onSearchOrders}
        />
      )}
      {activeTab === 'reviews' && (
        <ReviewsScreen
          currentUser={currentUser}
          isSuperAdmin={isSuperAdmin}
          reviews={reviews}
          reviewCounts={reviewCounts}
          isLoading={isLoadingReviews}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onAddReview={onAddReview}
          onUpdateReview={onUpdateReview}
          onDeleteReview={onDeleteReview}
          onToggleApproval={onToggleReviewApproval}
          showAlert={showAlert}
          token={token}
          apiHost={apiHost}
          onSearchReviews={onSearchReviews}
          onGetReviewSuggestions={onGetReviewSuggestions}
          onFetchPaginatedReviews={onFetchPaginatedReviews}
        />
      )}
    </View>
  );
};

export default ScreenRouter;
