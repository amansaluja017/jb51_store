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
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615806528302-05c722d51e0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1728544845420-6d5a610fc890?auto=format&fit=crop&w=800&q=80',
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
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1717386255773-a456c611dc4e?auto=format&fit=crop&w=800&q=80',
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
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
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
      'https://images.unsplash.com/photo-1596783047904-89a4214f4e24?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533075373424-61b3d3c3b56f?auto=format&fit=crop&w=800&q=80',
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
      'https://images.unsplash.com/photo-1620386875077-e322fb810928?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80',
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
      'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1682240306508-2ae6178a1a94?auto=format&fit=crop&w=800&q=80',
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
