import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Edit3,
  ImageOff,
  Zap,
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
import FormattedRichText from './FormattedRichText';
import styles from './ProductDetailsModal.styles';

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
                    <Zap size={12} color="#047857" />
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
                    <View style={{ flex: 1 }}>
                      <FormattedRichText text={product.fabric} textColor="#27272a" baseFontSize={13} />
                    </View>
                  </View>
                ) : null}

                {product.fit ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Silhouette & Fit</Text>
                    <View style={{ flex: 1 }}>
                      <FormattedRichText text={product.fit} textColor="#27272a" baseFontSize={13} />
                    </View>
                  </View>
                ) : null}

                {product.careInstructions ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Care Instructions</Text>
                    <View style={{ flex: 1 }}>
                      <FormattedRichText text={product.careInstructions} textColor="#27272a" baseFontSize={13} />
                    </View>
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
                <Text style={styles.sectionHeader}>Description & Notes</Text>
              </View>
              <FormattedRichText text={product.description} textColor="#3f3f46" baseFontSize={14} />
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

