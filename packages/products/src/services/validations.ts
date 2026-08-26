import { z } from 'zod';

export const ProductVariantSchema = z.object({
  color: z.string(),
  size: z.string(),
  stock: z.number(),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number(),
  discountPrice: z.number().optional(),
  category: z.string(),
  images: z.array(z.string()),
  fabric: z.string(),
  fit: z.string(),
  careInstructions: z.string(),
  variants: z.array(ProductVariantSchema),
  featured: z.boolean(),
  newArrival: z.boolean(),
  bestseller: z.boolean(),
  createdAt: z.string(),
  tags: z.array(z.string()).optional(),
  isListed: z.boolean().optional(),
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
export const CreateProductOutputSchema = ProductSchema;
export const UpdateProductOutputSchema = ProductSchema.nullable();
export const DeleteProductOutputSchema = z.boolean();
