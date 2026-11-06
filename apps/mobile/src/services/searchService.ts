import { trpcRequest } from './api';
import { Product, Customer, Invoice, Order, Credit, Review, Inquiry, InventoryMetrics, CreditMetrics } from '../types';

export type CreditSearchResult = Credit[] & { metrics?: CreditMetrics; total?: number };
export type ReviewSearchResult = Review[] & { total?: number };

export interface ServiceOptions {
  token?: string | null;
  apiHost: string;
}

export interface SearchProductsParams {
  query?: string;
  category?: string;
  inStockOnly?: boolean;
  sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc' | 'newest' | 'default';
  limit?: number;
}

export interface ProductSuggestionsResponse {
  query: string;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    price: number;
    sellingPrice: number;
    discountPrice?: number;
    image?: string;
    fabric?: string;
    matchedField?: string;
  }>;
  categories: string[];
  tags: string[];
}

export interface SearchInventoryParams {
  query?: string;
  category?: string;
  stockFilter?: 'all' | 'inStock' | 'outOfStock' | 'lowStock' | 'reserved';
  sortBy?: 'default' | 'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc' | 'stockAsc' | 'stockDesc';
  limit?: number;
}

const activeAbortControllers = new Map<string, AbortController>();

export function getAbortSignal(scope: string): AbortSignal {
  const existing = activeAbortControllers.get(scope);
  if (existing) {
    try {
      existing.abort();
    } catch {
      // ignore
    }
  }
  const controller = new AbortController();
  activeAbortControllers.set(scope, controller);
  return controller.signal;
}

export function isAbortError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === 'object') {
    const errorObj = err as Record<string, unknown>;
    if (errorObj.name === 'CanceledError' || errorObj.name === 'AbortError') return true;
    if (errorObj.code === 'ERR_CANCELED') return true;
    if (typeof errorObj.message === 'string' && errorObj.message.toLowerCase().includes('canceled')) return true;
  }
  return false;
}

// 1. Products Search (ILIKE) & Suggestions (pg_trgm)
export async function searchProducts(
  params: SearchProductsParams,
  options: ServiceOptions
): Promise<{ items: Product[]; total: number; query: string }> {
  return (await trpcRequest('products.search', {
    method: 'GET',
    input: params,
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('products.search'),
  })) as { items: Product[]; total: number; query: string };
}

export async function getProductSuggestions(
  query: string,
  options: ServiceOptions
): Promise<ProductSuggestionsResponse> {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return { query: '', products: [], categories: [], tags: [] };
  }
  return (await trpcRequest('products.suggestions', {
    method: 'GET',
    input: { query: trimmed },
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('products.suggestions'),
  })) as ProductSuggestionsResponse;
}

// 2. Inventory Search (ILIKE) & Suggestions (pg_trgm)
export async function searchInventory(
  params: SearchInventoryParams,
  options: ServiceOptions
): Promise<{ items: Product[]; total: number; metrics?: InventoryMetrics; query: string }> {
  return await trpcRequest<{ items: Product[]; total: number; metrics?: InventoryMetrics; query: string }>(
    'inventory.search',
    {
      method: 'GET',
      input: params,
      token: options.token,
      apiHost: options.apiHost,
      signal: getAbortSignal('inventory.search'),
    }
  );
}

export async function getInventorySuggestions(
  query: string,
  options: ServiceOptions
): Promise<Array<{ id: string; name: string; category: string; availableStock: number; color?: string | null }>> {
  const trimmed = (query || '').trim();
  if (!trimmed) return [];
  return (await trpcRequest('inventory.suggestions', {
    method: 'GET',
    input: { query: trimmed },
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('inventory.suggestions'),
  })) as Array<{ id: string; name: string; category: string; availableStock: number; color?: string | null }>;
}

// 3. Customers Search (ILIKE) & Suggestions (pg_trgm)
export async function searchCustomers(
  query: string,
  options: ServiceOptions
): Promise<Customer[]> {
  const res = await trpcRequest<Customer[] | { items: Customer[] }>('customers.search', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('customers.search'),
  });
  return Array.isArray(res) ? res : res?.items ?? [];
}

export async function getCustomerSuggestions(
  query: string,
  options: ServiceOptions
): Promise<Array<{ id: string; name: string; phoneNumber: string; email?: string | null; address?: string | null }>> {
  const trimmed = (query || '').trim();
  if (!trimmed) return [];
  const res = await trpcRequest<
    Array<{ id: string; name: string; phoneNumber: string; email?: string | null; address?: string | null }> |
    { suggestions: Array<{ id: string; name: string; phoneNumber: string; email?: string | null; address?: string | null }> }
  >('customers.suggestions', {
    method: 'GET',
    input: { query: trimmed },
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('customers.suggestions'),
  });
  return Array.isArray(res) ? res : res?.suggestions ?? [];
}

// 4. Orders Search (Exact order # / phone / ID, Customer Name ILIKE) & Suggestions
export async function searchOrders(
  query: string,
  options: ServiceOptions
): Promise<Order[]> {
  const res = await trpcRequest<Order[] | { items: Order[] }>('orders.search', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('orders.search'),
  });
  return Array.isArray(res) ? res : res?.items ?? [];
}

// 5. Invoices Search (Exact invoice # / phone / ID, Customer Name ILIKE) & Suggestions
export async function searchInvoices(
  query: string,
  options: ServiceOptions
): Promise<Invoice[]> {
  const res = await trpcRequest<Invoice[] | { items: Invoice[] }>('invoices.search', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('invoices.search'),
  });
  return Array.isArray(res) ? res : res?.items ?? [];
}

// 6. Credits Search & Suggestions
export async function searchCredits(
  query: string,
  options: ServiceOptions
): Promise<CreditSearchResult> {
  const res = await trpcRequest<Credit[] | { items: Credit[]; metrics?: CreditMetrics; total?: number }>('credits.search', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('credits.search'),
  });
  const items = (Array.isArray(res) ? [...res] : [...(res?.items ?? [])]) as CreditSearchResult;
  if (res && !Array.isArray(res)) {
    items.metrics = res.metrics;
    items.total = res.total;
  }
  return items;
}

// 7. Reviews Search (ILIKE) & Suggestions (pg_trgm)
export async function searchReviews(
  query: string,
  options: ServiceOptions
): Promise<ReviewSearchResult> {
  const res = await trpcRequest<Review[] | { items: Review[]; total?: number }>('reviews.search', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('reviews.search'),
  });
  const items = (Array.isArray(res) ? [...res] : [...(res?.items ?? [])]) as ReviewSearchResult;
  if (res && !Array.isArray(res) && res.total !== undefined) {
    items.total = res.total;
  }
  return items;
}

interface RawReviewSuggestion {
  id: string;
  name?: string;
  customerName?: string;
  messageSnippet?: string;
  review?: string;
  rating?: number;
  location?: string | null;
}

export async function getReviewSuggestions(
  query: string,
  options: ServiceOptions
): Promise<Array<{ id: string; name: string; messageSnippet: string; customerName: string; review: string; rating?: number; location?: string | null }>> {
  const trimmed = (query || '').trim();
  if (!trimmed) return [];
  const res = await trpcRequest<RawReviewSuggestion[] | { suggestions: RawReviewSuggestion[] }>('reviews.suggestions', {
    method: 'GET',
    input: { query: trimmed },
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('reviews.suggestions'),
  });
  const rawList = Array.isArray(res) ? res : (res?.suggestions ?? []);
  return rawList.map((s) => ({
    id: s.id,
    name: s.name || s.customerName || 'Anonymous',
    messageSnippet: s.messageSnippet || s.review || '',
    customerName: s.name || s.customerName || 'Anonymous',
    review: s.messageSnippet || s.review || '',
    rating: s.rating,
    location: s.location || null,
  }));
}

// 8. Inquiries Search (ILIKE) & Suggestions (pg_trgm)
export async function searchInquiries(
  query: string,
  options: ServiceOptions
): Promise<Inquiry[]> {
  return (await trpcRequest('inquiries.search', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('inquiries.search'),
  })) as Inquiry[];
}

export async function getInquirySuggestions(
  query: string,
  options: ServiceOptions
): Promise<Array<{ id: string; customerName: string; phoneNumber?: string | null; message: string; inqueryType?: string; productName?: string }>> {
  const trimmed = (query || '').trim();
  if (!trimmed) return [];
  return (await trpcRequest('inquiries.suggestions', {
    method: 'GET',
    input: { query: trimmed },
    token: options.token,
    apiHost: options.apiHost,
    signal: getAbortSignal('inquiries.suggestions'),
  })) as Array<{ id: string; customerName: string; phoneNumber?: string | null; message: string; inqueryType?: string; productName?: string }>;
}
