import { createDocsRouter } from '@repo/docs';
import { appRouter } from '../router.js';

/**
 * Custom REST endpoints (such as image uploads and health check)
 * merged alongside all automatically generated tRPC procedures.
 */
const restPaths = {
  '/health': {
    get: {
      tags: ['System'],
      summary: 'Service Health Check',
      description: 'Returns operational status, service name, and server timestamp.',
      operationId: 'getHealthStatus',
      responses: {
        '200': {
          description: 'API is operational',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ok' },
                  service: { type: 'string', example: 'JB51 Store API' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/upload': {
    post: {
      tags: ['Uploads'],
      summary: 'Upload Single Image',
      description:
        'Uploads a single image to Cloudinary, validates dimensions, and saves record to database.',
      operationId: 'uploadSingleImage',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['file'],
              properties: {
                file: { type: 'string', format: 'binary' },
                productId: { type: 'string' },
                productVariantId: { type: 'string' },
                orderIndex: { type: 'integer', default: 0 },
                folder: { type: 'string', default: 'jb51/products' },
                targetType: {
                  type: 'string',
                  enum: ['hero', 'adBanner', 'secondAdBanner', 'sale', 'product', 'badge'],
                },
                minWidth: { type: 'integer' },
                minHeight: { type: 'integer' },
              },
            },
          },
        },
      },
      responses: {
        '200': { description: 'Image uploaded successfully' },
        '400': { description: 'Validation failed' },
      },
    },
    delete: {
      tags: ['Uploads'],
      summary: 'Delete Image Asset by Target',
      description: 'Deletes an uploaded asset from Cloudinary and DB by URL or publicId.',
      operationId: 'deleteUploadAsset',
      parameters: [
        { name: 'url', in: 'query', schema: { type: 'string' } },
        { name: 'publicId', in: 'query', schema: { type: 'string' } },
      ],
      responses: {
        '200': { description: 'Asset removed' },
      },
    },
  },
  '/api/upload/multiple': {
    post: {
      tags: ['Uploads'],
      summary: 'Upload Multiple Images in Parallel',
      description: 'Uploads up to 15 images with dimension verification.',
      operationId: 'uploadMultipleImages',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['images'],
              properties: {
                images: { type: 'array', items: { type: 'string', format: 'binary' } },
                productId: { type: 'string' },
                productVariantId: { type: 'string' },
                startingOrderIndex: { type: 'integer', default: 0 },
              },
            },
          },
        },
      },
      responses: {
        '200': { description: 'All images uploaded' },
      },
    },
  },
  '/api/products/{productId}/images': {
    get: {
      tags: ['Uploads'],
      summary: 'Get Product Images',
      description: 'Fetches all images for a given product ID.',
      operationId: 'getProductImages',
      parameters: [
        { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': { description: 'Images retrieved' },
      },
    },
  },
  '/api/products/images/{id}': {
    delete: {
      tags: ['Uploads'],
      summary: 'Delete Product Image by ID',
      description: 'Deletes a product image record and purges it from Cloudinary.',
      operationId: 'deleteProductImageById',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': { description: 'Image deleted' },
      },
    },
  },
  '/api/products/images/reorder': {
    patch: {
      tags: ['Uploads'],
      summary: 'Reorder Product Images',
      description: 'Updates image display ordering.',
      operationId: 'reorderProductImages',
      responses: {
        '200': { description: 'Images reordered' },
      },
    },
  },
};

/**
 * Automatically creates the OpenAPI documentation and Scalar UI router.
 * Any procedure added to appRouter is automatically documented on the fly!
 */
export const docsRouter = createDocsRouter({
  router: appRouter,
  info: {
    title: 'JB51 Store API',
    version: '1.0.0',
    description: `## Overview
Interactive OpenAPI documentation powered by **@repo/docs** and **Scalar**.
All tRPC procedures from **@repo/auth**, **@repo/products**, and **apps/api** are **automatically discovered** and documented dynamically at runtime with their full Zod input/output schemas.`,
  },
  theme: 'deepSpace',
  pageTitle: 'JB51 Store API Documentation',
  extraPaths: restPaths,
});

export default docsRouter;
