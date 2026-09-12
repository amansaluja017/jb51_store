import { z } from 'zod';

export const ProductVariantSchema = z.object({
  color: z.string(),
  size: z.string().optional(),
  stock: z.number(),
  reservedStock: z.number().optional().default(0),
  images: z.array(z.string()).optional().default([]),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().default(''),
  price: z.number(),
  discountPrice: z.number().optional(),
  category: z.string().optional().default('Uncategorized'),
  images: z.array(z.string()).optional().default([]),
  fabric: z.string().optional().default(''),
  fit: z.string().optional().default(''),
  careInstructions: z.string().optional().default(''),
  variants: z.array(ProductVariantSchema).optional().default([]),
  featured: z.boolean().optional().default(false),
  newArrival: z.boolean().optional().default(false),
  bestseller: z.boolean().optional().default(false),
  createdAt: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  isListed: z.boolean().optional().default(true),
  inStock: z.boolean().optional().default(true),
});

// Input Validations
export const GetAllProductsInputSchema = z.void();
export const GetProductBySlugInputSchema = z.object({
  slug: z.string(),
});
export const CreateProductInputSchema = ProductSchema;
export const UpdateProductInputSchema = z.object({
  slug: z.string(),
  data: ProductSchema.partial(),
});
export const DeleteProductInputSchema = z.object({
  slug: z.string(),
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
});

export const UpdateReviewInputSchema = z.object({
  id: z.string(),
  approved: z.boolean().optional(),
});

export const DeleteReviewInputSchema = z.object({
  id: z.string(),
});

