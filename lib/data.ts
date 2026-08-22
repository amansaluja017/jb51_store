export interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  fabric: string;
  fit: string;
  careInstructions: string;
  variants: ProductVariant[];
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
  createdAt: string;
}

export const CATEGORIES = [
  'Formal Suits',
  'Office Wear',
  'Wedding / Occasion',
  'Co-ord Sets',
  'Blazers',
  'Trousers'
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'The Emerald Executive Suit',
    slug: 'emerald-executive-suit',
    description: 'A striking emerald green suit tailored for the modern executive. Crafted from premium Italian wool blend, it features a structured double-breasted blazer and wide-leg trousers for a commanding yet feminine silhouette.',
    price: 18999,
    category: 'Formal Suits',
    images: [
      'https://picsum.photos/seed/emerald1/800/1200',
      'https://picsum.photos/seed/emerald2/800/1200',
      'https://picsum.photos/seed/emerald3/800/1200',
    ],
    fabric: '80% Italian Wool, 20% Silk',
    fit: 'Tailored fit. True to size.',
    careInstructions: 'Dry clean only. Iron on low heat.',
    variants: [
      { color: 'Emerald Green', size: 'XS', stock: 5 },
      { color: 'Emerald Green', size: 'S', stock: 10 },
      { color: 'Emerald Green', size: 'M', stock: 8 },
      { color: 'Emerald Green', size: 'L', stock: 2 },
    ],
    featured: true,
    newArrival: true,
    bestseller: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ivory Silk Co-ord Set',
    slug: 'ivory-silk-coord-set',
    description: 'Effortless luxury in pure ivory silk. This two-piece set features a fluid wrap blouse and relaxed palazzo pants, perfect for sophisticated daytime events or modern evening wear.',
    price: 14500,
    category: 'Co-ord Sets',
    images: [
      'https://picsum.photos/seed/ivory1/800/1200',
      'https://picsum.photos/seed/ivory2/800/1200',
    ],
    fabric: '100% Mulberry Silk',
    fit: 'Relaxed, fluid fit.',
    careInstructions: 'Dry clean only.',
    variants: [
      { color: 'Ivory', size: 'S', stock: 3 },
      { color: 'Ivory', size: 'M', stock: 6 },
      { color: 'Ivory', size: 'L', stock: 4 },
    ],
    featured: true,
    newArrival: false,
    bestseller: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Midnight Charcoal Power Blazer',
    slug: 'midnight-charcoal-power-blazer',
    description: 'The quintessential power blazer reimagined. Features sharp padded shoulders, a nipped-in waist, and subtle pinstripe detailing. An essential anchor piece for any professional wardrobe.',
    price: 11200,
    category: 'Blazers',
    images: [
      'https://picsum.photos/seed/charcoal1/800/1200',
      'https://picsum.photos/seed/charcoal2/800/1200',
    ],
    fabric: '90% Wool, 10% Cashmere',
    fit: 'Structured tailored fit.',
    careInstructions: 'Dry clean only.',
    variants: [
      { color: 'Charcoal', size: 'XS', stock: 2 },
      { color: 'Charcoal', size: 'S', stock: 5 },
      { color: 'Charcoal', size: 'M', stock: 7 },
    ],
    featured: false,
    newArrival: true,
    bestseller: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Crimson Velvet Occasion Suit',
    slug: 'crimson-velvet-occasion-suit',
    description: 'Make a lasting impression with this rich crimson velvet suit. Designed for winter weddings and galas, it features a single-button peak lapel jacket and flared trousers.',
    price: 22500,
    category: 'Wedding / Occasion',
    images: [
      'https://picsum.photos/seed/crimson1/800/1200',
      'https://picsum.photos/seed/crimson2/800/1200',
    ],
    fabric: 'Premium Cotton Velvet',
    fit: 'Slim fit.',
    careInstructions: 'Dry clean only. Do not iron, steam gently.',
    variants: [
      { color: 'Crimson Red', size: 'S', stock: 4 },
      { color: 'Crimson Red', size: 'M', stock: 4 },
      { color: 'Crimson Red', size: 'L', stock: 2 },
    ],
    featured: true,
    newArrival: false,
    bestseller: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Oatmeal Minimalist Trousers',
    slug: 'oatmeal-minimalist-trousers',
    description: 'Versatile and incredibly comfortable high-waisted trousers in a soft oatmeal shade. Features precise front pleats and a flattering wide-leg cut.',
    price: 6800,
    category: 'Trousers',
    images: [
      'https://picsum.photos/seed/oatmeal1/800/1200',
      'https://picsum.photos/seed/oatmeal2/800/1200',
    ],
    fabric: '65% Viscose, 30% Polyester, 5% Elastane',
    fit: 'High-waisted, wide leg.',
    careInstructions: 'Machine wash cold on gentle cycle.',
    variants: [
      { color: 'Oatmeal', size: 'XS', stock: 12 },
      { color: 'Oatmeal', size: 'S', stock: 15 },
      { color: 'Oatmeal', size: 'M', stock: 20 },
      { color: 'Oatmeal', size: 'L', stock: 10 },
      { color: 'Oatmeal', size: 'XL', stock: 5 },
    ],
    featured: false,
    newArrival: false,
    bestseller: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Classic Navy Office Suit',
    slug: 'classic-navy-office-suit',
    description: 'A timeless navy suit tailored for everyday elegance in the workplace. Lightweight, breathable, and designed with a subtle stretch for all-day comfort.',
    price: 15500,
    category: 'Office Wear',
    images: [
      'https://picsum.photos/seed/navy1/800/1200',
      'https://picsum.photos/seed/navy2/800/1200',
    ],
    fabric: '70% Wool, 28% Polyester, 2% Spandex',
    fit: 'Regular tailored fit.',
    careInstructions: 'Dry clean recommended.',
    variants: [
      { color: 'Navy Blue', size: 'S', stock: 8 },
      { color: 'Navy Blue', size: 'M', stock: 12 },
      { color: 'Navy Blue', size: 'L', stock: 8 },
    ],
    featured: true,
    newArrival: true,
    bestseller: false,
    createdAt: new Date().toISOString(),
  }
];

export async function getProducts(): Promise<Product[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
}
