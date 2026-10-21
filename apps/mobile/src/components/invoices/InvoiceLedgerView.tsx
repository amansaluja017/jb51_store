import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Search,
  Plus,
  X,
  Trash2,
  Printer,
  ShoppingBag,
  Eye,
  FileText,
  Receipt,
  User,
  PackageCheck,
} from 'lucide-react-native';
import { Invoice, Order } from '../../types';
import { InvoiceSkeleton } from '../SkeletonLoader';
import styles from '../../screens/InvoiceScreen.styles';

export interface InvoiceLedgerViewProps {
  invoices: Invoice[];
  orders: Order[];
  isLoading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  activeLedgerTab: 'invoices' | 'orders';
  setActiveLedgerTab: (tab: 'invoices' | 'orders') => void;
  searchFilter: string;
  setSearchFilter: (query: string) => void;
  filteredInvoices: Invoice[];
  filteredOrders: Order[];
  onOpenNewInvoice: () => void;
  onViewInvoice: (inv: Invoice) => void;
  onDeleteInvoice: (id: string, invoiceNumber: string) => void;
  onSelectOrder: (order: Order) => void;
}

export const InvoiceLedgerView: React.FC<InvoiceLedgerViewProps> = ({
  invoices,
  orders,
  isLoading,
  refreshing,
  onRefresh,
  activeLedgerTab,
  setActiveLedgerTab,
  searchFilter,
  setSearchFilter,
  filteredInvoices,
  filteredOrders,
  onOpenNewInvoice,
  onViewInvoice,
  onDeleteInvoice,
  onSelectOrder,
}) => {
  const totalCollected = useMemo(() => {
    return invoices.reduce((sum, inv) => {
      const amt = Number(inv.finalAmount ?? inv.totalAmount ?? 0);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
  }, [invoices]);

  const totalOrdersValue = useMemo(() => {
    return orders.reduce((sum, ord) => {
      const amt = Number(ord.totalAmount ?? 0);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
  }, [orders]);

  const cashCollected = useMemo(() => {
    return invoices.reduce((sum, inv) => {
      const mode = ((inv.mode || (inv as any).paymentMethod || 'cash') as string).toLowerCase();
      if (mode === 'cash') {
        const amt = Number(inv.finalAmount ?? inv.totalAmount ?? 0);
        return sum + (isNaN(amt) ? 0 : amt);
      }
      return sum;
    }, 0);
  }, [invoices]);
  return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            alwaysBounceVertical={true}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={!!refreshing}
                  onRefresh={onRefresh}
                  tintColor="#FF5E36"
                  colors={['#FF5E36']}
                  progressBackgroundColor="#ffffff"
                />
              ) : undefined
            }
          >
            {/* Header */}
            <View style={styles.ledgerHeader}>
              <View>
                <Text style={styles.ledgerTitle}>Invoices & Orders</Text>
                <Text style={styles.ledgerSubtitle}>
                  {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} • {orders.length} {orders.length === 1 ? 'order' : 'orders'} recorded
                </Text>
              </View>
              <TouchableOpacity
                onPress={onOpenNewInvoice}
                style={styles.newInvoiceButtonHeader}
                accessibilityLabel="Create a new invoice button"
                accessibilityRole="button"
              >
                <Plus size={14} color="#ffffff" />
                <Text style={styles.newInvoiceButtonTextHeader}>New Invoice</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Summary Grid */}
            <View style={styles.statsContainer}>
              <View style={styles.statsCard}>
                <Text style={styles.statsLabel}>Total Revenue</Text>
                <Text style={styles.statsValue}>
                  &#8377;{totalCollected.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={[styles.statsCard, { borderColor: '#e0f2fe' }]}>
                <Text style={[styles.statsLabel, { color: '#0284c7' }]}>
                  Orders Value
                </Text>
                <Text style={[styles.statsValue, { color: '#0284c7' }]}>
                  &#8377;{totalOrdersValue.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={[styles.statsCard, { borderColor: '#fef3c7' }]}>
                <Text style={[styles.statsLabel, { color: '#d97706' }]}>
                  Cash Pay
                </Text>
                <Text style={[styles.statsValue, { color: '#d97706' }]}>
                  &#8377;{cashCollected.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Segmented Tab Switch: Invoices vs Order History */}
            <View style={styles.ledgerSegmentedContainer}>
              <TouchableOpacity
                style={[
                  styles.ledgerSegmentTab,
                  activeLedgerTab === 'invoices' && styles.ledgerSegmentTabActive,
                ]}
                onPress={() => setActiveLedgerTab('invoices')}
              >
                <Receipt
                  size={14}
                  color={activeLedgerTab === 'invoices' ? '#FF5E36' : '#71717a'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.ledgerSegmentText,
                    activeLedgerTab === 'invoices' && styles.ledgerSegmentTextActive,
                  ]}
                >
                  Invoices ({invoices.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.ledgerSegmentTab,
                  activeLedgerTab === 'orders' && styles.ledgerSegmentTabActive,
                ]}
                onPress={() => setActiveLedgerTab('orders')}
              >
                <PackageCheck
                  size={14}
                  color={activeLedgerTab === 'orders' ? '#FF5E36' : '#71717a'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.ledgerSegmentText,
                    activeLedgerTab === 'orders' && styles.ledgerSegmentTextActive,
                  ]}
                >
                  Order History ({orders.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar for Invoices or Orders */}
            <View style={styles.searchBar}>
              <Search size={15} color="#a1a1aa" style={{ marginRight: 8 }} />
              <TextInput
                placeholder={
                  activeLedgerTab === 'invoices'
                    ? 'Search invoice #, customer name, or phone...'
                    : 'Search order #, customer name, or item...'
                }
                placeholderTextColor="#a1a1aa"
                value={searchFilter}
                onChangeText={setSearchFilter}
                style={styles.searchInput}
              />
              {searchFilter.length > 0 && (
                <TouchableOpacity onPress={() => setSearchFilter('')}>
                  <X size={14} color="#a1a1aa" />
                </TouchableOpacity>
              )}
            </View>

            {/* ================= INVOICES TAB ================= */}
            {activeLedgerTab === 'invoices' ? (
              <>
                <Text style={styles.sectionHeader}>Stored Invoices</Text>
                {filteredInvoices.length === 0 ? (
                  <View style={styles.emptyState}>
                    <FileText size={32} color="#a1a1aa" />
                    <Text style={styles.emptyStateText}>
                      {searchFilter ? 'No matching invoices' : 'No invoices yet'}
                    </Text>
                    <Text style={styles.emptyStateSub}>
                      {searchFilter
                        ? 'Try adjusting your search criteria'
                        : 'Tap "New Invoice" above to generate your first invoice'}
                    </Text>
                  </View>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isCash = (inv.mode || 'cash').toLowerCase() === 'cash';
                    const amt = Number(inv.finalAmount ?? inv.totalAmount ?? 0);
                    const itemCount = Array.isArray(inv.items) ? inv.items.length : 1;
                    const dateDisplay = inv.createdAt
                      ? new Date(inv.createdAt).toLocaleDateString('en-IN')
                      : 'Recent';

                    return (
                      <View key={inv.id} style={styles.invoiceCard}>
                        <TouchableOpacity
                          style={styles.invoiceCardMain}
                          onPress={() => {
                            onViewInvoice(inv);
                          }}
                          accessibilityLabel={`Invoice card for ${inv.customerName || 'Customer'}`}
                          accessibilityRole="button"
                        >
                          <View style={styles.invoiceCardHeader}>
                            <Text style={styles.invoiceCardClient}>
                              {inv.customerName || 'Walk-in Customer'}
                            </Text>
                            <Text style={styles.invoiceCardDate}>{dateDisplay}</Text>
                          </View>

                          <View style={styles.invoiceCardBody}>
                            <Text style={styles.invoiceCardId}>
                              {inv.invoiceNumber || inv.id}
                            </Text>
                            <Text style={styles.invoiceCardCount}>
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </Text>
                          </View>

                          {inv.notes ? (
                            <Text style={styles.invoiceCardNotes} numberOfLines={1}>
                              Note: {inv.notes}
                            </Text>
                          ) : null}

                          <View style={styles.invoiceCardFooter}>
                            <Text style={styles.invoiceCardAmount}>
                              &#8377;{amt.toLocaleString('en-IN')}
                            </Text>
                            <View
                              style={[
                                styles.badge,
                                !isCash ? styles.badgeOnline : styles.badgeCash,
                              ]}
                            >
                              <Text
                                style={
                                  !isCash
                                    ? styles.badgeOnlineText
                                    : styles.badgeCashText
                                }
                              >
                                {!isCash ? 'Online' : 'Cash'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() =>
                            onDeleteInvoice(
                              inv.id,
                              inv.invoiceNumber || inv.customerName || 'Invoice'
                            )
                          }
                          style={styles.deleteInvoiceBtn}
                          accessibilityLabel={`Delete invoice ${inv.invoiceNumber || inv.id}`}
                          accessibilityRole="button"
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </>
            ) : (
              // ================= ORDER HISTORY TAB =================
              <>
                <Text style={styles.sectionHeader}>Order History</Text>
                {filteredOrders.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ShoppingBag size={32} color="#a1a1aa" />
                    <Text style={styles.emptyStateText}>
                      {searchFilter ? 'No matching orders' : 'No orders recorded yet'}
                    </Text>
                    <Text style={styles.emptyStateSub}>
                      {searchFilter
                        ? 'Try searching by order number or customer name'
                        : 'Orders are automatically created whenever you generate an invoice.'}
                    </Text>
                  </View>
                ) : (
                  filteredOrders.map((ord) => {
                    const isCash = (ord.paymentMethod || 'cash').toLowerCase() === 'cash';
                    const amt = Number(ord.totalAmount || 0);
                    const items = ord.items || [];
                    const dateDisplay = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recent';

                    return (
                      <View key={ord.id} style={styles.orderCard}>
                        {/* Order Card Header */}
                        <View style={styles.orderCardHeader}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.orderCustomerName}>
                              {ord.customerName || 'Walk-in Customer'}
                            </Text>
                            {ord.customerPhone ? (
                              <Text style={styles.orderCustomerPhone}>
                                {ord.customerPhone}
                              </Text>
                            ) : null}
                          </View>
                          <Text style={styles.orderDate}>{dateDisplay}</Text>
                        </View>

                        {/* Badges Row */}
                        <View style={styles.orderBadgeRow}>
                          <View style={styles.orderNumberBadge}>
                            <ShoppingBag size={11} color="#FF5E36" style={{ marginRight: 4 }} />
                            <Text style={styles.orderNumberText}>{ord.orderNumber}</Text>
                          </View>

                          <View style={styles.orderStatusBadge}>
                            <Text style={styles.orderStatusText}>
                              {ord.status || 'Confirmed'}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.badge,
                              !isCash ? styles.badgeOnline : styles.badgeCash,
                            ]}
                          >
                            <Text
                              style={
                                !isCash
                                  ? styles.badgeOnlineText
                                  : styles.badgeCashText
                              }
                            >
                              {!isCash ? 'Online' : 'Cash'}
                            </Text>
                          </View>
                        </View>

                        {/* Order Items Breakdown */}
                        <View style={styles.orderItemsContainer}>
                          {items.length > 0 ? (
                            items.map((it, idx) => (
                              <View key={idx} style={styles.orderItemRow}>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.orderItemName} numberOfLines={1}>
                                    {it.productName}
                                  </Text>
                                  {it.variantColor ? (
                                    <Text style={styles.orderItemVariant}>
                                      Color: {it.variantColor}
                                    </Text>
                                  ) : null}
                                </View>
                                <Text style={styles.orderItemQty}>x{it.quantity}</Text>
                                <Text style={styles.orderItemPrice}>
                                  &#8377;{Number(it.total).toLocaleString('en-IN')}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.orderNoItems}>No item details available</Text>
                          )}
                        </View>

                        {/* Order Financials & View Button */}
                        <View style={styles.orderCardFooter}>
                          <View>
                            <Text style={styles.orderTotalLabel}>Total Amount</Text>
                            <Text style={styles.orderTotalValue}>
                              &#8377;{amt.toLocaleString('en-IN')}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={() => onSelectOrder(ord)}
                            style={styles.orderViewDetailsBtn}
                            accessibilityLabel={`View details for order ${ord.orderNumber}`}
                            accessibilityRole="button"
                          >
                            <Eye size={13} color="#ffffff" style={{ marginRight: 5 }} />
                            <Text style={styles.orderViewDetailsBtnText}>Order Details</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}
          </ScrollView>
        </View>

  );
};

export default InvoiceLedgerView;
