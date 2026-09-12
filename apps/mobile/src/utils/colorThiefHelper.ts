import { Platform } from 'react-native';
import axios from 'axios';
import { getPalette } from 'colorthief';
import { extractPalette, MmcqQuantizer, validateOptions } from 'colorthief/internals';
import * as jpeg from 'jpeg-js';
import * as UPNG from 'upng-js';

/**
 * Standard fashion & apparel color dictionary for intelligent name suggestions
 */
const COLOR_DICTIONARY: { name: string; rgb: [number, number, number] }[] = [
  { name: 'Pure White', rgb: [255, 255, 255] },
  { name: 'Ivory', rgb: [255, 255, 240] },
  { name: 'Off White', rgb: [248, 248, 248] },
  { name: 'Cream', rgb: [255, 253, 208] },
  { name: 'Beige', rgb: [245, 245, 220] },
  { name: 'Sand', rgb: [219, 194, 155] },
  { name: 'Khaki', rgb: [195, 176, 145] },
  { name: 'Camel', rgb: [193, 154, 107] },
  { name: 'Tan', rgb: [210, 180, 140] },
  { name: 'Taupe', rgb: [179, 139, 109] },
  { name: 'Chocolate Brown', rgb: [74, 38, 20] },
  { name: 'Coffee Brown', rgb: [111, 78, 55] },
  { name: 'Chestnut', rgb: [149, 69, 53] },
  { name: 'Jet Black', rgb: [10, 10, 10] },
  { name: 'Charcoal', rgb: [54, 57, 63] },
  { name: 'Slate Gray', rgb: [112, 128, 144] },
  { name: 'Ash Gray', rgb: [178, 190, 181] },
  { name: 'Silver', rgb: [192, 192, 192] },
  { name: 'Light Gray', rgb: [220, 220, 220] },
  { name: 'Wine Red', rgb: [114, 47, 55] },
  { name: 'Burgundy', rgb: [128, 0, 32] },
  { name: 'Maroon', rgb: [128, 0, 0] },
  { name: 'Crimson', rgb: [220, 20, 60] },
  { name: 'Ruby Red', rgb: [155, 17, 30] },
  { name: 'Scarlet Red', rgb: [255, 36, 0] },
  { name: 'Cherry Red', rgb: [210, 4, 45] },
  { name: 'Rust Red', rgb: [183, 65, 14] },
  { name: 'Terracotta', rgb: [226, 114, 91] },
  { name: 'Coral', rgb: [255, 127, 80] },
  { name: 'Peach', rgb: [255, 218, 185] },
  { name: 'Blush Pink', rgb: [254, 200, 216] },
  { name: 'Baby Pink', rgb: [244, 194, 194] },
  { name: 'Rose Pink', rgb: [255, 102, 153] },
  { name: 'Hot Pink', rgb: [255, 105, 180] },
  { name: 'Fuchsia', rgb: [255, 0, 255] },
  { name: 'Magenta', rgb: [208, 0, 111] },
  { name: 'Dusty Rose', rgb: [220, 143, 145] },
  { name: 'Lilac', rgb: [200, 162, 200] },
  { name: 'Lavender', rgb: [230, 230, 250] },
  { name: 'Violet', rgb: [138, 43, 226] },
  { name: 'Purple', rgb: [128, 0, 128] },
  { name: 'Plum', rgb: [142, 69, 133] },
  { name: 'Aubergine', rgb: [59, 9, 39] },
  { name: 'Indigo', rgb: [75, 0, 130] },
  { name: 'Navy Blue', rgb: [0, 0, 128] },
  { name: 'Midnight Blue', rgb: [25, 25, 112] },
  { name: 'Royal Blue', rgb: [65, 105, 225] },
  { name: 'Cobalt Blue', rgb: [0, 71, 171] },
  { name: 'Ocean Blue', rgb: [0, 119, 182] },
  { name: 'Sky Blue', rgb: [135, 206, 235] },
  { name: 'Baby Blue', rgb: [137, 207, 240] },
  { name: 'Powder Blue', rgb: [176, 224, 230] },
  { name: 'Turquoise', rgb: [64, 224, 208] },
  { name: 'Teal', rgb: [0, 128, 128] },
  { name: 'Aqua', rgb: [0, 255, 255] },
  { name: 'Sea Green', rgb: [46, 139, 87] },
  { name: 'Mint Green', rgb: [152, 255, 152] },
  { name: 'Sage Green', rgb: [157, 193, 131] },
  { name: 'Pistachio', rgb: [147, 197, 114] },
  { name: 'Olive Green', rgb: [107, 142, 35] },
  { name: 'Army Green', rgb: [75, 83, 32] },
  { name: 'Forest Green', rgb: [34, 139, 34] },
  { name: 'Emerald Green', rgb: [80, 200, 120] },
  { name: 'Bottle Green', rgb: [9, 58, 30] },
  { name: 'Lime Green', rgb: [50, 205, 50] },
  { name: 'Chartreuse', rgb: [127, 255, 0] },
  { name: 'Mustard Yellow', rgb: [225, 173, 1] },
  { name: 'Golden Yellow', rgb: [255, 215, 0] },
  { name: 'Lemon Yellow', rgb: [254, 241, 96] },
  { name: 'Amber', rgb: [255, 191, 0] },
  { name: 'Orange', rgb: [255, 140, 0] },
  { name: 'Tangerine', rgb: [242, 133, 0] },
];

/**
 * Convert RGB component to 2-digit hex
 */
function componentToHex(c: number): string {
  const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

/**
 * Convert [r, g, b] to hex '#RRGGBB'
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`.toUpperCase();
}

/**
 * Parse hex string into [r, g, b]
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  return null;
}

/**
 * Validate hex code
 */
export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

/**
 * Check if a hex color is light (relative luminance > 175)
 * Useful for ensuring high contrast icons/checkmarks
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  // Perceived luminance formula (ITU-R BT.601)
  const luminance = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return luminance > 175;
}

/**
 * Curated luxury atelier colors for ethnic & contemporary apparel
 */
export const SIGNATURE_ATELIER_PALETTE: Array<{ name: string; hex: string }> = [
  { name: 'Warm Ivory', hex: '#FAF5EE' },
  { name: 'Pure Noir', hex: '#0A0A0A' },
  { name: 'Wine Red', hex: '#722F37' },
  { name: 'Royal Emerald', hex: '#0A5C36' },
  { name: 'Crimson Silk', hex: '#C41E3A' },
  { name: 'Midnight Navy', hex: '#0F1D38' },
  { name: 'Rani Pink', hex: '#E0115F' },
  { name: 'Mustard Gold', hex: '#D4A017' },
  { name: 'Rust Terracotta', hex: '#C35232' },
  { name: 'Sage Mint', hex: '#94A786' },
  { name: 'Royal Plum', hex: '#682860' },
  { name: 'Champagne', hex: '#F7E7CE' },
];

/**
 * Suggest closest human-friendly color name for a given hex code
 */
export function getClosestColorName(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'Custom Color';

  let minDistance = Infinity;
  let closestName = 'Custom Color';

  for (const item of COLOR_DICTIONARY) {
    // Weighted Euclidean distance for human perception
    const rDiff = rgb[0] - item.rgb[0];
    const gDiff = rgb[1] - item.rgb[1];
    const bDiff = rgb[2] - item.rgb[2];

    const distance = 0.3 * (rDiff * rDiff) + 0.59 * (gDiff * gDiff) + 0.11 * (bDiff * bDiff);
    if (distance < minDistance) {
      minDistance = distance;
      closestName = item.name;
    }
  }

  return closestName;
}

/**
 * Web implementation using Color Thief and Canvas
 */
async function extractColorsWeb(imageUri: string, count: number): Promise<string[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      return resolve([]);
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = async () => {
      try {
        const palette = await getPalette(img, { colorCount: count + 2 });
        if (palette && palette.length > 0) {
          const hexes = palette.map((c) => c.hex().toUpperCase());
          resolve(Array.from(new Set(hexes)).slice(0, count));
          return;
        }
      } catch (err) {
        console.log('[ColorThief Web] Canvas extraction fallback:', err);
      }

      // Fallback via manual canvas sampling if getPalette failed due to cross-origin nuance
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve([]);

        const maxDim = 150;
        const scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight, 1);
        canvas.width = Math.max(1, Math.floor(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.floor(img.naturalHeight * scale));

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const quantizer = new MmcqQuantizer();
        await quantizer.init();
        const opts = validateOptions({ colorCount: count + 2 });
        const colors = extractPalette(imgData.data, canvas.width, canvas.height, opts, quantizer, 'srgb');

        if (colors && colors.length > 0) {
          const hexes = colors.map((c) => c.hex().toUpperCase());
          return resolve(Array.from(new Set(hexes)).slice(0, count));
        }
      } catch (canvasErr) {
        console.warn('[ColorThief Web] Direct canvas extraction notice:', canvasErr);
      }
      resolve([]);
    };

    img.onerror = (err) => {
      console.warn('[ColorThief Web] Failed to load image element for extraction:', err);
      resolve([]);
    };

    // If Cloudinary, optimize load size for extraction
    let src = imageUri;
    if (src.includes('cloudinary.com') && src.includes('/upload/')) {
      src = src.replace('/upload/', '/upload/w_200,f_jpg/');
    }
    img.src = src;
  });
}

/**
 * Mobile Native implementation decoding image buffer and quantizing via Color Thief MMCQ
 */
async function extractColorsNative(imageUri: string, count: number): Promise<string[]> {
  try {
    let uint8Data: Uint8Array;

    if (imageUri.startsWith('data:')) {
      const base64Data = imageUri.split(',')[1] || '';
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      uint8Data = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        uint8Data[i] = binaryString.charCodeAt(i);
      }
    } else if (imageUri.startsWith('file://')) {
      const FileSystem = require('expo-file-system');
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType?.Base64 || 'base64',
      });
      const binaryString = atob(base64);
      const len = binaryString.length;
      uint8Data = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        uint8Data[i] = binaryString.charCodeAt(i);
      }
    } else {
      let fetchUrl = imageUri;
      if (imageUri.includes('cloudinary.com') && imageUri.includes('/upload/')) {
        fetchUrl = imageUri.replace('/upload/', '/upload/w_200,f_jpg/');
      }
      const res = await axios.get<ArrayBuffer>(fetchUrl, { responseType: 'arraybuffer' });
      uint8Data = new Uint8Array(res.data);
    }

    if (!uint8Data || uint8Data.length === 0) return [];

    let rgbaData: Uint8Array | null = null;
    let width = 0;
    let height = 0;

    // Check PNG header (0x89, 0x50, 0x4E, 0x47)
    if (uint8Data[0] === 0x89 && uint8Data[1] === 0x50 && uint8Data[2] === 0x4e && uint8Data[3] === 0x47) {
      try {
        const pngImg = UPNG.decode(uint8Data.buffer as ArrayBuffer);
        width = pngImg.width;
        height = pngImg.height;
        const rgbaBuffers = UPNG.toRGBA8(pngImg);
        if (rgbaBuffers && rgbaBuffers.length > 0) {
          rgbaData = new Uint8Array(rgbaBuffers[0]);
        }
      } catch (pngErr) {
        console.log('[ColorThief Native] PNG decode notice:', pngErr);
      }
    }

    // Default or JPEG decode
    if (!rgbaData) {
      try {
        const decoded = (jpeg as any).decode(uint8Data, { useTArray: true });
        if (decoded && decoded.data) {
          rgbaData = decoded.data;
          width = decoded.width;
          height = decoded.height;
        }
      } catch (jpgErr) {
        console.log('[ColorThief Native] JPEG decode notice:', jpgErr);
      }
    }

    if (!rgbaData || width <= 0 || height <= 0) {
      return [];
    }

    const quantizer = new MmcqQuantizer();
    await quantizer.init();
    const opts = validateOptions({ colorCount: count + 2 });
    const colors = extractPalette(rgbaData, width, height, opts, quantizer, 'srgb');

    if (colors && colors.length > 0) {
      const hexes = colors.map((c) => c.hex().toUpperCase());
      return Array.from(new Set(hexes)).slice(0, count);
    }
  } catch (err) {
    console.warn('[ColorThief Native Extraction Notice]:', err);
  }

  return [];
}

/**
 * Universal color extraction function from Cover Image using Color Thief
 * @param imageUri URI of the variant cover image
 * @param count Number of dominant colors to extract (default: 6)
 * @returns Array of uppercase hex color strings (e.g. ['#722F37', '#1E293B', ...])
 */
export async function extractColorsFromCoverImage(imageUri: string, count: number = 6): Promise<string[]> {
  if (!imageUri || typeof imageUri !== 'string' || !imageUri.trim()) {
    return [];
  }

  const cleanUri = imageUri.trim();

  try {
    if (Platform.OS === 'web') {
      const colors = await extractColorsWeb(cleanUri, count);
      if (colors.length > 0) return colors;
      // Fallback to native buffer extraction if web image was blocked
      return await extractColorsNative(cleanUri, count);
    } else {
      return await extractColorsNative(cleanUri, count);
    }
  } catch (err) {
    console.error('[ColorThief extraction failed]:', err);
    return [];
  }
}
