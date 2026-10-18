import React, { useState, useMemo } from 'react';
import {
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
  User,
  Package,
  FileText,
  Clock,
  RotateCw,
  Lock,
} from 'lucide-react-native';
import { InventoryTransaction } from '../types';
import styles from './InventoryHistoryModal.styles';

interface InventoryHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: InventoryTransaction[];
  isLoading: boolean;
  onRefresh: () => void;
}

type FilterType = 'all' | 'sale' | 'purchase' | 'adjustment';

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
      if (filterType !== 'all') {
        if (filterType === 'adjustment') {
          if (t.type !== 'adjustment' && t.type !== 'reservation' && t.type !== 'release') {
            return false;
          }
        } else if (t.type !== filterType) {
          return false;
        }
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
    let adjustmentsCount = 0;
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
      } else {
        adjustmentsCount++;
      }
    });

    return { salesCount, purchasesCount, adjustmentsCount, totalSoldUnits, totalPurchasedUnits };
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
                <Text style={styles.headerTitle}>Inventory History & Ledger</Text>
                <Text style={styles.headerSubtitle}>
                  {transactions.length} movement{transactions.length === 1 ? '' : 's'} recorded in database
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
              <Text style={styles.statLabel}>Sales ({stats.totalSoldUnits}u)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats.purchasesCount}</Text>
              <Text style={styles.statLabel}>Purchases ({stats.totalPurchasedUnits}u)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats.adjustmentsCount}</Text>
              <Text style={styles.statLabel}>Adjustments</Text>
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

              <TouchableOpacity
                onPress={() => setFilterType('adjustment')}
                style={[styles.filterPill, filterType === 'adjustment' && styles.filterPillAdjustmentActive]}
              >
                <RotateCw size={12} color={filterType === 'adjustment' ? '#ffffff' : '#d97706'} />
                <Text style={[styles.filterPillText, filterType === 'adjustment' && styles.filterPillTextActive]}>
                  Adjustments
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
                const isPurchase = tx.type === 'purchase';

                const party = isSale
                  ? (tx.customerName || 'Walk-in Customer')
                  : isPurchase
                  ? (tx.sellerName || 'Supplier')
                  : 'Stock Adjustment / Admin Sync';
                const contact = isSale ? tx.customerPhone : isPurchase ? tx.sellerEmail : null;
                const totalAmt = tx.totalAmount ? `₹${Number(tx.totalAmount).toLocaleString('en-IN')}` : null;

                return (
                  <View key={tx.id} style={styles.card}>
                    {/* Top Row: Type badge and Date */}
                    <View style={styles.cardTopRow}>
                      <View
                        style={[
                          styles.badge,
                          isSale ? styles.badgeSale : isPurchase ? styles.badgePurchase : styles.badgeAdjustment,
                        ]}
                      >
                        {isSale ? (
                          <TrendingDown size={11} color="#ef4444" style={{ marginRight: 4 }} />
                        ) : isPurchase ? (
                          <TrendingUp size={11} color="#10b981" style={{ marginRight: 4 }} />
                        ) : (
                          <RotateCw size={11} color="#d97706" style={{ marginRight: 4 }} />
                        )}
                        <Text
                          style={[
                            styles.badgeText,
                            isSale
                              ? styles.badgeTextSale
                              : isPurchase
                              ? styles.badgeTextPurchase
                              : styles.badgeTextAdjustment,
                          ]}
                        >
                          {isSale ? 'SALE' : isPurchase ? 'PURCHASE' : (tx.type || 'ADJUSTMENT').toUpperCase()}
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
                        <Text
                          style={[
                            styles.qtyText,
                            isSale ? styles.qtyTextSale : isPurchase ? styles.qtyTextPurchase : styles.qtyTextAdjustment,
                          ]}
                        >
                          {isSale ? `-${tx.quantity}` : isPurchase ? `+${tx.quantity}` : `±${tx.quantity}`} units
                        </Text>
                        {totalAmt && <Text style={styles.amountText}>{totalAmt}</Text>}
                      </View>
                    </View>

                    {/* Stock Position: Available & Reserved Stock */}
                    <View style={styles.stockLevelRow}>
                      <View style={styles.stockPillAvail}>
                        <Package size={11} color="#047857" />
                        <Text style={styles.stockPillAvailLabel}>Available:</Text>
                        <Text style={styles.stockPillAvailVal}>
                          {tx.availableStock !== undefined && tx.availableStock !== null ? `${tx.availableStock} units` : '—'}
                        </Text>
                      </View>

                      <View style={styles.stockPillReserved}>
                        <Lock size={11} color="#c2410c" />
                        <Text style={styles.stockPillReservedLabel}>Reserved:</Text>
                        <Text style={styles.stockPillReservedVal}>
                          {tx.reservedStock !== undefined && tx.reservedStock !== null ? `${tx.reservedStock} units` : '0 units'}
                        </Text>
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

