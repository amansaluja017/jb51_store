import { useState, useRef, useCallback } from 'react';
import { Review } from '../../types';

interface ReviewCounts {
  all: number;
  approved: number;
  pending: number;
}

interface PaginatedReviewsResponse {
  items: Review[];
  total?: number;
  counts?: ReviewCounts;
  totalPages?: number;
  page?: number;
  limit?: number;
}

interface UseReviewsDataProps {
  trpcRequest: <T = unknown>(path: string, options?: { method?: 'GET' | 'POST'; body?: unknown; input?: unknown }) => Promise<T>;
  showAlert: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
}

export function useReviewsData({ trpcRequest, showAlert }: UseReviewsDataProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewCounts, setReviewCounts] = useState<{ all: number; approved: number; pending: number }>({
    all: 0,
    approved: 0,
    pending: 0,
  });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const hasFetchedReviews = useRef(false);

  const handleFetchReviews = useCallback(async (force = false) => {
    if (hasFetchedReviews.current && !force) return;
    setIsLoadingReviews(true);
    try {
      const res = await trpcRequest<PaginatedReviewsResponse>('reviews.getPaginated', {
        input: { page: 1, limit: 20 },
      });
      if (res?.items && Array.isArray(res.items)) {
        setReviews(res.items);
      } else if (Array.isArray(res)) {
        setReviews(res as Review[]);
      }
      if (res?.counts) {
        setReviewCounts(res.counts);
      } else if (res?.items && Array.isArray(res.items)) {
        const approved = res.items.filter(r => r.approved).length;
        setReviewCounts({
          all: res.total ?? res.items.length,
          approved,
          pending: (res.total ?? res.items.length) - approved,
        });
      }
      hasFetchedReviews.current = true;
    } catch (err: unknown) {
      console.error('[handleFetchReviews Error]:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [trpcRequest]);

  const handleFetchPaginatedReviews = useCallback(async (params?: {
    search?: string;
    approved?: boolean;
    page?: number;
    limit?: number;
  }) => {
    try {
      const res = await trpcRequest<PaginatedReviewsResponse>('reviews.getPaginated', {
        input: params,
      });
      if (res?.counts) {
        setReviewCounts(res.counts);
      }
      return res;
    } catch (err: unknown) {
      console.error('[handleFetchPaginatedReviews Error]:', err);
      throw err;
    }
  }, [trpcRequest]);

  const handleAddReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'>) => {
    try {
      const decoded = await trpcRequest<Review>('reviews.create', {
        method: 'POST',
        body: reviewData,
      });
      if (decoded && decoded.id && decoded.name) {
        setReviews(prev => [decoded, ...prev]);
        setReviewCounts(prev => ({
          all: prev.all + 1,
          approved: decoded.approved ? prev.approved + 1 : prev.approved,
          pending: !decoded.approved ? prev.pending + 1 : prev.pending,
        }));
        showAlert('Review Submitted', 'Customer review added successfully.', 'success');
        return decoded;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      showAlert('Error', message, 'error');
    }
  };

  const handleUpdateReview = async (reviewData: {
    id: string;
    name?: string;
    message?: string;
    stars?: number;
    image?: string | null;
    video?: string | null;
    instagramId?: string | null;
    phone?: string | null;
    location?: string | null;
    email?: string | null;
    approved?: boolean;
  }) => {
    try {
      const decoded = await trpcRequest<Review>('reviews.update', {
        method: 'POST',
        body: reviewData,
      });
      if (decoded && decoded.id) {
        setReviews(prev =>
          prev.map(r => r.id === decoded.id ? { ...r, ...decoded } : r)
        );
        showAlert('Review Updated', `Review by "${decoded.name}" updated successfully.`, 'success');
        return decoded;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update review';
      showAlert('Error', message, 'error');
      throw err;
    }
  };

  const handleToggleReviewApproval = async (review: Review) => {
    const newApproved = !review.approved;

    try {
      const decoded = await trpcRequest<Review>('reviews.update', {
        method: 'POST',
        body: { id: review.id, approved: newApproved },
      });
      if (decoded && decoded.id) {
        setReviews(prev =>
          prev.map(r => r.id === review.id ? { ...r, approved: newApproved } : r)
        );
        setReviewCounts(prev => ({
          all: prev.all,
          approved: newApproved ? prev.approved + 1 : Math.max(0, prev.approved - 1),
          pending: newApproved ? Math.max(0, prev.pending - 1) : prev.pending + 1,
        }));
        showAlert('Approval Updated', `Review by ${review.name} is now ${newApproved ? 'Approved' : 'Disapproved'}.`, 'success');
        return decoded;
      } else {
        throw new Error('Unknown review ID or invalid update');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update review approval';
      showAlert('Error', message, 'error');
    }
  };

  const handleDeleteReview = (review: Review) => {
    showAlert(
      'Delete Review',
      `Are you sure you want to delete review by "${review.name}"?`,
      'confirm',
      async () => {
        try {
          await trpcRequest('reviews.delete', {
            method: 'POST',
            body: { id: review.id },
          });
          setReviews(prev => prev.filter(r => r.id !== review.id));
          setReviewCounts(prev => ({
            all: Math.max(0, prev.all - 1),
            approved: review.approved ? Math.max(0, prev.approved - 1) : prev.approved,
            pending: !review.approved ? Math.max(0, prev.pending - 1) : prev.pending,
          }));
          showAlert('Review Deleted', 'Review removed successfully.', 'success');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to delete review';
          showAlert('Error', message, 'error');
        }
      }
    );
  };

  return {
    reviews,
    setReviews,
    reviewCounts,
    setReviewCounts,
    isLoadingReviews,
    setIsLoadingReviews,
    hasFetchedReviews,
    handleFetchReviews,
    handleFetchPaginatedReviews,
    handleAddReview,
    handleUpdateReview,
    handleDeleteReview,
    handleToggleReviewApproval,
  };
}

