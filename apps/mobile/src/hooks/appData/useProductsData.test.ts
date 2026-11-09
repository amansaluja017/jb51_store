import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { getChangedProductFields } from '../../utils/productDiff';
import { Product } from '../../types';

describe('Mobile Product Update Payload Behavior', () => {
  const existingProduct: Product = {
    id: 'prod-456',
    name: 'Silk Banarasi Anarkali',
    slug: 'silk-banarasi-anarkali',
    description: 'Exquisite handwoven Banarasi silk anarkali suit featuring intricate zari work, elegant neckline detailing, and festive flair.',
    mrp: 8999,
    sellingPrice: 6999,
    price: 6999,
    discountPrice: 6999,
    category: 'Anarkali',
    images: [
      'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
      'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
    ],
    fabric: 'Banarasi Silk',
    fit: 'Anarkali Flare',
    careInstructions: 'Dry clean only',
    tags: ['banarasi', 'silk', 'festive'],
    featured: false,
    newArrival: true,
    bestseller: true,
    isListed: true,
    status: 'listed',
    inStock: true,
    variants: [
      {
        id: 'var-1',
        color: 'Emerald Green',
        hexCode: '#50C878',
        stock: 5,
        reservedStock: 0,
        images: ['https://res.cloudinary.com/demo/image/upload/sample1.jpg'],
      },
    ],
  };

  it('sends ONLY { name } when user updates only the product name', async () => {
    let capturedPath = '';
    let capturedBody: { slug?: string; data?: Partial<Product> } = {};

    const mockTrpcRequest = async <T = unknown>(path: string, options?: { method?: 'GET' | 'POST'; body?: unknown }): Promise<T> => {
      capturedPath = path;
      capturedBody = (options?.body || {}) as { slug?: string; data?: Partial<Product> };
      return {
        ...existingProduct,
        ...capturedBody.data,
      } as T;
    };

    // User only changes name in form
    const formValues = {
      name: 'Royal Emerald Banarasi Anarkali',
      slug: existingProduct.slug,
      description: existingProduct.description,
      mrp: existingProduct.mrp,
      sellingPrice: existingProduct.sellingPrice,
      category: existingProduct.category,
      fabric: existingProduct.fabric,
      fit: existingProduct.fit,
      careInstructions: existingProduct.careInstructions,
      tags: existingProduct.tags,
      featured: existingProduct.featured,
      newArrival: existingProduct.newArrival,
      bestseller: existingProduct.bestseller,
      isListed: existingProduct.isListed,
      images: existingProduct.images,
      variants: existingProduct.variants,
    };

    const changedFields = getChangedProductFields(existingProduct, formValues);

    // Call update through simulated handler
    await mockTrpcRequest('products.update', {
      method: 'POST',
      body: { slug: existingProduct.slug, data: changedFields },
    });

    assert.strictEqual(capturedPath, 'products.update');
    assert.strictEqual(capturedBody.slug, 'silk-banarasi-anarkali');
    assert.deepStrictEqual(capturedBody.data, {
      name: 'Royal Emerald Banarasi Anarkali',
    });
    // Ensure all other fields were NOT sent
    assert.strictEqual((capturedBody.data as Product).description, undefined);
    assert.strictEqual((capturedBody.data as Product).mrp, undefined);
    assert.strictEqual((capturedBody.data as Product).sellingPrice, undefined);
    assert.strictEqual((capturedBody.data as Product).category, undefined);
    assert.strictEqual((capturedBody.data as Product).images, undefined);
    assert.strictEqual((capturedBody.data as Product).variants, undefined);
    assert.strictEqual((capturedBody.data as Product).fabric, undefined);
  });

  it('does NOT trigger update network request when no fields were modified', async () => {
    let networkCallMade = false;

    const mockTrpcRequest = async <T = unknown>(): Promise<T> => {
      networkCallMade = true;
      return {} as T;
    };

    // Form submitted with untouched values
    const formValues = {
      name: existingProduct.name,
      slug: existingProduct.slug,
      description: existingProduct.description,
      mrp: existingProduct.mrp,
      sellingPrice: existingProduct.sellingPrice,
      category: existingProduct.category,
      fabric: existingProduct.fabric,
      fit: existingProduct.fit,
      careInstructions: existingProduct.careInstructions,
      tags: existingProduct.tags,
      featured: existingProduct.featured,
      newArrival: existingProduct.newArrival,
      bestseller: existingProduct.bestseller,
      isListed: existingProduct.isListed,
      images: existingProduct.images,
      variants: existingProduct.variants,
    };

    const changedFields = getChangedProductFields(existingProduct, formValues);

    if (Object.keys(changedFields).length > 0) {
      await mockTrpcRequest();
    }

    assert.strictEqual(networkCallMade, false);
    assert.strictEqual(Object.keys(changedFields).length, 0);
  });
});

