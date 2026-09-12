import React from 'react';
import { StyleSheet, Text, View, Image, Switch, TouchableOpacity } from 'react-native';
import { Edit3, Trash2, ImageOff, ChevronRight } from 'lucide-react-native';
import { Product } from '../types';

interface CatalogItemProps {
  product: Product;
  onToggleStock: (product: Product) => void;
  onUpdateVisibility: (product: Product, status: 'listed' | 'unListed') => void;
  onEdit: (product: Product) => void;
  onDelete: (slug: string, name: string) => void;
  onViewDetails?: (product: Product) => void;
}

const formatCurrency = (val: number) => {
  return `₹${val.toLocaleString('en-IN')}`;
};

/** Derive whether the product is currently listed. */
function isListed(product: Product): boolean {
  if (product.status) return product.status === 'listed';
  return product.isListed !== false;
}

export default function CatalogItem({
  product,
  onToggleStock,
  onUpdateVisibility,
  onEdit,
  onDelete,
  onViewDetails,
}: CatalogItemProps) {
  const variants = product.variants || [];
  const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  const isOutOfStock = product.inStock === false || (variants.length > 0 && totalStock === 0);
  const rawImage = product.images && product.images.length > 0 ? product.images[0] : null;
  const imageUri = rawImage && typeof rawImage === 'string' && rawImage.trim() !== '' ? rawImage.trim() : null;

  const listed = isListed(product);
  const sellingPrice = product.sellingPrice ?? product.price ?? 0;
  const mrp = product.mrp ?? product.price ?? 0;
  const hasDiscount = mrp > sellingPrice;
  const discountPercent = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  return (
    <View style={styles.catalogCard}>
      {/* Thumb details - Clickable to open Product Details */}
      <TouchableOpacity
        style={styles.productRow}
        onPress={() => onViewDetails?.(product)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${product.name}`}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.productThumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productThumbnail, styles.noImageThumbnail]}>
            <ImageOff size={20} color="#a1a1aa" />
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        <View style={styles.productMeta}>
          <Text style={styles.productNameText} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.productCategoryText}>{product.category || 'Uncategorized'}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPriceText}>{formatCurrency(sellingPrice)}</Text>
            {hasDiscount && (
              <>
                <Text style={styles.mrpText}>{formatCurrency(mrp)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
                </View>
              </>
            )}
          </View>
        </View>
        <View style={styles.chevronWrapper}>
          <ChevronRight size={16} color="#a1a1aa" />
        </View>
      </TouchableOpacity>

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

      {/* Visibility 2-segment + action buttons */}
      <View style={styles.actionRow}>
        <View style={styles.visibilityTogglePills}>
          <TouchableOpacity
            onPress={() => { if (!listed) onUpdateVisibility(product, 'listed'); }}
            style={[styles.pillButton, listed && styles.activePillListed]}
            accessibilityRole="button"
            accessibilityLabel="Set product as listed"
          >
            <Text style={[styles.pillText, listed && styles.pillTextListed]}>Listed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { if (listed) onUpdateVisibility(product, 'unListed'); }}
            style={[styles.pillButton, !listed && styles.activePillUnlisted]}
            accessibilityRole="button"
            accessibilityLabel="Set product as unlisted"
          >
            <Text style={[styles.pillText, !listed && styles.pillTextUnlisted]}>Unlisted</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainButtons}>
          <TouchableOpacity onPress={() => onEdit(product)} style={styles.actionIconBtn}>
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
    alignItems: 'center',
    gap: 12,
  },
  chevronWrapper: {
    paddingLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productThumbnail: {
    width: 60,
    height: 80,
    backgroundColor: '#f4f4f5',
    borderRadius: 12,
  },
  noImageThumbnail: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderStyle: 'dashed',
    gap: 4,
  },
  noImageText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#a1a1aa',
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  productPriceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF5E36',
  },
  mrpText: {
    fontSize: 10,
    color: '#a1a1aa',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
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
    paddingHorizontal: 14,
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
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  pillTextListed: {
    color: '#059669',
  },
  pillTextUnlisted: {
    color: '#52525b',
  },
  mainButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
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
