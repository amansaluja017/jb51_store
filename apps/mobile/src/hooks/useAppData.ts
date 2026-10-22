import { useState, useEffect, useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import {
  Product,
  Variant,
  Inquiry,
  Review,
  InventoryTransaction,
  Customer,
  Invoice,
  Order,
  Credit,
  CreditMetrics,
  isProductInStock,
} from '../types';
import { CustomAlertConfig } from '../components/CustomAlert';
import { TabType } from '../components/NavigationTabBar';
import {
  getInitialApiHost,
  trpcRequest as trpcRequestService,
} from '../services/api';

export function useAppData() {
  // Navigation & Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const tabValues = useRef<Record<TabType, Animated.Value>>({
    dashboard: new Animated.Value(activeTab === 'dashboard' ? 1 : 0),
    catalogue: new Animated.Value(activeTab === 'catalogue' ? 1 : 0),
    inventory: new Animated.Value(activeTab === 'inventory' ? 1 : 0),
    analytics: new Animated.Value(activeTab === 'analytics' ? 1 : 0),
    invoices: new Animated.Value(activeTab === 'invoices' ? 1 : 0),
    reviews: new Animated.Value(activeTab === 'reviews' ? 1 : 0),
  }).current;

  useEffect(() => {
    const tabs: TabType[] = ['dashboard', 'catalogue', 'inventory', 'analytics', 'invoices', 'reviews'];
    Animated.parallel(
      tabs.map(tab =>
        Animated.spring(tabValues[tab], {
          toValue: activeTab === tab ? 1 : 0,
          damping: 20,
          stiffness: 150,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [activeTab]);

  const [apiHost, setApiHost] = useState(getInitialApiHost);
  const [showConfig, setShowConfig] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Standby');

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [creditMetrics, setCreditMetrics] = useState<CreditMetrics | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Flags to avoid redundant fetching on rapid tab switching
  const hasFetchedProducts = useRef(false);
  const hasFetchedTransactions = useRef(false);
  const hasFetchedInvoices = useRef(false);
  const hasFetchedReviews = useRef(false);

  // Search & Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [inquiriesModalOpen, setInquiriesModalOpen] = useState(false);
  const [drawerMenuOpen, setDrawerMenuOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string; userName?: string; role?: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const pendingInquiriesCount = useMemo(
    () => inquiries.filter(i => i.status !== 'Resolved').length,
    [inquiries]
  );

  const activeDetailsProduct = useMemo(() => {
    if (!selectedProductDetails) return null;
    return products.find(p => p.slug === selectedProductDetails.slug) || selectedProductDetails;
  }, [products, selectedProductDetails]);

  // Analytics selections
  const [selectedAnalyticsSlug, setSelectedAnalyticsSlug] = useState<string>('all');
  const [showAnalyticsSelector, setShowAnalyticsSelector] = useState(false);

  // Custom alert state
  const [alertConfig, setAlertConfig] = useState<CustomAlertConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'confirm' = 'info',
    onConfirm?: () => void
  ) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };

  // Helper function to invoke backend tRPC endpoints
  const trpcRequest = (
    path: string,
    options: { method?: 'GET' | 'POST'; body?: any; input?: any } = {}
  ) => {
    return trpcRequestService(path, { ...options, token, apiHost });
  };

  // Modular fetch: Products (categories derived directly from catalogue)
  const handleFetchProducts = async (isRefresh = false) => {
    if (!isRefresh) {
      setIsLoading(true);
    }
    try {
      const decodedProducts = await trpcRequest('products.getAll');

      if (Array.isArray(decodedProducts)) {
        setProducts(decodedProducts as Product[]);

        const productCategories = Array.from(
          new Set(
            decodedProducts
              .map((p: any) => p.category?.trim())
              .filter(Boolean)
          )
        ) as string[];

        if (productCategories.length > 0) {
          setCategories(prev => Array.from(new Set([...prev, ...productCategories])));
        }
      }
      hasFetchedProducts.current = true;
      setSyncMessage('Products synced with server');
    } catch (err: any) {
      console.error('[handleFetchProducts Error]:', err);
      setSyncMessage('Server offline - Sandbox active');
    } finally {
      if (!isRefresh) {
        setIsLoading(false);
      }
    }
  };

  // Tab-based lazy data fetching: hit routes only in their particular section.
  // Neither Login nor Home (dashboard/analytics) trigger these calls.
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'dashboard' || activeTab === 'analytics' || activeTab === 'catalogue') {
      if (!hasFetchedProducts.current) {
        handleFetchProducts();
      }
    } else if (activeTab === 'inventory') {
      if (!hasFetchedProducts.current) {
        handleFetchProducts();
      }
      if (!hasFetchedTransactions.current) {
        hasFetchedTransactions.current = true;
        handleFetchTransactions();
      }
    } else if (activeTab === 'invoices') {
      if (!hasFetchedInvoices.current) {
        hasFetchedInvoices.current = true;
        handleFetchInvoices();
      }
      // On invoices tab: DO NOT hit customers, products, or orders routes on load.
      // Customers and products are loaded on-demand when user clicks dropdowns.
      // Orders route is hit on-demand when navigating to the Order History tab.
    } else if (activeTab === 'reviews') {
      if (!hasFetchedReviews.current) {
        hasFetchedReviews.current = true;
        handleFetchReviews();
      }
    }
  }, [isAuthenticated, activeTab]);

  // Ping server connectivity without hitting unnecessary domain routes
  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Pinging server...');
    try {
      await trpcRequest('health');
      setSyncMessage('Server online');
    } catch {
      setSyncMessage('Server offline - Sandbox active');
    } finally {
      setIsSyncing(false);
    }
  };

  // Section-aware refresh handler: only re-fetches the current section's data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'dashboard' || activeTab === 'analytics' || activeTab === 'catalogue') {
        await handleFetchProducts(true);
      } else if (activeTab === 'inventory') {
        await Promise.all([
          handleFetchProducts(true),
          handleFetchTransactions(),
        ]);
      } else if (activeTab === 'invoices') {
        await Promise.all([
          handleFetchInvoices(),
          handleFetchOrders(),
        ]);
      } else if (activeTab === 'reviews') {
        await handleFetchReviews();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogin = async (formData?: { email?: string; username?: string; password?: string }) => {
    const inputIdentifier = formData?.email ?? formData?.username ?? email ?? username;
    const inputPassword = formData?.password ?? password;
    const identifier = inputIdentifier.trim();

    if (!identifier || !inputPassword) {
      showAlert('Validation Required', 'Please enter both email and password.', 'error');
      return;
    }

    setIsLoggingIn(true);
    try {
      const authResult: any = await trpcRequest('auth.login', {
        method: 'POST',
        body: { identifier, password: inputPassword },
      });

      const tokenValue = authResult?.accessToken || authResult?.token;
      if (tokenValue) {
        if (authResult?.user?.role && authResult.user.role !== 'admin') {
          throw new Error('Access denied: Admin privileges required.');
        }
        setToken(tokenValue);
        setCurrentUser(authResult?.user || { userName: identifier, role: 'admin' });
        setIsAuthenticated(true);
        showAlert('Authentication Successful', `Welcome back ${authResult?.user?.name || authResult?.user?.userName || identifier}!`, 'success');
      } else {
        throw new Error('Invalid credentials or missing auth token');
      }
    } catch (err: any) {
      console.error('[handleLogin Error]:', err);
      showAlert('Authentication Error', err.message || 'Invalid admin credentials.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await trpcRequest('auth.logout', {
          method: 'POST',
        });
      }
    } catch (err: any) {
      console.log('[handleLogout] Logout API notice:', err.message);
    } finally {
      setToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      setActiveTab('dashboard');
      setProducts([]);
      setCategories([]);
      setTransactions([]);
      setCustomers([]);
      setInvoices([]);
      setOrders([]);
      setReviews([]);
      hasFetchedProducts.current = false;
      hasFetchedTransactions.current = false;
      hasFetchedInvoices.current = false;
      hasFetchedReviews.current = false;
      showAlert('Logged Out', 'Your admin session has ended.', 'info');
    }
  };

  const handleChangeUsername = async (newUserName: string) => {
    await trpcRequest('auth.changeUsername', {
      method: 'POST',
      body: { newUserName },
    });
    setCurrentUser((prev: any) => (prev ? { ...prev, userName: newUserName } : prev));
    setUsername(newUserName);
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    await trpcRequest('auth.changePassword', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
  };

  const handleChangeEmail = async (newEmail: string) => {
    await trpcRequest('auth.changeEmail', {
      method: 'POST',
      body: { newEmail },
    });
    setCurrentUser((prev: any) => (prev ? { ...prev, email: newEmail } : prev));
  };

  // Product Mutators
  const handleToggleStock = async (product: Product) => {
    const isCurrentlyInStock = isProductInStock(product);
    const newInStock = !isCurrentlyInStock;

    try {
      await trpcRequest('products.updateStatus', {
        method: 'POST',
        body: {
          slug: product.slug,
          inStock: newInStock
        }
      });

      setProducts(prev =>
        prev.map(p => p.slug === product.slug ? { ...p, inStock: newInStock } : p)
      );
      showAlert('Stock Status Updated', `${product.name} is now ${newInStock ? 'In Stock' : 'Out of Stock'}.`, 'success');
    } catch (err: any) {
      await handleFetchProducts(true);
      showAlert('Error', err.message || 'Failed to update stock status', 'error');
    }
  };

  const handleUpdateInventory = async (product: Product, updatedVariants: Variant[], forceInStock?: boolean) => {
    const totalVariantStock = updatedVariants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    const newInStock = forceInStock !== undefined ? forceInStock : (product.inStock === false ? false : totalVariantStock > 0);

    try {
      const updatedProductData = {
        ...product,
        variants: updatedVariants,
        inStock: newInStock,
      };

      await trpcRequest('products.update', {
        method: 'POST',
        body: {
          slug: product.slug,
          data: updatedProductData,
        }
      });

      setProducts(prev =>
        prev.map(p =>
          p.slug === product.slug
            ? { ...p, variants: updatedVariants, inStock: newInStock }
            : p
        )
      );
      showAlert('Inventory Updated', `Stock updated for ${product.name}.`, 'success');
    } catch (err: any) {
      console.error('[handleUpdateInventory Error]:', err);
      showAlert('Error', err.message || 'Failed to update inventory', 'error');
      throw err;
    }
  };

  const handleFetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const res = await trpcRequest('inventory.getTransactions');
      if (Array.isArray(res)) {
        setTransactions(res as InventoryTransaction[]);
      }
      hasFetchedTransactions.current = true;
    } catch (err: any) {
      console.error('[handleFetchTransactions Error]:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleRecordTransaction = async (data: {
    productId: string;
    productVariantId?: string | null;
    type: 'sale' | 'purchase';
    quantity: number;
    name: string;
    phoneNumber?: string;
    email?: string;
    notes?: string;
    unitPrice?: number;
    totalAmount?: number;
  }) => {
    try {
      const res: any = await trpcRequest('inventory.recordTransaction', {
        method: 'POST',
        body: data,
      });

      showAlert(
        data.type === 'sale' ? 'Sale Recorded' : 'Purchase Recorded',
        `${data.type === 'sale' ? 'Sold' : 'Purchased'} ${data.quantity} unit${data.quantity > 1 ? 's' : ''} of ${res?.productName || 'product'} for ${data.name}. Stock updated!`,
        'success'
      );

      await handleFetchProducts(true);
      await handleFetchTransactions();
    } catch (err: any) {
      console.error('[handleRecordTransaction Error]:', err);
      showAlert('Transaction Error', err.message || 'Failed to record inventory transaction', 'error');
      throw err;
    }
  };

  const handleFetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const res = await trpcRequest('customers.getAll');
      if (Array.isArray(res)) {
        setCustomers(res as Customer[]);
      }
    } catch (err: any) {
      console.error('[handleFetchCustomers Error]:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleFetchPaginatedCustomers = async (params?: {
    search?: string;
    sortBy?: 'name-asc' | 'name-desc' | 'createdAt-desc' | 'createdAt-asc';
    page?: number;
    limit?: number;
  }) => {
    try {
      const res: any = await trpcRequest('customers.getPaginated', {
        input: params,
      });
      return res;
    } catch (err: any) {
      console.error('[handleFetchPaginatedCustomers Error]:', err);
      throw err;
    }
  };

  const handleFetchPaginatedProducts = async (params?: {
    search?: string;
    category?: string;
    inStockOnly?: boolean;
    sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'stock-asc' | 'default';
    page?: number;
    limit?: number;
  }) => {
    try {
      const res: any = await trpcRequest('products.getPaginated', {
        input: params,
      });
      return res;
    } catch (err: any) {
      console.error('[handleFetchPaginatedProducts Error]:', err);
      throw err;
    }
  };

  const handleFetchPaginatedStock = async (params?: {
    search?: string;
    category?: string;
    stockFilter?: 'all' | 'inStock' | 'outOfStock' | 'lowStock' | 'reserved';
    sortBy?: 'default' | 'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc';
    page?: number;
    limit?: number;
  }) => {
    try {
      const res: any = await trpcRequest('inventory.getPaginated', {
        input: params,
      });
      return res;
    } catch (err: any) {
      console.error('[handleFetchPaginatedStock Error]:', err);
      throw err;
    }
  };

  const handleCreateCustomer = async (data: {
    name: string;
    phoneNumber: string;
    email?: string;
    address?: string;
  }) => {
    try {
      const res: any = await trpcRequest('customers.create', {
        method: 'POST',
        body: data,
      });
      const newCust = res as Customer;
      setCustomers(prev => [newCust, ...prev]);
      showAlert('Customer Added', `Customer "${data.name}" added successfully.`, 'success');
      return newCust;
    } catch (err: any) {
      console.error('[handleCreateCustomer Error]:', err);
      showAlert('Error Adding Customer', err.message || 'Failed to create customer', 'error');
      throw err;
    }
  };

  const handleUpdateCustomer = async (data: {
    id: string;
    name?: string;
    phoneNumber?: string;
    email?: string | null;
    address?: string | null;
  }) => {
    try {
      const res: any = await trpcRequest('customers.update', {
        method: 'POST',
        body: data,
      });
      const updatedCust = res as Customer;
      setCustomers(prev =>
        prev.map(c => (c.id === updatedCust.id ? { ...c, ...updatedCust } : c))
      );
      showAlert('Customer Updated', `Customer "${updatedCust.name}" updated successfully.`, 'success');
      return updatedCust;
    } catch (err: any) {
      console.error('[handleUpdateCustomer Error]:', err);
      showAlert('Error Updating Customer', err.message || 'Failed to update customer', 'error');
      throw err;
    }
  };

  const handleDeleteCustomer = async (id: string, name?: string) => {
    showAlert(
      'Delete Customer',
      `Are you sure you want to delete customer "${name || 'this customer'}"? This action cannot be undone.`,
      'confirm',
      async () => {
        try {
          await trpcRequest('customers.delete', {
            method: 'POST',
            body: { id },
          });
          setCustomers(prev => prev.filter(c => c.id !== id));
          showAlert('Customer Deleted', 'Customer has been removed successfully.', 'success');
        } catch (err: any) {
          console.error('[handleDeleteCustomer Error]:', err);
          showAlert('Error Deleting Customer', err.message || 'Failed to delete customer', 'error');
        }
      }
    );
  };

  const handleFetchCustomerOrderHistory = async (customerId: string) => {
    try {
      const res: any = await trpcRequest('customers.getOrderHistory', {
        input: { customerId },
      });
      return res as {
        customer: Customer;
        totalOrders: number;
        totalSpend: number;
        avgOrderValue: number;
        orders: Order[];
      };
    } catch (err: any) {
      console.error('[handleFetchCustomerOrderHistory Error]:', err);
      showAlert(
        'Error Loading History',
        err.message || 'Failed to fetch customer order history',
        'error'
      );
      throw err;
    }
  };

  const handleFetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const res = await trpcRequest('reviews.getModerationQueue');
      if (Array.isArray(res)) {
        setReviews(res as Review[]);
      }
      hasFetchedReviews.current = true;
    } catch (err: any) {
      console.error('[handleFetchReviews Error]:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleFetchInvoices = async () => {
    setIsLoadingInvoices(true);
    try {
      const res = await trpcRequest('invoices.getAll');
      if (Array.isArray(res)) {
        setInvoices(res as Invoice[]);
      }
    } catch (err: any) {
      console.error('[handleFetchInvoices Error]:', err);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const handleCreateOrder = async (orderData: any) => {
    try {
      const res: any = await trpcRequest('orders.create', {
        method: 'POST',
        body: orderData,
      });
      if (res?.invoice) {
        setInvoices(prev => [res.invoice as Invoice, ...prev]);
      }
      if (res?.id) {
        setOrders(prev => [res as Order, ...prev]);
      }
      return res;
    } catch (err: any) {
      console.error('[handleCreateOrder Error]:', err);
      showAlert('Order Error', err.message || 'Failed to create order', 'error');
      throw err;
    }
  };

  const handleFetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await trpcRequest('orders.getAll');
      if (Array.isArray(res)) {
        setOrders(res as Order[]);
      }
    } catch (err: any) {
      console.error('[handleFetchOrders Error]:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleDeleteInvoice = async (id: string, label: string) => {
    try {
      await trpcRequest('invoices.delete', {
        method: 'POST',
        body: { id },
      });
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      showAlert('Invoice Deleted', `Invoice "${label}" deleted successfully.`, 'success');
    } catch (err: any) {
      console.error('[handleDeleteInvoice Error]:', err);
      showAlert('Error Deleting Invoice', err.message || 'Failed to delete invoice', 'error');
      throw err;
    }
  };

  const handleFetchCredits = async (isRefresh = false) => {
    setIsLoadingCredits(true);
    try {
      const res: any = await trpcRequest('credits.getAll');
      if (res?.credits && Array.isArray(res.credits)) {
        setCredits(res.credits as Credit[]);
        setCreditMetrics(res.metrics as CreditMetrics);
      }
    } catch (err: any) {
      console.error('[handleFetchCredits Error]:', err);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  const handleCreateCredit = async (data: {
    orderId?: string | null;
    invoiceId?: string | null;
    paidAmount: number;
    dueAmount: number;
    dueDate?: string | null;
  }) => {
    try {
      const res: any = await trpcRequest('credits.create', {
        method: 'POST',
        body: data,
      });
      showAlert('Credit Recorded', 'Credit balance recorded successfully.', 'success');
      await handleFetchCredits(true);
      return res;
    } catch (err: any) {
      console.error('[handleCreateCredit Error]:', err);
      showAlert('Error Creating Credit', err.message || 'Failed to create credit record', 'error');
      throw err;
    }
  };

  const handleUpdateCredit = async (data: {
    id: string;
    paidAmount?: number;
    dueAmount?: number;
    dueDate?: string | null;
  }) => {
    try {
      const res: any = await trpcRequest('credits.update', {
        method: 'POST',
        body: data,
      });
      showAlert('Credit Updated', 'Credit record updated successfully.', 'success');
      await handleFetchCredits(true);
      return res;
    } catch (err: any) {
      console.error('[handleUpdateCredit Error]:', err);
      showAlert('Error Updating Credit', err.message || 'Failed to update credit record', 'error');
      throw err;
    }
  };

  const handleRecordCreditPayment = async (id: string, amount: number) => {
    try {
      const res: any = await trpcRequest('credits.recordPayment', {
        method: 'POST',
        body: { id, amount },
      });
      showAlert('Payment Recorded', `Payment of ₹${amount.toLocaleString('en-IN')} received.`, 'success');
      await handleFetchCredits(true);
      return res;
    } catch (err: any) {
      console.error('[handleRecordCreditPayment Error]:', err);
      showAlert('Error Recording Payment', err.message || 'Failed to record credit payment', 'error');
      throw err;
    }
  };

  const handleDeleteCredit = async (id: string) => {
    showAlert(
      'Delete Credit',
      'Are you sure you want to delete this credit record? This cannot be undone.',
      'confirm',
      async () => {
        try {
          await trpcRequest('credits.delete', {
            method: 'POST',
            body: { id },
          });
          setCredits(prev => prev.filter(c => c.id !== id));
          showAlert('Credit Deleted', 'Credit record has been removed.', 'success');
          handleFetchCredits(true);
        } catch (err: any) {
          console.error('[handleDeleteCredit Error]:', err);
          showAlert('Error Deleting Credit', err.message || 'Failed to delete credit', 'error');
        }
      }
    );
  };

  const handleUpdateVisibility = async (product: Product, status: 'listed' | 'unListed') => {
    try {
      await trpcRequest('products.updateStatus', {
        method: 'POST',
        body: { slug: product.slug, status }
      });
      setProducts(prev =>
        prev.map(p =>
          p.slug === product.slug
            ? { ...p, status, isListed: status === 'listed' }
            : p
        )
      );
      showAlert('Status Updated', `${product.name} is now ${status === 'listed' ? 'Listed' : 'Unlisted'}.`, 'success');
    } catch (err: any) {
      await handleFetchProducts(true);
      showAlert('Error', err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteProduct = (slug: string, name: string) => {
    showAlert(
      'Delete Outfit',
      `Are you sure you want to delete "${name}"?`,
      'confirm',
      async () => {
        try {
          await trpcRequest('products.delete', {
            method: 'POST',
            body: { slug }
          });
          setProducts(prev => prev.filter(p => p.slug !== slug));
          showAlert('Success', 'Outfit deleted.', 'success');
        } catch (e: any) {
          showAlert('Error', e.message || 'Failed to delete outfit', 'error');
        }
      }
    );
  };

  const handleAddReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'>) => {
    try {
      const decoded: any = await trpcRequest('reviews.create', {
        method: 'POST',
        body: reviewData
      });
      if (decoded && decoded.id && decoded.name) {
        setReviews(prev => [decoded, ...prev]);
        showAlert('Review Submitted', 'Customer review added successfully.', 'success');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to submit review', 'error');
    }
  };

  const handleToggleReviewApproval = async (review: Review) => {
    const newApproved = !review.approved;

    try {
      const decoded: any = await trpcRequest('reviews.update', {
        method: 'POST',
        body: { id: review.id, approved: newApproved }
      });
      if (decoded && decoded.id) {
        setReviews(prev =>
          prev.map(r => r.id === review.id ? { ...r, approved: newApproved } : r)
        );
        showAlert('Approval Updated', `Review by ${review.name} is now ${newApproved ? 'Approved' : 'Disapproved'}.`, 'success');
      } else {
        throw new Error('Unknown review ID or invalid update');
      }
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to update review approval', 'error');
    }
  };

  const handleDeleteReview = (review: Review) => {
    showAlert(
      'Delete Review',
      `Are you sure you want to delete review by "${review.name}"?`,
      'confirm',
      async () => {
        try {
          await trpcRequest('reviews.delete', {
            method: 'POST',
            body: { id: review.id }
          });
          setReviews(prev => prev.filter(r => r.id !== review.id));
          showAlert('Review Deleted', 'Review removed successfully.', 'success');
        } catch (err: any) {
          showAlert('Error', err.message || 'Failed to delete review', 'error');
        }
      }
    );
  };

  // Category Mutators
  const handleAddCategory = (newCat: string) => {
    if (!categories.includes(newCat)) {
      setCategories(prev => [...prev, newCat]);
    }
  };

  const handleDeleteCategory = async (catToDelete: string, targetCategory?: string) => {
    const target = targetCategory || 'Uncategorized';
    if (!target || target === catToDelete) {
      showAlert('Error', 'Target category for reassignment is required.', 'error');
      return;
    }
    try {
      const affectedProducts = products.filter(p => p.category === catToDelete);
      for (const p of affectedProducts) {
        await trpcRequest('products.update', {
          method: 'POST',
          body: {
            slug: p.slug,
            data: { category: target }
          }
        });
      }

      setProducts(prev => prev.map(p => p.category === catToDelete ? { ...p, category: target } : p));
      setCategories(prev => {
        const filtered = prev.filter(c => c !== catToDelete);
        if (target === 'Uncategorized' && !filtered.includes('Uncategorized')) {
          return [...filtered, 'Uncategorized'];
        }
        return filtered;
      });
      showAlert('Category Deleted', `Products reassigned to ${target}.`, 'success');
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to reassign product categories', 'error');
    }
  };

  // Inquiry Mutators
  const handleResolveInquiry = (id: string, name?: string) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'Responded' as const } : inq));
    showAlert('Inquiry Resolved', `Status for ${name || 'client'} marked as Responded.`, 'success');
  };

  const handleReorderProductImages = async (newImages: string[]): Promise<string[]> => {
    if (!editingSlug) return newImages;
    try {
      const res: any = await trpcRequest('products.reorderImages', {
        method: 'POST',
        body: { slug: editingSlug, images: newImages },
      });
      const confirmedImages = Array.isArray(res?.images) && res.images.length > 0 ? res.images : newImages;
      setProducts(prev => prev.map(p => {
        if (p.slug !== editingSlug) return p;
        const updatedVariants = (p.variants || []).map(v => ({
          ...v,
          images: confirmedImages,
        }));
        return { ...p, images: confirmedImages, variants: updatedVariants.length > 0 ? updatedVariants : p.variants };
      }));
      return confirmedImages;
    } catch (err: any) {
      console.error('[handleReorderProductImages failed]:', err);
      showAlert('Reorder Failed', err?.message || 'Could not update image order.', 'error');
      return newImages;
    }
  };

  // Save edits/addings
  const handleSaveProduct = async (payload: Product) => {
    if (isEditing && editingSlug) {
      try {
        const updated: any = await trpcRequest('products.update', {
          method: 'POST',
          body: { slug: editingSlug, data: payload }
        });
        const finalProd = updated && updated.slug ? updated : payload;
        setProducts(prev => prev.map(p => p.slug === editingSlug ? finalProd : p));
        showAlert('Outfit Saved', 'Persistence complete.', 'success');
      } catch (err: any) {
        console.error('[handleSaveProduct Error]:', err);
        showAlert('Save Failed', err.message || 'Failed to update outfit on server.', 'error');
        return;
      }
    } else {
      if (products.some(p => p.slug === payload.slug)) {
        showAlert('Unique Slug Required', 'An outfit with this slug already exists.', 'error');
        return;
      }
      try {
        const created: any = await trpcRequest('products.create', {
          method: 'POST',
          body: payload
        });
        const finalProd = created && created.slug ? created : payload;

        setProducts(prev => [finalProd, ...prev.filter(p => p.slug !== finalProd.slug)]);
        showAlert('Outfit Created', 'New item added to catalogue.', 'success');
      } catch (err: any) {
        console.error('[handleSaveProduct Error]:', err);
        showAlert('Creation Failed', err.message || 'Failed to create outfit on server.', 'error');
        return;
      }
    }

    setFormModalOpen(false);
  };

  // Calculations & Analytics
  const stats = useMemo(() => {
    const total = products.length;
    const oos = products.filter(p => !isProductInStock(p)).length;
    const active = total - oos;
    const listed = products.filter(p => p.isListed !== false).length;

    return {
      total,
      listed,
      oos,
      active,
    };
  }, [products]);

  const activeAnalyticsProduct = useMemo(() => {
    if (selectedAnalyticsSlug === 'all') return null;
    return products.find(p => p.slug === selectedAnalyticsSlug) || null;
  }, [products, selectedAnalyticsSlug]);

  const analyticsMetrics = useMemo(() => {
    // When analytics endpoint is not connected, mark as unavailable rather than displaying fabricated metrics
    return {
      isUnavailable: true,
      views: 0,
      waHits: 0,
      igHits: 0,
      wlHits: 0,
      conversion: 0,
      pipeline: 0,
    };
  }, []);

  // Open forms triggers
  const triggerAddProduct = () => {
    setIsEditing(false);
    setEditingSlug(null);
    setFormModalOpen(true);
  };

  const triggerEditProduct = (product: Product) => {
    setIsEditing(true);
    setEditingSlug(product.slug);
    setFormModalOpen(true);
  };


  return {
    // Auth & Nav
    isAuthenticated,
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    token,
    currentUser,
    isLoggingIn,
    handleLogin,
    handleLogout,
    handleChangeUsername,
    handleChangeEmail,
    handleChangePassword,
    activeTab,
    setActiveTab,
    tabValues,
    // Sync
    apiHost,
    setApiHost,
    showConfig,
    setShowConfig,
    isSyncing,
    syncMessage,
    handleManualSync,
    // Products & Categories
    products,
    categories,
    isLoading,
    refreshing,
    handleRefresh,
    handleFetchProducts,
    handleToggleStock,
    handleUpdateVisibility,
    handleSaveProduct,
    handleDeleteProduct,
    handleReorderProductImages,
    handleAddCategory,
    handleDeleteCategory,
    searchQuery,
    setSearchQuery,
    // Inventory
    transactions,
    isLoadingTransactions,
    handleFetchTransactions,
    handleUpdateInventory,
    handleRecordTransaction,
    handleFetchPaginatedStock,
    // Customers
    customers,
    isLoadingCustomers,
    handleFetchCustomers,
    handleFetchPaginatedCustomers,
    handleCreateCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer,
    handleFetchCustomerOrderHistory,
    handleFetchPaginatedProducts,
    // Invoices & Orders
    invoices,
    isLoadingInvoices,
    orders,
    isLoadingOrders,
    handleFetchInvoices,
    handleFetchOrders,
    handleCreateOrder,
    handleDeleteInvoice,
    // Reviews
    reviews,
    isLoadingReviews,
    handleFetchReviews,
    handleAddReview,
    handleDeleteReview,
    handleToggleReviewApproval,
    // Inquiries
    inquiries,
    pendingInquiriesCount,
    handleResolveInquiry,
    // Analytics
    stats,
    analyticsMetrics,
    activeAnalyticsProduct,
    selectedAnalyticsSlug,
    setSelectedAnalyticsSlug,
    showAnalyticsSelector,
    setShowAnalyticsSelector,
    // Modals
    formModalOpen,
    setFormModalOpen,
    selectedProductDetails,
    setSelectedProductDetails,
    activeDetailsProduct,
    categoryModalOpen,
    setCategoryModalOpen,
    accountModalOpen,
    setAccountModalOpen,
    inquiriesModalOpen,
    setInquiriesModalOpen,
    drawerMenuOpen,
    setDrawerMenuOpen,
    customerModalOpen,
    setCustomerModalOpen,
    // Credits
    credits,
    creditMetrics,
    isLoadingCredits,
    creditModalOpen,
    setCreditModalOpen,
    handleFetchCredits,
    handleCreateCredit,
    handleUpdateCredit,
    handleRecordCreditPayment,
    handleDeleteCredit,
    isEditing,
    editingSlug,
    triggerAddProduct,
    triggerEditProduct,
    // Alert
    alertConfig,
    setAlertConfig,
    showAlert,
  };
}

export default useAppData;
