import React from 'react';
import { useCatalog } from '../../src/context/CatalogContext';
import CatalogScreen from '../../src/screens/CatalogScreen';

export default function ProductsCatalogScreen() {
  const catalog = useCatalog();

  return (
    <CatalogScreen
      products={catalog.products}
      categories={catalog.categories}
      searchQuery={catalog.searchQuery}
      setSearchQuery={catalog.setSearchQuery}
      isLoading={catalog.isLoading}
      refreshing={catalog.refreshing}
      onRefresh={catalog.handleRefresh}
      onAddProduct={catalog.triggerAddProduct}
      onManageCategories={() => catalog.setCategoryModalOpen(true)}
      onToggleStock={catalog.handleToggleStock}
      onUpdateVisibility={catalog.handleUpdateVisibility}
      onEditProduct={catalog.triggerEditProduct}
      onDeleteProduct={catalog.handleDeleteProduct}
      onViewProductDetails={(prod) => catalog.setSelectedProductDetails(prod)}
      onFetchPaginatedProducts={catalog.handleFetchPaginatedProducts}
      onSearchProducts={catalog.handleSearchProducts}
      onGetProductSuggestions={catalog.handleGetProductSuggestions}
    />
  );
}
