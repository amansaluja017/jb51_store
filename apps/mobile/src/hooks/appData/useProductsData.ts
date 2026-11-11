import { useState, useRef, useMemo, useCallback } from 'react';
import { Product, isProductInStock, PaginatedProductsResponse } from '../../types';
import { getChangedProductFields } from '../../utils/productDiff';

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
  const isFetchingProductsRef = useRef(false);

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

  const hasFetchedCategories = useRef(false);
  const isFetchingCategoriesRef = useRef(false);

  const handleFetchCategories = useCallback(async (force = false) => {
    if (isFetchingCategoriesRef.current) return;
    if (hasFetchedCategories.current && !force) return;
    isFetchingCategoriesRef.current = true;
    try {
      const cats = await trpcRequest<string[]>('products.getCategories');
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
        hasFetchedCategories.current = true;
      }
    } catch (err: unknown) {
      console.error('[handleFetchCategories Error]:', err);
    } finally {
      isFetchingCategoriesRef.current = false;
    }
  }, [trpcRequest]);

  const handleFetchProducts = useCallback(async (isRefresh = false) => {
    if (isFetchingProductsRef.current) return;
    isFetchingProductsRef.current = true;
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
      isFetchingProductsRef.current = false;
      if (!isRefresh) {
        setIsLoading(false);
      }
    }
  }, [trpcRequest, setSyncMessage]);

  const handleToggleStock = useCallback(async (product: Product) => {
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
  }, [trpcRequest, showAlert, handleFetchProducts]);

  const handleUpdateVisibility = useCallback(async (product: Product, status: 'listed' | 'unListed' | 'discontinued') => {
    try {
      await trpcRequest('products.updateStatus', {
        method: 'POST',
        body: { slug: product.slug, status },
      });
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
      const label = status === 'listed' ? 'Listed' : status === 'unListed' ? 'Unlisted' : 'Discontinued';
      showAlert('Status Updated', `${product.name} is now ${label}.`, 'success');
    } catch (err: unknown) {
      await handleFetchProducts(true);
      const message = err instanceof Error ? err.message : 'Failed to update status';
      showAlert('Error', message, 'error');
    }
  }, [trpcRequest, showAlert, handleFetchProducts]);

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
          showAlert('Success', 'Outfit deleted.', 'success');
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Failed to delete outfit';
          showAlert('Error', message, 'error');
        }
      }
    );
  }, [trpcRequest, showAlert]);

  const handleReorderProductImages = useCallback(async (newImages: string[]): Promise<string[]> => {
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
      prev.map(p => (p.category === catToDelete ? { ...p, category: target } : p))
    );

    try {
      await trpcRequest('products.deleteCategory', {
        method: 'POST',
        body: { name: catToDelete, targetCategory: target },
      });

      showAlert('Category Deleted', `Products reassigned to ${target}.`, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reassign product categories';
      showAlert('Error', message, 'error');
    }
  }, [trpcRequest, showAlert]);

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
      const res = await trpcRequest<PaginatedProductsResponse>('products.getPaginated', {
        input: {
          ...params,
          // Mobile product catalog is the admin management interface: always show unlisted products by default
          includeUnlisted: params?.includeUnlisted ?? true,
        },
      });
      if (res?.items && Array.isArray(res.items)) {
        if ((!params?.page || params.page === 1) && !params?.search && !params?.category && !params?.statusFilter) {
          setProducts(res.items);
          hasFetchedProducts.current = true;
        }
      }
      return res;
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedProducts Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  const triggerAddProduct = useCallback(() => {
    setIsEditing(false);
    setEditingSlug(null);
    setFormModalOpen(true);
  }, []);

  const triggerEditProduct = useCallback((product: Product) => {
    setIsEditing(true);
    setEditingSlug(product.slug);
    setFormModalOpen(true);
  }, []);

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
    handleFetchCategories,
    handleAddCategory,
    handleDeleteCategory,
    handleFetchPaginatedProducts,
    triggerAddProduct,
    triggerEditProduct,
  };
}

