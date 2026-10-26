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
  Edit3,
  Printer,
  ShoppingBag,
  Eye,
  FileText,
  Receipt,
  User,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { Invoice, Order } from '../../types';
import { InvoiceSkeleton, OrderHistorySkeleton } from '../SkeletonLoader';
import styles from '../../screens/InvoiceScreen.styles';

export interface InvoiceLedgerViewProps {
  invoices: Invoice[];
  orders: Order[];
  isLoading?: boolean;
  isLoadingOrders?: boolean;
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
  onEditInvoice?: (inv: Invoice) => void;
  onDeleteOrder?: (id: string, orderNumber: string) => void;
  onDeleteInvoice?: (id: string, invoiceNumber: string) => void;
  onSelectOrder: (order: Order) => void;
  invoicePage?: number;
  invoiceTotalPages?: number;
  invoiceTotalCount?: number;
  onInvoicePrevPage?: () => void;
  onInvoiceNextPage?: () => void;
  orderPage?: number;
  orderTotalPages?: number;
  orderTotalCount?: number;
  onOrderPrevPage?: () => void;
  onOrderNextPage?: () => void;
}

export const InvoiceLedgerView: React.FC<InvoiceLedgerViewProps> = ({
  invoices,
  orders,
  isLoading,
  isLoadingOrders,
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
  onEditInvoice,
  onDeleteOrder,
  onDeleteInvoice,
  onSelectOrder,
  invoicePage = 1,
  invoiceTotalPages = 1,
  invoiceTotalCount,
  onInvoicePrevPage,
  onInvoiceNextPage,
  orderPage = 1,
  orderTotalPages = 1,
  orderTotalCount,
  onOrderPrevPage,
  onOrderNextPage,
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
                {isLoading && (!refreshing || filteredInvoices.length === 0) ? (
                  <InvoiceSkeleton />
                ) : filteredInvoices.length === 0 ? (
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
                    const mode = (inv.mode || (inv as any).paymentMethod || 'cash').toLowerCase();
                    const isCredit = mode === 'credit';
                    const isCash = mode === 'cash';
                    const amt = Number(inv.finalAmount ?? inv.totalAmount ?? 0);
                    const paid = Number(inv.paidAmount ?? 0);
                    const dueAmt =
                      inv.dueAmount !== undefined && inv.dueAmount !== null
                        ? Number(inv.dueAmount)
                        : Math.max(0, amt - paid);
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
                            <View>
                              <Text style={styles.invoiceCardAmount}>
                                &#8377;{amt.toLocaleString('en-IN')}
                              </Text>
                              {isCredit && (
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontWeight: '700',
                                    color: dueAmt > 0 ? '#c2410c' : '#16a34a',
                                    marginTop: 2,
                                  }}
                                >
                                  {dueAmt > 0
                                    ? `Paid: ₹${paid.toLocaleString('en-IN')} • Due: ₹${dueAmt.toLocaleString('en-IN')}`
                                    : `Fully Settled (₹${paid.toLocaleString('en-IN')})`}
                                </Text>
                              )}
                            </View>
                            <View
                              style={[
                                styles.badge,
                                isCredit
                                  ? styles.badgeCredit
                                  : isCash
                                    ? styles.badgeCash
                                    : styles.badgeOnline,
                              ]}
                            >
                              <Text
                                style={
                                  isCredit
                                    ? styles.badgeCreditText
                                    : isCash
                                      ? styles.badgeCashText
                                      : styles.badgeOnlineText
                                }
                              >
                                {isCredit ? 'Credit' : isCash ? 'Cash' : 'Online'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>

                        {onEditInvoice ? (
                          <TouchableOpacity
                            onPress={() => onEditInvoice(inv)}
                            style={[
                              styles.editInvoiceBtn,
                              !onDeleteInvoice && { right: 12 },
                            ]}
                            accessibilityLabel={`Edit invoice ${inv.invoiceNumber || inv.customerName || inv.id}`}
                            accessibilityRole="button"
                          >
                            <Edit3 size={15} color="#ea580c" />
                          </TouchableOpacity>
                        ) : null}

                        {onDeleteInvoice ? (
                          <TouchableOpacity
                            onPress={() =>
                              onDeleteInvoice(
                                inv.id,
                                inv.invoiceNumber || inv.customerName || 'Invoice'
                              )
                            }
                            style={styles.deleteInvoiceBtn}
                            accessibilityLabel={`Delete invoice ${inv.invoiceNumber || inv.customerName || inv.id}`}
                            accessibilityRole="button"
                          >
                            <Trash2 size={15} color="#ef4444" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    );
                  })
                )}

                {/* Invoices Pagination Bar */}
                {invoiceTotalPages > 1 && (
                  <View style={styles.paginationBar}>
                    <Text style={styles.paginationInfo}>
                      Page {invoicePage} of {invoiceTotalPages}
                      {invoiceTotalCount !== undefined ? ` • ${invoiceTotalCount} total` : ''}
                    </Text>
                    <View style={styles.paginationControls}>
                      <TouchableOpacity
                        style={[styles.pageButton, invoicePage <= 1 && styles.pageButtonDisabled]}
                        onPress={onInvoicePrevPage}
                        disabled={invoicePage <= 1}
                        accessibilityLabel="Previous invoice page"
                        accessibilityRole="button"
                      >
                        <ChevronLeft size={16} color={invoicePage <= 1 ? '#d4d4d8' : '#18181b'} />
                      </TouchableOpacity>

                      <View style={styles.pageNumberBadge}>
                        <Text style={styles.pageNumberText}>
                          {invoicePage} / {invoiceTotalPages}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.pageButton, invoicePage >= invoiceTotalPages && styles.pageButtonDisabled]}
                        onPress={onInvoiceNextPage}
                        disabled={invoicePage >= invoiceTotalPages}
                        accessibilityLabel="Next invoice page"
                        accessibilityRole="button"
                      >
                        <ChevronRight size={16} color={invoicePage >= invoiceTotalPages ? '#d4d4d8' : '#18181b'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            ) : (
              // ================= ORDER HISTORY TAB =================
              <>
                <Text style={styles.sectionHeader}>Order History</Text>
                {isLoadingOrders && (!refreshing || filteredOrders.length === 0) ? (
                  <OrderHistorySkeleton />
                ) : filteredOrders.length === 0 ? (
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
                    const ordMode = (ord.paymentMethod || 'cash').toLowerCase();
                    const isCredit = ordMode === 'credit';
                    const isCash = ordMode === 'cash';
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
                              isCredit
                                ? styles.badgeCredit
                                : isCash
                                  ? styles.badgeCash
                                  : styles.badgeOnline,
                            ]}
                          >
                            <Text
                              style={
                                isCredit
                                  ? styles.badgeCreditText
                                  : isCash
                                    ? styles.badgeCashText
                                    : styles.badgeOnlineText
                              }
                            >
                              {isCredit ? 'Credit' : isCash ? 'Cash' : 'Online'}
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

                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {onDeleteOrder ? (
                              <TouchableOpacity
                                onPress={() => onDeleteOrder(ord.id, ord.orderNumber)}
                                style={styles.deleteOrderBtn}
                                accessibilityLabel={`Delete order ${ord.orderNumber}`}
                                accessibilityRole="button"
                              >
                                <Trash2 size={15} color="#ef4444" />
                              </TouchableOpacity>
                            ) : null}

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
                      </View>
                    );
                  })
                )}

                {/* Order History Pagination Bar */}
                {orderTotalPages > 1 && (
                  <View style={styles.paginationBar}>
                    <Text style={styles.paginationInfo}>
                      Page {orderPage} of {orderTotalPages}
                      {orderTotalCount !== undefined ? ` • ${orderTotalCount} total` : ''}
                    </Text>
                    <View style={styles.paginationControls}>
                      <TouchableOpacity
                        style={[styles.pageButton, orderPage <= 1 && styles.pageButtonDisabled]}
                        onPress={onOrderPrevPage}
                        disabled={orderPage <= 1}
                        accessibilityLabel="Previous order history page"
                        accessibilityRole="button"
                      >
                        <ChevronLeft size={16} color={orderPage <= 1 ? '#d4d4d8' : '#18181b'} />
                      </TouchableOpacity>

                      <View style={styles.pageNumberBadge}>
                        <Text style={styles.pageNumberText}>
                          {orderPage} / {orderTotalPages}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.pageButton, orderPage >= orderTotalPages && styles.pageButtonDisabled]}
                        onPress={onOrderNextPage}
                        disabled={orderPage >= orderTotalPages}
                        accessibilityLabel="Next order history page"
                        accessibilityRole="button"
                      >
                        <ChevronRight size={16} color={orderPage >= orderTotalPages ? '#d4d4d8' : '#18181b'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>

  );
};

export default InvoiceLedgerView;
