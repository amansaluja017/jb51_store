import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Platform, 
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import { Plus, Sparkles } from 'lucide-react-native';
import { ReviewsSkeleton } from '../components/SkeletonLoader';
import { Pagination } from '../components/ui';
import { Review, PaginatedReviewsResponse } from '../types';
import { uploadProductImage } from '../services/api';
import { tokenStorage } from '../services/tokenStorage';
import { useDebounce } from '../hooks/useDebounce';
import {
  ReviewCard,
  ReviewFormModal,
  ReviewFormValues,
  ReviewsSuperAdminBanner,
} from '../components/reviews';
import styles from './ReviewsScreen.styles';

const PAGE_SIZE = 10;

export type { ReviewFormValues };

export interface ReviewSuggestionItem {
  id: string;
  name: string;
  messageSnippet: string;
  customerName?: string;
  review?: string;
  rating?: number;
  location?: string | null;
}

export interface ReviewsScreenProps {
  currentUser?: { id?: string; email?: string; userName?: string; role?: string } | null;
  isSuperAdmin?: boolean;
  reviews: Review[];
  reviewCounts?: { all: number; approved: number; pending: number };
  isLoading: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onAddReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'> & { email?: string | null; approved?: boolean }) => Promise<unknown> | void;
  onUpdateReview?: (reviewData: { id: string; name?: string; message?: string; stars?: number; image?: string | null; video?: string | null; instagramId?: string | null; phone?: string | null; location?: string | null; email?: string | null; approved?: boolean }) => Promise<unknown> | void;
  onDeleteReview: (review: Review) => void;
  onToggleApproval: (review: Review) => Promise<unknown> | void;
  showAlert: (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm', onConfirm?: () => void) => void;
  token?: string | null;
  apiHost?: string;
  onSearchReviews?: (query: string) => Promise<Review[]>;
  onGetReviewSuggestions?: (query: string) => Promise<ReviewSuggestionItem[]>;
  onFetchPaginatedReviews?: (params?: { search?: string; approved?: boolean; page?: number; limit?: number }) => Promise<PaginatedReviewsResponse>;
}

const uploadMediaAsset = async (localUri: string, options?: { token?: string | null; apiHost?: string }): Promise<string> => {
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }
  try {
    const res = await uploadProductImage(localUri, options);
    if (res?.url) return res.url;
  } catch (e) {
    console.warn('Image upload failed, using local URI fallback:', e);
  }
  return localUri;
};

export default function ReviewsScreen({
  currentUser,
  isSuperAdmin: propIsSuperAdmin,
  reviews,
  reviewCounts: propReviewCounts,
  isLoading,
  refreshing,
  onRefresh,
  onAddReview,
  onUpdateReview,
  onDeleteReview,
  onToggleApproval,
  showAlert,
  token,
  apiHost,
  onSearchReviews,
  onGetReviewSuggestions,
  onFetchPaginatedReviews,
}: ReviewsScreenProps) {
  const isSuperAdmin = Boolean(
    propIsSuperAdmin ||
    currentUser?.role === 'superadmin'
  );

  const [mediaUploadsEnabled, setMediaUploadsEnabled] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Debounce search query (500ms) - waits until typing stops before querying backend
  const debouncedSearch = useDebounce(searchQuery.trim(), 500);
  const isSearchTyping = searchQuery.trim() !== debouncedSearch;
  const [remoteReviews, setRemoteReviews] = useState<Review[] | null>(null);
  const [suggestions, setSuggestions] = useState<ReviewSuggestionItem[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reviewCounts, setReviewCounts] = useState<{ all: number; approved: number; pending: number } | null>(null);
  const [remoteData, setRemoteData] = useState<PaginatedReviewsResponse | null>(null);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const reviewScrollRef = useRef<ScrollView>(null);

  // Restore persisted media upload toggle preference
  useEffect(() => {
    tokenStorage.getReviewsMediaEnabled().then((enabled) => {
      setMediaUploadsEnabled(enabled);
    });
  }, []);

  const handleToggleMediaUploads = async (val: boolean) => {
    if (!isSuperAdmin) {
      showAlert('Permission Denied', 'Only Super Administrators can configure review media attachment settings.', 'error');
      return;
    }
    setMediaUploadsEnabled(val);
    await tokenStorage.setReviewsMediaEnabled(val);
  };

  // Reset to page 1 whenever search query or status filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilter]);

  // Backend suggestions via pg_trgm (only after typing stops)
  useEffect(() => {
    if (isSearchTyping) return;

    let isCancelled = false;
    if (debouncedSearch && onGetReviewSuggestions) {
      onGetReviewSuggestions(debouncedSearch)
        .then((res) => {
          if (!isCancelled && Array.isArray(res)) setSuggestions(res);
        })
        .catch(() => {
          if (!isCancelled) setSuggestions(null);
        });
    } else {
      setSuggestions(null);
    }
    return () => { isCancelled = true; };
  }, [debouncedSearch, isSearchTyping, onGetReviewSuggestions]);

  // Fetch paginated reviews from backend (only after typing stops)
  useEffect(() => {
    if (isSearchTyping) return;

    let isCancelled = false;
    if (onFetchPaginatedReviews) {
      setIsFetchingRemote(true);
      const approvedParam =
        activeFilter === 'approved' ? true : activeFilter === 'pending' ? false : undefined;

      onFetchPaginatedReviews({
        search: debouncedSearch || undefined,
        approved: approvedParam,
        page,
        limit: PAGE_SIZE,
      })
        .then((res) => {
          if (!isCancelled && res) {
            setRemoteData(res);
            if (res.counts) {
              setReviewCounts(res.counts);
            }
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.warn('[ReviewsScreen pagination fetch error]:', err);
          }
        })
        .finally(() => {
          if (!isCancelled) setIsFetchingRemote(false);
        });
    } else if (debouncedSearch && onSearchReviews) {
      onSearchReviews(debouncedSearch).then((results) => {
        if (!isCancelled && Array.isArray(results)) {
          setRemoteReviews(results);
        }
      }).catch(() => {});
    } else {
      setRemoteReviews(null);
    }
    return () => { isCancelled = true; };
  }, [debouncedSearch, isSearchTyping, activeFilter, page, refreshKey, onFetchPaginatedReviews, onSearchReviews]);

  // Calculate counts for Filter Tabs
  const allCount = useMemo(() => {
    if (reviewCounts) return reviewCounts.all;
    if (propReviewCounts && propReviewCounts.all > 0) return propReviewCounts.all;
    if (remoteData?.counts) return remoteData.counts.all;
    return reviews.length;
  }, [reviewCounts, propReviewCounts, remoteData, reviews]);

  const approvedCount = useMemo(() => {
    if (reviewCounts) return reviewCounts.approved;
    if (propReviewCounts && (propReviewCounts.all > 0 || propReviewCounts.approved > 0)) return propReviewCounts.approved;
    if (remoteData?.counts) return remoteData.counts.approved;
    return reviews.filter(r => r.approved).length;
  }, [reviewCounts, propReviewCounts, remoteData, reviews]);

  const pendingCount = useMemo(() => {
    if (reviewCounts) return reviewCounts.pending;
    if (propReviewCounts && (propReviewCounts.all > 0 || propReviewCounts.pending > 0)) return propReviewCounts.pending;
    if (remoteData?.counts) return remoteData.counts.pending;
    return reviews.filter(r => !r.approved).length;
  }, [reviewCounts, propReviewCounts, remoteData, reviews]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    onRefresh?.();
  };

  // Local filtered reviews (for fallback or counting)
  const localFilteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'approved' && rev.approved) ||
        (activeFilter === 'pending' && !rev.approved);
      if (!matchesFilter) return false;
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      const n = (rev.name || '').toLowerCase();
      const m = (rev.message || '').toLowerCase();
      const l = (rev.location || '').toLowerCase();
      return n.includes(q) || m.includes(q) || l.includes(q);
    });
  }, [reviews, activeFilter, debouncedSearch]);

  const displayedReviews = useMemo(() => {
    if (remoteData) {
      return remoteData.items;
    }
    if (remoteReviews !== null) {
      return remoteReviews.filter(rev => {
        return (
          activeFilter === 'all' ||
          (activeFilter === 'approved' && rev.approved) ||
          (activeFilter === 'pending' && !rev.approved)
        );
      });
    }
    return localFilteredReviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [remoteData, remoteReviews, localFilteredReviews, activeFilter, page]);

  const totalCount = remoteData
    ? (remoteData.total ?? remoteData.items.length)
    : remoteReviews !== null
    ? remoteReviews.length
    : localFilteredReviews.length;

  const totalPages = remoteData
    ? (remoteData.totalPages || Math.max(1, Math.ceil(totalCount / PAGE_SIZE)))
    : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);
  const startRecord = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(safePage * PAGE_SIZE, totalCount);

  const handleToggleApprovalInternal = async (rev: Review) => {
    try {
      await onToggleApproval(rev);
      const willBeApproved = !rev.approved;

      setReviewCounts(prev => {
        const currentAll = prev ? prev.all : allCount;
        const currentApproved = prev ? prev.approved : approvedCount;
        const currentPending = prev ? prev.pending : pendingCount;
        return {
          all: currentAll,
          approved: willBeApproved ? currentApproved + 1 : Math.max(0, currentApproved - 1),
          pending: willBeApproved ? Math.max(0, currentPending - 1) : currentPending + 1,
        };
      });

      if (remoteData) {
        setRemoteData(prev => prev ? {
          ...prev,
          items: prev.items.map(r => r.id === rev.id ? { ...r, approved: willBeApproved } : r),
        } : null);
      }
      if (remoteReviews) {
        setRemoteReviews(prev => prev ? prev.map(r => r.id === rev.id ? { ...r, approved: willBeApproved } : r) : null);
      }
    } catch {
      // alert handled by caller
    }
  };

  const handleDeleteReviewInternal = (rev: Review) => {
    onDeleteReview(rev);
    const wasApproved = !!rev.approved;

    setReviewCounts(prev => {
      const currentAll = prev ? prev.all : allCount;
      const currentApproved = prev ? prev.approved : approvedCount;
      const currentPending = prev ? prev.pending : pendingCount;
      return {
        all: Math.max(0, currentAll - 1),
        approved: wasApproved ? Math.max(0, currentApproved - 1) : currentApproved,
        pending: !wasApproved ? Math.max(0, currentPending - 1) : currentPending,
      };
    });

    if (remoteData) {
      setRemoteData(prev => prev ? {
        ...prev,
        total: Math.max(0, (prev.total ?? prev.items.length) - 1),
        items: prev.items.filter(r => r.id !== rev.id),
      } : null);
    }
    if (remoteReviews) {
      setRemoteReviews(prev => prev ? prev.filter(r => r.id !== rev.id) : null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingReview(null);
    setFormVisible(true);
  };

  const handleOpenEditModal = (review: Review) => {
    setEditingReview(review);
    setFormVisible(true);
  };

  const onFormSubmit = async (data: ReviewFormValues) => {
    let uploadedImageUrl: string | null = editingReview?.image || null;
    let uploadedVideoUrl: string | null = editingReview?.video || null;

    if (mediaUploadsEnabled) {
      try {
        if (data.image && data.image !== editingReview?.image) {
          uploadedImageUrl = await uploadMediaAsset(data.image, { token, apiHost });
        } else if (!data.image) {
          uploadedImageUrl = null;
        }
        if (data.video && data.video !== editingReview?.video) {
          uploadedVideoUrl = await uploadMediaAsset(data.video, { token, apiHost });
        } else if (!data.video) {
          uploadedVideoUrl = null;
        }
      } catch {
        showAlert('Upload Error', 'Failed to upload review media assets. Please try again.', 'error');
        return;
      }
    }

    const parsedStars = Math.min(5, Math.max(0.5, parseFloat(String(data.stars)) || 5));

    try {
      if (editingReview) {
        if (onUpdateReview) {
          await onUpdateReview({
            id: editingReview.id,
            name: data.name.trim(),
            message: data.message.trim(),
            stars: parsedStars,
            location: data.location.trim() || null,
            instagramId: data.instagramId.trim() || null,
            phone: data.phone.trim() || null,
            email: data.email.trim() || null,
            image: uploadedImageUrl,
            video: uploadedVideoUrl,
            approved: editingReview.approved,
          });

          const updatedFields = {
            name: data.name.trim(),
            message: data.message.trim(),
            stars: parsedStars,
            location: data.location.trim() || null,
            instagramId: data.instagramId.trim() || null,
            phone: data.phone.trim() || null,
            email: data.email.trim() || null,
            image: uploadedImageUrl,
            video: uploadedVideoUrl,
          };
          setRemoteData(prev => prev ? {
            ...prev,
            items: prev.items.map(r => r.id === editingReview.id ? { ...r, ...updatedFields } : r),
          } : null);
          setRemoteReviews(prev => prev ? prev.map(r => r.id === editingReview.id ? { ...r, ...updatedFields } : r) : null);
        }
      } else {
        await onAddReview({
          name: data.name.trim(),
          message: data.message.trim(),
          stars: parsedStars,
          location: data.location.trim() || null,
          instagramId: data.instagramId.trim() || null,
          phone: data.phone.trim() || null,
          email: data.email.trim() || null,
          image: uploadedImageUrl,
          video: uploadedVideoUrl,
          approved: true,
        });
      }

      setEditingReview(null);
      setFormVisible(false);
      setRefreshKey(k => k + 1);
    } catch {
      // Error is alerted by caller
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
      style={styles.container}
    >
      {/* Search & Actions Header */}
      <View style={styles.headerRow}>
        <View style={styles.searchBar}>
          <TextInput 
            placeholder="Search reviews..."
            placeholderTextColor="#a1a1aa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity 
          onPress={handleOpenAddModal} 
          style={styles.addButton}
          accessibilityLabel="Add Review"
          accessibilityRole="button"
        >
          <Plus size={14} color="#fff" />
          <Text style={styles.addButtonText}>Add Review</Text>
        </TouchableOpacity>
      </View>

      {/* Backend pg_trgm Review Suggestions */}
      {debouncedSearch.length > 0 && suggestions && suggestions.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 16, marginTop: -4, marginBottom: 8, maxHeight: 30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={11} color="#FF5E36" />
            {suggestions.slice(0, 5).map((item, idx) => {
              const labelName = item.name || item.customerName || '';
              const labelReview = item.messageSnippet || item.review || '';
              const queryText = labelName || labelReview;
              return (
                <TouchableOpacity
                  key={`rev-sug-${item.id || idx}`}
                  onPress={() => setSearchQuery(queryText)}
                  style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e4e4e7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}
                >
                  <Text style={{ fontSize: 10, color: '#18181b', fontWeight: '500' }}>
                    {labelName ? `${labelName}: ` : ''}
                    {labelReview ? (labelReview.length > 25 ? `${labelReview.slice(0, 25)}...` : labelReview) : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Filter Tabs Chips */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          onPress={() => setActiveFilter('all')}
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          accessibilityLabel={`All reviews (${allCount})`}
          accessibilityRole="button"
        >
          <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
            All ({allCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter('approved')}
          style={[styles.filterChip, activeFilter === 'approved' && styles.filterChipActive]}
          accessibilityLabel={`Approved reviews (${approvedCount})`}
          accessibilityRole="button"
        >
          <Text style={[styles.filterChipText, activeFilter === 'approved' && styles.filterChipTextActive]}>
            Approved ({approvedCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter('pending')}
          style={[styles.filterChip, activeFilter === 'pending' && styles.filterChipActive]}
          accessibilityLabel={`Pending reviews (${pendingCount})`}
          accessibilityRole="button"
        >
          <Text style={[styles.filterChipText, activeFilter === 'pending' && styles.filterChipTextActive]}>
            Pending ({pendingCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Superadmin Media Uploads Toggle Banner */}
      <ReviewsSuperAdminBanner
        isSuperAdmin={isSuperAdmin}
        mediaUploadsEnabled={mediaUploadsEnabled}
        onToggleMediaUploads={handleToggleMediaUploads}
      />

      {/* Reviews List */}
      <ScrollView 
        ref={reviewScrollRef}
        contentContainerStyle={styles.scrollPadding}
        alwaysBounceVertical={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing || false}
              onRefresh={handleRefresh}
              tintColor="#FF5E36"
              colors={['#FF5E36']}
              progressBackgroundColor="#ffffff"
            />
          ) : undefined
        }
      >
        {isLoading || (isFetchingRemote && displayedReviews.length === 0) ? (
          <ReviewsSkeleton />
        ) : displayedReviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Reviews Found</Text>
            <Text style={styles.emptySubtitle}>
              {reviews.length === 0 
                ? "No reviews in the database yet. Tap below to submit a review."
                : "No reviews match your filter or search query."}
            </Text>
            <TouchableOpacity 
              onPress={handleOpenAddModal} 
              style={[styles.addButton, { marginTop: 14 }]}
              accessibilityRole="button"
              accessibilityLabel="Add review from empty state"
            >
              <Plus size={14} color="#fff" />
              <Text style={styles.addButtonText}>Add Review</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {totalPages > 1 && (
              <View style={styles.countSummaryRow}>
                <Text style={styles.countSummaryText}>
                  Showing {startRecord}–{endRecord} of {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
                  {activeFilter !== 'all' ? ` (${activeFilter})` : ''}
                </Text>
              </View>
            )}

            {displayedReviews.map(rev => (
              <ReviewCard
                key={rev.id}
                review={rev}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteReviewInternal}
                onToggleApproval={handleToggleApprovalInternal}
              />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination 
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  reviewScrollRef.current?.scrollTo({ y: 0, animated: true });
                }}
              />
            )}
          </>
        )}
      </ScrollView>

      {/* Add / Edit Review Modal Form */}
      <ReviewFormModal
        visible={formVisible}
        editingReview={editingReview}
        mediaUploadsEnabled={mediaUploadsEnabled}
        onClose={() => {
          setEditingReview(null);
          setFormVisible(false);
        }}
        onSubmit={onFormSubmit}
        showAlert={showAlert}
      />
    </KeyboardAvoidingView>
  );
}
