import { z } from 'zod';

export const ProductVariantSchema = z.object({
  id: z.string().optional().nullable(),
  color: z.string().min(1, 'Variant color is required'),
  hexCode: z.string().optional().nullable(),
  stock: z.number().int().min(0, 'Stock must be 0 or greater'),
  reservedStock: z.number().int().min(0).optional().nullable().default(0),
  images: z.array(z.string()).optional().nullable().default([]),
});

export const CreateProductVariantSchema = z.object({
  id: z.string().optional().nullable(),
  color: z.string().min(1, 'Color is mandatory for every variant'),
  hexCode: z.string().optional().nullable(),
  stock: z.number().int().min(1, 'Stock must be greater than 0'),
  reservedStock: z.number().int().min(0).optional().nullable().default(0),
  images: z.array(z.string()).optional().nullable().default([]),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable().default(''),
  mrp: z.number().optional().nullable(),
  sellingPrice: z.number().optional().nullable(),
  price: z.number(),
  discountPrice: z.number().optional().nullable(),
  category: z.string().optional().nullable().default('Uncategorized'),
  categoryId: z.string().optional().nullable(),
  images: z.array(z.string()).optional().nullable().default([]),
  fabric: z.string().optional().nullable().default(''),
  fit: z.string().optional().nullable().default(''),
  careInstructions: z.string().optional().nullable().default(''),
  variants: z.array(ProductVariantSchema).optional().nullable().default([]),
  featured: z.boolean().optional().nullable().default(false),
  newArrival: z.boolean().optional().nullable().default(false),
  bestseller: z.boolean().optional().nullable().default(false),
  createdAt: z.string(),
  tags: z.array(z.string()).optional().nullable().default([]),
  isListed: z.boolean().optional().nullable().default(true),
  status: z.enum(['listed', 'unListed', 'discontinued']).optional().nullable().default('listed'),
  inStock: z.boolean().optional().nullable().default(true),
});

// Input Validations
export const GetAllProductsInputSchema = z.void();
export const GetProductBySlugInputSchema = z.object({
  slug: z.string(),
});
export const CreateProductInputSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
}).extend({
  id: z.string().optional().nullable(),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Product slug is required'),
  description: z.string().min(1, 'Product description is required'),
  mrp: z.number().positive('MRP must be greater than 0').optional().nullable(),
  sellingPrice: z.number().positive('Selling price must be greater than 0').optional().nullable(),
  price: z.number().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  categoryId: z.string().uuid().optional().nullable(),
  images: z.array(z.string().min(1)).min(2, 'At least 2 product images are required'),
  variants: z.array(CreateProductVariantSchema).min(1, 'At least one variant with stock is required'),
  createdAt: z.string().optional().nullable(),
});
export const UpdateProductDataSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  mrp: z.number().positive().optional().nullable(),
  sellingPrice: z.number().positive().optional().nullable(),
  price: z.number().positive().optional().nullable(),
  discountPrice: z.number().optional().nullable(),
  category: z.string().min(1).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
  fabric: z.string().optional().nullable(),
  fit: z.string().optional().nullable(),
  careInstructions: z.string().optional().nullable(),
  variants: z.array(ProductVariantSchema).optional().nullable(),
  featured: z.boolean().optional().nullable(),
  newArrival: z.boolean().optional().nullable(),
  bestseller: z.boolean().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  isListed: z.boolean().optional().nullable(),
  status: z.enum(['listed', 'unListed', 'discontinued']).optional().nullable(),
  inStock: z.boolean().optional().nullable(),
});

export const UpdateProductInputSchema = z.object({
  slug: z.string(),
  data: UpdateProductDataSchema,
});
export const DeleteProductInputSchema = z.object({
  slug: z.string(),
});

export const ReorderProductImagesInputSchema = z.object({
  slug: z.string().min(1, 'Product slug or ID is required'),
  images: z.array(z.string().min(1)).min(1, 'At least one image URL is required'),
});

export const ReorderProductImagesOutputSchema = z.object({
  success: z.boolean(),
  images: z.array(z.string()),
});

// Output Validations
export const GetAllProductsOutputSchema = z.array(ProductSchema);
export const GetProductBySlugOutputSchema = ProductSchema.nullable();
export const CreateProductOutputSchema = ProductSchema.extend({
  id: z.string(),
  createdAt: z.string(),
});
export const UpdateProductOutputSchema = ProductSchema.nullable();
export const DeleteProductOutputSchema = z.boolean();
export const ProductStatusEnumSchema = z.enum(['listed', 'unListed', 'discontinued']);

export const GetProductStatusInputSchema = z.object({
  slug: z.string(),
});

export const GetProductStatusOutputSchema = z.object({
  productId: z.string(),
  status: ProductStatusEnumSchema,
  inStock: z.boolean(),
  updatedAt: z.string().optional(),
}).nullable();

export const UpdateProductStatusInputSchema = z.object({
  slug: z.string(),
  status: ProductStatusEnumSchema.optional(),
  inStock: z.boolean().optional(),
}).refine((data) => data.status !== undefined || data.inStock !== undefined, {
  message: 'At least one of status or inStock must be provided',
});

export const UpdateProductStatusOutputSchema = z.object({
  productId: z.string(),
  status: ProductStatusEnumSchema,
  inStock: z.boolean(),
  updatedAt: z.string().optional(),
}).nullable();
// Review Schemas
export const ReviewSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  message: z.string().min(1, "Message is required"),
  stars: z.number().min(1).max(5),
  image: z.string().optional().nullable(),
  video: z.string().optional().nullable(),
  instagramId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  createdAt: z.string(),
  approved: z.boolean().optional(),
});

export const CreateReviewInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  message: z.string().min(1, "Message is required"),
  stars: z.number().min(1).max(5),
  image: z.string().optional().nullable(),
  video: z.string().optional().nullable(),
  instagramId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  approved: z.boolean().optional(),
});

export const UpdateReviewInputSchema = z.object({
  id: z.string(),
  approved: z.boolean().optional(),
});

export const DeleteReviewInputSchema = z.object({
  id: z.string(),
});

