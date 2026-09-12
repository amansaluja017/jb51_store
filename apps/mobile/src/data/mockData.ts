import { Inquiry, Review } from '../types';

export const INITIAL_INQUIRIES: Inquiry[] = [];

export const SIMULATED_NEW_INQUIRIES: Omit<Inquiry, 'id'>[] = [];

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
