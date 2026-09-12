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

