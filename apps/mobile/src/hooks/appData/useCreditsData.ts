import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Credit, CreditMetrics } from '../../types';
import { TabType } from '../../components/NavigationTabBar';
import { queryClient, QUERY_KEYS } from '../../lib/queryClient';

interface PaginatedCreditsResponse {
  items?: Credit[];
  credits?: Credit[];
  metrics?: CreditMetrics;
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
}

interface UseCreditsDataProps {
  trpcRequest: <T = unknown>(path: string, options?: { method?: 'GET' | 'POST'; body?: unknown; input?: unknown }) => Promise<T>;
  showAlert: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
  handleFetchInvoices: (force?: boolean) => Promise<void>;
  isAuthenticated?: boolean;
  activeTab?: TabType;
}

export function useCreditsData({ trpcRequest, showAlert, handleFetchInvoices, isAuthenticated }: UseCreditsDataProps) {
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  const defaultCreditParams = useMemo(() => ({ page: 1, limit: 10, filterTab: 'all' as const }), []);

  // Lazy query: Only query credits when Credit Manager modal is opened
  // TanStack Query for credits list and summary metrics
  const {
    data: fetchedCreditsData,
    isLoading: isLoadingQueryCredits,
    isFetching: isFetchingQueryCredits,
    refetch: refetchCredits,
  } = useQuery({
    queryKey: QUERY_KEYS.credits.paginated(defaultCreditParams),
    queryFn: async () => {
      const res = await trpcRequest<PaginatedCreditsResponse>('credits.getPaginated', {
        input: defaultCreditParams,
      });
      return res;
    },
    enabled: Boolean(isAuthenticated) && creditModalOpen,
    staleTime: 60 * 1000,
  });

  const [credits, setCredits] = useState<Credit[]>([]);
  const [creditMetrics, setCreditMetrics] = useState<CreditMetrics | null>(null);

  useEffect(() => {
    if (fetchedCreditsData) {
      if (fetchedCreditsData.items && Array.isArray(fetchedCreditsData.items)) {
        setCredits(fetchedCreditsData.items);
      } else if (fetchedCreditsData.credits && Array.isArray(fetchedCreditsData.credits)) {
        setCredits(fetchedCreditsData.credits);
      }
      if (fetchedCreditsData.metrics) {
        setCreditMetrics(fetchedCreditsData.metrics);
      }
    }
  }, [fetchedCreditsData]);

  const handleFetchCredits = useCallback(async (_isRefresh = false) => {
    await refetchCredits();
  }, [refetchCredits]);

  const handleFetchPaginatedCredits = useCallback(async (params?: {
    search?: string;
    filterTab?: 'all' | 'pending' | 'overdue' | 'settled';
    sortBy?: 'createdAt-desc' | 'createdAt-asc' | 'dueAmount-desc' | 'dueDate-asc';
    page?: number;
    limit?: number;
  }) => {
    const cleanParams = {
      page: params?.page || 1,
      limit: params?.limit || 10,
      filterTab: params?.filterTab || 'all',
      ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params?.search ? { search: params.search } : {}),
    };
    try {
      return await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.credits.paginated(cleanParams),
        queryFn: async () => {
          const res = await trpcRequest<PaginatedCreditsResponse>('credits.getPaginated', {
            input: cleanParams,
          });
          if (res?.metrics) {
            setCreditMetrics(res.metrics);
          }
          const page = cleanParams.page;
          const isCleanQuery = !cleanParams.search && cleanParams.filterTab === 'all';
          if (page === 1 && isCleanQuery) {
            const items = res?.items || res?.credits;
            if (Array.isArray(items)) {
              setCredits(items);
            }
          }
          return res;
        },
        staleTime: 30 * 1000,
      });
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedCredits Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  const handleCreateCredit = useCallback(async (data: {
    orderId?: string | null;
    invoiceId?: string | null;
    paidAmount: number;
    dueAmount: number;
    dueDate?: string | null;
    advancePaymentMode?: string | null;
    notes?: string | null;
  }) => {
    try {
      const res = await trpcRequest<Credit>('credits.create', {
        method: 'POST',
        body: data,
      });
      showAlert('Credit Recorded', 'Credit balance recorded successfully.', 'success');

      // Invalidate credits and invoices caches
      await queryClient.invalidateQueries({ queryKey: ['credits'] });
      await handleFetchInvoices();
      return res;
    } catch (err: unknown) {
      console.error('[handleCreateCredit Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to create credit record';
      showAlert('Error Creating Credit', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert, handleFetchInvoices]);

  const handleUpdateCredit = useCallback(async (data: {
    id: string;
    paidAmount?: number;
    dueAmount?: number;
    dueDate?: string | null;
    advancePaymentMode?: string | null;
  }) => {
    try {
      const res = await trpcRequest<Credit>('credits.update', {
        method: 'POST',
        body: data,
      });
      showAlert('Credit Updated', 'Credit record updated successfully.', 'success');

      // Invalidate credits and invoices caches
      await queryClient.invalidateQueries({ queryKey: ['credits'] });
      await handleFetchInvoices();
      return res;
    } catch (err: unknown) {
      console.error('[handleUpdateCredit Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to update credit record';
      showAlert('Error Updating Credit', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert, handleFetchInvoices]);

  const handleRecordCreditPayment = useCallback(async (
    id: string,
    amount: number,
    paymentMode = 'cash',
    notes?: string
  ) => {
    try {
      const res = await trpcRequest<Credit>('credits.recordPayment', {
        method: 'POST',
        body: { id, amount, paymentMode, notes },
      });
      showAlert('Payment Recorded', `Payment of ₹${amount.toLocaleString('en-IN')} received (${paymentMode.toUpperCase()}).`, 'success');

      // Invalidate credits and invoices caches
      await queryClient.invalidateQueries({ queryKey: ['credits'] });
      await handleFetchInvoices();
      return res;
    } catch (err: unknown) {
      console.error('[handleRecordCreditPayment Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to record credit payment';
      showAlert('Error Recording Payment', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert, handleFetchInvoices]);

  const handleDeleteCredit = useCallback(async (id: string, skipConfirm = false) => {
    const doDelete = async () => {
      try {
        await trpcRequest('credits.delete', {
          method: 'POST',
          body: { id },
        });
        setCredits(prev => prev.filter(c => c.id !== id));
        showAlert('Credit Deleted', 'Credit record has been removed.', 'success');
        await queryClient.invalidateQueries({ queryKey: ['credits'] });
      } catch (err: unknown) {
        console.error('[handleDeleteCredit Error]:', err);
        const message = err instanceof Error ? err.message : 'Failed to delete credit';
        showAlert('Error Deleting Credit', message, 'error');
      }
    };

    if (skipConfirm) {
      await doDelete();
    } else {
      showAlert(
        'Delete Credit',
        'Are you sure you want to delete this credit record? This cannot be undone.',
        'confirm',
        doDelete
      );
    }
  }, [trpcRequest, showAlert]);

  return {
    credits,
    setCredits,
    creditMetrics,
    setCreditMetrics,
    isLoadingCredits: isLoadingQueryCredits || isFetchingQueryCredits,
    setIsLoadingCredits: () => {},
    creditModalOpen,
    setCreditModalOpen,
    handleFetchCredits,
    handleFetchPaginatedCredits,
    handleCreateCredit,
    handleUpdateCredit,
    handleRecordCreditPayment,
    handleDeleteCredit,
  };
}
