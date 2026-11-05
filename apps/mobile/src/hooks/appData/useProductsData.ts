import { useState, useRef, useMemo, useCallback } from 'react';
import { Product, isProductInStock, PaginatedProductsResponse } from '../../types';

interface UseProductsDataProps {
  trpcRequest: <T = unknown>(path: string, options?: { method?: 'GET' | 'POST'; body?: unknown; input?: unknown }) => Promise<T>;
  showAlert: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
  setSyncMessage: (msg: string) => void;
}

export function useProductsData({ trpcRequest, showAlert, setSyncMessage }: UseProductsDataProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const hasFetchedProducts = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const activeDetailsProduct = useMemo(() => {
    if (!selectedProductDetails) return null;
    return products.find(p => p.slug === selectedProductDetails.slug) || selectedProductDetails;
  }, [products, selectedProductDetails]);

  const handleFetchProducts = async (isRefresh = false) => {
    if (!isRefresh) {
      setIsLoading(true);
    }
    try {
      const decodedProducts = await trpcRequest<Product[]>('products.getAll');

      if (Array.isArray(decodedProducts)) {
        setProducts(decodedProducts);

        const productCategories = Array.from(
          new Set(
            decodedProducts
              .map(p => p.category?.trim())
              .filter(Boolean)
          )
        ) as string[];

        if (productCategories.length > 0) {
          setCategories(prev => Array.from(new Set([...prev, ...productCategories])));
        }
      }
      hasFetchedProducts.current = true;
      setSyncMessage('Products synced with server');
    } catch (err: unknown) {
      console.error('[handleFetchProducts Error]:', err);
      setSyncMessage('Server offline - Sandbox active');
    } finally {
      if (!isRefresh) {
        setIsLoading(false);
      }
    }
  };

  const handleToggleStock = async (product: Product) => {
    const isCurrentlyInStock = isProductInStock(product);
    const newInStock = !isCurrentlyInStock;

    try {
      const res = await trpcRequest<{ inStock?: boolean }>('inventory.update', {
        method: 'POST',
        body: {
          slug: product.slug,
          productId: product.id,
          forceInStock: newInStock,
        },
      });

      const finalInStock = typeof res?.inStock === 'boolean' ? res.inStock : newInStock;

      setProducts(prev =>
        prev.map(p => p.slug === product.slug ? { ...p, inStock: finalInStock } : p)
      );
      showAlert('Stock Status Updated', `${product.name} is now ${finalInStock ? 'In Stock' : 'Out of Stock'}.`, 'success');
    } catch (err: unknown) {
      await handleFetchProducts(true);
      const message = err instanceof Error ? err.message : 'Failed to update stock status';
      showAlert('Error', message, 'error');
    }
  };

  const handleUpdateVisibility = async (product: Product, status: 'listed' | 'unListed') => {
    try {
      await trpcRequest('products.updateStatus', {
        method: 'POST',
        body: { slug: product.slug, status },
      });
      setProducts(prev =>
        prev.map(p =>
          p.slug === product.slug
            ? { ...p, status, isListed: status === 'listed' }
            : p
        )
      );
      showAlert('Status Updated', `${product.name} is now ${status === 'listed' ? 'Listed' : 'Unlisted'}.`, 'success');
    } catch (err: unknown) {
      await handleFetchProducts(true);
      const message = err instanceof Error ? err.message : 'Failed to update status';
      showAlert('Error', message, 'error');
    }
  };

  const handleDeleteProduct = (slug: string, name: string) => {
    showAlert(
      'Delete Outfit',
      `Are you sure you want to delete "${name}"?`,
      'confirm',
      async () => {
        try {
          await trpcRequest('products.delete', {
            method: 'POST',
            body: { slug },
          });
          setProducts(prev => prev.filter(p => p.slug !== slug));
          showAlert('Success', 'Outfit deleted.', 'success');
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Failed to delete outfit';
          showAlert('Error', message, 'error');
        }
      }
    );
  };

  const handleReorderProductImages = async (newImages: string[]): Promise<string[]> => {
    if (!editingSlug) return newImages;
    try {
      const res = await trpcRequest<{ images?: string[] }>('products.reorderImages', {
        method: 'POST',
        body: { slug: editingSlug, images: newImages },
      });
      const confirmedImages = Array.isArray(res?.images) && res.images.length > 0 ? res.images : newImages;
      setProducts(prev => prev.map(p => {
        if (p.slug !== editingSlug) return p;
        const updatedVariants = (p.variants || []).map(v => ({
          ...v,
          images: confirmedImages,
        }));
        return { ...p, images: confirmedImages, variants: updatedVariants.length > 0 ? updatedVariants : p.variants };
      }));
      return confirmedImages;
    } catch (err: unknown) {
      console.error('[handleReorderProductImages failed]:', err);
      const message = err instanceof Error ? err.message : 'Could not update image order.';
      showAlert('Reorder Failed', message, 'error');
      return newImages;
    }
  };

  const handleSaveProduct = async (payload: Product) => {
    if (isEditing && editingSlug) {
      try {
        const updated = await trpcRequest<Product>('products.update', {
          method: 'POST',
          body: { slug: editingSlug, data: payload },
        });
        const finalProd = updated && updated.slug ? updated : payload;
        setProducts(prev => prev.map(p => p.slug === editingSlug ? finalProd : p));
        showAlert('Outfit Saved', 'Persistence complete.', 'success');
      } catch (err: unknown) {
        console.error('[handleSaveProduct Error]:', err);
        const message = err instanceof Error ? err.message : 'Failed to update outfit on server.';
        showAlert('Save Failed', message, 'error');
        return;
      }
    } else {
      if (products.some(p => p.slug === payload.slug)) {
        showAlert('Unique Slug Required', 'An outfit with this slug already exists.', 'error');
        return;
      }
      try {
        const created = await trpcRequest<Product>('products.create', {
          method: 'POST',
          body: payload,
        });
        const finalProd = created && created.slug ? created : payload;

        setProducts(prev => [finalProd, ...prev.filter(p => p.slug !== finalProd.slug)]);
        showAlert('Outfit Created', 'New item added to catalogue.', 'success');
      } catch (err: unknown) {
        console.error('[handleSaveProduct Error]:', err);
        const message = err instanceof Error ? err.message : 'Failed to create outfit on server.';
        showAlert('Creation Failed', message, 'error');
        return;
      }
    }

    setFormModalOpen(false);
  };

  const handleAddCategory = (newCat: string) => {
    if (!categories.includes(newCat)) {
      setCategories(prev => [...prev, newCat]);
    }
  };

  const handleDeleteCategory = async (catToDelete: string, targetCategory?: string) => {
    const target = targetCategory || 'Uncategorized';
    if (!target || target === catToDelete) {
      showAlert('Error', 'Target category for reassignment is required.', 'error');
      return;
    }
    try {
      const affectedProducts = products.filter(p => p.category === catToDelete);
      for (const p of affectedProducts) {
        await trpcRequest('products.update', {
          method: 'POST',
          body: {
            slug: p.slug,
            data: { category: target },
          },
        });
      }

      setProducts(prev => prev.map(p => p.category === catToDelete ? { ...p, category: target } : p));
      setCategories(prev => {
        const filtered = prev.filter(c => c !== catToDelete);
        if (target === 'Uncategorized' && !filtered.includes('Uncategorized')) {
          return [...filtered, 'Uncategorized'];
        }
        return filtered;
      });
      showAlert('Category Deleted', `Products reassigned to ${target}.`, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reassign product categories';
      showAlert('Error', message, 'error');
    }
  };

  const handleFetchPaginatedProducts = useCallback(async (params?: {
    search?: string;
    category?: string;
    inStockOnly?: boolean;
    sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc' | 'default';
    page?: number;
    limit?: number;
  }) => {
    try {
      return await trpcRequest<PaginatedProductsResponse>('products.getPaginated', {
        input: params,
      });
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedProducts Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  const triggerAddProduct = () => {
    setIsEditing(false);
    setEditingSlug(null);
    setFormModalOpen(true);
  };

  const triggerEditProduct = (product: Product) => {
    setIsEditing(true);
    setEditingSlug(product.slug);
    setFormModalOpen(true);
  };

  return {
    products,
    setProducts,
    categories,
    setCategories,
    isLoading,
    setIsLoading,
    refreshing,
    setRefreshing,
    hasFetchedProducts,
    searchQuery,
    setSearchQuery,
    formModalOpen,
    setFormModalOpen,
    selectedProductDetails,
    setSelectedProductDetails,
    activeDetailsProduct,
    categoryModalOpen,
    setCategoryModalOpen,
    isEditing,
    setIsEditing,
    editingSlug,
    setEditingSlug,
    handleFetchProducts,
    handleToggleStock,
    handleUpdateVisibility,
    handleSaveProduct,
    handleDeleteProduct,
    handleReorderProductImages,
    handleAddCategory,
    handleDeleteCategory,
    handleFetchPaginatedProducts,
    triggerAddProduct,
    triggerEditProduct,
  };
}

