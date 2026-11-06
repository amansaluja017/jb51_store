import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useUi } from './UiContext';
import { useInvoicesOrdersData } from '../hooks/appData/useInvoicesOrdersData';
import { useCustomersData } from '../hooks/appData/useCustomersData';
import { useCreditsData } from '../hooks/appData/useCreditsData';
import { useSearchData } from '../hooks/appData/useSearchData';

export interface BillingContextType {
  // Invoices & Orders
  invoices: ReturnType<typeof useInvoicesOrdersData>['invoices'];
  isLoadingInvoices: ReturnType<typeof useInvoicesOrdersData>['isLoadingInvoices'];
  orders: ReturnType<typeof useInvoicesOrdersData>['orders'];
  isLoadingOrders: ReturnType<typeof useInvoicesOrdersData>['isLoadingOrders'];
  handleFetchInvoices: ReturnType<typeof useInvoicesOrdersData>['handleFetchInvoices'];
  handleFetchPaginatedInvoices: ReturnType<typeof useInvoicesOrdersData>['handleFetchPaginatedInvoices'];
  handleFetchOrders: ReturnType<typeof useInvoicesOrdersData>['handleFetchOrders'];
  handleFetchPaginatedOrders: ReturnType<typeof useInvoicesOrdersData>['handleFetchPaginatedOrders'];
  handleCreateOrder: ReturnType<typeof useInvoicesOrdersData>['handleCreateOrder'];
  handleUpdateInvoice: ReturnType<typeof useInvoicesOrdersData>['handleUpdateInvoice'];
  handleDeleteOrder: ReturnType<typeof useInvoicesOrdersData>['handleDeleteOrder'];

  // Customers
  customers: ReturnType<typeof useCustomersData>['customers'];
  customerTotalCount: ReturnType<typeof useCustomersData>['customerTotalCount'];
  isLoadingCustomers: ReturnType<typeof useCustomersData>['isLoadingCustomers'];
  customerModalOpen: ReturnType<typeof useCustomersData>['customerModalOpen'];
  setCustomerModalOpen: ReturnType<typeof useCustomersData>['setCustomerModalOpen'];
  handleFetchCustomers: ReturnType<typeof useCustomersData>['handleFetchCustomers'];
  handleFetchPaginatedCustomers: ReturnType<typeof useCustomersData>['handleFetchPaginatedCustomers'];
  handleCreateCustomer: ReturnType<typeof useCustomersData>['handleCreateCustomer'];
  handleUpdateCustomer: ReturnType<typeof useCustomersData>['handleUpdateCustomer'];
  handleDeleteCustomer: ReturnType<typeof useCustomersData>['handleDeleteCustomer'];
  handleFetchCustomerOrderHistory: ReturnType<typeof useCustomersData>['handleFetchCustomerOrderHistory'];

  // Credits
  credits: ReturnType<typeof useCreditsData>['credits'];
  creditMetrics: ReturnType<typeof useCreditsData>['creditMetrics'];
  isLoadingCredits: ReturnType<typeof useCreditsData>['isLoadingCredits'];
  creditModalOpen: ReturnType<typeof useCreditsData>['creditModalOpen'];
  setCreditModalOpen: ReturnType<typeof useCreditsData>['setCreditModalOpen'];
  handleFetchCredits: ReturnType<typeof useCreditsData>['handleFetchCredits'];
  handleCreateCredit: ReturnType<typeof useCreditsData>['handleCreateCredit'];
  handleUpdateCredit: ReturnType<typeof useCreditsData>['handleUpdateCredit'];
  handleRecordCreditPayment: ReturnType<typeof useCreditsData>['handleRecordCreditPayment'];
  handleDeleteCredit: ReturnType<typeof useCreditsData>['handleDeleteCredit'];
  handleFetchPaginatedCredits: ReturnType<typeof useCreditsData>['handleFetchPaginatedCredits'];

  // Search & Suggestions
  handleSearchCustomers: ReturnType<typeof useSearchData>['handleSearchCustomers'];
  handleGetCustomerSuggestions: ReturnType<typeof useSearchData>['handleGetCustomerSuggestions'];
  handleSearchOrders: ReturnType<typeof useSearchData>['handleSearchOrders'];
  handleSearchInvoices: ReturnType<typeof useSearchData>['handleSearchInvoices'];
  handleSearchCredits: ReturnType<typeof useSearchData>['handleSearchCredits'];

  handleRefreshBilling: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType | null>(null);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const ui = useUi();

  const invoicesOrdersData = useInvoicesOrdersData({
    trpcRequest: auth.trpcRequest,
    showAlert: ui.showAlert,
  });

  const customersData = useCustomersData({
    trpcRequest: auth.trpcRequest,
    showAlert: ui.showAlert,
  });

  const creditsData = useCreditsData({
    trpcRequest: auth.trpcRequest,
    showAlert: ui.showAlert,
    handleFetchInvoices: invoicesOrdersData.handleFetchInvoices,
  });

  const searchData = useSearchData({
    token: auth.token,
    apiHost: auth.apiHost,
  });

  const handleRefreshBilling = useCallback(async () => {
    await Promise.all([
      invoicesOrdersData.handleFetchInvoices(true),
      invoicesOrdersData.handleFetchOrders(true),
    ]);
  }, [invoicesOrdersData.handleFetchInvoices, invoicesOrdersData.handleFetchOrders]);

  const value = useMemo<BillingContextType>(() => ({
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

    // Customers
    customers: customersData.customers,
    customerTotalCount: customersData.customerTotalCount,
    isLoadingCustomers: customersData.isLoadingCustomers,
    customerModalOpen: customersData.customerModalOpen,
    setCustomerModalOpen: customersData.setCustomerModalOpen,
    handleFetchCustomers: customersData.handleFetchCustomers,
    handleFetchPaginatedCustomers: customersData.handleFetchPaginatedCustomers,
    handleCreateCustomer: customersData.handleCreateCustomer,
    handleUpdateCustomer: customersData.handleUpdateCustomer,
    handleDeleteCustomer: customersData.handleDeleteCustomer,
    handleFetchCustomerOrderHistory: customersData.handleFetchCustomerOrderHistory,

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
    handleFetchPaginatedCredits: creditsData.handleFetchPaginatedCredits,

    // Search
    handleSearchCustomers: searchData.handleSearchCustomers,
    handleGetCustomerSuggestions: searchData.handleGetCustomerSuggestions,
    handleSearchOrders: searchData.handleSearchOrders,
    handleSearchInvoices: searchData.handleSearchInvoices,
    handleSearchCredits: searchData.handleSearchCredits,

    handleRefreshBilling,
  }), [invoicesOrdersData, customersData, creditsData, searchData]);

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextType {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}

