import { z } from 'zod';

export const ProductVariantSchema = z.object({
  id: z.string().optional(),
  color: z.string().min(1, 'Variant color is required'),
  hexCode: z.string().optional(),
  stock: z.number().int().min(0, 'Stock must be 0 or greater'),
  reservedStock: z.number().int().min(0).optional().default(0),
  images: z.array(z.string()).optional().default([]),
});

export const CreateProductVariantSchema = z.object({
  id: z.string().optional(),
  color: z.string().min(1, 'Color is mandatory for every variant'),
  hexCode: z.string().optional(),
  stock: z.number().int().min(1, 'Stock must be greater than 0'),
  reservedStock: z.number().int().min(0).optional().default(0),
  images: z.array(z.string()).optional().default([]),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().default(''),
  mrp: z.number().optional(),
  sellingPrice: z.number().optional(),
  price: z.number(),
  discountPrice: z.number().optional(),
  category: z.string().optional().default('Uncategorized'),
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
  fabric: z.string().optional().default(''),
  fit: z.string().optional().default(''),
  careInstructions: z.string().optional().default(''),
  variants: z.array(ProductVariantSchema).optional().default([]),
  featured: z.boolean().optional().default(false),
  newArrival: z.boolean().optional().default(false),
  bestseller: z.boolean().optional().default(false),
  createdAt: z.string(),
  tags: z.array(z.string()).optional().default([]),
  isListed: z.boolean().optional().default(true),
  status: z.enum(['listed', 'unListed', 'discontinued']).optional().default('listed'),
  inStock: z.boolean().optional().default(true),
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
  id: z.string().optional(),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Product slug is required'),
  description: z.string().min(1, 'Product description is required'),
  mrp: z.number().positive('MRP must be greater than 0').optional(),
  sellingPrice: z.number().positive('Selling price must be greater than 0').optional(),
  price: z.number().optional(),
  category: z.string().min(1, 'Category is required'),
  categoryId: z.string().uuid().optional(),
  images: z.array(z.string().min(1)).min(2, 'At least 2 product images are required'),
  variants: z.array(CreateProductVariantSchema).min(1, 'At least one variant with stock is required'),
  createdAt: z.string().optional(),
});
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

