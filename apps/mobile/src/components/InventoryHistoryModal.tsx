import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  History,
  TrendingDown,
  TrendingUp,
  Search,
  Calendar,
  User,
  Package,
  Phone,
  Mail,
  FileText,
  Clock,
  RotateCw,
} from 'lucide-react-native';
import { InventoryTransaction } from '../types';

interface InventoryHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: InventoryTransaction[];
  isLoading: boolean;
  onRefresh: () => void;
}

type FilterType = 'all' | 'sale' | 'purchase';

const formatTimestamp = (isoString?: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function InventoryHistoryModal({
  visible,
  onClose,
  transactions,
  isLoading,
  onRefresh,
}: InventoryHistoryModalProps) {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const prod = (t.productName || '').toLowerCase();
        const cust = (t.customerName || '').toLowerCase();
        const sell = (t.sellerName || '').toLowerCase();
        const phone = (t.customerPhone || '').toLowerCase();
        const notes = (t.notes || '').toLowerCase();
        return (
          prod.includes(query) ||
          cust.includes(query) ||
          sell.includes(query) ||
          phone.includes(query) ||
          notes.includes(query)
        );
      }
      return true;
    });
  }, [transactions, filterType, searchQuery]);

  const stats = useMemo(() => {
    let salesCount = 0;
    let purchasesCount = 0;
    let totalSoldUnits = 0;
    let totalPurchasedUnits = 0;

    transactions.forEach(t => {
      const q = Number(t.quantity) || 0;
      if (t.type === 'sale') {
        salesCount++;
        totalSoldUnits += q;
      } else if (t.type === 'purchase') {
        purchasesCount++;
        totalPurchasedUnits += q;
      }
    });

    return { salesCount, purchasesCount, totalSoldUnits, totalPurchasedUnits };
  }, [transactions]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <History size={18} color="#FF5E36" />
              <View>
                <Text style={styles.headerTitle}>Inventory Transaction Log</Text>
                <Text style={styles.headerSubtitle}>
                  {transactions.length} recorded movement{transactions.length === 1 ? '' : 's'} in database
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={onRefresh} style={styles.reloadBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <RotateCw size={16} color="#71717a" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color="#71717a" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Metrics summary banner */}
          <View style={styles.statsBanner}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats.salesCount}</Text>
              <Text style={styles.statLabel}>Sales ({stats.totalSoldUnits} units)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats.purchasesCount}</Text>
              <Text style={styles.statLabel}>Purchases ({stats.totalPurchasedUnits} units)</Text>
            </View>
          </View>

          {/* Search & Filter pills */}
          <View style={styles.controlsRow}>
            <View style={styles.searchBar}>
              <Search size={14} color="#a1a1aa" />
              <TextInput
                placeholder="Search party, product, phone..."
                placeholderTextColor="#a1a1aa"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={14} color="#a1a1aa" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterPillsRow}>
              <TouchableOpacity
                onPress={() => setFilterType('all')}
                style={[styles.filterPill, filterType === 'all' && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, filterType === 'all' && styles.filterPillTextActive]}>
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterType('sale')}
                style={[styles.filterPill, filterType === 'sale' && styles.filterPillSaleActive]}
              >
                <TrendingDown size={12} color={filterType === 'sale' ? '#ffffff' : '#ef4444'} />
                <Text style={[styles.filterPillText, filterType === 'sale' && styles.filterPillTextActive]}>
                  Sales
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterType('purchase')}
                style={[styles.filterPill, filterType === 'purchase' && styles.filterPillPurchaseActive]}
              >
                <TrendingUp size={12} color={filterType === 'purchase' ? '#ffffff' : '#10b981'} />
                <Text style={[styles.filterPillText, filterType === 'purchase' && styles.filterPillTextActive]}>
                  Purchases
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Transactions list */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#FF5E36" colors={['#FF5E36']} />
            }
          >
            {isLoading && transactions.length === 0 ? (
              <View style={styles.emptyWrap}>
                <ActivityIndicator color="#FF5E36" size="large" />
                <Text style={styles.emptyText}>Loading transaction history...</Text>
              </View>
            ) : filteredTransactions.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Package size={36} color="#d4d4d8" />
                <Text style={styles.emptyTitle}>No Transactions Found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Try changing your search terms or filters.' : 'Stock movements will appear here once recorded.'}
                </Text>
              </View>
            ) : (
              filteredTransactions.map(tx => {
                const isSale = tx.type === 'sale';
                const party = isSale ? (tx.customerName || 'Walk-in Customer') : (tx.sellerName || 'Supplier');
                const contact = isSale ? tx.customerPhone : tx.sellerEmail;
                const totalAmt = tx.totalAmount ? `₹${Number(tx.totalAmount).toLocaleString('en-IN')}` : null;

                return (
                  <View key={tx.id} style={styles.card}>
                    {/* Top Row: Type badge and Date */}
                    <View style={styles.cardTopRow}>
                      <View style={[styles.badge, isSale ? styles.badgeSale : styles.badgePurchase]}>
                        {isSale ? (
                          <TrendingDown size={11} color="#ef4444" style={{ marginRight: 4 }} />
                        ) : (
                          <TrendingUp size={11} color="#10b981" style={{ marginRight: 4 }} />
                        )}
                        <Text style={[styles.badgeText, isSale ? styles.badgeTextSale : styles.badgeTextPurchase]}>
                          {isSale ? 'SALE' : 'PURCHASE'}
                        </Text>
                      </View>

                      <View style={styles.timeRow}>
                        <Clock size={11} color="#a1a1aa" style={{ marginRight: 3 }} />
                        <Text style={styles.timeText}>{formatTimestamp(tx.createdAt)}</Text>
                      </View>
                    </View>

                    {/* Product & Quantity Row */}
                    <View style={styles.cardProductRow}>
                      <View style={styles.productInfoCol}>
                        <Text style={styles.productName} numberOfLines={1}>
                          {tx.productName || 'Outfit Item'}
                        </Text>
                        {tx.variantColor && (
                          <View style={styles.variantRow}>
                            {tx.variantHex && (
                              <View style={[styles.colorDot, { backgroundColor: tx.variantHex }]} />
                            )}
                            <Text style={styles.variantText}>{tx.variantColor}</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.quantityWrap}>
                        <Text style={[styles.qtyText, isSale ? styles.qtyTextSale : styles.qtyTextPurchase]}>
                          {isSale ? `-${tx.quantity}` : `+${tx.quantity}`} units
                        </Text>
                        {totalAmt && <Text style={styles.amountText}>{totalAmt}</Text>}
                      </View>
                    </View>

                    {/* Party Details */}
                    <View style={styles.partyRow}>
                      <User size={12} color="#71717a" style={{ marginRight: 5 }} />
                      <Text style={styles.partyName} numberOfLines={1}>
                        {party}
                      </Text>
                      {contact && (
                        <>
                          <Text style={styles.partyDot}>•</Text>
                          <Text style={styles.partyContact} numberOfLines={1}>
                            {contact}
                          </Text>
                        </>
                      )}
                    </View>

                    {/* Notes if any */}
                    {tx.notes ? (
                      <View style={styles.notesRow}>
                        <FileText size={11} color="#a1a1aa" style={{ marginRight: 4 }} />
                        <Text style={styles.notesText} numberOfLines={2}>
                          {tx.notes}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  amountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#52525b',
    marginTop: 1,
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
