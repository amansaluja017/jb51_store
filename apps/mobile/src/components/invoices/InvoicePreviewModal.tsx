import React, { useState } from 'react';
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
import { formatDateSafe } from '../../utils/date';

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
  activePaymentDate?: string | null;
  activeAdvancePaymentMode?: string | null;
  activeTransactions?: any[];
  activeNotes?: string;
  isEditing?: boolean;
  isSubmitting?: boolean;
  isExporting?: boolean;
  onShareOrExport: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  visible,
  onClose,
  isViewingPast,
  isEditing,
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
  activePaymentDate,
  activeAdvancePaymentMode,
  activeTransactions = [],
  activeNotes,
  isSubmitting,
  isExporting,
  onShareOrExport,
}) => {
  const [selectedViewPage, setSelectedViewPage] = useState<'all' | 'page1' | 'page2'>('all');

  const isCredit = (activePaymentMethod || '').toLowerCase() === 'credit';
  const totalPaid = activePaidAmount ?? 0;
  const balanceDue =
    activeDueAmount !== undefined && activeDueAmount !== null
      ? activeDueAmount
      : Math.max(0, activeTotalAmount - totalPaid);

  // Consolidate credit transactions list
  const txList = [...activeTransactions];
  if (isCredit && txList.length === 0 && totalPaid > 0) {
    txList.push({
      createdAt: activeInvDate,
      transactionType: 'advance',
      paymentMode: activeAdvancePaymentMode || 'Cash',
      amount: totalPaid,
      notes: 'Initial advance payment on invoice creation',
    });
  }

  // Sort transactions chronologically
  txList.sort((a: any, b: any) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeA - timeB;
  });

  // Calculate totals
  const totalAdvance = txList
    .filter((tx: any) => (tx.transactionType || '').toLowerCase() === 'advance')
    .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);

  const totalInstallments = txList
    .filter((tx: any) => (tx.transactionType || '').toLowerCase() !== 'advance')
    .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);

  // Compute running balance
  let runningDue = activeTotalAmount;
  const enrichedTransactions = txList.map((tx: any) => {
    const amt = Number(tx.amount || 0);
    runningDue = Math.max(0, runningDue - amt);
    return {
      ...tx,
      runningBalance: runningDue,
    };
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f5' }}>
        <View style={styles.previewContainer}>
          {/* Header */}
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewTitle}>
                {isViewingPast ? 'Invoice Details' : 'Invoice Preview'}
              </Text>
              {isCredit && (
                <Text style={{ fontSize: 11, color: '#c2410c', fontWeight: '700', marginTop: 2 }}>
                  Multi-page Invoice • 2 Pages (Invoice + Credit Ledger)
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#18181b" />
            </TouchableOpacity>
          </View>

          {/* Multi-page Segmented Tab Switcher (When Credit) */}
          {isCredit && (
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#e4e4e7',
                borderRadius: 8,
                padding: 3,
                marginHorizontal: 16,
                marginTop: 8,
                marginBottom: 2,
              }}
            >
              <TouchableOpacity
                onPress={() => setSelectedViewPage('all')}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  alignItems: 'center',
                  borderRadius: 6,
                  backgroundColor: selectedViewPage === 'all' ? '#ffffff' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: selectedViewPage === 'all' ? '800' : '600',
                    color: selectedViewPage === 'all' ? '#c2410c' : '#71717a',
                  }}
                >
                  All Pages (2)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedViewPage('page1')}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  alignItems: 'center',
                  borderRadius: 6,
                  backgroundColor: selectedViewPage === 'page1' ? '#ffffff' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: selectedViewPage === 'page1' ? '800' : '600',
                    color: selectedViewPage === 'page1' ? '#18181b' : '#71717a',
                  }}
                >
                  Page 1: Invoice
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedViewPage('page2')}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  alignItems: 'center',
                  borderRadius: 6,
                  backgroundColor: selectedViewPage === 'page2' ? '#ffffff' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: selectedViewPage === 'page2' ? '800' : '600',
                    color: selectedViewPage === 'page2' ? '#c2410c' : '#71717a',
                  }}
                >
                  Page 2: Credit Ledger
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Paper Preview */}
          <ScrollView style={styles.paperScroll} contentContainerStyle={styles.paperPadding}>
            {/* ================= PAGE 1: TAX INVOICE ================= */}
            {(!isCredit || selectedViewPage === 'all' || selectedViewPage === 'page1') && (
              <View style={styles.paperInvoice}>
                <View style={styles.traditionalBorder} />

                {/* Brand & Invoice Header */}
                <View style={styles.invoiceHeaderRow}>
                  <View>
                    <Text style={styles.brandTitle}>JB51</Text>
                    <Text style={styles.brandSubtitle}>EST. 1951 - ATELIER</Text>
                    <Text style={styles.brandAddress}>
                      Chandni Chowk, New Delhi, India{'\n'}support@jb51.shop
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.invoiceLabel}>INVOICE</Text>
                    <Text style={styles.invoiceDetailLabel}>Invoice Number</Text>
                    <Text style={styles.invoiceDetailValue}>{activeInvNumber}</Text>
                    <Text style={styles.invoiceDetailLabel}>Invoice Date</Text>
                    <Text style={styles.invoiceDetailValue}>{activeInvDate}</Text>
                    <Text style={styles.invoiceDetailLabel}>Payment Date</Text>
                    <Text style={styles.invoiceDetailValue}>
                      {activePaymentDate || activeInvDate}
                    </Text>
                    <Text style={styles.invoiceDetailLabel}>Payment Method</Text>
                    <Text
                      style={[
                        styles.invoiceDetailValue,
                        isCredit && { color: '#c2410c', fontWeight: '800' },
                      ]}
                    >
                      {activePaymentMethod}
                    </Text>
                  </View>
                </View>

                {/* Client Block */}
                <View style={styles.billToBlock}>
                  <Text style={styles.billToTitle}>BILL TO</Text>
                  <Text style={styles.clientNameValue}>{activeClientName || 'Walk-in Customer'}</Text>
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

                {/* Items Table */}
                <View style={{ marginVertical: 14 }}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCol, { flex: 2, fontWeight: '700' }]}>Item</Text>
                    <Text style={[styles.tableCol, { flex: 0.6, textAlign: 'center', fontWeight: '700' }]}>Qty</Text>
                    <Text style={[styles.tableCol, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>Rate</Text>
                    <Text style={[styles.tableCol, { flex: 1.2, textAlign: 'right', fontWeight: '700' }]}>Amount</Text>
                  </View>

                  {activeItems.map((item: any, index: number) => {
                    const price = Number(item.price || item.unitPrice || 0);
                    const qty = Number(item.quantity || 1);
                    const itemTotal = Number(item.total || price * qty);
                    return (
                      <View key={item.id || index} style={styles.tableRow}>
                        <View style={{ flex: 2 }}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#18181b' }}>
                            {item.name || item.productName}
                          </Text>
                          {item.variantColor ? (
                            <Text style={{ fontSize: 10, color: '#71717a' }}>
                              Color: {item.variantColor}
                            </Text>
                          ) : null}
                        </View>
                        <Text style={{ flex: 0.6, textAlign: 'center', fontSize: 11, color: '#52525b' }}>
                          {qty}
                        </Text>
                        <Text style={{ flex: 1, textAlign: 'right', fontSize: 11, color: '#52525b' }}>
                          &#8377;{price.toLocaleString('en-IN')}
                        </Text>
                        <Text style={{ flex: 1.2, textAlign: 'right', fontSize: 11, fontWeight: '700', color: '#18181b' }}>
                          &#8377;{itemTotal.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Totals Section */}
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
                      <Text style={[styles.totalsLabel, { color: '#16a34a' }]}>Discount</Text>
                      <Text style={[styles.totalsValue, { color: '#16a34a' }]}>
                        - &#8377;{activeDiscountAmount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  )}

                  <View style={{ borderTopWidth: 1, borderTopColor: '#18181b', marginVertical: 4 }} />

                  <View style={styles.totalsRow}>
                    <Text style={styles.grandTotalLabelText}>Grand Total</Text>
                    <Text style={styles.grandTotalValueText}>
                      &#8377;{activeTotalAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  {isCredit && (
                    <View
                      style={{
                        marginTop: 8,
                        paddingTop: 6,
                        borderTopWidth: 1,
                        borderColor: '#fdba74',
                      }}
                    >
                      <View style={styles.totalsRow}>
                        <Text style={[styles.totalsLabel, { color: '#16a34a', fontWeight: '600' }]}>
                          Advance Paid
                        </Text>
                        <Text style={[styles.totalsValue, { color: '#16a34a', fontWeight: '700' }]}>
                          &#8377;{totalPaid.toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <View style={styles.totalsRow}>
                        <Text style={[styles.totalsLabel, { color: '#c2410c', fontWeight: '700' }]}>
                          Remaining Due
                        </Text>
                        <Text style={[styles.totalsValue, { color: '#c2410c', fontWeight: '800' }]}>
                          &#8377;{balanceDue.toLocaleString('en-IN')}
                        </Text>
                      </View>
                      {activeDueDate ? (
                        <View style={styles.totalsRow}>
                          <Text style={[styles.totalsLabel, { color: '#71717a', fontSize: 10 }]}>
                            Payment Due Date
                          </Text>
                          <Text style={[styles.totalsValue, { color: '#71717a', fontSize: 10 }]}>
                            {formatDateSafe(activeDueDate)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  )}
                </View>

                {/* Multi-page Notice on Page 1 (for Credit) */}
                {isCredit && (
                  <View
                    style={{
                      marginTop: 16,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: '#fffaf5',
                      borderWidth: 1,
                      borderColor: '#fed7aa',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#c2410c' }}>
                        Credit Terms Apply
                      </Text>
                      <Text style={{ fontSize: 10, color: '#7c2d12', marginTop: 2 }}>
                        Complete breakdown of advance, installment payments & balance ledger is on{' '}
                        <Text style={{ fontWeight: '700' }}>Page 2</Text>.
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: '#ffedd5',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: '800', color: '#c2410c' }}>
                        See Page 2
                      </Text>
                    </View>
                  </View>
                )}

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
                    Thank you for your purchasing at JB51.
                  </Text>
                  {isCredit && (
                    <Text style={{ fontSize: 10, color: '#a1a1aa', marginTop: 4 }}>
                      Page 1 of 2 • Tax Invoice
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Visual Page Break Separator (when viewing All Pages) */}
            {isCredit && selectedViewPage === 'all' && (
              <View
                style={{
                  alignItems: 'center',
                  marginVertical: 18,
                }}
              >
                <View
                  style={{
                    backgroundColor: '#e4e4e7',
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#d4d4d8',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '800',
                      color: '#52525b',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    --- PAGE 2: CREDIT STATEMENT & TRANSACTION LEDGER ---
                  </Text>
                </View>
              </View>
            )}

            {/* ================= PAGE 2: CREDIT LEDGER STATEMENT ================= */}
            {isCredit && (selectedViewPage === 'all' || selectedViewPage === 'page2') && (
              <View style={styles.paperInvoice}>
                <View style={[styles.traditionalBorder, { backgroundColor: '#c2410c' }]} />

                {/* Brand & Statement Header */}
                <View style={styles.invoiceHeaderRow}>
                  <View>
                    <Text style={styles.brandTitle}>JB51</Text>
                    <Text style={[styles.brandSubtitle, { color: '#c2410c' }]}>
                      EST. 1951 - ATELIER
                    </Text>
                    <Text style={styles.brandAddress}>
                      Chandni Chowk, New Delhi, India{'\n'}support@jb51.shop | +91 98100 00051
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.invoiceLabel, { color: '#c2410c', fontSize: 16 }]}>
                      CREDIT LEDGER
                    </Text>
                    <Text style={styles.invoiceDetailLabel}>Ref Invoice Number</Text>
                    <Text style={styles.invoiceDetailValue}>{activeInvNumber}</Text>
                    <Text style={styles.invoiceDetailLabel}>Invoice Date</Text>
                    <Text style={styles.invoiceDetailValue}>{activeInvDate}</Text>
                    <Text style={styles.invoiceDetailLabel}>Customer Account</Text>
                    <Text style={styles.invoiceDetailValue} numberOfLines={1}>
                      {activeClientName || 'Walk-in Customer'}
                    </Text>
                  </View>
                </View>

                {/* Financial Summary 4-Metric Grid */}
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginTop: 14,
                    marginBottom: 16,
                  }}
                >
                  {/* Card 1: Total Value */}
                  <View
                    style={{
                      flex: 1,
                      minWidth: '45%',
                      backgroundColor: '#f8fafc',
                      borderRadius: 6,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                      Total Invoice Value
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#0f172a', marginTop: 2 }}>
                      ₹{activeTotalAmount.toLocaleString('en-IN')}
                    </Text>
                    <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 1 }}>Principal Bill</Text>
                  </View>

                  {/* Card 2: Advance Paid */}
                  <View
                    style={{
                      flex: 1,
                      minWidth: '45%',
                      backgroundColor: '#f0fdf4',
                      borderRadius: 6,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: '#bbf7d0',
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#15803d', textTransform: 'uppercase' }}>
                      Advance Paid
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#16a34a', marginTop: 2 }}>
                      ₹{totalAdvance.toLocaleString('en-IN')}
                    </Text>
                    <Text style={{ fontSize: 8, color: '#15803d', marginTop: 1 }}>
                      {(activeAdvancePaymentMode || 'Cash').toUpperCase()}
                    </Text>
                  </View>

                  {/* Card 3: Installments Paid */}
                  <View
                    style={{
                      flex: 1,
                      minWidth: '45%',
                      backgroundColor: '#f0f9ff',
                      borderRadius: 6,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: '#bae6fd',
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#0369a1', textTransform: 'uppercase' }}>
                      Installments
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#0284c7', marginTop: 2 }}>
                      ₹{totalInstallments.toLocaleString('en-IN')}
                    </Text>
                    <Text style={{ fontSize: 8, color: '#0369a1', marginTop: 1 }}>
                      {enrichedTransactions.filter((t: any) => (t.transactionType || '').toLowerCase() !== 'advance').length} Payments Received
                    </Text>
                  </View>

                  {/* Card 4: Outstanding Due */}
                  <View
                    style={{
                      flex: 1,
                      minWidth: '45%',
                      backgroundColor: '#fff7ed',
                      borderRadius: 6,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: '#fed7aa',
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#c2410c', textTransform: 'uppercase' }}>
                      Outstanding Due
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#ea580c', marginTop: 2 }}>
                      ₹{balanceDue.toLocaleString('en-IN')}
                    </Text>
                    <Text style={{ fontSize: 8, color: '#c2410c', marginTop: 1 }}>
                      {activeDueDate ? `Due: ${formatDateSafe(activeDueDate)}` : 'On Account'}
                    </Text>
                  </View>
                </View>

                {/* Transactions Ledger Table */}
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#fed7aa',
                    borderRadius: 8,
                    backgroundColor: '#fffaf5',
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottomWidth: 1,
                      borderBottomColor: '#fed7aa',
                      paddingBottom: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '800',
                        color: '#c2410c',
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                      }}
                    >
                      Credit Ledger Statement ({enrichedTransactions.length})
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: '#c2410c',
                        backgroundColor: '#ffedd5',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      Balance Due: ₹{balanceDue.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  {/* Table Header Row */}
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingVertical: 5,
                      borderBottomWidth: 1,
                      borderBottomColor: '#fed7aa',
                    }}
                  >
                    <Text style={{ flex: 1.1, fontSize: 9, fontWeight: '800', color: '#9a3412' }}>Date</Text>
                    <Text style={{ flex: 1.4, fontSize: 9, fontWeight: '800', color: '#9a3412' }}>Type</Text>
                    <Text style={{ flex: 0.9, fontSize: 9, fontWeight: '800', color: '#9a3412' }}>Mode</Text>
                    <Text style={{ flex: 1.1, textAlign: 'right', fontSize: 9, fontWeight: '800', color: '#9a3412' }}>
                      Paid
                    </Text>
                    <Text style={{ flex: 1.1, textAlign: 'right', fontSize: 9, fontWeight: '800', color: '#9a3412' }}>
                      Balance
                    </Text>
                  </View>

                  {/* Table Transaction Rows */}
                  {enrichedTransactions.length === 0 ? (
                    <Text style={{ textAlign: 'center', paddingVertical: 14, color: '#a1a1aa', fontSize: 11 }}>
                      No payment transactions recorded yet.
                    </Text>
                  ) : (
                    enrichedTransactions.map((tx: any, idx: number) => {
                      const type = (tx.transactionType || 'payment').toLowerCase();
                      const isAdvance = type === 'advance';
                      const txDate = formatDateSafe(tx.createdAt) || activeInvDate;
                      const modeLabel = (tx.paymentMode || 'cash').toUpperCase();
                      const amt = Number(tx.amount || 0);
                      const rowBalance = Number(tx.runningBalance || 0);

                      return (
                        <View
                          key={idx}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 7,
                            borderBottomWidth: idx < enrichedTransactions.length - 1 ? 1 : 0,
                            borderBottomColor: '#ffedd5',
                          }}
                        >
                          <Text style={{ flex: 1.1, fontSize: 9, color: '#3f3f46', fontWeight: '500' }}>
                            {txDate}
                          </Text>
                          <View style={{ flex: 1.4 }}>
                            <Text
                              style={{
                                fontSize: 9,
                                fontWeight: '700',
                                color: isAdvance ? '#16a34a' : '#0284c7',
                              }}
                            >
                              {isAdvance ? 'Advance' : 'Installment'}
                            </Text>
                            {tx.notes ? (
                              <Text style={{ fontSize: 8, color: '#71717a' }} numberOfLines={1}>
                                {tx.notes}
                              </Text>
                            ) : null}
                          </View>
                          <Text style={{ flex: 0.9, fontSize: 9, fontWeight: '600', color: '#18181b' }}>
                            {modeLabel}
                          </Text>
                          <Text style={{ flex: 1.1, textAlign: 'right', fontSize: 9, fontWeight: '700', color: '#16a34a' }}>
                            + ₹{amt.toLocaleString('en-IN')}
                          </Text>
                          <Text
                            style={{
                              flex: 1.1,
                              textAlign: 'right',
                              fontSize: 9,
                              fontWeight: '800',
                              color: rowBalance > 0 ? '#c2410c' : '#16a34a',
                            }}
                          >
                            ₹{rowBalance.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>

                {/* Settlement Terms Notice */}
                <View
                  style={{
                    backgroundColor: '#fafafa',
                    borderRadius: 6,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: '#e4e4e7',
                    marginBottom: 20,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '700', color: '#52525b', marginBottom: 2 }}>
                    Settlement Terms & Policy:
                  </Text>
                  <Text style={{ fontSize: 8.5, color: '#71717a', lineHeight: 12 }}>
                    • All payments recorded above have been credited against Invoice #{activeInvNumber}.{'\n'}
                    {activeDueDate
                      ? `• Complete outstanding balance of ₹${balanceDue.toLocaleString('en-IN')} is payable on or before ${formatDateSafe(activeDueDate)}.\n`
                      : ''}
                    • For payment verification or inquiries, contact support@jb51.shop.
                  </Text>
                </View>

                {/* Footer */}
                <View style={styles.paperFooter}>
                  <Text style={{ fontSize: 9, color: '#a1a1aa', textAlign: 'center' }}>
                    Page 2 of 2 • Official JB51 Credit Ledger Statement
                  </Text>
                </View>
              </View>
            )}
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
                    {isCredit
                      ? isViewingPast
                        ? 'Share 2-Page PDF Invoice'
                        : isEditing
                          ? 'Update & Share 2-Page Invoice'
                          : 'Create & Share 2-Page Invoice'
                      : isViewingPast
                        ? 'Share PDF Invoice'
                        : isEditing
                          ? 'Update & Share Invoice'
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
