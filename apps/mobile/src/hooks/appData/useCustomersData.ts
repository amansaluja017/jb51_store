import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Customer, Order, PaginatedCustomersResponse } from '../../types';
import { TabType } from '../../components/NavigationTabBar';
import { queryClient, QUERY_KEYS } from '../../lib/queryClient';

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
  isAuthenticated?: boolean;
  activeTab?: TabType;
}

export function useCustomersData({ trpcRequest, showAlert, isAuthenticated, activeTab: _activeTab }: UseCustomersDataProps) {
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const defaultCustomerParams = useMemo(() => ({ page: 1, limit: 10, sortBy: 'name-asc' as const }), []);

  // TanStack Query for Paginated Customers list - scoped to only fetch when customer modal is explicitly opened
  const {
    data: fetchedCustomersData,
    isLoading: isLoadingQueryCustomers,
    isFetching: isFetchingQueryCustomers,
    isError: isCustomersError,
    error: customersError,
    refetch: refetchCustomers,
  } = useQuery<PaginatedCustomersResponse>({
    queryKey: QUERY_KEYS.customers.paginated(defaultCustomerParams),
    queryFn: async () => {
      const res = await trpcRequest<PaginatedCustomersResponse>('customers.getPaginated', {
        input: defaultCustomerParams,
      });
      if (res && typeof res.total === 'number') {
        setCustomerTotalCount(res.total);
      }
      return res || { items: [], total: 0, totalPages: 1 };
    },
    enabled: Boolean(isAuthenticated) && customerModalOpen,
    staleTime: 60 * 1000,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerTotalCount, setCustomerTotalCount] = useState<number>(0);

  useEffect(() => {
    if (fetchedCustomersData) {
      if (Array.isArray(fetchedCustomersData.items)) {
        setCustomers(fetchedCustomersData.items);
      }
      if (typeof fetchedCustomersData.total === 'number') {
        setCustomerTotalCount(fetchedCustomersData.total);
      }
    }
  }, [fetchedCustomersData]);

  const handleFetchCustomers = useCallback(async (_force = false) => {
    await refetchCustomers();
  }, [refetchCustomers]);

  const handleFetchPaginatedCustomers = useCallback(async (params?: {
    search?: string;
    sortBy?: 'name-asc' | 'name-desc' | 'createdAt-desc' | 'createdAt-asc';
    page?: number;
    limit?: number;
  }) => {
    const cleanParams = {
      page: params?.page || 1,
      limit: params?.limit || 10,
      sortBy: params?.sortBy || 'name-asc',
      ...(params?.search ? { search: params.search } : {}),
    };
    try {
      return await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.customers.paginated(cleanParams),
        queryFn: async () => {
          const res = await trpcRequest<PaginatedCustomersResponse>('customers.getPaginated', {
            input: cleanParams,
          });
          if (res && typeof res.total === 'number') {
            setCustomerTotalCount(res.total);
          }
          if ((!params?.page || params.page === 1) && !params?.search && res?.items && Array.isArray(res.items)) {
            setCustomers(res.items);
          }
          return res;
        },
        staleTime: 30 * 1000,
      });
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
      setCustomerTotalCount(prev => prev + 1);

      // Invalidate customers query cache
      await queryClient.invalidateQueries({ queryKey: ['customers'] });

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

      // Invalidate customers query cache
      await queryClient.invalidateQueries({ queryKey: ['customers'] });

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

          // Invalidate customers query cache
          await queryClient.invalidateQueries({ queryKey: ['customers'] });

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
      return await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.customers.history(customerId),
        queryFn: () => trpcRequest<CustomerOrderHistoryResponse>('customers.getOrderHistory', {
          input: { customerId },
        }),
        staleTime: 60 * 1000,
      });
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
    isLoadingCustomers: isLoadingQueryCustomers || isFetchingQueryCustomers,
    setIsLoadingCustomers: () => {},
    isCustomersError,
    customersError,
    hasFetchedCustomers: !!fetchedCustomersData,
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
