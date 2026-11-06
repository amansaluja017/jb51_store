import React from 'react';
import { useCatalog } from '../../src/context/CatalogContext';
import { useUi } from '../../src/context/UiContext';
import InventoryScreen from '../../src/screens/InventoryScreen';

export default function StockScreen() {
  const catalog = useCatalog();
  const ui = useUi();

  return (
    <InventoryScreen
      products={catalog.products}
      categories={catalog.categories}
      isLoading={catalog.isLoading || catalog.isLoadingTransactions}
      refreshing={catalog.refreshing}
      onRefresh={catalog.handleRefresh}
      onToggleStock={catalog.handleToggleStock}
      onUpdateInventory={catalog.handleUpdateInventory}
      onRecordTransaction={catalog.handleRecordTransaction}
      transactions={catalog.transactions}
      isLoadingTransactions={catalog.isLoadingTransactions}
      onFetchTransactions={catalog.handleFetchTransactions}
      onViewProductDetails={(prod) => catalog.setSelectedProductDetails(prod)}
      showAlert={ui.showAlert}
      onFetchPaginatedStock={catalog.handleFetchPaginatedStock}
      onSearchInventory={catalog.handleSearchInventory}
      onGetInventorySuggestions={catalog.handleGetInventorySuggestions}
    />
  );
}

