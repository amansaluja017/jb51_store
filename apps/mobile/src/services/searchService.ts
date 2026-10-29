import { trpcRequest } from './api';
import { Product, Customer, Invoice, Order, Credit, Review, Inquiry } from '../types';

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
  sortBy?: 'default' | 'stockAsc' | 'stockDesc';
  limit?: number;
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
  })) as { items: Product[]; total: number; query: string };
}

export async function getProductSuggestions(
  query: string,
  options: ServiceOptions
): Promise<ProductSuggestionsResponse> {
  return (await trpcRequest('products.suggestions', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
  })) as ProductSuggestionsResponse;
}

// 2. Inventory Search (ILIKE) & Suggestions (pg_trgm)
export async function searchInventory(
  params: SearchInventoryParams,
  options: ServiceOptions
): Promise<{ items: Product[]; total: number; metrics?: any; query: string }> {
  return (await trpcRequest('inventory.search', {
    method: 'GET',
    input: params,
    token: options.token,
    apiHost: options.apiHost,
  })) as { items: Product[]; total: number; metrics?: any; query: string };
}

export async function getInventorySuggestions(
  query: string,
  options: ServiceOptions
): Promise<Array<{ id: string; name: string; category: string; availableStock: number; color?: string | null }>> {
  return (await trpcRequest('inventory.suggestions', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
  })) as Array<{ id: string; name: string; category: string; availableStock: number; color?: string | null }>;
}

// 3. Customers Search (ILIKE) & Suggestions (pg_trgm)
export async function searchCustomers(
  query: string,
  options: ServiceOptions
): Promise<Customer[]> {
  const res: any = await trpcRequest('customers.search', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
  });
  return (Array.isArray(res) ? res : res?.items ?? []) as Customer[];
}

export async function getCustomerSuggestions(
  query: string,
  options: ServiceOptions
): Promise<Array<{ id: string; name: string; phoneNumber: string; email?: string | null; address?: string | null }>> {
  const res: any = await trpcRequest('customers.suggestions', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
  });
  return (Array.isArray(res) ? res : res?.suggestions ?? []) as Array<{ id: string; name: string; phoneNumber: string; email?: string | null; address?: string | null }>;
}

// 4. Orders Search (Exact order # / phone / ID, Customer Name ILIKE) & Suggestions
export async function searchOrders(
  query: string,
  options: ServiceOptions
): Promise<Order[]> {
  const res: any = await trpcRequest('orders.search', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
  });
  return (Array.isArray(res) ? res : res?.items ?? []) as Order[];
}

// 5. Invoices Search (Exact invoice # / phone / ID, Customer Name ILIKE) & Suggestions
export async function searchInvoices(
  query: string,
  options: ServiceOptions
): Promise<Invoice[]> {
  const res: any = await trpcRequest('invoices.search', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
  });
  return (Array.isArray(res) ? res : res?.items ?? []) as Invoice[];
}

// 6. Credits Search & Suggestions
export async function searchCredits(
  query: string,
  options: ServiceOptions
): Promise<Credit[]> {
  const res: any = await trpcRequest('credits.search', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
  });
  const items = (Array.isArray(res) ? res : res?.items ?? []) as Credit[];
  if (res && !Array.isArray(res)) {
    (items as any).metrics = res.metrics;
    (items as any).total = res.total;
  }
  return items;
}

// 7. Reviews Search (ILIKE) & Suggestions (pg_trgm)
export async function searchReviews(
  query: string,
  options: ServiceOptions
): Promise<Review[]> {
  return (await trpcRequest('reviews.search', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
  })) as Review[];
}

export async function getReviewSuggestions(
  query: string,
  options: ServiceOptions
): Promise<Array<{ id: string; customerName: string; review: string; rating?: number }>> {
  return (await trpcRequest('reviews.suggestions', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
  })) as Array<{ id: string; customerName: string; review: string; rating?: number }>;
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
  })) as Inquiry[];
}

export async function getInquirySuggestions(
  query: string,
  options: ServiceOptions
): Promise<Array<{ id: string; customerName: string; phoneNumber?: string | null; message: string; inqueryType?: string; productName?: string }>> {
  return (await trpcRequest('inquiries.suggestions', {
    method: 'GET',
    input: { query },
    token: options.token,
    apiHost: options.apiHost,
  })) as Array<{ id: string; customerName: string; phoneNumber?: string | null; message: string; inqueryType?: string; productName?: string }>;
}
