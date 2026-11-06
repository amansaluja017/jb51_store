import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Inquiry } from '../../types';

interface PaginatedInquiriesResponse {
  items: Inquiry[];
  total: number;
  totalPages: number;
  pendingCount?: number;
  resolvedCount?: number;
  page?: number;
  limit?: number;
}

interface UseInquiriesDataProps {
  trpcRequest: <T = unknown>(path: string, options?: { method?: 'GET' | 'POST'; body?: unknown; input?: unknown }) => Promise<T>;
  showAlert: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
}

export function useInquiriesData({ trpcRequest, showAlert }: UseInquiriesDataProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [inquiriesModalOpen, setInquiriesModalOpen] = useState(false);

  const [inquiriesPagination, setInquiriesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: false,
    pendingCount: 0,
    resolvedCount: 0,
  });

  const [inquiriesSortBy, setInquiriesSortBy] = useState<'recent' | 'oldest' | 'name-asc' | 'name-desc'>('recent');
  const [inquiriesStatusFilter, setInquiriesStatusFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [inquiriesSearchQuery, setInquiriesSearchQuery] = useState('');

  const inquiriesSearchQueryRef = useRef(inquiriesSearchQuery);
  inquiriesSearchQueryRef.current = inquiriesSearchQuery;
  const inquiriesStatusFilterRef = useRef(inquiriesStatusFilter);
  inquiriesStatusFilterRef.current = inquiriesStatusFilter;
  const inquiriesSortByRef = useRef(inquiriesSortBy);
  inquiriesSortByRef.current = inquiriesSortBy;
  const hasFetchedInquiries = useRef(false);
  const isFetchingInquiriesRef = useRef(false);

  const pendingInquiriesCount = useMemo(
    () => (inquiriesPagination.pendingCount > 0 ? inquiriesPagination.pendingCount : inquiries.filter(i => i.status !== 'Resolved').length),
    [inquiries, inquiriesPagination.pendingCount]
  );

  const handleFetchPaginatedInquiries = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: 'all' | 'pending' | 'resolved';
      sortBy?: 'recent' | 'oldest' | 'name-asc' | 'name-desc';
      append?: boolean;
    }) => {
      if (isFetchingInquiriesRef.current) return;
      isFetchingInquiriesRef.current = true;
      setIsLoadingInquiries(true);
      try {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        const search = params?.search !== undefined ? params.search : inquiriesSearchQueryRef.current;
        const status = params?.status !== undefined ? params.status : inquiriesStatusFilterRef.current;
        const sortBy = params?.sortBy !== undefined ? params.sortBy : inquiriesSortByRef.current;
        const append = params?.append ?? false;

        const res = await trpcRequest<PaginatedInquiriesResponse>('inquiries.getPaginated', {
          input: {
            page,
            limit,
            search: search && search.trim() ? search.trim() : null,
            status: status || 'all',
            sortBy: sortBy || 'recent',
          },
        });

        const items = Array.isArray(res?.items) ? res.items : [];
        const total = typeof res?.total === 'number' ? res.total : items.length;
        const totalPages = typeof res?.totalPages === 'number' ? res.totalPages : 1;
        const pendingCount = typeof res?.pendingCount === 'number' ? res.pendingCount : 0;
        const resolvedCount = typeof res?.resolvedCount === 'number' ? res.resolvedCount : 0;

        if (append) {
          setInquiries(prev => {
            const existingIds = new Set(prev.map(i => i.id));
            const newItems = items.filter(i => !existingIds.has(i.id));
            return [...prev, ...newItems];
          });
        } else {
          setInquiries(items);
        }

        setInquiriesPagination({
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
          pendingCount,
          resolvedCount,
        });

        hasFetchedInquiries.current = true;
        return res;
      } catch (err: unknown) {
        console.error('[handleFetchPaginatedInquiries Error]:', err);
      } finally {
        setIsLoadingInquiries(false);
        isFetchingInquiriesRef.current = false;
      }
    },
    [trpcRequest]
  );

  const handleResolveInquiry = useCallback(async (id: string, name?: string) => {
    try {
      await trpcRequest('inquiries.updateStatus', {
        method: 'POST',
        body: { id, status: 'resolved' },
      });
      setInquiries(prev => {
        if (inquiriesStatusFilterRef.current === 'pending') {
          return prev.filter(inq => inq.id !== id);
        }
        return prev.map(inq => (inq.id === id ? { ...inq, status: 'Resolved' as const } : inq));
      });
      setInquiriesPagination(prev => {
        const nextPending = Math.max(0, prev.pendingCount - 1);
        const nextResolved = prev.resolvedCount + 1;
        const nextTotal = inquiriesStatusFilterRef.current === 'pending' ? Math.max(0, prev.total - 1) : prev.total;
        const nextTotalPages =
          inquiriesStatusFilterRef.current === 'pending'
            ? Math.max(1, Math.ceil(nextTotal / (prev.limit || 10)))
            : prev.totalPages;
        return {
          ...prev,
          total: nextTotal,
          totalPages: nextTotalPages,
          pendingCount: nextPending,
          resolvedCount: nextResolved,
        };
      });
      showAlert('Inquiry Resolved', `Status for ${name || 'client'} marked as Resolved.`, 'success');
      handleFetchPaginatedInquiries({
        page: inquiriesPagination.page,
        status: inquiriesStatusFilterRef.current,
        append: false,
      });
    } catch (err: unknown) {
      console.error('[handleResolveInquiry Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to update inquiry status';
      showAlert('Error', message, 'error');
    }
  }, [trpcRequest, showAlert, inquiriesPagination.page, handleFetchPaginatedInquiries]);

  return {
    inquiries,
    setInquiries,
    isLoadingInquiries,
    setIsLoadingInquiries,
    inquiriesModalOpen,
    setInquiriesModalOpen,
    inquiriesPagination,
    setInquiriesPagination,
    inquiriesSortBy,
    setInquiriesSortBy,
    inquiriesStatusFilter,
    setInquiriesStatusFilter,
    inquiriesSearchQuery,
    setInquiriesSearchQuery,
    pendingInquiriesCount,
    hasFetchedInquiries,
    handleFetchPaginatedInquiries,
    handleResolveInquiry,
  };
}

