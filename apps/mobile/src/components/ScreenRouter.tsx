import React from 'react';
import { View } from 'react-native';
import { TabType } from './NavigationTabBar';
import DashboardScreen from '../screens/DashboardScreen';
import CatalogScreen from '../screens/CatalogScreen';
import InventoryScreen from '../screens/InventoryScreen';
import InvoiceScreen from '../screens/InvoiceScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import { Product, Variant, Customer, Invoice, Order, Review, InventoryTransaction } from '../types';
import styles from '../styles/App.styles';

export interface ScreenRouterProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  // Dashboard & Analytics
  stats: any;
  analyticsMetrics: any;
  analyticsOverview?: any;
  allProductsAnalytics?: any[];
  activeAnalyticsProduct: any;
  selectedAnalyticsSlug: string;
  setSelectedAnalyticsSlug: (slug: string) => void;
  showAnalyticsSelector: boolean;
  setShowAnalyticsSelector: (show: boolean) => void;
  isLoadingAnalytics?: boolean;
  viewsAnalytics?: any;
  clicksAnalytics?: any;
  conversionAnalytics?: any;
  funnelAnalytics?: any;
  channelRatioAnalytics?: any;
  growthPulseAnalytics?: any;
  paymentModesAnalytics?: any;
  demandHighlightsAnalytics?: any;
  catalogueTelemetryAnalytics?: any;
  inventorySummaryAnalytics?: any;
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
  onRecordTransaction?: (data: any) => Promise<void>;
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
  onFetchPaginatedCustomers?: (params?: any) => Promise<any>;
  onCreateCustomer: (data: { name: string; phoneNumber: string; email?: string; address?: string }) => Promise<Customer>;
  onFetchInvoices: () => Promise<void>;
  onFetchPaginatedInvoices?: (params?: any) => Promise<any>;
  onFetchOrders: (force?: boolean) => Promise<void>;
  onFetchPaginatedOrders?: (params?: any) => Promise<any>;
  onCreateOrder: (orderData: any) => Promise<any>;
  onUpdateInvoice?: (invoiceData: any) => Promise<any>;
  onDeleteOrder?: (id: string, label: string) => Promise<void>;
  onFetchCredits?: () => Promise<any> | void;
  onFetchProducts?: () => Promise<void>;
  onFetchPaginatedProducts?: (params?: any) => Promise<any>;
  onFetchPaginatedStock?: (params?: any) => Promise<any>;
  isLoadingProducts?: boolean;
  // Reviews
  reviews: Review[];
  isLoadingReviews: boolean;
  onFetchReviews: () => Promise<void>;
  onAddReview: (reviewData: any) => Promise<void>;
  onDeleteReview: (review: Review) => void;
  onToggleReviewApproval: (review: Review) => Promise<void>;
  token: string | null;
  apiHost: string;
  // Search & Suggestions Backend Route Handlers
  onSearchProducts?: (params: any) => Promise<any>;
  onGetProductSuggestions?: (query: string) => Promise<any>;
  onSearchInventory?: (params: any) => Promise<any>;
  onGetInventorySuggestions?: (query: string) => Promise<any>;
  onSearchInvoices?: (query: string) => Promise<any>;
  onSearchOrders?: (query: string) => Promise<any>;
  onSearchReviews?: (query: string) => Promise<any>;
  onGetReviewSuggestions?: (query: string) => Promise<any>;
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
  isLoadingReviews,
  onFetchReviews,
  onAddReview,
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
          reviews={reviews}
          isLoading={isLoadingReviews}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onAddReview={onAddReview}
          onDeleteReview={onDeleteReview}
          onToggleApproval={onToggleReviewApproval}
          showAlert={showAlert}
          token={token}
          apiHost={apiHost}
          onSearchReviews={onSearchReviews}
          onGetReviewSuggestions={onGetReviewSuggestions}
        />
      )}
    </View>
  );
};

export default ScreenRouter;
