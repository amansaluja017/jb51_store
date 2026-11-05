import { useState, useRef, useCallback } from 'react';
import { Invoice, Order, PaginatedInvoicesResponse, PaginatedOrdersResponse } from '../../types';

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
}

export function useInvoicesOrdersData({ trpcRequest, showAlert }: UseInvoicesOrdersDataProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const hasFetchedInvoices = useRef(false);
  const hasFetchedOrders = useRef(false);
  const isFetchingOrders = useRef(false);

  const handleFetchInvoices = useCallback(async (force = false) => {
    if (hasFetchedInvoices.current && !force) return;
    setIsLoadingInvoices(true);
    try {
      const res = await trpcRequest<PaginatedInvoicesResponse | Invoice[]>('invoices.getPaginated', {
        input: { page: 1, limit: 15 },
      });
      if (res && 'items' in res && Array.isArray(res.items)) {
        setInvoices(res.items);
      } else if (Array.isArray(res)) {
        setInvoices(res);
      }
      hasFetchedInvoices.current = true;
    } catch (err: unknown) {
      console.error('[handleFetchInvoices Error]:', err);
    } finally {
      setIsLoadingInvoices(false);
    }
  }, [trpcRequest]);

  const handleFetchPaginatedInvoices = useCallback(async (params?: {
    search?: string;
    mode?: 'all' | 'cash' | 'online' | 'credit';
    sortBy?: 'createdAt-desc' | 'createdAt-asc' | 'amount-desc' | 'amount-asc';
    page?: number;
    limit?: number;
  }) => {
    try {
      const res = await trpcRequest<PaginatedInvoicesResponse>('invoices.getPaginated', {
        input: params,
      });
      if ((!params?.page || params.page === 1) && !params?.search && res?.items && Array.isArray(res.items)) {
        setInvoices(res.items);
        hasFetchedInvoices.current = true;
      }
      return res;
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedInvoices Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  const handleFetchOrders = useCallback(async (force = false) => {
    if ((hasFetchedOrders.current || isFetchingOrders.current) && !force) {
      return;
    }
    isFetchingOrders.current = true;
    if (!hasFetchedOrders.current || force) {
      setIsLoadingOrders(true);
    }
    try {
      const res = await trpcRequest<PaginatedOrdersResponse | Order[]>('orders.getPaginated', {
        input: { page: 1, limit: 20 },
      });
      if (res && 'items' in res && Array.isArray(res.items)) {
        setOrders(res.items);
      } else if (Array.isArray(res)) {
        setOrders(res);
      }
      hasFetchedOrders.current = true;
    } catch (err: unknown) {
      console.error('[handleFetchOrders Error]:', err);
    } finally {
      isFetchingOrders.current = false;
      setIsLoadingOrders(false);
    }
  }, [trpcRequest]);

  const handleFetchPaginatedOrders = useCallback(async (params?: {
    search?: string;
    status?: string;
    sortBy?: 'createdAt-desc' | 'createdAt-asc' | 'totalAmount-desc' | 'totalAmount-asc';
    page?: number;
    limit?: number;
  }) => {
    try {
      const res = await trpcRequest<PaginatedOrdersResponse>('orders.getPaginated', {
        input: params,
      });
      if ((!params?.page || params.page === 1) && !params?.search && res?.items && Array.isArray(res.items)) {
        setOrders(res.items);
        hasFetchedOrders.current = true;
      }
      return res;
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedOrders Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  const handleCreateOrder = async (orderData: Record<string, unknown>) => {
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
      return res;
    } catch (err: unknown) {
      console.error('[handleCreateOrder Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to create order';
      showAlert('Order Error', message, 'error');
      throw err;
    }
  };

  const handleUpdateInvoice = async (invoiceData: Partial<Invoice> & { id: string }) => {
    try {
      const res = await trpcRequest<Invoice>('invoices.update', {
        method: 'POST',
        body: invoiceData,
      });
      if (res?.id) {
        setInvoices(prev => prev.map(inv => (inv.id === res.id ? { ...inv, ...res } : inv)));
      }
      return res;
    } catch (err: unknown) {
      console.error('[handleUpdateInvoice Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to update invoice';
      showAlert('Update Invoice Error', message, 'error');
      throw err;
    }
  };

  const handleDeleteOrder = async (id: string, label: string) => {
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
          showAlert('Order Deleted', `Order "${label}" and associated invoice were deleted successfully.`, 'success');
        } catch (err: unknown) {
          console.error('[handleDeleteOrder Error]:', err);
          const message = err instanceof Error ? err.message : 'Failed to delete order';
          showAlert('Error Deleting Order', message, 'error');
        }
      }
    );
  };

  return {
    invoices,
    setInvoices,
    isLoadingInvoices,
    setIsLoadingInvoices,
    hasFetchedInvoices,
    orders,
    setOrders,
    isLoadingOrders,
    setIsLoadingOrders,
    hasFetchedOrders,
    handleFetchInvoices,
    handleFetchPaginatedInvoices,
    handleFetchOrders,
    handleFetchPaginatedOrders,
    handleCreateOrder,
    handleUpdateInvoice,
    handleDeleteOrder,
  };
}

