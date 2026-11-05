import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Keyboard,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Star,
  StarHalf,
  X,
  Image as ImageIcon,
  Video,
} from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { Review } from '../../types';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';
import styles from '../../screens/ReviewsScreen.styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

export interface ReviewFormModalProps {
  visible: boolean;
  editingReview: Review | null;
  mediaUploadsEnabled: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormValues) => Promise<void>;
  showAlert: (
    title: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  visible,
  editingReview,
  mediaUploadsEnabled,
  onClose,
  onSubmit,
  showAlert,
}) => {
  const keyboardHeight = useKeyboardHeight();
  const formScrollRef = useRef<ScrollView>(null);
  const fieldOffsets = useRef<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (visible) {
      if (editingReview) {
        reset({
          name: editingReview.name || '',
          message: editingReview.message || '',
          stars: Number(editingReview.stars) || 5,
          location: editingReview.location || '',
          instagramId: editingReview.instagramId || '',
          phone: editingReview.phone || '',
          email: editingReview.email || '',
          image: editingReview.image || '',
          video: editingReview.video || '',
        });
      } else {
        reset({
          name: '',
          message: '',
          stars: 5,
          location: '',
          instagramId: '',
          phone: '',
          email: '',
          image: '',
          video: '',
        });
      }
    }
  }, [visible, editingReview, reset]);

  const handleFieldFocus = (fieldName: string) => {
    setTimeout(() => {
      const y = fieldOffsets.current[fieldName];
      if (typeof y === 'number' && formScrollRef.current) {
        formScrollRef.current.scrollTo({ y: Math.max(0, y - 40), animated: true });
      }
    }, 150);
  };

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
    } catch {
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
    } catch {
      showAlert('Error', 'Failed to pick video from device.', 'error');
    }
  };

  const onFormSubmitInternal = async (data: ReviewFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentVal = Number(selectedStars) || 5;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingReview ? 'Edit Review' : 'Add Customer Review'}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close review form"
              >
                <X size={20} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              ref={formScrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={[
                styles.formContainer,
                keyboardHeight > 0 && { paddingBottom: keyboardHeight + 40 },
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              {/* Star Rating Select with Decimal Support */}
              <View style={styles.formGroup}>
                <View style={styles.ratingHeaderRow}>
                  <Text style={styles.fieldLabel}>
                    Rating (Stars) <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.ratingScoreBadge}>
                    <Star size={12} color="#eab308" fill="#eab308" />
                    <Text style={styles.ratingScoreBadgeText}>{currentVal.toFixed(1)} / 5.0</Text>
                  </View>
                </View>

                <View style={styles.ratingControlsRow}>
                  <View style={styles.ratingSelectRow}>
                    {[1, 2, 3, 4, 5].map((s) => {
                      const isFull = currentVal >= s;
                      const isHalf = !isFull && currentVal >= s - 0.5;

                      const handlePressStar = () => {
                        if (currentVal === s) {
                          setValue('stars', s - 0.5, { shouldDirty: true, shouldValidate: true });
                        } else if (currentVal === s - 0.5) {
                          setValue('stars', s, { shouldDirty: true, shouldValidate: true });
                        } else {
                          setValue('stars', s, { shouldDirty: true, shouldValidate: true });
                        }
                      };

                      return (
                        <TouchableOpacity
                          key={s}
                          onPress={handlePressStar}
                          style={styles.starSelectBtn}
                          accessibilityLabel={`Rate ${s} Star${s > 1 ? 's' : ''}`}
                          accessibilityRole="button"
                        >
                          {isHalf ? (
                            <StarHalf size={26} color="#eab308" fill="#eab308" />
                          ) : (
                            <Star
                              size={26}
                              color={isFull ? '#eab308' : '#e4e4e7'}
                              fill={isFull ? '#eab308' : 'none'}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Direct Decimal Number Input */}
                  <View style={styles.decimalInputContainer}>
                    <TextInput
                      keyboardType="numeric"
                      value={String(selectedStars ?? '')}
                      onChangeText={(val) => {
                        const sanitized = val.replace(/[^0-9.]/g, '');
                        if (sanitized === '') {
                          setValue('stars', 0, { shouldDirty: true });
                          return;
                        }
                        const num = parseFloat(sanitized);
                        if (!isNaN(num)) {
                          const clamped = Math.min(5, Math.max(0, num));
                          setValue('stars', clamped, { shouldDirty: true, shouldValidate: true });
                        }
                      }}
                      placeholder="5.0"
                      placeholderTextColor="#a1a1aa"
                      style={styles.decimalInput}
                      maxLength={4}
                      accessibilityLabel="Decimal rating input"
                    />
                    <Text style={styles.decimalInputSuffix}>★</Text>
                  </View>
                </View>

                {/* Quick Decimal Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.quickRatingsScroll}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((ratingVal) => {
                      const isActive = Number(selectedStars) === ratingVal;
                      return (
                        <TouchableOpacity
                          key={ratingVal}
                          onPress={() =>
                            setValue('stars', ratingVal, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          style={[
                            styles.quickRatingChip,
                            isActive && styles.quickRatingChipActive,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`Quick select rating ${ratingVal.toFixed(1)}`}
                        >
                          <Text
                            style={[
                              styles.quickRatingChipText,
                              isActive && styles.quickRatingChipTextActive,
                            ]}
                          >
                            {ratingVal.toFixed(1)} ★
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {/* Name input */}
              <View
                style={styles.formGroup}
                onLayout={(e) => {
                  fieldOffsets.current['name'] = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.fieldLabel}>
                  Customer Name <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
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
                      onFocus={() => handleFieldFocus('name')}
                      onChangeText={onChange}
                      style={styles.formInput}
                    />
                  )}
                />
              </View>

              {/* Message input */}
              <View
                style={styles.formGroup}
                onLayout={(e) => {
                  fieldOffsets.current['message'] = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.fieldLabel}>
                  Review Message <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="message"
                  rules={{ required: 'Review message is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Share customer's words, feedback on fit, fabric..."
                      placeholderTextColor="#a1a1aa"
                      value={value}
                      onBlur={onBlur}
                      onFocus={() => handleFieldFocus('message')}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={3}
                      style={[styles.formInput, styles.textArea]}
                    />
                  )}
                />
              </View>

              {/* Optional Section Divider */}
              <Text style={styles.optionalSectionHeader}>Additional Details</Text>

              {/* Location */}
              <View
                style={styles.formGroup}
                onLayout={(e) => {
                  fieldOffsets.current['location'] = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.fieldLabel}>Location (City / State)</Text>
                <Controller
                  control={control}
                  name="location"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="e.g. Mumbai, Maharashtra"
                      placeholderTextColor="#a1a1aa"
                      value={value}
                      onBlur={onBlur}
                      onFocus={() => handleFieldFocus('location')}
                      onChangeText={onChange}
                      style={styles.formInput}
                    />
                  )}
                />
              </View>

              {/* Instagram Handle */}
              <View
                style={styles.formGroup}
                onLayout={(e) => {
                  fieldOffsets.current['instagramId'] = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.fieldLabel}>Instagram Handle</Text>
                <Controller
                  control={control}
                  name="instagramId"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="e.g. priya_couture"
                      placeholderTextColor="#a1a1aa"
                      value={value}
                      onBlur={onBlur}
                      onFocus={() => handleFieldFocus('instagramId')}
                      onChangeText={onChange}
                      autoCapitalize="none"
                      style={styles.formInput}
                    />
                  )}
                />
              </View>

              {/* Phone */}
              <View
                style={styles.formGroup}
                onLayout={(e) => {
                  fieldOffsets.current['phone'] = e.nativeEvent.layout.y;
                }}
              >
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
                      onFocus={() => handleFieldFocus('phone')}
                      onChangeText={onChange}
                      keyboardType="phone-pad"
                      style={styles.formInput}
                    />
                  )}
                />
              </View>

              {/* Email */}
              <View
                style={styles.formGroup}
                onLayout={(e) => {
                  fieldOffsets.current['email'] = e.nativeEvent.layout.y;
                }}
              >
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
                      onFocus={() => handleFieldFocus('email')}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.formInput}
                    />
                  )}
                />
              </View>

              {/* Image Picker */}
              <View style={[styles.formGroup, !mediaUploadsEnabled && { opacity: 0.6 }]}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <Text style={styles.fieldLabel}>Review Image</Text>
                  {!mediaUploadsEnabled && (
                    <Text style={{ fontSize: 11, color: '#71717a', fontStyle: 'italic' }}>
                      Disabled for now
                    </Text>
                  )}
                </View>
                {selectedImage ? (
                  <View
                    style={[
                      styles.mediaPreviewContainer,
                      !mediaUploadsEnabled && {
                        backgroundColor: '#f4f4f5',
                        borderColor: '#e4e4e7',
                      },
                    ]}
                  >
                    <Text
                      style={[styles.mediaSelectedText, !mediaUploadsEnabled && { color: '#71717a' }]}
                      numberOfLines={1}
                    >
                      {selectedImage.split('/').pop()}
                    </Text>
                    {mediaUploadsEnabled && (
                      <TouchableOpacity
                        onPress={() => setValue('image', '', { shouldDirty: true })}
                        style={styles.removeMediaBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Remove selected image"
                      >
                        <X size={14} color="#dc2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    disabled={!mediaUploadsEnabled}
                    onPress={mediaUploadsEnabled ? pickImage : undefined}
                    style={[
                      styles.mediaPickBtn,
                      !mediaUploadsEnabled && {
                        backgroundColor: '#f4f4f5',
                        borderColor: '#e4e4e7',
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={
                      mediaUploadsEnabled ? 'Select image from device' : 'Review image upload disabled'
                    }
                  >
                    <ImageIcon size={16} color={mediaUploadsEnabled ? '#FF5E36' : '#a1a1aa'} />
                    <Text
                      style={[
                        styles.mediaPickBtnText,
                        !mediaUploadsEnabled && { color: '#a1a1aa' },
                      ]}
                    >
                      {mediaUploadsEnabled ? 'Select Image from Device' : 'Image upload disabled'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Video Picker */}
              <View style={[styles.formGroup, !mediaUploadsEnabled && { opacity: 0.6 }]}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <Text style={styles.fieldLabel}>Review Video</Text>
                  {!mediaUploadsEnabled && (
                    <Text style={{ fontSize: 11, color: '#71717a', fontStyle: 'italic' }}>
                      Disabled for now
                    </Text>
                  )}
                </View>
                {selectedVideo ? (
                  <View
                    style={[
                      styles.mediaPreviewContainer,
                      !mediaUploadsEnabled && {
                        backgroundColor: '#f4f4f5',
                        borderColor: '#e4e4e7',
                      },
                    ]}
                  >
                    <Text
                      style={[styles.mediaSelectedText, !mediaUploadsEnabled && { color: '#71717a' }]}
                      numberOfLines={1}
                    >
                      {selectedVideo.split('/').pop()}
                    </Text>
                    {mediaUploadsEnabled && (
                      <TouchableOpacity
                        onPress={() => setValue('video', '', { shouldDirty: true })}
                        style={styles.removeMediaBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Remove selected video"
                      >
                        <X size={14} color="#dc2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    disabled={!mediaUploadsEnabled}
                    onPress={mediaUploadsEnabled ? pickVideo : undefined}
                    style={[
                      styles.mediaPickBtn,
                      !mediaUploadsEnabled && {
                        backgroundColor: '#f4f4f5',
                        borderColor: '#e4e4e7',
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={
                      mediaUploadsEnabled ? 'Select video from device' : 'Review video upload disabled'
                    }
                  >
                    <Video size={16} color={mediaUploadsEnabled ? '#FF5E36' : '#a1a1aa'} />
                    <Text
                      style={[
                        styles.mediaPickBtnText,
                        !mediaUploadsEnabled && { color: '#a1a1aa' },
                      ]}
                    >
                      {mediaUploadsEnabled ? 'Select Video from Device' : 'Video upload disabled'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelBtn}
                accessibilityLabel="Cancel submission"
                accessibilityRole="button"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit(onFormSubmitInternal)}
                disabled={isSubmitting}
                style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]}
                accessibilityLabel={editingReview ? 'Save review changes' : 'Submit review'}
                accessibilityRole="button"
              >
                <Text style={styles.saveBtnText}>
                  {editingReview ? 'Save Changes' : 'Submit Review'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default ReviewFormModal;

