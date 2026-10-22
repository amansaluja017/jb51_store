import axios from 'axios';
import superjson from 'superjson';
import { Platform } from 'react-native';

export const getInitialApiHost = () => {
  const host = process.env.EXPO_PUBLIC_API_HOST || process.env.EXPO_PUBLIC_API_URL;
  if (!host) {
    return 'http://localhost:3001';
  }
  return host;
};

export const extractErrorMessage = (err: any): string => {
  if (!err) return 'An unexpected error occurred.';

  // 1. Check for tRPC ZodError in error data
  const zodError =
    err.response?.data?.error?.data?.zodError ||
    err.response?.data?.error?.json?.data?.zodError;

  if (zodError) {
    const fieldErrors = zodError.fieldErrors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const messages: string[] = [];
      for (const [field, errors] of Object.entries(fieldErrors)) {
        if (Array.isArray(errors) && errors.length > 0) {
          messages.push(...errors);
        }
      }
      if (messages.length > 0) {
        return messages.join('\n');
      }
    }
    if (Array.isArray(zodError.formErrors) && zodError.formErrors.length > 0) {
      return zodError.formErrors.join('\n');
    }
  }

  // 2. Check for message from server response or error object
  const rawMsg =
    err.response?.data?.error?.json?.message ||
    err.response?.data?.error?.message ||
    err.message;

  if (typeof rawMsg === 'string' && rawMsg.trim()) {
    const trimmed = rawMsg.trim();
    // Parse stringified JSON array from Zod
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = parsed
            .map((item: any) => item?.message || (typeof item === 'string' ? item : null))
            .filter(Boolean);
          if (list.length > 0) {
            return list.join('\n');
          }
        } else if (parsed && typeof parsed === 'object' && parsed.message) {
          return String(parsed.message);
        }
      } catch {
        // Not JSON
      }
    }
    return trimmed;
  }

  if (err.response?.status) {
    return `Request failed with status ${err.response.status}`;
  }

  const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
  if (isTimeout) {
    return 'Request timed out. Server took longer than expected.';
  }

  return 'An unexpected error occurred';
};

export const trpcRequest = async (
  path: string,
  options: {
    method?: 'GET' | 'POST';
    body?: any;
    input?: any;
    token?: string | null;
    apiHost: string;
  }
) => {
  const cleanHost = options.apiHost.trim().replace(/\/$/, '');
  const url = `${cleanHost}/trpc/${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-trpc-source': 'expo-mobile-react',
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const method = options.method || (options.body !== undefined ? 'POST' : 'GET');
  const params: Record<string, string> = {};
  if (method === 'GET' && options.input !== undefined) {
    params.input = JSON.stringify({ json: options.input });
  }

  console.log(`[tRPC Axios Request] -> ${method} ${url}`, method === 'GET' ? params : options.body);

  try {
    const response = await axios({
      method,
      url,
      params: method === 'GET' && options.input !== undefined ? params : undefined,
      headers,
      timeout: 60000,
      data: method === 'POST' && options.body !== undefined ? { json: options.body } : undefined,
    });

    const json = response.data;

    if (json?.result?.data) {
      if (json.result.data.json !== undefined) {
        try {
          return superjson.deserialize(json.result.data);
        } catch {
          return json.result.data.json;
        }
      }
      return json.result.data;
    }
    return json?.result || json;
  } catch (err: any) {
    const serverError = extractErrorMessage(err);
    console.error(`[tRPC Axios Error] ${path}:`, serverError);
    throw new Error(serverError);
  }
};

export interface UploadImageResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  image?: any;
}

export const uploadProductImage = async (
  fileUri: string,
  options?: {
    productId?: string;
    productVariantId?: string;
    orderIndex?: number;
    token?: string | null;
    apiHost?: string;
  }
): Promise<UploadImageResult> => {
  // If already an HTTP/HTTPS URL, no upload needed
  if (fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
    return { url: fileUri };
  }

  const host = (options?.apiHost || getInitialApiHost()).trim().replace(/\/$/, '');
  const url = `${host}/api/upload`;

  const formData = new FormData();
  const rawFilename = fileUri.split('/').pop()?.split('?')[0]?.split('#')[0] || `img_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(rawFilename);
  const ext = match ? match[1].toLowerCase() : 'jpeg';
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
  const filename = /\.(jpe?g|png|webp|gif|bmp|heic)$/i.test(rawFilename)
    ? rawFilename
    : `${rawFilename}.${ext === 'jpeg' ? 'jpg' : ext}`;

  if (Platform.OS === 'web' || fileUri.startsWith('blob:') || fileUri.startsWith('data:')) {
    try {
      const blobRes = await fetch(fileUri);
      const blob = await blobRes.blob();
      formData.append('file', blob, filename);
    } catch (blobErr) {
      console.warn('[uploadProductImage] Failed to convert URI to Blob on Web:', blobErr);
      formData.append('file', {
        uri: fileUri,
        name: filename,
        type,
      } as any);
    }
  } else {
    // Native React Native mobile (iOS / Android)
    formData.append('file', {
      uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
      name: filename,
      type,
    } as any);
  }

  if (options?.productId) {
    formData.append('productId', options.productId);
  }
  if (options?.productVariantId) {
    formData.append('productVariantId', options.productVariantId);
  }
  if (options?.orderIndex !== undefined) {
    formData.append('orderIndex', options.orderIndex.toString());
  }

  // NOTE: Do NOT set 'Content-Type': 'multipart/form-data' manually.
  // The fetch networking layer automatically generates the header with the correct boundary parameter.
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  console.log(`[Image Upload Request] -> POST ${url} (${filename})`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        data?.error ||
        data?.message ||
        `Upload failed with server status ${response.status}`;
      throw new Error(errorMsg);
    }

    if (!data) {
      throw new Error('Received empty response from upload server.');
    }

    return data;
  } catch (err: any) {
    const errorMsg = err.message || 'Failed to upload image to server.';
    console.error('[Image Upload Error]:', errorMsg);
    throw new Error(errorMsg);
  }
};

export const uploadMultipleProductImages = async (
  fileUris: string[],
  options?: {
    productId?: string;
    productVariantId?: string;
    token?: string | null;
    apiHost?: string;
  }
): Promise<UploadImageResult[]> => {
  const results: UploadImageResult[] = [];
  for (let i = 0; i < fileUris.length; i++) {
    const uri = fileUris[i];
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      results.push({ url: uri });
    } else {
      const res = await uploadProductImage(uri, {
        ...options,
        orderIndex: i,
      });
      results.push(res);
    }
  }
  return results;
};

export const getProductDbImages = async (productId: string, apiHost?: string) => {
  const host = (apiHost || getInitialApiHost()).trim().replace(/\/$/, '');
  const response = await axios.get(`${host}/api/products/${productId}/images`);
  return response.data?.images || [];
};

export const deleteProductImage = async (imageId: string, apiHost?: string) => {
  const host = (apiHost || getInitialApiHost()).trim().replace(/\/$/, '');
  const response = await axios.delete(`${host}/api/products/images/${imageId}`);
  return response.data;
};

export const deleteProductImageByUrl = async (
  url: string,
  options?: { apiHost?: string; token?: string | null }
) => {
  const host = (options?.apiHost || getInitialApiHost()).trim().replace(/\/$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  try {
    const response = await axios.delete(`${host}/api/upload`, {
      params: { url },
      headers,
    });
    return response.data;
  } catch (err: any) {
    console.warn('[deleteProductImageByUrl Error]:', err?.message || err);
    return null;
  }
};

export const reorderProductImagesApi = async (
  slug: string,
  images: string[],
  options?: { apiHost?: string; token?: string | null }
) => {
  const host = (options?.apiHost || getInitialApiHost()).trim().replace(/\/$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const response = await axios.patch(
    `${host}/api/products/images/reorder`,
    { slug, images },
    { headers, timeout: 20000 }
  );
  return response.data;
};
