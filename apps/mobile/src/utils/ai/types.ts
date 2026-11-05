/**
 * Type definitions for AI Studio generation in JB51 Mobile
 */

export interface ProductAiInput {
  name?: string;
  category?: string;
  fabric?: string;
  fit?: string;
  careInstructions?: string;
  tags?: string;
  description?: string;
  variantColor?: string;
  variantHex?: string;
  mrp?: string;
  sellingPrice?: string;
  referenceImageUrl?: string;
  referenceImages?: string[];
}

export interface MissingFieldInfo {
  field: 'name' | 'fabric' | 'fit' | 'variantColor' | 'description';
  label: string;
  tip: string;
  presets: string[];
}

export interface AiImagePromptItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  cameraSpecs: string;
  lightingSetup: string;
  promptText: string;
  negativePrompt: string;
  recommendedAspect: string;
  midjourneyCommand?: string;
}

export interface AiDescriptionItem {
  id: string;
  title: string;
  badge: string;
  styleName: string;
  descriptionText: string;
  wordCount: number;
  highlightPoints: string[];
  aiPromptUsed: string;
}

/**
 * Cleans HTML markup, extra whitespaces and special entities for AI prompting.
 */
export const cleanText = (raw?: string | null): string => {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

