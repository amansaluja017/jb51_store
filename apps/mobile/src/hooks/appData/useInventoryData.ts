import { useState, useRef, useCallback } from 'react';
import { Product, Variant, InventoryTransaction, PaginatedStockResponse } from '../../types';

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
  handleFetchProducts: (isRefresh?: boolean) => Promise<void>;
}

export function useInventoryData({
  trpcRequest,
  showAlert,
  setProducts,
  handleFetchProducts,
}: UseInventoryDataProps) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const hasFetchedTransactions = useRef(false);

  const handleFetchTransactions = useCallback(async (force = false) => {
    if (hasFetchedTransactions.current && !force) return;
    try {
      setIsLoadingTransactions(true);
      const res = await trpcRequest<InventoryTransaction[]>('inventory.getTransactions');
      if (Array.isArray(res)) {
        setTransactions(res);
      }
      hasFetchedTransactions.current = true;
    } catch (err: unknown) {
      console.error('[handleFetchTransactions Error]:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [trpcRequest]);

  const handleUpdateInventory = async (product: Product, updatedVariants: Variant[], forceInStock?: boolean) => {
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
      showAlert('Inventory Updated', `Stock updated for ${product.name}.`, 'success');
    } catch (err: unknown) {
      console.error('[handleUpdateInventory Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to update inventory';
      showAlert('Error', message, 'error');
      throw err;
    }
  };

  const handleRecordTransaction = async (data: {
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

      await handleFetchProducts(true);
      await handleFetchTransactions(true);
    } catch (err: unknown) {
      console.error('[handleRecordTransaction Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to record inventory transaction';
      showAlert('Transaction Error', message, 'error');
      throw err;
    }
  };

  const handleFetchPaginatedStock = useCallback(async (params?: {
    search?: string;
    category?: string;
    stockFilter?: 'all' | 'inStock' | 'outOfStock' | 'lowStock' | 'reserved';
    sortBy?: 'default' | 'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc';
    page?: number;
    limit?: number;
  }) => {
    try {
      return await trpcRequest<PaginatedStockResponse>('inventory.getPaginated', {
        input: params,
      });
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedStock Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  return {
    transactions,
    setTransactions,
    isLoadingTransactions,
    setIsLoadingTransactions,
    hasFetchedTransactions,
    handleFetchTransactions,
    handleUpdateInventory,
    handleRecordTransaction,
    handleFetchPaginatedStock,
  };
}

