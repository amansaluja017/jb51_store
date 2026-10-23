import React, { useState, useMemo, useEffect } from 'react';
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
import { generateInvoiceHtml } from '../utils/invoicePdfGenerator';
import { formatDateSafe } from '../utils/date';
import OrderDetailsModal from '../components/invoices/OrderDetailsModal';
import AddCustomerModal from '../components/invoices/AddCustomerModal';
import InvoicePreviewModal from '../components/invoices/InvoicePreviewModal';
import InvoiceLedgerView from '../components/invoices/InvoiceLedgerView';
import InvoiceFormView from '../components/invoices/InvoiceFormView';
import SelectCustomerPage from '../components/invoices/SelectCustomerPage';
import SelectProductPage from '../components/invoices/SelectProductPage';


import { Product, Variant, Customer, Invoice, Order, isProductInStock, isProductDiscontinued } from '../types';

export interface InvoiceFormValues {
  invoiceNumber: string;
  invoiceDate: string;
  paymentDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  taxRate: string;
  discount: string;
  paymentMethod: 'Cash' | 'Online' | 'Credit';
  paidAmount: string;
  dueDate: string;
  advancePaymentMode?: 'Cash' | 'Online';
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
  categories?: string[];
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
  isLoadingOrders?: boolean;
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
  onFetchOrders: (force?: boolean) => Promise<void>;
  onCreateOrder: (orderData: any) => Promise<any>;
  onDeleteInvoice: (id: string, label: string) => Promise<void>;
  onFetchCredits?: () => Promise<any> | void;
  onFetchProducts?: () => Promise<void>;
  onFetchPaginatedCustomers?: (params?: any) => Promise<any>;
  onFetchPaginatedProducts?: (params?: any) => Promise<any>;
  onFetchPaginatedInvoices?: (params?: any) => Promise<any>;
  onFetchPaginatedOrders?: (params?: any) => Promise<any>;
  isLoadingCustomers?: boolean;
  isLoadingProducts?: boolean;
}

export default function InvoiceScreen({
  products,
  categories = [],
  customers,
  invoices,
  orders,
  showAlert,
  isLoading,
  isLoadingOrders,
  refreshing,
  onRefresh,
  onFetchCustomers,
  onCreateCustomer,
  onFetchInvoices,
  onFetchOrders,
  onCreateOrder,
  onDeleteInvoice,
  onFetchCredits,
  onFetchProducts,
  onFetchPaginatedCustomers,
  onFetchPaginatedProducts,
  onFetchPaginatedInvoices,
  onFetchPaginatedOrders,
  isLoadingCustomers,
  isLoadingProducts,
}: InvoiceScreenProps) {
  // Screen modes
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSubPage, setFormSubPage] = useState<'form' | 'select-customer' | 'select-product'>('form');
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Ledger Tab: Invoices vs Order History
  const [activeLedgerTab, setActiveLedgerTab] = useState<'invoices' | 'orders'>('invoices');

  // Paginated state for Invoices
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceTotalPages, setInvoiceTotalPages] = useState(1);
  const [invoiceTotalCount, setInvoiceTotalCount] = useState(0);
  const [remoteInvoices, setRemoteInvoices] = useState<Invoice[] | null>(null);
  const [isLoadingRemoteInvoices, setIsLoadingRemoteInvoices] = useState(false);

  // Paginated state for Orders
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderTotalCount, setOrderTotalCount] = useState(0);
  const [remoteOrders, setRemoteOrders] = useState<Order[] | null>(null);
  const [isLoadingRemoteOrders, setIsLoadingRemoteOrders] = useState(false);

  // Search filter for past invoices & orders in Ledger
  const [searchFilter, setSearchFilter] = useState('');

  const handleSearchFilterChange = (q: string) => {
    setSearchFilter(q);
    setInvoicePage(1);
    setOrderPage(1);
  };

  // Fetch paginated invoices from backend
  useEffect(() => {
    if (!onFetchPaginatedInvoices) return;

    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        setIsLoadingRemoteInvoices(true);
        const res = await onFetchPaginatedInvoices({
          page: invoicePage,
          limit: 15,
          search: searchFilter.trim() || undefined,
        });
        if (!isCancelled && res) {
          setRemoteInvoices(res.items || []);
          setInvoiceTotalPages(res.totalPages || 1);
          setInvoiceTotalCount(res.totalCount || 0);
        }
      } catch (err) {
        console.error('[fetchPaginatedInvoices] Error:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingRemoteInvoices(false);
        }
      }
    }, searchFilter ? 250 : 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [invoicePage, searchFilter, onFetchPaginatedInvoices, refreshing]);

  // Fetch paginated orders from backend
  useEffect(() => {
    if (!onFetchPaginatedOrders || activeLedgerTab !== 'orders') return;

    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        setIsLoadingRemoteOrders(true);
        const res = await onFetchPaginatedOrders({
          page: orderPage,
          limit: 15,
          search: searchFilter.trim() || undefined,
        });
        if (!isCancelled && res) {
          setRemoteOrders(res.items || []);
          setOrderTotalPages(res.totalPages || 1);
          setOrderTotalCount(res.totalCount || 0);
        }
      } catch (err) {
        console.error('[fetchPaginatedOrders] Error:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingRemoteOrders(false);
        }
      }
    }, searchFilter ? 250 : 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [orderPage, searchFilter, onFetchPaginatedOrders, activeLedgerTab, refreshing]);

  // Hit order history route upon loading invoices section if needed
  useEffect(() => {
    if (!orders || orders.length === 0) {
      onFetchOrders();
    }
  }, []);

  const handleSelectLedgerTab = (tab: 'invoices' | 'orders') => {
    setActiveLedgerTab(tab);
    if (tab === 'orders' && (!orders || orders.length === 0)) {
      onFetchOrders();
    }
  };

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
  const { control, reset, setValue, watch, formState: { errors } } = useForm<InvoiceFormValues>({
    defaultValues: {
      invoiceNumber: '',
      invoiceDate: '',
      paymentDate: new Date().toISOString().split('T')[0],
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      taxRate: '12',
      discount: '0',
      paymentMethod: 'Online',
      paidAmount: '0',
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      advancePaymentMode: 'Cash',
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

  // Non-discontinued products available for invoicing
  const availableProducts = useMemo(() => {
    return (products || []).filter((p) => !isProductDiscontinued(p));
  }, [products]);

  // Filtered products for dropdown
  const filteredProducts = useMemo(() => {
    const q = productSearchQuery.trim().toLowerCase();
    if (!q) return availableProducts;
    return availableProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [availableProducts, productSearchQuery]);

  // Filtered invoices for ledger
  const filteredInvoices = useMemo(() => {
    if (remoteInvoices !== null) {
      return remoteInvoices;
    }
    const q = searchFilter.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const num = (inv.invoiceNumber || inv.id || '').toLowerCase();
      const name = (inv.customerName || '').toLowerCase();
      const phone = (inv.phoneNumber || '').toLowerCase();
      return num.includes(q) || name.includes(q) || phone.includes(q);
    });
  }, [remoteInvoices, invoices, searchFilter]);

  // Filtered orders for order history
  const filteredOrders = useMemo(() => {
    if (remoteOrders !== null) {
      return remoteOrders;
    }
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
  }, [remoteOrders, orders, searchFilter]);

  // Normalized viewing invoice helper
  const resolvedInvoice = useMemo(() => {
    if (!viewingInvoice) return null;
    const rawMode = (viewingInvoice.mode || viewingInvoice.paymentMethod || 'cash').toLowerCase();
    const isCredit = rawMode === 'credit';
    const isCash = rawMode === 'cash';
    const paymentMethod = isCredit ? 'Credit' : isCash ? 'Cash' : 'Online';
    const finalAmt = Number(
      viewingInvoice.finalAmount ?? viewingInvoice.totalAmount ?? 0
    );
    const gstAmount = Number(viewingInvoice.gst ?? 0);
    const disc = Number(viewingInvoice.discount ?? 0);

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

    const itemsSum = items.reduce((sum: number, it: any) => sum + (it.total || 0), 0);
    const sub = Number(
      viewingInvoice.subtotal ??
      (itemsSum > 0
        ? itemsSum
        : finalAmt > 0 && gstAmount > 0
          ? finalAmt - gstAmount + disc
          : finalAmt)
    );

    // Determine tax rate accurately:
    // 1. If taxRate was explicitly stored and > 0 (e.g. "12"), use it.
    // 2. If taxRate is missing or 0, but gstAmount > 0 (e.g. ₹300 tax on ₹2,500 subtotal), derive: 12%.
    // 3. Otherwise default to 0%.
    const storedRateNum =
      viewingInvoice.taxRate !== undefined && viewingInvoice.taxRate !== null
        ? parseFloat(String(viewingInvoice.taxRate))
        : NaN;

    let gstRate = '0';
    if (!isNaN(storedRateNum) && storedRateNum > 0) {
      gstRate = String(storedRateNum);
    } else if (sub > 0 && gstAmount > 0) {
      const derived = (gstAmount / sub) * 100;
      gstRate =
        Number.isInteger(derived) || Math.abs(derived - Math.round(derived)) < 0.05
          ? String(Math.round(derived))
          : derived.toFixed(1);
    }

    const taxAmount = gstAmount > 0
      ? gstAmount
      : sub > 0 && parseFloat(gstRate) > 0
        ? Math.round((sub * parseFloat(gstRate)) / 100)
        : 0;

    const dateStr = formatDateSafe(viewingInvoice.createdAt) ||
      viewingInvoice.date ||
      new Date().toLocaleDateString('en-IN');

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
      paymentDate: viewingInvoice.paymentDate || dateStr,
      items,
      subtotal: sub,
      taxRate: gstRate,
      taxAmount,
      discount: disc,
      totalAmount: finalAmt > 0 ? finalAmt : Math.max(0, sub + taxAmount - disc),
      paymentMethod,
      notes: viewingInvoice.notes || '',
      paidAmount: viewingInvoice.paidAmount,
      dueAmount: viewingInvoice.dueAmount,
      dueDate: viewingInvoice.dueDate,
      advancePaymentMode: viewingInvoice.advancePaymentMode || viewingInvoice.creditAdvancePaymentMode || null,
      creditTransactions: viewingInvoice.creditTransactions || viewingInvoice.transactions || [],
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

  const activeSubtotal = isViewingPast
    ? resolvedInvoice.subtotal
    : activeItems.reduce((sum: number, item: any) => sum + item.total, 0);

  const activeTaxAmount = isViewingPast
    ? resolvedInvoice.taxAmount
    : Math.round((activeSubtotal * (parseFloat(activeTaxRate) || 0)) / 100);

  const activeDiscountAmount = isViewingPast
    ? resolvedInvoice.discount
    : (parseFloat(activeDiscount) || 0);

  const activeTotalAmount = isViewingPast
    ? resolvedInvoice.totalAmount
    : Math.max(0, activeSubtotal + activeTaxAmount - activeDiscountAmount);

  const isViewingPastCredit = isViewingPast
    ? (resolvedInvoice?.paymentMethod || resolvedInvoice?.mode || '').toLowerCase() === 'credit'
    : formValues.paymentMethod === 'Credit';

  const activePaidAmount = isViewingPast
    ? (resolvedInvoice?.paidAmount !== null && resolvedInvoice?.paidAmount !== undefined
        ? Number(resolvedInvoice.paidAmount)
        : isViewingPastCredit ? 0 : activeTotalAmount)
    : formValues.paymentMethod === 'Credit'
      ? parseFloat(formValues.paidAmount) || 0
      : activeTotalAmount;

  const activeDueAmount = isViewingPast
    ? (resolvedInvoice?.dueAmount !== null && resolvedInvoice?.dueAmount !== undefined
        ? Number(resolvedInvoice.dueAmount)
        : isViewingPastCredit
          ? Math.max(0, activeTotalAmount - (Number(resolvedInvoice?.paidAmount ?? 0)))
          : 0)
    : formValues.paymentMethod === 'Credit'
      ? Math.max(0, activeTotalAmount - (parseFloat(formValues.paidAmount) || 0))
      : 0;

  const activeDueDate = isViewingPast
    ? (resolvedInvoice?.dueDate ? formatDateSafe(resolvedInvoice.dueDate) : null)
    : formValues.paymentMethod === 'Credit'
      ? (formValues.dueDate ? formatDateSafe(formValues.dueDate) : null)
      : null;

  const activePaymentDate = isViewingPast
    ? (resolvedInvoice?.paymentDate ? formatDateSafe(resolvedInvoice.paymentDate) : activeInvDate)
    : (formValues.paymentDate ? formatDateSafe(formValues.paymentDate) : activeInvDate);

  const activeAdvancePaymentMode = isViewingPast
    ? resolvedInvoice?.advancePaymentMode
    : formValues.advancePaymentMode || 'Cash';

  const activeTransactions = isViewingPast
    ? (resolvedInvoice?.creditTransactions || [])
    : (isViewingPastCredit && (parseFloat(formValues.paidAmount) || 0) > 0
        ? [
            {
              createdAt: activeInvDate,
              transactionType: 'advance',
              paymentMode: (formValues.advancePaymentMode || 'Cash').toLowerCase(),
              amount: parseFloat(formValues.paidAmount) || 0,
              notes: 'Initial advance payment',
            },
          ]
        : []);

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
      setFormSubPage('form');
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
    if (isProductDiscontinued(prod)) {
      showAlert('Discontinued Product', 'This product has been discontinued and cannot be selected.', 'error');
      return;
    }
    if (!isProductInStock(prod)) {
      showAlert('Out of Stock', 'This product is currently out of stock and cannot be added.', 'error');
      return;
    }
    setSelectedProduct(prod);
    const initialPrice = prod.sellingPrice || prod.price;
    setItemPrice(String(initialPrice));
    setItemQuantity('1');

    if (prod.variants && prod.variants.length > 0) {
      const firstInStockVariant = prod.variants.find((v) => (Number(v.stock) || 0) > 0);
      setSelectedVariant(firstInStockVariant || prod.variants[0] || null);
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

    if (!isProductInStock(selectedProduct)) {
      showAlert('Out of Stock', 'This product is out of stock and cannot be added.', 'error');
      return;
    }

    if (selectedVariant && (Number(selectedVariant.stock) || 0) <= 0) {
      showAlert('Variant Out of Stock', `The selected variant (${selectedVariant.color}) is out of stock.`, 'error');
      return;
    }

    const qty = parseInt(itemQuantity) || 1;
    if (qty <= 0) {
      showAlert('Invalid Quantity', 'Quantity must be at least 1.', 'error');
      return;
    }

    const availableStock = selectedVariant ? Number(selectedVariant.stock) || 0 : undefined;
    if (availableStock !== undefined && qty > availableStock) {
      showAlert(
        'Insufficient Stock',
        `Only ${availableStock} unit(s) available for ${selectedVariant?.color || selectedProduct.name}.`,
        'error'
      );
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
      const isCredit = formValues.paymentMethod === 'Credit';
      const paidAmt = isCredit ? parseFloat(formValues.paidAmount) || 0 : totalAmount;
      const dueAmt = isCredit ? Math.max(0, totalAmount - paidAmt) : 0;
      const dDate = isCredit && formValues.dueDate.trim() ? formValues.dueDate.trim() : null;
      const pDate = formValues.paymentDate?.trim() || new Date().toISOString().split('T')[0];
      const advanceMode = isCredit && paidAmt > 0 ? (formValues.advancePaymentMode || 'Cash').toLowerCase() : null;

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
        taxRate: parseFloat(formValues.taxRate) || 0,
        discount: discountAmount,
        totalAmount,
        paidAmount: paidAmt,
        dueAmount: dueAmt,
        dueDate: dDate,
        paymentDate: pDate,
        advancePaymentMode: advanceMode,
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
        paymentDate: pDate.includes('-')
          ? new Date(pDate).toLocaleDateString('en-IN')
          : pDate,
        items: invoiceItems,
        subtotal,
        taxRate: formValues.taxRate,
        taxAmount,
        discount: discountAmount,
        totalAmount,
        paidAmount: isCredit ? paidAmt : totalAmount,
        dueAmount: isCredit ? dueAmt : 0,
        dueDate: dDate
          ? (dDate.includes('-') ? new Date(dDate).toLocaleDateString('en-IN') : dDate)
          : null,
        advancePaymentMode: advanceMode,
        transactions: isCredit && paidAmt > 0
          ? [
              {
                createdAt: pDate,
                transactionType: 'advance',
                paymentMode: advanceMode || 'cash',
                amount: paidAmt,
                notes: 'Advance payment on invoice creation',
              },
            ]
          : [],
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
        onFetchOrders(true),
        onFetchCustomers(),
        onFetchCredits ? onFetchCredits() : Promise.resolve(),
      ]);
      if (onFetchPaginatedInvoices) {
        setInvoicePage(1);
        const res = await onFetchPaginatedInvoices({ page: 1, limit: 15 });
        if (res) {
          setRemoteInvoices(res.items || []);
          setInvoiceTotalPages(res.totalPages || 1);
          setInvoiceTotalCount(res.totalCount || 0);
        }
      }
      if (onFetchPaginatedOrders) {
        setOrderPage(1);
        const res = await onFetchPaginatedOrders({ page: 1, limit: 15 });
        if (res) {
          setRemoteOrders(res.items || []);
          setOrderTotalPages(res.totalPages || 1);
          setOrderTotalCount(res.totalCount || 0);
        }
      }

      setIsPreviewOpen(false);
      setIsFormOpen(false);
      setFormSubPage('form');
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
      paymentDate: new Date().toISOString().split('T')[0],
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      taxRate: '12',
      discount: '0',
      paymentMethod: 'Online',
      paidAmount: '0',
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      notes: '',
    });

    setIsFormOpen(true);
    setFormSubPage('form');
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={{ flex: 1 }}
    >
      {!isFormOpen ? (
        <InvoiceLedgerView
          invoices={invoices}
          orders={orders}
          isLoading={isLoading || isLoadingRemoteInvoices}
          isLoadingOrders={isLoadingOrders || isLoadingRemoteOrders}
          refreshing={refreshing}
          onRefresh={onRefresh}
          activeLedgerTab={activeLedgerTab}
          setActiveLedgerTab={handleSelectLedgerTab}
          searchFilter={searchFilter}
          setSearchFilter={handleSearchFilterChange}
          filteredInvoices={filteredInvoices}
          filteredOrders={filteredOrders}
          invoicePage={invoicePage}
          invoiceTotalPages={invoiceTotalPages}
          invoiceTotalCount={invoiceTotalCount || (remoteInvoices ? remoteInvoices.length : invoices.length)}
          onInvoicePrevPage={() => setInvoicePage((p) => Math.max(1, p - 1))}
          onInvoiceNextPage={() => setInvoicePage((p) => Math.min(invoiceTotalPages, p + 1))}
          orderPage={orderPage}
          orderTotalPages={orderTotalPages}
          orderTotalCount={orderTotalCount || (remoteOrders ? remoteOrders.length : orders.length)}
          onOrderPrevPage={() => setOrderPage((p) => Math.max(1, p - 1))}
          onOrderNextPage={() => setOrderPage((p) => Math.min(orderTotalPages, p + 1))}
          onOpenNewInvoice={handleOpenNewInvoice}
          onViewInvoice={(inv) => {
            setViewingInvoice(inv);
            setIsPreviewOpen(true);
          }}
          onDeleteInvoice={async (id, label) => {
            await onDeleteInvoice(id, label);
            if (onFetchPaginatedInvoices) {
              const res = await onFetchPaginatedInvoices({
                page: invoicePage,
                limit: 15,
                search: searchFilter.trim() || undefined,
              });
              if (res) {
                setRemoteInvoices(res.items || []);
                setInvoiceTotalPages(res.totalPages || 1);
                setInvoiceTotalCount(res.totalCount || 0);
              }
            }
          }}
          onSelectOrder={(ord) => setSelectedOrderModal(ord)}
        />
      ) : formSubPage === 'select-customer' ? (
        <SelectCustomerPage
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={(cust) => {
            handleSelectCustomer(cust);
            setFormSubPage('form');
          }}
          onBack={() => setFormSubPage('form')}
          onOpenAddCustomerModal={() => setIsAddCustomerModalOpen(true)}
          isLoading={isLoadingCustomers}
          onFetchPaginatedCustomers={onFetchPaginatedCustomers}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      ) : formSubPage === 'select-product' ? (
        <SelectProductPage
          products={availableProducts}
          categories={categories}
          selectedProductId={selectedProduct?.id || null}
          onSelectProduct={(prod) => {
            handleSelectProduct(prod);
            setFormSubPage('form');
          }}
          onBack={() => setFormSubPage('form')}
          isLoading={isLoadingProducts}
          onFetchPaginatedProducts={onFetchPaginatedProducts}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      ) : (
        <InvoiceFormView
          control={control}
          errors={errors}
          formValues={formValues}
          setValue={setValue}
          setSelectedCustomerId={setSelectedCustomerId}
          customerSearchQuery={customerSearchQuery}
          setCustomerSearchQuery={setCustomerSearchQuery}
          showCustomerDropdown={showCustomerDropdown}
          setShowCustomerDropdown={setShowCustomerDropdown}
          filteredCustomers={filteredCustomers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={handleSelectCustomer}
          onNavigateToSelectCustomer={() => {
            if (onFetchCustomers && (!customers || customers.length === 0)) {
              onFetchCustomers();
            }
            setFormSubPage('select-customer');
          }}
          onOpenAddCustomerModal={() => setIsAddCustomerModalOpen(true)}
          onFetchCustomers={onFetchCustomers}
          isLoadingCustomers={isLoadingCustomers}
          onFetchProducts={onFetchProducts}
          isLoadingProducts={isLoadingProducts}
          selectedProduct={selectedProduct}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          productSearchQuery={productSearchQuery}
          setProductSearchQuery={setProductSearchQuery}
          showProductDropdown={showProductDropdown}
          setShowProductDropdown={setShowProductDropdown}
          filteredProducts={filteredProducts}
          onSelectProduct={handleSelectProduct}
          onNavigateToSelectProduct={() => {
            if (onFetchProducts && (!products || products.length === 0)) {
              onFetchProducts();
            }
            setFormSubPage('select-product');
          }}
          itemPrice={itemPrice}
          setItemPrice={setItemPrice}
          itemQuantity={itemQuantity}
          setItemQuantity={setItemQuantity}
          onAddProduct={handleAddProduct}
          invoiceItems={invoiceItems}
          onRemoveItem={handleRemoveItem}
          subtotal={subtotal}
          taxAmount={taxAmount}
          discountAmount={discountAmount}
          totalAmount={totalAmount}
          taxRate={formValues.taxRate}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onCloseForm={() => {
            setFormSubPage('form');
            setIsFormOpen(false);
          }}
          onPreview={() => {
            if (!formValues.clientName.trim()) {
              showAlert('Customer Required', 'Please select a customer.', 'error');
              return;
            }
            if (invoiceItems.length === 0) {
              showAlert('Items Required', 'Please add at least one item.', 'error');
              return;
            }
            if (formValues.paymentMethod === 'Credit') {
              const paidNum = parseFloat(formValues.paidAmount) || 0;
              if (paidNum > totalAmount) {
                showAlert(
                  'Invalid Paid Amount',
                  `Advance paid amount (₹${paidNum.toLocaleString('en-IN')}) cannot exceed total invoice amount (₹${totalAmount.toLocaleString('en-IN')}).`,
                  'error'
                );
                return;
              }
              if (!formValues.dueDate.trim()) {
                showAlert('Due Date Required', 'Please choose a payment due date for this credit.', 'error');
                return;
              }
            }
            setIsPreviewOpen(true);
          }}
        />
      )}

      {/* ---------------- ORDER DETAILS MODAL ---------------- */}
      <OrderDetailsModal
        order={selectedOrderModal}
        onClose={() => setSelectedOrderModal(null)}
      />

      {/* ---------------- MANUAL CUSTOMER CREATION MODAL ---------------- */}
      <AddCustomerModal
        visible={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        name={newCustomerName}
        setName={setNewCustomerName}
        phone={newCustomerPhone}
        setPhone={setNewCustomerPhone}
        email={newCustomerEmail}
        setEmail={setNewCustomerEmail}
        address={newCustomerAddress}
        setAddress={setNewCustomerAddress}
        isSaving={isSavingCustomer}
        onSave={handleSaveNewCustomer}
      />

      {/* ---------------- INVOICE PREVIEW / SHARE MODAL ---------------- */}
      <InvoicePreviewModal
        visible={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setViewingInvoice(null);
        }}
        isViewingPast={isViewingPast}
        activeInvNumber={activeInvNumber}
        activeInvDate={activeInvDate}
        activePaymentMethod={activePaymentMethod}
        activeClientName={activeClientName}
        activeClientPhone={activeClientPhone}
        activeClientEmail={activeClientEmail}
        activeClientAddress={activeClientAddress}
        activeItems={activeItems}
        activeSubtotal={activeSubtotal}
        activeTaxRate={activeTaxRate}
        activeTaxAmount={activeTaxAmount}
        activeDiscountAmount={activeDiscountAmount}
        activeTotalAmount={activeTotalAmount}
        activePaidAmount={activePaidAmount}
        activeDueAmount={activeDueAmount}
        activeDueDate={activeDueDate}
        activePaymentDate={activePaymentDate}
        activeAdvancePaymentMode={activeAdvancePaymentMode}
        activeTransactions={activeTransactions}
        activeNotes={activeNotes}
        isSubmitting={isSubmitting}
        isExporting={isExporting}
        onShareOrExport={() =>
          isViewingPast
            ? handleSharePastInvoice(resolvedInvoice)
            : handleCreateAndShareInvoice()
        }
      />
    </KeyboardAvoidingView>
  );
}

