import { Product, Inquiry, Review } from '../types';

export const DEFAULT_CATEGORIES = [
  'Formal Suits',
  'Anarkali Suits',
  'Silk Co-ords',
  'Velvet Edit',
  'Occasion Wear'
];

export const MOCK_PRODUCTS: Product[] = [
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

export const INITIAL_INQUIRIES: Inquiry[] = [
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

export const SIMULATED_NEW_INQUIRIES: Omit<Inquiry, 'id'>[] = [
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

export const MOCK_REVIEWS: Review[] = [
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
