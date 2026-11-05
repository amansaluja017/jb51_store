import React from 'react';
import { useAppDataContext } from '../../src/context/AppDataContext';
import InvoiceScreen from '../../src/screens/InvoiceScreen';

export default function InvoicesScreen() {
  const data = useAppDataContext();

  return (
    <InvoiceScreen
      products={data.products}
      categories={data.categories}
      customers={data.customers}
      invoices={data.invoices}
      orders={data.orders}
      showAlert={data.showAlert}
      isLoading={data.isLoadingInvoices}
      isLoadingOrders={data.isLoadingOrders}
      refreshing={data.refreshing}
      onRefresh={data.handleRefresh}
      onFetchCustomers={data.handleFetchCustomers}
      onFetchPaginatedCustomers={data.handleFetchPaginatedCustomers}
      onCreateCustomer={data.handleCreateCustomer}
      onFetchInvoices={data.handleFetchInvoices}
      onFetchPaginatedInvoices={data.handleFetchPaginatedInvoices}
      onFetchOrders={data.handleFetchOrders}
      onFetchPaginatedOrders={data.handleFetchPaginatedOrders}
      onCreateOrder={data.handleCreateOrder}
      onUpdateInvoice={data.handleUpdateInvoice}
      onDeleteOrder={data.handleDeleteOrder}
      onFetchCredits={() => data.handleFetchCredits(true)}
      onSearchInvoices={data.handleSearchInvoices}
      onSearchOrders={data.handleSearchOrders}
    />
  );
}

