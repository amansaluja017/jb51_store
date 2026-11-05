import React from 'react';
import { useAppDataContext } from '../../src/context/AppDataContext';
import CatalogScreen from '../../src/screens/CatalogScreen';

export default function ProductsCatalogScreen() {
  const data = useAppDataContext();

  return (
    <CatalogScreen
      products={data.products}
      categories={data.categories}
      searchQuery={data.searchQuery}
      setSearchQuery={data.setSearchQuery}
      isLoading={data.isLoading}
      refreshing={data.refreshing}
      onRefresh={data.handleRefresh}
      onAddProduct={data.triggerAddProduct}
      onManageCategories={() => data.setCategoryModalOpen(true)}
      onToggleStock={data.handleToggleStock}
      onUpdateVisibility={data.handleUpdateVisibility}
      onEditProduct={data.triggerEditProduct}
      onDeleteProduct={data.handleDeleteProduct}
      onViewProductDetails={(prod) => data.setSelectedProductDetails(prod)}
      onFetchPaginatedProducts={data.handleFetchPaginatedProducts}
      onSearchProducts={data.handleSearchProducts}
      onGetProductSuggestions={data.handleGetProductSuggestions}
    />
  );
}

