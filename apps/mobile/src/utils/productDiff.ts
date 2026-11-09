import { Product, Variant } from '../types';

export interface ProductFormComparableValues {
  name?: string;
  slug?: string;
  description?: string;
  mrp?: string | number;
  sellingPrice?: string | number;
  category?: string;
  fabric?: string;
  fit?: string;
  careInstructions?: string;
  tags?: string | string[];
  featured?: boolean;
  newArrival?: boolean;
  bestseller?: boolean;
  isListed?: boolean;
  images?: string[];
  variants?: Variant[];
}

function areVariantsEqual(a?: Variant[], b?: Variant[]): boolean {
  const listA = a || [];
  const listB = b || [];
  if (listA.length !== listB.length) return false;
  for (let i = 0; i < listA.length; i++) {
    const va = listA[i];
    const vb = listB[i];
    if (!va || !vb) return false;
    if (va.color.trim() !== vb.color.trim()) return false;
    if ((va.hexCode || '').trim() !== (vb.hexCode || '').trim()) return false;
    if (Number(va.stock || 0) !== Number(vb.stock || 0)) return false;
    if (Number(va.reservedStock || 0) !== Number(vb.reservedStock || 0)) return false;
    const aImgs = (va.images || []).map(img => img.trim()).filter(Boolean);
    const bImgs = (vb.images || []).map(img => img.trim()).filter(Boolean);
    if (aImgs.length !== bImgs.length) return false;
    for (let j = 0; j < aImgs.length; j++) {
      if (aImgs[j] !== bImgs[j]) return false;
    }
  }
  return true;
}

/**
 * Compares current product form values against the initial product.
 * Returns an object containing ONLY the fields that have actually changed.
 */
export function getChangedProductFields(
  initial: Product,
  current: ProductFormComparableValues
): Partial<Product> {
  const diff: Partial<Product> = {};

  if (current.name !== undefined) {
    const nextName = current.name.trim();
    if (nextName !== (initial.name || '').trim()) {
      diff.name = nextName;
    }
  }

  if (current.slug !== undefined) {
    const nextSlug = current.slug.trim();
    if (nextSlug !== (initial.slug || '').trim()) {
      diff.slug = nextSlug;
    }
  }

  if (current.description !== undefined) {
    const nextDesc = current.description.trim();
    if (nextDesc !== (initial.description || '').trim()) {
      diff.description = nextDesc;
    }
  }

  const initialMrp = Number(initial.mrp ?? initial.price ?? 0);
  const initialSelling = Number(initial.sellingPrice ?? initial.discountPrice ?? initial.price ?? 0);
  let mrpChanged = false;
  let sellingChanged = false;

  if (current.mrp !== undefined && current.mrp !== '') {
    const nextMrp = Number(current.mrp);
    if (!isNaN(nextMrp) && nextMrp !== initialMrp) {
      diff.mrp = nextMrp;
      diff.price = nextMrp;
      mrpChanged = true;
    }
  }

  if (current.sellingPrice !== undefined && current.sellingPrice !== '') {
    const nextSelling = Number(current.sellingPrice);
    if (!isNaN(nextSelling) && nextSelling !== initialSelling) {
      diff.sellingPrice = nextSelling;
      sellingChanged = true;
    }
  }

  if (mrpChanged || sellingChanged) {
    const effectiveMrp = diff.mrp !== undefined ? diff.mrp : initialMrp;
    const effectiveSelling = diff.sellingPrice !== undefined ? diff.sellingPrice : initialSelling;
    diff.discountPrice = effectiveMrp > effectiveSelling ? effectiveSelling : undefined;
  }

  if (current.category !== undefined) {
    const nextCat = current.category.trim();
    if (nextCat !== (initial.category || '').trim()) {
      diff.category = nextCat;
    }
  }

  if (current.fabric !== undefined) {
    const nextFabric = current.fabric.trim();
    if (nextFabric !== (initial.fabric || '').trim()) {
      diff.fabric = nextFabric;
    }
  }

  if (current.fit !== undefined) {
    const nextFit = current.fit.trim();
    if (nextFit !== (initial.fit || '').trim()) {
      diff.fit = nextFit;
    }
  }

  if (current.careInstructions !== undefined) {
    const nextCare = current.careInstructions.trim();
    if (nextCare !== (initial.careInstructions || '').trim()) {
      diff.careInstructions = nextCare;
    }
  }

  if (current.tags !== undefined) {
    const nextTags = Array.isArray(current.tags)
      ? current.tags.map(t => t.trim().toLowerCase()).filter(Boolean)
      : current.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    const initTags = (initial.tags || []).map(t => t.trim().toLowerCase()).filter(Boolean);
    if (JSON.stringify(nextTags) !== JSON.stringify(initTags)) {
      diff.tags = nextTags;
    }
  }

  if (current.featured !== undefined && Boolean(current.featured) !== Boolean(initial.featured)) {
    diff.featured = current.featured;
  }

  if (current.newArrival !== undefined && Boolean(current.newArrival) !== Boolean(initial.newArrival)) {
    diff.newArrival = current.newArrival;
  }

  if (current.bestseller !== undefined && Boolean(current.bestseller) !== Boolean(initial.bestseller)) {
    diff.bestseller = current.bestseller;
  }

  if (current.isListed !== undefined && Boolean(current.isListed) !== Boolean(initial.isListed !== false)) {
    diff.isListed = current.isListed;
    diff.status = current.isListed ? 'listed' : 'unListed';
  }

  if (current.images !== undefined) {
    const nextImages = current.images.map(img => img.trim()).filter(Boolean);
    const initImages = (initial.images || []).map(img => img.trim()).filter(Boolean);
    if (JSON.stringify(nextImages) !== JSON.stringify(initImages)) {
      diff.images = nextImages;
    }
  }

  if (current.variants !== undefined) {
    if (!areVariantsEqual(current.variants, initial.variants)) {
      diff.variants = current.variants;
    }
  }

  return diff;
}

