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
  activeAnalyticsProduct: any;
  selectedAnalyticsSlug: string;
  setSelectedAnalyticsSlug: (slug: string) => void;
  showAnalyticsSelector: boolean;
  setShowAnalyticsSelector: (show: boolean) => void;
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
  onCreateCustomer: (data: { name: string; phoneNumber: string; email?: string; address?: string }) => Promise<Customer>;
  onFetchInvoices: () => Promise<void>;
  onFetchOrders: () => Promise<void>;
  onCreateOrder: (orderData: any) => Promise<any>;
  onDeleteInvoice: (id: string, label: string) => Promise<void>;
  // Reviews
  reviews: Review[];
  isLoadingReviews: boolean;
  onFetchReviews: () => Promise<void>;
  onAddReview: (reviewData: any) => Promise<void>;
  onDeleteReview: (review: Review) => void;
  onToggleReviewApproval: (review: Review) => Promise<void>;
  token: string | null;
  apiHost: string;
}

export const ScreenRouter: React.FC<ScreenRouterProps> = ({
  activeTab,
  setActiveTab,
  stats,
  analyticsMetrics,
  activeAnalyticsProduct,
  selectedAnalyticsSlug,
  setSelectedAnalyticsSlug,
  showAnalyticsSelector,
  setShowAnalyticsSelector,
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
  onCreateCustomer,
  onFetchInvoices,
  onFetchOrders,
  onCreateOrder,
  onDeleteInvoice,
  reviews,
  isLoadingReviews,
  onFetchReviews,
  onAddReview,
  onDeleteReview,
  onToggleReviewApproval,
  token,
  apiHost,
}) => {
  return (
    <View style={styles.screenView}>
      {(activeTab === 'dashboard' || activeTab === 'analytics') && (
        <DashboardScreen
          stats={stats}
          products={products}
          analyticsMetrics={analyticsMetrics}
          activeAnalyticsProduct={activeAnalyticsProduct}
          selectedAnalyticsSlug={selectedAnalyticsSlug}
          setSelectedAnalyticsSlug={setSelectedAnalyticsSlug}
          showAnalyticsSelector={showAnalyticsSelector}
          setShowAnalyticsSelector={setShowAnalyticsSelector}
          isLoading={isLoading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onNavigateToTab={(tab) => setActiveTab(tab)}
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
        />
      )}
      {activeTab === 'inventory' && (
        <InventoryScreen
          products={products}
          categories={categories}
          isLoading={isLoading}
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
        />
      )}
      {activeTab === 'invoices' && (
        <InvoiceScreen
          products={products}
          customers={customers}
          invoices={invoices}
          orders={orders}
          showAlert={showAlert}
          isLoading={isLoading || isLoadingInvoices || isLoadingOrders || isLoadingCustomers}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onFetchCustomers={onFetchCustomers}
          onCreateCustomer={onCreateCustomer}
          onFetchInvoices={onFetchInvoices}
          onFetchOrders={onFetchOrders}
          onCreateOrder={onCreateOrder}
          onDeleteInvoice={onDeleteInvoice}
        />
      )}
      {activeTab === 'reviews' && (
        <ReviewsScreen
          reviews={reviews}
          isLoading={isLoading || isLoadingReviews}
          refreshing={refreshing || isLoadingReviews}
          onRefresh={onFetchReviews}
          onAddReview={onAddReview}
          onDeleteReview={onDeleteReview}
          onToggleApproval={onToggleReviewApproval}
          showAlert={showAlert}
          token={token}
          apiHost={apiHost}
        />
      )}
    </View>
  );
};

export default ScreenRouter;
