import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useAuth } from './AuthContext';
import { UiProvider, useUi, UiContextType } from './UiContext';
import { CatalogProvider, useCatalog, CatalogContextType } from './CatalogContext';
import { BillingProvider, useBilling, BillingContextType } from './BillingContext';
import { TelemetryProvider, useTelemetry, TelemetryContextType } from './TelemetryContext';
import { InquiriesReviewsProvider, useInquiriesReviews, InquiriesReviewsContextType } from './InquiriesReviewsContext';
import { TabType } from '../components/NavigationTabBar';
import { TAB_ROUTE_MAP } from '../utils/navigation';

export interface AppDataContextType
  extends CatalogContextType,
    BillingContextType,
    TelemetryContextType,
    InquiriesReviewsContextType,
    Omit<UiContextType, 'setActiveTab'> {
  // Auth fields
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  authLoadingMessage: string;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  token: string | null;
  currentUser: ReturnType<typeof useAuth>['currentUser'];
  isSuperAdmin: boolean;
  isLoggingIn: boolean;
  handleLogin: ReturnType<typeof useAuth>['handleLogin'];
  handleLogout: ReturnType<typeof useAuth>['handleLogout'];
  handleChangeUsername: ReturnType<typeof useAuth>['handleChangeUsername'];
  handleChangeEmail: ReturnType<typeof useAuth>['handleChangeEmail'];
  handleChangePassword: ReturnType<typeof useAuth>['handleChangePassword'];
  handleUpdateUser: ReturnType<typeof useAuth>['handleUpdateUser'];
  handleDeleteAccount: ReturnType<typeof useAuth>['handleDeleteAccount'];
  trpcRequest: ReturnType<typeof useAuth>['trpcRequest'];
  apiHost: string;
  setApiHost: React.Dispatch<React.SetStateAction<string>>;
  showConfig: boolean;
  setShowConfig: React.Dispatch<React.SetStateAction<boolean>>;

  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  handleRefresh: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

function AppDataBridge({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const ui = useUi();
  const catalog = useCatalog();
  const billing = useBilling();
  const telemetry = useTelemetry();
  const inquiriesReviews = useInquiriesReviews();
  const router = useRouter();

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      catalog.handleRefresh(),
      billing.handleRefreshBilling(),
      inquiriesReviews.handleFetchReviews(true),
      telemetry.handleFetchAnalytics(telemetry.selectedAnalyticsSlug, true),
    ]);
  }, [catalog.handleRefresh, billing.handleRefreshBilling, inquiriesReviews.handleFetchReviews, telemetry.handleFetchAnalytics, telemetry.selectedAnalyticsSlug]);

  const setActiveTab = useCallback((tab: TabType) => {
    ui.setActiveTab(tab);
    const targetRoute = TAB_ROUTE_MAP[tab] || '/';
    router.replace(targetRoute as Href);
  }, [ui.setActiveTab, router]);

  const value = useMemo<AppDataContextType>(() => {
    return {
      // Auth
      isAuthenticated: auth.isAuthenticated,
      isCheckingAuth: auth.isCheckingAuth,
      authLoadingMessage: auth.authLoadingMessage,
      email: auth.email,
      setEmail: auth.setEmail,
      username: auth.username,
      setUsername: auth.setUsername,
      password: auth.password,
      setPassword: auth.setPassword,
      token: auth.token,
      currentUser: auth.currentUser,
      isSuperAdmin: auth.isSuperAdmin,
      isLoggingIn: auth.isLoggingIn,
      handleLogin: auth.handleLogin,
      handleLogout: auth.handleLogout,
      handleChangeUsername: auth.handleChangeUsername,
      handleChangeEmail: auth.handleChangeEmail,
      handleChangePassword: auth.handleChangePassword,
      handleUpdateUser: auth.handleUpdateUser,
      handleDeleteAccount: auth.handleDeleteAccount,
      trpcRequest: auth.trpcRequest,
      apiHost: auth.apiHost,
      setApiHost: auth.setApiHost,
      showConfig: auth.showConfig,
      setShowConfig: auth.setShowConfig,

      // UI & Navigation
      activeTab: ui.activeSection,
      activeSection: ui.activeSection,
      setActiveTab,
      tabValues: ui.tabValues,
      drawerMenuOpen: ui.drawerMenuOpen,
      setDrawerMenuOpen: ui.setDrawerMenuOpen,
      accountModalOpen: ui.accountModalOpen,
      setAccountModalOpen: ui.setAccountModalOpen,
      isSyncing: ui.isSyncing,
      setIsSyncing: ui.setIsSyncing,
      syncMessage: ui.syncMessage,
      setSyncMessage: ui.setSyncMessage,
      handleManualSync: ui.handleManualSync,
      alertConfig: ui.alertConfig,
      setAlertConfig: ui.setAlertConfig,
      toastConfig: ui.toastConfig,
      setToastConfig: ui.setToastConfig,
      showToast: ui.showToast,
      hideToast: ui.hideToast,
      showAlert: ui.showAlert,

      // Catalog & Inventory
      products: catalog.products,
      categories: catalog.categories,
      isLoading: catalog.isLoading,
      refreshing: catalog.refreshing,
      searchQuery: catalog.searchQuery,
      setSearchQuery: catalog.setSearchQuery,
      handleFetchProducts: catalog.handleFetchProducts,
      handleToggleStock: catalog.handleToggleStock,
      handleUpdateVisibility: catalog.handleUpdateVisibility,
      handleSaveProduct: catalog.handleSaveProduct,
      handleDeleteProduct: catalog.handleDeleteProduct,
      handleReorderProductImages: catalog.handleReorderProductImages,
      handleFetchCategories: catalog.handleFetchCategories,
      handleAddCategory: catalog.handleAddCategory,
      handleDeleteCategory: catalog.handleDeleteCategory,
      handleFetchPaginatedProducts: catalog.handleFetchPaginatedProducts,
      transactions: catalog.transactions,
      isLoadingTransactions: catalog.isLoadingTransactions,
      handleFetchTransactions: catalog.handleFetchTransactions,
      handleUpdateInventory: catalog.handleUpdateInventory,
      handleRecordTransaction: catalog.handleRecordTransaction,
      handleFetchPaginatedStock: catalog.handleFetchPaginatedStock,
      formModalOpen: catalog.formModalOpen,
      setFormModalOpen: catalog.setFormModalOpen,
      selectedProductDetails: catalog.selectedProductDetails,
      setSelectedProductDetails: catalog.setSelectedProductDetails,
      activeDetailsProduct: catalog.activeDetailsProduct,
      categoryModalOpen: catalog.categoryModalOpen,
      setCategoryModalOpen: catalog.setCategoryModalOpen,
      isEditing: catalog.isEditing,
      editingSlug: catalog.editingSlug,
      triggerAddProduct: catalog.triggerAddProduct,
      triggerEditProduct: catalog.triggerEditProduct,
      handleSearchProducts: catalog.handleSearchProducts,
      handleGetProductSuggestions: catalog.handleGetProductSuggestions,
      handleSearchInventory: catalog.handleSearchInventory,
      handleGetInventorySuggestions: catalog.handleGetInventorySuggestions,

      // Billing (Invoices, Orders, Customers, Credits)
      invoices: billing.invoices,
      isLoadingInvoices: billing.isLoadingInvoices,
      orders: billing.orders,
      isLoadingOrders: billing.isLoadingOrders,
      handleFetchInvoices: billing.handleFetchInvoices,
      handleFetchPaginatedInvoices: billing.handleFetchPaginatedInvoices,
      handleFetchOrders: billing.handleFetchOrders,
      handleFetchPaginatedOrders: billing.handleFetchPaginatedOrders,
      handleCreateOrder: billing.handleCreateOrder,
      handleUpdateInvoice: billing.handleUpdateInvoice,
      handleDeleteOrder: billing.handleDeleteOrder,
      customers: billing.customers,
      customerTotalCount: billing.customerTotalCount,
      isLoadingCustomers: billing.isLoadingCustomers,
      customerModalOpen: billing.customerModalOpen,
      setCustomerModalOpen: billing.setCustomerModalOpen,
      handleFetchCustomers: billing.handleFetchCustomers,
      handleFetchPaginatedCustomers: billing.handleFetchPaginatedCustomers,
      handleCreateCustomer: billing.handleCreateCustomer,
      handleUpdateCustomer: billing.handleUpdateCustomer,
      handleDeleteCustomer: billing.handleDeleteCustomer,
      handleFetchCustomerOrderHistory: billing.handleFetchCustomerOrderHistory,
      credits: billing.credits,
      creditMetrics: billing.creditMetrics,
      isLoadingCredits: billing.isLoadingCredits,
      creditModalOpen: billing.creditModalOpen,
      setCreditModalOpen: billing.setCreditModalOpen,
      handleFetchCredits: billing.handleFetchCredits,
      handleCreateCredit: billing.handleCreateCredit,
      handleUpdateCredit: billing.handleUpdateCredit,
      handleRecordCreditPayment: billing.handleRecordCreditPayment,
      handleDeleteCredit: billing.handleDeleteCredit,
      handleFetchPaginatedCredits: billing.handleFetchPaginatedCredits,
      handleSearchCustomers: billing.handleSearchCustomers,
      handleGetCustomerSuggestions: billing.handleGetCustomerSuggestions,
      handleSearchOrders: billing.handleSearchOrders,
      handleSearchInvoices: billing.handleSearchInvoices,
      handleSearchCredits: billing.handleSearchCredits,
      handleRefreshBilling: billing.handleRefreshBilling,

      // Telemetry
      stats: telemetry.stats,
      analyticsMetrics: telemetry.analyticsMetrics,
      analyticsOverview: telemetry.analyticsOverview,
      setAnalyticsOverview: telemetry.setAnalyticsOverview,
      allProductsAnalytics: telemetry.allProductsAnalytics,
      viewsAnalytics: telemetry.viewsAnalytics,
      clicksAnalytics: telemetry.clicksAnalytics,
      conversionAnalytics: telemetry.conversionAnalytics,
      funnelAnalytics: telemetry.funnelAnalytics,
      channelRatioAnalytics: telemetry.channelRatioAnalytics,
      growthPulseAnalytics: telemetry.growthPulseAnalytics,
      paymentModesAnalytics: telemetry.paymentModesAnalytics,
      demandHighlightsAnalytics: telemetry.demandHighlightsAnalytics,
      catalogueTelemetryAnalytics: telemetry.catalogueTelemetryAnalytics,
      inventorySummaryAnalytics: telemetry.inventorySummaryAnalytics,
      isLoadingAnalytics: telemetry.isLoadingAnalytics,
      handleFetchAnalytics: telemetry.handleFetchAnalytics,
      fetchPaginatedCatalogueTelemetry: telemetry.fetchPaginatedCatalogueTelemetry,
      activeAnalyticsProduct: telemetry.activeAnalyticsProduct,
      selectedAnalyticsSlug: telemetry.selectedAnalyticsSlug,
      setSelectedAnalyticsSlug: telemetry.setSelectedAnalyticsSlug,
      showAnalyticsSelector: telemetry.showAnalyticsSelector,
      setShowAnalyticsSelector: telemetry.setShowAnalyticsSelector,

      // Inquiries & Reviews
      inquiries: inquiriesReviews.inquiries,
      pendingInquiriesCount: inquiriesReviews.pendingInquiriesCount,
      isLoadingInquiries: inquiriesReviews.isLoadingInquiries,
      inquiriesPagination: inquiriesReviews.inquiriesPagination,
      inquiriesSortBy: inquiriesReviews.inquiriesSortBy,
      setInquiriesSortBy: inquiriesReviews.setInquiriesSortBy,
      inquiriesStatusFilter: inquiriesReviews.inquiriesStatusFilter,
      setInquiriesStatusFilter: inquiriesReviews.setInquiriesStatusFilter,
      inquiriesSearchQuery: inquiriesReviews.inquiriesSearchQuery,
      setInquiriesSearchQuery: inquiriesReviews.setInquiriesSearchQuery,
      handleFetchPaginatedInquiries: inquiriesReviews.handleFetchPaginatedInquiries,
      handleResolveInquiry: inquiriesReviews.handleResolveInquiry,
      inquiriesModalOpen: inquiriesReviews.inquiriesModalOpen,
      setInquiriesModalOpen: inquiriesReviews.setInquiriesModalOpen,
      handleSearchInquiries: inquiriesReviews.handleSearchInquiries,
      handleGetInquirySuggestions: inquiriesReviews.handleGetInquirySuggestions,
      reviews: inquiriesReviews.reviews,
      reviewCounts: inquiriesReviews.reviewCounts,
      isLoadingReviews: inquiriesReviews.isLoadingReviews,
      handleFetchReviews: inquiriesReviews.handleFetchReviews,
      handleFetchPaginatedReviews: inquiriesReviews.handleFetchPaginatedReviews,
      handleAddReview: inquiriesReviews.handleAddReview,
      handleUpdateReview: inquiriesReviews.handleUpdateReview,
      handleDeleteReview: inquiriesReviews.handleDeleteReview,
      handleToggleReviewApproval: inquiriesReviews.handleToggleReviewApproval,
      handleSearchReviews: inquiriesReviews.handleSearchReviews,
      handleGetReviewSuggestions: inquiriesReviews.handleGetReviewSuggestions,

      handleRefresh,
    };
  }, [auth, ui, catalog, billing, telemetry, inquiriesReviews]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider>
      <CatalogProvider>
        <BillingProvider>
          <TelemetryProvider>
            <InquiriesReviewsProvider>
              <AppDataBridge>
                {children}
              </AppDataBridge>
            </InquiriesReviewsProvider>
          </TelemetryProvider>
        </BillingProvider>
      </CatalogProvider>
    </UiProvider>
  );
}

export function useAppDataContext(): AppDataContextType {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppDataContext must be used within an AppDataProvider');
  }
  return context;
}
