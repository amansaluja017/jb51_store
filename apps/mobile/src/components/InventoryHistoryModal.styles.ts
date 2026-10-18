import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '88%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reloadBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
  },
  statLabel: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e4e4e7',
  },
  controlsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#18181b',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f4f4f5',
    gap: 4,
  },
  filterPillActive: {
    backgroundColor: '#18181b',
  },
  filterPillSaleActive: {
    backgroundColor: '#ef4444',
  },
  filterPillPurchaseActive: {
    backgroundColor: '#10b981',
  },
  filterPillAdjustmentActive: {
    backgroundColor: '#d97706',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 12,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSale: {
    backgroundColor: '#fef2f2',
  },
  badgePurchase: {
    backgroundColor: '#ecfdf5',
  },
  badgeAdjustment: {
    backgroundColor: '#fffbeb',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextSale: {
    color: '#ef4444',
  },
  badgeTextPurchase: {
    color: '#10b981',
  },
  badgeTextAdjustment: {
    color: '#d97706',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    color: '#a1a1aa',
  },
  cardProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfoCol: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  variantText: {
    fontSize: 11,
    color: '#71717a',
  },
  quantityWrap: {
    alignItems: 'flex-end',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
  },
  qtyTextSale: {
    color: '#ef4444',
  },
  qtyTextPurchase: {
    color: '#10b981',
  },
  qtyTextAdjustment: {
    color: '#d97706',
  },
  amountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#52525b',
    marginTop: 1,
  },
  stockLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  stockPillAvail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockPillAvailLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#71717a',
  },
  stockPillAvailVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  stockPillReserved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  stockPillReservedLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#71717a',
  },
  stockPillReservedVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c2410c',
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  partyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3f3f46',
  },
  partyDot: {
    marginHorizontal: 6,
    color: '#a1a1aa',
    fontSize: 11,
  },
  partyContact: {
    fontSize: 11,
    color: '#71717a',
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 6,
    borderRadius: 6,
  },
  notesText: {
    fontSize: 11,
    color: '#71717a',
    fontStyle: 'italic',
    flex: 1,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3f3f46',
  },
  emptyText: {
    fontSize: 12,
    color: '#a1a1aa',
    textAlign: 'center',
    maxWidth: 240,
  },
});

export default styles;
