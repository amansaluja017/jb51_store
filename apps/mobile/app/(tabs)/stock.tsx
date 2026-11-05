import React from 'react';
import { useAppDataContext } from '../../src/context/AppDataContext';
import InventoryScreen from '../../src/screens/InventoryScreen';

export default function StockScreen() {
  const data = useAppDataContext();

  return (
    <InventoryScreen
      products={data.products}
      categories={data.categories}
      isLoading={data.isLoading || data.isLoadingTransactions}
      refreshing={data.refreshing}
      onRefresh={data.handleRefresh}
      onToggleStock={data.handleToggleStock}
      onUpdateInventory={data.handleUpdateInventory}
      onRecordTransaction={data.handleRecordTransaction}
      transactions={data.transactions}
      isLoadingTransactions={data.isLoadingTransactions}
      onFetchTransactions={data.handleFetchTransactions}
      onViewProductDetails={(prod) => data.setSelectedProductDetails(prod)}
      showAlert={data.showAlert}
      onFetchPaginatedStock={data.handleFetchPaginatedStock}
      onSearchInventory={data.handleSearchInventory}
      onGetInventorySuggestions={data.handleGetInventorySuggestions}
    />
  );
}

