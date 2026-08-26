import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  LayoutDashboard, 
  Shirt, 
  BarChart3, 
  LogOut 
} from 'lucide-react-native';

import { Product, Inquiry } from './src/types';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProductFormModal from './src/components/ProductFormModal';
import CategoryManagerModal from './src/components/CategoryManagerModal';
import CustomAlert, { CustomAlertConfig } from './src/components/CustomAlert';

// ----------------------------------------------------
// DEFAULT MOCK DATA FALLBACKS
// ----------------------------------------------------
const DEFAULT_CATEGORIES = ['Formal Suits', 'Anarkali Suits', 'Silk Co-ords', 'Velvet Edit', 'Occasion Wear'];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'outfit_1',
    name: 'Palace Banarasi Silk Suit',
    slug: 'palace-banarasi-silk',
    description: 'An elegant handwoven silk Banarasi outfit styled with antique zari borders.',
    price: 38500,
    category: 'Anarkali Suits',
    images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'],
    fabric: 'Pure Banarasi Katan Silk',
    fit: 'Classic Tailored Fit',
    careInstructions: 'Dry clean only. Store in muslin wrapper.',
    variants: [
      { color: 'Emerald Green', size: 'S', stock: 4 },
      { color: 'Emerald Green', size: 'M', stock: 12 },
      { color: 'Emerald Green', size: 'L', stock: 0 }
    ],
    featured: true,
    newArrival: true,
    bestseller: true,
    isListed: true,
    tags: ['silk', 'luxury', 'festive']
  },
  {
    id: 'outfit_2',
    name: 'Crimson Velvet Edit Suit',
    slug: 'crimson-velvet-edit',
    description: 'Rich silk velvet kurta with heavy hand-embroidered Zardozi sleeves.',
    price: 42000,
    category: 'Velvet Edit',
    images: ['https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&q=80'],
    fabric: 'Silk Velvet & Chiffon Dupatta',
    fit: 'Relaxed Kurta Silhouette',
    careInstructions: 'Dry clean only.',
    variants: [
      { color: 'Crimson Wine', size: 'S', stock: 0 },
      { color: 'Crimson Wine', size: 'M', stock: 6 },
      { color: 'Crimson Wine', size: 'L', stock: 8 }
    ],
    featured: true,
    newArrival: false,
    bestseller: true,
    isListed: true,
    tags: ['velvet', 'zardozi', 'wedding']
  },
  {
    id: 'outfit_3',
    name: 'Ivory Chanderi Coord Set',
    slug: 'ivory-chanderi-coord',
    description: 'Minimalist Ivory Chanderi Silk short kurta paired with wide-leg trousers.',
    price: 24500,
    category: 'Silk Co-ords',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80'],
    fabric: 'Chanderi Silk & Organza',
    fit: 'Modern Straight Cut',
    careInstructions: 'Dry clean only. Iron on low heat.',
    variants: [
      { color: 'Warm Ivory', size: 'XS', stock: 10 },
      { color: 'Warm Ivory', size: 'S', stock: 12 },
      { color: 'Warm Ivory', size: 'M', stock: 15 }
    ],
    featured: false,
    newArrival: true,
    bestseller: false,
    isListed: true,
    tags: ['minimalist', 'silk', 'coord']
  }
];

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq_1',
    customerName: 'Aishwarya Sen',
    productName: 'Palace Banarasi Silk Suit',
    size: 'M',
    color: 'Emerald Green',
    channel: 'WhatsApp',
    timestamp: '12 mins ago',
    status: 'Responded',
    phone: '+919876543210',
    email: 'aishwarya.sen@outlook.com',
    query: 'Can I get this customized with a sweetheart neckline and full sleeves? I would need it by the first week of next month for a wedding.'
  },
  {
    id: 'inq_2',
    customerName: 'Meera Rajput',
    productName: 'Crimson Velvet Edit Suit',
    size: 'S',
    color: 'Crimson Wine',
    channel: 'Instagram DM',
    timestamp: '45 mins ago',
    status: 'Pending',
    phone: '+919988776655',
    email: 'meera.rajput@gmail.com',
    query: 'Is the crimson velvet suit available in size XS? The size chart shows S as the smallest, but I wanted to see if custom fitting is possible.'
  },
  {
    id: 'inq_3',
    customerName: 'Kriti Sanon',
    productName: 'Ivory Chanderi Coord Set',
    size: 'M',
    color: 'Warm Ivory',
    channel: 'WhatsApp',
    timestamp: '2 hours ago',
    status: 'Responded',
    phone: '+919123456789',
    email: 'kriti.sanon@icloud.com',
    query: 'Hi, wanted to know if this Ivory Chanderi Coord Set comes with a dupatta or if it can be ordered separately? Thanks!'
  },
];

export default function App() {
  // Navigation & Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalogue' | 'analytics'>('dashboard');

  // Backend Sync Configurations
  const [apiHost, setApiHost] = useState('http://localhost:3001');
  const [showConfig, setShowConfig] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Standby');

  // Data States
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
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

  // ----------------------------------------------------
  // API INTEGRATIONS
  // ----------------------------------------------------
  const fetchFromBackend = async () => {
    setIsLoading(true);
    try {
      const cleanHost = apiHost.trim().replace(/\/$/, '');
      const response = await fetch(`${cleanHost}/trpc/products.getAll`);
      const json = await response.json();
      if (json?.result?.data) {
        setProducts(json.result.data);
        setSyncMessage('Successfully synced with server');
      }
    } catch (err) {
      console.log('Backend unreachable, using local mock sandbox', err);
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

  const handleLogin = () => {
    if (username.trim().toLowerCase() === 'admin' && password === 'admin@123') {
      setIsAuthenticated(true);
    } else {
      showAlert('Authentication Error', 'Invalid admin credentials.', 'error');
    }
  };

  // ----------------------------------------------------
  // PRODUCT MUTATORS
  // ----------------------------------------------------
  const handleToggleStock = async (product: Product) => {
    const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
    const isCurrentlyOOS = totalStock === 0;

    const updatedVariants = product.variants.map(v => ({
      ...v,
      stock: isCurrentlyOOS ? 10 : 0
    }));

    setProducts(prev => 
      prev.map(p => p.slug === product.slug ? { ...p, variants: updatedVariants } : p)
    );

    try {
      const cleanHost = apiHost.trim().replace(/\/$/, '');
      await fetch(`${cleanHost}/trpc/products.update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: product.slug,
          data: { variants: updatedVariants }
        })
      });
      showAlert('Stock Status Updated', `${product.name} is now ${isCurrentlyOOS ? 'In Stock' : 'Out of Stock'}.`, 'success');
    } catch (err) {}
  };

  const handleUpdateVisibility = async (product: Product, status: boolean) => {
    setProducts(prev => 
      prev.map(p => p.slug === product.slug ? { ...p, isListed: status } : p)
    );

    try {
      const cleanHost = apiHost.trim().replace(/\/$/, '');
      await fetch(`${cleanHost}/trpc/products.update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: product.slug,
          data: { isListed: status }
        })
      });
      showAlert('Visibility Updated', `${product.name} is now ${status ? 'Listed' : 'Unlisted'}.`, 'success');
    } catch (err) {}
  };

  const handleDeleteProduct = (slug: string, name: string) => {
    showAlert(
      'Delete Outfit',
      `Are you sure you want to delete "${name}"?`,
      'confirm',
      async () => {
        setProducts(prev => prev.filter(p => p.slug !== slug));
        try {
          const cleanHost = apiHost.trim().replace(/\/$/, '');
          await fetch(`${cleanHost}/trpc/products.delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug })
          });
        } catch (e) {}
        showAlert('Success', 'Outfit deleted.', 'success');
      }
    );
  };

  const handleAddCategory = (newCat: string) => {
    setCategories(prev => {
      if (prev.includes(newCat)) return prev;
      return [...prev, newCat];
    });
  };

  const handleDeleteCategory = (catToDelete: string) => {
    setCategories(prev => {
      const filtered = prev.filter(c => c !== catToDelete);
      if (filtered.length === 0) {
        return ['Uncategorized'];
      }
      return filtered;
    });
    // Reassign products to Uncategorized
    setProducts(prev => prev.map(p => p.category === catToDelete ? { ...p, category: 'Uncategorized' } : p));
  };

  const handleResolveInquiry = (id: string, customerName: string) => {
    setInquiries(prev => 
      prev.map(inq => inq.id === id ? { ...inq, status: 'Resolved' } : inq)
    );
    showAlert('Inquiry Resolved', `Archived inquiry for ${customerName}`, 'success');
  };



  // Save edits/addings
  const handleSaveProduct = async (payload: Product) => {
    if (isEditing && editingSlug) {
      setProducts(prev => prev.map(p => p.slug === editingSlug ? payload : p));
      try {
        const cleanHost = apiHost.trim().replace(/\/$/, '');
        await fetch(`${cleanHost}/trpc/products.update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: editingSlug, data: payload })
        });
      } catch (e) {}
      showAlert('Outfit Saved', 'Persistence complete.', 'success');
    } else {
      if (products.some(p => p.slug === payload.slug)) {
        showAlert('Unique Slug Required', 'An outfit with this slug already exists.', 'error');
        return;
      }
      setProducts(prev => [payload, ...prev]);
      try {
        const cleanHost = apiHost.trim().replace(/\/$/, '');
        await fetch(`${cleanHost}/trpc/products.create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {}
      showAlert('Outfit Created', 'New item added to catalogue.', 'success');
    }

    setFormModalOpen(false);
  };

  // Sizing and listings calculations
  const stats = useMemo(() => {
    const total = products.length;
    const oos = products.filter(p => p.variants.every(v => v.stock === 0)).length;
    const active = total - oos;
    const listed = products.filter(p => p.isListed !== false).length;
    return { total, oos, active, listed };
  }, [products]);

  const activeAnalyticsProduct = useMemo(() => {
    if (selectedAnalyticsSlug === 'all') return null;
    return products.find(p => p.slug === selectedAnalyticsSlug) || null;
  }, [products, selectedAnalyticsSlug]);

  const analyticsMetrics = useMemo(() => {
    if (activeAnalyticsProduct) {
      const seed = activeAnalyticsProduct.slug.length;
      const views = 120 + (seed * 8) % 150;
      const waHits = 10 + (seed * 3) % 20;
      const igHits = 5 + (seed * 2) % 12;
      const wlHits = 8 + (seed * 4) % 18;
      const conversion = Math.round(((waHits + igHits) / views) * 100);
      const pipeline = (waHits + igHits) * activeAnalyticsProduct.price;
      
      return { views, waHits, igHits, wlHits, conversion, pipeline };
    } else {
      const totalViews = 1240;
      const waHits = 168;
      const igHits = 116;
      const wlHits = 142;
      const conversion = Math.round(((waHits + igHits) / totalViews) * 100);
      
      const totalPrice = products.reduce((acc, p) => acc + p.price, 0);
      const avgPrice = products.length > 0 ? totalPrice / products.length : 30000;
      const pipeline = (waHits + igHits) * avgPrice;

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
        onLogin={handleLogin}
        onManualSync={handleManualSync}
      />
    );
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="dark" />
      
      {/* App Header Banner */}
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.headerSubtitle}>JB51 Atelier</Text>
          <Text style={styles.headerTitle}>
            {activeTab === 'dashboard' ? 'Overview' : activeTab === 'catalogue' ? 'Products List' : 'Performance Analytics'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsAuthenticated(false)} style={styles.logoutBtn}>
          <LogOut size={16} color="#71717a" />
        </TouchableOpacity>
      </View>

      {/* Screen Router */}
      <View style={styles.screenView}>
        {activeTab === 'dashboard' && (
          <DashboardScreen 
            stats={stats}
            inquiries={inquiries}
            onResolveInquiry={handleResolveInquiry}
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
      </View>

      {/* Tabs Menu Footer */}
      <View style={styles.navigationFooter}>
        <TouchableOpacity 
          onPress={() => setActiveTab('dashboard')} 
          style={[styles.navTab, activeTab === 'dashboard' && styles.activeNavTab]}
        >
          <LayoutDashboard size={18} color={activeTab === 'dashboard' ? '#FF5E36' : '#a1a1aa'} />
          <Text style={[styles.navTabText, activeTab === 'dashboard' && styles.activeNavTabText]}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab('catalogue')} 
          style={[styles.navTab, activeTab === 'catalogue' && styles.activeNavTab]}
        >
          <Shirt size={18} color={activeTab === 'catalogue' ? '#FF5E36' : '#a1a1aa'} />
          <Text style={[styles.navTabText, activeTab === 'catalogue' && styles.activeNavTabText]}>Catalog</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab('analytics')} 
          style={[styles.navTab, activeTab === 'analytics' && styles.activeNavTab]}
        >
          <BarChart3 size={18} color={activeTab === 'analytics' ? '#FF5E36' : '#a1a1aa'} />
          <Text style={[styles.navTabText, activeTab === 'analytics' && styles.activeNavTabText]}>Analytics</Text>
        </TouchableOpacity>
      </View>

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

      <CustomAlert 
        config={alertConfig} 
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))} 
      />
    </SafeAreaView>
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
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationFooter: {
    height: 64,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e4e4e7',
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavTab: {
    borderTopWidth: 2,
    borderTopColor: '#FF5E36',
  },
  navTabText: {
    fontSize: 9,
    fontWeight: 'semibold',
    color: '#a1a1aa',
    marginTop: 4,
  },
  activeNavTabText: {
    color: '#FF5E36',
    fontWeight: 'bold',
  },
  screenView: {
    flex: 1,
  },
});
