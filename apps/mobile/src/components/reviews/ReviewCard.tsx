import React, { useState, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  Star,
  StarHalf,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Video,
  Pencil,
  Check,
  X,
  Trash2,
} from 'lucide-react-native';
import { Review } from '../../types';
import styles from '../../screens/ReviewsScreen.styles';
import { getOptimizedImageUrl, ImagePresets } from '../../utils/cloudinary';
import { triggerHaptic } from '../../utils/haptics';

export interface ReviewCardProps {
  review: Review;
  onEdit: (review: Review) => void;
  onDelete: (review: Review) => void;
  onToggleApproval: (review: Review) => Promise<unknown> | void;
}

const REVIEW_WORD_LIMIT = 25;

export const ReviewCard: React.FC<ReviewCardProps> = React.memo(({
  review,
  onEdit,
  onDelete,
  onToggleApproval,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = async () => {
    try {
      setIsApproving(true);
      triggerHaptic('medium');
      await onToggleApproval(review);
    } finally {
      setIsApproving(false);
    }
  };

  const currentStars = Number(review.stars) || 5;

  const words = useMemo(() => {
    return review.message ? review.message.trim().split(/\s+/) : [];
  }, [review.message]);

  const isLongMessage = words.length > REVIEW_WORD_LIMIT;
  const displayMessage = isLongMessage && !isExpanded
    ? `${words.slice(0, REVIEW_WORD_LIMIT).join(' ')}...`
    : review.message;

  return (
    <View style={styles.reviewCard}>
      {/* Header: Name, Location, Date & Stars */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.reviewerName}>{review.name}</Text>
          <View style={styles.metaRow}>
            {review.location ? (
              <View style={styles.metaItem}>
                <MapPin size={10} color="#71717a" style={styles.metaIcon} />
                <Text style={styles.metaText}>{review.location}</Text>
              </View>
            ) : null}
            {review.createdAt ? (
              <View style={[styles.metaItem, { marginLeft: review.location ? 8 : 0 }]}>
                <Clock size={10} color="#a1a1aa" style={styles.metaIcon} />
                <Text style={styles.dateText}>
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Stars with Decimal & Half-Star Support */}
        <View style={styles.starContainer}>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => {
              const isFull = currentStars >= s;
              const isHalf = !isFull && currentStars >= s - 0.5;
              return isHalf ? (
                <StarHalf
                  key={s}
                  size={12}
                  color="#eab308"
                  fill="#eab308"
                  style={styles.starIcon}
                />
              ) : (
                <Star
                  key={s}
                  size={12}
                  color={isFull ? '#eab308' : '#e4e4e7'}
                  fill={isFull ? '#eab308' : 'none'}
                  style={styles.starIcon}
                />
              );
            })}
          </View>
          <View style={styles.starScoreBadge}>
            <Text style={styles.starScoreBadgeText}>{currentStars.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      {/* Message */}
      <Text style={[styles.reviewMessage, isLongMessage && { marginBottom: 6 }]}>
        "{displayMessage}"
      </Text>
      {isLongMessage && (
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            setIsExpanded(prev => !prev);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.expandToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.expandToggleText}>
            {isExpanded ? 'Show less' : 'Show more'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Image Preview with Cloudinary Dynamic Optimization */}
      {review.image ? (
        <View style={styles.imageThumbnailContainer}>
          <Image
            source={{ uri: getOptimizedImageUrl(review.image, ImagePresets.review) }}
            style={styles.imageThumbnail}
            resizeMode="cover"
          />
        </View>
      ) : null}

      {/* Optional Badges / Attachments Indicators */}
      <View style={styles.attachmentsRow}>
        {review.phone ? (
          <View style={styles.badge}>
            <Phone size={9} color="#71717a" style={styles.badgeIcon} />
            <Text style={styles.badgeText}>{review.phone}</Text>
          </View>
        ) : null}
        {review.instagramId ? (
          <View style={styles.badge}>
            <MessageSquare size={9} color="#71717a" style={styles.badgeIcon} />
            <Text style={styles.badgeText}>@{review.instagramId}</Text>
          </View>
        ) : null}
        {review.video ? (
          <View style={[styles.badge, styles.successBadge]}>
            <Video size={9} color="#059669" style={styles.badgeIcon} />
            <Text style={[styles.badgeText, styles.successBadgeText]}>Video Attached</Text>
          </View>
        ) : null}
      </View>

      {/* Actions: Status Toggle, Edit, Delete */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={handleToggle}
          disabled={isApproving}
          style={[
            styles.statusBtn,
            review.approved ? styles.approvedBtn : styles.unapprovedBtn,
          ]}
          accessibilityRole="button"
          accessibilityLabel={review.approved ? 'Approved review' : 'Approve review'}
        >
          {isApproving ? (
            <ActivityIndicator size="small" color={review.approved ? '#ffffff' : '#71717a'} />
          ) : (
            <>
              {review.approved ? (
                <Check size={11} color="#ffffff" style={styles.btnIcon} />
              ) : (
                <X size={11} color="#71717a" style={styles.btnIcon} />
              )}
              <Text
                style={[
                  styles.statusBtnText,
                  review.approved ? styles.approvedBtnText : styles.unapprovedBtnText,
                ]}
              >
                {review.approved ? 'Approved' : 'Pending'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.rightActionsRow}>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              onEdit(review);
            }}
            style={styles.editBtn}
            accessibilityRole="button"
            accessibilityLabel={`Edit review from ${review.name}`}
          >
            <Pencil size={11} color="#09090b" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerHaptic('warning');
              onDelete(review);
            }}
            style={styles.deleteBtn}
            accessibilityRole="button"
            accessibilityLabel={`Delete review from ${review.name}`}
          >
            <Trash2 size={12} color="#dc2626" />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default ReviewCard;
