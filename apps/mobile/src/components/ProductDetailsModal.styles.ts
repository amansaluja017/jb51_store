import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
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

export default styles;
