import React, { useState, useMemo } from 'react';
import {
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Trash2,
  Plus,
  Printer,
  X,
  ChevronDown,
  UserPlus,
  Search,
  Check,
  User,
  ShoppingBag,
  PackageCheck,
  Receipt,
  Eye,
} from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useForm, Controller } from 'react-hook-form';
import { InvoiceSkeleton } from '../components/SkeletonLoader';
import styles from './InvoiceScreen.styles';
import { Product, Variant, Customer, Invoice, Order } from '../types';

export interface InvoiceFormValues {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  taxRate: string;
  discount: string;
  paymentMethod: 'Cash' | 'Online';
  notes: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productVariantId?: string | null;
  name: string;
  variantColor?: string | null;
  price: number;
  quantity: number;
  total: number;
}

interface InvoiceScreenProps {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  orders: Order[];
  showAlert: (
    title: string,
    message: string,
    type?: 'success' | 'error' | 'info' | 'confirm',
    onConfirm?: () => void
  ) => void;
  isLoading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onFetchCustomers: () => Promise<void>;
  onCreateCustomer: (data: {
    name: string;
    phoneNumber: string;
    email?: string;
    address?: string;
  }) => Promise<Customer>;
  onFetchInvoices: () => Promise<void>;
  onFetchOrders: () => Promise<void>;
  onCreateOrder: (orderData: any) => Promise<any>;
  onDeleteInvoice: (id: string, label: string) => Promise<void>;
}

export default function InvoiceScreen({
  products,
  customers,
  invoices,
  orders,
  showAlert,
  isLoading,
  refreshing,
  onRefresh,
  onFetchCustomers,
  onCreateCustomer,
  onFetchInvoices,
  onFetchOrders,
  onCreateOrder,
  onDeleteInvoice,
}: InvoiceScreenProps) {
  // Screen modes
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Ledger Tab: Invoices vs Order History
  const [activeLedgerTab, setActiveLedgerTab] = useState<'invoices' | 'orders'>('invoices');

  // Search filter for past invoices & orders in Ledger
  const [searchFilter, setSearchFilter] = useState('');

  // Selected Order for detail view modal
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);

  // Customer selection & creation state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Product & Variant selection state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Invoice form state using react-hook-form
  const { control, reset, setValue, watch } = useForm<InvoiceFormValues>({
    defaultValues: {
      invoiceNumber: '',
      invoiceDate: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      taxRate: '12',
      discount: '0',
      paymentMethod: 'Online',
      notes: '',
    },
  });

  const formValues = watch();
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  // Current calculations
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
  const taxRateNum = parseFloat(formValues.taxRate) || 0;
  const taxAmount = Math.round((subtotal * taxRateNum) / 100);
  const discountAmount = parseFloat(formValues.discount) || 0;
  const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

  // Filtered customers for dropdown
  const filteredCustomers = useMemo(() => {
    const q = customerSearchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phoneNumber && c.phoneNumber.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customers, customerSearchQuery]);

  // Filtered products for dropdown
  const filteredProducts = useMemo(() => {
    const q = productSearchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productSearchQuery]);

  // Filtered invoices for ledger
  const filteredInvoices = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const num = (inv.invoiceNumber || inv.id || '').toLowerCase();
      const name = (inv.customerName || '').toLowerCase();
      const phone = (inv.phoneNumber || '').toLowerCase();
      return num.includes(q) || name.includes(q) || phone.includes(q);
    });
  }, [invoices, searchFilter]);

  // Filtered orders for order history
  const filteredOrders = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((ord) => {
      const num = (ord.orderNumber || ord.id || '').toLowerCase();
      const name = (ord.customerName || '').toLowerCase();
      const phone = (ord.customerPhone || '').toLowerCase();
      const itemMatch = ord.items?.some((it) =>
        (it.productName || '').toLowerCase().includes(q)
      );
      return num.includes(q) || name.includes(q) || phone.includes(q) || itemMatch;
    });
  }, [orders, searchFilter]);

  // Normalized viewing invoice helper
  const resolvedInvoice = useMemo(() => {
    if (!viewingInvoice) return null;
    const isCash =
      (viewingInvoice.mode || viewingInvoice.paymentMethod || 'cash').toLowerCase() ===
      'cash';
    const paymentMethod = isCash ? 'Cash' : 'Online';
    const finalAmt = Number(
      viewingInvoice.finalAmount ?? viewingInvoice.totalAmount ?? 0
    );
    const sub = Number(viewingInvoice.subtotal ?? finalAmt);
    const gstRate = viewingInvoice.gst
      ? String(viewingInvoice.gst)
      : viewingInvoice.taxRate
        ? String(viewingInvoice.taxRate)
        : '0';
    const disc = Number(viewingInvoice.discount ?? 0);
    const dateStr = viewingInvoice.createdAt
      ? new Date(viewingInvoice.createdAt).toLocaleDateString('en-IN')
      : viewingInvoice.date || new Date().toLocaleDateString('en-IN');
    const items = Array.isArray(viewingInvoice.items)
      ? viewingInvoice.items.map((it: any) => ({
          id: it.id || it.productId || Math.random().toString(),
          productId: it.productId,
          productVariantId: it.productVariantId,
          name: it.name || it.productName || 'Product',
          variantColor: it.variantColor,
          price: Number(it.price || it.unitPrice || 0),
          quantity: Number(it.quantity || 1),
          total: Number(
            it.total ||
              Number(it.price || it.unitPrice || 0) * Number(it.quantity || 1)
          ),
        }))
      : [];

    return {
      ...viewingInvoice,
      id: viewingInvoice.invoiceNumber || viewingInvoice.id,
      realId: viewingInvoice.id,
      clientName:
        viewingInvoice.customerName ||
        viewingInvoice.clientName ||
        'Walk-in Customer',
      clientPhone: viewingInvoice.phoneNumber || viewingInvoice.clientPhone || '',
      clientEmail: viewingInvoice.email || viewingInvoice.clientEmail || '',
      clientAddress:
        viewingInvoice.address || viewingInvoice.clientAddress || '',
      date: dateStr,
      items,
      subtotal: sub,
      taxRate: gstRate,
      taxAmount: Math.round((sub * (parseFloat(gstRate) || 0)) / 100),
      discount: disc,
      totalAmount: finalAmt,
      paymentMethod,
      notes: viewingInvoice.notes || '',
    };
  }, [viewingInvoice]);

  // Preview data resolution
  const isViewingPast = resolvedInvoice !== null;
  const activeInvNumber = isViewingPast
    ? resolvedInvoice.id
    : formValues.invoiceNumber;
  const activeInvDate = isViewingPast
    ? resolvedInvoice.date
    : formValues.invoiceDate;
  const activeClientName = isViewingPast
    ? resolvedInvoice.clientName
    : formValues.clientName;
  const activeClientEmail = isViewingPast
    ? resolvedInvoice.clientEmail
    : formValues.clientEmail;
  const activeClientPhone = isViewingPast
    ? resolvedInvoice.clientPhone
    : formValues.clientPhone;
  const activeClientAddress = isViewingPast
    ? resolvedInvoice.clientAddress
    : formValues.clientAddress;
  const activeItems = isViewingPast ? resolvedInvoice.items : invoiceItems;
  const activeTaxRate = isViewingPast
    ? resolvedInvoice.taxRate
    : formValues.taxRate;
  const activeDiscount = isViewingPast
    ? resolvedInvoice.discount
    : formValues.discount;
  const activePaymentMethod = isViewingPast
    ? resolvedInvoice.paymentMethod
    : formValues.paymentMethod;
  const activeNotes = isViewingPast
    ? resolvedInvoice.notes
    : formValues.notes;

  const activeSubtotal = activeItems.reduce(
    (sum: number, item: any) => sum + item.total,
    0
  );
  const activeTaxAmount = Math.round(
    (activeSubtotal * (parseFloat(activeTaxRate) || 0)) / 100
  );
  const activeDiscountAmount = parseFloat(activeDiscount) || 0;
  const activeTotalAmount = Math.max(
    0,
    activeSubtotal + activeTaxAmount - activeDiscountAmount
  );

  // Handle selecting a customer from dropdown
  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomerId(cust.id);
    setValue('clientName', cust.name, { shouldDirty: true });
    setValue('clientPhone', cust.phoneNumber || '', { shouldDirty: true });
    setValue('clientEmail', cust.email || '', { shouldDirty: true });
    setValue('clientAddress', cust.address || '', { shouldDirty: true });
    setShowCustomerDropdown(false);
  };

  // Handle manual customer creation
  const handleSaveNewCustomer = async () => {
    const trimmedName = newCustomerName.trim();
    if (!trimmedName) {
      showAlert('Name Required', 'Please enter customer name.', 'error');
      return;
    }

    const trimmedPhone = newCustomerPhone.trim();
    if (!trimmedPhone) {
      showAlert('Phone Number Required', 'Please enter customer phone number.', 'error');
      return;
    }

    setIsSavingCustomer(true);
    try {
      const created = await onCreateCustomer({
        name: trimmedName,
        phoneNumber: trimmedPhone,
        email: newCustomerEmail.trim() || undefined,
        address: newCustomerAddress.trim() || undefined,
      });

      // Auto-select newly created customer
      handleSelectCustomer(created);
      setIsAddCustomerModalOpen(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      setNewCustomerAddress('');
    } catch (err: any) {
      // Alert already handled in parent
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // Handle product selection
  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    const initialPrice = prod.sellingPrice || prod.price;
    setItemPrice(String(initialPrice));
    setItemQuantity('1');

    if (prod.variants && prod.variants.length > 0) {
      setSelectedVariant(prod.variants[0] || null);
    } else {
      setSelectedVariant(null);
    }
    setShowProductDropdown(false);
  };

  // Handle adding line item
  const handleAddProduct = () => {
    if (!selectedProduct) {
      showAlert('Selection Required', 'Please select a product from the catalog.', 'error');
      return;
    }

    const qty = parseInt(itemQuantity) || 1;
    if (qty <= 0) {
      showAlert('Invalid Quantity', 'Quantity must be at least 1.', 'error');
      return;
    }

    const price = parseFloat(itemPrice) || selectedProduct.sellingPrice || selectedProduct.price;
    const variantColor = selectedVariant?.color || null;
    const variantId = (selectedVariant as any)?.id || null;

    const itemName = variantColor
      ? `${selectedProduct.name} (${variantColor})`
      : selectedProduct.name;

    const existingIndex = invoiceItems.findIndex(
      (it) =>
        it.productId === selectedProduct.id &&
        it.variantColor === variantColor
    );

    if (existingIndex > -1) {
      const updated = [...invoiceItems];
      const existing = updated[existingIndex]!;
      existing.quantity += qty;
      existing.total = existing.quantity * existing.price;
      setInvoiceItems(updated);
    } else {
      setInvoiceItems((prev) => [
        ...prev,
        {
          id: `item_${Date.now()}_${Math.random().toString().slice(2, 6)}`,
          productId: selectedProduct.id,
          productVariantId: variantId,
          name: itemName,
          variantColor,
          price,
          quantity: qty,
          total: qty * price,
        },
      ]);
    }

    setSelectedProduct(null);
    setSelectedVariant(null);
    setItemPrice('');
    setItemQuantity('1');
    showAlert('Item Added', `${itemName} added to invoice.`, 'success');
  };

  const handleRemoveItem = (id: string) => {
    setInvoiceItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Generate HTML for invoice PDF
  const generateInvoiceHtml = (inv: {
    id: string;
    clientName: string;
    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    date: string;
    items: InvoiceItem[];
    subtotal: number;
    taxRate: string;
    taxAmount: number;
    discount: number;
    totalAmount: number;
    paymentMethod: string;
    notes?: string;
  }) => {
    const escapeHtml = (unsafe: any) => {
      if (unsafe === null || unsafe === undefined) return '';
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const escapedNotes = inv.notes
      ? escapeHtml(inv.notes).replace(/\r?\n/g, '<br>')
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${escapeHtml(inv.id)}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #18181b;
            padding: 36px;
            line-height: 1.4;
            background-color: #fff;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #e4e4e7;
            position: relative;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
          }
          .top-border {
            height: 6px;
            background-color: #FF5E36;
            width: 100%;
          }
          .content-box {
            padding: 36px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #f4f4f5;
            padding-bottom: 24px;
            margin-bottom: 28px;
          }
          .brand-title {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 2px;
            margin: 0;
            color: #18181b;
          }
          .brand-subtitle {
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #FF5E36;
            margin: 3px 0 12px 0;
          }
          .brand-details {
            font-size: 11px;
            color: #71717a;
            line-height: 16px;
          }
          .invoice-details {
            text-align: right;
            font-size: 12px;
            line-height: 20px;
          }
          .invoice-title {
            font-size: 22px;
            font-weight: 900;
            color: #18181b;
            letter-spacing: 1px;
            margin: 0 0 8px 0;
          }
          .client-block {
            margin-bottom: 30px;
            padding: 16px 20px;
            background-color: #fafafa;
            border-radius: 6px;
            border-left: 3px solid #FF5E36;
          }
          .bill-to {
            font-size: 10px;
            font-weight: 700;
            color: #71717a;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 4px;
          }
          .client-name {
            font-size: 16px;
            font-weight: 700;
            color: #18181b;
          }
          .client-meta {
            font-size: 12px;
            color: #52525b;
            margin-top: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th {
            background-color: #fafafa;
            color: #52525b;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 12px;
            border-bottom: 2px solid #e4e4e7;
            text-align: left;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #f4f4f5;
            font-size: 12px;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .totals-table {
            width: 320px;
            margin-left: auto;
            margin-top: 12px;
          }
          .totals-table td {
            padding: 6px 12px;
            border: none;
            font-size: 12px;
          }
          .grand-total-row td {
            border-top: 2px solid #18181b;
            font-size: 14px;
            padding-top: 10px;
          }
          .grand-total-val {
            color: #FF5E36;
            font-size: 16px;
          }
          .notes-box {
            margin-top: 24px;
            padding: 14px 18px;
            background-color: #fafafa;
            border-radius: 6px;
            font-size: 12px;
            color: #52525b;
            border: 1px solid #f4f4f5;
          }
          .footer {
            margin-top: 36px;
            padding-top: 16px;
            border-top: 1px solid #f4f4f5;
            text-align: center;
            font-size: 11px;
            color: #a1a1aa;
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
                <div class="brand-subtitle">EST. 1951 - ATELIER</div>
                <div class="brand-details">
                  Chandni Chowk, New Delhi, India<br>
                  atelier@jb51.store | +91 98100 00051
                </div>
              </div>
              <div class="invoice-details">
                <div class="invoice-title">INVOICE</div>
                <strong>Invoice #:</strong> ${escapeHtml(inv.id)}<br>
                <strong>Date:</strong> ${escapeHtml(inv.date)}<br>
                <strong>Payment Mode:</strong> ${escapeHtml(inv.paymentMethod)}
              </div>
            </div>
            
            <div class="client-block">
              <div class="bill-to">BILL TO</div>
              <div class="client-name">${escapeHtml(inv.clientName)}</div>
              ${inv.clientPhone ? `<div class="client-meta">Phone: ${escapeHtml(inv.clientPhone)}</div>` : ''}
              ${inv.clientEmail ? `<div class="client-meta">Email: ${escapeHtml(inv.clientEmail)}</div>` : ''}
              ${inv.clientAddress ? `<div class="client-meta">Address: ${escapeHtml(inv.clientAddress)}</div>` : ''}
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-center" style="width: 70px;">Qty</th>
                  <th class="text-right" style="width: 110px;">Rate</th>
                  <th class="text-right" style="width: 120px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${inv.items
                  .map(
                    (item: any) => `
                  <tr>
                    <td>${escapeHtml(item.name)}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">&#8377;${item.price.toLocaleString('en-IN')}</td>
                    <td class="text-right" style="font-weight: 700;">&#8377;${item.total.toLocaleString('en-IN')}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
            
            <table class="totals-table">
              <tbody>
                <tr>
                  <td>Subtotal:</td>
                  <td class="text-right">&#8377;${inv.subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>GST (${escapeHtml(inv.taxRate)}%):</td>
                  <td class="text-right">&#8377;${inv.taxAmount.toLocaleString('en-IN')}</td>
                </tr>
                ${
                  inv.discount > 0
                    ? `
                  <tr>
                    <td>Discount:</td>
                    <td class="text-right" style="color: #16a34a;">- &#8377;${inv.discount.toLocaleString('en-IN')}</td>
                  </tr>
                `
                    : ''
                }
                <tr class="grand-total-row">
                  <td><strong>Grand Total:</strong></td>
                  <td class="text-right"><strong class="grand-total-val">&#8377;${inv.totalAmount.toLocaleString('en-IN')}</strong></td>
                </tr>
              </tbody>
            </table>

            ${
              inv.notes
                ? `
              <div class="notes-box">
                <strong>Notes / Instructions:</strong><br>
                ${escapedNotes}
              </div>
            `
                : ''
            }
            
            <div class="footer">
              Thank you for shopping with JB51. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Complete end-to-end invoice creation flow
  const handleCreateAndShareInvoice = async () => {
    const clientName = formValues.clientName.trim();
    if (!clientName) {
      showAlert('Customer Required', 'Please enter or select a customer.', 'error');
      return;
    }
    if (invoiceItems.length === 0) {
      showAlert('Items Required', 'Please add at least one item to the invoice.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const invNumber =
        formValues.invoiceNumber ||
        `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderNumber = invNumber.replace('INV', 'ORD');

      // 1. Create Order, deduct Inventory, and create Invoice atomically in backend
      const orderPayload = {
        orderNumber,
        invoiceNumber: invNumber,
        customerId: selectedCustomerId || null,
        customerName: clientName,
        phoneNumber: formValues.clientPhone.trim() || null,
        email: formValues.clientEmail.trim() || null,
        address: formValues.clientAddress.trim() || null,
        status: 'confirmed',
        paymentMethod: formValues.paymentMethod.toLowerCase(),
        subtotal,
        gst: taxAmount,
        discount: discountAmount,
        totalAmount,
        items: invoiceItems.map((item) => ({
          productId: item.productId,
          productVariantId: item.productVariantId || null,
          productName: item.name,
          variantColor: item.variantColor || null,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.total,
        })),
        notes: formValues.notes.trim() || null,
      };

      await onCreateOrder(orderPayload);

      // 2. Generate & Share PDF
      const pdfData = {
        id: invNumber,
        clientName,
        clientPhone: formValues.clientPhone.trim(),
        clientEmail: formValues.clientEmail.trim(),
        clientAddress: formValues.clientAddress.trim(),
        date: formValues.invoiceDate || new Date().toLocaleDateString('en-IN'),
        items: invoiceItems,
        subtotal,
        taxRate: formValues.taxRate,
        taxAmount,
        discount: discountAmount,
        totalAmount,
        paymentMethod: formValues.paymentMethod,
        notes: formValues.notes.trim(),
      };

      const html = generateInvoiceHtml(pdfData);
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share Invoice ${invNumber}`,
          UTI: 'com.adobe.pdf',
        });
      }

      showAlert(
        'Invoice Created',
        `Invoice ${invNumber} was saved, order recorded, and inventory updated!`,
        'success'
      );

      // 5. Refresh databases & Reset form
      await Promise.all([
        onFetchInvoices(),
        onFetchOrders(),
        onFetchCustomers(),
      ]);

      setIsPreviewOpen(false);
      setIsFormOpen(false);
      reset();
      setInvoiceItems([]);
      setSelectedCustomerId(null);
    } catch (err: any) {
      console.error('[handleCreateAndShareInvoice Error]:', err);
      showAlert('Creation Failed', err.message || 'Failed to complete invoice creation.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Share existing past invoice
  const handleSharePastInvoice = async (inv: any) => {
    setIsExporting(true);
    try {
      const html = generateInvoiceHtml(inv);
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share Invoice ${inv.id}`,
          UTI: 'com.adobe.pdf',
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

  // Open invoice creator
  const handleOpenNewInvoice = () => {
    setIsPreviewOpen(false);
    setViewingInvoice(null);
    setSelectedCustomerId(null);
    setInvoiceItems([]);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setShowCustomerDropdown(false);
    setShowProductDropdown(false);

    reset({
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceDate: new Date().toLocaleDateString('en-IN'),
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      taxRate: '12',
      discount: '0',
      paymentMethod: 'Online',
      notes: '',
    });

    setIsFormOpen(true);
  };

  const totalCollected = invoices.reduce(
    (sum, inv) => sum + Number(inv.finalAmount ?? inv.totalAmount ?? 0),
    0
  );
  const totalOrdersValue = orders.reduce(
    (sum, ord) => sum + Number(ord.totalAmount || 0),
    0
  );
  const cashCollected = invoices
    .filter((inv) => (inv.mode || 'cash').toLowerCase() === 'cash')
    .reduce((sum, inv) => sum + Number(inv.finalAmount ?? inv.totalAmount ?? 0), 0);

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
        // ---------------- LEDGER / PAST INVOICES & ORDERS VIEW ----------------
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
                <Text style={styles.ledgerTitle}>Invoices & Orders</Text>
                <Text style={styles.ledgerSubtitle}>
                  {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} • {orders.length} {orders.length === 1 ? 'order' : 'orders'} recorded
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleOpenNewInvoice}
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
                            setViewingInvoice(inv);
                            setIsPreviewOpen(true);
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
                            onPress={() => setSelectedOrderModal(ord)}
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
      ) : (
        // ---------------- NEW INVOICE CREATION FORM ----------------
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Form Header */}
          <View style={styles.formHeader}>
            <TouchableOpacity
              onPress={() => setIsFormOpen(false)}
              style={styles.formBackButton}
              accessibilityLabel="Cancel invoice creation"
              accessibilityRole="button"
            >
              <X size={18} color="#71717a" />
              <Text style={styles.formBackButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>New Invoice</Text>
          </View>

          {/* Customer Selection Section */}
          <Text style={styles.sectionHeader}>Customer Details</Text>

          <View style={styles.card}>
            {/* Customer Dropdown Trigger */}
            <View style={[styles.inputGroup, !showCustomerDropdown && { marginBottom: 0 }]}>
              <Text style={styles.inputLabel}>Choose Existing Customer</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCustomerDropdown(!showCustomerDropdown);
                  setShowProductDropdown(false);
                }}
                style={styles.dropdownTrigger}
                accessibilityLabel="Select customer dropdown"
                accessibilityRole="button"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <User size={15} color={selectedCustomerId ? '#FF5E36' : '#a1a1aa'} style={{ marginRight: 8 }} />
                  <Text
                    style={[
                      styles.dropdownValue,
                      !formValues.clientName && { color: '#a1a1aa' },
                    ]}
                    numberOfLines={1}
                  >
                    {formValues.clientName
                      ? `${formValues.clientName} ${formValues.clientPhone ? `(${formValues.clientPhone})` : ''}`
                      : 'Select from database...'}
                  </Text>
                </View>
                {formValues.clientName ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedCustomerId(null);
                      setValue('clientName', '', { shouldDirty: true });
                      setValue('clientPhone', '', { shouldDirty: true });
                      setValue('clientEmail', '', { shouldDirty: true });
                      setValue('clientAddress', '', { shouldDirty: true });
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginRight: 6 }}
                  >
                    <X size={14} color="#a1a1aa" />
                  </TouchableOpacity>
                ) : null}
                <ChevronDown size={14} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Expanded Customer Picker */}
            {showCustomerDropdown && (
              <View style={styles.dropdownContainer}>
                {/* Search input */}
                <View style={styles.dropdownSearchBox}>
                  <Search size={13} color="#a1a1aa" style={{ marginRight: 6 }} />
                  <TextInput
                    placeholder="Search name, phone, or email..."
                    placeholderTextColor="#a1a1aa"
                    value={customerSearchQuery}
                    onChangeText={setCustomerSearchQuery}
                    style={styles.dropdownSearchInput}
                  />
                  {customerSearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setCustomerSearchQuery('')}>
                      <X size={12} color="#a1a1aa" />
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                  {filteredCustomers.length === 0 ? (
                    <View style={styles.dropdownEmpty}>
                      <Text style={styles.dropdownEmptyText}>
                        No customers found.
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowCustomerDropdown(false);
                          setIsAddCustomerModalOpen(true);
                        }}
                      >
                        <Text style={styles.dropdownEmptyAction}>
                          Click to add manually
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      {filteredCustomers.map((cust) => {
                        const isSelected = selectedCustomerId === cust.id;
                        return (
                          <TouchableOpacity
                            key={cust.id}
                            style={[
                              styles.dropdownOption,
                              isSelected && styles.dropdownOptionSelected,
                            ]}
                            onPress={() => handleSelectCustomer(cust)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={styles.dropdownOptionText}>
                                {cust.name}
                              </Text>
                              <Text style={styles.dropdownOptionMeta}>
                                {[cust.phoneNumber, cust.email]
                                  .filter(Boolean)
                                  .join(' | ') || 'No contact details'}
                              </Text>
                            </View>
                            {isSelected && <Check size={14} color="#FF5E36" />}
                          </TouchableOpacity>
                        );
                      })}
                      <TouchableOpacity
                        style={[styles.dropdownEmpty, { paddingTop: 10, paddingBottom: 14 }]}
                        onPress={() => {
                          setShowCustomerDropdown(false);
                          setIsAddCustomerModalOpen(true);
                        }}
                      >
                        <Text style={styles.dropdownEmptyAction}>
                          Click to add manually
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Product & Variant Selection Section */}
          <Text style={styles.sectionHeader}>Select & Add Items</Text>
          <View style={styles.card}>
            {/* Product Picker Trigger */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Choose Product *</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowProductDropdown(!showProductDropdown);
                  setShowCustomerDropdown(false);
                }}
                style={styles.dropdownTrigger}
                accessibilityLabel="Select product from catalog"
                accessibilityRole="button"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <ShoppingBag
                    size={15}
                    color={selectedProduct ? '#FF5E36' : '#a1a1aa'}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      styles.dropdownValue,
                      !selectedProduct && { color: '#a1a1aa' },
                    ]}
                    numberOfLines={1}
                  >
                    {selectedProduct
                      ? `${selectedProduct.name} - ₹${(selectedProduct.sellingPrice || selectedProduct.price).toLocaleString('en-IN')}`
                      : 'Select a product from catalog...'}
                  </Text>
                </View>
                <ChevronDown size={14} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Expanded Product Picker */}
            {showProductDropdown && (
              <View style={styles.dropdownContainer}>
                <View style={styles.dropdownSearchBox}>
                  <Search size={13} color="#a1a1aa" style={{ marginRight: 6 }} />
                  <TextInput
                    placeholder="Search product name..."
                    placeholderTextColor="#a1a1aa"
                    value={productSearchQuery}
                    onChangeText={setProductSearchQuery}
                    style={styles.dropdownSearchInput}
                  />
                </View>

                <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                  {filteredProducts.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.dropdownOption}
                      onPress={() => handleSelectProduct(p)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dropdownOptionText}>{p.name}</Text>
                        <Text style={styles.dropdownOptionMeta}>
                          {p.category} {p.variants?.length ? `• ${p.variants.length} variant(s)` : ''}
                        </Text>
                      </View>
                      <Text style={styles.dropdownOptionPrice}>
                        &#8377;{(p.sellingPrice || p.price).toLocaleString('en-IN')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Variant Selector (if product has variants) */}
            {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Color / Variant</Text>
                <View style={styles.variantChipsContainer}>
                  {selectedProduct.variants.map((v, i) => {
                    const isSelected = selectedVariant?.color === v.color;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => setSelectedVariant(v)}
                        style={[
                          styles.variantChip,
                          isSelected && styles.variantChipActive,
                        ]}
                      >
                        <View
                          style={[
                            styles.variantDot,
                            { backgroundColor: v.hexCode || '#18181b' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.variantChipText,
                            isSelected && styles.variantChipTextActive,
                          ]}
                        >
                          {v.color} ({v.stock} in stock)
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Price & Quantity Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Rate / Price (&#8377;)</Text>
                <TextInput
                  keyboardType="numeric"
                  value={itemPrice}
                  onChangeText={setItemPrice}
                  placeholder="Price"
                  placeholderTextColor="#a1a1aa"
                  style={styles.textInput}
                />
              </View>

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
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Line Items List */}
          {invoiceItems.length > 0 && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { marginBottom: 12 }]}>
                Line Items ({invoiceItems.length})
              </Text>
              {invoiceItems.map((item) => (
                <View key={item.id} style={styles.invoiceItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.invoiceItemName}>{item.name}</Text>
                    <Text style={styles.invoiceItemSub}>
                      {item.quantity} x &#8377;{item.price.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.invoiceItemRight}>
                    <Text style={styles.invoiceItemTotal}>
                      &#8377;{item.total.toLocaleString('en-IN')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.id)}
                      style={styles.deleteBtn}
                      accessibilityLabel={`Delete ${item.name}`}
                      accessibilityRole="button"
                    >
                      <Trash2 size={13} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Taxes, Discounts & Payment */}
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
                {/* GST Presets */}
                <View style={styles.presetsRow}>
                  {['0', '5', '12', '18'].map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      onPress={() => setValue('taxRate', preset, { shouldDirty: true })}
                      style={[
                        styles.presetChip,
                        formValues.taxRate === preset && styles.presetChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          formValues.taxRate === preset && styles.presetChipTextActive,
                        ]}
                      >
                        {preset}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Discount (Flat &#8377;)</Text>
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
                  style={[
                    styles.paymentOption,
                    formValues.paymentMethod === 'Online' &&
                      styles.paymentOptionActive,
                  ]}
                  onPress={() =>
                    setValue('paymentMethod', 'Online', { shouldDirty: true })
                  }
                >
                  <Text
                    style={[
                      styles.paymentOptionText,
                      formValues.paymentMethod === 'Online' &&
                        styles.paymentOptionTextActive,
                    ]}
                  >
                    Online Payment
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    formValues.paymentMethod === 'Cash' &&
                      styles.paymentOptionActive,
                  ]}
                  onPress={() =>
                    setValue('paymentMethod', 'Cash', { shouldDirty: true })
                  }
                >
                  <Text
                    style={[
                      styles.paymentOptionText,
                      formValues.paymentMethod === 'Cash' &&
                        styles.paymentOptionTextActive,
                    ]}
                  >
                    Cash Payment
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <View style={[styles.inputGroup, { marginTop: 4 }]}>
              <Text style={styles.inputLabel}>Special Instructions / Notes</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="e.g. Alterations requested, paid advance..."
                    placeholderTextColor="#a1a1aa"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={2}
                    style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                  />
                )}
              />
            </View>

            {/* Live Calculation Summary */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  &#8377;{subtotal.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  GST ({formValues.taxRate}%)
                </Text>
                <Text style={styles.summaryValue}>
                  &#8377;{taxAmount.toLocaleString('en-IN')}
                </Text>
              </View>
              {discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryValue, { color: '#16a34a' }]}>
                    - &#8377;{discountAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Total Amount</Text>
                <Text style={styles.grandTotalValue}>
                  &#8377;{totalAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={() => {
                if (!formValues.clientName.trim()) {
                  showAlert('Customer Required', 'Please select a customer.', 'error');
                  return;
                }
                if (invoiceItems.length === 0) {
                  showAlert('Items Required', 'Please add at least one item.', 'error');
                  return;
                }
                setIsPreviewOpen(true);
              }}
              style={styles.generateButton}
              accessibilityLabel="Preview and generate invoice button"
              accessibilityRole="button"
            >
              <Text style={styles.generateButtonText}>Preview & Create Invoice</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ---------------- ORDER DETAILS MODAL ---------------- */}
      <Modal
        visible={selectedOrderModal !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedOrderModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.orderDetailsModalCard}>
            {/* Modal Header */}
            <View style={styles.orderDetailsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShoppingBag size={18} color="#FF5E36" style={{ marginRight: 8 }} />
                <View>
                  <Text style={styles.orderDetailsTitle}>
                    {selectedOrderModal?.orderNumber || 'Order Details'}
                  </Text>
                  <Text style={styles.orderDetailsSubtitle}>
                    {selectedOrderModal?.createdAt
                      ? new Date(selectedOrderModal.createdAt).toLocaleDateString('en-IN', {
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
                onPress={() => setSelectedOrderModal(null)}
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
                  {selectedOrderModal?.customerName || 'Walk-in Customer'}
                </Text>
                {selectedOrderModal?.customerPhone ? (
                  <Text style={styles.orderCustomerMeta}>
                    Phone: {selectedOrderModal.customerPhone}
                  </Text>
                ) : null}
                {selectedOrderModal?.customerEmail ? (
                  <Text style={styles.orderCustomerMeta}>
                    Email: {selectedOrderModal.customerEmail}
                  </Text>
                ) : null}
                {selectedOrderModal?.customerAddress ? (
                  <Text style={styles.orderCustomerMeta}>
                    Address: {selectedOrderModal.customerAddress}
                  </Text>
                ) : null}
              </View>

              {/* Items Table */}
              <Text style={styles.orderSectionTitle}>
                Purchased Items ({selectedOrderModal?.items?.length || 0})
              </Text>
              <View style={styles.orderItemsTable}>
                {selectedOrderModal?.items && selectedOrderModal.items.length > 0 ? (
                  selectedOrderModal.items.map((it, idx) => (
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
                {selectedOrderModal?.subtotal ? (
                  <View style={styles.orderSummaryRow}>
                    <Text style={styles.orderSummaryLabel}>Subtotal</Text>
                    <Text style={styles.orderSummaryValue}>
                      &#8377;{Number(selectedOrderModal.subtotal).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ) : null}
                {Number(selectedOrderModal?.gst || 0) > 0 ? (
                  <View style={styles.orderSummaryRow}>
                    <Text style={styles.orderSummaryLabel}>GST / Tax</Text>
                    <Text style={styles.orderSummaryValue}>
                      &#8377;{Number(selectedOrderModal?.gst).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ) : null}
                {Number(selectedOrderModal?.discount || 0) > 0 ? (
                  <View style={styles.orderSummaryRow}>
                    <Text style={styles.orderSummaryLabel}>Discount</Text>
                    <Text style={[styles.orderSummaryValue, { color: '#16a34a' }]}>
                      - &#8377;{Number(selectedOrderModal?.discount).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ) : null}
                <View style={[styles.orderSummaryRow, styles.orderGrandTotalRow]}>
                  <Text style={styles.orderGrandTotalLabel}>Total Amount</Text>
                  <Text style={styles.orderGrandTotalValue}>
                    &#8377;{Number(selectedOrderModal?.totalAmount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Additional Details */}
              <View style={styles.orderMetaBlock}>
                <Text style={styles.orderMetaItem}>
                  Status: <Text style={{ fontWeight: '700', color: '#16a34a' }}>{selectedOrderModal?.status || 'Confirmed'}</Text>
                </Text>
                <Text style={styles.orderMetaItem}>
                  Payment Mode: <Text style={{ fontWeight: '700', color: '#09090b' }}>{selectedOrderModal?.paymentMethod === 'online' ? 'Online Payment' : 'Cash Payment'}</Text>
                </Text>
                {selectedOrderModal?.notes ? (
                  <Text style={styles.orderMetaItem}>
                    Notes: <Text style={{ color: '#71717a' }}>{selectedOrderModal.notes}</Text>
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() => setSelectedOrderModal(null)}
                style={[styles.generateButton, { marginTop: 16 }]}
              >
                <Text style={styles.generateButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ---------------- MANUAL CUSTOMER CREATION MODAL ---------------- */}
      <Modal
        visible={isAddCustomerModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.customerModalCard}>
            <View style={styles.customerModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <UserPlus size={18} color="#FF5E36" style={{ marginRight: 8 }} />
                <Text style={styles.customerModalTitle}>Add Customer Manually</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddCustomerModalOpen(false)}
                style={styles.closeBtn}
              >
                <X size={18} color="#71717a" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  placeholder="e.g. Aditi Sharma"
                  placeholderTextColor="#a1a1aa"
                  value={newCustomerName}
                  onChangeText={setNewCustomerName}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor="#a1a1aa"
                  keyboardType="phone-pad"
                  value={newCustomerPhone}
                  onChangeText={setNewCustomerPhone}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  placeholder="e.g. aditi@gmail.com"
                  placeholderTextColor="#a1a1aa"
                  keyboardType="email-address"
                  value={newCustomerEmail}
                  onChangeText={setNewCustomerEmail}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  placeholder="e.g. Flat 402, Signature Tower, Pune"
                  placeholderTextColor="#a1a1aa"
                  value={newCustomerAddress}
                  onChangeText={setNewCustomerAddress}
                  multiline
                  numberOfLines={2}
                  style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                />
              </View>

              <TouchableOpacity
                onPress={handleSaveNewCustomer}
                disabled={isSavingCustomer}
                style={[styles.generateButton, { marginTop: 12 }]}
              >
                {isSavingCustomer ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.generateButtonText}>Save & Select Customer</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ---------------- INVOICE PREVIEW / SHARE MODAL ---------------- */}
      <Modal
        visible={isPreviewOpen}
        animationType="slide"
        onRequestClose={() => {
          setIsPreviewOpen(false);
          setViewingInvoice(null);
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f5' }}>
          <View style={styles.previewContainer}>
            {/* Header */}
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>
                {isViewingPast ? 'Invoice Details' : 'Invoice Preview'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsPreviewOpen(false);
                  setViewingInvoice(null);
                }}
                style={styles.closeBtn}
              >
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
                onPress={() =>
                  isViewingPast
                    ? handleSharePastInvoice(resolvedInvoice)
                    : handleCreateAndShareInvoice()
                }
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
    </KeyboardAvoidingView>
  );
}

