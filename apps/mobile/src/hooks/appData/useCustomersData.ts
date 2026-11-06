import { useState, useRef, useCallback } from 'react';
import { Customer, Order, PaginatedCustomersResponse } from '../../types';

interface CustomerOrderHistoryResponse {
  customer: Customer;
  totalOrders: number;
  totalSpend: number;
  avgOrderValue: number;
  orders: Order[];
}

interface UseCustomersDataProps {
  trpcRequest: <T = unknown>(path: string, options?: { method?: 'GET' | 'POST'; body?: unknown; input?: unknown }) => Promise<T>;
  showAlert: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
}

export function useCustomersData({ trpcRequest, showAlert }: UseCustomersDataProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerTotalCount, setCustomerTotalCount] = useState<number>(0);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const hasFetchedCustomers = useRef(false);
  const isFetchingCustomersRef = useRef(false);

  const handleFetchCustomers = useCallback(async (force = false) => {
    if (isFetchingCustomersRef.current) return;
    if (hasFetchedCustomers.current && !force) return;
    isFetchingCustomersRef.current = true;
    setIsLoadingCustomers(true);
    try {
      const res = await trpcRequest<Customer[]>('customers.getAll');
      if (Array.isArray(res)) {
        setCustomers(res);
      }
      hasFetchedCustomers.current = true;
    } catch (err: unknown) {
      console.error('[handleFetchCustomers Error]:', err);
    } finally {
      setIsLoadingCustomers(false);
      isFetchingCustomersRef.current = false;
    }
  }, [trpcRequest]);

  const handleFetchPaginatedCustomers = useCallback(async (params?: {
    search?: string;
    sortBy?: 'name-asc' | 'name-desc' | 'createdAt-desc' | 'createdAt-asc';
    page?: number;
    limit?: number;
  }) => {
    try {
      const res = await trpcRequest<PaginatedCustomersResponse>('customers.getPaginated', {
        input: params,
      });
      if (res && typeof res.total === 'number') {
        setCustomerTotalCount(res.total);
      }
      return res;
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedCustomers Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  const handleCreateCustomer = useCallback(async (data: {
    name: string;
    phoneNumber: string;
    email?: string;
    address?: string;
  }) => {
    try {
      const res = await trpcRequest<Customer>('customers.create', {
        method: 'POST',
        body: data,
      });
      const newCust = res;
      setCustomers(prev => [newCust, ...prev]);
      showAlert('Customer Added', `Customer "${data.name}" added successfully.`, 'success');
      return newCust;
    } catch (err: unknown) {
      console.error('[handleCreateCustomer Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to create customer';
      showAlert('Error Adding Customer', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert]);

  const handleUpdateCustomer = useCallback(async (data: {
    id: string;
    name?: string;
    phoneNumber?: string;
    email?: string | null;
    address?: string | null;
  }) => {
    try {
      const res = await trpcRequest<Customer>('customers.update', {
        method: 'POST',
        body: data,
      });
      const updatedCust = res;
      setCustomers(prev =>
        prev.map(c => (c.id === updatedCust.id ? { ...c, ...updatedCust } : c))
      );
      showAlert('Customer Updated', `Customer "${updatedCust.name}" updated successfully.`, 'success');
      return updatedCust;
    } catch (err: unknown) {
      console.error('[handleUpdateCustomer Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to update customer';
      showAlert('Error Updating Customer', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert]);

  const handleDeleteCustomer = useCallback(async (id: string, name?: string, onSuccess?: () => void) => {
    showAlert(
      'Delete Customer',
      `Are you sure you want to delete customer "${name || 'this customer'}"? This action cannot be undone.`,
      'confirm',
      async () => {
        try {
          await trpcRequest('customers.delete', {
            method: 'POST',
            body: { id },
          });
          setCustomers(prev => prev.filter(c => c.id !== id));
          setCustomerTotalCount(prev => Math.max(0, prev - 1));
          showAlert('Customer Deleted', 'Customer has been removed successfully.', 'success');
          onSuccess?.();
        } catch (err: unknown) {
          console.error('[handleDeleteCustomer Error]:', err);
          const message = err instanceof Error ? err.message : 'Failed to delete customer';
          showAlert('Error Deleting Customer', message, 'error');
        }
      }
    );
  }, [trpcRequest, showAlert]);

  const handleFetchCustomerOrderHistory = useCallback(async (customerId: string) => {
    try {
      const res = await trpcRequest<CustomerOrderHistoryResponse>('customers.getOrderHistory', {
        input: { customerId },
      });
      return res;
    } catch (err: unknown) {
      console.error('[handleFetchCustomerOrderHistory Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch customer order history';
      showAlert(
        'Error Loading History',
        message,
        'error'
      );
      throw err;
    }
  }, [trpcRequest, showAlert]);

  return {
    customers,
    setCustomers,
    customerTotalCount,
    setCustomerTotalCount,
    isLoadingCustomers,
    setIsLoadingCustomers,
    hasFetchedCustomers,
    customerModalOpen,
    setCustomerModalOpen,
    handleFetchCustomers,
    handleFetchPaginatedCustomers,
    handleCreateCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer,
    handleFetchCustomerOrderHistory,
  };
}

