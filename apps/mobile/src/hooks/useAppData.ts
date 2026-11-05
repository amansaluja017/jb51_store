import { useEffect } from 'react';
import {
  useAuthData,
  useUiData,
  useProductsData,
  useInventoryData,
  useCustomersData,
  useInvoicesOrdersData,
  useReviewsData,
  useCreditsData,
  useInquiriesData,
  useAnalyticsData,
  useSearchData,
} from './appData';

/**
 * Unified application state orchestrator.
 * Delegates domain-specific responsibilities to modular sub-hooks:
 * - useAuthData: session hydration, authentication, credentials
 * - useUiData: tab navigation animations, alerts, manual sync, global modals
 * - useProductsData: catalogue, categories, stock toggle, product save/delete
 * - useInventoryData: stock transactions, variant stock updates
 * - useCustomersData: customer management and order history
 * - useInvoicesOrdersData: invoice generation, order lifecycle
 * - useReviewsData: review moderation and paginated fetching
 * - useCreditsData: khata management, credit recording & settlement
 * - useInquiriesData: customer inquiries lifecycle & resolution
 * - useAnalyticsData: consolidated overview & telemetry
 * - useSearchData: backend pg_trgm and ILIKE search & suggestion handlers
 */
export function useAppData() {
  // 1. UI & Alert state
  const uiData = useUiData({
    trpcRequest: (path, options) => authData.trpcRequest(path, options),
  });

  // 2. Auth state & methods
  const authData = useAuthData({
    showAlert: uiData.showAlert,
    onLogoutCleanup: () => {
      uiData.setActiveTab('dashboard');
      productsData.setProducts([]);
      productsData.setCategories([]);
      inventoryData.setTransactions([]);
      customersData.setCustomers([]);
      invoicesOrdersData.setInvoices([]);
      invoicesOrdersData.setOrders([]);
      reviewsData.setReviews([]);
      productsData.hasFetchedProducts.current = false;
      inventoryData.hasFetchedTransactions.current = false;
      invoicesOrdersData.hasFetchedInvoices.current = false;
      reviewsData.hasFetchedReviews.current = false;
      invoicesOrdersData.hasFetchedOrders.current = false;
      customersData.hasFetchedCustomers.current = false;
    },
  });

  // 3. Products & Catalogue state
  const productsData = useProductsData({
    trpcRequest: authData.trpcRequest,
    showAlert: uiData.showAlert,
    setSyncMessage: uiData.setSyncMessage,
  });

  // 4. Inventory state
  const inventoryData = useInventoryData({
    trpcRequest: authData.trpcRequest,
    showAlert: uiData.showAlert,
    setProducts: productsData.setProducts,
    handleFetchProducts: productsData.handleFetchProducts,
  });

  // 5. Customers state
  const customersData = useCustomersData({
    trpcRequest: authData.trpcRequest,
    showAlert: uiData.showAlert,
  });

  // 6. Invoices & Orders state
  const invoicesOrdersData = useInvoicesOrdersData({
    trpcRequest: authData.trpcRequest,
    showAlert: uiData.showAlert,
  });

  // 7. Reviews state
  const reviewsData = useReviewsData({
    trpcRequest: authData.trpcRequest,
    showAlert: uiData.showAlert,
  });

  // 8. Credits state
  const creditsData = useCreditsData({
    trpcRequest: authData.trpcRequest,
    showAlert: uiData.showAlert,
    handleFetchInvoices: invoicesOrdersData.handleFetchInvoices,
  });

  // 9. Inquiries state
  const inquiriesData = useInquiriesData({
    trpcRequest: authData.trpcRequest,
    showAlert: uiData.showAlert,
  });

  // 10. Analytics state
  const analyticsData = useAnalyticsData({
    trpcRequest: authData.trpcRequest,
    products: productsData.products,
    isAuthenticated: authData.isAuthenticated,
    activeTab: uiData.activeTab,
  });

  // 11. Search & Suggestions handlers
  const searchData = useSearchData({
    token: authData.token,
    apiHost: authData.apiHost,
  });

  // Tab-based lazy data fetching: hit routes only in their particular section
  useEffect(() => {
    if (!authData.isAuthenticated) return;

    if (uiData.activeTab === 'dashboard' || uiData.activeTab === 'analytics' || uiData.activeTab === 'catalogue') {
      if (!productsData.hasFetchedProducts.current) {
        productsData.handleFetchProducts();
      }
      if (uiData.activeTab === 'dashboard' || uiData.activeTab === 'analytics') {
        analyticsData.handleFetchAnalytics(analyticsData.selectedAnalyticsSlug);
      }
    } else if (uiData.activeTab === 'inventory') {
      if (!productsData.hasFetchedProducts.current) {
        productsData.handleFetchProducts();
      }
      if (!inventoryData.hasFetchedTransactions.current) {
        inventoryData.hasFetchedTransactions.current = true;
        inventoryData.handleFetchTransactions();
      }
      if (!invoicesOrdersData.hasFetchedOrders.current) {
        invoicesOrdersData.handleFetchOrders();
      }
    } else if (uiData.activeTab === 'invoices') {
      if (!invoicesOrdersData.hasFetchedOrders.current) {
        invoicesOrdersData.handleFetchOrders();
      }
    } else if (uiData.activeTab === 'reviews') {
      if (!reviewsData.hasFetchedReviews.current) {
        reviewsData.hasFetchedReviews.current = true;
        reviewsData.handleFetchReviews();
      }
    }
  }, [authData.isAuthenticated, uiData.activeTab]);

  // Section-aware refresh handler: only re-fetches the current section's data
  const handleRefresh = async () => {
    productsData.setRefreshing(true);
    try {
      if (uiData.activeTab === 'dashboard' || uiData.activeTab === 'analytics' || uiData.activeTab === 'catalogue') {
        await Promise.all([
          productsData.handleFetchProducts(true),
          (uiData.activeTab === 'dashboard' || uiData.activeTab === 'analytics')
            ? analyticsData.handleFetchAnalytics(analyticsData.selectedAnalyticsSlug)
            : Promise.resolve(),
        ]);
      } else if (uiData.activeTab === 'inventory') {
        await Promise.all([
          productsData.handleFetchProducts(true),
          inventoryData.handleFetchTransactions(true),
          invoicesOrdersData.handleFetchOrders(true),
        ]);
      } else if (uiData.activeTab === 'invoices') {
        await Promise.all([
          invoicesOrdersData.handleFetchInvoices(true),
          invoicesOrdersData.handleFetchOrders(true),
          customersData.handleFetchCustomers(true),
          creditsData.handleFetchCredits(true),
        ]);
      } else if (uiData.activeTab === 'reviews') {
        await reviewsData.handleFetchReviews(true);
      }
    } finally {
      productsData.setRefreshing(false);
    }
  };

  return {
    // Auth & Nav
    isAuthenticated: authData.isAuthenticated,
    isCheckingAuth: authData.isCheckingAuth,
    authLoadingMessage: authData.authLoadingMessage,
    email: authData.email,
    setEmail: authData.setEmail,
    username: authData.username,
    setUsername: authData.setUsername,
    password: authData.password,
    setPassword: authData.setPassword,
    token: authData.token,
    currentUser: authData.currentUser,
    isLoggingIn: authData.isLoggingIn,
    handleLogin: authData.handleLogin,
    handleLogout: authData.handleLogout,
    handleChangeUsername: authData.handleChangeUsername,
    handleChangeEmail: authData.handleChangeEmail,
    handleChangePassword: authData.handleChangePassword,
    handleUpdateUser: authData.handleUpdateUser,
    handleDeleteAccount: authData.handleDeleteAccount,
    activeTab: uiData.activeTab,
    setActiveTab: uiData.setActiveTab,
    tabValues: uiData.tabValues,

    // Sync
    apiHost: authData.apiHost,
    setApiHost: authData.setApiHost,
    showConfig: authData.showConfig,
    setShowConfig: authData.setShowConfig,
    isSyncing: uiData.isSyncing,
    syncMessage: uiData.syncMessage,
    handleManualSync: uiData.handleManualSync,

    // Products & Categories
    products: productsData.products,
    categories: productsData.categories,
    isLoading: productsData.isLoading,
    refreshing: productsData.refreshing,
    handleRefresh,
    handleFetchProducts: productsData.handleFetchProducts,
    handleToggleStock: productsData.handleToggleStock,
    handleUpdateVisibility: productsData.handleUpdateVisibility,
    handleSaveProduct: productsData.handleSaveProduct,
    handleDeleteProduct: productsData.handleDeleteProduct,
    handleReorderProductImages: productsData.handleReorderProductImages,
    handleAddCategory: productsData.handleAddCategory,
    handleDeleteCategory: productsData.handleDeleteCategory,
    searchQuery: productsData.searchQuery,
    setSearchQuery: productsData.setSearchQuery,

    // Inventory
    transactions: inventoryData.transactions,
    isLoadingTransactions: inventoryData.isLoadingTransactions,
    handleFetchTransactions: inventoryData.handleFetchTransactions,
    handleUpdateInventory: inventoryData.handleUpdateInventory,
    handleRecordTransaction: inventoryData.handleRecordTransaction,
    handleFetchPaginatedStock: inventoryData.handleFetchPaginatedStock,

    // Customers
    customers: customersData.customers,
    customerTotalCount: customersData.customerTotalCount,
    isLoadingCustomers: customersData.isLoadingCustomers,
    handleFetchCustomers: customersData.handleFetchCustomers,
    handleFetchPaginatedCustomers: customersData.handleFetchPaginatedCustomers,
    handleCreateCustomer: customersData.handleCreateCustomer,
    handleUpdateCustomer: customersData.handleUpdateCustomer,
    handleDeleteCustomer: customersData.handleDeleteCustomer,
    handleFetchCustomerOrderHistory: customersData.handleFetchCustomerOrderHistory,
    handleFetchPaginatedProducts: productsData.handleFetchPaginatedProducts,

    // Invoices & Orders
    invoices: invoicesOrdersData.invoices,
    isLoadingInvoices: invoicesOrdersData.isLoadingInvoices,
    orders: invoicesOrdersData.orders,
    isLoadingOrders: invoicesOrdersData.isLoadingOrders,
    handleFetchInvoices: invoicesOrdersData.handleFetchInvoices,
    handleFetchPaginatedInvoices: invoicesOrdersData.handleFetchPaginatedInvoices,
    handleFetchOrders: invoicesOrdersData.handleFetchOrders,
    handleFetchPaginatedOrders: invoicesOrdersData.handleFetchPaginatedOrders,
    handleCreateOrder: invoicesOrdersData.handleCreateOrder,
    handleUpdateInvoice: invoicesOrdersData.handleUpdateInvoice,
    handleDeleteOrder: invoicesOrdersData.handleDeleteOrder,

    // Reviews
    reviews: reviewsData.reviews,
    reviewCounts: reviewsData.reviewCounts,
    isLoadingReviews: reviewsData.isLoadingReviews,
    handleFetchReviews: reviewsData.handleFetchReviews,
    handleFetchPaginatedReviews: reviewsData.handleFetchPaginatedReviews,
    handleAddReview: reviewsData.handleAddReview,
    handleUpdateReview: reviewsData.handleUpdateReview,
    handleDeleteReview: reviewsData.handleDeleteReview,
    handleToggleReviewApproval: reviewsData.handleToggleReviewApproval,

    // Credits pagination
    handleFetchPaginatedCredits: creditsData.handleFetchPaginatedCredits,

    // Inquiries
    inquiries: inquiriesData.inquiries,
    pendingInquiriesCount: inquiriesData.pendingInquiriesCount,
    isLoadingInquiries: inquiriesData.isLoadingInquiries,
    inquiriesPagination: inquiriesData.inquiriesPagination,
    inquiriesSortBy: inquiriesData.inquiriesSortBy,
    setInquiriesSortBy: inquiriesData.setInquiriesSortBy,
    inquiriesStatusFilter: inquiriesData.inquiriesStatusFilter,
    setInquiriesStatusFilter: inquiriesData.setInquiriesStatusFilter,
    inquiriesSearchQuery: inquiriesData.inquiriesSearchQuery,
    setInquiriesSearchQuery: inquiriesData.setInquiriesSearchQuery,
    handleFetchPaginatedInquiries: inquiriesData.handleFetchPaginatedInquiries,
    handleResolveInquiry: inquiriesData.handleResolveInquiry,

    // Analytics
    stats: analyticsData.stats,
    analyticsMetrics: analyticsData.analyticsMetrics,
    analyticsOverview: analyticsData.analyticsOverview,
    allProductsAnalytics: analyticsData.allProductsAnalytics,
    viewsAnalytics: analyticsData.viewsAnalytics,
    clicksAnalytics: analyticsData.clicksAnalytics,
    conversionAnalytics: analyticsData.conversionAnalytics,
    funnelAnalytics: analyticsData.funnelAnalytics,
    channelRatioAnalytics: analyticsData.channelRatioAnalytics,
    growthPulseAnalytics: analyticsData.growthPulseAnalytics,
    paymentModesAnalytics: analyticsData.paymentModesAnalytics,
    demandHighlightsAnalytics: analyticsData.demandHighlightsAnalytics,
    catalogueTelemetryAnalytics: analyticsData.catalogueTelemetryAnalytics,
    inventorySummaryAnalytics: analyticsData.inventorySummaryAnalytics,
    isLoadingAnalytics: analyticsData.isLoadingAnalytics,
    handleFetchAnalytics: analyticsData.handleFetchAnalytics,
    fetchPaginatedCatalogueTelemetry: analyticsData.fetchPaginatedCatalogueTelemetry,
    activeAnalyticsProduct: analyticsData.activeAnalyticsProduct,
    selectedAnalyticsSlug: analyticsData.selectedAnalyticsSlug,
    setSelectedAnalyticsSlug: analyticsData.setSelectedAnalyticsSlug,
    showAnalyticsSelector: analyticsData.showAnalyticsSelector,
    setShowAnalyticsSelector: analyticsData.setShowAnalyticsSelector,

    // Modals
    formModalOpen: productsData.formModalOpen,
    setFormModalOpen: productsData.setFormModalOpen,
    selectedProductDetails: productsData.selectedProductDetails,
    setSelectedProductDetails: productsData.setSelectedProductDetails,
    activeDetailsProduct: productsData.activeDetailsProduct,
    categoryModalOpen: productsData.categoryModalOpen,
    setCategoryModalOpen: productsData.setCategoryModalOpen,
    accountModalOpen: uiData.accountModalOpen,
    setAccountModalOpen: uiData.setAccountModalOpen,
    inquiriesModalOpen: inquiriesData.inquiriesModalOpen,
    setInquiriesModalOpen: inquiriesData.setInquiriesModalOpen,
    drawerMenuOpen: uiData.drawerMenuOpen,
    setDrawerMenuOpen: uiData.setDrawerMenuOpen,
    customerModalOpen: customersData.customerModalOpen,
    setCustomerModalOpen: customersData.setCustomerModalOpen,

    // Credits
    credits: creditsData.credits,
    creditMetrics: creditsData.creditMetrics,
    isLoadingCredits: creditsData.isLoadingCredits,
    creditModalOpen: creditsData.creditModalOpen,
    setCreditModalOpen: creditsData.setCreditModalOpen,
    handleFetchCredits: creditsData.handleFetchCredits,
    handleCreateCredit: creditsData.handleCreateCredit,
    handleUpdateCredit: creditsData.handleUpdateCredit,
    handleRecordCreditPayment: creditsData.handleRecordCreditPayment,
    handleDeleteCredit: creditsData.handleDeleteCredit,
    isEditing: productsData.isEditing,
    editingSlug: productsData.editingSlug,
    triggerAddProduct: productsData.triggerAddProduct,
    triggerEditProduct: productsData.triggerEditProduct,

    // Search & Suggestions Backend Routes
    handleSearchProducts: searchData.handleSearchProducts,
    handleGetProductSuggestions: searchData.handleGetProductSuggestions,
    handleSearchInventory: searchData.handleSearchInventory,
    handleGetInventorySuggestions: searchData.handleGetInventorySuggestions,
    handleSearchCustomers: searchData.handleSearchCustomers,
    handleGetCustomerSuggestions: searchData.handleGetCustomerSuggestions,
    handleSearchOrders: searchData.handleSearchOrders,
    handleSearchInvoices: searchData.handleSearchInvoices,
    handleSearchCredits: searchData.handleSearchCredits,
    handleSearchReviews: searchData.handleSearchReviews,
    handleGetReviewSuggestions: searchData.handleGetReviewSuggestions,
    handleSearchInquiries: searchData.handleSearchInquiries,
    handleGetInquirySuggestions: searchData.handleGetInquirySuggestions,

    // Alert
    alertConfig: uiData.alertConfig,
    setAlertConfig: uiData.setAlertConfig,
    showAlert: uiData.showAlert,
  };
}

export default useAppData;
