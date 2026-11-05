import { useCallback } from 'react';
import {
  searchProducts as searchProductsService,
  getProductSuggestions as getProductSuggestionsService,
  searchInventory as searchInventoryService,
  getInventorySuggestions as getInventorySuggestionsService,
  searchCustomers as searchCustomersService,
  getCustomerSuggestions as getCustomerSuggestionsService,
  searchOrders as searchOrdersService,
  searchInvoices as searchInvoicesService,
  searchCredits as searchCreditsService,
  searchReviews as searchReviewsService,
  getReviewSuggestions as getReviewSuggestionsService,
  searchInquiries as searchInquiriesService,
  getInquirySuggestions as getInquirySuggestionsService,
  SearchProductsParams,
  SearchInventoryParams,
} from '../../services/searchService';

interface UseSearchDataProps {
  token: string | null;
  apiHost: string;
}

export function useSearchData({ token, apiHost }: UseSearchDataProps) {
  const handleSearchProducts = useCallback(async (params: SearchProductsParams) => {
    return await searchProductsService(params, { token, apiHost });
  }, [token, apiHost]);

  const handleGetProductSuggestions = useCallback(async (query: string) => {
    return await getProductSuggestionsService(query, { token, apiHost });
  }, [token, apiHost]);

  const handleSearchInventory = useCallback(async (params: SearchInventoryParams) => {
    return await searchInventoryService(params, { token, apiHost });
  }, [token, apiHost]);

  const handleGetInventorySuggestions = useCallback(async (query: string) => {
    return await getInventorySuggestionsService(query, { token, apiHost });
  }, [token, apiHost]);

  const handleSearchCustomers = useCallback(async (query: string) => {
    return await searchCustomersService(query, { token, apiHost });
  }, [token, apiHost]);

  const handleGetCustomerSuggestions = useCallback(async (query: string) => {
    return await getCustomerSuggestionsService(query, { token, apiHost });
  }, [token, apiHost]);

  const handleSearchOrders = useCallback(async (query: string) => {
    return await searchOrdersService(query, { token, apiHost });
  }, [token, apiHost]);

  const handleSearchInvoices = useCallback(async (query: string) => {
    return await searchInvoicesService(query, { token, apiHost });
  }, [token, apiHost]);

  const handleSearchCredits = useCallback(async (query: string) => {
    return await searchCreditsService(query, { token, apiHost });
  }, [token, apiHost]);

  const handleSearchReviews = useCallback(async (query: string) => {
    return await searchReviewsService(query, { token, apiHost });
  }, [token, apiHost]);

  const handleGetReviewSuggestions = useCallback(async (query: string) => {
    return await getReviewSuggestionsService(query, { token, apiHost });
  }, [token, apiHost]);

  const handleSearchInquiries = useCallback(async (query: string) => {
    return await searchInquiriesService(query, { token, apiHost });
  }, [token, apiHost]);

  const handleGetInquirySuggestions = useCallback(async (query: string) => {
    return await getInquirySuggestionsService(query, { token, apiHost });
  }, [token, apiHost]);

  return {
    handleSearchProducts,
    handleGetProductSuggestions,
    handleSearchInventory,
    handleGetInventorySuggestions,
    handleSearchCustomers,
    handleGetCustomerSuggestions,
    handleSearchOrders,
    handleSearchInvoices,
    handleSearchCredits,
    handleSearchReviews,
    handleGetReviewSuggestions,
    handleSearchInquiries,
    handleGetInquirySuggestions,
  };
}

