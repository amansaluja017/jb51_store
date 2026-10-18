import React, { useState, useMemo } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  Platform, 
  KeyboardAvoidingView, 
  RefreshControl,
  Image 
} from 'react-native';
import { Star, Trash2, Check, X, Plus, MapPin, MessageSquare, Video, Image as ImageIcon, Phone, Clock } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { ReviewsSkeleton } from '../components/SkeletonLoader';
import { Review } from '../types';
import { uploadProductImage } from '../services/api';
import styles from './ReviewsScreen.styles';

export interface ReviewFormValues {
  name: string;
  message: string;
  stars: number;
  location: string;
  instagramId: string;
  phone: string;
  email: string;
  image: string;
  video: string;
}

interface ReviewsScreenProps {
  reviews: Review[];
  isLoading: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onAddReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'> & { email?: string | null; approved?: boolean }) => void;
  onDeleteReview: (review: Review) => void;
  onToggleApproval: (review: Review) => void;
  showAlert: (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm', onConfirm?: () => void) => void;
  token?: string | null;
  apiHost?: string;
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
  reviews,
  isLoading,
  refreshing,
  onRefresh,
  onAddReview,
  onDeleteReview,
  onToggleApproval,
  showAlert,
  token,
  apiHost,
}: ReviewsScreenProps) {
  const [formVisible, setFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const { control, handleSubmit, reset, setValue, watch } = useForm<ReviewFormValues>({
    defaultValues: {
      name: '',
      message: '',
      stars: 5,
      location: '',
      instagramId: '',
      phone: '',
      email: '',
      image: '',
      video: '',
    },
  });

  const selectedStars = watch('stars');
  const selectedImage = watch('image');
  const selectedVideo = watch('video');

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setValue('image', result.assets[0].uri, { shouldDirty: true, shouldValidate: true });
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick image from device.', 'error');
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setValue('video', result.assets[0].uri, { shouldDirty: true, shouldValidate: true });
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick video from device.', 'error');
    }
  };

  const approvedCount = useMemo(() => reviews.filter(r => r.approved).length, [reviews]);
  const pendingCount = useMemo(() => reviews.filter(r => !r.approved).length, [reviews]);

  // Filter reviews by activeFilter, search query across name, message, location, and instagramId
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'approved' && rev.approved) ||
        (activeFilter === 'pending' && !rev.approved);
      if (!matchesFilter) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        rev.name.toLowerCase().includes(q) ||
        rev.message.toLowerCase().includes(q) ||
        (rev.location && rev.location.toLowerCase().includes(q)) ||
        (rev.phone && rev.phone.toLowerCase().includes(q)) ||
        (rev.instagramId && rev.instagramId.toLowerCase().includes(q))
      );
    });
  }, [reviews, searchQuery, activeFilter]);

  const onFormSubmit = async (data: ReviewFormValues) => {
    let uploadedImageUrl: string | null = null;
    let uploadedVideoUrl: string | null = null;

    try {
      if (data.image) {
        uploadedImageUrl = await uploadMediaAsset(data.image, { token, apiHost });
      }
      if (data.video) {
        uploadedVideoUrl = await uploadMediaAsset(data.video, { token, apiHost });
      }
    } catch (error) {
      showAlert('Upload Error', 'Failed to upload review media assets. Please try again.', 'error');
      return;
    }

    onAddReview({
      name: data.name.trim(),
      message: data.message.trim(),
      stars: data.stars,
      location: data.location.trim() || null,
      instagramId: data.instagramId.trim() || null,
      phone: data.phone.trim() || null,
      email: data.email.trim() || null,
      image: uploadedImageUrl,
      video: uploadedVideoUrl,
      approved: true,
    });

    reset();
    setFormVisible(false);
  };

  return (
    <View style={styles.container}>
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
          onPress={() => setFormVisible(true)} 
          style={styles.addButton}
          accessibilityLabel="Add Review"
          accessibilityRole="button"
        >
          <Plus size={14} color="#fff" />
          <Text style={styles.addButtonText}>Add Review</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs Chips */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          onPress={() => setActiveFilter('all')}
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
            All ({reviews.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter('approved')}
          style={[styles.filterChip, activeFilter === 'approved' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, activeFilter === 'approved' && styles.filterChipTextActive]}>
            Approved ({approvedCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter('pending')}
          style={[styles.filterChip, activeFilter === 'pending' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, activeFilter === 'pending' && styles.filterChipTextActive]}>
            Pending ({pendingCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      <ScrollView 
        contentContainerStyle={styles.scrollPadding}
        alwaysBounceVertical={true}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5E36"
              colors={['#FF5E36']}
              progressBackgroundColor="#ffffff"
            />
          ) : undefined
        }
      >
        {isLoading ? (
          <ReviewsSkeleton />
        ) : filteredReviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Reviews Found</Text>
            <Text style={styles.emptySubtitle}>
              {reviews.length === 0 
                ? "No reviews in the database yet. Tap '+ Add Review' to submit a review."
                : "No reviews match your filter or search query."}
            </Text>
          </View>
        ) : (
          filteredReviews.map(rev => (
            <View key={rev.id} style={styles.reviewCard}>
              {/* Header: Name & Stars */}
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <Text style={styles.reviewerName}>{rev.name}</Text>
                  <View style={styles.metaRow}>
                    {rev.location ? (
                      <View style={styles.metaItem}>
                        <MapPin size={10} color="#71717a" style={styles.metaIcon} />
                        <Text style={styles.metaText}>{rev.location}</Text>
                      </View>
                    ) : null}
                    {rev.createdAt ? (
                      <View style={[styles.metaItem, { marginLeft: rev.location ? 8 : 0 }]}>
                        <Clock size={10} color="#a1a1aa" style={styles.metaIcon} />
                        <Text style={styles.dateText}>
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={12} 
                      color={s <= rev.stars ? '#eab308' : '#e4e4e7'} 
                      fill={s <= rev.stars ? '#eab308' : 'none'} 
                      style={styles.starIcon}
                    />
                  ))}
                </View>
              </View>

              {/* Message */}
              <Text style={styles.reviewMessage}>"{rev.message}"</Text>

              {/* Image Preview if available */}
              {rev.image ? (
                <View style={styles.imageThumbnailContainer}>
                  <Image source={{ uri: rev.image }} style={styles.imageThumbnail} resizeMode="cover" />
                </View>
              ) : null}

              {/* Optional Badges / Attachments Indicators */}
              <View style={styles.attachmentsRow}>
                {rev.phone ? (
                  <View style={styles.badge}>
                    <Phone size={9} color="#71717a" style={styles.badgeIcon} />
                    <Text style={styles.badgeText}>{rev.phone}</Text>
                  </View>
                ) : null}
                {rev.instagramId ? (
                  <View style={styles.badge}>
                    <MessageSquare size={9} color="#71717a" style={styles.badgeIcon} />
                    <Text style={styles.badgeText}>@{rev.instagramId}</Text>
                  </View>
                ) : null}
                {rev.video ? (
                  <View style={[styles.badge, styles.successBadge]}>
                    <Video size={9} color="#059669" style={styles.badgeIcon} />
                    <Text style={[styles.badgeText, styles.successBadgeText]}>Video Attached</Text>
                  </View>
                ) : null}
              </View>

              {/* Footer Divider */}
              <View style={styles.cardDivider} />

              {/* Card Actions: Toggle Approval & Delete */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => onToggleApproval(rev)}
                  style={[
                    styles.statusBtn,
                    rev.approved ? styles.approvedBtn : styles.unapprovedBtn,
                  ]}
                  accessibilityLabel={`Toggle approval status: currently ${rev.approved ? 'Approved' : 'Pending'}`}
                  accessibilityRole="button"
                >
                  {rev.approved ? (
                    <Check size={11} color="#ffffff" style={styles.btnIcon} />
                  ) : (
                    <Clock size={11} color="#71717a" style={styles.btnIcon} />
                  )}
                  <Text
                    style={[
                      styles.statusBtnText,
                      rev.approved ? styles.approvedBtnText : styles.unapprovedBtnText,
                    ]}
                  >
                    {rev.approved ? 'Approved' : 'Pending'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => onDeleteReview(rev)} 
                  style={styles.deleteBtn}
                  accessibilityLabel={`Delete review by ${rev.name}`}
                  accessibilityRole="button"
                >
                  <Trash2 size={12} color="#dc2626" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Review Modal Form */}
      <Modal
        visible={formVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFormVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Customer Review</Text>
               <TouchableOpacity 
                 onPress={() => setFormVisible(false)} 
                 style={styles.closeBtn}
                 accessibilityLabel="Close modal"
                 accessibilityRole="button"
               >
                 <X size={16} color="#09090b" />
               </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
              {/* Star Rating Select */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Rating (Stars) <Text style={styles.requiredAsterisk}>*</Text></Text>
                <View style={styles.ratingSelectRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity 
                      key={s} 
                      onPress={() => setValue('stars', s, { shouldDirty: true })}
                      style={styles.starSelectBtn}
                      accessibilityLabel={`${s} Star${s > 1 ? 's' : ''}`}
                      accessibilityRole="button"
                    >
                      <Star 
                        size={24} 
                        color={s <= selectedStars ? '#eab308' : '#e4e4e7'} 
                        fill={s <= selectedStars ? '#eab308' : 'none'} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Name input */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Customer Name <Text style={styles.requiredAsterisk}>*</Text></Text>
                <Controller
                  control={control}
                  name="name"
                  rules={{ required: 'Customer name is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="e.g. Priya Sharma"
                      placeholderTextColor="#a1a1aa"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      style={styles.formInput}
                    />
                  )}
                />
              </View>

              {/* Message input */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Review Message <Text style={styles.requiredAsterisk}>*</Text></Text>
                <Controller
                  control={control}
                  name="message"
                  rules={{ required: 'Review message is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Review message detailing product quality, custom fits, and tailoring experience."
                      placeholderTextColor="#a1a1aa"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={4}
                      style={[styles.formInput, styles.textArea]}
                    />
                  )}
                />
              </View>

              <Text style={styles.optionalSectionHeader}>Optional Fields</Text>

              {/* Location */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Location</Text>
                <Controller
                  control={control}
                  name="location"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="e.g. Mumbai"
                      placeholderTextColor="#a1a1aa"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      style={styles.formInput}
                    />
                  )}
                />
              </View>

              {/* Instagram ID */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Instagram ID</Text>
                <Controller
                  control={control}
                  name="instagramId"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="e.g. priya_sharma"
                      placeholderTextColor="#a1a1aa"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      style={styles.formInput}
                      autoCapitalize="none"
                    />
                  )}
                />
              </View>

              {/* Phone */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="e.g. +91 98765 43210"
                      placeholderTextColor="#a1a1aa"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      keyboardType="phone-pad"
                      style={styles.formInput}
                    />
                  )}
                />
              </View>

              {/* Email */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="e.g. customer@example.com"
                      placeholderTextColor="#a1a1aa"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.formInput}
                    />
                  )}
                />
              </View>

              {/* Image Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Review Image</Text>
                {selectedImage ? (
                  <View style={styles.mediaPreviewContainer}>
                    <Text style={styles.mediaSelectedText} numberOfLines={1}>
                      {selectedImage.split('/').pop()}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setValue('image', '', { shouldDirty: true })}
                      style={styles.removeMediaBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Remove selected image"
                    >
                      <X size={14} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={pickImage} style={styles.mediaPickBtn}>
                    <ImageIcon size={16} color="#FF5E36" />
                    <Text style={styles.mediaPickBtnText}>Select Image from Device</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Video Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Review Video</Text>
                {selectedVideo ? (
                  <View style={styles.mediaPreviewContainer}>
                    <Text style={styles.mediaSelectedText} numberOfLines={1}>
                      {selectedVideo.split('/').pop()}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setValue('video', '', { shouldDirty: true })}
                      style={styles.removeMediaBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Remove selected video"
                    >
                      <X size={14} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={pickVideo} style={styles.mediaPickBtn}>
                    <Video size={16} color="#FF5E36" />
                    <Text style={styles.mediaPickBtnText}>Select Video from Device</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                onPress={() => { reset(); setFormVisible(false); }} 
                style={styles.cancelBtn}
                accessibilityLabel="Cancel submission"
                accessibilityRole="button"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSubmit(onFormSubmit)} 
                style={styles.saveBtn}
                accessibilityLabel="Submit review"
                accessibilityRole="button"
              >
                <Text style={styles.saveBtnText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

