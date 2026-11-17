import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product, isProductInStock, PaginatedProductsResponse } from '../../types';
import { TabType } from '../../components/NavigationTabBar';
import { getChangedProductFields } from '../../utils/productDiff';
import { queryClient, QUERY_KEYS } from '../../lib/queryClient';

interface UseProductsDataProps {
  trpcRequest: <T = unknown>(path: string, options?: { method?: 'GET' | 'POST'; body?: unknown; input?: unknown }) => Promise<T>;
  showAlert: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
  setSyncMessage: (msg: string) => void;
  isAuthenticated?: boolean;
  activeTab?: TabType;
}

export function useProductsData({ trpcRequest, showAlert, setSyncMessage: _setSyncMessage, isAuthenticated, activeTab }: UseProductsDataProps) {
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Lazy query: Only query categories when Catalog page is active or related modals are open
  const isCatalogNeeded = activeTab === 'catalogue' || formModalOpen || categoryModalOpen;

  // TanStack Query for Product Categories (lightweight, returns string[] category names)
  const {
    data: fetchedCategories,
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: QUERY_KEYS.products.categories,
    queryFn: async () => {
      const cats = await trpcRequest<string[]>('products.getCategories');
      return Array.isArray(cats) && cats.length > 0 ? cats : [];
    },
    enabled: Boolean(isAuthenticated) && isCatalogNeeded,
    staleTime: 5 * 60 * 1000,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (fetchedCategories && fetchedCategories.length > 0) {
      setCategories(prev => Array.from(new Set([...prev, ...fetchedCategories])));
    }
  }, [fetchedCategories]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const activeDetailsProduct = useMemo(() => {
    if (!selectedProductDetails) return null;
    return products.find(p => p.slug === selectedProductDetails.slug) || selectedProductDetails;
  }, [products, selectedProductDetails]);

  const handleFetchCategories = useCallback(async (_force = false) => {
    await refetchCategories();
  }, [refetchCategories]);

  const handleFetchPaginatedProducts = useCallback(async (params?: {
    search?: string;
    category?: string;
    inStockOnly?: boolean;
    includeUnlisted?: boolean;
    includeDiscontinued?: boolean;
    statusFilter?: 'all' | 'listed' | 'unListed' | 'discontinued';
    sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc' | 'default';
    page?: number;
    limit?: number;
  }) => {
    try {
      return await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.products.paginated(params),
        queryFn: async () => {
          const res = await trpcRequest<PaginatedProductsResponse>('products.getPaginated', {
            input: {
              ...params,
              includeUnlisted: params?.includeUnlisted ?? true,
            },
          });
          if (res?.items && Array.isArray(res.items)) {
            if ((!params?.page || params.page === 1) && !params?.search && !params?.category && !params?.statusFilter) {
              setProducts(res.items);
            }
          }
          return res;
        },
        staleTime: 30 * 1000,
      });
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedProducts Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  const handleFetchProducts = useCallback(async (_isRefresh = false) => {
    await handleFetchPaginatedProducts({ page: 1, limit: 8 });
  }, [handleFetchPaginatedProducts]);

  const handleToggleStock = useCallback(async (product: Product) => {
    const isCurrentlyInStock = isProductInStock(product);
    const newInStock = !isCurrentlyInStock;

    // 1. Optimistic local update
    setProducts(prev =>
      prev.map(p => p.slug === product.slug ? { ...p, inStock: newInStock } : p)
    );

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

      // 2. Reflect actual server response
      setProducts(prev =>
        prev.map(p => p.slug === product.slug ? { ...p, inStock: finalInStock } : p)
      );

      // Invalidate products query cache in TanStack Query
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      showAlert('Stock Status Updated', `${product.name} is now ${finalInStock ? 'In Stock' : 'Out of Stock'}.`, 'success');
      return res;
    } catch (err: unknown) {
      // Rollback to original state without refetching
      setProducts(prev =>
        prev.map(p => p.slug === product.slug ? { ...p, inStock: isCurrentlyInStock } : p)
      );
      const message = err instanceof Error ? err.message : 'Failed to update stock status';
      showAlert('Error', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert]);

  const handleUpdateVisibility = useCallback(async (product: Product, status: 'listed' | 'unListed' | 'discontinued') => {
    // 1. Optimistic UI update
    setProducts(prev =>
      prev.map(p =>
        p.slug === product.slug
          ? {
              ...p,
              status,
              isListed: status === 'listed',
              isDiscontinued: status === 'discontinued',
            }
          : p
      )
    );

    try {
      const res = await trpcRequest<{
        productId: string;
        status: 'listed' | 'unListed' | 'discontinued';
        inStock?: boolean;
        updatedAt?: string;
      }>('products.updateStatus', {
        method: 'POST',
        body: { slug: product.slug, status },
      });

      // 2. Reflect actual state returned by server
      const serverStatus = res?.status || status;
      setProducts(prev =>
        prev.map(p =>
          p.slug === product.slug
            ? {
                ...p,
                status: serverStatus,
                isListed: serverStatus === 'listed',
                isDiscontinued: serverStatus === 'discontinued',
                ...(typeof res?.inStock === 'boolean' ? { inStock: res.inStock } : {}),
              }
            : p
        )
      );

      // Invalidate products cache
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      const label = serverStatus === 'listed' ? 'Listed' : serverStatus === 'unListed' ? 'Unlisted' : 'Discontinued';
      showAlert('Status Updated', `${product.name} is now ${label}.`, 'success');
      return res;
    } catch (err: unknown) {
      // Rollback to original state without refetching
      setProducts(prev =>
        prev.map(p =>
          p.slug === product.slug
            ? {
                ...p,
                status: product.status,
                isListed: product.isListed,
                isDiscontinued: product.isDiscontinued,
              }
            : p
        )
      );
      const message = err instanceof Error ? err.message : 'Failed to update visibility status';
      showAlert('Error', message, 'error');
      throw err;
    }
  }, [trpcRequest, showAlert]);

  const handleDeleteProduct = useCallback((slug: string, name: string) => {
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
          await queryClient.invalidateQueries({ queryKey: ['products'] });
          showAlert('Product Deleted', `"${name}" removed.`, 'success');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to delete product';
          showAlert('Error', message, 'error');
        }
      }
    );
  }, [trpcRequest, showAlert]);

  const handleReorderProductImages = useCallback(async (newImages: string[]): Promise<string[]> => {
    if (!editingSlug) return newImages;
    try {
      const res = await trpcRequest<{ images: string[]; success: boolean }>('products.reorderImages', {
        method: 'POST',
        body: { slug: editingSlug, images: newImages },
      });
      const confirmedImages = Array.isArray(res?.images) && res.images.length > 0 ? res.images : newImages;
      setProducts(prev => prev.map(p => {
        if (p.slug !== editingSlug) return p;
        const updatedVariants = (p.variants || []).map(v => ({
          ...v,
          images: v.images && v.images.length > 0
            ? [...v.images].sort((a, b) => {
                const idxA = confirmedImages.indexOf(a);
                const idxB = confirmedImages.indexOf(b);
                if (idxA === -1 && idxB === -1) return 0;
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
              })
            : v.images,
        }));
        return { ...p, images: confirmedImages, variants: updatedVariants.length > 0 ? updatedVariants : p.variants };
      }));
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      return confirmedImages;
    } catch (err: unknown) {
      console.error('[handleReorderProductImages failed]:', err);
      const message = err instanceof Error ? err.message : 'Could not update image order.';
      showAlert('Reorder Failed', message, 'error');
      return newImages;
    }
  }, [editingSlug, trpcRequest, showAlert]);

  const handleSaveProduct = useCallback(async (payload: Product, changedData?: Partial<Product>) => {
    if (isEditing && editingSlug) {
      try {
        let updateData: Partial<Product>;
        if (changedData && Object.keys(changedData).length > 0) {
          updateData = changedData;
        } else {
          const currentProd = products.find(p => p.slug === editingSlug);
          if (currentProd) {
            updateData = getChangedProductFields(currentProd, payload);
          } else {
            updateData = payload;
          }
        }

        if (Object.keys(updateData).length === 0) {
          showAlert('No Changes', 'No modifications were detected.', 'success');
          setFormModalOpen(false);
          return;
        }

        const updated = await trpcRequest<Product>('products.update', {
          method: 'POST',
          body: { slug: editingSlug, data: updateData },
        });
        const finalProd = updated && updated.slug ? updated : { ...payload, ...updateData };
        setProducts(prev => prev.map(p => p.slug === editingSlug ? finalProd : p));
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        showAlert('Outfit Saved', 'Persistence complete.', 'success');
      } catch (err: unknown) {
        console.error('[handleSaveProduct Error]:', err);
        const message = err instanceof Error ? err.message : 'Failed to update outfit on server.';
        showAlert('Save Failed', message, 'error');
        return;
      }
    } else {
      let isDuplicate = false;
      setProducts(prev => {
        if (prev.some(p => p.slug === payload.slug)) {
          isDuplicate = true;
        }
        return prev;
      });
      if (isDuplicate) {
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
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        showAlert('Outfit Created', 'New item added to catalogue.', 'success');
      } catch (err: unknown) {
        console.error('[handleSaveProduct Error]:', err);
        const message = err instanceof Error ? err.message : 'Failed to create outfit on server.';
        showAlert('Creation Failed', message, 'error');
        return;
      }
    }

    setFormModalOpen(false);
  }, [isEditing, editingSlug, products, trpcRequest, showAlert]);

  const handleAddCategory = useCallback(async (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    setCategories(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    try {
      await trpcRequest('products.createCategory', {
        method: 'POST',
        body: { name: trimmed },
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.categories });
    } catch (err: unknown) {
      console.error('[handleAddCategory Error]:', err);
    }
  }, [trpcRequest]);

  const handleDeleteCategory = useCallback(async (catToDelete: string, targetCategory?: string) => {
    const target = (targetCategory || 'Uncategorized').trim();
    if (!target || target === catToDelete) {
      showAlert('Error', 'Target category for reassignment is required.', 'error');
      return;
    }
    setCategories(prev => {
      const filtered = prev.filter(c => c !== catToDelete);
      if (target === 'Uncategorized' && !filtered.includes('Uncategorized')) {
        return [...filtered, 'Uncategorized'];
      }
      return filtered;
    });

    setProducts(prev =>
      prev.map(p =>
        p.category === catToDelete ? { ...p, category: target } : p
      )
    );

    try {
      await trpcRequest('products.deleteCategory', {
        method: 'POST',
        body: { name: catToDelete, targetCategory: target },
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.categories });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      showAlert('Category Deleted', `Products reassigned to ${target}.`, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reassign product categories';
      showAlert('Error', message, 'error');
    }
  }, [trpcRequest, showAlert]);

  const triggerAddProduct = useCallback(() => {
    setIsEditing(false);
    setEditingSlug(null);
    setEditingProduct(null);
    setFormModalOpen(true);
  }, []);

  const triggerEditProduct = useCallback((product: Product) => {
    setIsEditing(true);
    setEditingSlug(product.slug);
    setEditingProduct(product);
    setFormModalOpen(true);
  }, []);

  return {
    products,
    setProducts,
    categories,
    setCategories,
    isLoading: isLoadingCategories || isFetchingCategories || refreshing,
    setIsLoading: () => {},
    isProductsError: false,
    productsError: null,
    refreshing,
    setRefreshing,
    hasFetchedProducts: products.length > 0,
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
    editingProduct,
    setEditingProduct,
    handleFetchProducts,
    handleToggleStock,
    handleUpdateVisibility,
    handleSaveProduct,
    handleDeleteProduct,
    handleReorderProductImages,
    handleFetchCategories,
    handleAddCategory,
    handleDeleteCategory,
    handleFetchPaginatedProducts,
    triggerAddProduct,
    triggerEditProduct,
  };
}
