export interface Variant {
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

export interface Credit {
  id: string;
  orderId?: string | null;
  userId?: string | null;
  invoiceId?: string | null;
  paidAmount: string | number;
  dueAmount: string | number;
  dueDate?: string | null;
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
}

export interface CreditMetrics {
  totalCredits: number;
  totalPaid: number;
  totalDue: number;
  pendingCount: number;
  settledCount: number;
  overdueCount: number;
}

