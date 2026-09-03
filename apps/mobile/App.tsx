import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  LogOut,
  User
} from 'lucide-react-native';

import { Product, Inquiry, Review } from './src/types';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import ReviewsScreen from './src/screens/ReviewsScreen';
import ProductFormModal from './src/components/ProductFormModal';
import CategoryManagerModal from './src/components/CategoryManagerModal';
import AccountSettingsModal from './src/components/AccountSettingsModal';
import CustomAlert, { CustomAlertConfig } from './src/components/CustomAlert';
import NavigationTabBar, { TabType } from './src/components/NavigationTabBar';

import {
  DEFAULT_CATEGORIES,
  MOCK_PRODUCTS,
  INITIAL_INQUIRIES,
  SIMULATED_NEW_INQUIRIES,
  MOCK_REVIEWS
} from './src/data/mockData';
import { getInitialApiHost, trpcRequest as trpcRequestService } from './src/services/api';
import {
  configureNotifications,
  requestNotificationPermissions,
  triggerLocalNotification
} from './src/services/notifications';

// Initialize Notifications configuration
configureNotifications();

export default function App() {
  // Navigation & Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabValues = useRef<Record<TabType, Animated.Value>>({
    dashboard: new Animated.Value(activeTab === 'dashboard' ? 1 : 0),
    catalogue: new Animated.Value(activeTab === 'catalogue' ? 1 : 0),
    analytics: new Animated.Value(activeTab === 'analytics' ? 1 : 0),
    invoices: new Animated.Value(activeTab === 'invoices' ? 1 : 0),
    reviews: new Animated.Value(activeTab === 'reviews' ? 1 : 0),
  }).current;

  useEffect(() => {
    const tabs: TabType[] = ['dashboard', 'catalogue', 'analytics', 'invoices', 'reviews'];
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
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string; userName?: string; role?: string } | null>(null);
  const [simulatedIndex, setSimulatedIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

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
  const trpcRequest = (path: string, options: { method?: 'GET' | 'POST'; body?: any } = {}) => {
    return trpcRequestService(path, { ...options, token, apiHost });
  };

  const fetchFromBackend = async () => {
    setIsLoading(true);
    try {
      const decodedProducts = await trpcRequest('products.getAll');
      if (Array.isArray(decodedProducts)) {
        setProducts(decodedProducts as Product[]);
      }

      const reviewsPath = isAuthenticated
        ? 'reviews.getModerationQueue'
        : 'reviews.getAll';
      
      const decodedReviews = await trpcRequest(reviewsPath);
      if (Array.isArray(decodedReviews)) {
        setReviews(decodedReviews as Review[]);
      }

      setSyncMessage('Successfully synced with server');
    } catch (err) {
      setSyncMessage('Server offline - Sandbox active');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFromBackend();
    }
  }, [isAuthenticated]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Pinging tRPC server...');
    await fetchFromBackend();
    setIsSyncing(false);
  };

  const handleLogin = async (formData?: { username?: string; password?: string }) => {
    const inputUsername = formData?.username ?? username;
    const inputPassword = formData?.password ?? password;
    const identifier = inputUsername.trim();

    if (!identifier || !inputPassword) {
      showAlert('Validation Required', 'Please enter both username and password.', 'error');
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
        showAlert('Authentication Successful', `Welcome back ${authResult?.user?.userName || identifier}!`, 'success');
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
    const isCurrentlyInStock = product.inStock !== false && (product.variants.length === 0 || product.variants.reduce((acc, v) => acc + v.stock, 0) > 0);
    const newInStock = !isCurrentlyInStock;

    const updatedVariants = product.variants.map(v => ({
      ...v,
      stock: newInStock ? (v.stock > 0 ? v.stock : 10) : 0
    }));

    try {
      await trpcRequest('products.updateStatus', {
        method: 'POST',
        body: {
          slug: product.slug,
          inStock: newInStock
        }
      });

      if (product.variants.length > 0) {
        await trpcRequest('products.update', {
          method: 'POST',
          body: {
            slug: product.slug,
            data: { variants: updatedVariants }
          }
        });
      }

      setProducts(prev =>
        prev.map(p => p.slug === product.slug ? { ...p, inStock: newInStock, variants: updatedVariants } : p)
      );
      showAlert('Stock Status Updated', `${product.name} is now ${newInStock ? 'In Stock' : 'Out of Stock'}.`, 'success');
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to update stock status', 'error');
    }
  };

  const handleUpdateVisibility = async (product: Product, status: boolean) => {
    try {
      await trpcRequest('products.updateStatus', {
        method: 'POST',
        body: {
          slug: product.slug,
          status: status ? 'listed' : 'unListed'
        }
      });
      setProducts(prev =>
        prev.map(p => p.slug === product.slug ? { ...p, isListed: status } : p)
      );
      showAlert('Visibility Updated', `${product.name} is now ${status ? 'Listed' : 'Unlisted'}.`, 'success');
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to update visibility', 'error');
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

  // Review Mutators
  const handleAddReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'>) => {
    const tempId = `rev_${Date.now()}`;
    const newReview: Review = {
      ...reviewData,
      id: tempId,
      createdAt: new Date().toISOString(),
      approved: true,
    };

    setReviews(prev => [newReview, ...prev]);

    try {
      const decoded: any = await trpcRequest('reviews.create', {
        method: 'POST',
        body: reviewData
      });
      if (decoded && decoded.id && decoded.name) {
        setReviews(prev => prev.map(r => r.id === tempId ? decoded : r));
        showAlert('Review Submitted', 'Customer review added successfully.', 'success');
      } else {
        throw new Error('Invalid decoded review data');
      }
    } catch (err: any) {
      showAlert('Review Submitted (Mock)', 'Customer review added to local sandbox.', 'success');
    }
  };

  const handleToggleReviewApproval = async (review: Review) => {
    const newApproved = !review.approved;
    setReviews(prev =>
      prev.map(r => r.id === review.id ? { ...r, approved: newApproved } : r)
    );

    try {
      const decoded: any = await trpcRequest('reviews.update', {
        method: 'POST',
        body: { id: review.id, approved: newApproved }
      });
      if (decoded && decoded.id) {
        showAlert('Approval Updated', `Review by ${review.name} is now ${newApproved ? 'Approved' : 'Disapproved'}.`, 'success');
      } else {
        throw new Error('Unknown review ID or invalid update');
      }
    } catch (err: any) {
      showAlert('Approval Updated (Mock)', `Review by ${review.name} is now ${newApproved ? 'Approved' : 'Disapproved'} in sandbox.`, 'success');
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
          showAlert('Review Deleted (Mock)', 'Review removed from sandbox.', 'success');
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

  const handleDeleteCategory = (catToDelete: string) => {
    const fallbackCategory = categories.find(c => c !== catToDelete) || 'Uncategorized';
    setProducts(prev => prev.map(p => p.category === catToDelete ? { ...p, category: fallbackCategory } : p));
    setCategories(prev => prev.filter(c => c !== catToDelete));
  };

  // Inquiry Mutators
  const handleResolveInquiry = (id: string, name?: string) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'Responded' as const } : inq));
    showAlert('Inquiry Resolved', `Status for ${name || 'client'} marked as Responded.`, 'success');
  };

  const handleSimulateNewInquiry = async () => {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      showAlert('Notifications Restricted', 'Please enable system notifications to test live alerts.', 'error');
    }

    const template = SIMULATED_NEW_INQUIRIES[simulatedIndex % SIMULATED_NEW_INQUIRIES.length];
    const newInq: Inquiry = {
      ...template,
      id: `inq_${Date.now()}`
    };

    setInquiries(prev => [newInq, ...prev]);

    triggerLocalNotification(
      `New WhatsApp Inquiry from ${newInq.customerName}`,
      `Interested in "${newInq.productName}" (Size ${newInq.size}, Color ${newInq.color}).`,
      { inquiryId: newInq.id }
    );

    showAlert('Inquiry Simulated', `New inquiry from ${newInq.customerName} has been simulated. Check device notifications!`, 'success');
    setSimulatedIndex(prev => prev + 1);
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

        // Hit product status API
        try {
          await trpcRequest('products.updateStatus', {
            method: 'POST',
            body: {
              slug: finalProd.slug,
              status: finalProd.isListed !== false ? 'listed' : 'unListed'
            }
          });
        } catch (statusErr) {
          console.log('[Product Status Sync Notice]:', statusErr);
        }

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
    const oos = products.filter(p => p.variants.every(v => v.stock === 0)).length;
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
    if (activeAnalyticsProduct) {
      const isOos = activeAnalyticsProduct.variants.every(v => v.stock === 0);
      const totalStock = activeAnalyticsProduct.variants.reduce((acc, v) => acc + v.stock, 0);
      const waHits = Math.floor(activeAnalyticsProduct.price / 400);
      const igHits = Math.floor(activeAnalyticsProduct.price / 600);
      const wlHits = Math.floor(activeAnalyticsProduct.price / 300);
      const totalViews = waHits * 4 + igHits * 5 + wlHits * 3;

      return {
        views: totalViews,
        waHits,
        igHits,
        wlHits,
        conversion: isOos ? 0 : 3.8,
        pipeline: totalStock
      };
    } else {
      let totalViews = 0;
      let waHits = 0;
      let igHits = 0;
      let wlHits = 0;

      products.forEach(p => {
        const w = Math.floor(p.price / 400);
        const i = Math.floor(p.price / 600);
        const l = Math.floor(p.price / 300);
        waHits += w;
        igHits += i;
        wlHits += l;
        totalViews += (w * 4 + i * 5 + l * 3);
      });

      const conversion = products.length > 0 ? 4.2 : 0;
      const pipeline = products.reduce((acc, p) => acc + p.price, 0) * 1.5;

      return { views: totalViews, waHits, igHits, wlHits, conversion, pipeline };
    }
  }, [products, activeAnalyticsProduct]);

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

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          apiHost={apiHost}
          setApiHost={setApiHost}
          showConfig={showConfig}
          setShowConfig={setShowConfig}
          isSyncing={isSyncing}
          syncMessage={syncMessage}
          isLoggingIn={isLoggingIn}
          onLogin={handleLogin}
          onManualSync={handleManualSync}
        />
        <CustomAlert
          config={alertConfig}
          onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        />
      </>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.appContainer}>
        <StatusBar style="dark" />

        {/* App Header Banner */}
        <View style={styles.appHeader}>
          <View>
            <Text style={styles.headerSubtitle}>JB51 Atelier</Text>
            <Text style={styles.headerTitle}>
              {activeTab === 'dashboard'
                ? 'Overview'
                : activeTab === 'catalogue'
                  ? 'Products List'
                  : activeTab === 'invoices'
                    ? 'Invoice Creator'
                    : activeTab === 'reviews'
                      ? 'Customer Reviews'
                      : 'Performance Analytics'}
            </Text>
          </View>
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={() => setAccountModalOpen(true)}
              style={styles.headerActionBtn}
              accessibilityLabel="Account Settings"
              accessibilityRole="button"
            >
              <User size={18} color="#09090b" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutBtn}
              accessibilityLabel="Log out"
              accessibilityRole="button"
            >
              <LogOut size={16} color="#71717a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Screen Router */}
        <View style={styles.screenView}>
          {activeTab === 'dashboard' && (
            <DashboardScreen
              stats={stats}
              inquiries={inquiries}
              onResolveInquiry={handleResolveInquiry}
              onSimulateInquiry={handleSimulateNewInquiry}
            />
          )}
          {activeTab === 'catalogue' && (
            <CatalogScreen
              products={products}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoading={isLoading}
              onAddProduct={triggerAddProduct}
              onManageCategories={() => setCategoryModalOpen(true)}
              onToggleStock={handleToggleStock}
              onUpdateVisibility={handleUpdateVisibility}
              onEditProduct={triggerEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsScreen
              products={products}
              selectedAnalyticsSlug={selectedAnalyticsSlug}
              setSelectedAnalyticsSlug={setSelectedAnalyticsSlug}
              showAnalyticsSelector={showAnalyticsSelector}
              setShowAnalyticsSelector={setShowAnalyticsSelector}
              analyticsMetrics={analyticsMetrics}
              activeAnalyticsProduct={activeAnalyticsProduct}
            />
          )}
          {activeTab === 'invoices' && (
            <InvoiceScreen
              products={products}
              showAlert={showAlert}
            />
          )}
          {activeTab === 'reviews' && (
            <ReviewsScreen
              reviews={reviews}
              isLoading={isLoading}
              onAddReview={handleAddReview}
              onDeleteReview={handleDeleteReview}
              onToggleApproval={handleToggleReviewApproval}
              showAlert={showAlert}
            />
          )}
        </View>

        {/* Tabs Menu Footer */}
        <NavigationTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabValues={tabValues}
        />

        {/* Create / Edit Form Modal */}
        <ProductFormModal
          visible={formModalOpen}
          isEditing={isEditing}
          editingSlug={editingSlug}
          initialProduct={isEditing && editingSlug ? products.find(p => p.slug === editingSlug) || null : null}
          categories={categories}
          onClose={() => setFormModalOpen(false)}
          onSave={handleSaveProduct}
          onAddNewCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          showAlert={showAlert}
        />

        {/* Dedicated Category Manager Modal */}
        <CategoryManagerModal
          visible={categoryModalOpen}
          categories={categories}
          products={products}
          onClose={() => setCategoryModalOpen(false)}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          showAlert={showAlert}
        />

        {/* Dedicated Account & Security Settings Modal */}
        <AccountSettingsModal
          visible={accountModalOpen}
          user={currentUser}
          onClose={() => setAccountModalOpen(false)}
          onChangeUsername={handleChangeUsername}
          onChangeEmail={handleChangeEmail}
          onChangePassword={handleChangePassword}
          showAlert={showAlert}
        />

        <CustomAlert
          config={alertConfig}
          onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  appHeader: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: '#FF5E36',
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#09090b',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenView: {
    flex: 1,
  },
});
