export interface EditorTemplate {
  title: string;
  text: string;
}

export const DEFAULT_TEMPLATES: Record<string, EditorTemplate[]> = {
  fabric: [
    {
      title: 'Chanderi Silk & Zari',
      text: '100% Pure Chanderi Silk with authentic hand-woven Zari borders and breathable cotton lining.',
    },
    {
      title: 'Raw Silk & Zardozi',
      text: 'Pure Raw Silk base featuring master-crafted zardozi needlework and resham thread detailing.',
    },
    {
      title: 'Viscose Georgette & Gota',
      text: 'Premium Viscose Georgette with fine gota patti accents and butter-crepe inner lining.',
    },
    {
      title: 'Handloom Cotton Mulmul',
      text: '100% Breathable Handloom Cotton Mulmul with artisanal Sanganeri hand-block prints and lace edging.',
    },
    {
      title: 'Royal Micro Velvet',
      text: 'Plush Silk-Velvet with metallic tilla embroidery and satin-lined hem borders.',
    },
    {
      title: 'Tissue Organza Silk',
      text: 'Ethereal Sheer Organza Silk with scalloped cutwork and delicate tone-on-tone embroidery.',
    },
    {
      title: 'Banarasi Brocade Silk',
      text: 'Authentic Banarasi Katan Silk woven with intricate gold and silver floral motifs.',
    },
  ],
  fit: [
    {
      title: 'Classic Punjabi Patiala',
      text: 'Straight-cut knee-length kurta paired with traditional heavily pleated Punjabi Patiala salwar.',
    },
    {
      title: 'Straight Cut & Trousers',
      text: 'Relaxed straight silhouette kurta with comfortable side ease and ankle-length tapered cigarette pants.',
    },
    {
      title: 'Flared Anarkali & Churidar',
      text: 'Floor-sweeping 24-kali flared Anarkali silhouette paired with tailored gathers churidar.',
    },
    {
      title: 'Sharara Silhouette',
      text: 'Mid-thigh peplum short kurti paired with voluminous tiered flare georgette sharara.',
    },
    {
      title: 'Pakistani Long Cut',
      text: 'Calf-length relaxed straight kurta with high side slits and tailored straight-cut trousers.',
    },
    {
      title: 'A-Line Cut & Palazzo',
      text: 'Effortless A-line cut with generous inner seam ease paired with wide-leg relaxed palazzos.',
    },
    {
      title: 'Angrakha Wrap Bodice',
      text: 'Asymmetric overlap Angrakha bodice with side tie-up dori paired with narrow dhoti pants.',
    },
  ],
  care: [
    {
      title: 'Dry Clean & Muslin Storage',
      text: 'Strictly dry clean only. Store wrapped in breathable unbleached muslin cloth away from direct sunlight.',
    },
    {
      title: 'Gentle Cold Hand Wash',
      text: 'Gentle hand wash separately in cold water with mild liquid detergent. Do not soak, wring, or bleach. Shade dry flat.',
    },
    {
      title: 'Low Heat Steam Iron',
      text: 'Dry clean recommended. Iron on reverse side on low silk heat or steam iron only to protect metallic zari work.',
    },
    {
      title: 'Velvet Garment Care',
      text: 'Specialist dry clean only. Hang on padded hangers. Never press directly with a hot iron.',
    },
    {
      title: 'Natural Dye Protocol',
      text: 'Dry clean for the first two washes to preserve natural vegetable and artisanal dye depth.',
    },
  ],
  tags: [
    {
      title: 'Bridal & Festive Edit',
      text: 'punjabi suit, wedding edit, bridal trousseau, zari embroidery, festive wear, royal ethnic',
    },
    {
      title: 'Handloom Silk Heritage',
      text: 'pure silk, chanderi silk, handloom, artisanal, bespoke tailoring, heirloom piece',
    },
    {
      title: 'Party & Sangeet Soiree',
      text: 'partywear, sharara set, anarkali, cocktail ethnic, designer suit, sangeet night',
    },
    {
      title: 'Everyday Summer Elegance',
      text: 'cotton mulmul, breathable, summer edit, daily luxury, block print, straight suit',
    },
    {
      title: 'Modern Minimalist',
      text: 'minimalist, subtle luxury, monochrome, quiet luxury, comfort fit, workwear ethnic',
    },
    {
      title: 'Velvet Winter Edit',
      text: 'winter festive, silk velvet, tilla embroidery, royal punjabi, formal luxury',
    },
  ],
  hero: [
    {
      title: 'Artisanal Silk Splendor',
      text: 'Handcrafted with pure chanderi silk and bespoke embroidery, celebrating royal silhouettes designed for effortless modern ease.',
    },
    {
      title: 'Timeless Festive Grace',
      text: 'Exquisite heirloom weaves with delicate zari borders, tailored to flow with supreme sophistication across celebratory evenings.',
    },
    {
      title: 'Royal Bespoke Tailoring',
      text: 'Mastercrafted ensembles tailored to your exact measurements by master artisans, complemented by private concierge service.',
    },
  ],
  adBanner: [
    {
      title: 'The Art of Custom Drape',
      text: 'Experience the pinnacle of bespoke couture. Our master craftsmen tailor each ensemble to your exact measurements, ensuring a silhouette that flows with effortless grace and timeless sophistication.',
    },
    {
      title: 'Private Atelier Heritage',
      text: 'From hand-picked silk weaves to tailored precision, our atelier creates one-of-a-kind heirlooms designed to be treasured for generations.',
    },
    {
      title: 'Bespoke Concierge Fittings',
      text: 'Enjoy an exclusive bespoke fitting session with our couture specialists, meticulously crafted to celebrate your individual poise.',
    },
  ],
  sale: [
    {
      title: 'Limited Festive Edit',
      text: 'Enjoy up to 70% off on curated traditional designs and ready-to-wear silk co-ords. Handcrafted pieces in limited quantities.',
    },
    {
      title: 'Seasonal Archive Privilege',
      text: 'A rare archival collection offered with complimentary bespoke fitting adjustments for a limited duration.',
    },
  ],
  faq: [
    {
      title: 'WhatsApp Concierge Confirmation',
      text: 'Our concierge team actively connects with each bespoke customer via WhatsApp or email to verify all measurements before cutting.',
    },
    {
      title: 'Custom Stitching Options',
      text: 'Select your desired garment and size. You can input custom proportions during standard checkout or request tailored fitting.',
    },
    {
      title: 'Pure Silk Care Instructions',
      text: 'Dry clean only. We recommend storing pure silk ensembles wrapped in breathable muslin bags in a cool, dry closet.',
    },
  ],
  contact: [
    {
      title: 'Flagship Atelier Address',
      text: 'JB51 Clothing House, Model Town, Ludhiana, Punjab 141002, India. Private styling appointments and bespoke bridal consultations available.',
    },
  ],
  product: [
    {
      title: 'Heirloom Craftsmanship',
      text: 'Crafted from pure hand-spun silk with authentic zardozi embroidery, lined with ultra-soft breathable fabric for day-to-night luxury.',
    },
    {
      title: 'Contemporary Royal Fusion',
      text: 'A contemporary fusion of royal Punjabi aesthetics with clean minimalist lines, personalized drape, and refined artisan detailing.',
    },
  ],
};

