import React from 'react';
import {
  View,
  Text,
  Switch,
} from 'react-native';
import styles from '../ProductFormModal.styles';

export interface ProductVisibilityTabProps {
  isListed: boolean;
  setIsListed: (val: boolean) => void;
  featured: boolean;
  setFeatured: (val: boolean) => void;
  newArrival: boolean;
  setNewArrival: (val: boolean) => void;
  bestseller: boolean;
  setBestseller: (val: boolean) => void;
}

export const ProductVisibilityTab: React.FC<ProductVisibilityTabProps> = ({
  isListed,
  setIsListed,
  featured,
  setFeatured,
  newArrival,
  setNewArrival,
  bestseller,
  setBestseller,
}) => {
  return (
    <View style={styles.tabContentContainer}>
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeaderTitle}>Boutique Display & Visibility</Text>
        <Text style={styles.cardHeaderSubtitle}>Configure storefront visibility and promotional tagging.</Text>

        <View style={styles.switchRowCard}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchTitle}>Visibility listed</Text>
            <Text style={styles.switchDesc}>Outfit is active and visible to client browsing.</Text>
          </View>
          <Switch
            value={isListed}
            onValueChange={setIsListed}
            trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.switchRowCard}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchTitle}>Featured on Homepage</Text>
            <Text style={styles.switchDesc}>Include this outfit in the home landing carousel.</Text>
          </View>
          <Switch
            value={featured}
            onValueChange={setFeatured}
            trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.switchRowCard}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchTitle}>New Arrivals Edit</Text>
            <Text style={styles.switchDesc}>Display tag and group in the New Collection list.</Text>
          </View>
          <Switch
            value={newArrival}
            onValueChange={setNewArrival}
            trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.switchRowCard}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchTitle}>Bestseller Label</Text>
            <Text style={styles.switchDesc}>Label with high popularity indicator flag.</Text>
          </View>
          <Switch
            value={bestseller}
            onValueChange={setBestseller}
            trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>
    </View>
  );
};

export default ProductVisibilityTab;
