import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Star, Trash2, Check, X, Plus, MapPin, Phone, MessageSquare, Video, Image as ImageIcon } from 'lucide-react-native';
import { Review } from '../types';

interface ReviewsScreenProps {
  reviews: Review[];
  isLoading: boolean;
  onAddReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'>) => void;
  onDeleteReview: (review: Review) => void;
  showAlert: (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm', onConfirm?: () => void) => void;
}

export default function ReviewsScreen({
  reviews,
  isLoading,
  onAddReview,
  onDeleteReview,
  showAlert
}: ReviewsScreenProps) {
  const [formVisible, setFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Field States
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [stars, setStars] = useState(5);
  const [location, setLocation] = useState('');
  const [instagramId, setInstagramId] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');
  const [video, setVideo] = useState('');

  // Filter reviews by name or message
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => 
      rev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rev.location && rev.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [reviews, searchQuery]);

  const handleSubmit = () => {
    if (!name.trim()) {
      showAlert('Required Field', 'Name is required.', 'error');
      return;
    }
    if (!message.trim()) {
      showAlert('Required Field', 'Message is required.', 'error');
      return;
    }

    onAddReview({
      name: name.trim(),
      message: message.trim(),
      stars,
      location: location.trim() || null,
      instagramId: instagramId.trim() || null,
      phone: phone.trim() || null,
      image: image.trim() || null,
      video: video.trim() || null,
    });

    // Reset Form
    setName('');
    setMessage('');
    setStars(5);
    setLocation('');
    setInstagramId('');
    setPhone('');
    setImage('');
    setVideo('');
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

      {/* Reviews List */}
      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF5E36" style={styles.loader} />
        ) : filteredReviews.length === 0 ? (
          <Text style={styles.emptyLabel}>No reviews found.</Text>
        ) : (
          filteredReviews.map(rev => (
            <View key={rev.id} style={styles.reviewCard}>
              {/* Header: Name & Stars */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.reviewerName}>{rev.name}</Text>
                  {rev.location && (
                    <View style={styles.metaRow}>
                      <MapPin size={10} color="#71717a" style={styles.metaIcon} />
                      <Text style={styles.metaText}>{rev.location}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={11} 
                      color={s <= rev.stars ? '#eab308' : '#e4e4e7'} 
                      fill={s <= rev.stars ? '#eab308' : 'none'} 
                      style={styles.starIcon}
                    />
                  ))}
                </View>
              </View>

              {/* Message */}
              <Text style={styles.reviewMessage}>"{rev.message}"</Text>

              {/* Optional Badges / Attachments Indicators */}
              <View style={styles.attachmentsRow}>
                {rev.instagramId && (
                  <View style={styles.badge}>
                    <MessageSquare size={9} color="#71717a" style={styles.badgeIcon} />
                    <Text style={styles.badgeText}>@{rev.instagramId}</Text>
                  </View>
                )}
                {rev.phone && (
                  <View style={styles.badge}>
                    <Phone size={9} color="#71717a" style={styles.badgeIcon} />
                    <Text style={styles.badgeText}>{rev.phone}</Text>
                  </View>
                )}
                {rev.image && (
                  <View style={[styles.badge, styles.successBadge]}>
                    <ImageIcon size={9} color="#059669" style={styles.badgeIcon} />
                    <Text style={[styles.badgeText, styles.successBadgeText]}>Image Attached</Text>
                  </View>
                )}
                {rev.video && (
                  <View style={[styles.badge, styles.successBadge]}>
                    <Video size={9} color="#059669" style={styles.badgeIcon} />
                    <Text style={[styles.badgeText, styles.successBadgeText]}>Video Attached</Text>
                  </View>
                )}
              </View>

              {/* Footer Divider */}
              <View style={styles.cardDivider} />

              {/* Card Actions: Delete button */}
              <View style={styles.cardActions}>
                <View />
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
                      onPress={() => setStars(s)}
                      style={styles.starSelectBtn}
                      accessibilityLabel={`${s} Star${s > 1 ? 's' : ''}`}
                      accessibilityRole="button"
                    >
                      <Star 
                        size={24} 
                        color={s <= stars ? '#eab308' : '#e4e4e7'} 
                        fill={s <= stars ? '#eab308' : 'none'} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Name input */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Customer Name <Text style={styles.requiredAsterisk}>*</Text></Text>
                <TextInput
                  placeholder="e.g. Priya Sharma"
                  placeholderTextColor="#a1a1aa"
                  value={name}
                  onChangeText={setName}
                  style={styles.formInput}
                />
              </View>

              {/* Message input */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Review Message <Text style={styles.requiredAsterisk}>*</Text></Text>
                <TextInput
                  placeholder="Review message detailing product quality, custom fits, and tailoring experience."
                  placeholderTextColor="#a1a1aa"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                  style={[styles.formInput, styles.textArea]}
                />
              </View>

              <Text style={styles.optionalSectionHeader}>Optional Fields</Text>

              {/* Location */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Location</Text>
                <TextInput
                  placeholder="e.g. Mumbai"
                  placeholderTextColor="#a1a1aa"
                  value={location}
                  onChangeText={setLocation}
                  style={styles.formInput}
                />
              </View>

              {/* Instagram ID */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Instagram ID</Text>
                <TextInput
                  placeholder="e.g. priya_sharma"
                  placeholderTextColor="#a1a1aa"
                  value={instagramId}
                  onChangeText={setInstagramId}
                  style={styles.formInput}
                  autoCapitalize="none"
                />
              </View>

              {/* Phone */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <TextInput
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor="#a1a1aa"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.formInput}
                />
              </View>

              {/* Image URL */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Image URL</Text>
                <TextInput
                  placeholder="e.g. https://unsplash.com/photo.jpg"
                  placeholderTextColor="#a1a1aa"
                  value={image}
                  onChangeText={setImage}
                  style={styles.formInput}
                  autoCapitalize="none"
                />
              </View>

              {/* Video URL */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Video URL</Text>
                <TextInput
                  placeholder="e.g. https://example.com/video.mp4"
                  placeholderTextColor="#a1a1aa"
                  value={video}
                  onChangeText={setVideo}
                  style={styles.formInput}
                  autoCapitalize="none"
                />
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                onPress={() => setFormVisible(false)} 
                style={styles.cancelBtn}
                accessibilityLabel="Cancel submission"
                accessibilityRole="button"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSubmit} 
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
  scrollPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 40,
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
});
