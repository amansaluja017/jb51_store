import React from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useInquiriesReviews } from '../../src/context/InquiriesReviewsContext';
import { useUi } from '../../src/context/UiContext';
import ReviewsScreen from '../../src/screens/ReviewsScreen';

export default function ReviewsRoute() {
  const auth = useAuth();
  const inquiriesReviews = useInquiriesReviews();
  const ui = useUi();

  return (
    <ReviewsScreen
      reviews={inquiriesReviews.reviews}
      reviewCounts={inquiriesReviews.reviewCounts}
      isLoading={inquiriesReviews.isLoadingReviews}
      refreshing={false}
      onRefresh={() => inquiriesReviews.handleFetchPaginatedReviews({ page: 1, limit: 10 })}
      onAddReview={inquiriesReviews.handleAddReview}
      onUpdateReview={inquiriesReviews.handleUpdateReview}
      onDeleteReview={inquiriesReviews.handleDeleteReview}
      showAlert={ui.showAlert}
      token={auth.token}
      apiHost={auth.apiHost}
      currentUser={auth.currentUser}
      onFetchPaginatedReviews={inquiriesReviews.handleFetchPaginatedReviews}
      onToggleApproval={inquiriesReviews.handleToggleReviewApproval}
      onSearchReviews={inquiriesReviews.handleSearchReviews}
      onGetReviewSuggestions={inquiriesReviews.handleGetReviewSuggestions}
      isSuperAdmin={auth.isSuperAdmin}
    />
  );
}
