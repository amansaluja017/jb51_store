import React from 'react';
import { StyleSheet, Text, View, Image, Switch, TouchableOpacity } from 'react-native';
import { Edit3, Trash2 } from 'lucide-react-native';
import { Product } from '../types';

interface CatalogItemProps {
  product: Product;
  onToggleStock: (product: Product) => void;
  onUpdateVisibility: (product: Product, status: boolean) => void;
  onEdit: (product: Product) => void;
  onDelete: (slug: string, name: string) => void;
}

const formatCurrency = (val: number) => {
  return `₹${val.toLocaleString('en-IN')}`;
};

export default function CatalogItem({
  product,
  onToggleStock,
  onUpdateVisibility,
  onEdit,
  onDelete
}: CatalogItemProps) {
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const isOutOfStock = product.inStock === false || (product.variants.length > 0 && totalStock === 0);

  return (
    <View style={styles.catalogCard}>
      {/* Thumb details */}
      <View style={styles.productRow}>
        <Image 
          source={{ uri: product.images[0] }} 
          style={styles.productThumbnail}
          resizeMode="cover"
        />
        <View style={styles.productMeta}>
          <Text style={styles.productNameText}>{product.name}</Text>
          <Text style={styles.productCategoryText}>{product.category}</Text>
          <Text style={styles.productPriceText}>{formatCurrency(product.price)}</Text>
        </View>
      </View>

      {/* Separator */}
      <View style={styles.cardSeparator} />

      {/* Stock Toggle Switch row */}
      <View style={styles.controlRow}>
        <View style={styles.controlLabelGroup}>
          <Text style={[styles.controlStateText, isOutOfStock ? styles.stateOOS : styles.stateIS]}>
            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
          </Text>
          <Text style={styles.controlSubText}>{totalStock} units total</Text>
        </View>
        <Switch 
          value={!isOutOfStock}
          onValueChange={() => onToggleStock(product)}
          trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
          thumbColor="#ffffff"
        />
      </View>

      {/* Separator */}
      <View style={styles.cardSeparator} />

      {/* Visibility toggler & action row */}
      <View style={styles.actionRow}>
        <View style={styles.visibilityTogglePills}>
          <TouchableOpacity 
            onPress={() => onUpdateVisibility(product, true)}
            style={[styles.pillButton, product.isListed !== false && styles.activePillListed]}
          >
            <Text style={[styles.pillText, product.isListed !== false && styles.activePillText]}>Listed</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onUpdateVisibility(product, false)}
            style={[styles.pillButton, product.isListed === false && styles.activePillUnlisted]}
          >
            <Text style={[styles.pillText, product.isListed === false && styles.activePillText]}>Unlisted</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainButtons}>
          <TouchableOpacity 
            onPress={() => onEdit(product)} 
            style={styles.actionIconBtn}
          >
            <Edit3 size={14} color="#71717a" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onDelete(product.slug, product.name)} 
            style={[styles.actionIconBtn, styles.deleteBtnBorder]}
          >
            <Trash2 size={14} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  catalogCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
  },
  productThumbnail: {
    width: 60,
    height: 80,
    backgroundColor: '#f4f4f5',
    borderRadius: 12,
  },
  productMeta: {
    justifyContent: 'center',
    flex: 1,
  },
  productNameText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#09090b',
  },
  productCategoryText: {
    fontSize: 9,
    color: '#a1a1aa',
    marginTop: 3,
  },
  productPriceText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF5E36',
    marginTop: 6,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginVertical: 12,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabelGroup: {
    gap: 2,
  },
  controlStateText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stateIS: {
    color: '#10b981',
  },
  stateOOS: {
    color: '#ef4444',
  },
  controlSubText: {
    fontSize: 9,
    color: '#71717a',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visibilityTogglePills: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#ffffff',
  },
  activePillListed: {
    backgroundColor: '#ecfdf5',
  },
  activePillUnlisted: {
    backgroundColor: '#f4f4f5',
  },
  pillText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#71717a',
  },
  activePillText: {
    color: '#09090b',
  },
  mainButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  deleteBtnBorder: {
    borderColor: '#fecaca',
  },
});
