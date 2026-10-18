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

  pipelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pipelineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pipelineAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF5E36',
    marginTop: 4,
  },
  pipelineSub: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 4,
    lineHeight: 16,
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
});

export default styles;
