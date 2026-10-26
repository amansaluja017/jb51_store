import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollPadding: {
    padding: 16,
    paddingBottom: 30,
    gap: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  scopeSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  scopeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  scopeValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#09090b',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
    letterSpacing: 0.2,
  },

  // Telemetry Section
  telemetrySection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#09090b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  telemetryHint: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  dropdownPickerList: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 6,
    maxHeight: 200,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownOptionText: {
    fontSize: 13,
    color: '#64748b',
  },
  activeOption: {
    color: '#FF5E36',
    fontWeight: '700',
  },

  // Interactive Cards
  interactiveCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  analyticsStatCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  activeCardViews: {
    borderColor: '#FF5E36',
    backgroundColor: '#fffcfb',
  },
  activeCardWa: {
    borderColor: '#128C7E',
    backgroundColor: '#f6fbf9',
  },
  activeCardIg: {
    borderColor: '#E1306C',
    backgroundColor: '#fdf7f9',
  },
  activeCardConv: {
    borderColor: '#10B981',
    backgroundColor: '#f4fbf7',
  },
  activeCardOrders: {
    borderColor: '#6366F1',
    backgroundColor: '#f5f5ff',
  },
  activeCardOrderConv: {
    borderColor: '#8B5CF6',
    backgroundColor: '#f8f5ff',
  },
  clearScopeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  clearScopeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statHeading: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#09090b',
    marginTop: 6,
  },

  chartWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    overflow: 'hidden',
  },

  // Conversion Funnel & Channel Breakdown
  funnelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  funnelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  funnelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  funnelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  funnelSub: {
    fontSize: 11,
    color: '#64748b',
  },
  funnelStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  funnelStep: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  funnelStepVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#09090b',
  },
  funnelStepLbl: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  funnelStepSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  funnelArrow: {
    marginHorizontal: 4,
  },

  // Channels Grid
  channelsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  channelCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  channelCardWa: {
    backgroundColor: '#f6fbf9',
    borderColor: '#d1fae5',
  },
  channelCardIg: {
    backgroundColor: '#fdf7f9',
    borderColor: '#fce7f3',
  },
  channelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channelTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  channelVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#09090b',
    marginTop: 2,
  },
  channelSubText: {
    fontSize: 10,
    color: '#64748b',
  },

  // Product Demand & Performance Leaderboard
  demandCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  demandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demandTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demandSub: {
    fontSize: 11,
    color: '#64748b',
  },
  highlightsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 4,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  highlightLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  highlightName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#09090b',
    marginTop: 2,
  },
  highlightMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  highlightValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5E36',
  },
  highlightBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  highlightBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },

  // Product Comparison Table
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  thProduct: {
    flex: 2.2,
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  thMetric: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  thConv: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  tableRowActive: {
    backgroundColor: '#fffcfb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  productCell: {
    flex: 2.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productThumb: {
    width: 32,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  productThumbFallback: {
    width: 32,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    gap: 1,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#09090b',
  },
  productCategory: {
    fontSize: 10,
    color: '#64748b',
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#09090b',
  },
  metricSub: {
    fontSize: 9,
    color: '#94a3b8',
  },
  convCell: {
    flex: 1,
    alignItems: 'flex-end',
  },
  convPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  convPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },

  // Focused Outfit Detail Card
  focusedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF5E36',
    gap: 14,
  },
  focusedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  focusedHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  focusedHeaderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ea580c',
    textTransform: 'uppercase',
  },
  focusedResetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  focusedResetBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  focusedBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  focusedImage: {
    width: 60,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  focusedImagePlaceholder: {
    width: 60,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusedDetails: {
    flex: 1,
    gap: 2,
  },
  focusedProductName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#09090b',
  },
  focusedProductCategory: {
    fontSize: 11,
    color: '#64748b',
  },
  focusedProductPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5E36',
    marginTop: 2,
  },
  focusedStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 10,
  },
  focusedStatBox: {
    width: '48%',
    gap: 2,
  },
  focusedStatBoxVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#09090b',
  },
  focusedStatBoxLbl: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },

  // Store Health Pulse
  healthCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#09090b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  healthBox: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  healthBoxVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#09090b',
  },
  healthBoxLbl: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },

  spotlightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  spotlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spotlightHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#09090b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spotlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spotlightImage: {
    width: 50,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  spotlightPlaceholder: {
    backgroundColor: '#e2e8f0',
  },
  spotlightMeta: {
    flex: 1,
    gap: 2,
  },
  spotlightName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  spotlightPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5E36',
  },
  spotlightCategory: {
    fontSize: 11,
    color: '#64748b',
  },

  // Order Ratio, Growth & Payment Analytics Styles
  analysisCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analysisHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analysisTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analysisSub: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  ratioHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  ratioValBox: {
    gap: 2,
  },
  ratioValText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#09090b',
  },
  ratioLblText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  ratioBarTrack: {
    height: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  ratioBarOnline: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  ratioBarOffline: {
    height: '100%',
    backgroundColor: '#f59e0b',
  },
  growthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  growthBox: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 4,
  },
  growthBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  growthBoxLbl: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  growthBoxVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#09090b',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  growthBadgePositive: {
    backgroundColor: '#dcfce7',
  },
  growthBadgeNegative: {
    backgroundColor: '#fee2e2',
  },
  growthBadgeTextPositive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  growthBadgeTextNegative: {
    fontSize: 10,
    fontWeight: '700',
    color: '#dc2626',
  },
  paymentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  paymentCardItem: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 4,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentCardTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  paymentCardAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090b',
  },
  paymentCardSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  paymentSharePill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  paymentSharePillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  paymentBarTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  creditNoteText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#c2410c',
    backgroundColor: '#fff7ed',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
});

export default styles;
