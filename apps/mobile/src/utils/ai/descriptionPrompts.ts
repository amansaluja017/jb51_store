import { ProductAiInput, AiDescriptionItem, cleanText } from './types';
import { countWords } from '../text';

/**
 * Generates 5 distinct high-converting luxury editorial descriptions (100+ words)
 * and an external AI Copywriting Prompt based on product information.
 */
export const generateDescriptions = (
  input: ProductAiInput
): {
  items: AiDescriptionItem[];
  masterAiPrompt: string;
} => {
  const name = cleanText(input.name) || 'Handcrafted Luxury Punjabi Suit';
  const category = cleanText(input.category) || 'Punjabi Suit';
  const fabric = cleanText(input.fabric) || 'Pure Chanderi Silk with artisanal Zari border';
  const fit = cleanText(input.fit) || 'Straight silhouette with authentic comfort ease';
  const color = cleanText(input.variantColor) || 'signature heritage shade';
  const care = cleanText(input.careInstructions) || 'Dry clean only to maintain fabric luster';
  const desc =
    cleanText(input.description) ||
    'Intricate hand-embroidery adorning the neckline, refined sleeve detailing, and a coordinating scalloped dupatta';
  const tags = cleanText(input.tags) || 'handloom, festive, wedding, bespoke';

  // Description 1: Heritage Artisan Narrative (105+ words)
  const desc1 = `Crafted from exquisite ${fabric}, the ${name} is a majestic celebration of authentic Indian textile heritage and generational artisan craftsmanship. Featuring an impeccably tailored ${fit}, this regal ensemble is adorned with ${desc}, capturing the aristocratic grace of traditional Punjabi royalty. The textile flows with a luminous, natural drape, complemented by a coordinating dupatta designed to frame the silhouette with effortless poise. Built to the highest standards of bespoke tailoring, generous inner seam allowances ensure an individualized fit that never compromises comfort. Ideal for intimate morning festivities or grand celebratory evenings, this heirloom piece honors timeless beauty with enduring quality.`;

  // Description 2: Modern Festive Elegance & Event Styling (105+ words)
  const desc2 = `Step into effortless celebration with the ${name}, rendered in a luminous ${color} palette on supreme ${fabric}. Engineered with a contemporary ${fit}, this ensemble strikes a harmonious balance between opulent cultural splendor and lightweight, breathable comfort. Elaborate artistry cascades across the bodice, highlighted by ${desc} that catches ambient light with understated sophistication. Style this versatile masterpiece with antique polki chaandbalis, embroidered velvet juttis, and a neat floral bun for weddings, sangeet ceremonies, or milestone festivities. Designed for the modern connoisseur, it guarantees all-day ease and unforgettable grace from the first photograph to the final farewell.`;

  // Description 3: Bespoke Luxury & Technical Fit Guide (105+ words)
  const desc3 = `The ${name} is meticulously engineered with our signature ${fit}, sculpted to offer both flattering structural contours and unhindered movement throughout the day. Fabricated from supreme-grade ${fabric}, the cloth provides an exceptionally soft handfeel, excellent tensile resilience, and natural breathability. Generous 1.5-inch inner seam margins allow effortless custom adjustments, ensuring a truly personalized silhouette for every body type. The matching bottom and lightweight dupatta are proportioned with architectural balance to distribute garment weight evenly. Maintain the magnificent color depth and fine stitch integrity by following recommended care protocols (${care}) for lifelong luxury wear.`;

  // Description 4: Sensory Poetic Lookbook Narrative (105+ words)
  const desc4 = `An ode to quiet opulence, the ${name} captivates with its tactile richness and luminous ${color} glow. Tailored from hand-selected ${fabric}, the garment whispers understated elegance with every step, responding naturally to light and movement. The flowing lines of the ${fit} drape gracefully against the body, evoking a serene sense of poise, nostalgia, and regal self-possession. Artfully embellished with ${desc}, the design speaks of ancestral craftsmanship without ever feeling heavy or ostentatious. Whether cherished as a treasured keepsake or worn during precious family rituals, this suit wraps you in radiant sophistication and enduring confidence.`;

  // Description 5: Structured E-Commerce Specification Narration (105+ words)
  const desc5 = `Elevate your bespoke ethnic repertoire with the ${name}, a signature boutique ensemble tailored in an impeccable ${fit}. Woven from authentic ${fabric}, this suit combines ancestral craftsmanship with modern wearable comfort.
• Bodice & Neckline: Artfully embellished with ${desc}.
• Silhouette: Signature ${fit} engineered with breathable ease and fluid movement.
• Fabric Integrity: Premium ${fabric} delivering vibrant color retention and a soft handfeel.
• Tailoring Standard: Generous inner seam allowances for bespoke micro-adjustments.
• Occasion Versatility: Ideal for festive celebrations, weddings, and formal ethnic occasions.
Preserve the delicate handiwork with recommended care (${care}) for generations of graceful wear.`;

  const masterAiPrompt = `Act as an elite Indian luxury fashion editor and boutique copywriter for JB51 Luxury Heritage Boutique.
Write a compelling, evocative, and SEO-optimized e-commerce product description for a premium women's Punjabi suit with the following specifications:
- Garment Name: ${name}
- Category: ${category}
- Fabric & Material: ${fabric}
- Fit & Silhouette: ${fit}
- Color / Tone: ${color}
- Embroidery & Detailing: ${desc}
- Recommended Care: ${care}
- Tags & Keywords: ${tags}

CRITICAL COPYWRITING REQUIREMENTS:
1. Minimum length: 110–135 words (strictly not less than 100 words).
2. Tone: Aristocratic, evocative, refined, and authentic (similar to Sabyasachi, Good Earth, Raw Mango).
3. Emphasize handloom textile integrity, silhouette comfort ease, bespoke inner seam margins, and styling versatility.
4. Avoid generic marketing clichés like "must-have" or "revolutionize your wardrobe".
5. Provide a cohesive narrative that inspires deep customer confidence and justifies luxury value.`;

  return {
    items: [
      {
        id: 'desc-1',
        title: 'Heritage Artisan Narrative',
        badge: 'MOST POPULAR',
        styleName: 'Regal Heritage & Craftsmanship Story',
        descriptionText: desc1,
        wordCount: countWords(desc1),
        highlightPoints: [
          'Ancestral textile history',
          'Luminous natural drape',
          'Bespoke seam margins',
          'Heirloom longevity',
        ],
        aiPromptUsed: masterAiPrompt,
      },
      {
        id: 'desc-2',
        title: 'Modern Festive Elegance',
        badge: 'EVENT STYLING',
        styleName: 'Contemporary Celebration & Styling Guide',
        descriptionText: desc2,
        wordCount: countWords(desc2),
        highlightPoints: [
          'Celebratory occasion focus',
          'Jewelry & jutti styling pairings',
          'Lightweight all-day comfort',
          'Festive wedding versatility',
        ],
        aiPromptUsed: masterAiPrompt,
      },
      {
        id: 'desc-3',
        title: 'Bespoke Luxury & Fit Guide',
        badge: 'FIT & SPECS',
        styleName: 'Technical Tailoring & Silhouette Contours',
        descriptionText: desc3,
        wordCount: countWords(desc3),
        highlightPoints: [
          '1.5-inch inner seam margin callout',
          'Anatomical ease & contouring',
          'Fabric tensile strength',
          'Care protocol reminder',
        ],
        aiPromptUsed: masterAiPrompt,
      },
      {
        id: 'desc-4',
        title: 'Sensory Poetic Lookbook',
        badge: 'QUIET LUXURY',
        styleName: 'Evocative Tactile & Sensory Prose',
        descriptionText: desc4,
        wordCount: countWords(desc4),
        highlightPoints: [
          'Tactile fabric texture',
          'Understated quiet luxury',
          'Emotional heirloom resonance',
          'Graceful fluid motion',
        ],
        aiPromptUsed: masterAiPrompt,
      },
      {
        id: 'desc-5',
        title: 'Structured E-Commerce Specs',
        badge: 'CONVERSION COPY',
        styleName: 'Bullet-Pointed Editorial Highlights',
        descriptionText: desc5,
        wordCount: countWords(desc5),
        highlightPoints: [
          'Bullet-pointed visual breakdown',
          'Neckline & bodice focus',
          'High conversion clarity',
          'Wearable everyday luxury',
        ],
        aiPromptUsed: masterAiPrompt,
      },
    ],
    masterAiPrompt,
  };
};

