export interface Variant {
  id?: string;
  productVariantId?: string;
  color: string;
  hexCode?: string;
  size?: string;
  stock: number;
  reservedStock?: number;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  mrp: number;
  sellingPrice: number;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  fabric?: string;
  fit?: string;
  careInstructions?: string;
  variants: Variant[];
  featured?: boolean;
  newArrival?: boolean;
  bestseller?: boolean;
  isListed?: boolean;
  status?: 'listed' | 'unListed' | 'discontinued';
  inStock?: boolean;
  tags?: string[];
  createdAt?: string;
}

export const isProductInStock = (product: Product): boolean => {
  if (product.inStock === false) return false;
  if (!product.variants || product.variants.length === 0) return true;
  return product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0) > 0;
};

export const isProductDiscontinued = (product: Product): boolean => {
  if (!product) return false;
  return (
    product.status === 'discontinued' ||
    (product as any).isDiscontinued === true ||
    (product as any).features?.isDiscontinued === true ||
    (product as any).features?.status === 'discontinued'
  );
};

export interface Inquiry {
  id: string;
  customerName: string;
  productName: string;
  size: string;
  color: string;
  channel: 'WhatsApp' | 'Instagram' | 'Instagram DM' | string;
  timestamp: string;
  status: 'Pending' | 'Responded' | 'Resolved' | string;
  phone?: string;
  email?: string;
  query?: string;
}

export interface Review {
  id: string;
  name: string;
  message: string;
  stars: number;
  image?: string | null;
  video?: string | null;
  instagramId?: string | null;
  phone?: string | null;
  location?: string | null;
  createdAt: string;
  approved?: boolean;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productVariantId?: string | null;
  type: 'sale' | 'purchase' | 'adjustment' | 'reservation' | 'release' | 'return' | string;
  quantity: number;
  availableStock?: number | null;
  reservedStock?: number | null;
  totalStock?: number | null;
  unitPrice?: string | number | null;
  totalAmount?: string | number | null;
  notes?: string | null;
  createdAt: string;
  productName?: string | null;
  variantColor?: string | null;
  variantHex?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  sellerName?: string | null;
  sellerEmail?: string | null;
}

export interface Customer {
  id: string;
  userId?: string | null;
  name: string;
  nameSlug?: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  orderId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  productId?: string | null;
  userId?: string | null;
  quantity?: number;
  mode?: 'cash' | 'online' | 'credit';
  subtotal?: string | number | null;
  gst?: string | number | null;
  taxRate?: string | number | null;
  discount?: string | number | null;
  totalAmount?: string | number | null;
  finalAmount?: string | number | null;
  items?: any[];
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  orderNumber?: string | null;
  paidAmount?: string | number | null;
  dueAmount?: string | number | null;
  dueDate?: string | null;
  paymentDate?: string | null;
  advancePaymentMode?: string | null;
  creditTransactions?: CreditTransaction[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  productVariantId?: string | null;
  productName: string;
  variantColor?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  userId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerAddress?: string | null;
  status: string;
  orderType?: 'online' | 'offline' | string;
  paymentMethod: string;
  subtotal?: string | number | null;
  gst?: string | number | null;
  taxRate?: string | number | null;
  discount?: string | number | null;
  totalAmount: string | number;
  items: OrderItem[];
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreditTransaction {
  id: string;
  creditId: string;
  orderId?: string | null;
  invoiceId?: string | null;
  userId?: string | null;
  amount: string | number;
  paymentMode: string;
  transactionType: string;
  notes?: string | null;
  createdAt: string;
}

export interface Credit {
  id: string;
  orderId?: string | null;
  userId?: string | null;
  invoiceId?: string | null;
  paidAmount: string | number;
  dueAmount: string | number;
  dueDate?: string | null;
  advancePaymentMode?: string | null;
  createdAt: string;
  updatedAt: string;
  orderNumber?: string | null;
  orderTotal?: string | number | null;
  invoiceNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerAddress?: string | null;
  userEmail?: string | null;
  transactions?: CreditTransaction[];
}

export interface CreditMetrics {
  totalCredits: number;
  totalPaid: number;
  totalDue: number;
  pendingCount: number;
  settledCount: number;
  overdueCount: number;
}

export interface OrderChannelRatio {
  onlineRatio: number;   // % of total orders
  offlineRatio: number;  // % of total orders
}

export interface GrowthMetrics {
  totalOrderGrowth: number;   // % change (recent 30d vs previous 30d)
  onlineOrderGrowth: number;  // % change
  offlineOrderGrowth: number; // % change
  current30DaysOrders: number;
  previous30DaysOrders: number;
  current30DaysOnline: number;
  previous30DaysOnline: number;
  current30DaysOffline: number;
  previous30DaysOffline: number;
}

export interface PaymentAnalytics {
  onlineAmount: number;
  cashAmount: number;
  creditAmount: number;
  totalAmount: number;
  onlineShare: number; // % of total revenue
  cashShare: number;   // % of total revenue
  creditShare: number; // % of total revenue
  onlineCount: number;
  cashCount: number;
  creditCount: number;
  creditDueAmount: number;
  creditPaidAmount: number;
}

export interface AnalyticsOverviewData {
  scope: 'overall' | 'product';
  product?: {
    id: string;
    slug: string;
    name: string;
    category?: string | null;
    price?: number | null;
  } | null;
  views: number;
  whatsappClicks: number;
  instagramClicks: number;
  totalClicks: number;
  conversionRate: number;
  whatsappConversionRate: number;
  instagramConversionRate: number;
  orderCount?: number;
  onlineOrderCount?: number;
  offlineOrderCount?: number;
  orderConversionRate?: number;
  onlineOrderConversionRate?: number;
  channelRatio?: OrderChannelRatio;
  growth?: GrowthMetrics;
  payments?: PaymentAnalytics;
  updatedAt?: string | null;
}

export interface ProductAnalyticsItem {
  productId: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  views: number;
  whatsappClicks: number;
  instagramClicks: number;
  totalClicks: number;
  conversionRate: number;
  orderCount: number;
  onlineOrderCount?: number;
  offlineOrderCount?: number;
  onlineOrderConversionRate?: number;
  onlineOrderRatio?: number;
  offlineOrderRatio?: number;
  onlineRevenue?: number;
  cashRevenue?: number;
  creditRevenue?: number;
  totalRevenue?: number;
}

export interface ViewsAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  views: number;
}

export interface ClicksAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  whatsappClicks: number;
  instagramClicks: number;
  totalClicks: number;
}

export interface ConversionAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  conversionRate: number;
  whatsappConversionRate: number;
  instagramConversionRate: number;
  orderConversionRate: number;
  onlineOrderConversionRate: number;
}

export interface ConversionFunnelAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  views: number;
  inquiries: number;
  onlineOrders: number;
  inquiryRate: number;
  onlineOrderRate: number;
  inquiryToOrderRate: number;
}

export interface ChannelRatioAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  onlineRatio: number;
  offlineRatio: number;
  onlineOrderCount: number;
  offlineOrderCount: number;
  totalOrderCount: number;
}

export interface GrowthPulseAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  totalOrderGrowth: number;
  onlineOrderGrowth: number;
  offlineOrderGrowth: number;
  current30DaysOrders: number;
  previous30DaysOrders: number;
  current30DaysOnline: number;
  previous30DaysOnline: number;
  current30DaysOffline: number;
  previous30DaysOffline: number;
}

export interface PaymentModesAnalytics {
  scope: 'overall' | 'product';
  productId?: string | null;
  slug?: string | null;
  onlineAmount: number;
  cashAmount: number;
  creditAmount: number;
  totalAmount: number;
  onlineShare: number;
  cashShare: number;
  creditShare: number;
  onlineCount: number;
  cashCount: number;
  creditCount: number;
  creditDueAmount: number;
  creditPaidAmount: number;
}

export interface DemandHighlightsAnalytics {
  mostViewedProduct: ProductAnalyticsItem | null;
  mostDemandedProduct: ProductAnalyticsItem | null;
  topConvertingProduct: ProductAnalyticsItem | null;
}

export interface InventorySummaryAnalytics {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  hasReservedProducts: number;
  totalStockUnits: number;
  totalReservedUnits: number;
}

