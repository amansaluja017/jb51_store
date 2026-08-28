import React, { useState, useEffect, useMemo, useRef } from 'react';
import superjson from 'superjson';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  Animated
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  LayoutDashboard,
  Shirt,
  BarChart3,
  FileText,
  LogOut,
  Star
} from 'lucide-react-native';
import * as Notifications from 'expo-notifications';

import { Product, Inquiry, Review } from './src/types';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import ReviewsScreen from './src/screens/ReviewsScreen';
import ProductFormModal from './src/components/ProductFormModal';
import CategoryManagerModal from './src/components/CategoryManagerModal';
import CustomAlert, { CustomAlertConfig } from './src/components/CustomAlert';

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'],
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

const SIMULATED_NEW_INQUIRIES: Omit<Inquiry, 'id'>[] = [
  {
    customerName: 'Janhvi Kapoor',
    productName: 'Crimson Velvet Edit Suit',
    size: 'M',
    color: 'Crimson Wine',
    channel: 'WhatsApp',
    timestamp: 'Just now',
    status: 'Pending',
    phone: '+919833445566',
    email: 'janhvi.k@gmail.com',
    query: 'Is this fabric velvet blend or 100% pure silk velvet? Can you share detail close-up videos of the zardozi sleeve work?'
  },
  {
    customerName: 'Shanaya Kapoor',
    productName: 'Palace Banarasi Silk Suit',
    size: 'S',
    color: 'Emerald Green',
    channel: 'Instagram DM',
    timestamp: 'Just now',
    status: 'Pending',
    phone: '+919922110033',
    email: 'shanaya@kapoor.co',
    query: 'Can you deliver this to London by next Friday? I have an engagement party to attend.'
  },
  {
    customerName: 'Mira Kapoor',
    productName: 'Ivory Chanderi Coord Set',
    size: 'L',
    color: 'Warm Ivory',
    channel: 'WhatsApp',
    timestamp: 'Just now',
    status: 'Pending',
    phone: '+919811223344',
    email: 'mira.kapoor@outlook.com',
    query: 'Hi, is this set lined? Wanted to confirm if the pants have an elasticated waistband.'
  }
];

export default function App() {
  // Navigation & Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalogue' | 'analytics' | 'invoices' | 'reviews'>('dashboard');

  const tabValues = useRef({
    dashboard: new Animated.Value(activeTab === 'dashboard' ? 1 : 0),
    catalogue: new Animated.Value(activeTab === 'catalogue' ? 1 : 0),
    analytics: new Animated.Value(activeTab === 'analytics' ? 1 : 0),
    invoices: new Animated.Value(activeTab === 'invoices' ? 1 : 0),
    reviews: new Animated.Value(activeTab === 'reviews' ? 1 : 0),
  }).current;

  useEffect(() => {
    const tabs: Array<'dashboard' | 'catalogue' | 'analytics' | 'invoices' | 'reviews'> = [
      'dashboard',
      'catalogue',
      'analytics',
      'invoices',
      'reviews',
    ];
    Animated.parallel(
      tabs.map(tab =>
        Animated.timing(tabValues[tab], {
          toValue: activeTab === tab ? 1 : 0,
          duration: 250,
          useNativeDriver: false,
        })
      )
    ).start();
  }, [activeTab]);

  const getTabStyle = (tab: 'dashboard' | 'catalogue' | 'analytics' | 'invoices' | 'reviews') => {
    const width = tabValues[tab].interpolate({
      inputRange: [0, 1],
      outputRange: [44, 110],
    });
    const backgroundColor = tabValues[tab].interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(255, 255, 255, 0)', '#ffebe6'],
    });
    return {
      width,
      backgroundColor,
      height: 44,
      borderRadius: 22,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      overflow: 'hidden' as const,
    };
  };

  const getTextStyle = (tab: 'dashboard' | 'catalogue' | 'analytics' | 'invoices' | 'reviews') => {
    const opacity = tabValues[tab];
    return {
      opacity,
      color: '#FF5E36',
      fontSize: 12,
      fontWeight: 'bold' as const,
      width: 65,
    };
  };

  const getTextContainerStyle = (tab: 'dashboard' | 'catalogue' | 'analytics' | 'invoices' | 'reviews') => {
    const width = tabValues[tab].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 65],
    });
    const marginLeft = tabValues[tab].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 6],
    });
    return {
      width,
      marginLeft,
      justifyContent: 'center' as const,
      overflow: 'hidden' as const,
    };
  };

  // Backend Sync Configurations
  const [apiHost, setApiHost] = useState('http://localhost:3001');
  const [showConfig, setShowConfig] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Standby');

  // Data States
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
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

  // ----------------------------------------------------
  // API INTEGRATIONS
  // ----------------------------------------------------
  const fetchFromBackend = async () => {
    setIsLoading(true);
    try {
      const cleanHost = apiHost.trim().replace(/\/$/, '');

      // Fetch products
      const response = await fetch(`${cleanHost}/trpc/products.getAll`);
      const json = await response.json();
      if (json?.result?.data) {
        const decodedProducts = superjson.deserialize(json.result.data) as Product[];
        setProducts(decodedProducts);
      }

      // Fetch reviews
      const reviewsUrl = isAuthenticated
        ? `${cleanHost}/trpc/reviews.getModerationQueue`
        : `${cleanHost}/trpc/reviews.getAll`;
      
      const reviewsHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (isAuthenticated && token) {
        reviewsHeaders['Authorization'] = `Bearer ${token}`;
      }

      const reviewsResponse = await fetch(reviewsUrl, {
        headers: reviewsHeaders
      });
      const reviewsJson = await reviewsResponse.json();
      if (reviewsJson?.result?.data) {
        const decodedReviews = superjson.deserialize(reviewsJson.result.data) as Review[];
        setReviews(decodedReviews);
      }

      setSyncMessage('Successfully synced with server');
    } catch (err) {
      console.log('Backend unreachable, using local mock sandbox', err);
      setSyncMessage('Server offline - Sandbox active');
      if (reviews.length === 0) {
        setReviews([
          {
            id: 'rev_1',
            name: 'Priya Sharma',
            message: 'The Emerald Banarasi Suit fits like a dream! Absolutely stunning handloom work and premium fabric quality.',
            stars: 5,
            location: 'Mumbai',
            instagramId: 'priya_sharma',
            phone: '+91 98765 43210',
            createdAt: new Date().toISOString(),
            approved: true,
          },
          {
            id: 'rev_2',
            name: 'Ananya Iyer',
            message: 'Complimentary custom sizing makes shopping here a breeze. Our Karigar checked measurements over WhatsApp.',
            stars: 5,
            location: 'Chennai',
            instagramId: 'ananya.iyer',
            createdAt: new Date().toISOString(),
            approved: true,
          }
        ]);
      }
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

  const handleLogin = async () => {
    try {
      const cleanHost = apiHost.trim().replace(/\/$/, '');
      const response = await fetch(`${cleanHost}/trpc/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username.trim(), password })
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      const json = await response.json();
      if (json?.result?.data?.token) {
        setToken(json.result.data.token);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err: any) {
      showAlert('Authentication Error', err.message || 'Invalid admin credentials.', 'error');
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
    } catch (err) { }
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
    } catch (err) { }
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
        } catch (e) { }
        showAlert('Success', 'Outfit deleted.', 'success');
      }
    );
  };

  // ----------------------------------------------------
  // REVIEW MUTATORS
  // ----------------------------------------------------
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
      const cleanHost = apiHost.trim().replace(/\/$/, '');
      const response = await fetch(`${cleanHost}/trpc/reviews.create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      if (!response.ok) {
        throw new Error('Server responded with an error status');
      }
      const json = await response.json();
      if (json?.result?.data) {
        const decoded = superjson.deserialize(json.result.data) as Review;
        if (decoded && decoded.id && decoded.name) {
          setReviews(prev => prev.map(r => r.id === tempId ? decoded : r));
          showAlert('Review Submitted', 'Customer review added successfully.', 'success');
        } else {
          throw new Error('Invalid decoded review data');
        }
      } else {
        throw new Error('Invalid server payload format');
      }
    } catch (err: any) {
      setReviews(prev => prev.filter(r => r.id !== tempId));
      showAlert('Error', `Failed to create review: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  const handleToggleReviewApproval = async (review: Review) => {
    const newApproved = !review.approved;
    setReviews(prev =>
      prev.map(r => r.id === review.id ? { ...r, approved: newApproved } : r)
    );

    try {
      const cleanHost = apiHost.trim().replace(/\/$/, '');
      const response = await fetch(`${cleanHost}/trpc/reviews.update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: review.id, approved: newApproved })
      });
      if (!response.ok) {
        throw new Error('Server responded with an error status');
      }
      const json = await response.json();
      if (json?.result?.data) {
        const decoded = superjson.deserialize(json.result.data) as Review | null;
        if (decoded && decoded.id) {
          showAlert('Approval Updated', `Review by ${review.name} is now ${newApproved ? 'Approved' : 'Disapproved'}.`, 'success');
        } else {
          throw new Error('Unknown review ID or invalid update');
        }
      } else {
        throw new Error('Invalid server response format');
      }
    } catch (err: any) {
      setReviews(prev =>
        prev.map(r => r.id === review.id ? { ...r, approved: review.approved } : r)
      );
      showAlert('Error', `Failed to update approval: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  const handleDeleteReview = (review: Review) => {
    showAlert(
      'Delete Review',
      `Are you sure you want to delete review by "${review.name}"?`,
      'confirm',
      async () => {
        try {
          const cleanHost = apiHost.trim().replace(/\/$/, '');
          const response = await fetch(`${cleanHost}/trpc/reviews.delete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: review.id })
          });
          if (!response.ok) {
            throw new Error('Server responded with an error status');
          }
          const json = await response.json();
          if (json?.result) {
            setReviews(prev => prev.filter(r => r.id !== review.id));
            showAlert('Success', 'Review deleted.', 'success');
          } else {
            throw new Error('Invalid server response format');
          }
        } catch (err: any) {
          showAlert('Error', `Failed to delete review: ${err.message || 'Unknown error'}`, 'error');
        }
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

  // ----------------------------------------------------
  // LOCAL NOTIFICATIONS & SIMULATION
  // ----------------------------------------------------
  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS === 'web') return;
      const response = await Notifications.getPermissionsAsync() as any;
      const existingStatus = response?.status;
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const reqResponse = await Notifications.requestPermissionsAsync() as any;
        finalStatus = reqResponse?.status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for local notification!');
        return;
      }
    }
    requestPermissions();
  }, []);

  const triggerNotification = async (inquiryName: string, productName: string) => {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New Atelier Inquiry 🔔',
          body: `${inquiryName} is asking about the ${productName}.`,
          sound: true,
        },
        trigger: null, // immediate
      });
    } catch (err) {
      console.warn('Failed to schedule local notification', err);
    }
  };

  // Background Simulator: Adds a new inquiry every 90 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    let simCount = 0;
    const interval = setInterval(() => {
      if (simCount >= SIMULATED_NEW_INQUIRIES.length) {
        clearInterval(interval);
        return;
      }

      const template = SIMULATED_NEW_INQUIRIES[simCount];
      const newInq: Inquiry = {
        ...template,
        id: `inq_sim_${Date.now()}`
      };

      setInquiries(prev => [newInq, ...prev]);
      triggerNotification(newInq.customerName, newInq.productName);
      simCount++;
    }, 90000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleSimulateNewInquiry = () => {
    const nextIndex = simulatedIndex % SIMULATED_NEW_INQUIRIES.length;
    const template = SIMULATED_NEW_INQUIRIES[nextIndex];
    const newInq: Inquiry = {
      ...template,
      id: `inq_sim_${Date.now()}`
    };

    setInquiries(prev => [newInq, ...prev]);
    triggerNotification(newInq.customerName, newInq.productName);
    showAlert('Inquiry Simulated', `New inquiry from ${newInq.customerName} has been simulated. Check device notifications!`, 'success');
    setSimulatedIndex(prev => prev + 1);
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
      } catch (e) { }
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
      } catch (e) { }
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
          <TouchableOpacity
            onPress={() => {
              setIsAuthenticated(false);
              setToken(null);
            }}
            style={styles.logoutBtn}
            accessibilityLabel="Log out"
            accessibilityRole="button"
          >
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
        <View style={styles.navigationFooter}>
          <Animated.View style={getTabStyle('dashboard')}>
            <TouchableOpacity
              onPress={() => setActiveTab('dashboard')}
              style={styles.tabTouchable}
              accessibilityLabel="Overview tab"
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'dashboard' }}
            >
              <LayoutDashboard size={18} color={activeTab === 'dashboard' ? '#FF5E36' : '#a1a1aa'} />
              <Animated.View style={getTextContainerStyle('dashboard')}>
                <Animated.Text numberOfLines={1} style={getTextStyle('dashboard')}>
                  Overview
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={getTabStyle('catalogue')}>
            <TouchableOpacity
              onPress={() => setActiveTab('catalogue')}
              style={styles.tabTouchable}
              accessibilityLabel="Catalog tab"
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'catalogue' }}
            >
              <Shirt size={18} color={activeTab === 'catalogue' ? '#FF5E36' : '#a1a1aa'} />
              <Animated.View style={getTextContainerStyle('catalogue')}>
                <Animated.Text numberOfLines={1} style={getTextStyle('catalogue')}>
                  Catalog
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={getTabStyle('analytics')}>
            <TouchableOpacity
              onPress={() => setActiveTab('analytics')}
              style={styles.tabTouchable}
              accessibilityLabel="Analytics tab"
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'analytics' }}
            >
              <BarChart3 size={18} color={activeTab === 'analytics' ? '#FF5E36' : '#a1a1aa'} />
              <Animated.View style={getTextContainerStyle('analytics')}>
                <Animated.Text numberOfLines={1} style={getTextStyle('analytics')}>
                  Analytics
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={getTabStyle('invoices')}>
            <TouchableOpacity
              onPress={() => setActiveTab('invoices')}
              style={styles.tabTouchable}
              accessibilityLabel="Invoices tab"
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'invoices' }}
            >
              <FileText size={18} color={activeTab === 'invoices' ? '#FF5E36' : '#a1a1aa'} />
              <Animated.View style={getTextContainerStyle('invoices')}>
                <Animated.Text numberOfLines={1} style={getTextStyle('invoices')}>
                  Invoices
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={getTabStyle('reviews')}>
            <TouchableOpacity
              onPress={() => setActiveTab('reviews')}
              style={styles.tabTouchable}
              accessibilityLabel="Reviews tab"
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'reviews' }}
            >
              <Star size={18} color={activeTab === 'reviews' ? '#FF5E36' : '#a1a1aa'} />
              <Animated.View style={getTextContainerStyle('reviews')}>
                <Animated.Text numberOfLines={1} style={getTextStyle('reviews')}>
                  Reviews
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
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
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: '#ffffff', // Clean white background matching rest of the light UI cards
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 32, // Fully rounded capsule shape
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06, // soft low-opacity shadow
    shadowRadius: 16,
    elevation: 4,
  },
  navTab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebe6', // Soft warm-peach background matching application buttons
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
  },
  tabTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
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
    paddingBottom: 96, // gives space so content can scroll above the floating navbar
  },
});
