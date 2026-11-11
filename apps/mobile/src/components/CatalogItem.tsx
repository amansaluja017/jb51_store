import React from 'react';
import { StyleSheet, Text, View, Image, Switch, TouchableOpacity } from 'react-native';
import { Edit3, Trash2, ImageOff, ChevronRight } from 'lucide-react-native';
import { Product } from '../types';
import { getOptimizedImageUrl, ImagePresets } from '../utils/cloudinary';
import { triggerHaptic } from '../utils/haptics';

interface CatalogItemProps {
  product: Product;
  onToggleStock: (product: Product) => void;
  onUpdateVisibility: (product: Product, status: 'listed' | 'unListed' | 'discontinued') => void;
  onEdit: (product: Product) => void;
  onDelete: (slug: string, name: string) => void;
  onViewDetails?: (product: Product) => void;
}

const formatCurrency = (val: number) => {
  return `₹${val.toLocaleString('en-IN')}`;
};

/** Derive whether the product is currently listed, unlisted, or discontinued. */
function getProductStatus(product: Product): 'listed' | 'unListed' | 'discontinued' {
  if (
    product.status === 'discontinued' ||
    product.isDiscontinued ||
    Boolean((product.features as { isDiscontinued?: boolean } | undefined)?.isDiscontinued)
  ) {
    return 'discontinued';
  }
  if (product.status === 'unListed' || product.isListed === false) {
    return 'unListed';
  }
  return 'listed';
}

function CatalogItem({
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
  const optimizedImageUri = imageUri ? getOptimizedImageUrl(imageUri, ImagePresets.card) : null;

  const currentStatus = getProductStatus(product);
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
        {optimizedImageUri ? (
          <Image
            source={{ uri: optimizedImageUri }}
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
          <View style={styles.categoryRow}>
            <Text style={styles.productCategoryText}>{product.category || 'Uncategorized'}</Text>
            {currentStatus === 'discontinued' ? (
              <View style={styles.discontinuedBadge}>
                <Text style={styles.discontinuedBadgeText}>DISCONTINUED</Text>
              </View>
            ) : currentStatus === 'unListed' ? (
              <View style={styles.unlistedBadge}>
                <Text style={styles.unlistedBadgeText}>UNLISTED</Text>
              </View>
            ) : null}
          </View>
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
          onValueChange={() => {
            triggerHaptic('selection');
            onToggleStock(product);
          }}
          trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
          thumbColor="#ffffff"
        />
      </View>

      {/* Separator */}
      <View style={styles.cardSeparator} />

      {/* Visibility 3-segment (Listed / Unlisted / Discontinued) + action buttons */}
      <View style={styles.actionRow}>
        <View style={styles.visibilityTogglePills}>
          <TouchableOpacity
            onPress={() => {
              if (currentStatus !== 'listed') {
                triggerHaptic('light');
                onUpdateVisibility(product, 'listed');
              }
            }}
            style={[styles.pillButton, currentStatus === 'listed' && styles.activePillListed]}
            accessibilityRole="button"
            accessibilityLabel="Set product as listed"
          >
            <Text style={[styles.pillText, currentStatus === 'listed' && styles.pillTextListed]}>Listed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (currentStatus !== 'unListed') {
                triggerHaptic('light');
                onUpdateVisibility(product, 'unListed');
              }
            }}
            style={[styles.pillButton, currentStatus === 'unListed' && styles.activePillUnlisted]}
            accessibilityRole="button"
            accessibilityLabel="Set product as unlisted"
          >
            <Text style={[styles.pillText, currentStatus === 'unListed' && styles.pillTextUnlisted]}>Unlisted</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (currentStatus !== 'discontinued') {
                triggerHaptic('warning');
                onUpdateVisibility(product, 'discontinued');
              }
            }}
            style={[styles.pillButton, currentStatus === 'discontinued' && styles.activePillDiscontinued]}
            accessibilityRole="button"
            accessibilityLabel="Set product as discontinued"
          >
            <Text style={[styles.pillText, currentStatus === 'discontinued' && styles.pillTextDiscontinued]}>Discontinued</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainButtons}>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              onEdit(product);
            }}
            style={styles.actionIconBtn}
          >
            <Edit3 size={14} color="#71717a" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('warning');
              onDelete(product.slug, product.name);
            }}
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
    flexWrap: 'wrap',
  },
  productCategoryText: {
    fontSize: 9,
    color: '#a1a1aa',
  },
  unlistedBadge: {
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  unlistedBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717a',
    letterSpacing: 0.3,
  },
  discontinuedBadge: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  discontinuedBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#e11d48',
    letterSpacing: 0.3,
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
    flexWrap: 'wrap',
    gap: 8,
  },
  visibilityTogglePills: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pillButton: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#ffffff',
  },
  activePillListed: {
    backgroundColor: '#ecfdf5',
  },
  activePillUnlisted: {
    backgroundColor: '#f4f4f5',
  },
  activePillDiscontinued: {
    backgroundColor: '#fff1f2',
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
  pillTextDiscontinued: {
    color: '#e11d48',
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

export default React.memo(CatalogItem);
