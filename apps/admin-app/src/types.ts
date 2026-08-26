export interface Variant {
  color: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
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
  tags?: string[];
}

export interface Inquiry {
  id: string;
  customerName: string;
  productName: string;
  size: string;
  color: string;
  channel: 'WhatsApp' | 'Instagram' | 'Instagram DM' | string;
  timestamp: string;
  status: 'Pending' | 'Responded' | 'Resolved' | string;
}
