import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Invoice, Order, PaginatedInvoicesResponse, PaginatedOrdersResponse } from '../../types';
import { TabType } from '../../components/NavigationTabBar';
import { queryClient, QUERY_KEYS } from '../../lib/queryClient';

interface CreateOrderResponse extends Order {
  invoice?: Invoice;
}

interface DeleteOrderResponse {
  deletedInvoiceIds?: string[];
  success?: boolean;
}

interface UseInvoicesOrdersDataProps {
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

export function useInvoicesOrdersData({ trpcRequest, showAlert, isAuthenticated, activeTab }: UseInvoicesOrdersDataProps) {
  // TanStack Query for Invoices - scoped to only fetch when on Invoices tab
  const {
    data: fetchedInvoicesData,
    isLoading: isLoadingQueryInvoices,
    isFetching: isFetchingQueryInvoices,
    refetch: refetchInvoices,
  } = useQuery<PaginatedInvoicesResponse>({
    queryKey: QUERY_KEYS.invoices.paginated({ page: 1, limit: 15 }),
    queryFn: async () => {
      const res = await trpcRequest<PaginatedInvoicesResponse | Invoice[]>('invoices.getPaginated', {
        input: { page: 1, limit: 15 },
      });
      if (res && typeof res === 'object' && 'items' in res && Array.isArray(res.items)) {
        return res;
      } else if (Array.isArray(res)) {
        return { items: res, total: res.length, totalPages: 1 };
      }
      return { items: [], total: 0, totalPages: 1 };
    },
    enabled: Boolean(isAuthenticated) && activeTab === 'invoices',
    staleTime: 60 * 1000,
  });

  // TanStack Query for Orders - scoped to only fetch when on Invoices tab
  const {
    data: fetchedOrdersData,
    isLoading: isLoadingQueryOrders,
    isFetching: isFetchingQueryOrders,
    refetch: refetchOrders,
  } = useQuery<PaginatedOrdersResponse>({
    queryKey: QUERY_KEYS.orders.paginated({ page: 1, limit: 15 }),
    queryFn: async () => {
      const res = await trpcRequest<PaginatedOrdersResponse | Order[]>('orders.getPaginated', {
        input: { page: 1, limit: 15 },
      });
      if (res && typeof res === 'object' && 'items' in res && Array.isArray(res.items)) {
        return res;
      } else if (Array.isArray(res)) {
        return { items: res, total: res.length, totalPages: 1 };
      }
      return { items: [], total: 0, totalPages: 1 };
    },
    enabled: Boolean(isAuthenticated) && activeTab === 'invoices',
    staleTime: 60 * 1000,
  });

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (fetchedInvoicesData) {
      if ('items' in fetchedInvoicesData && Array.isArray(fetchedInvoicesData.items)) {
        setInvoices(fetchedInvoicesData.items);
      } else if (Array.isArray(fetchedInvoicesData)) {
        setInvoices(fetchedInvoicesData);
      }
    }
  }, [fetchedInvoicesData]);

  useEffect(() => {
    if (fetchedOrdersData) {
      if ('items' in fetchedOrdersData && Array.isArray(fetchedOrdersData.items)) {
        setOrders(fetchedOrdersData.items);
      } else if (Array.isArray(fetchedOrdersData)) {
        setOrders(fetchedOrdersData);
      }
    }
  }, [fetchedOrdersData]);

  const handleFetchInvoices = useCallback(async (_force = false) => {
    await refetchInvoices();
  }, [refetchInvoices]);

  const handleFetchPaginatedInvoices = useCallback(async (params?: {
    search?: string;
    mode?: 'all' | 'cash' | 'online' | 'credit';
    sortBy?: 'createdAt-desc' | 'createdAt-asc' | 'amount-desc' | 'amount-asc';
    page?: number;
    limit?: number;
  }) => {
    try {
      return await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.invoices.paginated(params),
        queryFn: async () => {
          const res = await trpcRequest<PaginatedInvoicesResponse | Invoice[]>('invoices.getPaginated', {
            input: params,
          });
          const normalized: PaginatedInvoicesResponse =
            res && typeof res === 'object' && 'items' in res && Array.isArray(res.items)
              ? res
              : Array.isArray(res)
                ? { items: res, total: res.length, totalPages: 1 }
                : { items: [], total: 0, totalPages: 1 };

          if ((!params?.page || params.page === 1) && !params?.search && normalized.items) {
            setInvoices(normalized.items);
          }
          return normalized;
        },
        staleTime: 30 * 1000,
      });
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedInvoices Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  const handleFetchOrders = useCallback(async (_force = false) => {
    await refetchOrders();
  }, [refetchOrders]);

  const handleFetchPaginatedOrders = useCallback(async (params?: {
    search?: string;
    status?: string;
    sortBy?: 'createdAt-desc' | 'createdAt-asc' | 'totalAmount-desc' | 'totalAmount-asc';
    page?: number;
    limit?: number;
  }) => {
    try {
      return await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.orders.paginated(params),
        queryFn: async () => {
          const res = await trpcRequest<PaginatedOrdersResponse | Order[]>('orders.getPaginated', {
            input: params,
          });
          const normalized: PaginatedOrdersResponse =
            res && typeof res === 'object' && 'items' in res && Array.isArray(res.items)
              ? res
              : Array.isArray(res)
                ? { items: res, total: res.length, totalPages: 1 }
                : { items: [], total: 0, totalPages: 1 };

          if ((!params?.page || params.page === 1) && !params?.search && normalized.items) {
            setOrders(normalized.items);
          }
          return normalized;
        },
        staleTime: 30 * 1000,
      });
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedOrders Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  const handleCreateOrder = useCallback(async (orderData: Record<string, unknown>) => {
    try {
      const res = await trpcRequest<CreateOrderResponse>('orders.create', {
        method: 'POST',
        body: orderData,
      });
      if (res?.invoice) {
        setInvoices(prev => [res.invoice as Invoice, ...prev]);
      }
      if (res?.id) {
        setOrders(prev => [res, ...prev]);
      }

      // Invalidate relevant query caches
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['credits'] });
      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      return res;
    } catch (err: unknown) {
      console.error('[handleCreateOrder Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to create order';
      showAlert('Order Error', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert]);

  const handleUpdateInvoice = useCallback(async (invoiceData: Partial<Invoice> & { id: string }) => {
    try {
      const res = await trpcRequest<Invoice>('invoices.update', {
        method: 'POST',
        body: invoiceData,
      });
      if (res?.id) {
        setInvoices(prev => prev.map(inv => (inv.id === res.id ? { ...inv, ...res } : inv)));
      }

      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      await queryClient.invalidateQueries({ queryKey: ['credits'] });
      return res;
    } catch (err: unknown) {
      console.error('[handleUpdateInvoice Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to update invoice';
      showAlert('Update Invoice Error', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert]);

  const handleDeleteOrder = useCallback(async (id: string, label: string) => {
    showAlert(
      'Delete Order',
      `Are you sure you want to delete order "${label}"? This action cannot be undone and will also delete the associated invoice, cancel credit records, and restore product stock.`,
      'confirm',
      async () => {
        try {
          const res = await trpcRequest<DeleteOrderResponse>('orders.delete', {
            method: 'POST',
            body: { id },
          });
          setOrders(prev => prev.filter(ord => ord.id !== id));
          if (res?.deletedInvoiceIds && Array.isArray(res.deletedInvoiceIds)) {
            setInvoices(prev => prev.filter(inv => !res.deletedInvoiceIds!.includes(inv.id)));
          } else {
            setInvoices(prev => prev.filter(inv => inv.orderId !== id));
          }

          // Invalidate affected query caches
          await queryClient.invalidateQueries({ queryKey: ['orders'] });
          await queryClient.invalidateQueries({ queryKey: ['invoices'] });
          await queryClient.invalidateQueries({ queryKey: ['credits'] });
          await queryClient.invalidateQueries({ queryKey: ['inventory'] });
          await queryClient.invalidateQueries({ queryKey: ['products'] });

          showAlert('Order Deleted', `Order "${label}" and associated invoice were deleted successfully.`, 'success');
        } catch (err: unknown) {
          console.error('[handleDeleteOrder Error]:', err);
          const message = err instanceof Error ? err.message : 'Failed to delete order';
          showAlert('Error Deleting Order', message, 'error');
        }
      }
    );
  }, [trpcRequest, showAlert]);

  return {
    invoices,
    setInvoices,
    invoiceTotalCount: fetchedInvoicesData?.total ?? fetchedInvoicesData?.totalCount ?? invoices.length,
    invoiceTotalRevenue: fetchedInvoicesData?.totalCollected ?? 0,
    invoiceCashRevenue: fetchedInvoicesData?.cashCollected ?? 0,
    isLoadingInvoices: isLoadingQueryInvoices || isFetchingQueryInvoices,
    setIsLoadingInvoices: () => {},
    hasFetchedInvoices: !!fetchedInvoicesData,
    orders,
    setOrders,
    orderTotalCount: fetchedOrdersData?.total ?? fetchedOrdersData?.totalCount ?? orders.length,
    totalOrdersRevenue: fetchedOrdersData?.totalOrdersValue ?? 0,
    isLoadingOrders: isLoadingQueryOrders || isFetchingQueryOrders,
    setIsLoadingOrders: () => {},
    hasFetchedOrders: !!fetchedOrdersData,
    handleFetchInvoices,
    handleFetchPaginatedInvoices,
    handleFetchOrders,
    handleFetchPaginatedOrders,
    handleCreateOrder,
    handleUpdateInvoice,
    handleDeleteOrder,
  };
}
