import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  KeyboardAvoidingView,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Trash2, Plus, Printer, X, ChevronDown } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useForm, Controller } from 'react-hook-form';
import { InvoiceSkeleton } from '../components/SkeletonLoader';
import { Product } from '../types';

export interface InvoiceFormValues {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  taxRate: string;
  discount: string;
  paymentMethod: 'Cash' | 'Online';
  notes: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface InvoiceScreenProps {
  products: Product[];
  showAlert: (
    title: string,
    message: string,
    type?: 'success' | 'error' | 'info' | 'confirm',
    onConfirm?: () => void
  ) => void;
  isLoading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const MOCK_CUSTOMERS = [
  { name: 'Aishwarya Sen', phone: '+91 98123 45678', email: 'aishwarya.sen@gmail.com' },
  { name: 'Meera Rajput', phone: '+91 99123 45678', email: 'meera.rajput@gmail.com' },
  { name: 'Kriti Sanon', phone: '+91 97123 45678', email: 'kriti.sanon@gmail.com' },
  { name: 'Janhvi Kapoor', phone: '+91 96123 45678', email: 'janhvi.kapoor@gmail.com' },
  { name: 'Shanaya Kapoor', phone: '+91 95123 45678', email: 'shanaya.kapoor@gmail.com' },
  { name: 'Mira Kapoor', phone: '+91 94123 45678', email: 'mira.kapoor@gmail.com' },
];

export default function InvoiceScreen({ products, showAlert, isLoading, refreshing, onRefresh }: InvoiceScreenProps) {
  // Past invoices list
  const [invoices, setInvoices] = useState<any[]>([
    {
      id: 'INV-2026-8942',
      clientName: 'Aishwarya Sen',
      clientPhone: '+91 98123 45678',
      clientEmail: 'aishwarya.sen@gmail.com',
      date: '28/08/2026',
      items: [
        { id: '1', name: 'Ivory Chanderi Silk Co-ord Set', price: 16800, quantity: 1, total: 16800 }
      ],
      subtotal: 16800,
      taxRate: '12',
      taxAmount: 2016,
      discount: 1000,
      totalAmount: 17816,
      paymentMethod: 'Online',
      notes: 'Custom sleeve tailoring adjustments requested.'
    },
    {
      id: 'INV-2026-4219',
      clientName: 'Mira Kapoor',
      clientPhone: '+91 94123 45678',
      clientEmail: 'mira.kapoor@gmail.com',
      date: '25/08/2026',
      items: [
        { id: '2', name: 'Velvet Nehru Jacket', price: 12500, quantity: 1, total: 12500 }
      ],
      subtotal: 12500,
      taxRate: '12',
      taxAmount: 1500,
      discount: 0,
      totalAmount: 14000,
      paymentMethod: 'Cash',
      notes: 'Collected cash at the Baner studio.'
    }
  ]);

  const handleDeleteInvoice = (id: string, clientName: string) => {
    showAlert(
      'Delete Invoice',
      `Are you sure you want to delete invoice "${id}" for ${clientName}?`,
      'confirm',
      () => {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        showAlert('Success', 'Invoice deleted successfully.', 'success');
      }
    );
  };

  // Screen modes
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);

  // Invoice form state using react-hook-form
  const { control, handleSubmit, reset, setValue, watch } = useForm<InvoiceFormValues>({
    defaultValues: {
      invoiceNumber: '',
      invoiceDate: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      taxRate: '12',
      discount: '0',
      paymentMethod: 'Online',
      notes: '',
    },
  });

  const formValues = watch();
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  // Dropdown states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemQuantity, setItemQuantity] = useState('1');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Current calculations
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * (parseFloat(formValues.taxRate) || 0)) / 100;
  const discountAmount = parseFloat(formValues.discount) || 0;
  const totalAmount = subtotal + taxAmount - discountAmount;

  // Resolve dynamic preview data
  const isViewingPast = viewingInvoice !== null;
  const activeInvNumber = isViewingPast ? viewingInvoice.id : formValues.invoiceNumber;
  const activeInvDate = isViewingPast ? viewingInvoice.date : formValues.invoiceDate;
  const activeClientName = isViewingPast ? viewingInvoice.clientName : formValues.clientName;
  const activeClientEmail = isViewingPast ? viewingInvoice.clientEmail : formValues.clientEmail;
  const activeClientPhone = isViewingPast ? viewingInvoice.clientPhone : formValues.clientPhone;
  const activeItems = isViewingPast ? viewingInvoice.items : invoiceItems;
  const activeTaxRate = isViewingPast ? viewingInvoice.taxRate : formValues.taxRate;
  const activeDiscount = isViewingPast ? viewingInvoice.discount : formValues.discount;
  const activePaymentMethod = isViewingPast ? viewingInvoice.paymentMethod : formValues.paymentMethod;
  const activeNotes = isViewingPast ? viewingInvoice.notes : formValues.notes;

  const activeSubtotal = activeItems.reduce((sum: number, item: any) => sum + item.total, 0);
  const activeTaxAmount = (activeSubtotal * (parseFloat(activeTaxRate) || 0)) / 100;
  const activeDiscountAmount = parseFloat(activeDiscount) || 0;
  const activeTotalAmount = activeSubtotal + activeTaxAmount - activeDiscountAmount;

  const handleAddProduct = () => {
    if (!selectedProduct) {
      showAlert('Selection Required', 'Please select a product from the list.', 'error');
      return;
    }

    const qty = parseInt(itemQuantity) || 1;
    if (qty <= 0) {
      showAlert('Invalid Quantity', 'Quantity must be at least 1.', 'error');
      return;
    }

    const existingIndex = invoiceItems.findIndex(item => item.id === selectedProduct.id);
    if (existingIndex > -1) {
      const updated = [...invoiceItems];
      const currentItem = updated[existingIndex]!;
      currentItem.quantity += qty;
      currentItem.total = currentItem.quantity * currentItem.price;
      setInvoiceItems(updated);
    } else {
      setInvoiceItems(prev => [
        ...prev,
        {
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: qty,
          total: qty * selectedProduct.price
        }
      ]);
    }

    setSelectedProduct(null);
    setItemQuantity('1');
    showAlert('Success', 'Item added to the invoice list.', 'success');
  };

  const handleRemoveItem = (id: string) => {
    setInvoiceItems(prev => prev.filter(item => item.id !== id));
  };

  const generateInvoiceHtml = (inv: any) => {
    const escapeHtml = (unsafe: any) => {
      if (unsafe === null || unsafe === undefined) return '';
      return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const invSubtotal = inv.items.reduce((sum: number, item: any) => sum + item.total, 0);
    const invTaxAmount = (invSubtotal * (parseFloat(inv.taxRate) || 0)) / 100;
    const invDiscountAmount = parseFloat(inv.discount) || 0;
    const invTotalAmount = invSubtotal + invTaxAmount - invDiscountAmount;

    const escapedNotes = inv.notes ? escapeHtml(inv.notes).replace(/\r?\n/g, '<br>') : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${escapeHtml(inv.id)}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #333;
            padding: 30px;
            line-height: 1.4;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
            position: relative;
            background-color: #fff;
          }
          .top-border {
            height: 6px;
            background-color: #FF5E36;
            width: 100%;
          }
          .content-box {
            padding: 30px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .brand-title {
            font-size: 26px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 0;
            color: #18181b;
          }
          .brand-subtitle {
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #FF5E36;
            margin: 2px 0 15px 0;
          }
          .brand-details {
            font-size: 11px;
            color: #71717a;
          }
          .invoice-details {
            text-align: right;
            font-size: 12px;
          }
          .invoice-title {
            font-size: 20px;
            font-weight: 900;
            color: #18181b;
            margin: 0 0 10px 0;
          }
          .client-block {
            margin-bottom: 30px;
          }
          .bill-to {
            font-size: 10px;
            font-weight: bold;
            color: #71717a;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
          }
          .client-name {
            font-size: 15px;
            font-weight: bold;
            color: #18181b;
            margin: 0;
          }
          .client-meta {
            font-size: 11px;
            color: #52525b;
            margin: 2px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            border-bottom: 2px solid #18181b;
            padding: 10px;
            text-align: left;
            font-size: 11px;
            font-weight: bold;
            color: #18181b;
          }
          td {
            border-bottom: 1px solid #f0f0f0;
            padding: 12px 10px;
            font-size: 12px;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .totals-table {
            width: 50%;
            margin-left: auto;
            margin-bottom: 40px;
          }
          .totals-table td {
            border-bottom: none;
            padding: 6px 10px;
          }
          .grand-total-row td {
            border-top: 1px solid #e4e4e7;
            font-weight: bold;
            font-size: 14px;
            padding-top: 12px;
          }
          .grand-total-val {
            color: #FF5E36;
          }
          .notes-box {
            border-top: 1px solid #f0f0f0;
            padding-top: 15px;
            margin-top: 20px;
            font-size: 11px;
            color: #52525b;
          }
          .footer {
            border-top: 1px solid #f0f0f0;
            padding-top: 20px;
            text-align: center;
            margin-top: 30px;
          }
          .thank-you {
            font-size: 11px;
            font-style: italic;
            color: #71717a;
          }
          .system-tag {
            font-size: 8px;
            color: #a1a1aa;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="top-border"></div>
          <div class="content-box">
            <div class="header">
              <div>
                <h1 class="brand-title">JB51</h1>
                <div class="brand-subtitle">EST. 1951</div>
                <div class="brand-details">
                  Chandni Chowk, New Delhi, India<br>
                  atelier@jb51.store
                </div>
              </div>
              <div class="invoice-details">
                <div class="invoice-title">INVOICE</div>
                <strong>Invoice #:</strong> ${escapeHtml(inv.id)}<br>
                <strong>Date:</strong> ${escapeHtml(inv.date)}<br>
                <strong>Payment:</strong> ${escapeHtml(inv.paymentMethod)}
              </div>
            </div>
            
            <div class="client-block">
              <div class="bill-to">BILL TO</div>
              <div class="client-name">${escapeHtml(inv.clientName)}</div>
              ${inv.clientEmail ? `<div class="client-meta">${escapeHtml(inv.clientEmail)}</div>` : ''}
              ${inv.clientPhone ? `<div class="client-meta">${escapeHtml(inv.clientPhone)}</div>` : ''}
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-center" style="width: 80px;">Qty</th>
                  <th class="text-right" style="width: 120px;">Rate</th>
                  <th class="text-right" style="width: 120px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${inv.items.map((item: any) => `
                  <tr>
                    <td>${escapeHtml(item.name)}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">₹${item.price.toLocaleString('en-IN')}</td>
                    <td class="text-right" style="font-weight: 600;">₹${item.total.toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <table class="totals-table">
              <tbody>
                <tr>
                  <td>Subtotal:</td>
                  <td class="text-right">₹${invSubtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>GST (${escapeHtml(inv.taxRate)}%):</td>
                  <td class="text-right">₹${invTaxAmount.toLocaleString('en-IN')}</td>
                </tr>
                ${invDiscountAmount > 0 ? `
                  <tr>
                    <td>Discount:</td>
                    <td class="text-right" style="color: #22c55e;">- ₹${invDiscountAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ` : ''}
                <tr class="grand-total-row">
                  <td><strong>Total Amount:</strong></td>
                  <td class="text-right"><strong class="grand-total-val">₹${invTotalAmount.toLocaleString('en-IN')}</strong></td>
                </tr>
              </tbody>
            </table>

            ${inv.notes ? `
              <div class="notes-box">
                <strong>Notes/Alterations:</strong><br>
                ${escapedNotes}
              </div>
            ` : ''}
            
            <div class="footer">
              <div class="thank-you">Thank you for your business at JB51.</div>
              <div class="system-tag">Invoice Engine Powered by React Invoice Generator Protocol</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleExportInvoice = async () => {
    setIsExporting(true);
    try {
      const newInvoice = {
        id: formValues.invoiceNumber,
        clientName: formValues.clientName.trim(),
        clientPhone: formValues.clientPhone.trim(),
        clientEmail: formValues.clientEmail.trim(),
        date: formValues.invoiceDate,
        items: invoiceItems,
        subtotal,
        taxRate: formValues.taxRate,
        taxAmount,
        discount: discountAmount,
        totalAmount,
        paymentMethod: formValues.paymentMethod,
        notes: formValues.notes.trim()
      };

      const html = generateInvoiceHtml(newInvoice);
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share Invoice ${formValues.invoiceNumber}`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        showAlert('Sharing Unavailable', 'Sharing is not available on this platform.', 'error');
      }

      setInvoices(prev => [newInvoice, ...prev]);
      setIsPreviewOpen(false);
      setIsFormOpen(false);
      showAlert('Success', `Invoice ${formValues.invoiceNumber} created and shared.`, 'success');

      // Reset form fields
      reset();
      setInvoiceItems([]);
    } catch (error) {
      console.error(error);
      showAlert('Error', 'Failed to generate and share invoice PDF.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSharePastInvoice = async (inv: any) => {
    setIsExporting(true);
    try {
      const html = generateInvoiceHtml(inv);
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share Invoice ${inv.id}`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        showAlert('Sharing Unavailable', 'Sharing is not available on this platform.', 'error');
      }

      setIsPreviewOpen(false);
      setViewingInvoice(null);
      showAlert('Success', `Invoice ${inv.id} shared successfully.`, 'success');
    } catch (error) {
      console.error(error);
      showAlert('Error', 'Failed to share invoice PDF.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const onPreviewSubmit = (data: InvoiceFormValues) => {
    if (!data.clientName.trim()) {
      showAlert('Input Required', 'Please enter the customer name.', 'error');
      return;
    }
    if (invoiceItems.length === 0) {
      showAlert('Input Required', 'Please add at least one item to the invoice.', 'error');
      return;
    }
    setIsPreviewOpen(true);
  };

  const totalCollected = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const onlineCollected = invoices.filter(inv => inv.paymentMethod === 'Online').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const cashCollected = invoices.filter(inv => inv.paymentMethod === 'Cash').reduce((sum, inv) => sum + inv.totalAmount, 0);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          alwaysBounceVertical={true}
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
          <InvoiceSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      {!isFormOpen ? (
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            alwaysBounceVertical={true}
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
                <Text style={styles.ledgerTitle}>Invoice Ledger</Text>
                <Text style={styles.ledgerSubtitle}>Manage client transactions</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsPreviewOpen(false);
                  setViewingInvoice(null);
                  reset({
                    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    invoiceDate: new Date().toLocaleDateString('en-IN'),
                    clientName: '',
                    clientEmail: '',
                    clientPhone: '',
                    taxRate: '12',
                    discount: '0',
                    paymentMethod: 'Online',
                    notes: '',
                  });
                  setInvoiceItems([]);
                  setIsFormOpen(true);
                }}
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
                <Text style={styles.statsValue}>₹{totalCollected.toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.statsCard, { borderColor: '#e0f2fe' }]}>
                <Text style={[styles.statsLabel, { color: '#0284c7' }]}>Online Pay</Text>
                <Text style={[styles.statsValue, { color: '#0284c7' }]}>₹{onlineCollected.toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.statsCard, { borderColor: '#fef3c7' }]}>
                <Text style={[styles.statsLabel, { color: '#d97706' }]}>Cash Pay</Text>
                <Text style={[styles.statsValue, { color: '#d97706' }]}>₹{cashCollected.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            {/* Created Invoices Section */}
            <Text style={styles.sectionHeader}>Created Invoices</Text>
            {invoices.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={32} color="#a1a1aa" />
                <Text style={styles.emptyStateText}>No invoices found</Text>
                <Text style={styles.emptyStateSub}>Tap "New Invoice" to create one</Text>
              </View>
            ) : (
              invoices.map((inv) => (
                <View key={inv.id} style={styles.invoiceCard}>
                  <TouchableOpacity
                    style={styles.invoiceCardMain}
                    onPress={() => {
                      setViewingInvoice(inv);
                      setIsPreviewOpen(true);
                    }}
                    accessibilityLabel={`Invoice card for customer ${inv.clientName}, amount ₹${inv.totalAmount}`}
                    accessibilityRole="button"
                  >
                    <View style={styles.invoiceCardHeader}>
                      <Text style={styles.invoiceCardClient}>{inv.clientName}</Text>
                      <Text style={styles.invoiceCardDate}>{inv.date}</Text>
                    </View>

                    <View style={styles.invoiceCardBody}>
                      <Text style={styles.invoiceCardId}>{inv.id}</Text>
                      <Text style={styles.invoiceCardCount}>{inv.items.length} {inv.items.length === 1 ? 'item' : 'items'}</Text>
                    </View>

                    {inv.notes ? (
                      <Text style={styles.invoiceCardNotes} numberOfLines={1}>
                        Note: {inv.notes}
                      </Text>
                    ) : null}

                    <View style={styles.invoiceCardFooter}>
                      <Text style={styles.invoiceCardAmount}>₹{inv.totalAmount.toLocaleString('en-IN')}</Text>
                      <View style={[
                        styles.badge,
                        inv.paymentMethod === 'Online' ? styles.badgeOnline : styles.badgeCash
                      ]}>
                        <Text style={inv.paymentMethod === 'Online' ? styles.badgeOnlineText : styles.badgeCashText}>
                          {inv.paymentMethod}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteInvoice(inv.id, inv.clientName)}
                    style={styles.deleteInvoiceBtn}
                    accessibilityLabel={`Delete invoice ${inv.id}`}
                    accessibilityRole="button"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
          {/* Form header Cancel row */}
          <View style={styles.formHeader}>
            <TouchableOpacity
              onPress={() => setIsFormOpen(false)}
              style={styles.formBackButton}
              accessibilityLabel="Cancel invoice creation and go back to ledger"
              accessibilityRole="button"
            >
              <X size={18} color="#71717a" />
              <Text style={styles.formBackButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>New Invoice</Text>
          </View>

          <Text style={styles.sectionHeader}>Customer Details</Text>

          {/* Bill to Client Information */}
          <View style={styles.card}>
            {/* Customer pre-population selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Choose Client Profile (Optional)</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCustomerDropdown(!showCustomerDropdown);
                  setShowProductDropdown(false);
                }}
                style={styles.dropdownTrigger}
                accessibilityLabel="Select client drop-down menu trigger"
                accessibilityRole="button"
              >
                <Text style={styles.dropdownValue}>
                  Select customer profile to autofill...
                </Text>
                <ChevronDown size={14} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Expanded Customer Dropdown List */}
            {showCustomerDropdown && (
              <View style={styles.dropdownContainer}>
                <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                  {MOCK_CUSTOMERS.map((cust, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setValue('clientName', cust.name, { shouldDirty: true });
                        setValue('clientPhone', cust.phone, { shouldDirty: true });
                        setValue('clientEmail', cust.email, { shouldDirty: true });
                        setShowCustomerDropdown(false);
                      }}
                      accessibilityLabel={`Choose client profile ${cust.name}`}
                      accessibilityRole="button"
                    >
                      <View>
                        <Text style={styles.dropdownOptionText}>{cust.name}</Text>
                        <Text style={{ fontSize: 10, color: '#71717a', marginTop: 2 }}>{cust.phone} | {cust.email}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Customer Name *</Text>
              <Controller
                control={control}
                name="clientName"
                rules={{ required: 'Customer name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="e.g. Aditi Sharma"
                    placeholderTextColor="#a1a1aa"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    style={styles.textInput}
                  />
                )}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <Controller
                control={control}
                name="clientEmail"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="e.g. aditi@gmail.com"
                    placeholderTextColor="#a1a1aa"
                    keyboardType="email-address"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    style={styles.textInput}
                  />
                )}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <Controller
                control={control}
                name="clientPhone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="e.g. +91 99887 76655"
                    placeholderTextColor="#a1a1aa"
                    keyboardType="phone-pad"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    style={styles.textInput}
                  />
                )}
              />
            </View>
          </View>

          <Text style={styles.sectionHeader}>Select & Add Items</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Choose Product *</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowProductDropdown(!showProductDropdown);
                  setShowCustomerDropdown(false);
                }}
                style={styles.dropdownTrigger}
                accessibilityLabel="Select product from catalog dropdown"
                accessibilityRole="button"
              >
                <Text style={[styles.dropdownValue, !selectedProduct && { color: '#a1a1aa' }]}>
                  {selectedProduct ? `${selectedProduct.name} - ₹${selectedProduct.price.toLocaleString('en-IN')}` : 'Select a product...'}
                </Text>
                <ChevronDown size={14} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Expanded Product Dropdown List */}
            {showProductDropdown && (
              <View style={styles.dropdownContainer}>
                <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                  {products.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setSelectedProduct(p);
                        setShowProductDropdown(false);
                      }}
                      accessibilityLabel={`Choose product ${p.name}`}
                      accessibilityRole="button"
                    >
                      <Text style={styles.dropdownOptionText}>{p.name}</Text>
                      <Text style={styles.dropdownOptionPrice}>₹{p.price.toLocaleString('en-IN')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  keyboardType="number-pad"
                  value={itemQuantity}
                  onChangeText={setItemQuantity}
                  style={styles.textInput}
                />
              </View>
              <TouchableOpacity
                onPress={handleAddProduct}
                style={styles.addButton}
                accessibilityLabel="Add chosen item to invoice"
                accessibilityRole="button"
              >
                <Plus size={16} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Invoice Itemized List */}
          {invoiceItems.length > 0 && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Line Items</Text>
              {invoiceItems.map((item) => (
                <View key={item.id} style={styles.invoiceItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.invoiceItemName}>{item.name}</Text>
                    <Text style={styles.invoiceItemSub}>
                      {item.quantity} x ₹{item.price.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.invoiceItemRight}>
                    <Text style={styles.invoiceItemTotal}>₹{item.total.toLocaleString('en-IN')}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.id)}
                      style={styles.deleteBtn}
                      accessibilityLabel={`Delete ${item.name} item`}
                      accessibilityRole="button"
                    >
                      <Trash2 size={13} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionHeader}>Adjustments & Payment</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>GST / Tax %</Text>
                <Controller
                  control={control}
                  name="taxRate"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      keyboardType="numeric"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      style={styles.textInput}
                    />
                  )}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Discount (Flat ₹)</Text>
                <Controller
                  control={control}
                  name="discount"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      keyboardType="numeric"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      style={styles.textInput}
                    />
                  )}
                />
              </View>
            </View>

            {/* Payment Method Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.paymentSelector}>
                <TouchableOpacity
                  style={[styles.paymentOption, formValues.paymentMethod === 'Online' && styles.paymentOptionActive]}
                  onPress={() => setValue('paymentMethod', 'Online', { shouldDirty: true })}
                  accessibilityLabel="Choose Online payment mode"
                  accessibilityRole="button"
                >
                  <Text style={[styles.paymentOptionText, formValues.paymentMethod === 'Online' && styles.paymentOptionTextActive]}>
                    Online Payment
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentOption, formValues.paymentMethod === 'Cash' && styles.paymentOptionActive]}
                  onPress={() => setValue('paymentMethod', 'Cash', { shouldDirty: true })}
                  accessibilityLabel="Choose Cash payment mode"
                  accessibilityRole="button"
                >
                  <Text style={[styles.paymentOptionText, formValues.paymentMethod === 'Cash' && styles.paymentOptionTextActive]}>
                    Cash Payment
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes Input field */}
            <View style={[styles.inputGroup, { marginTop: 4 }]}>
              <Text style={styles.inputLabel}>Notes & Tailoring Customizations</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="e.g. Custom sleeve length adjustments: 22 inches"
                    placeholderTextColor="#a1a1aa"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={3}
                    style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                  />
                )}
              />
            </View>
          </View>

          {/* Pricing Calculation Summary Sheet */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Billing Summary</Text>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>GST ({formValues.taxRate || 0}%)</Text>
                <Text style={styles.summaryValue}>₹{taxAmount.toLocaleString('en-IN')}</Text>
              </View>
              {discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryValue, { color: '#16a34a' }]}>-₹{discountAmount.toLocaleString('en-IN')}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </View>

          {/* Generate / Preview Trigger */}
          <TouchableOpacity
            onPress={handleSubmit(onPreviewSubmit)}
            style={styles.generateButton}
            accessibilityLabel="Preview and generate invoice button"
            accessibilityRole="button"
          >
            <FileText size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.generateButtonText}>Preview & Generate</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Invoice Document Modal Preview */}
      <Modal
        visible={isPreviewOpen}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.previewContainer}>
          <View style={{ flex: 1 }}>
            {/* Modal Header */}
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>
                {isViewingPast ? `Invoice ${activeInvNumber}` : 'Preview Invoice'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsPreviewOpen(false);
                  setViewingInvoice(null);
                }}
                style={styles.closeBtn}
                accessibilityLabel="Close invoice preview modal button"
                accessibilityRole="button"
              >
                <X size={20} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Simulated Paper Invoice Document */}
            <ScrollView style={styles.paperScroll} contentContainerStyle={styles.paperPadding}>
              <View style={styles.paperInvoice}>

                {/* Traditional Atelier Border */}
                <View style={styles.traditionalBorder} />

                {/* Invoice Header */}
                <View style={styles.invoiceHeaderRow}>
                  <View>
                    <Text style={styles.brandTitle}>JB51</Text>
                    <Text style={styles.brandSubtitle}>EST. 1951</Text>
                    <Text style={styles.brandAddress}>
                      Chandni Chowk, New Delhi, India{"\n"}
                      atelier@jb51.store
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.invoiceLabel}>INVOICE</Text>
                    <Text style={styles.invoiceDetailValue}>{activeInvNumber}</Text>
                    <Text style={styles.invoiceDetailLabel}>DATE</Text>
                    <Text style={styles.invoiceDetailValue}>{activeInvDate}</Text>
                    <Text style={styles.invoiceDetailLabel}>PAYMENT METHOD</Text>
                    <Text style={styles.invoiceDetailValue}>{activePaymentMethod}</Text>
                  </View>
                </View>

                {/* Client Info Block */}
                <View style={styles.billToBlock}>
                  <Text style={styles.billToTitle}>BILL TO</Text>
                  <Text style={styles.clientNameValue}>{activeClientName}</Text>
                  {activeClientEmail ? <Text style={styles.clientMetaText}>{activeClientEmail}</Text> : null}
                  {activeClientPhone ? <Text style={styles.clientMetaText}>{activeClientPhone}</Text> : null}
                </View>

                {/* Itemized Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCol, { flex: 2, fontWeight: 'bold' }]}>Description</Text>
                  <Text style={[styles.tableCol, { flex: 0.5, textAlign: 'center', fontWeight: 'bold' }]}>Qty</Text>
                  <Text style={[styles.tableCol, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>Rate</Text>
                  <Text style={[styles.tableCol, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>Amount</Text>
                </View>

                {/* Itemized Table Rows */}
                {activeItems.map((item: any) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.tableCol, { flex: 2, color: '#27272a' }]}>{item.name}</Text>
                    <Text style={[styles.tableCol, { flex: 0.5, textAlign: 'center', color: '#71717a' }]}>{item.quantity}</Text>
                    <Text style={[styles.tableCol, { flex: 1, textAlign: 'right', color: '#71717a' }]}>₹{item.price.toLocaleString('en-IN')}</Text>
                    <Text style={[styles.tableCol, { flex: 1, textAlign: 'right', fontWeight: 'semibold', color: '#09090b' }]}>₹{item.total.toLocaleString('en-IN')}</Text>
                  </View>
                ))}

                {/* Totals Summary Column */}
                <View style={styles.totalsColumn}>
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>Subtotal</Text>
                    <Text style={styles.totalsValue}>₹{activeSubtotal.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>GST ({activeTaxRate}%)</Text>
                    <Text style={styles.totalsValue}>₹{activeTaxAmount.toLocaleString('en-IN')}</Text>
                  </View>
                  {activeDiscountAmount > 0 && (
                    <View style={styles.totalsRow}>
                      <Text style={styles.totalsLabel}>Discount</Text>
                      <Text style={styles.totalsValue}>- ₹{activeDiscountAmount.toLocaleString('en-IN')}</Text>
                    </View>
                  )}
                  <View style={[styles.totalsRow, { borderTopWidth: 1, borderColor: '#e4e4e7', paddingTop: 8, marginTop: 4 }]}>
                    <Text style={styles.grandTotalLabelText}>TOTAL AMOUNT</Text>
                    <Text style={styles.grandTotalValueText}>₹{activeTotalAmount.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {/* Notes Display */}
                {activeNotes ? (
                  <View style={styles.notesPaperBox}>
                    <Text style={styles.notesPaperTitle}>Notes & Tailoring Customizations:</Text>
                    <Text style={styles.notesPaperContent}>{activeNotes}</Text>
                  </View>
                ) : null}

                {/* Footer Signature */}
                <View style={styles.paperFooter}>
                  <Text style={styles.thankYouText}>Thank you for your business at JB51.</Text>
                  <Text style={styles.systemTag}>Invoice Engine Powered by React Invoice Generator Protocol</Text>
                </View>

              </View>
            </ScrollView>

            {/* Export Bar */}
            <View style={styles.exportBar}>
              <TouchableOpacity
                onPress={() => isViewingPast ? handleSharePastInvoice(viewingInvoice) : handleExportInvoice()}
                disabled={isExporting}
                style={styles.exportBtn}
                accessibilityLabel={isViewingPast ? "Reshare past invoice PDF" : "Generate and save invoice button"}
                accessibilityRole="button"
              >
                {isExporting ? (
                  <Text style={styles.exportBtnText}>Generating PDF...</Text>
                ) : (
                  <>
                    <Printer size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.exportBtnText}>
                      {isViewingPast ? 'Share PDF Invoice' : 'Generate & Save Invoice'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ledgerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#18181b',
  },
  ledgerSubtitle: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  newInvoiceButtonHeader: {
    backgroundColor: '#FF5E36',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    paddingHorizontal: 12,
    gap: 6,
  },
  newInvoiceButtonTextHeader: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#71717a',
    marginBottom: 4,
    textAlign: 'center',
  },
  statsValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#18181b',
  },
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  invoiceCardMain: {
    padding: 16,
    paddingRight: 60,
  },
  invoiceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  invoiceCardClient: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#18181b',
  },
  invoiceCardDate: {
    fontSize: 11,
    color: '#71717a',
  },
  invoiceCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  invoiceCardId: {
    fontSize: 11,
    color: '#a1a1aa',
  },
  invoiceCardCount: {
    fontSize: 11,
    color: '#71717a',
  },
  invoiceCardNotes: {
    fontSize: 10,
    color: '#a1a1aa',
    fontStyle: 'italic',
    marginTop: 8,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  invoiceCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  invoiceCardAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FF5E36',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeOnline: {
    backgroundColor: '#ecfdf5',
  },
  badgeOnlineText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: 'bold',
  },
  badgeCash: {
    backgroundColor: '#fffbeb',
  },
  badgeCashText: {
    color: '#d97706',
    fontSize: 9,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#52525b',
    marginTop: 10,
  },
  emptyStateSub: {
    fontSize: 11,
    color: '#a1a1aa',
    marginTop: 4,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181b',
  },
  formBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  formBackButtonText: {
    fontSize: 14,
    color: '#71717a',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#71717a',
    marginTop: 12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#09090b',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3f3f46',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#09090b',
    backgroundColor: '#ffffff',
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  dropdownValue: {
    fontSize: 13,
    color: '#09090b',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    maxHeight: 150,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dropdownScroll: {
    flexGrow: 0,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  dropdownOptionText: {
    fontSize: 13,
    color: '#18181b',
  },
  dropdownOptionPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF5E36',
  },
  addButton: {
    backgroundColor: '#18181b',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  invoiceItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  invoiceItemName: {
    fontSize: 13,
    fontWeight: 'semibold',
    color: '#09090b',
  },
  invoiceItemSub: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  invoiceItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  invoiceItemTotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#09090b',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  paymentSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f4f4f5',
    padding: 3,
  },
  paymentOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  paymentOptionActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
  },
  paymentOptionTextActive: {
    color: '#FF5E36',
  },
  summaryBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#71717a',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'semibold',
    color: '#18181b',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingTop: 8,
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#09090b',
  },
  grandTotalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF5E36',
  },
  generateButton: {
    backgroundColor: '#FF5E36',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5E36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  previewHeader: {
    height: 56,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#09090b',
  },
  closeBtn: {
    padding: 6,
  },
  paperScroll: {
    flex: 1,
  },
  paperPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  paperInvoice: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    padding: 24,
    position: 'relative',
  },
  traditionalBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#FF5E36',
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  brandTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#18181b',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: '#FF5E36',
    marginTop: 2,
    marginBottom: 8,
  },
  brandAddress: {
    fontSize: 10,
    color: '#71717a',
    lineHeight: 14,
  },
  invoiceLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#18181b',
    letterSpacing: 1,
    marginBottom: 4,
  },
  invoiceDetailLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#71717a',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  invoiceDetailValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#18181b',
  },
  billToBlock: {
    marginVertical: 20,
  },
  billToTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#71717a',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  clientNameValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#18181b',
  },
  clientMetaText: {
    fontSize: 11,
    color: '#52525b',
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#18181b',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableCol: {
    fontSize: 11,
    color: '#18181b',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    paddingVertical: 10,
  },
  totalsColumn: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '60%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 11,
    color: '#71717a',
  },
  totalsValue: {
    fontSize: 11,
    fontWeight: 'semibold',
    color: '#18181b',
  },
  grandTotalLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#18181b',
  },
  grandTotalValueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5E36',
  },
  notesPaperBox: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  notesPaperTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#71717a',
    marginBottom: 4,
  },
  notesPaperContent: {
    fontSize: 11,
    color: '#52525b',
    lineHeight: 15,
  },
  paperFooter: {
    marginTop: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#71717a',
  },
  systemTag: {
    fontSize: 8,
    color: '#a1a1aa',
    marginTop: 8,
  },
  exportBar: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
  },
  exportBtn: {
    backgroundColor: '#18181b',
    borderRadius: 10,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteInvoiceBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
