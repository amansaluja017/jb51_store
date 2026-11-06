import React from 'react';
import { useBilling } from '../../src/context/BillingContext';
import { useCatalog } from '../../src/context/CatalogContext';
import { useUi } from '../../src/context/UiContext';
import InvoiceScreen from '../../src/screens/InvoiceScreen';

export default function InvoicesScreen() {
  const billing = useBilling();
  const catalog = useCatalog();
  const ui = useUi();

  return (
    <InvoiceScreen
      products={catalog.products}
      categories={catalog.categories}
      customers={billing.customers}
      invoices={billing.invoices}
      orders={billing.orders}
      showAlert={ui.showAlert}
      isLoading={billing.isLoadingInvoices}
      isLoadingOrders={billing.isLoadingOrders}
      refreshing={false}
      onRefresh={billing.handleRefreshBilling}
      onFetchCustomers={billing.handleFetchCustomers}
      onFetchPaginatedCustomers={billing.handleFetchPaginatedCustomers}
      onCreateCustomer={billing.handleCreateCustomer}
      onFetchInvoices={billing.handleFetchInvoices}
      onFetchPaginatedInvoices={billing.handleFetchPaginatedInvoices}
      onFetchOrders={billing.handleFetchOrders}
      onFetchPaginatedOrders={billing.handleFetchPaginatedOrders}
      onCreateOrder={billing.handleCreateOrder}
      onUpdateInvoice={billing.handleUpdateInvoice}
      onDeleteOrder={billing.handleDeleteOrder}
      onFetchCredits={() => billing.handleFetchCredits(true)}
      onFetchPaginatedProducts={catalog.handleFetchPaginatedProducts}
      onSearchInvoices={billing.handleSearchInvoices}
      onSearchOrders={billing.handleSearchOrders}
    />
  );
}

