import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useUi } from './UiContext';
import { useInquiriesData } from '../hooks/appData/useInquiriesData';
import { useReviewsData } from '../hooks/appData/useReviewsData';
import { useSearchData } from '../hooks/appData/useSearchData';

export interface InquiriesReviewsContextType {
  // Inquiries
  inquiries: ReturnType<typeof useInquiriesData>['inquiries'];
  pendingInquiriesCount: ReturnType<typeof useInquiriesData>['pendingInquiriesCount'];
  isLoadingInquiries: ReturnType<typeof useInquiriesData>['isLoadingInquiries'];
  inquiriesPagination: ReturnType<typeof useInquiriesData>['inquiriesPagination'];
  inquiriesSortBy: ReturnType<typeof useInquiriesData>['inquiriesSortBy'];
  setInquiriesSortBy: ReturnType<typeof useInquiriesData>['setInquiriesSortBy'];
  inquiriesStatusFilter: ReturnType<typeof useInquiriesData>['inquiriesStatusFilter'];
  setInquiriesStatusFilter: ReturnType<typeof useInquiriesData>['setInquiriesStatusFilter'];
  inquiriesSearchQuery: ReturnType<typeof useInquiriesData>['inquiriesSearchQuery'];
  setInquiriesSearchQuery: ReturnType<typeof useInquiriesData>['setInquiriesSearchQuery'];
  handleFetchPaginatedInquiries: ReturnType<typeof useInquiriesData>['handleFetchPaginatedInquiries'];
  handleResolveInquiry: ReturnType<typeof useInquiriesData>['handleResolveInquiry'];
  inquiriesModalOpen: ReturnType<typeof useInquiriesData>['inquiriesModalOpen'];
  setInquiriesModalOpen: ReturnType<typeof useInquiriesData>['setInquiriesModalOpen'];
  handleSearchInquiries: ReturnType<typeof useSearchData>['handleSearchInquiries'];
  handleGetInquirySuggestions: ReturnType<typeof useSearchData>['handleGetInquirySuggestions'];

  // Reviews
  reviews: ReturnType<typeof useReviewsData>['reviews'];
  reviewCounts: ReturnType<typeof useReviewsData>['reviewCounts'];
  isLoadingReviews: ReturnType<typeof useReviewsData>['isLoadingReviews'];
  handleFetchReviews: ReturnType<typeof useReviewsData>['handleFetchReviews'];
  handleFetchPaginatedReviews: ReturnType<typeof useReviewsData>['handleFetchPaginatedReviews'];
  handleAddReview: ReturnType<typeof useReviewsData>['handleAddReview'];
  handleUpdateReview: ReturnType<typeof useReviewsData>['handleUpdateReview'];
  handleDeleteReview: ReturnType<typeof useReviewsData>['handleDeleteReview'];
  handleToggleReviewApproval: ReturnType<typeof useReviewsData>['handleToggleReviewApproval'];
  handleSearchReviews: ReturnType<typeof useSearchData>['handleSearchReviews'];
  handleGetReviewSuggestions: ReturnType<typeof useSearchData>['handleGetReviewSuggestions'];
}

const InquiriesReviewsContext = createContext<InquiriesReviewsContextType | null>(null);

export function InquiriesReviewsProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const ui = useUi();

  const inquiriesData = useInquiriesData({
    trpcRequest: auth.trpcRequest,
    showAlert: ui.showAlert,
  });

  const reviewsData = useReviewsData({
    trpcRequest: auth.trpcRequest,
    showAlert: ui.showAlert,
  });

  const searchData = useSearchData({
    token: auth.token,
    apiHost: auth.apiHost,
  });

  const value = useMemo<InquiriesReviewsContextType>(() => ({
    // Inquiries
    inquiries: inquiriesData.inquiries,
    pendingInquiriesCount: inquiriesData.pendingInquiriesCount,
    isLoadingInquiries: inquiriesData.isLoadingInquiries,
    inquiriesPagination: inquiriesData.inquiriesPagination,
    inquiriesSortBy: inquiriesData.inquiriesSortBy,
    setInquiriesSortBy: inquiriesData.setInquiriesSortBy,
    inquiriesStatusFilter: inquiriesData.inquiriesStatusFilter,
    setInquiriesStatusFilter: inquiriesData.setInquiriesStatusFilter,
    inquiriesSearchQuery: inquiriesData.inquiriesSearchQuery,
    setInquiriesSearchQuery: inquiriesData.setInquiriesSearchQuery,
    handleFetchPaginatedInquiries: inquiriesData.handleFetchPaginatedInquiries,
    handleResolveInquiry: inquiriesData.handleResolveInquiry,
    inquiriesModalOpen: inquiriesData.inquiriesModalOpen,
    setInquiriesModalOpen: inquiriesData.setInquiriesModalOpen,
    handleSearchInquiries: searchData.handleSearchInquiries,
    handleGetInquirySuggestions: searchData.handleGetInquirySuggestions,

    // Reviews
    reviews: reviewsData.reviews,
    reviewCounts: reviewsData.reviewCounts,
    isLoadingReviews: reviewsData.isLoadingReviews,
    handleFetchReviews: reviewsData.handleFetchReviews,
    handleFetchPaginatedReviews: reviewsData.handleFetchPaginatedReviews,
    handleAddReview: reviewsData.handleAddReview,
    handleUpdateReview: reviewsData.handleUpdateReview,
    handleDeleteReview: reviewsData.handleDeleteReview,
    handleToggleReviewApproval: reviewsData.handleToggleReviewApproval,
    handleSearchReviews: searchData.handleSearchReviews,
    handleGetReviewSuggestions: searchData.handleGetReviewSuggestions,
  }), [inquiriesData, reviewsData, searchData]);

  return (
    <InquiriesReviewsContext.Provider value={value}>
      {children}
    </InquiriesReviewsContext.Provider>
  );
}

export function useInquiriesReviews(): InquiriesReviewsContextType {
  const context = useContext(InquiriesReviewsContext);
  if (!context) {
    throw new Error('useInquiriesReviews must be used within an InquiriesReviewsProvider');
  }
  return context;
}

