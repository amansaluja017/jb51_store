import { Product } from '../types';
import { trpcRequest } from './api';

export interface PaginatedProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchProductsBatchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  filter?: 'new' | 'bestseller' | 'all';
  inStockOnly?: boolean;
  sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc' | 'newest' | 'default';
}

/**
 * Service to fetch products in batches (10-15 per batch) instead of loading all products at once
 */
export async function fetchProductsBatch(
  params: FetchProductsBatchParams = {},
  options: { token?: string | null; apiHost: string }
): Promise<PaginatedProductsResponse> {
  const input = {
    page: params.page || 1,
    limit: params.limit || 12,
    search: params.search || undefined,
    category: params.category || undefined,
    filter: params.filter || undefined,
    inStockOnly: params.inStockOnly || undefined,
    sortBy: params.sortBy || 'name-asc',
  };

  const response = await trpcRequest('products.getPaginated', {
    method: 'GET',
    input,
    token: options.token,
    apiHost: options.apiHost,
  });

  return response as PaginatedProductsResponse;
}

/**
 * Service to fetch categories directly from the API endpoint
 */
export async function fetchCategories(
  options: { token?: string | null; apiHost: string }
): Promise<string[]> {
  const response = await trpcRequest('products.getCategories', {
    method: 'GET',
    token: options.token,
    apiHost: options.apiHost,
  });

  return (response as string[]) || [];
}

/**
 * Service to update product status (listed, unlisted, inStock)
 */
export async function updateProductStatus(
  slug: string,
  updates: { status?: 'listed' | 'unListed' | 'discontinued'; inStock?: boolean },
  options: { token?: string | null; apiHost: string }
) {
  return await trpcRequest('products.updateStatus', {
    method: 'POST',
    body: { slug, ...updates },
    token: options.token,
    apiHost: options.apiHost,
  });
}

/**
 * Service to delete a product by slug
 */
export async function deleteProductBySlug(
  slug: string,
  options: { token?: string | null; apiHost: string }
) {
  return await trpcRequest('products.delete', {
    method: 'POST',
    body: { slug },
    token: options.token,
    apiHost: options.apiHost,
  });
}
