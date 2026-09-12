import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Product } from "@repo/products";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateWhatsAppMessage(product: Product, color: string, url: string, size?: string): string {
  const sizeLine = size ? `Size: ${size}\n` : '';
  const sellingPrice = product.sellingPrice ?? product.discountPrice ?? product.price;
  const mrp = product.mrp ?? (product.discountPrice ? product.price : undefined);
  const priceDisplay = mrp && mrp > sellingPrice
    ? `${formatPrice(sellingPrice)} (MRP: ${formatPrice(mrp)})`
    : formatPrice(sellingPrice);

  const message = `Hi! I'm interested in this product:

Product: ${product.name}
Price: ${priceDisplay}
${sizeLine}Color: ${color || 'Not selected'}

Product Link:
${url}

Could you please share availability and ordering details?`;

  return encodeURIComponent(message);
}

export function generateInstagramMessage(product: Product, color: string, url: string, size?: string): string {
  const sizeLine = size ? `Size: ${size}\n` : '';
  const sellingPrice = product.sellingPrice ?? product.discountPrice ?? product.price;
  const mrp = product.mrp ?? (product.discountPrice ? product.price : undefined);
  const priceDisplay = mrp && mrp > sellingPrice
    ? `${formatPrice(sellingPrice)} (MRP: ${formatPrice(mrp)})`
    : formatPrice(sellingPrice);

  return `Hi! I'm interested in this product:
Product: ${product.name}
Price: ${priceDisplay}
${sizeLine}Color: ${color || 'Not selected'}
Link: ${url}`;
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
export const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'jb51clothing';
