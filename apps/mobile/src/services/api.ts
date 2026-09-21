import axios from 'axios';
import superjson from 'superjson';
import { Platform } from 'react-native';

export const getInitialApiHost = () => {
  const host = process.env.EXPO_PUBLIC_API_HOST || process.env.EXPO_PUBLIC_API_URL;
  if (!host) {
    throw new Error('API host is not configured. Please set EXPO_PUBLIC_API_HOST or EXPO_PUBLIC_API_URL.');
  }
  return host;
};

export const trpcRequest = async (
  path: string,
  options: { method?: 'GET' | 'POST'; body?: any; token?: string | null; apiHost: string }
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

  const method = options.method || 'GET';
  console.log(`[tRPC Axios Request] -> ${method} ${url}`);

  try {
    const response = await axios({
      method,
      url,
      headers,
      timeout: 10000,
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
    const statusFallback = err.response?.status
      ? `Request failed with status ${err.response.status}`
      : undefined;
    const serverError =
      err.response?.data?.error?.json?.message ||
      err.response?.data?.error?.message ||
      statusFallback ||
      err.message ||
      'Unknown error';
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
