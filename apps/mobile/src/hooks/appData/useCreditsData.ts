import { useState, useRef, useCallback } from 'react';
import { Credit, CreditMetrics } from '../../types';

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
}

export function useCreditsData({ trpcRequest, showAlert, handleFetchInvoices }: UseCreditsDataProps) {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [creditMetrics, setCreditMetrics] = useState<CreditMetrics | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const hasFetchedCredits = useRef(false);
  const isFetchingCreditsRef = useRef(false);

  const handleFetchCredits = useCallback(async (isRefresh = false) => {
    if (isFetchingCreditsRef.current) return;
    if (hasFetchedCredits.current && !isRefresh) return;
    isFetchingCreditsRef.current = true;
    setIsLoadingCredits(true);
    try {
      const res = await trpcRequest<PaginatedCreditsResponse>('credits.getPaginated', {
        input: { page: 1, limit: 10 },
      });
      if (res?.items && Array.isArray(res.items)) {
        setCredits(res.items);
        if (res.metrics) setCreditMetrics(res.metrics);
      } else if (res?.credits && Array.isArray(res.credits)) {
        setCredits(res.credits);
        if (res.metrics) setCreditMetrics(res.metrics);
      }
      hasFetchedCredits.current = true;
    } catch (err: unknown) {
      console.error('[handleFetchCredits Error]:', err);
    } finally {
      setIsLoadingCredits(false);
      isFetchingCreditsRef.current = false;
    }
  }, [trpcRequest]);

  const handleFetchPaginatedCredits = useCallback(async (params?: {
    search?: string;
    filterTab?: 'all' | 'pending' | 'overdue' | 'settled';
    sortBy?: 'createdAt-desc' | 'createdAt-asc' | 'dueAmount-desc' | 'dueDate-asc';
    page?: number;
    limit?: number;
  }) => {
    try {
      const res = await trpcRequest<PaginatedCreditsResponse>('credits.getPaginated', {
        input: params,
      });
      if (res?.metrics) {
        setCreditMetrics(res.metrics);
      }
      const page = params?.page ?? 1;
      const isCleanQuery = !params?.search && (!params?.filterTab || params?.filterTab === 'all');
      if (page === 1 && isCleanQuery) {
        const items = res?.items || res?.credits;
        if (Array.isArray(items)) {
          setCredits(items);
        }
      }
      return res;
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
      await Promise.all([
        handleFetchCredits(true),
        handleFetchInvoices(),
      ]);
      return res;
    } catch (err: unknown) {
      console.error('[handleCreateCredit Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to create credit record';
      showAlert('Error Creating Credit', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert, handleFetchCredits, handleFetchInvoices]);

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
      await Promise.all([
        handleFetchCredits(true),
        handleFetchInvoices(),
      ]);
      return res;
    } catch (err: unknown) {
      console.error('[handleUpdateCredit Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to update credit record';
      showAlert('Error Updating Credit', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert, handleFetchCredits, handleFetchInvoices]);

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
      await Promise.all([
        handleFetchCredits(true),
        handleFetchInvoices(),
      ]);
      return res;
    } catch (err: unknown) {
      console.error('[handleRecordCreditPayment Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to record credit payment';
      showAlert('Error Recording Payment', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert, handleFetchCredits, handleFetchInvoices]);

  const handleDeleteCredit = useCallback(async (id: string, skipConfirm = false) => {
    const doDelete = async () => {
      try {
        await trpcRequest('credits.delete', {
          method: 'POST',
          body: { id },
        });
        setCredits(prev => prev.filter(c => c.id !== id));
        showAlert('Credit Deleted', 'Credit record has been removed.', 'success');
        handleFetchCredits(true);
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
  }, [trpcRequest, showAlert, handleFetchCredits]);

  return {
    credits,
    setCredits,
    creditMetrics,
    setCreditMetrics,
    isLoadingCredits,
    setIsLoadingCredits,
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

