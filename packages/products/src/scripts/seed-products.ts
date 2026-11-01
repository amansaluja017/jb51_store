import { createProduct, getProductBySlug } from '../data.js';
import { countWords } from '../services/validations.js';

interface SeedProductItem {
  name: string;
  slug: string;
  category: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  fabric: string;
  fit: string;
  careInstructions: string;
  bestseller: boolean;
  featured: boolean;
  newArrival: boolean;
  tags: string[];
  images: string[];
  variants: Array<{
    color: string;
    hexCode: string;
    stock: number;
    reservedStock?: number;
    images?: string[];
  }>;
}

const PRODUCTS_SEED_DATA: SeedProductItem[] = [
  // ==================== 1. ANARKALI SUITS ====================
  {
    name: 'Noor Jahan Zardozi Anarkali',
    slug: 'noor-jahan-zardozi-anarkali',
    category: 'Anarkali Suits',
    description: `A tribute to regal Mughal craftsmanship, the Noor Jahan Zardozi Anarkali is meticulously tailored from pure Chanderi silk. It features opulent dabka, sitara, and antique gold zardozi threadwork gracing the yoke, hemline, and sleeve cuffs. Designed with an expansive 28-kali flared silhouette that flows gracefully with every movement, this majestic ensemble comes complete with matching churidar pants and a featherlight hand-woven organza dupatta bordered in scalloped gold zari lace. Ideal for grand wedding celebrations, royal sangeet nights, and festive galas. Style with antique polki earrings, statement chaandbaalis, and metallic embroidered juttis to complete a breathtaking bespoke occasion look.`,
    mrp: 24999,
    sellingPrice: 19999,
    fabric: 'Pure Chanderi Silk & Organza Dupatta',
    fit: 'Flared Kalidar Fit',
    careInstructions: 'Dry clean only. Store wrapped in pure muslin cloth in a cool, dry place. Avoid direct sunlight.',
    bestseller: true,
    featured: true,
    newArrival: true,
    tags: ['Anarkali', 'Zardozi', 'Royal', 'Wedding', 'Bestseller', 'Handcrafted', 'Festive'],
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Royal Ivory', hexCode: '#FDFBF7', stock: 12 },
      { color: 'Vintage Rose', hexCode: '#C08081', stock: 8 },
      { color: 'Deep Garnet', hexCode: '#731728', stock: 6 },
    ],
  },
  {
    name: 'Gulmohar Pure Chanderi Anarkali Set',
    slug: 'gulmohar-pure-chanderi-anarkali-set',
    category: 'Anarkali Suits',
    description: `Embrace timeless grace with the Gulmohar Chanderi Anarkali Set, inspired by vibrant heritage flora. Spun from authentic Chanderi silk with subtle metallic woven undertones, this ensemble showcases delicate thread zari motifs, a notched mandarin neckline, and intricately embellished full-length sleeves. The sweeping kalidar skirt delivers a comfortable yet statuesque drape, accompanied by tailored straight-cut trousers and a matching printed silk dupatta with fringe tassel accents. Whether attending daytime pre-wedding rituals, haldi ceremonies, or festive family soirees, this creation effortlessly commands attention. Pair with kundan studs and soft dewy makeup for classic bespoke poise.`,
    mrp: 18999,
    sellingPrice: 14999,
    fabric: 'Chanderi Silk with Cotton Lining',
    fit: 'Flared A-Line',
    careInstructions: 'Strictly dry clean only. Steam iron on reverse at moderate temperature.',
    bestseller: false,
    featured: true,
    newArrival: true,
    tags: ['Anarkali', 'Chanderi', 'Daywear', 'Pastels', 'Heritage', 'Featured'],
    images: [
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1620386875077-e322fb810928?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Peach Coral', hexCode: '#F88379', stock: 15 },
      { color: 'Mint Sage', hexCode: '#987554', stock: 10 },
    ],
  },
  {
    name: 'Chandni Raat Ivory Anarkali Ensemble',
    slug: 'chandni-raat-ivory-anarkali-ensemble',
    category: 'Anarkali Suits',
    description: `An ode to celestial moonlight, the Chandni Raat Ivory Anarkali Ensemble is spun in ethereal lightweight organza and silk tissue. Embellished with delicate tonal mukaish specks, shimmering silver gota patti borders, and mother-of-pearl sequin accents across the neckline and cuffs. The layered silhouette produces a voluminous fairytale movement, anchored by a santoon inner slip and matching tapered trousers. The ensemble is framed by an ornate sheer dupatta trimmed in hand-crocheted mirror work. A quintessential bridal trousseau or reception piece that balances opulent tradition with contemporary feminine minimalism. Wear with heirloom diamonds or silver filigree jewellery.`,
    mrp: 27999,
    sellingPrice: 21999,
    fabric: 'Silk Tissue & Lightweight Organza',
    fit: 'Layered Kalidar Fit',
    careInstructions: 'Professional dry cleaning recommended. Do not wring or tumble dry.',
    bestseller: true,
    featured: true,
    newArrival: false,
    tags: ['Ivory', 'Mukaish', 'Bridal', 'Reception', 'Bestseller', 'Featured'],
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Pearl Ivory', hexCode: '#FDFBF7', stock: 7 },
      { color: 'Champagne Gold', hexCode: '#F7E7CE', stock: 5 },
    ],
  },
  {
    name: 'Zafira Royal Silk Anarkali',
    slug: 'zafira-royal-silk-anarkali',
    category: 'Anarkali Suits',
    description: `Indulge in royal sophistication with the Zafira Anarkali, crafted in luminous jewel-toned pure spun silk. The deep bodice is decorated with hand-knotted resham thread embroidery and delicate cutdana beadwork around a flattering sweet-heart neckline. Flowing into 24 panels that taper into an expansive swirling hemline finished with antique gold patti, the ensemble pairs with tone-on-tone stretch churidar pants and a contrast Banarasi tissue dupatta. Designed for evening receptions, Diwali festivities, and milestone cultural ceremonies. Style with traditional maang tikka, uncut emerald jewels, and velvet block heels for an unmissable entrance.`,
    mrp: 22499,
    sellingPrice: 17999,
    fabric: 'Spun Silk with Butter Crepe Lining',
    fit: 'Sculpted Bodice with Flared Hem',
    careInstructions: 'Dry clean only. Press with cool iron on reverse side under protective cloth.',
    bestseller: true,
    featured: false,
    newArrival: false,
    tags: ['Silk', 'JewelTone', 'Resham', 'Royal', 'Bestseller', 'Anarkali'],
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Midnight Sapphire', hexCode: '#0F2537', stock: 14 },
      { color: 'Emerald Jade', hexCode: '#004B23', stock: 11 },
    ],
  },
  {
    name: 'Mehrunisa Organza Kalidar Anarkali',
    slug: 'mehrunisa-organza-kalidar-anarkali',
    category: 'Anarkali Suits',
    description: `A symphony of sheer elegance and pastel charm, the Mehrunisa Kalidar Anarkali is spun in gossamer organza fabric tinted in soothing blush shades. The torso is lined in butter-soft mulberry silk and elevated by intricate dabka and pearl embroidery outlining the jewel collar. Every kali features delicate vertical tilla motifs that visually elongate the silhouette, culminating in a hand-cut scalloped border. Paired with a fluid silk bottom and an ombré organza dupatta with hand-sewn pearl tassels. Perfect for summer weddings, mehendi ceremonies, and high-tea festive gatherings. Pair with statement pearls and nude stilettos.`,
    mrp: 19999,
    sellingPrice: 15499,
    fabric: 'Organza & Pure Mulberry Silk Lining',
    fit: 'Flared Kalidar',
    careInstructions: 'Gentle dry clean only. Store flat in garment bag away from dampness.',
    bestseller: false,
    featured: false,
    newArrival: true,
    tags: ['Organza', 'Pastels', 'SummerWedding', 'Mehendi', 'NewArrival'],
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Blush Powder', hexCode: '#F8C8DC', stock: 9 },
      { color: 'Lilac Haze', hexCode: '#C8A2C8', stock: 8 },
    ],
  },
  {
    name: 'Ruhaniyat Velvet Tiered Anarkali',
    slug: 'ruhaniyat-velvet-tiered-anarkali',
    category: 'Anarkali Suits',
    description: `Exuding majestic winter grandeur, the Ruhaniyat Velvet Tiered Anarkali pairs heavyweight micro-velvet with sheer organza tier accents. The plush velvet bodice is encrusted with antique copper tilla work, micro-sequins, and intricately bordered sleeve hems. The lower panels cascade into a rich multi-tiered flare that strikes a stately silhouette in evening lighting. Accompanied by matching stretch velvet churidar pants and a rich Banarasi organza woven dupatta. Tailored specifically for winter wedding dinners, royal receptions, and formal galas. Complement the rich texture with antique gold choker necklaces and sleek bun hairstyles.`,
    mrp: 29999,
    sellingPrice: 23999,
    fabric: 'Plush Micro-Velvet & Banarasi Organza',
    fit: 'Tiered Regal Flare',
    careInstructions: 'Specialist dry clean only. Never iron directly on pile surface; steam only.',
    bestseller: false,
    featured: true,
    newArrival: false,
    tags: ['Velvet', 'WinterWedding', 'Royal', 'Featured', 'Opulent'],
    images: [
      'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Wine Burgundy', hexCode: '#4A0E17', stock: 6 },
      { color: 'Midnight Black', hexCode: '#1A1A1A', stock: 8 },
    ],
  },

  // ==================== 2. SILK CO-ORDS ====================
  {
    name: 'Maya Raw Silk Festive Co-ord Set',
    slug: 'maya-raw-silk-festive-co-ord-set',
    category: 'Silk Co-ords',
    description: `A masterclass in modern festive tailoring, the Maya Raw Silk Co-ord Set unites heritage luxury with sharp contemporary proportions. Spun from pure textured raw silk, the tunic features a structural notched lapel, concealed placket, and subtle tone-on-tone hand-embroidered resham motifs along the shoulder line and cuffs. Paired with wide-legged tailored silk palazzo trousers featuring a comfortable elasticated back and deep side pockets. A versatile ensemble crafted for discerning patrons seeking effortless elegance at cocktail evenings, art galas, and festive brunches. Style with minimal geometric gold cuffs and pointed leather mules.`,
    mrp: 14999,
    sellingPrice: 11999,
    fabric: 'Pure Textured Raw Silk',
    fit: 'Relaxed Tailored Fit',
    careInstructions: 'Dry clean only. Iron inside out on medium silk setting.',
    bestseller: true,
    featured: false,
    newArrival: true,
    tags: ['Co-ord', 'RawSilk', 'ModernEthnic', 'Bestseller', 'CocktailWear'],
    images: [
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Ochre Mustard', hexCode: '#C88A24', stock: 16 },
      { color: 'Olive Ochre', hexCode: '#556B2F', stock: 12 },
    ],
  },
  {
    name: 'Jasmine Tussar Silk Tailored Co-ord',
    slug: 'jasmine-tussar-silk-tailored-co-ord',
    category: 'Silk Co-ords',
    description: `The Jasmine Co-ord Set celebrates the rustic opulence of wild Tussar silk, known for its breathable natural slub texture and golden sheen. Tailored with clean asymmetric tunic lines, side slits, and a neat band collar adorned with mother-of-pearl buttons. The matching cropped cigarette trousers feature a refined ankle-length silhouette that balances the tunic's fluid drape. Highly favored for daytime intimate festivities, pooja ceremonies, and high-profile corporate celebratory gatherings. Complete your refined look with antique silver jhumkas, a textured metallic potli bag, and open-toe block heel sandals.`,
    mrp: 16499,
    sellingPrice: 12999,
    fabric: 'Wild Handloom Tussar Silk',
    fit: 'Asymmetric Tailored Cut',
    careInstructions: 'Dry clean only. Keep stored in breathable cotton covers away from humidity.',
    bestseller: false,
    featured: true,
    newArrival: false,
    tags: ['TussarSilk', 'Handloom', 'Tailored', 'Featured', 'Minimalist'],
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Natural Tussar Beige', hexCode: '#E3C19B', stock: 10 },
      { color: 'Dusty Teal', hexCode: '#4E7982', stock: 9 },
    ],
  },
  {
    name: 'Sitara Mulberry Silk Peplum Co-ord',
    slug: 'sitara-mulberry-silk-peplum-co-ord',
    category: 'Silk Co-ords',
    description: `Chic, flattering, and radiant, the Sitara Peplum Co-ord Set is cut from premium lustrous mulberry silk. The top features a gently cinched waist that flares out into an elegant peplum silhouette, adorned with delicate micro-pearl embroidery and gold thread pipings along the V-neck. Accompanied by high-waisted fluid silk cigarette pants engineered for sublime comfort and effortless mobility. Whether hosting an intimate dinner party or attending an upscale festive reception, this co-ord offers an elevated alternative to traditional silhouettes. Pair with chandelier earrings and metallic strappy heels.`,
    mrp: 17999,
    sellingPrice: 13999,
    fabric: '100% Pure Mulberry Silk',
    fit: 'Cinched Peplum Fit',
    careInstructions: 'Dry clean only. Do not bleach or spray perfume directly onto fabric.',
    bestseller: false,
    featured: false,
    newArrival: true,
    tags: ['MulberrySilk', 'Peplum', 'FestiveCo-ord', 'Contemporary', 'NewArrival'],
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Amethyst Violet', hexCode: '#6A2E5B', stock: 11 },
      { color: 'Warm Rosewood', hexCode: '#8B4852', stock: 7 },
    ],
  },
  {
    name: 'Niloufer Pure Crepe Silk Tunic & Trouser',
    slug: 'niloufer-pure-crepe-silk-tunic-trouser',
    category: 'Silk Co-ords',
    description: `Understated glamour meets supreme artisanal draping in the Niloufer Crepe Silk Co-ord. Spun from heavy pure silk crepe that falls like liquid grace, the longline tunic is cut with relaxed dolman sleeves and subtle gold thread zari top-stitching along the cuffs and neckline. The co-ord is grounded by matching wide palazzo trousers tailored with an immaculate waistband and generous movement. An absolute wardrobe staple for festive travel, evening dinners, and celebratory functions. Style with an oversized kundan ring, sleek blowout hair, and minimal gold hoops for effortless elegance.`,
    mrp: 15999,
    sellingPrice: 12499,
    fabric: 'Heavyweight Pure Silk Crepe',
    fit: 'Flowing Relaxed Fit',
    careInstructions: 'Professional dry clean only. Steam iron lightly.',
    bestseller: true,
    featured: true,
    newArrival: false,
    tags: ['CrepeSilk', 'Bestseller', 'Featured', 'LuxuryBasics', 'Fluid'],
    images: [
      'https://images.unsplash.com/photo-1620386875077-e322fb810928?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Persian Blue', hexCode: '#1C39BB', stock: 13 },
      { color: 'Burnt Ochre', hexCode: '#983D17', stock: 10 },
    ],
  },
  {
    name: 'Avani Handwoven Matka Silk Co-ord Set',
    slug: 'avani-handwoven-matka-silk-co-ord-set',
    category: 'Silk Co-ords',
    description: `A tribute to indigenous handloom weavers, the Avani Co-ord Set is handcrafted from structured Matka silk in earthy mineral tones. The boxy tunic silhouette features a minimalist band collar, horn buttons, and delicate kantha embroidery running along the front panel. It pairs with relaxed cropped culotte trousers engineered for all-day festive comfort. Lightweight yet structured, this artisanal ensemble speaks volumes of refined conscious luxury and authentic Indian handcraft heritage. Complement with brass handmade jewellery, leather Kolhapuris, and a structured raw silk tote.`,
    mrp: 13999,
    sellingPrice: 10999,
    fabric: 'Handwoven Matka Silk',
    fit: 'Boxy Relaxed Tunic & Culottes',
    careInstructions: 'Dry clean only. Preserve in cloth storage bag.',
    bestseller: false,
    featured: false,
    newArrival: true,
    tags: ['MatkaSilk', 'Handloom', 'KanthaWork', 'SustainableLuxury'],
    images: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Terracotta Sand', hexCode: '#C86D51', stock: 14 },
      { color: 'Forest Lichen', hexCode: '#6B7A58', stock: 8 },
    ],
  },

  // ==================== 3. VELVET EDIT ====================
  {
    name: 'Shahi Dastaan Crimson Velvet Kurta Set',
    slug: 'shahi-dastaan-crimson-velvet-kurta-set',
    category: 'Velvet Edit',
    description: `The pinnacle of royal winter couture, Shahi Dastaan is sculpted from ultra-plush velvet in deep crimson red. The straight-cut long kurta is embroidered with hand-sewn metallic gold marodi and zardozi borders framing the sweetheart neckline, sleeve hems, and side vents. Accompanied by matching velvet pants with delicate cuff embellishments and an exquisite pure organza dupatta finished in hand-worked Kiran tassels. Designed to command awe at winter nuptials, royal sangeet nights, and lavish dinners. Elevate with antique jadau polki chokers, deep berry lips, and velvet mojris for an iconic regal presence.`,
    mrp: 26999,
    sellingPrice: 20999,
    fabric: 'Premium Dense Micro-Velvet & Tissue Organza',
    fit: 'Straight Tailored Cut',
    careInstructions: 'Specialized dry clean only. Do not iron directly on velvet pile. Store on padded hangers.',
    bestseller: true,
    featured: true,
    newArrival: false,
    tags: ['Velvet', 'Zardozi', 'WinterCouture', 'Royal', 'Bestseller', 'Featured'],
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Crimson Scarlet', hexCode: '#8B0000', stock: 12 },
      { color: 'Deep Plum Wine', hexCode: '#481F3D', stock: 9 },
    ],
  },
  {
    name: 'Firdaus Emerald Green Velvet Suit',
    slug: 'firdaus-emerald-green-velvet-suit',
    category: 'Velvet Edit',
    description: `Experience the intoxicating allure of deep emerald green with the Firdaus Velvet Suit. Tailored from lustrous silk-blend velvet that catches the light with magnificent richness, this piece boasts intricate Kashmiri tilla embroidery along the neckline, hemlines, and sleeve cuffs. Designed with flattering vertical side panels that slim the torso, the ensemble pairs with tone-on-tone velvet cigarette trousers and a lightweight sheer silk dupatta bordered in scalloped gold zari. An unforgettable statement outfit for nocturnal festivities and wedding receptions. Style with emerald droplet earrings and a metallic box clutch.`,
    mrp: 25499,
    sellingPrice: 19999,
    fabric: 'Silk-Blend Micro-Velvet',
    fit: 'Tailored Straight Fit',
    careInstructions: 'Strictly dry clean only. Steam gently from the reverse side.',
    bestseller: false,
    featured: true,
    newArrival: true,
    tags: ['Velvet', 'EmeraldGreen', 'TillaWork', 'Featured', 'NewArrival'],
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Emerald Green', hexCode: '#004B23', stock: 15 },
      { color: 'Dark Olive Velvet', hexCode: '#3B443B', stock: 8 },
    ],
  },
  {
    name: 'Kohinoor Midnight Navy Velvet Ensemble',
    slug: 'kohinoor-midnight-navy-velvet-ensemble',
    category: 'Velvet Edit',
    description: `Evoking the mysterious depths of an Arabian night sky, the Kohinoor Velvet Ensemble is cut from ultra-fine velvet in striking midnight navy. It showcases elaborate silver dabka, cutdana, and micro-pearl embroidery across a sophisticated split-mandarin neckline and sleeve borders. The elongated kurta is paired with matching tailored velvet trousers and a celestial silver tissue dupatta trimmed with delicate sitara tassels. Engineered for crisp winter soirees, cocktail evenings, and celebratory dinners. Pair with chandelier diamond earrings, silver metallic pumps, and a neat bun for peerless majesty.`,
    mrp: 24499,
    sellingPrice: 18999,
    fabric: 'Fine Density Velvet & Lurex Tissue',
    fit: 'Structured Straight Kurta',
    careInstructions: 'Dry clean only. Keep wrapped in muslin to preserve embroidery lustre.',
    bestseller: false,
    featured: false,
    newArrival: true,
    tags: ['MidnightNavy', 'SilverDabka', 'Velvet', 'Cocktail', 'WinterFestive'],
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1620386875077-e322fb810928?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Midnight Navy', hexCode: '#001F3F', stock: 11 },
      { color: 'Royal Indigo', hexCode: '#2E1A47', stock: 6 },
    ],
  },
  {
    name: 'Nazm Deep Plum Embroidered Velvet Suit',
    slug: 'nazm-deep-plum-embroidered-velvet-suit',
    category: 'Velvet Edit',
    description: `A poetic celebration of artisanal embroidery, the Nazm Velvet Suit is bathed in rich aubergine plum hues. Featuring handcrafted rose-gold and antique copper zari embroidery woven in geometric floral vines across the front placket, sleeve borders, and hem. The kurta features deep side slits for fluid movement, accompanied by straight-leg velvet trousers with embroidered cuffs and a luxurious contrasting organza dupatta in muted rose gold. A quintessential ensemble for mother of the bride or bespoke winter nuptials. Pair with vintage polki jewellery and copper-toned footwear.`,
    mrp: 23999,
    sellingPrice: 18499,
    fabric: 'Micro-Velvet with Crepe Silk Lining',
    fit: 'Classic Straight Cut',
    careInstructions: 'Professional dry cleaning only. Store on sturdy padded hangers.',
    bestseller: true,
    featured: false,
    newArrival: false,
    tags: ['PlumVelvet', 'RoseGoldZari', 'Bestseller', 'WinterNuptials'],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Aubergine Plum', hexCode: '#3D1C2E', stock: 10 },
      { color: 'Black Cherry', hexCode: '#38040E', stock: 7 },
    ],
  },
  {
    name: 'Mumtaz Ruby Velvet Festive Gharara Set',
    slug: 'mumtaz-ruby-velvet-festive-gharara-set',
    category: 'Velvet Edit',
    description: `Designed for moments of royal grandeur, the Mumtaz Festive Gharara Set pairs a short, sculpted velvet tunic with a dramatic flared velvet gharara. Hand-embroidered with intricate gota patti, dabka, and zardozi borders at the ruched knee band and sweeping hemline. Accompanied by a heavy Banarasi tissue silk dupatta framed by hand-knotted gold fringing. The rich ruby hue radiates festive cheer and regal distinction under celebratory chandeliers. Perfect for qawwali nights, nikah ceremonies, and major winter wedding festivities. Finish with traditional jhumkis, side jhoomar, and velvet juttis.`,
    mrp: 28999,
    sellingPrice: 22999,
    fabric: 'Dense Silk Velvet & Banarasi Tissue Dupatta',
    fit: 'Short Kurta with Flared Gharara',
    careInstructions: 'Specialist dry clean only. Steam softly; avoid heavy moisture or direct iron.',
    bestseller: true,
    featured: true,
    newArrival: false,
    tags: ['Gharara', 'RubyVelvet', 'Bestseller', 'Featured', 'RoyalNikah'],
    images: [
      'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Royal Ruby', hexCode: '#9B111E', stock: 8 },
      { color: 'Vintage Wine', hexCode: '#4E0E2E', stock: 6 },
    ],
  },

  // ==================== 4. FORMAL SUITS ====================
  {
    name: 'Riwayat Classic Georgette Straight Suit',
    slug: 'riwayat-classic-georgette-straight-suit',
    category: 'Formal Suits',
    description: `A masterstroke of perennial elegance, the Riwayat Straight Suit is spun from premium heavy viscose georgette with an exquisite drape. The tailored long kurta features a clean band neck embellished with tonal threadwork, micro-cutdana, and delicate pin-tucks along the front yoke. Paired with tailored cigarette trousers with comfortable side slits and a matching pure chiffon dupatta framed with delicate lace edgings. A versatile wardrobe hero appropriate for formal festive dinners, corporate galas, and festive office celebrations. Style with dainty pearls and pointed kitten heels for timeless professional grace.`,
    mrp: 12999,
    sellingPrice: 9999,
    fabric: 'Heavy Viscose Georgette & Butter Crepe Lining',
    fit: 'Tailored Straight Cut',
    careInstructions: 'Dry clean only. Iron on moderate setting with pressing cloth.',
    bestseller: true,
    featured: false,
    newArrival: true,
    tags: ['FormalSuits', 'Georgette', 'Bestseller', 'WorkwearToParty', 'Understated'],
    images: [
      'https://images.unsplash.com/photo-1620386875077-e322fb810928?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Classic Black', hexCode: '#111111', stock: 18 },
      { color: 'Bottle Green', hexCode: '#0A3B29', stock: 14 },
    ],
  },
  {
    name: 'Baano Tailored Jacquard Formal Ensemble',
    slug: 'baano-tailored-jacquard-formal-ensemble',
    category: 'Formal Suits',
    description: `Impeccably tailored for high-stakes formal occasions, the Baano Ensemble is woven in fine metallic jacquard silk displaying subtle damask patterns. The kurta features a sculpted portrait neckline, concealed button placket, and structural shoulder seams that project refined authority and grace. It is accompanied by high-waisted narrow trousers and a dual-tone sheer organza stole edged with fine metallic piping. Designed for award functions, gallery openings, and milestone corporate milestones. Accessorize with structural modernist jewellery, a sleek leather envelope clutch, and stiletto heels.`,
    mrp: 14499,
    sellingPrice: 11499,
    fabric: 'Metallic Woven Jacquard Silk',
    fit: 'Sculpted Formal Silhouette',
    careInstructions: 'Dry clean only. Store flat in garment protector.',
    bestseller: false,
    featured: false,
    newArrival: true,
    tags: ['Jacquard', 'FormalSuits', 'PowerEthnic', 'Tailored'],
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Champagne Taupe', hexCode: '#B39F8A', stock: 12 },
      { color: 'Slate Grey', hexCode: '#5A636A', stock: 10 },
    ],
  },
  {
    name: 'Kashish Raw Silk Minimalist Formal Suit',
    slug: 'kashish-raw-silk-minimalist-formal-suit',
    category: 'Formal Suits',
    description: `Clean architectural lines meet natural artisanal luxury in the Kashish Formal Suit. Handcrafted in pure raw silk with visible textured slub yarns, the longline kurta is defined by a deep V-slit mandarin collar, subtle side seams, and concealed pocket details. The set features tapered cigarette trousers with an elasticated waistband and an airy handloom silk stole. A pristine masterwork created for the discerning modernist woman who values understated elegance over excessive ornamentation. Wear with minimalist sculptural earrings and handcrafted leather Kolhapuris or pointed mules.`,
    mrp: 15499,
    sellingPrice: 12199,
    fabric: '100% Pure Raw Handloom Silk',
    fit: 'Minimalist Straight Cut',
    careInstructions: 'Dry clean only. Gentle steam press on reverse side.',
    bestseller: false,
    featured: true,
    newArrival: false,
    tags: ['RawSilk', 'Minimalist', 'Featured', 'FormalSuits', 'Contemporary'],
    images: [
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Natural Ivory', hexCode: '#FFFFF0', stock: 14 },
      { color: 'Sage Green', hexCode: '#77815C', stock: 11 },
    ],
  },
  {
    name: 'Afreen Chanderi Embroidered Pant Suit',
    slug: 'afreen-chanderi-embroidered-pant-suit',
    category: 'Formal Suits',
    description: `Luminous and delicately detailed, the Afreen Pant Suit is crafted from pure Chanderi silk with a lustrous woven gold zari border. The kurta features fine tone-on-tone Lucknowi chikankari-inspired threadwork across the neckline and front panels, accented by discreet micro-pearls. The set is grounded by straight-leg Chanderi pants with scalloped hemlines and a coordinating featherweight kota doria dupatta. An impeccable choice for formal family gatherings, official convocations, and daytime festive occasions. Style with silver filigree earrings, delicate bangles, and embellished juttis.`,
    mrp: 13999,
    sellingPrice: 10999,
    fabric: 'Pure Chanderi Silk with Kota Doria Dupatta',
    fit: 'Regular Straight Fit',
    careInstructions: 'Dry clean only. Protect from moisture and direct sunlight.',
    bestseller: false,
    featured: false,
    newArrival: true,
    tags: ['Chanderi', 'ChikankariStyle', 'FormalSuits', 'NewArrival'],
    images: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Powder Blue', hexCode: '#B0E0E6', stock: 15 },
      { color: 'Blush Rose', hexCode: '#FFE4E1', stock: 10 },
    ],
  },
  {
    name: 'Dilkash Handloom Cotton Silk Formal Suit',
    slug: 'dilkash-handloom-cotton-silk-formal-suit',
    category: 'Formal Suits',
    description: `Effortless, breathable, and deeply dignified, the Dilkash Formal Suit is woven from a balanced cotton-silk blend that keeps you comfortable throughout long occasions. The kurta features a tailored stand collar, subtle self-striped weave, and hand-embroidered kantha stitches along the placket. Complete with tailored trousers and a contrasting handloom dupatta with playful tassel finishes. Specially curated for boardroom-to-dinner transitions, cultural seminars, and festive lunches. Complement with handcrafted wooden or oxidised silver jewellery and leather sandals.`,
    mrp: 11999,
    sellingPrice: 8999,
    fabric: 'Breathable Handloom Cotton-Silk',
    fit: 'Classic Tailored Fit',
    careInstructions: 'Hand wash gently with mild detergent or dry clean for longevity.',
    bestseller: false,
    featured: false,
    newArrival: false,
    tags: ['CottonSilk', 'Handloom', 'Breathable', 'FormalWear'],
    images: [
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Indigo Blue', hexCode: '#3F51B5', stock: 20 },
      { color: 'Earthy Rust', hexCode: '#B7410E', stock: 12 },
    ],
  },

  // ==================== 5. OCCASION WEAR ====================
  {
    name: 'Jashn Handcrafted Gota Patti Suit',
    slug: 'jashn-handcrafted-gota-patti-suit',
    category: 'Occasion Wear',
    description: `Drenched in vibrant celebratory splendour, the Jashn Suit is an homage to traditional Rajasthani gota patti mastery. Handcrafted on heavy pure georgette, the kurta is lavished with authentic gold and silver gota ribbons, marodi accents, and hand-cut floral appliqués across the entire yoke and hem. Accompanied by fluid flared palazzos and an ornate tissue-bordered dupatta with hand-twisted tassels. Designed to create a showstopping entrance at Diwali soirees, wedding sangeets, and mehndi celebrations. Pair with oversized heritage chaandbaalis, a potli bag, and gold mojris.`,
    mrp: 21999,
    sellingPrice: 16999,
    fabric: 'Heavy Pure Georgette & Organza Dupatta',
    fit: 'Flared Tunic with Wide Palazzos',
    careInstructions: 'Strictly dry clean only. Wrap in muslin to prevent gota tarnishing.',
    bestseller: true,
    featured: true,
    newArrival: true,
    tags: ['GotaPatti', 'OccasionWear', 'Bestseller', 'Featured', 'SangeetSpecial'],
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Sunset Marigold', hexCode: '#FF9900', stock: 14 },
      { color: 'Fuschia Rani', hexCode: '#C71585', stock: 11 },
    ],
  },
  {
    name: 'Roohani Mukaish Work Pastel Ensemble',
    slug: 'roohani-mukaish-work-pastel-ensemble',
    category: 'Occasion Wear',
    description: `An ethereal dream woven in fine silk georgette, the Roohani Ensemble showcases rare hand-beaten silver mukaish specks that glisten like stardust. The boat-neck kurta is further highlighted with pearl and dabka micro-embroidery along the sleeve borders. Accompanied by silk blend trousers and a generous 2.5-meter georgette dupatta whose edges are finished in scalloped thread lace. Ideal for intimate day weddings, engagement ceremonies, and festive celebrations where refined subtlety outshines loud glamour. Wear with polki studs and a dewy highlighter glow.`,
    mrp: 20499,
    sellingPrice: 15999,
    fabric: 'Silk Georgette with Butter Crepe Lining',
    fit: 'Straight Flattering Silhouette',
    careInstructions: 'Professional dry cleaning only. Do not iron directly on mukaish metal dots.',
    bestseller: false,
    featured: true,
    newArrival: true,
    tags: ['Mukaish', 'PastelOccasion', 'Featured', 'EngagementWear', 'UnderstatedLuxury'],
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Powder Lavender', hexCode: '#E6E6FA', stock: 9 },
      { color: 'Seafoam Mint', hexCode: '#98FF98', stock: 7 },
    ],
  },
  {
    name: 'Shahana Heavily Embroidered Angrakha Set',
    slug: 'shahana-heavily-embroidered-angrakha-set',
    category: 'Occasion Wear',
    description: `Reviving ancient princely silhouettes, the Shahana Angrakha Set features a dynamic overlapping crossover bodice secured by hand-braided silk dori cords with ornate pearl and sequin tassels. The rich Chanderi silk is densely embroidered with antique zardozi, kashmiri threadwork, and tiny mirror accents. It cascades into a generous asymmetric hemline that pairs exquisitely with wide-legged sharara trousers and a tissue-sheer dupatta. A regal triumph for wedding receptions and royal celebrations. Complete your opulent ensemble with antique pearl necklaces and velvet khussa shoes.`,
    mrp: 25999,
    sellingPrice: 19999,
    fabric: 'Pure Chanderi Silk & Handloom Tissue',
    fit: 'Overlapping Angrakha Flare',
    careInstructions: 'Specialist dry clean only. Store on padded hangers in cool environment.',
    bestseller: true,
    featured: false,
    newArrival: false,
    tags: ['Angrakha', 'Bestseller', 'Zardozi', 'OccasionWear', 'WeddingCollection'],
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Deep Teal', hexCode: '#005F73', stock: 8 },
      { color: 'Burgundy Crimson', hexCode: '#800020', stock: 6 },
    ],
  },
  {
    name: 'Zeenat Rose Gold Tissue Festive Suit',
    slug: 'zeenat-rose-gold-tissue-festive-suit',
    category: 'Occasion Wear',
    description: `Radiating contemporary opulence, the Zeenat Festive Suit is spun from metallic tissue silk that catches the light with subtle rose gold brilliance. The kurta features an architectural keyhole neckline, scalloped border hem, and tone-on-tone cutdana embroidery along the three-quarter sleeves. The set includes tailored straight pants with metallic lace inserts and a matching organza dupatta. An exquisite selection for modern brides, festive cocktail nights, and anniversary celebrations. Style with champagne diamond jewellery, metallic stilettos, and an evening minaudière clutch.`,
    mrp: 23499,
    sellingPrice: 17999,
    fabric: 'Rose Gold Tissue Silk & Organza',
    fit: 'Tailored Straight Fit',
    careInstructions: 'Dry clean only. Avoid sharp jewellery friction against tissue fibers.',
    bestseller: false,
    featured: false,
    newArrival: true,
    tags: ['TissueSilk', 'RoseGold', 'CocktailFestive', 'NewArrival'],
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Rose Gold Metallic', hexCode: '#B76E79', stock: 10 },
      { color: 'Champagne Silver', hexCode: '#C0C0C0', stock: 8 },
    ],
  },
  {
    name: 'Tarana Banarasi Brocade Kalidar Suit',
    slug: 'tarana-banarasi-brocade-kalidar-suit',
    category: 'Occasion Wear',
    description: `A celebrated treasure of Indian weaving heritage, the Tarana Kalidar Suit is crafted from authentic handwoven Banarasi katan silk brocade with real zari floral kadwa weaves. The kalidar kurta features an imposing sweeping hem, framed by contrasting meenakari motifs and a scalloped sweetheart neckline. Paired with tailored raw silk trousers and an extravagant hand-woven Banarasi dupatta that doubles as an heirloom masterpiece. Ideal for main wedding rituals, close family nuptials, and royal banquets. Accentuate with heritage temple jewellery and gold juttis.`,
    mrp: 28999,
    sellingPrice: 22499,
    fabric: 'Authentic Banarasi Katan Silk Brocade',
    fit: 'Kalidar Flared Hem',
    careInstructions: 'Dry clean only. Store wrapped in white cotton cloth; refold periodically.',
    bestseller: false,
    featured: true,
    newArrival: false,
    tags: ['BanarasiBrocade', 'Heirloom', 'Featured', 'KadwaWeave', 'OccasionWear'],
    images: [
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Royal Magenta', hexCode: '#CA1F7B', stock: 7 },
      { color: 'Imperial Green', hexCode: '#005A36', stock: 5 },
    ],
  },
  {
    name: 'Mehr Banarasi Weave Kurta with Dupatta',
    slug: 'mehr-banarasi-weave-kurta-with-dupatta',
    category: 'Occasion Wear',
    description: `Indulge in artisanal splendour with the Mehr Kurta Ensemble, showcasing authentic Banarasi silk weaves with intricate all-over floral jaal motifs. The neckline is adorned with delicate hand-stitched potli buttons and subtle gold piping. Paired with a fluid silk bottom and a luxurious contrasting Banarasi dupatta rich in gold zari pallu detailing. A timeless investment in Indian handloom fashion that effortlessly transitions from festive pujas to evening family receptions. Style with traditional jhumkas, a classic red bindi, and golden mojaris for unmistakable panache.`,
    mrp: 19499,
    sellingPrice: 14999,
    fabric: 'Pure Banarasi Silk with Pure Silk Bottom',
    fit: 'Straight Classic Cut',
    careInstructions: 'Dry clean only. Store with silica gel packets in dry storage.',
    bestseller: false,
    featured: false,
    newArrival: true,
    tags: ['BanarasiWeave', 'OccasionWear', 'Heritage', 'Handloom'],
    images: [
      'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1620386875077-e322fb810928?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Mustard Gold', hexCode: '#DAA520', stock: 12 },
      { color: 'Peacock Teal', hexCode: '#008080', stock: 9 },
    ],
  },

  // ==================== 6. SHARARA SETS ====================
  {
    name: 'Mumtaz Mahal Embroidered Sharara Set',
    slug: 'mumtaz-mahal-embroidered-sharara-set',
    category: 'Sharara Sets',
    description: `Channel classic Mughal grace with the Mumtaz Mahal Sharara Set, meticulously tailored from rich mulberry silk and georgette. The short kurti features dense Lucknowi chikankari and zardozi needlework covering the yoke, hem, and cuffs. The showstopping multi-tiered sharara pants feature extensive flare with over eight meters of fabric volume and gleaming gota borders. Accompanied by a dramatic net and organza dupatta with scalloped borders. Designed for memorable sangeet nights, destination weddings, and royal festive gatherings. Style with a matching embroidered potli bag, heavy chandbalis, and heels.`,
    mrp: 23999,
    sellingPrice: 18999,
    fabric: 'Mulberry Silk Kurti & Georgette Sharara',
    fit: 'Short Kurti with Dramatic Tiered Sharara',
    careInstructions: 'Dry clean only. Steam iron only; handle delicate gota borders with care.',
    bestseller: true,
    featured: false,
    newArrival: false,
    tags: ['Sharara', 'MughalGrace', 'Bestseller', 'SangeetSpecial', 'TieredSharara'],
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Rani Pink', hexCode: '#E30B5C', stock: 10 },
      { color: 'Emerald Green', hexCode: '#004B23', stock: 8 },
    ],
  },
  {
    name: 'Dilruba Mirror Work Georgette Sharara',
    slug: 'dilruba-mirror-work-georgette-sharara',
    category: 'Sharara Sets',
    description: `Twirl with luminous brilliance in the Dilruba Sharara Set, fashioned from featherlight micro-georgette. The short peplum-style tunic is drenched in authentic hand-set mirror work and tonal resham thread embroidery that catches every ray of festive lighting. The voluminous sharara bottoms are detailed with mirror-studded horizontal tiers that produce mesmerizing movement on the dance floor. Accompanied by an airy georgette dupatta with mirror lace trimming. A top choice for sangeet performances, mehendi parties, and festive celebrations. Style with sparkling mirror juttis and statement ear cuffs.`,
    mrp: 21499,
    sellingPrice: 16499,
    fabric: 'Pure Georgette with Butter Crepe Lining',
    fit: 'Peplum Kurti with Voluminous Sharara',
    careInstructions: 'Dry clean only. Store in garment cover away from hard surfaces.',
    bestseller: false,
    featured: true,
    newArrival: true,
    tags: ['MirrorWork', 'Sharara', 'Featured', 'SangeetReady', 'NewArrival'],
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Sunshine Yellow', hexCode: '#FFD700', stock: 13 },
      { color: 'Aqua Marine', hexCode: '#7FFFD4', stock: 9 },
    ],
  },
  {
    name: 'Parizaad Dual Tone Silk Sharara Set',
    slug: 'parizaad-dual-tone-silk-sharara-set',
    category: 'Sharara Sets',
    description: `Sophisticated dual-tone colour blocking defines the contemporary beauty of the Parizaad Sharara Set. Spun from pure spun silk, the knee-length kurta features contrasting pastel side panels and delicate silver tilla vine embroidery. The layered sharara pants offer a statuesque silhouette with an ombre dyed flare that transitions gracefully from pale rose to rich mauve. The ensemble is topped with a dual-toned chiffon dupatta with silver fringes. Perfect for daytime nikah ceremonies, festive Eid gatherings, and anniversary soirees. Accentuate with silver kundan jewels and sleek strappy heels.`,
    mrp: 19999,
    sellingPrice: 15499,
    fabric: 'Spun Silk & Sheer Chiffon Dupatta',
    fit: 'Tailored Kurti with Layered Sharara',
    careInstructions: 'Dry clean only. Steam gently.',
    bestseller: false,
    featured: false,
    newArrival: true,
    tags: ['Sharara', 'DualTone', 'PastelSilk', 'ContemporaryEthnic'],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Rose Mauve', hexCode: '#915F6D', stock: 11 },
      { color: 'Sage Mint', hexCode: '#87A987', stock: 8 },
    ],
  },
  {
    name: 'Subah Organza Hand-Painted Sharara Ensemble',
    slug: 'subah-organza-hand-painted-sharara-ensemble',
    category: 'Sharara Sets',
    description: `A wearable canvas of botanical poetry, the Subah Sharara Ensemble features delicate hand-painted floral bouquets across translucent silk organza. The sleeveless short kurta is accented with subtle pearl piping and a scalloped hemline, paired with matching hand-painted tiered sharara pants. The ensemble is completed with a full-length organza dupatta highlighted with hand-embroidered gota and sequin borders. Ideal for summer destination weddings, outdoor brunches, and garden parties. Pair with lightweight floral jewellery or statement baroque pearls and satin pumps for romantic distinction.`,
    mrp: 22999,
    sellingPrice: 17499,
    fabric: 'Pure Silk Organza with Cotton Silk Lining',
    fit: 'Flared Tiered Sharara',
    careInstructions: 'Specialist dry clean only. Do not spray fragrance or water on painted motifs.',
    bestseller: true,
    featured: true,
    newArrival: false,
    tags: ['HandPainted', 'Organza', 'Sharara', 'Bestseller', 'Featured', 'DestinationWedding'],
    images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Ivory Floral', hexCode: '#FFF8DC', stock: 10 },
      { color: 'Blush Floral', hexCode: '#FFE4E1', stock: 7 },
    ],
  },
  {
    name: 'Nazakat Gota Sharara Suit with Scalloped Dupatta',
    slug: 'nazakat-gota-sharara-suit-with-scalloped-dupatta',
    category: 'Sharara Sets',
    description: `A celebration of traditional festive vivacity, the Nazakat Sharara Suit combines fine georgette and tissue accents. The kurti features an artistic V-shaped neckline encrusted with gold dabka, kundan stones, and delicate gotta work. The sweeping sharara bottoms feature three voluminous gathered tiers, each highlighted by metallic thread piping. Accompanied by a lightweight organza dupatta detailed with hand-cut scalloped borders. A showstopper ensemble for Diwali parties, mehendi ceremonies, and wedding receptions. Style with polki jhumkas, a classic braided hairstyle, and embroidered mojris.`,
    mrp: 20999,
    sellingPrice: 15999,
    fabric: 'Georgette & Organza with Crepe Lining',
    fit: 'Tiered Sharara Fit',
    careInstructions: 'Dry clean only. Store wrapped in pure cotton cloth.',
    bestseller: false,
    featured: false,
    newArrival: true,
    tags: ['GotaSharara', 'ScallopedDupatta', 'Sharara', 'NewArrival', 'FestiveCelebration'],
    images: [
      'https://images.unsplash.com/photo-1620386875077-e322fb810928?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    ],
    variants: [
      { color: 'Cobalt Royal Blue', hexCode: '#002366', stock: 12 },
      { color: 'Deep Rust Orange', hexCode: '#C84B31', stock: 8 },
    ],
  },
];

async function seedProducts() {
  console.log(`\n======================================================`);
  console.log(`🌱 Starting JB51 Store Product Seeding Script`);
  console.log(`Total items in seed catalog: ${PRODUCTS_SEED_DATA.length}`);
  console.log(`======================================================\n`);

  let addedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < PRODUCTS_SEED_DATA.length; i++) {
    const item = PRODUCTS_SEED_DATA[i];
    const prefix = `[${i + 1}/${PRODUCTS_SEED_DATA.length}]`;

    try {
      // Ensure description satisfies >= 100 words requirement with luxury atelier details
      let finalDescription = item.description.trim();
      const words = countWords(finalDescription);
      if (words < 105) {
        finalDescription += ` Each bespoke creation from JB51 Store is handcrafted with meticulous attention to detail by master generational artisans. The piece features custom hand-finished hemlines, reinforced French seams, and skin-friendly breathable inner linings that guarantee both regal poise and extraordinary wearability across extended celebrations and festive gatherings.`;
      }

      // Check if product already exists
      const existing = await getProductBySlug(item.slug);
      if (existing) {
        console.log(`⏩ ${prefix} Skipped: "${item.name}" already exists (slug: ${item.slug})`);
        skippedCount++;
        continue;
      }

      // Create product using existing service logic
      const created = await createProduct({
        name: item.name,
        slug: item.slug,
        category: item.category,
        description: finalDescription,
        mrp: item.mrp,
        sellingPrice: item.sellingPrice,
        price: item.sellingPrice,
        fabric: item.fabric,
        fit: item.fit,
        careInstructions: item.careInstructions,
        bestseller: item.bestseller,
        featured: item.featured,
        newArrival: item.newArrival,
        tags: item.tags,
        images: item.images,
        variants: item.variants,
        status: 'listed',
        inStock: true,
        isListed: true,
      });

      console.log(`✅ ${prefix} Added: "${created.name}" [Category: ${created.category}] (ID: ${created.id})`);
      if (item.bestseller) console.log(`   🌟 Marked as BESTSELLER`);
      if (item.featured) console.log(`   ✨ Marked as FEATURED`);
      addedCount++;
    } catch (err: unknown) {
      console.error(`❌ ${prefix} Error adding "${item.name}":`, err instanceof Error ? err.message : err);
      errorCount++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 Seeding Complete!`);
  console.log(`   Added:   ${addedCount} products`);
  console.log(`   Skipped: ${skippedCount} products (already existed)`);
  console.log(`   Errors:  ${errorCount}`);
  console.log(`======================================================\n`);

  process.exit(0);
}

seedProducts().catch((err) => {
  console.error('Fatal Seeding Script Error:', err);
  process.exit(1);
});
