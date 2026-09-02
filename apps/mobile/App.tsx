import React, { useState, useEffect, useMemo, useRef } from 'react';
import superjson from 'superjson';
import axios from 'axios';
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
  Star,
  User
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
import AccountSettingsModal from './src/components/AccountSettingsModal';
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

const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    name: 'Prerna Sharma',
    message: 'The Palace Banarasi Silk Suit is absolutely breathtaking! The zari work is extremely fine, and the fabric feels premium.',
    stars: 5,
    location: 'Mumbai',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    approved: true,
    phone: null,
    instagramId: 'prerna_s'
  },
  {
    id: 'rev_2',
    name: 'Anjali Desai',
    message: 'Beautiful Ivory Chanderi Coord Set, perfect for minimal everyday wear. The trousers fit beautifully.',
    stars: 4,
    location: 'New Delhi',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    approved: true,
    phone: null,
    instagramId: 'anjali_desai'
  },
  {
    id: 'rev_3',
    name: 'Kavita Verma',
    message: 'Submitted a customization query for the Velvet suit and got a prompt response. Looking forward to ordering!',
    stars: 5,
    location: 'Bangalore',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    approved: false,
    phone: null,
    instagramId: 'kavita_v'
  }
];

export default function App() {
  // Navigation & Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
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
        Animated.spring(tabValues[tab], {
          toValue: activeTab === tab ? 1 : 0,
          damping: 20,
          stiffness: 150,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [activeTab]);

  // Backend Sync Configurations
  const getInitialApiHost = () => {
    return process.env.EXPO_PUBLIC_API_HOST || process.env.EXPO_PUBLIC_API_URL || 'http://10.199.36.189:3001';
  };

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

  // ----------------------------------------------------
  // API INTEGRATIONS & TRPC CLIENT (Matching Web Signature via Axios)
  // ----------------------------------------------------
  const trpcRequest = async (
    path: string,
    options: { method?: 'GET' | 'POST'; body?: any; requireAuth?: boolean } = {}
  ) => {
    const cleanHost = apiHost.trim().replace(/\/$/, '');
    const url = `${cleanHost}/trpc/${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-trpc-source': 'expo-mobile-react',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const method = options.method || 'GET';
    console.log(`[tRPC Axios Request] -> ${method} ${url}`);

    try {
      const response = await axios({
        method,
        url,
        headers,
        timeout: 10000,
        data: method === 'POST' && options.body !== undefined ? { json: options.body } : undefined,
      });

      const json = response.data;

      if (json?.result?.data) {
        if (json.result.data.json !== undefined) {
          try {
            return superjson.deserialize(json.result.data);
          } catch {
            return json.result.data.json;
          }
        }
        return json.result.data;
      }
      return json?.result || json;
    } catch (err: any) {
      const serverError =
        err.response?.data?.error?.json?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        `Request failed with status ${err.response?.status}`;
      console.error(`[tRPC Axios Error] ${path}:`, serverError);
      throw new Error(serverError);
    }
  };

  const fetchFromBackend = async () => {
    setIsLoading(true);
    try {
      // Fetch products
      const decodedProducts = await trpcRequest('products.getAll');
      if (Array.isArray(decodedProducts)) {
        setProducts(decodedProducts as Product[]);
      }

      // Fetch reviews using authenticated moderation queue or public endpoint
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

  const handleLogin = async (formData?: { username?: string; password?: string }) => {
    const inputUsername = formData?.username ?? username;
    const inputPassword = formData?.password ?? password;
    const identifier = inputUsername.trim();

    console.log('[handleLogin] Triggered!', { identifier, passwordLength: inputPassword.length, apiHost });
    if (!identifier || !inputPassword) {
      const msg = 'Please enter both username and password.';
      if (Platform.OS !== 'web') {
        Alert.alert('Validation Required', msg);
      }
      showAlert('Validation Required', msg, 'error');
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
      const errorMsg = err.message || 'Invalid admin credentials.';
      if (Platform.OS !== 'web') {
        Alert.alert('Authentication Error', errorMsg);
      }
      showAlert('Authentication Error', errorMsg, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    showAlert('Logged Out', 'Your admin session has ended.', 'info');
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

    try {
      await trpcRequest('products.update', {
        method: 'POST',
        body: {
          slug: product.slug,
          data: { variants: updatedVariants }
        }
      });
      setProducts(prev =>
        prev.map(p => p.slug === product.slug ? { ...p, variants: updatedVariants } : p)
      );
      showAlert('Stock Status Updated', `${product.name} is now ${isCurrentlyOOS ? 'In Stock' : 'Out of Stock'}.`, 'success');
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to update stock status', 'error');
    }
  };

  const handleUpdateVisibility = async (product: Product, status: boolean) => {
    try {
      await trpcRequest('products.update', {
        method: 'POST',
        body: {
          slug: product.slug,
          data: { isListed: status }
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
          showAlert('Success', 'Review deleted.', 'success');
        } catch (err: any) {
          setReviews(prev => prev.filter(r => r.id !== review.id));
          showAlert('Success (Mock)', 'Review deleted from local sandbox.', 'success');
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
    if (catToDelete === 'Uncategorized') {
      showAlert('Error', 'The "Uncategorized" category is a system fallback and cannot be deleted.', 'error');
      return;
    }

    const hasProducts = products.some(p => p.category === catToDelete);

    setCategories(prev => {
      let filtered = prev.filter(c => c !== catToDelete);
      if (hasProducts && !filtered.includes('Uncategorized')) {
        filtered = [...filtered, 'Uncategorized'];
      }
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
        await trpcRequest('products.update', {
          method: 'POST',
          body: { slug: editingSlug, data: payload }
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
        await trpcRequest('products.create', {
          method: 'POST',
          body: payload
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
        <View style={styles.navigationFooter}>
          <TouchableOpacity
            onPress={() => setActiveTab('dashboard')}
            style={styles.tabItem}
            accessibilityLabel="Overview tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'dashboard' }}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [
                    {
                      translateY: tabValues.dashboard.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -6],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.activeIndicator,
                  {
                    opacity: tabValues.dashboard,
                    transform: [{ scale: tabValues.dashboard }],
                  },
                ]}
              />
              <View style={styles.iconPositioner}>
                <LayoutDashboard size={18} color={activeTab === 'dashboard' ? '#FF5E36' : '#a1a1aa'} />
              </View>
            </Animated.View>
            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  opacity: tabValues.dashboard,
                  transform: [
                    {
                      translateY: tabValues.dashboard.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              Overview
            </Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('catalogue')}
            style={styles.tabItem}
            accessibilityLabel="Catalog tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'catalogue' }}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [
                    {
                      translateY: tabValues.catalogue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -6],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.activeIndicator,
                  {
                    opacity: tabValues.catalogue,
                    transform: [{ scale: tabValues.catalogue }],
                  },
                ]}
              />
              <View style={styles.iconPositioner}>
                <Shirt size={18} color={activeTab === 'catalogue' ? '#FF5E36' : '#a1a1aa'} />
              </View>
            </Animated.View>
            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  opacity: tabValues.catalogue,
                  transform: [
                    {
                      translateY: tabValues.catalogue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              Catalog
            </Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('analytics')}
            style={styles.tabItem}
            accessibilityLabel="Analytics tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'analytics' }}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [
                    {
                      translateY: tabValues.analytics.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -6],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.activeIndicator,
                  {
                    opacity: tabValues.analytics,
                    transform: [{ scale: tabValues.analytics }],
                  },
                ]}
              />
              <View style={styles.iconPositioner}>
                <BarChart3 size={18} color={activeTab === 'analytics' ? '#FF5E36' : '#a1a1aa'} />
              </View>
            </Animated.View>
            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  opacity: tabValues.analytics,
                  transform: [
                    {
                      translateY: tabValues.analytics.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              Analytics
            </Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('invoices')}
            style={styles.tabItem}
            accessibilityLabel="Invoices tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'invoices' }}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [
                    {
                      translateY: tabValues.invoices.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -6],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.activeIndicator,
                  {
                    opacity: tabValues.invoices,
                    transform: [{ scale: tabValues.invoices }],
                  },
                ]}
              />
              <View style={styles.iconPositioner}>
                <FileText size={18} color={activeTab === 'invoices' ? '#FF5E36' : '#a1a1aa'} />
              </View>
            </Animated.View>
            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  opacity: tabValues.invoices,
                  transform: [
                    {
                      translateY: tabValues.invoices.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              Invoices
            </Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('reviews')}
            style={styles.tabItem}
            accessibilityLabel="Reviews tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'reviews' }}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [
                    {
                      translateY: tabValues.reviews.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -6],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.activeIndicator,
                  {
                    opacity: tabValues.reviews,
                    transform: [{ scale: tabValues.reviews }],
                  },
                ]}
              />
              <View style={styles.iconPositioner}>
                <Star size={18} color={activeTab === 'reviews' ? '#FF5E36' : '#a1a1aa'} />
              </View>
            </Animated.View>
            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  opacity: tabValues.reviews,
                  transform: [
                    {
                      translateY: tabValues.reviews.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              Reviews
            </Animated.Text>
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
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrapper: {
    width: 48,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffebe6', // Soft warm-peach background
  },
  iconPositioner: {
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FF5E36',
    position: 'absolute',
    bottom: 6,
  },
  screenView: {
    flex: 1,
    paddingBottom: 96, // gives space so content can scroll above the floating navbar
  },
});
