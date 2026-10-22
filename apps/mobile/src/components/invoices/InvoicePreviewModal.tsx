import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Printer } from 'lucide-react-native';
import styles from '../../screens/InvoiceScreen.styles';

export interface InvoicePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  isViewingPast: boolean;
  activeInvNumber: string;
  activeInvDate: string;
  activePaymentMethod: string;
  activeClientName: string;
  activeClientPhone?: string;
  activeClientEmail?: string;
  activeClientAddress?: string;
  activeItems: any[];
  activeSubtotal: number;
  activeTaxRate: string;
  activeTaxAmount: number;
  activeDiscountAmount: number;
  activeTotalAmount: number;
  activePaidAmount?: number;
  activeDueAmount?: number;
  activeDueDate?: string | null;
  activeNotes?: string;
  isSubmitting?: boolean;
  isExporting?: boolean;
  onShareOrExport: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  visible,
  onClose,
  isViewingPast,
  activeInvNumber,
  activeInvDate,
  activePaymentMethod,
  activeClientName,
  activeClientPhone,
  activeClientEmail,
  activeClientAddress,
  activeItems,
  activeSubtotal,
  activeTaxRate,
  activeTaxAmount,
  activeDiscountAmount,
  activeTotalAmount,
  activePaidAmount,
  activeDueAmount,
  activeDueDate,
  activeNotes,
  isSubmitting,
  isExporting,
  onShareOrExport,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f5' }}>
        <View style={styles.previewContainer}>
          {/* Header */}
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>
              {isViewingPast ? 'Invoice Details' : 'Invoice Preview'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#18181b" />
            </TouchableOpacity>
          </View>

          {/* Paper Preview */}
          <ScrollView style={styles.paperScroll} contentContainerStyle={styles.paperPadding}>
            <View style={styles.paperInvoice}>
              <View style={styles.traditionalBorder} />

              {/* Brand & Invoice Header */}
              <View style={styles.invoiceHeaderRow}>
                <View>
                  <Text style={styles.brandTitle}>JB51</Text>
                  <Text style={styles.brandSubtitle}>EST. 1951 - ATELIER</Text>
                  <Text style={styles.brandAddress}>
                    Chandni Chowk, New Delhi, India{'\n'}atelier@jb51.store
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.invoiceLabel}>INVOICE</Text>
                  <Text style={styles.invoiceDetailLabel}>Invoice Number</Text>
                  <Text style={styles.invoiceDetailValue}>{activeInvNumber}</Text>
                  <Text style={styles.invoiceDetailLabel}>Date</Text>
                  <Text style={styles.invoiceDetailValue}>{activeInvDate}</Text>
                  <Text style={styles.invoiceDetailLabel}>Payment Method</Text>
                  <Text style={styles.invoiceDetailValue}>{activePaymentMethod}</Text>
                </View>
              </View>

              {/* Client Block */}
              <View style={styles.billToBlock}>
                <Text style={styles.billToTitle}>BILL TO</Text>
                <Text style={styles.clientNameValue}>{activeClientName}</Text>
                {activeClientPhone ? (
                  <Text style={styles.clientMetaText}>Phone: {activeClientPhone}</Text>
                ) : null}
                {activeClientEmail ? (
                  <Text style={styles.clientMetaText}>Email: {activeClientEmail}</Text>
                ) : null}
                {activeClientAddress ? (
                  <Text style={styles.clientMetaText}>Address: {activeClientAddress}</Text>
                ) : null}
              </View>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCol, { flex: 2, fontWeight: 'bold' }]}>Item</Text>
                <Text style={[styles.tableCol, { width: 40, textAlign: 'center', fontWeight: 'bold' }]}>
                  Qty
                </Text>
                <Text style={[styles.tableCol, { width: 70, textAlign: 'right', fontWeight: 'bold' }]}>
                  Rate
                </Text>
                <Text style={[styles.tableCol, { width: 80, textAlign: 'right', fontWeight: 'bold' }]}>
                  Total
                </Text>
              </View>

              {/* Table Rows */}
              {activeItems.map((item: any, idx: number) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCol, { flex: 2 }]}>{item.name}</Text>
                  <Text style={[styles.tableCol, { width: 40, textAlign: 'center' }]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.tableCol, { width: 70, textAlign: 'right' }]}>
                    &#8377;{item.price.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.tableCol, { width: 80, textAlign: 'right', fontWeight: 'bold' }]}>
                    &#8377;{item.total.toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}

              {/* Totals */}
              <View style={styles.totalsColumn}>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Subtotal</Text>
                  <Text style={styles.totalsValue}>
                    &#8377;{activeSubtotal.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>GST ({activeTaxRate}%)</Text>
                  <Text style={styles.totalsValue}>
                    &#8377;{activeTaxAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
                {activeDiscountAmount > 0 && (
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>Discount</Text>
                    <Text style={[styles.totalsValue, { color: '#16a34a' }]}>
                      - &#8377;{activeDiscountAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.totalsRow,
                    {
                      borderTopWidth: 1,
                      borderColor: '#e4e4e7',
                      paddingTop: 8,
                      marginTop: 4,
                    },
                  ]}
                >
                  <Text style={styles.grandTotalLabelText}>TOTAL AMOUNT</Text>
                  <Text style={styles.grandTotalValueText}>
                    &#8377;{activeTotalAmount.toLocaleString('en-IN')}
                  </Text>
                </View>

                {activePaymentMethod === 'Credit' && (
                  <View style={{ marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderColor: '#fdba74' }}>
                    <View style={styles.totalsRow}>
                      <Text style={[styles.totalsLabel, { color: '#16a34a', fontWeight: '600' }]}>
                        Advance Paid
                      </Text>
                      <Text style={[styles.totalsValue, { color: '#16a34a', fontWeight: '700' }]}>
                        &#8377;{(activePaidAmount ?? 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.totalsRow}>
                      <Text style={[styles.totalsLabel, { color: '#c2410c', fontWeight: '700' }]}>
                        Remaining Due
                      </Text>
                      <Text style={[styles.totalsValue, { color: '#c2410c', fontWeight: '700' }]}>
                        &#8377;{(activeDueAmount ?? Math.max(0, activeTotalAmount - (activePaidAmount ?? 0))).toLocaleString('en-IN')}
                      </Text>
                    </View>
                    {activeDueDate ? (
                      <View style={styles.totalsRow}>
                        <Text style={[styles.totalsLabel, { color: '#71717a', fontSize: 11 }]}>
                          Payment Due Date
                        </Text>
                        <Text style={[styles.totalsValue, { color: '#71717a', fontSize: 11 }]}>
                          {activeDueDate}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>

              {/* Notes */}
              {activeNotes ? (
                <View style={styles.notesPaperBox}>
                  <Text style={styles.notesPaperTitle}>Notes & Instructions:</Text>
                  <Text style={styles.notesPaperContent}>{activeNotes}</Text>
                </View>
              ) : null}

              {/* Footer */}
              <View style={styles.paperFooter}>
                <Text style={styles.thankYouText}>
                  Thank you for your patronage at JB51.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Export / Create Bar */}
          <View style={styles.exportBar}>
            <TouchableOpacity
              onPress={onShareOrExport}
              disabled={isSubmitting || isExporting}
              style={styles.exportBtn}
              accessibilityRole="button"
            >
              {isSubmitting || isExporting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Printer size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.exportBtnText}>
                    {isViewingPast
                      ? 'Share PDF Invoice'
                      : 'Create & Share Invoice'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default InvoicePreviewModal;
