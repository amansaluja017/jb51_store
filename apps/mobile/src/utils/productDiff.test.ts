import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { getChangedProductFields } from './productDiff';
import { Product } from '../types';

describe('Product Diffing for Partial Update', () => {
  const baseProduct: Product = {
    id: 'prod-123',
    name: 'Classic White Kurti',
    slug: 'classic-white-kurti',
    description: 'A traditional pure cotton hand-embroidered kurti designed for graceful festive occasions and comfortable everyday wear.',
    mrp: 2999,
    sellingPrice: 1999,
    price: 1999,
    discountPrice: 1999,
    category: 'Kurtis',
    images: [
      'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
      'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
    ],
    fabric: 'Cotton',
    fit: 'Regular',
    careInstructions: 'Dry clean only',
    tags: ['festive', 'cotton', 'white'],
    featured: true,
    newArrival: false,
    bestseller: true,
    isListed: true,
    status: 'listed',
    inStock: true,
    variants: [
      {
        id: 'var-1',
        color: 'White',
        hexCode: '#FFFFFF',
        stock: 10,
        reservedStock: 2,
        images: ['https://res.cloudinary.com/demo/image/upload/sample1.jpg'],
      },
    ],
  };

  it('should return ONLY the name when only name is modified', () => {
    const changes = getChangedProductFields(baseProduct, {
      name: 'Royal Pearl White Kurti',
      slug: baseProduct.slug,
      description: baseProduct.description,
      mrp: baseProduct.mrp,
      sellingPrice: baseProduct.sellingPrice,
      category: baseProduct.category,
      fabric: baseProduct.fabric,
      fit: baseProduct.fit,
      careInstructions: baseProduct.careInstructions,
      tags: baseProduct.tags,
      featured: baseProduct.featured,
      newArrival: baseProduct.newArrival,
      bestseller: baseProduct.bestseller,
      isListed: baseProduct.isListed,
      images: baseProduct.images,
      variants: baseProduct.variants,
    });

    assert.deepStrictEqual(changes, {
      name: 'Royal Pearl White Kurti',
    });
    assert.strictEqual(Object.keys(changes).length, 1);
  });

  it('should return an empty object when no fields are modified', () => {
    const changes = getChangedProductFields(baseProduct, {
      name: baseProduct.name,
      slug: baseProduct.slug,
      description: baseProduct.description,
      mrp: baseProduct.mrp,
      sellingPrice: baseProduct.sellingPrice,
      category: baseProduct.category,
      fabric: baseProduct.fabric,
      fit: baseProduct.fit,
      careInstructions: baseProduct.careInstructions,
      tags: baseProduct.tags,
      featured: baseProduct.featured,
      newArrival: baseProduct.newArrival,
      bestseller: baseProduct.bestseller,
      isListed: baseProduct.isListed,
      images: baseProduct.images,
      variants: baseProduct.variants,
    });

    assert.deepStrictEqual(changes, {});
    assert.strictEqual(Object.keys(changes).length, 0);
  });

  it('should return ONLY price and mrp when only pricing is modified', () => {
    const changes = getChangedProductFields(baseProduct, {
      name: baseProduct.name,
      slug: baseProduct.slug,
      mrp: 3499,
      sellingPrice: baseProduct.sellingPrice,
    });

    assert.strictEqual(changes.name, undefined);
    assert.strictEqual(changes.mrp, 3499);
    assert.strictEqual(changes.price, 3499);
    assert.strictEqual(changes.sellingPrice, undefined);
    assert.strictEqual(changes.discountPrice, 1999);
    assert.strictEqual(changes.description, undefined);
    assert.strictEqual(changes.images, undefined);
    assert.strictEqual(changes.variants, undefined);
  });

  it('should return ONLY category when only category is changed', () => {
    const changes = getChangedProductFields(baseProduct, {
      name: baseProduct.name,
      category: 'Festive Wear',
    });

    assert.deepStrictEqual(changes, {
      category: 'Festive Wear',
    });
  });

  it('should return ONLY isListed and status when visibility is toggled', () => {
    const changes = getChangedProductFields(baseProduct, {
      isListed: false,
    });

    assert.deepStrictEqual(changes, {
      isListed: false,
      status: 'unListed',
    });
  });

  it('should return ONLY fabric and fit when specification is updated', () => {
    const changes = getChangedProductFields(baseProduct, {
      name: baseProduct.name,
      fabric: 'Chanderi Silk',
      fit: 'Slim Fit',
    });

    assert.deepStrictEqual(changes, {
      fabric: 'Chanderi Silk',
      fit: 'Slim Fit',
    });
    assert.strictEqual(Object.keys(changes).length, 2);
  });

  it('should detect tag changes accurately', () => {
    const changes = getChangedProductFields(baseProduct, {
      tags: ['festive', 'cotton', 'white', 'embroidered'],
    });

    assert.deepStrictEqual(changes, {
      tags: ['festive', 'cotton', 'white', 'embroidered'],
    });
  });

  it('should detect variant changes accurately', () => {
    const updatedVariants = [
      {
        ...baseProduct.variants[0],
        stock: 25,
      },
    ];

    const changes = getChangedProductFields(baseProduct, {
      variants: updatedVariants,
    });

    assert.deepStrictEqual(changes, {
      variants: updatedVariants,
    });
  });
});

