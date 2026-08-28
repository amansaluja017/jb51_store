import { z } from 'zod';
import { ReviewSchema } from './services/validations.js';

function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
}

export type Review = z.infer<typeof ReviewSchema>;

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    name: 'Priya Sharma',
    message: 'The Emerald Banarasi Suit fits like a dream! Absolutely stunning handloom work and premium fabric quality. The custom fit was perfect.',
    stars: 5,
    location: 'Mumbai',
    instagramId: 'priya_sharma',
    phone: '+91 98765 43210',
    image: 'https://images.unsplash.com/photo-1615806528302-05c722d51e0d?auto=format&fit=crop&w=300&q=80',
    video: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    approved: true,
  },
  {
    id: 'rev_2',
    name: 'Ananya Iyer',
    message: 'Complimentary custom sizing makes shopping here a breeze. Our Karigar checked measurements over WhatsApp. Excellent service!',
    stars: 5,
    location: 'Chennai',
    instagramId: 'ananya.iyer',
    phone: null,
    image: null,
    video: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    approved: true,
  },
  {
    id: 'rev_3',
    name: 'Kriti Deshmukh',
    message: 'Stunning silk co-ord sets. I wore it for my family get-together and received so many compliments. Planning my next order already!',
    stars: 4,
    location: 'Pune',
    instagramId: 'kriti_d',
    phone: null,
    image: null,
    video: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    approved: true,
  }
];

export async function getReviews(): Promise<Review[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_REVIEWS;
}

export async function createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'>): Promise<Review> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newReview: Review = {
    ...reviewData,
    id: `rev_${generateUniqueId()}`,
    createdAt: new Date().toISOString(),
    approved: false, // Stored as unapproved by default
  };
  MOCK_REVIEWS.unshift(newReview);
  return newReview;
}

export async function updateReview(id: string, data: Partial<Omit<Review, 'id' | 'createdAt'>>): Promise<Review | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const idx = MOCK_REVIEWS.findIndex(r => r.id === id);
  if (idx === -1) return null;
  MOCK_REVIEWS[idx] = { ...MOCK_REVIEWS[idx]!, ...data };
  return MOCK_REVIEWS[idx]!;
}

export async function deleteReview(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const idx = MOCK_REVIEWS.findIndex(r => r.id === id);
  if (idx === -1) return false;
  MOCK_REVIEWS.splice(idx, 1);
  return true;
}
