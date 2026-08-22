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
  'Anarkali Suits',
  'Silk Co-ords',
  'Velvet Edit',
  'Occasion Wear'
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'The Emerald Banarasi Suit',
    slug: 'emerald-banarasi-suit',
    description: 'A masterpiece of contemporary Indian luxury. Handwoven in Banaras from a premium silk blend, it features an unstructured straight kurta with delicate gold zari borders, matched with straight trousers and a sheer, lightweight organza dupatta.',
    price: 24500,
    category: 'Occasion Wear',
    images: [
      'https://picsum.photos/seed/banarasi1/800/1200',
      'https://picsum.photos/seed/banarasi2/800/1200',
      'https://picsum.photos/seed/banarasi3/800/1200',
    ],
    fabric: '80% Handloom Silk, 20% Zari',
    fit: 'Relaxed straight fit. True to size.',
    careInstructions: 'Dry clean only. Iron inside out on low heat.',
    variants: [
      { color: 'Emerald Green', size: 'XS', stock: 5 },
      { color: 'Emerald Green', size: 'S', stock: 10 },
      { color: 'Emerald Green', size: 'M', stock: 8 },
      { color: 'Emerald Green', size: 'L', stock: 2 },
    ],
    featured: true,
    newArrival: true,
    bestseller: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ivory Chanderi Silk Co-ord Set',
    slug: 'ivory-chanderi-silk-coord',
    description: 'Effortless luxury in handspun Chanderi silk. This two-piece co-ord set features a relaxed tunic with fine pin-tuck detailing, delicate gold piping, and matching utility crop trousers. Minimal styling for the modern woman.',
    price: 16800,
    category: 'Silk Co-ords',
    images: [
      'https://picsum.photos/seed/chanderi1/800/1200',
      'https://picsum.photos/seed/chanderi2/800/1200',
    ],
    fabric: '100% Chanderi Silk',
    fit: 'Relaxed, fluid fit.',
    careInstructions: 'Dry clean only.',
    variants: [
      { color: 'Warm Ivory', size: 'S', stock: 3 },
      { color: 'Warm Ivory', size: 'M', stock: 6 },
      { color: 'Warm Ivory', size: 'L', stock: 4 },
    ],
    featured: true,
    newArrival: false,
    bestseller: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Crimson Velvet Zardozi Suit',
    slug: 'crimson-velvet-zardozi-suit',
    description: 'Indulge in royal sophistication with this deep crimson silk-velvet suit. Lavishly hand-embroidered with traditional Zardozi gold wirework along the neckline and cuffs, complete with slim silk trousers and a rich woven dupatta.',
    price: 32000,
    category: 'Velvet Edit',
    images: [
      'https://picsum.photos/seed/zardozi1/800/1200',
      'https://picsum.photos/seed/zardozi2/800/1200',
    ],
    fabric: 'Premium Silk Velvet & Silk Satin',
    fit: 'Regular tailored fit.',
    careInstructions: 'Dry clean only. Do not iron directly, steam gently.',
    variants: [
      { color: 'Crimson Wine', size: 'XS', stock: 2 },
      { color: 'Crimson Wine', size: 'S', stock: 5 },
      { color: 'Crimson Wine', size: 'M', stock: 7 },
    ],
    featured: true,
    newArrival: true,
    bestseller: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Ochre Tussar Anarkali Suit',
    slug: 'ochre-tussar-anarkali-suit',
    description: 'A majestic ochre Anarkali suit crafted from premium Tussar silk. Features a pleated panelled silhouette that drapes elegantly, accompanied by a hand-painted floral organza dupatta and churidar trousers.',
    price: 28500,
    category: 'Anarkali Suits',
    images: [
      'https://picsum.photos/seed/tussar1/800/1200',
      'https://picsum.photos/seed/tussar2/800/1200',
    ],
    fabric: '100% Handloom Tussar Silk',
    fit: 'Fluid panelled fit.',
    careInstructions: 'Dry clean only.',
    variants: [
      { color: 'Ochre Gold', size: 'S', stock: 4 },
      { color: 'Ochre Gold', size: 'M', stock: 4 },
      { color: 'Ochre Gold', size: 'L', stock: 2 },
    ],
    featured: false,
    newArrival: true,
    bestseller: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Mustard Georgette Palazzo Suit',
    slug: 'mustard-georgette-palazzo-suit',
    description: 'A bright yet muted mustard palazzo suit made from pure flowing georgette. Adorned with delicate Resham embroidery and paired with wide-leg palazzos and a sheer chiffon dupatta for ease of movement.',
    price: 18500,
    category: 'Formal Suits',
    images: [
      'https://picsum.photos/seed/georgette1/800/1200',
      'https://picsum.photos/seed/georgette2/800/1200',
    ],
    fabric: '100% Pure Georgette',
    fit: 'Easy flowing fit.',
    careInstructions: 'Dry clean recommended.',
    variants: [
      { color: 'Mustard Yellow', size: 'XS', stock: 12 },
      { color: 'Mustard Yellow', size: 'S', stock: 15 },
      { color: 'Mustard Yellow', size: 'M', stock: 20 },
      { color: 'Mustard Yellow', size: 'L', stock: 10 },
    ],
    featured: false,
    newArrival: false,
    bestseller: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Classic Indigo Block-Print Suit',
    slug: 'midnight-indigo-block-print-suit',
    description: 'An everyday staple featuring traditional hand-block printing in deep indigo. Crafted from a highly breathable cotton-silk blend, it is tailored with straight lines, subtle gold piping, and matching print pants.',
    price: 12500,
    category: 'Formal Suits',
    images: [
      'https://picsum.photos/seed/indigo1/800/1200',
      'https://picsum.photos/seed/indigo2/800/1200',
    ],
    fabric: '60% Cotton, 40% Silk',
    fit: 'Straight tailored fit.',
    careInstructions: 'Gentle hand wash in cold water with mild detergent.',
    variants: [
      { color: 'Midnight Indigo', size: 'S', stock: 8 },
      { color: 'Midnight Indigo', size: 'M', stock: 12 },
      { color: 'Midnight Indigo', size: 'L', stock: 8 },
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
