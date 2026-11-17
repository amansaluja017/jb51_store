import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useUi } from './UiContext';
import { useProductsData } from '../hooks/appData/useProductsData';
import { useInventoryData } from '../hooks/appData/useInventoryData';
import { useSearchData } from '../hooks/appData/useSearchData';

export interface CatalogContextType {
  // Products & Categories
  products: ReturnType<typeof useProductsData>['products'];
  categories: ReturnType<typeof useProductsData>['categories'];
  isLoading: ReturnType<typeof useProductsData>['isLoading'];
  refreshing: ReturnType<typeof useProductsData>['refreshing'];
  searchQuery: ReturnType<typeof useProductsData>['searchQuery'];
  setSearchQuery: ReturnType<typeof useProductsData>['setSearchQuery'];
  handleRefresh: () => Promise<void>;
  handleFetchProducts: ReturnType<typeof useProductsData>['handleFetchProducts'];
  handleFetchCategories: ReturnType<typeof useProductsData>['handleFetchCategories'];
  handleToggleStock: ReturnType<typeof useProductsData>['handleToggleStock'];
  handleUpdateVisibility: ReturnType<typeof useProductsData>['handleUpdateVisibility'];
  handleSaveProduct: ReturnType<typeof useProductsData>['handleSaveProduct'];
  handleDeleteProduct: ReturnType<typeof useProductsData>['handleDeleteProduct'];
  handleReorderProductImages: ReturnType<typeof useProductsData>['handleReorderProductImages'];
  handleAddCategory: ReturnType<typeof useProductsData>['handleAddCategory'];
  handleDeleteCategory: ReturnType<typeof useProductsData>['handleDeleteCategory'];
  handleFetchPaginatedProducts: ReturnType<typeof useProductsData>['handleFetchPaginatedProducts'];

  // Inventory & Stock
  transactions: ReturnType<typeof useInventoryData>['transactions'];
  transactionsPagination: ReturnType<typeof useInventoryData>['transactionsPagination'];
  transactionStats: ReturnType<typeof useInventoryData>['transactionStats'];
  isLoadingTransactions: ReturnType<typeof useInventoryData>['isLoadingTransactions'];
  handleFetchTransactions: ReturnType<typeof useInventoryData>['handleFetchTransactions'];
  handleFetchPaginatedTransactions: ReturnType<typeof useInventoryData>['handleFetchPaginatedTransactions'];
  handleUpdateInventory: ReturnType<typeof useInventoryData>['handleUpdateInventory'];
  handleRecordTransaction: ReturnType<typeof useInventoryData>['handleRecordTransaction'];
  handleFetchPaginatedStock: ReturnType<typeof useInventoryData>['handleFetchPaginatedStock'];

  // Modals & Active Edit State
  formModalOpen: ReturnType<typeof useProductsData>['formModalOpen'];
  setFormModalOpen: ReturnType<typeof useProductsData>['setFormModalOpen'];
  selectedProductDetails: ReturnType<typeof useProductsData>['selectedProductDetails'];
  setSelectedProductDetails: ReturnType<typeof useProductsData>['setSelectedProductDetails'];
  activeDetailsProduct: ReturnType<typeof useProductsData>['activeDetailsProduct'];
  categoryModalOpen: ReturnType<typeof useProductsData>['categoryModalOpen'];
  setCategoryModalOpen: ReturnType<typeof useProductsData>['setCategoryModalOpen'];
  isEditing: ReturnType<typeof useProductsData>['isEditing'];
  editingSlug: ReturnType<typeof useProductsData>['editingSlug'];
  editingProduct: ReturnType<typeof useProductsData>['editingProduct'];
  setEditingProduct: ReturnType<typeof useProductsData>['setEditingProduct'];
  triggerAddProduct: ReturnType<typeof useProductsData>['triggerAddProduct'];
  triggerEditProduct: ReturnType<typeof useProductsData>['triggerEditProduct'];

  // Search & Suggestions
  handleSearchProducts: ReturnType<typeof useSearchData>['handleSearchProducts'];
  handleGetProductSuggestions: ReturnType<typeof useSearchData>['handleGetProductSuggestions'];
  handleSearchInventory: ReturnType<typeof useSearchData>['handleSearchInventory'];
  handleGetInventorySuggestions: ReturnType<typeof useSearchData>['handleGetInventorySuggestions'];
}

const CatalogContext = createContext<CatalogContextType | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const ui = useUi();

  const productsData = useProductsData({
    trpcRequest: auth.trpcRequest,
    showAlert: ui.showAlert,
    setSyncMessage: ui.setSyncMessage,
    isAuthenticated: auth.isAuthenticated,
    activeTab: ui.activeSection,
  });

  const inventoryData = useInventoryData({
    trpcRequest: auth.trpcRequest,
    showAlert: ui.showAlert,
    setProducts: productsData.setProducts,
    handleFetchProducts: productsData.handleFetchProducts,
    isAuthenticated: auth.isAuthenticated,
    activeTab: ui.activeSection,
  });

  const searchData = useSearchData({
    token: auth.token,
    apiHost: auth.apiHost,
  });

  const handleRefresh = useCallback(async () => {
    productsData.setRefreshing(true);
    try {
      await Promise.all([
        productsData.handleFetchPaginatedProducts({ page: 1, limit: 8 }),
        productsData.handleFetchCategories(true),
      ]);
    } finally {
      productsData.setRefreshing(false);
    }
  }, [productsData.handleFetchPaginatedProducts, productsData.handleFetchCategories, productsData.setRefreshing]);

  const value = useMemo<CatalogContextType>(() => ({
    // Products
    products: productsData.products,
    categories: productsData.categories,
    isLoading: productsData.isLoading,
    refreshing: productsData.refreshing,
    searchQuery: productsData.searchQuery,
    setSearchQuery: productsData.setSearchQuery,
    handleRefresh,
    handleFetchProducts: productsData.handleFetchProducts,
    handleFetchCategories: productsData.handleFetchCategories,
    handleToggleStock: productsData.handleToggleStock,
    handleUpdateVisibility: productsData.handleUpdateVisibility,
    handleSaveProduct: productsData.handleSaveProduct,
    handleDeleteProduct: productsData.handleDeleteProduct,
    handleReorderProductImages: productsData.handleReorderProductImages,
    handleAddCategory: productsData.handleAddCategory,
    handleDeleteCategory: productsData.handleDeleteCategory,
    handleFetchPaginatedProducts: productsData.handleFetchPaginatedProducts,

    // Inventory
    transactions: inventoryData.transactions,
    transactionsPagination: inventoryData.transactionsPagination,
    transactionStats: inventoryData.transactionStats,
    isLoadingTransactions: inventoryData.isLoadingTransactions,
    handleFetchTransactions: inventoryData.handleFetchTransactions,
    handleFetchPaginatedTransactions: inventoryData.handleFetchPaginatedTransactions,
    handleUpdateInventory: inventoryData.handleUpdateInventory,
    handleRecordTransaction: inventoryData.handleRecordTransaction,
    handleFetchPaginatedStock: inventoryData.handleFetchPaginatedStock,

    // Modals
    formModalOpen: productsData.formModalOpen,
    setFormModalOpen: productsData.setFormModalOpen,
    selectedProductDetails: productsData.selectedProductDetails,
    setSelectedProductDetails: productsData.setSelectedProductDetails,
    activeDetailsProduct: productsData.activeDetailsProduct,
    categoryModalOpen: productsData.categoryModalOpen,
    setCategoryModalOpen: productsData.setCategoryModalOpen,
    isEditing: productsData.isEditing,
    editingSlug: productsData.editingSlug,
    editingProduct: productsData.editingProduct,
    setEditingProduct: productsData.setEditingProduct,
    triggerAddProduct: productsData.triggerAddProduct,
    triggerEditProduct: productsData.triggerEditProduct,

    // Search
    handleSearchProducts: searchData.handleSearchProducts,
    handleGetProductSuggestions: searchData.handleGetProductSuggestions,
    handleSearchInventory: searchData.handleSearchInventory,
    handleGetInventorySuggestions: searchData.handleGetInventorySuggestions,
  }), [productsData, inventoryData, searchData]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextType {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}

