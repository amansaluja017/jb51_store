import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: '#09090b',
  },
  addButton: {
    backgroundColor: '#FF5E36',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    paddingHorizontal: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  filterChipActive: {
    backgroundColor: '#FF5E36',
    borderColor: '#FF5E36',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#71717a',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyLabel: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#09090b',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaIcon: {
    marginRight: 3,
  },
  metaText: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: '500',
  },
  starRow: {
    flexDirection: 'row',
  },
  starIcon: {
    marginLeft: 1.5,
  },
  reviewMessage: {
    fontSize: 12,
    color: '#3f3f46',
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  attachmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 9,
    color: '#71717a',
    fontWeight: 'bold',
  },
  successBadge: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  successBadgeText: {
    color: '#065f46',
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: '500',
  },
  imageThumbnailContainer: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f4f4f5',
    maxHeight: 180,
  },
  imageThumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  approvedBtn: {
    backgroundColor: '#FF5E36',
  },
  unapprovedBtn: {
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  btnIcon: {
    marginRight: 4,
  },
  statusBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  approvedBtnText: {
    color: '#ffffff',
  },
  unapprovedBtnText: {
    color: '#71717a',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deleteBtnText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#09090b',
  },
  closeBtn: {
    padding: 4,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#dc2626',
  },
  ratingSelectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starSelectBtn: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  formInput: {
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#09090b',
    fontWeight: '500',
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  optionalSectionHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FF5E36',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    paddingBottom: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#e4e4e7',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#09090b',
  },
  saveBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FF5E36',
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  mediaPickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7f5',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FF5E36',
    borderRadius: 10,
    height: 48,
    gap: 8,
  },
  mediaPickBtnText: {
    color: '#FF5E36',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
  },
  mediaSelectedText: {
    fontSize: 11,
    color: '#09090b',
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  removeMediaBtn: {
    padding: 6,
  },
});
