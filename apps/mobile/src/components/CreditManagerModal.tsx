import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Linking,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Search,
  Plus,
  Edit3,
  Trash2,
  Phone,
  CreditCard,
  Calendar,
  AlertTriangle,
  Check,
  TrendingDown,
  TrendingUp,
  Receipt,
  History,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { Credit, CreditMetrics, CreditTransaction } from '../types';
import { formatDateSafe, formatDateToYMD } from '../utils/date';

export interface CreditManagerModalProps {
  visible: boolean;
  credits: Credit[];
  metrics: CreditMetrics | null;
  isLoading: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onCreateCredit?: (data: {
    orderId?: string | null;
    invoiceId?: string | null;
    paidAmount: number;
    dueAmount: number;
    dueDate?: string | null;
    advancePaymentMode?: string | null;
    notes?: string | null;
  }) => Promise<any>;
  onUpdateCredit: (data: {
    id: string;
    paidAmount?: number;
    dueAmount?: number;
    dueDate?: string | null;
    advancePaymentMode?: string | null;
  }) => Promise<any>;
  onRecordPayment: (
    id: string,
    amount: number,
    paymentMode?: string,
    notes?: string
  ) => Promise<any>;
  onDeleteCredit: (id: string, skipConfirm?: boolean) => Promise<void> | void;
  onFetchPaginatedCredits?: (params?: any) => Promise<any>;
  showAlert: (
    title: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
}

type FilterTab = 'all' | 'pending' | 'overdue' | 'settled';

export const CreditManagerModal: React.FC<CreditManagerModalProps> = ({
  visible,
  credits,
  metrics,
  isLoading,
  onClose,
  onRefresh,
  onCreateCredit,
  onUpdateCredit,
  onRecordPayment,
  onDeleteCredit,
  onFetchPaginatedCredits,
  showAlert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  // Paginated remote credits state
  const [creditPage, setCreditPage] = useState(1);
  const [creditTotalPages, setCreditTotalPages] = useState(1);
  const [creditTotalCount, setCreditTotalCount] = useState(0);
  const [remoteCredits, setRemoteCredits] = useState<Credit[] | null>(null);
  const [isLoadingRemoteCredits, setIsLoadingRemoteCredits] = useState(false);

  // Fetch paginated credits from backend
  useEffect(() => {
    if (!visible || !onFetchPaginatedCredits) return;

    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        setIsLoadingRemoteCredits(true);
        const res = await onFetchPaginatedCredits({
          page: creditPage,
          limit: 15,
          search: searchQuery.trim() || undefined,
          status: filterTab,
        });
        if (!isCancelled && res) {
          setRemoteCredits(res.items || []);
          setCreditTotalPages(res.totalPages || 1);
          setCreditTotalCount(res.totalCount || 0);
        }
      } catch (err) {
        console.error('[fetchPaginatedCredits] Error:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingRemoteCredits(false);
        }
      }
    }, searchQuery ? 250 : 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [visible, creditPage, filterTab, searchQuery, onFetchPaginatedCredits]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCreditPage(1);
  };

  const handleFilterTabChange = (tab: FilterTab) => {
    setFilterTab(tab);
    setCreditPage(1);
  };

  // Receive Payment Modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [activeCreditForPayment, setActiveCreditForPayment] = useState<Credit | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentModeInput, setPaymentModeInput] = useState<'cash' | 'online'>('cash');
  const [paymentNotesInput, setPaymentNotesInput] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Transactions History Modal state
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [activeCreditForHistory, setActiveCreditForHistory] = useState<Credit | null>(null);

  // Delete confirmation warning state
  const [creditToDelete, setCreditToDelete] = useState<Credit | null>(null);

  // Edit Credit Modal state
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingCredit, setEditingCredit] = useState<Credit | null>(null);
  const [formPaidAmount, setFormPaidAmount] = useState('');
  const [formDueAmount, setFormDueAmount] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAdvanceMode, setFormAdvanceMode] = useState<'cash' | 'online'>('cash');
  const [formNotes, setFormNotes] = useState('');
  const [isSavingForm, setIsSavingForm] = useState(false);

  // Open Quick Payment Modal
  const openPaymentModal = (credit: Credit) => {
    setActiveCreditForPayment(credit);
    setPaymentAmountInput(String(Number(credit.dueAmount) || ''));
    setPaymentModeInput('cash');
    setPaymentNotesInput('');
    setPaymentModalVisible(true);
  };

  // Submit Quick Payment
  const handleSubmitPayment = async () => {
    if (!activeCreditForPayment) return;
    const amount = Number(paymentAmountInput.trim());
    if (isNaN(amount) || amount <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid positive payment amount.', 'error');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      await onRecordPayment(
        activeCreditForPayment.id,
        amount,
        paymentModeInput,
        paymentNotesInput.trim() || undefined
      );
      setPaymentModalVisible(false);
      setActiveCreditForPayment(null);
    } catch {
      // Handled in hook
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Open History Modal
  const openHistoryModal = (credit: Credit) => {
    setActiveCreditForHistory(credit);
    setHistoryModalVisible(true);
  };

  // Open Edit Credit Form
  const openEditForm = (credit: Credit) => {
    setEditingCredit(credit);
    setFormPaidAmount(String(Number(credit.paidAmount) || 0));
    setFormDueAmount(String(Number(credit.dueAmount) || 0));
    setFormDueDate(formatDateToYMD(credit.dueDate));
    setFormAdvanceMode(
      (credit.advancePaymentMode || '').toLowerCase() === 'online' ? 'online' : 'cash'
    );
    setFormNotes('');
    setFormModalVisible(true);
  };

  // Submit Edit Form
  const handleSaveForm = async () => {
    if (!editingCredit) return;
    const paid = Number(formPaidAmount.trim()) || 0;
    const due = Number(formDueAmount.trim());

    if (isNaN(due) || due < 0) {
      showAlert('Due Amount Required', 'Please enter a valid due amount.', 'error');
      return;
    }

    setIsSavingForm(true);
    try {
      await onUpdateCredit({
        id: editingCredit.id,
        paidAmount: paid,
        dueAmount: due,
        dueDate: formDueDate.trim() || null,
        advancePaymentMode: paid > 0 ? formAdvanceMode : null,
      });
      setFormModalVisible(false);
    } catch {
      // Handled in hook
    } finally {
      setIsSavingForm(false);
    }
  };

  // Filter credits
  const filteredCredits = useMemo(() => {
    if (remoteCredits !== null) {
      return remoteCredits;
    }
    let list = [...credits];

    // Filter by tab
    const now = Date.now();
    if (filterTab === 'pending') {
      list = list.filter(c => Number(c.dueAmount) > 0);
    } else if (filterTab === 'overdue') {
      list = list.filter(
        c =>
          Number(c.dueAmount) > 0 &&
          c.dueDate &&
          new Date(c.dueDate).getTime() < now
      );
    } else if (filterTab === 'settled') {
      list = list.filter(c => Number(c.dueAmount) <= 0);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        c =>
          (c.customerName && c.customerName.toLowerCase().includes(q)) ||
          (c.customerPhone && c.customerPhone.toLowerCase().includes(q)) ||
          (c.orderNumber && c.orderNumber.toLowerCase().includes(q)) ||
          (c.invoiceNumber && c.invoiceNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }, [remoteCredits, credits, filterTab, searchQuery]);

  const handleCall = (phoneNumber?: string | null) => {
    if (!phoneNumber) return;
    const url = `tel:${phoneNumber.replace(/\s+/g, '')}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  const isOverdue = (credit: Credit) => {
    return (
      Number(credit.dueAmount) > 0 &&
      !!credit.dueDate &&
      new Date(credit.dueDate).getTime() < Date.now()
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <X size={20} color="#09090b" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Manage Credits</Text>
            <Text style={styles.headerSubtitle}>
              {credits.length} credit {credits.length === 1 ? 'account' : 'accounts'} on record
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Top KPI Metrics Banner */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconBoxDue}>
              <TrendingDown size={16} color="#DC2626" />
            </View>
            <Text style={styles.metricValueDue}>
              ₹{(metrics?.totalDue || 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.metricLabel}>Total Due Balance</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconBoxPaid}>
              <TrendingUp size={16} color="#10B981" />
            </View>
            <Text style={styles.metricValuePaid}>
              ₹{(metrics?.totalPaid || 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.metricLabel}>Total Collected</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconBoxOverdue}>
              <AlertTriangle size={16} color="#F59E0B" />
            </View>
            <Text style={styles.metricValueOverdue}>
              {metrics?.overdueCount || 0}
            </Text>
            <Text style={styles.metricLabel}>Overdue Accounts</Text>
          </View>
        </View>

        {/* Search & Filter Controls */}
        <View style={styles.controlsSection}>
          <View style={styles.searchBox}>
            <Search size={16} color="#71717a" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by customer, phone, order #..."
              placeholderTextColor="#a1a1aa"
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')} style={styles.clearBtn}>
                <X size={14} color="#71717a" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsRow}
          >
            <TouchableOpacity
              onPress={() => handleFilterTabChange('all')}
              style={[styles.filterChip, filterTab === 'all' && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterTab === 'all' && styles.filterChipTextActive,
                ]}
              >
                All ({creditTotalCount || credits.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleFilterTabChange('pending')}
              style={[styles.filterChip, filterTab === 'pending' && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterTab === 'pending' && styles.filterChipTextActive,
                ]}
              >
                Pending ({metrics?.pendingCount || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleFilterTabChange('overdue')}
              style={[styles.filterChip, filterTab === 'overdue' && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterTab === 'overdue' && styles.filterChipTextActive,
                ]}
              >
                Overdue ({metrics?.overdueCount || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleFilterTabChange('settled')}
              style={[styles.filterChip, filterTab === 'settled' && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterTab === 'settled' && styles.filterChipTextActive,
                ]}
              >
                Settled ({metrics?.settledCount || 0})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Credits List */}
        <FlatList
          data={filteredCredits}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading || isLoadingRemoteCredits}
              onRefresh={onRefresh}
              tintColor="#FF5E36"
              colors={['#FF5E36']}
            />
          }
          ListFooterComponent={
            creditTotalPages > 1 ? (
              <View style={styles.paginationBar}>
                <Text style={styles.paginationInfo}>
                  Page {creditPage} of {creditTotalPages}
                  {creditTotalCount !== undefined ? ` • ${creditTotalCount} total` : ''}
                </Text>
                <View style={styles.paginationControls}>
                  <TouchableOpacity
                    style={[styles.pageButton, creditPage <= 1 && styles.pageButtonDisabled]}
                    onPress={() => setCreditPage(p => Math.max(1, p - 1))}
                    disabled={creditPage <= 1}
                    accessibilityLabel="Previous page"
                    accessibilityRole="button"
                  >
                    <ChevronLeft size={16} color={creditPage <= 1 ? '#d4d4d8' : '#18181b'} />
                  </TouchableOpacity>

                  <View style={styles.pageNumberBadge}>
                    <Text style={styles.pageNumberText}>
                      {creditPage} / {creditTotalPages}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.pageButton, creditPage >= creditTotalPages && styles.pageButtonDisabled]}
                    onPress={() => setCreditPage(p => Math.min(creditTotalPages, p + 1))}
                    disabled={creditPage >= creditTotalPages}
                    accessibilityLabel="Next page"
                    accessibilityRole="button"
                  >
                    <ChevronRight size={16} color={creditPage >= creditTotalPages ? '#d4d4d8' : '#18181b'} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <CreditCard size={36} color="#a1a1aa" />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No Matching Credits' : 'No Credit Records Found'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No credit account matches "${searchQuery}".`
                  : 'Customer credits are recorded automatically when creating invoices with credit or pending balance dues.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const dueNum = Number(item.dueAmount) || 0;
            const paidNum = Number(item.paidAmount) || 0;
            const totalNum = dueNum + paidNum;
            const overdue = isOverdue(item);
            const settled = dueNum <= 0;
            const txCount = item.transactions?.length || (paidNum > 0 ? 1 : 0);

            return (
              <View style={styles.creditCard}>
                {/* Top Row: Customer Name & Status Badge */}
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.customerName}>
                      {item.customerName || 'Walk-in Customer'}
                    </Text>
                    {item.customerPhone ? (
                      <TouchableOpacity
                        onPress={() => handleCall(item.customerPhone)}
                        style={styles.phoneRow}
                      >
                        <Phone size={12} color="#FF5E36" />
                        <Text style={styles.phoneText}>{item.customerPhone}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      settled
                        ? styles.statusSettled
                        : overdue
                        ? styles.statusOverdue
                        : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        settled
                          ? styles.statusTextSettled
                          : overdue
                          ? styles.statusTextOverdue
                          : styles.statusTextPending,
                      ]}
                    >
                      {settled ? 'SETTLED' : overdue ? 'OVERDUE' : 'PENDING'}
                    </Text>
                  </View>
                </View>

                {/* Linked Order/Invoice & Advance Badges */}
                <View style={styles.linkedRow}>
                  {item.orderNumber && (
                    <View style={styles.linkedChip}>
                      <Receipt size={11} color="#64748B" />
                      <Text style={styles.linkedChipText}>{item.orderNumber}</Text>
                    </View>
                  )}
                  {item.invoiceNumber && (
                    <View style={styles.linkedChip}>
                      <Receipt size={11} color="#64748B" />
                      <Text style={styles.linkedChipText}>{item.invoiceNumber}</Text>
                    </View>
                  )}
                  {item.advancePaymentMode ? (
                    <View style={[styles.linkedChip, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
                      <Text style={[styles.linkedChipText, { color: '#c2410c', fontWeight: '700' }]}>
                        Advance: {item.advancePaymentMode.toUpperCase()}
                      </Text>
                    </View>
                  ) : null}
                  {item.dueDate && (
                    <View
                      style={[
                        styles.dueChip,
                        overdue && styles.dueChipOverdue,
                      ]}
                    >
                      <Calendar
                        size={11}
                        color={overdue ? '#DC2626' : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.dueChipText,
                          overdue && styles.dueChipTextOverdue,
                        ]}
                      >
                        Due: {formatDateSafe(item.dueDate)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Amount Details Box */}
                <View style={styles.amountBox}>
                  <View style={styles.amountCol}>
                    <Text style={styles.amountLabel}>DUE AMOUNT</Text>
                    <Text style={styles.amountValueDue}>
                      ₹{dueNum.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.amountDivider} />

                  <View style={styles.amountCol}>
                    <Text style={styles.amountLabel}>PAID</Text>
                    <Text style={styles.amountValuePaid}>
                      ₹{paidNum.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.amountDivider} />

                  <View style={styles.amountCol}>
                    <Text style={styles.amountLabel}>TOTAL CREDIT</Text>
                    <Text style={styles.amountValueTotal}>
                      ₹{totalNum.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons Footer */}
                <View style={styles.cardActions}>
                  {!settled && (
                    <TouchableOpacity
                      style={styles.actionBtnReceive}
                      onPress={() => openPaymentModal(item)}
                      activeOpacity={0.7}
                    >
                      <CreditCard size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                      <Text style={styles.actionBtnReceiveText}>Receive</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.actionBtnHistory}
                    onPress={() => openHistoryModal(item)}
                    activeOpacity={0.7}
                  >
                    <History size={13} color="#09090b" style={{ marginRight: 5 }} />
                    <Text style={styles.actionBtnHistoryText}>History ({txCount})</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnEdit}
                    onPress={() => openEditForm(item)}
                    activeOpacity={0.7}
                  >
                    <Edit3 size={13} color="#09090b" style={{ marginRight: 4 }} />
                    <Text style={styles.actionBtnEditText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnDelete}
                    onPress={() => setCreditToDelete(item)}
                    activeOpacity={0.7}
                    accessibilityLabel={`Delete credit record for ${item.customerName || 'customer'}`}
                    accessibilityRole="button"
                  >
                    <Trash2 size={13} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />

        {/* Sub-Modal: Receive Payment */}
        <Modal
          visible={paymentModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setPaymentModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.dialogCard}>
              <View style={styles.dialogHeader}>
                <View style={styles.dialogHeaderTitleWrap}>
                  <View style={styles.dialogIconBox}>
                    <CreditCard size={18} color="#FF5E36" />
                  </View>
                  <View>
                    <Text style={styles.dialogTitle}>Receive Payment</Text>
                    <Text style={styles.dialogSubtitle}>
                      {activeCreditForPayment?.customerName || 'Customer Credit Account'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setPaymentModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <X size={16} color="#71717a" />
                </TouchableOpacity>
              </View>

              <View style={styles.dialogContent}>
                <View style={styles.dialogDueNotice}>
                  <Text style={styles.dialogDueLabel}>Current Outstanding Due:</Text>
                  <Text style={styles.dialogDueAmount}>
                    ₹{Number(activeCreditForPayment?.dueAmount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* Payment Amount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PAYMENT AMOUNT (₹) *</Text>
                  <TextInput
                    style={styles.dialogInput}
                    placeholder="Enter payment received..."
                    placeholderTextColor="#a1a1aa"
                    value={paymentAmountInput}
                    onChangeText={setPaymentAmountInput}
                    keyboardType="numeric"
                    autoFocus
                  />
                </View>

                {/* Payment Mode Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PAYMENT MODE *</Text>
                  <View style={styles.modePillsRow}>
                    <TouchableOpacity
                      style={[
                        styles.modePill,
                        paymentModeInput === 'cash' && styles.modePillActive,
                      ]}
                      onPress={() => setPaymentModeInput('cash')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.modePillText,
                          paymentModeInput === 'cash' && styles.modePillTextActive,
                        ]}
                      >
                        Cash
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modePill,
                        paymentModeInput === 'online' && styles.modePillActive,
                      ]}
                      onPress={() => setPaymentModeInput('online')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.modePillText,
                          paymentModeInput === 'online' && styles.modePillTextActive,
                        ]}
                      >
                        Online / UPI
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Optional Notes / Ref */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NOTES / REFERENCE (OPTIONAL)</Text>
                  <TextInput
                    style={[styles.dialogInput, { fontSize: 13, fontWeight: 'normal', height: 40 }]}
                    placeholder="e.g. UPI Ref #, paid at counter..."
                    placeholderTextColor="#a1a1aa"
                    value={paymentNotesInput}
                    onChangeText={setPaymentNotesInput}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, isSubmittingPayment && styles.submitBtnDisabled]}
                  onPress={handleSubmitPayment}
                  disabled={isSubmittingPayment}
                  activeOpacity={0.8}
                >
                  {isSubmittingPayment ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.submitBtnText}>Confirm & Settle</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setPaymentModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Sub-Modal: Credit Transactions History & Ledger */}
        <Modal
          visible={historyModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setHistoryModalVisible(false)}
        >
          <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => setHistoryModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={18} color="#09090b" />
              </TouchableOpacity>
              <View style={styles.headerTitleWrap}>
                <Text style={styles.headerTitle}>Transaction History</Text>
                <Text style={styles.headerSubtitle}>
                  {activeCreditForHistory?.customerName || 'Customer Credit Ledger'}
                </Text>
              </View>
              {activeCreditForHistory && Number(activeCreditForHistory.dueAmount) > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setHistoryModalVisible(false);
                    openPaymentModal(activeCreditForHistory);
                  }}
                  style={styles.addBtn}
                  activeOpacity={0.8}
                >
                  <CreditCard size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.addBtnText}>Pay</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView contentContainerStyle={{ padding: 18 }}>
              {/* Outstanding Balance Banner */}
              <View style={styles.ledgerSummaryCard}>
                <View style={styles.ledgerCol}>
                  <Text style={styles.ledgerLabel}>TOTAL CREDIT</Text>
                  <Text style={styles.ledgerValueTotal}>
                    ₹{(
                      Number(activeCreditForHistory?.paidAmount || 0) +
                      Number(activeCreditForHistory?.dueAmount || 0)
                    ).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.amountDivider} />
                <View style={styles.ledgerCol}>
                  <Text style={styles.ledgerLabel}>PAID</Text>
                  <Text style={styles.ledgerValuePaid}>
                    ₹{Number(activeCreditForHistory?.paidAmount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.amountDivider} />
                <View style={styles.ledgerCol}>
                  <Text style={styles.ledgerLabel}>BALANCE DUE</Text>
                  <Text style={styles.ledgerValueDue}>
                    ₹{Number(activeCreditForHistory?.dueAmount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Transactions List */}
              <Text style={styles.sectionHeaderTitle}>Recorded Transactions</Text>

              {(() => {
                const txs = activeCreditForHistory?.transactions || [];
                // If no transactions logged yet but paidAmount > 0, show synthetic advance
                const displayList = [...txs];
                if (displayList.length === 0 && Number(activeCreditForHistory?.paidAmount || 0) > 0) {
                  displayList.push({
                    id: 'init_adv',
                    creditId: activeCreditForHistory?.id || '',
                    amount: activeCreditForHistory?.paidAmount || 0,
                    paymentMode: activeCreditForHistory?.advancePaymentMode || 'cash',
                    transactionType: 'advance',
                    notes: 'Advance payment on account creation',
                    createdAt: activeCreditForHistory?.createdAt || new Date().toISOString(),
                  });
                }

                if (displayList.length === 0) {
                  return (
                    <View style={styles.emptyTxBox}>
                      <Clock size={28} color="#a1a1aa" style={{ marginBottom: 8 }} />
                      <Text style={styles.emptyTxTitle}>No Payments Received Yet</Text>
                      <Text style={styles.emptyTxSub}>
                        Payments received towards this credit account will appear here with date, mode, and reference.
                      </Text>
                    </View>
                  );
                }

                return (
                  <View style={styles.txListContainer}>
                    {displayList.map((tx: CreditTransaction | any, idx: number) => {
                      const isAdv = (tx.transactionType || '').toLowerCase() === 'advance';
                      const txDate = formatDateSafe(tx.createdAt);

                      return (
                        <View key={tx.id || idx} style={styles.txCard}>
                          <View style={styles.txCardLeft}>
                            <View
                              style={[
                                styles.txTypeTag,
                                isAdv ? styles.txTypeTagAdv : styles.txTypeTagPay,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.txTypeTagText,
                                  isAdv ? styles.txTypeTagTextAdv : styles.txTypeTagTextPay,
                                ]}
                              >
                                {isAdv ? 'ADVANCE PAYMENT' : 'INSTALLMENT PAYMENT'}
                              </Text>
                            </View>

                            <Text style={styles.txDateText}>{txDate}</Text>
                            {tx.notes ? (
                              <Text style={styles.txNotesText}>{tx.notes}</Text>
                            ) : null}
                          </View>

                          <View style={styles.txCardRight}>
                            <Text style={styles.txAmountText}>
                              + ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                            </Text>
                            <View style={styles.txModeBadge}>
                              <Text style={styles.txModeBadgeText}>
                                {(tx.paymentMode || 'cash').toUpperCase()}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })()}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Sub-Modal: Add / Edit Credit Record */}
        <Modal
          visible={formModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setFormModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.formModalOverlay}
          >
            <View style={styles.formModalCard}>
              <View style={styles.formModalHeader}>
                <View style={styles.formHeaderTitleWrap}>
                  <View style={styles.formHeaderIcon}>
                    <CreditCard size={18} color="#FF5E36" />
                  </View>
                  <Text style={styles.formModalTitle}>
                    Edit Credit Record
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setFormModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <X size={18} color="#71717a" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* Due Amount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DUE AMOUNT (₹) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 15000"
                    placeholderTextColor="#a1a1aa"
                    value={formDueAmount}
                    onChangeText={setFormDueAmount}
                    keyboardType="numeric"
                  />
                </View>

                {/* Paid Amount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>INITIAL PAID / ADVANCE AMOUNT (₹)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 5000 (0 if unpaid)"
                    placeholderTextColor="#a1a1aa"
                    value={formPaidAmount}
                    onChangeText={setFormPaidAmount}
                    keyboardType="numeric"
                  />
                </View>

                {/* Advance Mode Selector if Paid Amount > 0 */}
                {Number(formPaidAmount) > 0 && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>ADVANCE PAYMENT MODE *</Text>
                    <View style={styles.modePillsRow}>
                      <TouchableOpacity
                        style={[
                          styles.modePill,
                          formAdvanceMode === 'cash' && styles.modePillActive,
                        ]}
                        onPress={() => setFormAdvanceMode('cash')}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.modePillText,
                            formAdvanceMode === 'cash' && styles.modePillTextActive,
                          ]}
                        >
                          Cash
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.modePill,
                          formAdvanceMode === 'online' && styles.modePillActive,
                        ]}
                        onPress={() => setFormAdvanceMode('online')}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.modePillText,
                            formAdvanceMode === 'online' && styles.modePillTextActive,
                          ]}
                        >
                          Online / UPI
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Due Date */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DUE DATE (YYYY-MM-DD) OPTIONAL</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 2026-11-15"
                    placeholderTextColor="#a1a1aa"
                    value={formDueDate}
                    onChangeText={setFormDueDate}
                    autoCapitalize="none"
                  />
                </View>

                {/* Optional Notes */}
                {!editingCredit && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>NOTES / PARTICULARS (OPTIONAL)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g. Store credit agreement..."
                      placeholderTextColor="#a1a1aa"
                      value={formNotes}
                      onChangeText={setFormNotes}
                    />
                  </View>
                )}

                {/* Submit button */}
                <TouchableOpacity
                  style={[styles.submitBtn, isSavingForm && styles.submitBtnDisabled]}
                  onPress={handleSaveForm}
                  disabled={isSavingForm}
                  activeOpacity={0.8}
                >
                  {isSavingForm ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.submitBtnText}>
                        Update Credit Record
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setFormModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Delete Confirmation Warning Dialog */}
        {creditToDelete && (
          <View style={styles.confirmBackdrop}>
            <View style={styles.confirmCard}>
              <View style={styles.confirmIconContainer}>
                <AlertTriangle size={28} color="#FF5E36" />
              </View>
              <Text style={styles.confirmTitle}>Delete Credit Record</Text>
              <Text style={styles.confirmMessage}>
                Are you sure you want to delete the credit record for{' '}
                <Text style={{ fontWeight: 'bold', color: '#09090b' }}>
                  {creditToDelete.customerName || creditToDelete.orderNumber || 'this customer'}
                </Text>
                ? This action cannot be undone and will permanently remove this record from the ledger.
              </Text>
              <View style={styles.confirmActionsRow}>
                <TouchableOpacity
                  style={[styles.confirmBtn, styles.confirmBtnCancel]}
                  onPress={() => setCreditToDelete(null)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                >
                  <Text style={styles.confirmBtnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, styles.confirmBtnDelete]}
                  onPress={async () => {
                    const id = creditToDelete.id;
                    setCreditToDelete(null);
                    await onDeleteCredit(id, true);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                >
                  <Trash2 size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmBtnDeleteText}>Delete Record</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#09090b',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5E36',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF5E36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F4F4F5',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  metricIconBoxDue: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricIconBoxPaid: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricIconBoxOverdue: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValueDue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 2,
  },
  metricValuePaid: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 2,
  },
  metricValueOverdue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9,
    color: '#71717a',
    fontWeight: '600',
    textAlign: 'center',
  },
  controlsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E4E4E7',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#09090b',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  filterChipActive: {
    backgroundColor: '#09090b',
    borderColor: '#09090b',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52525b',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  creditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#09090b',
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  phoneText: {
    fontSize: 12,
    color: '#FF5E36',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: '#FFF2EB',
  },
  statusOverdue: {
    backgroundColor: '#FEE2E2',
  },
  statusSettled: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextPending: {
    color: '#FF5E36',
  },
  statusTextOverdue: {
    color: '#DC2626',
  },
  statusTextSettled: {
    color: '#059669',
  },
  linkedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  linkedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  linkedChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  dueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dueChipOverdue: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  dueChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  dueChipTextOverdue: {
    color: '#DC2626',
    fontWeight: '700',
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 12,
  },
  amountCol: {
    flex: 1,
    alignItems: 'center',
  },
  amountDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E4E4E7',
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#71717a',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  amountValueDue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
  },
  amountValuePaid: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  amountValueTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#09090b',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#F4F4F5',
  },
  actionBtnReceive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 'auto',
  },
  actionBtnReceiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnHistory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FAF9F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  actionBtnHistoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#09090b',
  },
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#09090b',
  },
  actionBtnDelete: {
    padding: 7,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#09090b',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal Overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F4F4F5',
  },
  dialogHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dialogIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#09090b',
  },
  dialogSubtitle: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 1,
  },
  dialogContent: {
    padding: 18,
  },
  dialogDueNotice: {
    backgroundColor: '#FFF2EB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0D1',
  },
  dialogDueLabel: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '600',
  },
  dialogDueAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF5E36',
    marginTop: 2,
  },
  dialogInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#09090b',
  },
  modePillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  modePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  modePillActive: {
    backgroundColor: '#09090b',
    borderColor: '#09090b',
  },
  modePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52525b',
  },
  modePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // History / Ledger Modal Styles
  ledgerSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 20,
  },
  ledgerCol: {
    flex: 1,
    alignItems: 'center',
  },
  ledgerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#71717a',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  ledgerValueTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#09090b',
  },
  ledgerValuePaid: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  ledgerValueDue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#71717a',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  emptyTxBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  emptyTxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#09090b',
    marginBottom: 4,
  },
  emptyTxSub: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 16,
  },
  txListContainer: {
    gap: 10,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  txCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  txTypeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  txTypeTagAdv: {
    backgroundColor: '#DCFCE7',
  },
  txTypeTagPay: {
    backgroundColor: '#E0F2FE',
  },
  txTypeTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  txTypeTagTextAdv: {
    color: '#15803D',
  },
  txTypeTagTextPay: {
    color: '#0369A1',
  },
  txDateText: {
    fontSize: 12,
    color: '#52525b',
    fontWeight: '600',
  },
  txNotesText: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  txCardRight: {
    alignItems: 'flex-end',
  },
  txAmountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 2,
  },
  txModeBadge: {
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  txModeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#52525b',
  },
  // Form Modal Styles
  formModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  formModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  formModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
  },
  formHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  formModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#09090b',
  },
  formContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#71717a',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#09090b',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5E36',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    shadowColor: '#FF5E36',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717a',
  },
  // Delete Confirmation Dialog Styles
  confirmBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999,
    elevation: 9999,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  confirmBtnCancel: {
    backgroundColor: '#f4f4f5',
  },
  confirmBtnCancelText: {
    color: '#18181b',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtnDelete: {
    backgroundColor: '#ef4444',
  },
  confirmBtnDeleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  paginationInfo: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '500',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonDisabled: {
    backgroundColor: '#fafafa',
  },
  pageNumberBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 6,
    borderRadius: 6,
    backgroundColor: '#f4f4f5',
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#18181b',
  },
});

export default CreditManagerModal;
