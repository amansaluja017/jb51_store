import React from 'react';
import { View, Text, Switch } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import styles from '../../screens/ReviewsScreen.styles';

export interface ReviewsSuperAdminBannerProps {
  isSuperAdmin: boolean;
  mediaUploadsEnabled: boolean;
  onToggleMediaUploads: (val: boolean) => void;
}

export const ReviewsSuperAdminBanner: React.FC<ReviewsSuperAdminBannerProps> = ({
  isSuperAdmin,
  mediaUploadsEnabled,
  onToggleMediaUploads,
}) => {
  if (!isSuperAdmin) return null;

  return (
    <View style={styles.superadminBanner}>
      <View style={styles.superadminBannerLeft}>
        <View style={styles.superadminIconContainer}>
          <ShieldCheck size={14} color="#FF5E36" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.superadminTitleRow}>
            <Text style={styles.superadminBannerTitle}>Media Attachments</Text>
            <View
              style={[
                styles.superadminBadge,
                mediaUploadsEnabled ? styles.superadminBadgeActive : styles.superadminBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.superadminBadgeText,
                  mediaUploadsEnabled ? styles.superadminBadgeTextActive : styles.superadminBadgeTextInactive,
                ]}
              >
                {mediaUploadsEnabled ? 'ENABLED' : 'DISABLED'}
              </Text>
            </View>
          </View>
          <Text style={styles.superadminBannerSubtitle} numberOfLines={1}>
            {mediaUploadsEnabled
              ? 'Image & video fields unlocked for reviews'
              : 'Image & video fields locked for submissions'}
          </Text>
        </View>
      </View>
      <Switch
        value={mediaUploadsEnabled}
        onValueChange={onToggleMediaUploads}
        trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
        thumbColor="#ffffff"
        accessibilityRole="switch"
        accessibilityLabel="Toggle review media attachments"
      />
    </View>
  );
};

export default ReviewsSuperAdminBanner;

