import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Switch,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Edit3,
  ImageOff,
  Sparkles,
  Award,
  Star,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  FileText,
  Scissors,
  Tag,
  Calendar,
  Hash,
} from 'lucide-react-native';
import { Product, isProductInStock } from '../types';

interface ProductDetailsModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onToggleStock?: (product: Product) => void;
  onUpdateVisibility?: (product: Product, status: 'listed' | 'unListed') => void;
}

const formatCurrency = (val: number) => {
  return `₹${val.toLocaleString('en-IN')}`;
};

const getColorHex = (colorName?: string, explicitHex?: string): string => {
  if (explicitHex && explicitHex.trim()) {
    return explicitHex.trim();
  }
  if (!colorName) return '#e4e4e7';
  const name = colorName.toLowerCase();
  if (name.includes('ivory') || name.includes('white') || name.includes('cream')) return '#FAF8F5';
  if (name.includes('black') || name.includes('noir')) return '#18181b';
  if (name.includes('red') || name.includes('crimson') || name.includes('maroon') || name.includes('ruby')) return '#9E1B32';
  if (name.includes('green') || name.includes('emerald') || name.includes('olive') || name.includes('mint')) return '#0B6623';
  if (name.includes('blue') || name.includes('navy') || name.includes('royal') || name.includes('indigo')) return '#1E3A8A';
  if (name.includes('yellow') || name.includes('gold') || name.includes('mustard')) return '#D97706';
  if (name.includes('pink') || name.includes('rose') || name.includes('blush') || name.includes('magenta')) return '#DB2777';
  if (name.includes('purple') || name.includes('violet') || name.includes('lavender') || name.includes('plum')) return '#7C3AED';
  if (name.includes('orange') || name.includes('rust') || name.includes('peach') || name.includes('terracotta')) return '#EA580C';
  if (name.includes('brown') || name.includes('beige') || name.includes('tan') || name.includes('camel')) return '#854D0E';
  if (name.includes('grey') || name.includes('gray') || name.includes('silver') || name.includes('charcoal')) return '#71717A';
  return '#e4e4e7';
};

export default function ProductDetailsModal({
  visible,
  product,
  onClose,
  onEdit,
  onToggleStock,
  onUpdateVisibility,
}: ProductDetailsModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Reset selected image whenever product changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id, product?.slug]);

  if (!product) return null;

  // Gather all unique images (main images + variant images)
  const mainImages = product.images || [];
  const variantImages = (product.variants || []).flatMap(v => v.images || []);
  const allImages = Array.from(new Set([...mainImages, ...variantImages])).filter(
    img => typeof img === 'string' && img.trim() !== ''
  );

  const activeImageUri = allImages[selectedImageIndex] || allImages[0] || null;

  const variants = product.variants || [];
  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  const totalReserved = variants.reduce((acc, v) => acc + (Number(v.reservedStock) || 0), 0);
  const inStock = isProductInStock(product);
  const isListed = product.status ? product.status === 'listed' : product.isListed !== false;

  const sellingPrice = product.sellingPrice ?? product.price ?? 0;
  const mrp = product.mrp ?? product.price ?? 0;
  const hasDiscount = mrp > sellingPrice;
  const discountPercent = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  const formattedDate = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalShell}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.headerIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Close product details"
          >
            <X size={20} color="#09090b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Product Details
          </Text>
          <TouchableOpacity
            onPress={() => onEdit(product)}
            style={styles.headerEditBtn}
            accessibilityRole="button"
            accessibilityLabel="Edit product"
          >
            <Edit3 size={15} color="#FF5E36" />
            <Text style={styles.headerEditText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Gallery */}
          <View style={styles.galleryContainer}>
            {activeImageUri ? (
              <View style={styles.mainImageWrapper}>
                <Image
                  source={{ uri: activeImageUri }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
                {allImages.length > 1 && (
                  <View style={styles.galleryCounter}>
                    <Text style={styles.galleryCounterText}>
                      {selectedImageIndex + 1} / {allImages.length}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={[styles.mainImageWrapper, styles.noImageWrapper]}>
                <ImageOff size={40} color="#a1a1aa" />
                <Text style={styles.noImageText}>No Product Images</Text>
              </View>
            )}

            {/* Thumbnails strip */}
            {allImages.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailStrip}
              >
                {allImages.map((uri, idx) => {
                  const isSelected = idx === selectedImageIndex;
                  return (
                    <TouchableOpacity
                      key={`thumb_${idx}`}
                      onPress={() => setSelectedImageIndex(idx)}
                      style={[
                        styles.thumbnailItem,
                        isSelected && styles.thumbnailItemSelected,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri }} style={styles.thumbnailImage} resizeMode="cover" />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Title & Badges Section */}
          <View style={styles.card}>
            <View style={styles.categoryRow}>
              <View style={styles.categoryPill}>
                <Tag size={12} color="#FF5E36" />
                <Text style={styles.categoryPillText}>{product.category || 'Uncategorized'}</Text>
              </View>

              {/* Status pills */}
              <View style={styles.statusBadgesRow}>
                <View
                  style={[
                    styles.statusBadge,
                    inStock ? styles.statusBadgeInStock : styles.statusBadgeOutOfStock,
                  ]}
                >
                  {inStock ? (
                    <CheckCircle2 size={12} color="#16a34a" />
                  ) : (
                    <AlertCircle size={12} color="#dc2626" />
                  )}
                  <Text
                    style={[
                      styles.statusBadgeText,
                      inStock ? styles.statusBadgeTextInStock : styles.statusBadgeTextOutOfStock,
                    ]}
                  >
                    {inStock ? 'In Stock' : 'Out of Stock'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isListed ? styles.statusBadgeListed : styles.statusBadgeUnlisted,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isListed ? styles.statusBadgeTextListed : styles.statusBadgeTextUnlisted,
                    ]}
                  >
                    {isListed ? 'Listed' : 'Unlisted'}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.productTitle}>{product.name}</Text>

            {/* Merchandising Highlight Tags */}
            {(product.bestseller || product.featured || product.newArrival) && (
              <View style={styles.flagsRow}>
                {product.bestseller && (
                  <View style={[styles.flagPill, styles.flagBestseller]}>
                    <Award size={12} color="#b45309" />
                    <Text style={[styles.flagPillText, styles.flagBestsellerText]}>Bestseller</Text>
                  </View>
                )}
                {product.featured && (
                  <View style={[styles.flagPill, styles.flagFeatured]}>
                    <Star size={12} color="#7c3aed" />
                    <Text style={[styles.flagPillText, styles.flagFeaturedText]}>Featured</Text>
                  </View>
                )}
                {product.newArrival && (
                  <View style={[styles.flagPill, styles.flagNewArrival]}>
                    <Sparkles size={12} color="#047857" />
                    <Text style={[styles.flagPillText, styles.flagNewArrivalText]}>New Arrival</Text>
                  </View>
                )}
              </View>
            )}

            {/* Price Box */}
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.sellingPriceText}>{formatCurrency(sellingPrice)}</Text>
                {hasDiscount && (
                  <>
                    <Text style={styles.mrpText}>{formatCurrency(mrp)}</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
                    </View>
                  </>
                )}
              </View>
              <Text style={styles.taxInclusiveText}>Inclusive of all taxes & standard finishing</Text>
            </View>
          </View>

          {/* Quick Stock & Listing Controls */}
          {(onToggleStock || onUpdateVisibility) && (
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Quick Management</Text>
              
              {onToggleStock && (
                <View style={styles.controlRow}>
                  <View style={styles.controlMeta}>
                    <Text style={styles.controlTitle}>Inventory Availability</Text>
                    <Text style={styles.controlSubtitle}>
                      {inStock ? 'Available for client orders' : 'Marked out of stock'}
                    </Text>
                  </View>
                  <Switch
                    value={inStock}
                    onValueChange={() => onToggleStock(product)}
                    trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
                    thumbColor="#ffffff"
                  />
                </View>
              )}

              {onToggleStock && onUpdateVisibility && <View style={styles.innerDivider} />}

              {onUpdateVisibility && (
                <View style={styles.controlRow}>
                  <View style={styles.controlMeta}>
                    <Text style={styles.controlTitle}>Storefront Listing</Text>
                    <Text style={styles.controlSubtitle}>
                      {isListed ? 'Visible in web catalogue' : 'Hidden from public'}
                    </Text>
                  </View>
                  <View style={styles.visibilityTogglePills}>
                    <TouchableOpacity
                      onPress={() => {
                        if (!isListed) onUpdateVisibility(product, 'listed');
                      }}
                      style={[styles.pillBtn, isListed && styles.pillBtnActiveListed]}
                    >
                      <Text style={[styles.pillBtnText, isListed && styles.pillBtnTextActiveListed]}>
                        Listed
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (isListed) onUpdateVisibility(product, 'unListed');
                      }}
                      style={[styles.pillBtn, !isListed && styles.pillBtnActiveUnlisted]}
                    >
                      <Text style={[styles.pillBtnText, !isListed && styles.pillBtnTextActiveUnlisted]}>
                        Unlisted
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Variants & Stock Matrix */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderLeft}>
                <Layers size={16} color="#FF5E36" />
                <Text style={styles.sectionHeader}>Variants & Inventory</Text>
              </View>
              <View style={styles.stockSummaryPill}>
                <Package size={12} color="#71717a" />
                <Text style={styles.stockSummaryPillText}>{totalStock} units total</Text>
              </View>
            </View>

            {totalReserved > 0 && (
              <View style={styles.reservedAlertBanner}>
                <Text style={styles.reservedAlertText}>
                  {totalReserved} unit(s) currently reserved in pending inquiries/orders
                </Text>
              </View>
            )}

            {variants.length === 0 ? (
              <View style={styles.emptyVariantsBox}>
                <Text style={styles.emptyVariantsText}>No variants defined for this outfit.</Text>
              </View>
            ) : (
              <View style={styles.variantsList}>
                {variants.map((variant, vIdx) => {
                  const variantStock = Number(variant.stock) || 0;
                  const variantReserved = Number(variant.reservedStock) || 0;
                  const swatchColor = getColorHex(variant.color, variant.hexCode);
                  const isVariantOutOfStock = variantStock === 0;

                  return (
                    <View key={`var_${vIdx}`} style={styles.variantItem}>
                      <View style={styles.variantInfoLeft}>
                        <View
                          style={[
                            styles.variantSwatch,
                            { backgroundColor: swatchColor },
                            swatchColor.toLowerCase() === '#ffffff' || swatchColor.toLowerCase() === '#faf8f5'
                              ? styles.swatchBorder
                              : null,
                          ]}
                        />
                        <View>
                          <Text style={styles.variantColorName}>
                            {variant.color || 'Standard Variant'}
                          </Text>
                          {variant.size ? (
                            <Text style={styles.variantSizeText}>Size: {variant.size}</Text>
                          ) : null}
                          {variant.hexCode ? (
                            <Text style={styles.variantHexText}>{variant.hexCode}</Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.variantStockInfo}>
                        <View
                          style={[
                            styles.variantStockPill,
                            isVariantOutOfStock ? styles.variantStockOos : styles.variantStockIs,
                          ]}
                        >
                          <Text
                            style={[
                              styles.variantStockPillText,
                              isVariantOutOfStock ? styles.variantStockOosText : styles.variantStockIsText,
                            ]}
                          >
                            {variantStock} in stock
                          </Text>
                        </View>
                        {variantReserved > 0 && (
                          <Text style={styles.variantReservedText}>
                            {variantReserved} reserved
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Garment Specifications */}
          {(product.fabric || product.fit || product.careInstructions) && (
            <View style={styles.card}>
              <View style={styles.sectionHeaderLeft}>
                <Scissors size={16} color="#FF5E36" />
                <Text style={styles.sectionHeader}>Garment Specifications</Text>
              </View>

              <View style={styles.specList}>
                {product.fabric ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Fabric</Text>
                    <Text style={styles.specValue}>{product.fabric}</Text>
                  </View>
                ) : null}

                {product.fit ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Silhouette & Fit</Text>
                    <Text style={styles.specValue}>{product.fit}</Text>
                  </View>
                ) : null}

                {product.careInstructions ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Care Instructions</Text>
                    <Text style={styles.specValue}>{product.careInstructions}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}

          {/* Description */}
          {product.description ? (
            <View style={styles.card}>
              <View style={styles.sectionHeaderLeft}>
                <FileText size={16} color="#FF5E36" />
                <Text style={styles.sectionHeader}>Description & Atelier Notes</Text>
              </View>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          ) : null}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Search Tags</Text>
              <View style={styles.tagsContainer}>
                {product.tags.map((t, idx) => (
                  <View key={`tag_${idx}`} style={styles.tagPill}>
                    <Text style={styles.tagPillText}>#{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Metadata Footer */}
          <View style={styles.metaCard}>
            <View style={styles.metaItem}>
              <Hash size={12} color="#a1a1aa" />
              <Text style={styles.metaLabel}>Slug:</Text>
              <Text style={styles.metaValue}>{product.slug}</Text>
            </View>
            {formattedDate && (
              <View style={styles.metaItem}>
                <Calendar size={12} color="#a1a1aa" />
                <Text style={styles.metaLabel}>Created:</Text>
                <Text style={styles.metaValue}>{formattedDate}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.footerSecondaryBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.footerSecondaryText}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onEdit(product)}
            style={styles.footerPrimaryBtn}
            activeOpacity={0.8}
          >
            <Edit3 size={16} color="#ffffff" />
            <Text style={styles.footerPrimaryText}>Edit Outfit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalShell: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  headerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff1ee',
  },
  headerEditText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF5E36',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },

  // Gallery
  galleryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  mainImageWrapper: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  noImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  galleryCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  galleryCounterText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  thumbnailStrip: {
    paddingTop: 10,
    gap: 8,
  },
  thumbnailItem: {
    width: 60,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  thumbnailItemSelected: {
    borderColor: '#FF5E36',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  // Cards
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fff1ee',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5E36',
  },
  statusBadgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeInStock: {
    backgroundColor: '#f0fdf4',
  },
  statusBadgeOutOfStock: {
    backgroundColor: '#fef2f2',
  },
  statusBadgeListed: {
    backgroundColor: '#f8fafc',
  },
  statusBadgeUnlisted: {
    backgroundColor: '#f1f5f9',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadgeTextInStock: {
    color: '#16a34a',
  },
  statusBadgeTextOutOfStock: {
    color: '#dc2626',
  },
  statusBadgeTextListed: {
    color: '#334155',
  },
  statusBadgeTextUnlisted: {
    color: '#64748b',
  },

  productTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 26,
    letterSpacing: -0.3,
  },

  flagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  flagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  flagBestseller: {
    backgroundColor: '#fef3c7',
  },
  flagBestsellerText: {
    color: '#92400e',
  },
  flagFeatured: {
    backgroundColor: '#f3e8ff',
  },
  flagFeaturedText: {
    color: '#6b21a8',
  },
  flagNewArrival: {
    backgroundColor: '#d1fae5',
  },
  flagNewArrivalText: {
    color: '#065f46',
  },
  flagPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Price
  priceContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  sellingPriceText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  mrpText: {
    fontSize: 16,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '700',
  },
  taxInclusiveText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },

  // Quick Controls
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  controlMeta: {
    flex: 1,
    paddingRight: 16,
  },
  controlTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  controlSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  innerDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  visibilityTogglePills: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
  },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pillBtnActiveListed: {
    backgroundColor: '#0f172a',
  },
  pillBtnActiveUnlisted: {
    backgroundColor: '#64748b',
  },
  pillBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  pillBtnTextActiveListed: {
    color: '#ffffff',
  },
  pillBtnTextActiveUnlisted: {
    color: '#ffffff',
  },

  // Variants section
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  stockSummaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stockSummaryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  reservedAlertBanner: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  reservedAlertText: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '500',
  },
  emptyVariantsBox: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyVariantsText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  variantsList: {
    gap: 10,
  },
  variantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  variantInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  variantSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  swatchBorder: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  variantColorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  variantSizeText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  variantHexText: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  variantStockInfo: {
    alignItems: 'flex-end',
  },
  variantStockPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  variantStockIs: {
    backgroundColor: '#f0fdf4',
  },
  variantStockOos: {
    backgroundColor: '#fef2f2',
  },
  variantStockPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  variantStockIsText: {
    color: '#15803d',
  },
  variantStockOosText: {
    color: '#b91c1c',
  },
  variantReservedText: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 3,
    fontWeight: '500',
  },

  // Specs
  specList: {
    marginTop: 12,
    gap: 10,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  specLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // Description
  descriptionText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tagPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagPillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },

  // Meta
  metaCard: {
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: '500',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  footerSecondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  footerPrimaryBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FF5E36',
    shadowColor: '#FF5E36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  footerPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
