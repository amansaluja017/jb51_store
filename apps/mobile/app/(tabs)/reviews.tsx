import React from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useAppDataContext } from '../../src/context/AppDataContext';
import ReviewsScreen from '../../src/screens/ReviewsScreen';

export default function ReviewsRoute() {
  const auth = useAuth();
  const data = useAppDataContext();

  return (
    <ReviewsScreen
      reviews={data.reviews}
      reviewCounts={data.reviewCounts}
      isLoading={data.isLoadingReviews}
      refreshing={data.refreshing}
      onRefresh={data.handleRefresh}
      onAddReview={data.handleAddReview}
      onUpdateReview={data.handleUpdateReview}
      onDeleteReview={data.handleDeleteReview}
      showAlert={data.showAlert}
      token={auth.token}
      apiHost={auth.apiHost}
      currentUser={auth.currentUser}
      onFetchPaginatedReviews={data.handleFetchPaginatedReviews}
      onToggleApproval={data.handleToggleReviewApproval}
      onSearchReviews={data.handleSearchReviews}
      onGetReviewSuggestions={data.handleGetReviewSuggestions}
      isSuperAdmin={auth.isSuperAdmin}
    />
  );
}
