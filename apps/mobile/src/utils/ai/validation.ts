import { ProductAiInput, MissingFieldInfo } from './types';

/**
 * Checks for missing or sparse product information needed for authentic AI generation.
 */
export const getMissingProductInfo = (input: ProductAiInput): MissingFieldInfo[] => {
  const missing: MissingFieldInfo[] = [];

  if (!input.name || input.name.trim().length < 3) {
    missing.push({
      field: 'name',
      label: 'Garment Name',
      tip: 'e.g. Royal Chanderi Silk Punjabi Suit',
      presets: [
        'Palace Silk Kurta Set',
        'Heritage Patiala Salwar Suit',
        'Zari Embroidered Anarkali',
        'Royal Velvet Festive Suit',
      ],
    });
  }

  if (!input.fabric || input.fabric.trim().length < 3) {
    missing.push({
      field: 'fabric',
      label: 'Fabric Details',
      tip: 'e.g. Pure Chanderi Silk with Zari borders',
      presets: [
        '100% Pure Chanderi Silk with Zari border',
        'Flowing Georgette with Resham threadwork',
        'Pure Raw Silk with Hand-embroidery',
        'Lightweight Handloom Cotton Mulmul',
        'Lustrous Velvet with Zardozi Work',
      ],
    });
  }

  if (!input.fit || input.fit.trim().length < 3) {
    missing.push({
      field: 'fit',
      label: 'Fit & Silhouette',
      tip: 'e.g. Straight Silhouette with Punjabi Patiala salwar',
      presets: [
        'Straight Cut Kurta with Pleated Patiala Salwar',
        'Comfort Straight Fit with Narrow Trouser Pants',
        'Flared Anarkali Silhouette with Churidar',
        'Relaxed Ethnic Cut with Wide-Leg Sharara',
      ],
    });
  }

  if (
    (!input.variantColor || input.variantColor.trim().length < 2) &&
    (!input.variantHex || input.variantHex.trim().length < 3)
  ) {
    missing.push({
      field: 'variantColor',
      label: 'Color / Shade',
      tip: 'e.g. Rani Pink, Royal Navy, Mustard Yellow',
      presets: [
        'Rani Pink',
        'Royal Navy Blue',
        'Mustard Gold',
        'Emerald Green',
        'Deep Wine / Maroon',
        'Ivory Cream',
      ],
    });
  }

  if (!input.description || input.description.trim().length < 20) {
    missing.push({
      field: 'description',
      label: 'Key Motifs & Highlights',
      tip: 'e.g. Hand-embroidered neckline, scalloped organza dupatta',
      presets: [
        'Intricate zardozi neckline with scalloped dupatta border',
        'Delicate gota patti work with artisanal border piping',
        'Traditional Kashmiri resham embroidery with zari motifs',
        'Minimalist metallic threadwork with modern clean hem',
      ],
    });
  }

  return missing;
};

