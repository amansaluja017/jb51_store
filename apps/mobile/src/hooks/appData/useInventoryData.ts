import { useState, useCallback } from 'react';
import {
  Product,
  Variant,
  InventoryTransaction,
  PaginatedStockResponse,
  PaginatedInventoryTransactionsResponse,
  InventoryTransactionStats,
} from '../../types';
import { TabType } from '../../components/NavigationTabBar';
import { queryClient, QUERY_KEYS } from '../../lib/queryClient';

interface UpdateInventoryResponse {
  inStock?: boolean;
  status?: 'listed' | 'unListed' | 'discontinued';
}

interface RecordTransactionResponse {
  id?: string;
  productName?: string;
}

interface UseInventoryDataProps {
  trpcRequest: <T = unknown>(path: string, options?: { method?: 'GET' | 'POST'; body?: unknown; input?: unknown }) => Promise<T>;
  showAlert: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  handleFetchProducts?: (isRefresh?: boolean) => Promise<void>;
  isAuthenticated?: boolean;
  activeTab?: TabType;
}

export function useInventoryData({
  trpcRequest,
  showAlert,
  setProducts,
  handleFetchProducts: _handleFetchProducts,
  isAuthenticated: _isAuthenticated,
  activeTab: _activeTab,
}: UseInventoryDataProps) {
  // Local state for paginated transactions - fetched ON DEMAND only when history modal is opened
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [transactionsPagination, setTransactionsPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [transactionStats, setTransactionStats] = useState<InventoryTransactionStats>({
    salesCount: 0,
    purchasesCount: 0,
    adjustmentsCount: 0,
    totalSoldUnits: 0,
    totalPurchasedUnits: 0,
  });
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState<Error | null>(null);

  /**
   * On-demand paginated fetching for inventory transactions ledger.
   * Utilizes TanStack Query caching and deduplication.
   */
  const handleFetchPaginatedTransactions = useCallback(async (params?: {
    page?: number;
    limit?: number;
    productId?: string;
    search?: string;
    type?: 'all' | 'sale' | 'purchase' | 'adjustment' | 'reservation' | 'release' | 'return';
    force?: boolean;
  }) => {
    setIsLoadingTransactions(true);
    setTransactionsError(null);
    try {
      const queryParams = {
        page: params?.page || 1,
        limit: params?.limit || 15,
        productId: params?.productId,
        search: params?.search,
        type: params?.type,
      };

      const res = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.inventory.paginatedTransactions(queryParams),
        queryFn: () => trpcRequest<PaginatedInventoryTransactionsResponse>('inventory.getTransactions', {
          input: queryParams,
        }),
        staleTime: params?.force ? 0 : 30 * 1000,
      });

      if (res && Array.isArray(res.items)) {
        setTransactions(res.items);
        setTransactionsPagination({
          page: res.page || queryParams.page,
          limit: res.limit || queryParams.limit,
          total: res.total || 0,
          totalPages: res.totalPages || 1,
        });
        if (res.stats) {
          setTransactionStats(res.stats);
        }
        return res;
      }
      return null;
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedTransactions Error]:', err);
      const e = err instanceof Error ? err : new Error('Failed to fetch transactions');
      setTransactionsError(e);
      return null;
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [trpcRequest]);

  const handleFetchTransactions = useCallback(async (force = false) => {
    await handleFetchPaginatedTransactions({
      page: transactionsPagination.page,
      limit: transactionsPagination.limit,
      force,
    });
  }, [handleFetchPaginatedTransactions, transactionsPagination.page, transactionsPagination.limit]);

  const handleUpdateInventory = useCallback(async (product: Product, updatedVariants: Variant[], forceInStock?: boolean) => {
    const totalVariantStock = updatedVariants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    const newInStock = forceInStock !== undefined ? forceInStock : totalVariantStock > 0;

    try {
      const res = await trpcRequest<UpdateInventoryResponse>('inventory.update', {
        method: 'POST',
        body: {
          productId: product.id,
          slug: product.slug,
          variants: updatedVariants.map(v => ({
            id: v.id,
            productVariantId: v.productVariantId || v.id,
            color: v.color,
            size: v.size,
            stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
            reservedStock: Math.max(0, Math.floor(Number(v.reservedStock) || 0)),
          })),
          forceInStock: newInStock,
        },
      });

      const finalInStock = typeof res?.inStock === 'boolean' ? res.inStock : newInStock;
      const finalStatus = res?.status || product.status;

      setProducts(prev =>
        prev.map(p =>
          p.slug === product.slug
            ? {
                ...p,
                variants: updatedVariants,
                inStock: finalInStock,
                ...(finalStatus ? { status: finalStatus, isListed: finalStatus === 'listed' } : {}),
              }
            : p
        )
      );

      // Invalidate both inventory and products cache in TanStack Query
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.transactions });
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'paginatedTransactions'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      showAlert('Inventory Updated', `Stock updated for ${product.name}.`, 'success');
    } catch (err: unknown) {
      console.error('[handleUpdateInventory Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to update inventory';
      showAlert('Error', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert, setProducts]);

  const handleRecordTransaction = useCallback(async (data: {
    productId: string;
    productVariantId?: string | null;
    type: 'sale' | 'purchase';
    quantity: number;
    name: string;
    phoneNumber?: string;
    email?: string;
    notes?: string;
    unitPrice?: number;
    totalAmount?: number;
  }) => {
    try {
      const res = await trpcRequest<RecordTransactionResponse>('inventory.recordTransaction', {
        method: 'POST',
        body: data,
      });

      showAlert(
        data.type === 'sale' ? 'Sale Recorded' : 'Purchase Recorded',
        `${data.type === 'sale' ? 'Sold' : 'Purchased'} ${data.quantity} unit${data.quantity > 1 ? 's' : ''} of ${res?.productName || 'product'} for ${data.name}. Stock updated!`,
        'success'
      );

      // Invalidate inventory transactions and products caches
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.transactions });
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'paginatedTransactions'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: unknown) {
      console.error('[handleRecordTransaction Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to record inventory transaction';
      showAlert('Transaction Error', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert]);

  const handleFetchPaginatedStock = useCallback(async (params?: {
    search?: string;
    category?: string;
    stockFilter?: 'all' | 'inStock' | 'outOfStock' | 'lowStock' | 'reserved';
    sortBy?: 'default' | 'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc';
    page?: number;
    limit?: number;
  }) => {
    try {
      return await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.inventory.paginatedStock(params),
        queryFn: () => trpcRequest<PaginatedStockResponse>('inventory.getPaginated', { input: params }),
        staleTime: 30 * 1000,
      });
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedStock Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  return {
    transactions,
    setTransactions,
    transactionsPagination,
    setTransactionsPagination,
    transactionStats,
    isLoadingTransactions,
    setIsLoadingTransactions,
    isTransactionsError: !!transactionsError,
    transactionsError,
    hasFetchedTransactions: transactions.length > 0 || transactionsPagination.total > 0,
    handleFetchTransactions,
    handleFetchPaginatedTransactions,
    handleUpdateInventory,
    handleRecordTransaction,
    handleFetchPaginatedStock,
  };
}
