import React, { useState, useMemo } from 'react';
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
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Check,
  TrendingDown,
  TrendingUp,
  Receipt,
} from 'lucide-react-native';
import { Credit, CreditMetrics } from '../types';
import { colors } from '../theme/colors';

export interface CreditManagerModalProps {
  visible: boolean;
  credits: Credit[];
  metrics: CreditMetrics | null;
  isLoading: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onCreateCredit: (data: {
    orderId?: string | null;
    invoiceId?: string | null;
    paidAmount: number;
    dueAmount: number;
    dueDate?: string | null;
  }) => Promise<any>;
  onUpdateCredit: (data: {
    id: string;
    paidAmount?: number;
    dueAmount?: number;
    dueDate?: string | null;
  }) => Promise<any>;
  onRecordPayment: (id: string, amount: number) => Promise<any>;
  onDeleteCredit: (id: string) => void;
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
  showAlert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  // Receive Payment Modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [activeCreditForPayment, setActiveCreditForPayment] = useState<Credit | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Create / Edit Credit Modal state
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingCredit, setEditingCredit] = useState<Credit | null>(null);
  const [formPaidAmount, setFormPaidAmount] = useState('');
  const [formDueAmount, setFormDueAmount] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [isSavingForm, setIsSavingForm] = useState(false);

  // Open Quick Payment Modal
  const openPaymentModal = (credit: Credit) => {
    setActiveCreditForPayment(credit);
    setPaymentAmountInput(String(Number(credit.dueAmount) || ''));
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
      await onRecordPayment(activeCreditForPayment.id, amount);
      setPaymentModalVisible(false);
      setActiveCreditForPayment(null);
    } catch {
      // Handled in hook
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Open Add Credit Form
  const openAddForm = () => {
    setEditingCredit(null);
    setFormPaidAmount('0');
    setFormDueAmount('');
    setFormDueDate('');
    setFormModalVisible(true);
  };

  // Open Edit Credit Form
  const openEditForm = (credit: Credit) => {
    setEditingCredit(credit);
    setFormPaidAmount(String(Number(credit.paidAmount) || 0));
    setFormDueAmount(String(Number(credit.dueAmount) || 0));
    setFormDueDate(
      credit.dueDate
        ? new Date(credit.dueDate).toISOString().split('T')[0]
        : ''
    );
    setFormModalVisible(true);
  };

  // Submit Add / Edit Form
  const handleSaveForm = async () => {
    const paid = Number(formPaidAmount.trim()) || 0;
    const due = Number(formDueAmount.trim());

    if (isNaN(due) || due < 0) {
      showAlert('Due Amount Required', 'Please enter a valid due amount.', 'error');
      return;
    }

    setIsSavingForm(true);
    try {
      if (editingCredit) {
        await onUpdateCredit({
          id: editingCredit.id,
          paidAmount: paid,
          dueAmount: due,
          dueDate: formDueDate.trim() || null,
        });
      } else {
        await onCreateCredit({
          paidAmount: paid,
          dueAmount: due,
          dueDate: formDueDate.trim() || null,
        });
      }
      setFormModalVisible(false);
    } catch {
      // Handled in hook
    } finally {
      setIsSavingForm(false);
    }
  };

  // Filter credits
  const filteredCredits = useMemo(() => {
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
  }, [credits, filterTab, searchQuery]);

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
          <TouchableOpacity
            onPress={openAddForm}
            style={styles.addBtn}
            activeOpacity={0.8}
            accessibilityLabel="New Credit"
            accessibilityRole="button"
          >
            <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>New</Text>
          </TouchableOpacity>
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
              onChangeText={setSearchQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
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
              onPress={() => setFilterTab('all')}
              style={[styles.filterChip, filterTab === 'all' && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterTab === 'all' && styles.filterChipTextActive,
                ]}
              >
                All ({credits.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterTab('pending')}
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
              onPress={() => setFilterTab('overdue')}
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
              onPress={() => setFilterTab('settled')}
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
              refreshing={isLoading}
              onRefresh={onRefresh}
              tintColor="#FF5E36"
              colors={['#FF5E36']}
            />
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
                  : 'Record customer balances and dues to manage your store ledger and follow-ups.'}
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={openAddForm}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.emptyAddBtnText}>Record First Credit</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const dueNum = Number(item.dueAmount) || 0;
            const paidNum = Number(item.paidAmount) || 0;
            const totalNum = dueNum + paidNum;
            const overdue = isOverdue(item);
            const settled = dueNum <= 0;

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

                {/* Linked Order/Invoice Badges */}
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
                        Due: {new Date(item.dueDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
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
                      <Text style={styles.actionBtnReceiveText}>Receive Payment</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.actionBtnEdit}
                    onPress={() => openEditForm(item)}
                    activeOpacity={0.7}
                  >
                    <Edit3 size={13} color="#09090b" style={{ marginRight: 5 }} />
                    <Text style={styles.actionBtnEditText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnDelete}
                    onPress={() => onDeleteCredit(item.id)}
                    activeOpacity={0.7}
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
                    {editingCredit ? 'Edit Credit Record' : 'Record New Credit'}
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
                  <Text style={styles.inputLabel}>INITIAL PAID AMOUNT (₹)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 5000 (0 if unpaid)"
                    placeholderTextColor="#a1a1aa"
                    value={formPaidAmount}
                    onChangeText={setFormPaidAmount}
                    keyboardType="numeric"
                  />
                </View>

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
                        {editingCredit ? 'Update Credit' : 'Save Credit Record'}
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
    backgroundColor: '#ECFDF5',
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
  },
  metricValuePaid: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  metricValueOverdue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#71717a',
    textTransform: 'uppercase',
    marginTop: 2,
    textAlign: 'center',
  },
  controlsSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
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
    fontSize: 14,
    color: '#09090b',
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#FFF2EB',
    borderColor: '#FF5E36',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717a',
  },
  filterChipTextActive: {
    color: '#FF5E36',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  creditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
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
  statusSettled: {
    backgroundColor: '#ECFDF5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusOverdue: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextSettled: {
    color: '#047857',
  },
  statusTextPending: {
    color: '#B45309',
  },
  statusTextOverdue: {
    color: '#DC2626',
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#09090b',
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
});

export default CreditManagerModal;
