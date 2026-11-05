import { ProductAiInput, AiImagePromptItem, cleanText } from './types';

/**
 * Generates 5 curated, high-end AI Photography Prompts based on product specifications
 * and strictly locks onto the provided reference suit image to prevent generating random suits.
 */
export const generateImagePrompts = (input: ProductAiInput): AiImagePromptItem[] => {
  const name = cleanText(input.name) || 'Handcrafted Punjabi Suit';
  const category = cleanText(input.category) || "Women's Punjabi Suit";
  const fabric = cleanText(input.fabric) || 'Pure Chanderi Silk with artisanal border';
  const fit = cleanText(input.fit) || 'Straight silhouette with authentic Punjabi Patiala drape';
  const color = cleanText(input.variantColor) || 'Regal Heritage Hue';
  const hex = input.variantHex ? ` (Exact Hex Tone: ${input.variantHex})` : '';
  const desc =
    cleanText(input.description) ||
    'Intricate hand-zardozi neckline, refined sleeve borders, and a coordinating scalloped dupatta';
  const care = cleanText(input.careInstructions) || 'Dry clean only to protect fine handloom weave';
  const tags = cleanText(input.tags);

  const refUrl = input.referenceImageUrl?.trim() || '';
  const refHeader = refUrl
    ? `[ATTACHED PRODUCT REFERENCE IMAGE: ${refUrl}]`
    : `[ATTACHED PRODUCT REFERENCE IMAGE: Attach or upload your reference photo of this specific suit alongside this prompt]`;

  const midjourneyRefTag = refUrl ? `${refUrl} ` : '';
  const midjourneySuffix = refUrl
    ? ` --sref ${refUrl} --cw 100 --iw 2.0 --ar 4:5 --v 6.1`
    : ` --cw 100 --iw 2.0 --ar 4:5 --v 6.1`;

  const sharedConsistencyRules = `🛑 CRITICAL MANDATORY INSTRUCTION — ZERO RANDOM SUITS (EXACT GARMENT LOCK):
The AI MUST NOT generate a random, generic, or newly invented suit.
You must dress the model in the EXACT Punjabi suit shown in the attached reference image.
The suit in your generated images must be an identical 1:1 visual clone of the reference image:
- FABRIC & WEAVE: 100% identical ${fabric} in ${color}${hex}. Retain the exact same weave texture, handfeel, and fabric sheen.
- EMBROIDERY & PATTERNS: 100% identical needlework (${desc}). Replicate the exact motifs, scale, placement, and metallic threadwork on the neckline, sleeve hems, and borders without adding or inventing new designs.
- SILHOUETTE & CUT: 100% identical ${fit}. Retain the exact neckline cut, sleeve length, side slits, and bottom pleating shown in the reference image.
- DUPATTA: 100% identical color, border lace/embroidery, and fabric transparency matching the reference suit.
- STRICT PROHIBITION: Do not alter the embroidery design, do not change the salwar style, do not shift the suit color, and do not dress the model in any generic or alternative ethnic outfit. The provided reference image is the absolute ground truth.`;

  const sharedModelStyle = `**MODEL AND PHOTOGRAPHY STYLE:**
- Professional Indian female fashion model.
- Elegant, natural and confident expressions.
- Graceful Punjabi ethnic styling (delicate traditional jhumkas, neat center-parted hair or sleek low braided bun, luxury ethnic juttis).
- Natural-looking makeup and sophisticated hairstyle.
- Premium fashion catalogue photography.
- Realistic fabric texture and accurate garment details showing true textile grain.
- Ultra-realistic photography, not illustration, not CGI, not anime.
- High-end fashion brand aesthetic (JB51 Luxury Boutique).`;

  const negativePromptCommon =
    'random suit design, different suit, generic salwar kameez, altered embroidery, different neckline, modified patterns, color shift, invented garments, wrong fabric, cartoon, 3D render, plastic doll skin, extra fingers, distorted limbs, mutated hands, blurred embroidery, asymmetric patterns, mismatched fabric colors between views, floating clothing, fake text, watermarks, logo overlays, cluttered distracting elements, oversaturated neon colors';

  // PROMPT 1: Improved 4-Angle E-Commerce Multi-View Collection (Master Consistency Suite)
  const prompt1Text = `${refHeader}

${sharedConsistencyRules}

PRODUCT SPECIFICATIONS:
- Garment Name: ${name}
- Category: ${category}
- Fabric & Material: ${fabric}
- Fit & Silhouette: ${fit}
- Primary Color / Shade: ${color}${hex}
- Embroidery & Detailing: ${desc}
- Recommended Care: ${care}
${tags ? `- Tags: ${tags}` : ''}

Create a premium e-commerce product photography collection for a women's Punjabi suit brand.
Generate **4 separate, individual high-resolution images of the EXACT SAME Punjabi suit** shown in the reference image, designed for a premium Indian ethnic fashion e-commerce website.

${sharedModelStyle}

### IMAGE 1 – FRONT VIEW (MAIN PRODUCT THUMBNAIL)
Create a full-length, straight-on front view of the model wearing the complete Punjabi suit from the reference image.
- Model standing naturally, facing the camera with relaxed confidence.
- Entire outfit visible from head to toe.
- Clearly display the kurta, salwar and dupatta exactly as designed.
- Make the exact embroidery, neckline and front design clearly visible with needle-sharp focus.
- Elegant, minimal warm-neutral studio background (#F8F9FA tone).
- Soft professional studio lighting with true-to-life garment color rendition.
- Composition suitable for primary e-commerce thumbnail.

### IMAGE 2 – SIDE / THREE-QUARTER VIEW
Create a separate full-length side or three-quarter view of the same model wearing the exact same suit.
- Model standing in a graceful side pose.
- Show the side silhouette, kurta fitting, high side slits, and garment fall.
- Clearly display the dupatta draping and salwar pleat fall.
- Highlight the fabric flow, stitching and overall outfit structure.
- Maintain identical studio lighting and photography quality as Image 1.
- Absolutely zero changes to the outfit or model styling.

### IMAGE 3 – PRODUCT CRAFTSMANSHIP & DETAILS SPECIFICATION
Create a premium fashion product-detail image featuring the model wearing the same suit.
- Medium composition focusing from waist up.
- Emphasize the neckline embroidery, sleeve borders, and dupatta edging.
- 2–3 tasteful close-up detail insets showing the true weave of ${fabric} and authentic needlework.
- Clean editorial layout with subtle connecting lines and generous negative space.
- Do not invent fabric claims or add fake watermark text.

### IMAGE 4 – LUXURY EDITORIAL CAMPAIGN PRESENTATION
Create a luxurious editorial fashion photograph showcasing the same Punjabi suit.
- Model wearing the complete outfit in an elegant, regal pose.
- Rich but sophisticated heritage studio environment (subtle carved arch or warm plaster texture).
- Soft cinematic lighting highlighting the natural sheen of ${fabric}.
- Focus on embroidery precision, fabric draping, and artisan finishing.
- Convey exclusivity, heritage elegance, and luxury boutique standards.

### FINAL OUTPUT REQUIREMENTS:
- Generate 4 separate image files, NOT a combined collage.
- Each image must have a distinct composition and camera angle.
- Maintain 100% exact garment consistency across all images.
- Portrait aspect ratio 4:5. High resolution, sharp focus, professional color grading.`;

  // PROMPT 2: Royal Haveli & Courtyard Heritage Editorial (Warm Ambient Light)
  const prompt2Text = `${refHeader}

${sharedConsistencyRules}

High-end editorial fashion photography for JB51 Luxury Store.
A professional Indian female fashion model wearing the EXACT Punjabi suit from the reference image (${fabric} in ${color}${hex}, featuring ${desc}, tailored in a ${fit}).
- Setting: Historic regal haveli courtyard in Punjab/Rajasthan, subtle sandstone arches, carved jharokha balcony in soft-focus background, heritage marble floor with subtle morning sunbeams.
- Composition: Full-length three-quarter standing shot, model holding the sheer dupatta border gracefully, gazing serenely slightly off-camera.
- Garment Fidelity: The suit MUST NOT change. Replicate the exact neckline embroidery, patiala salwar gathers, and sleeve detailing from the attached reference photo.
- Lighting: Golden hour morning sunlight filtering through jali lattice screens, warm soft directional rim light highlighting the fabric weave and metallic zardozi sheen.
- Camera: Hasselblad H6D-100c, 100mm f/2.2 prime lens, razor-sharp focus on the outfit embroidery, natural depth of field, authentic filmic color science.
- No random garments, no synthetic CGI shine, no logos, no distorted embroidery.`;

  // PROMPT 3: Modern Minimalist High-Fashion Lookbook (Studio Chic)
  const prompt3Text = `${refHeader}

${sharedConsistencyRules}

Minimalist luxury fashion lookbook photograph for JB51 Boutique.
An Indian fashion model with a clean center-parted sleek low bun wearing the EXACT Punjabi suit from the reference image (${fabric} in ${color}${hex}, ${fit}, ${desc}).
- Setting: Pristine contemporary high-fashion studio, warm travertine stone pedestals, clean architectural negative space, muted sand-beige backdrop (#E8E4DF).
- Composition: Full-length editorial pose, model standing tall with hands softly resting at her sides, accentuating the clean straight fall of the kurta and the crisp pleats of the salwar.
- Lighting: Large directional diffused octabox overhead, gentle fill card on opposite side, soft natural ground contact shadows. 100% color-calibrated garment tones matching ${color}.
- Camera: Canon EOS R5, RF 85mm f/1.2L lens at f/5.6 for total garment sharpness from collar to hem, ISO 100, 1/250s.
- Clean editorial look, zero distractions, ultra-sharp textile texture.`;

  // PROMPT 4: Close-Up Macro Craftsmanship & Textile Artistry
  const prompt4Text = `${refHeader}

${sharedConsistencyRules}

Ultra-close-up macro fashion photography of garment craftsmanship for JB51 Store.
Detailed focus on the neckline, sleeve borders, and dupatta edge of the EXACT Punjabi suit from the reference image (${fabric} in ${color}${hex}).
- Composition: Tight macro framing capturing the intricate relief of ${desc}, fine metallic thread luster, and individual warp and weft weave of the ${fabric}.
- Garment Fidelity: Exact 1:1 replication of the needlework motifs, seed pearls, and border lace shown in the reference suit photo.
- Lighting: 45-degree raking studio light creating delicate micro-shadows that emphasize the three-dimensional depth of the hand embroidery without washing out the ${color} textile tone.
- Camera: Sony A7R V with 90mm f/2.8 Macro lens, 1:1 reproduction ratio, focus stacked for edge-to-edge needle sharpness, ISO 100.
- Hyper-realistic textile authenticity, no blur, no AI smoothing, true fabric grain.`;

  // PROMPT 5: Festive Celebration & Dynamic Fluid Motion (Graceful Twirl)
  const prompt5Text = `${refHeader}

${sharedConsistencyRules}

Dynamic high-fashion motion photograph capturing fluid garment movement for JB51 Store.
A joyful Indian female model captured in a graceful, slow twirl wearing the EXACT Punjabi suit from the reference image (${fabric} in ${color}${hex}, ${fit}, ${desc}).
- Garment Action: The pleated salwar flares gently with authentic centrifugal ease, the lightweight dupatta floats elegantly through the air catching the light, while the kurta silhouette stays anchored and recognizable.
- Setting: Warm festive evening setting, soft-focus background with gentle warm bokeh lights, festive ambiance without clutter.
- Garment Consistency: The embroidery, fabric, color, and cut remain 100% faithful to the reference image—do not substitute with an anarkali or different dress.
- Lighting: High-speed dual Broncolor flash freezes the flowing fabric mid-air with zero motion blur, crisp rim light tracing the dupatta hem border.
- Camera: Nikon Z9 with 105mm f/1.4 lens at f/2.8, 1/1000s shutter speed, tack-sharp model face and garment details.`;

  return [
    {
      id: 'prompt-1',
      title: '4-Angle E-Commerce Multi-View Collection (Master Suite)',
      subtitle: 'Front thumbnail, 3/4 side profile, craftsmanship specs & luxury campaign',
      badge: 'RECOMMENDED',
      description:
        'The comprehensive e-commerce prompt with strict anti-hallucination rules to generate 4 individual catalogue images of your exact suit.',
      cameraSpecs: 'Hasselblad H6D • 100mm f/4 • f/8 Aperture • ISO 100 • 1/200s',
      lightingSetup: 'Multi-point Softbox Daylight Emulation (5600K) + Pure White Balance',
      promptText: prompt1Text,
      negativePrompt: negativePromptCommon,
      recommendedAspect: '4:5 Portrait',
      midjourneyCommand: `/imagine prompt: ${midjourneyRefTag}front view full length Indian model wearing Punjabi suit in ${color} ${fabric}, ${desc}, studio lighting, catalogue photography${midjourneySuffix}`,
    },
    {
      id: 'prompt-2',
      title: 'Royal Haveli & Courtyard Heritage Editorial (Golden Hour)',
      subtitle: 'Sandstone jharokhas, sunbeams, regal mood, heritage Indian aristocracy',
      badge: 'HERITAGE EDITORIAL',
      description:
        'Atmospheric campaign shot in a royal haveli courtyard, dressing the model in your exact reference suit under golden sunlight.',
      cameraSpecs: 'Hasselblad H6D-100c • 100mm f/2.2 • ISO 100 • Filmic Grading',
      lightingSetup: 'Golden Hour Sunbeams filtered through carved jali lattice + Rim Glow',
      promptText: prompt2Text,
      negativePrompt: negativePromptCommon,
      recommendedAspect: '4:5 Portrait',
    },
    {
      id: 'prompt-3',
      title: 'Modern Minimalist High-Fashion Lookbook (Studio Chic)',
      subtitle: 'Clean travertine backdrop, directional softbox, razor-sharp tailoring lines',
      badge: 'STUDIO LOOKBOOK',
      description:
        'High-fashion aesthetic focusing 100% on replicating your suit with pristine tailoring and color fidelity.',
      cameraSpecs: 'Canon EOS R5 • RF 85mm f/2.8 • f/8 Aperture • ISO 100',
      lightingSetup: 'Directional Octabox Daylight Emulation + Soft Ground Shadows',
      promptText: prompt3Text,
      negativePrompt: negativePromptCommon,
      recommendedAspect: '4:5 Portrait',
    },
    {
      id: 'prompt-4',
      title: 'Close-Up Macro Craftsmanship & Textile Artistry',
      subtitle: '100mm macro needlework precision, fabric weave relief, zardozi luster',
      badge: 'CRAFTSMANSHIP SPEC',
      description:
        'Microscopic focus on your reference suit neckline embroidery, threadwork relief, and textile weave.',
      cameraSpecs: 'Sony A7R V • 100mm f/2.8 Macro 1:1 • ISO 100',
      lightingSetup: '30° Cross-Raking Studio Light for 3D Embroidery Relief',
      promptText: prompt4Text,
      negativePrompt: negativePromptCommon,
      recommendedAspect: '4:5 Portrait',
    },
    {
      id: 'prompt-5',
      title: 'Festive Celebration & Dynamic Fluid Motion (Graceful Twirl)',
      subtitle: 'Airborne salwar flare, celebratory golden bokeh, 1/1000s freeze-frame',
      badge: 'DYNAMIC MOTION',
      description:
        'High-speed capture of the model in mid-twirl wearing your exact reference suit, capturing salwar flare without changing the design.',
      cameraSpecs: 'Nikon Z9 • 105mm Prime • 1/1000s Shutter • f/2.8',
      lightingSetup: 'Warm Evening Ambient Glow + High-Speed Dual Strobes',
      promptText: prompt5Text,
      negativePrompt: negativePromptCommon,
      recommendedAspect: '4:5 Portrait',
    },
  ];
};

