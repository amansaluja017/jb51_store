import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ShoppingBag,
  X,
  Trash2,
  User,
  PackageCheck,
  Receipt,
} from 'lucide-react-native';
import { Order } from '../../types';
import styles from '../../screens/InvoiceScreen.styles';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onDeleteOrder?: (id: string, orderNumber: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onDeleteOrder,
}) => {
  if (!order) return null;

  return (
      <Modal
        visible={order !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.orderDetailsModalCard}>
            {/* Modal Header */}
            <View style={styles.orderDetailsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShoppingBag size={18} color="#FF5E36" style={{ marginRight: 8 }} />
                <View>
                  <Text style={styles.orderDetailsTitle}>
                    {order.orderNumber || 'Order Details'}
                  </Text>
                  <Text style={styles.orderDetailsSubtitle}>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Recent Order'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
              >
                <X size={18} color="#71717a" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {/* Customer Box */}
              <View style={styles.orderCustomerBox}>
                <Text style={styles.orderSectionTitle}>Customer Information</Text>
                <Text style={styles.orderCustomerNameBig}>
                  {order.customerName || 'Walk-in Customer'}
                </Text>
                {order.customerPhone ? (
                  <Text style={styles.orderCustomerMeta}>
                    Phone: {order.customerPhone}
                  </Text>
                ) : null}
                {order.customerEmail ? (
                  <Text style={styles.orderCustomerMeta}>
                    Email: {order.customerEmail}
                  </Text>
                ) : null}
                {order.customerAddress ? (
                  <Text style={styles.orderCustomerMeta}>
                    Address: {order.customerAddress}
                  </Text>
                ) : null}
              </View>

              {/* Items Table */}
              <Text style={styles.orderSectionTitle}>
                Purchased Items ({order.items?.length || 0})
              </Text>
              <View style={styles.orderItemsTable}>
                {order.items && order.items.length > 0 ? (
                  order.items.map((it, idx) => (
                    <View key={idx} style={styles.orderTableRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.orderTableRowName}>{it.productName}</Text>
                        {it.variantColor ? (
                          <Text style={styles.orderTableRowVariant}>
                            Color: {it.variantColor}
                          </Text>
                        ) : null}
                        <Text style={styles.orderTableRowRate}>
                          {it.quantity} x &#8377;{Number(it.unitPrice).toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <Text style={styles.orderTableRowTotal}>
                        &#8377;{Number(it.total).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.orderNoItems}>No item records found</Text>
                )}
              </View>

              {/* Financial Summary */}
              <View style={styles.orderFinancialsBox}>
                {order.subtotal ? (
                  <View style={styles.orderSummaryRow}>
                    <Text style={styles.orderSummaryLabel}>Subtotal</Text>
                    <Text style={styles.orderSummaryValue}>
                      &#8377;{Number(order.subtotal).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ) : null}
                {Number(order.gst || 0) > 0 ? (
                  <View style={styles.orderSummaryRow}>
                    <Text style={styles.orderSummaryLabel}>
                      GST / Tax{order.taxRate && Number(order.taxRate) > 0 ? ` (${order.taxRate}%)` : ''}
                    </Text>
                    <Text style={styles.orderSummaryValue}>
                      &#8377;{Number(order.gst).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ) : null}
                {Number(order.discount || 0) > 0 ? (
                  <View style={styles.orderSummaryRow}>
                    <Text style={styles.orderSummaryLabel}>Discount</Text>
                    <Text style={[styles.orderSummaryValue, { color: '#16a34a' }]}>
                      - &#8377;{Number(order.discount).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ) : null}
                <View style={[styles.orderSummaryRow, styles.orderGrandTotalRow]}>
                  <Text style={styles.orderGrandTotalLabel}>Total Amount</Text>
                  <Text style={styles.orderGrandTotalValue}>
                    &#8377;{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Additional Details */}
              <View style={styles.orderMetaBlock}>
                <Text style={styles.orderMetaItem}>
                  Status: <Text style={{ fontWeight: '700', color: '#16a34a' }}>{order.status || 'Confirmed'}</Text>
                </Text>
                <Text style={styles.orderMetaItem}>
                  Order Type: <Text style={{ fontWeight: '700', color: (order.orderType || 'offline') === 'online' ? '#2563eb' : '#71717a' }}>{(order.orderType || 'offline') === 'online' ? '🌐 Online Order' : '🏪 Offline / Walk-in'}</Text>
                </Text>
                <Text style={styles.orderMetaItem}>
                  Payment Mode: <Text style={{ fontWeight: '700', color: '#09090b' }}>{order.paymentMethod === 'online' ? 'Online Payment' : 'Cash Payment'}</Text>
                </Text>
                {order.notes ? (
                  <Text style={styles.orderMetaItem}>
                    Notes: <Text style={{ color: '#71717a' }}>{order.notes}</Text>
                  </Text>
                ) : null}
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                {onDeleteOrder ? (
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onDeleteOrder(order.id, order.orderNumber);
                    }}
                    style={[styles.orderDeleteModalBtn, { flex: 1 }]}
                    accessibilityLabel={`Delete order ${order.orderNumber}`}
                    accessibilityRole="button"
                  >
                    <Trash2 size={16} color="#ef4444" style={{ marginRight: 6 }} />
                    <Text style={styles.orderDeleteModalBtnText}>Delete Order</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.generateButton, { flex: 1, marginTop: 0 }]}
                  accessibilityLabel="Close order details modal"
                  accessibilityRole="button"
                >
                  <Text style={styles.generateButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

  );
};

export default OrderDetailsModal;
