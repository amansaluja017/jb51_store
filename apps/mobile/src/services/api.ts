import axios from 'axios';
import superjson from 'superjson';

export const getInitialApiHost = () => {
  return process.env.EXPO_PUBLIC_API_HOST || process.env.EXPO_PUBLIC_API_URL || 'http://10.59.233.189:3001';
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
    const serverError =
      err.response?.data?.error?.json?.message ||
      err.response?.data?.error?.message ||
      err.message ||
      `Request failed with status ${err.response?.status}`;
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
  const filename = fileUri.split('/').pop() || `img_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpeg';
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  formData.append('file', {
    uri: fileUri,
    name: filename,
    type,
  } as any);

  if (options?.productId) {
    formData.append('productId', options.productId);
  }
  if (options?.productVariantId) {
    formData.append('productVariantId', options.productVariantId);
  }
  if (options?.orderIndex !== undefined) {
    formData.append('orderIndex', options.orderIndex.toString());
  }

  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
  };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  console.log(`[Image Upload Request] -> POST ${url} (${filename})`);

  try {
    const response = await axios.post(url, formData, {
      headers,
      timeout: 30000,
    });
    return response.data;
  } catch (err: any) {
    const serverError =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Failed to upload image to server.';
    console.error('[Image Upload Error]:', serverError);
    throw new Error(serverError);
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
  const headers: Record<string, string> = {};
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const response = await axios.delete(`${host}/api/upload`, {
    params: { url },
    headers,
  });
  return response.data;
};
