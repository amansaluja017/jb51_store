import axios from 'axios';
import superjson from 'superjson';
import { Platform } from 'react-native';
import { tokenStorage } from './tokenStorage';

export const getInitialApiHost = () => {
  const host = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_HOST;
  if (!host) {
    return 'http://localhost:3001';
  }
  return host;
};

export const extractErrorMessage = (err: unknown): string => {
  if (!err || typeof err !== 'object') return 'An unexpected error occurred.';

  const errObj = err as {
    response?: {
      status?: number;
      data?: {
        error?: {
          data?: { zodError?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } };
          json?: {
            data?: { zodError?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } };
            message?: string;
          };
          message?: string;
        };
      };
    };
    code?: string;
    message?: string;
  };

  // 1. Check for tRPC ZodError in error data
  const zodError =
    errObj.response?.data?.error?.data?.zodError ||
    errObj.response?.data?.error?.json?.data?.zodError;

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
    errObj.response?.data?.error?.json?.message ||
    errObj.response?.data?.error?.message ||
    errObj.message;

  if (typeof rawMsg === 'string' && rawMsg.trim()) {
    const trimmed = rawMsg.trim();
    // Parse stringified JSON array from Zod
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = parsed
            .map((item: unknown) => {
              if (typeof item === 'object' && item !== null && 'message' in item) {
                return String((item as { message: unknown }).message);
              }
              return typeof item === 'string' ? item : null;
            })
            .filter(Boolean);
          if (list.length > 0) {
            return list.join('\n');
          }
        } else if (parsed && typeof parsed === 'object' && 'message' in parsed) {
          return String((parsed as { message: unknown }).message);
        }
      } catch {
        // Not JSON
      }
    }
    return trimmed;
  }

  if (errObj.response?.status) {
    return `Request failed with status ${errObj.response.status}`;
  }

  const isTimeout = errObj.code === 'ECONNABORTED' || errObj.message?.includes('timeout');
  if (isTimeout) {
    return 'Request timed out. Server took longer than expected.';
  }

  return 'An unexpected error occurred';
};

let refreshTokenPromise: Promise<string | null> | null = null;
type AuthTokenListener = (newToken: string | null) => void;
const tokenListeners = new Set<AuthTokenListener>();

export const onAuthTokenChange = (listener: AuthTokenListener) => {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
};

export const refreshAccessToken = async (apiHost?: string): Promise<string | null> => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    try {
      const storedRefreshToken = await tokenStorage.getRefreshToken();
      if (!storedRefreshToken) {
        console.warn('[refreshAccessToken] No refresh token available in secure storage.');
        return null;
      }

      const host = (apiHost || getInitialApiHost()).trim().replace(/\/$/, '');
      const url = `${host}/trpc/auth.refreshToken`;

      console.log(`[refreshAccessToken] Requesting new access token from ${url}`);
      const response = await axios.post(
        url,
        { json: { refreshToken: storedRefreshToken } },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-trpc-source': 'expo-mobile-react',
          },
          timeout: 20000,
        }
      );

      let data = response.data?.result?.data;
      if (data?.json) {
        data = data.json;
      }

      const newAccessToken = data?.accessToken || data?.token;
      const newRefreshToken = data?.refreshToken;

      if (newAccessToken) {
        await tokenStorage.saveAuthData({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || storedRefreshToken,
          user: data?.user,
        });

        tokenListeners.forEach((listener) => {
          try {
            listener(newAccessToken);
          } catch (e) {
            console.warn('[refreshAccessToken] Listener error:', e);
          }
        });

        console.log('[refreshAccessToken] Access token successfully refreshed and stored in secure storage.');
        return newAccessToken;
      }

      return null;
    } catch (refreshErr: unknown) {
      const errorMessage = refreshErr instanceof Error ? refreshErr.message : String(refreshErr);
      console.warn('[refreshAccessToken] Failed to refresh token:', errorMessage);
      const isAxios = axios.isAxiosError(refreshErr);
      const status = isAxios ? refreshErr.response?.status : undefined;
      const isAuthRejection = status === 401 || status === 403 || status === 400;

      if (isAuthRejection) {
        console.warn('[refreshAccessToken] Refresh token was rejected by server. Clearing credentials.');
        await tokenStorage.clearAuthData();
        tokenListeners.forEach((listener) => {
          try {
            listener(null);
          } catch {
            // ignore
          }
        });
      }
      return null;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

export const trpcRequest = async <T = unknown>(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    body?: unknown;
    input?: unknown;
    token?: string | null;
    apiHost: string;
    _isRetry?: boolean;
  }
): Promise<T> => {
  const cleanHost = options.apiHost.trim().replace(/\/$/, '');
  const url = `${cleanHost}/trpc/${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-trpc-source': 'expo-mobile-react',
  };

  let effectiveToken = options.token;
  if (
    !effectiveToken &&
    !path.startsWith('auth.login') &&
    !path.startsWith('auth.register') &&
    !path.startsWith('auth.refreshToken')
  ) {
    try {
      effectiveToken = await tokenStorage.getAccessToken();
    } catch {
      // ignore
    }
  }

  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const method = options.method || (options.body !== undefined ? 'POST' : 'GET');
  const params: Record<string, string> = {};
  if (method === 'GET') {
    const getInput = options.input !== undefined ? options.input : options.body;
    if (getInput !== undefined) {
      params.input = JSON.stringify({ json: getInput });
    }
  }

  const postPayload = options.body !== undefined ? options.body : options.input;

  console.log(`[tRPC Axios Request] -> ${method} ${url}`, method === 'GET' ? params : postPayload);

  try {
    const response = await axios({
      method,
      url,
      params: method === 'GET' ? (Object.keys(params).length > 0 ? params : undefined) : undefined,
      headers: {
        ...headers,
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      },
      timeout: 60000,
      data: method === 'POST' ? { json: postPayload !== undefined ? postPayload : {} } : undefined,
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
    return (json?.result || json) as T;
  } catch (err: unknown) {
    const serverError = extractErrorMessage(err);
    console.error(`[tRPC Axios Error] ${path}:`, serverError);

    const isAxios = axios.isAxiosError(err);
    const status = isAxios ? err.response?.status : undefined;
    const responseData = isAxios
      ? (err.response?.data as { error?: { data?: { code?: string }; json?: { data?: { code?: string } } } } | undefined)
      : undefined;
    const errorCode = responseData?.error?.data?.code || responseData?.error?.json?.data?.code;

    const isUnauthorized =
      status === 401 ||
      errorCode === 'UNAUTHORIZED' ||
      serverError?.toLowerCase().includes('jwt expired') ||
      serverError?.toLowerCase().includes('authentication required') ||
      serverError?.toLowerCase().includes('invalid or expired');

    const isAuthRoute =
      path.startsWith('auth.login') ||
      path.startsWith('auth.register') ||
      path.startsWith('auth.refreshToken');

    if (isUnauthorized && !isAuthRoute && !options._isRetry) {
      console.log(`[tRPC 401 Token Expired] ${path} returned unauthorized. Refreshing token...`);
      const refreshedToken = await refreshAccessToken(options.apiHost);
      if (refreshedToken) {
        console.log(`[tRPC Retrying] ${path} with newly refreshed access token...`);
        return await trpcRequest<T>(path, {
          ...options,
          token: refreshedToken,
          _isRetry: true,
        });
      }
    }

    throw new Error(serverError);
  }
};

export interface UploadImageResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  format?: string;
  image?: unknown;
  rule?: unknown;
}

export const uploadProductImage = async (
  fileUri: string,
  options?: {
    productId?: string;
    productVariantId?: string;
    orderIndex?: number;
    token?: string | null;
    apiHost?: string;
    targetType?: 'hero' | 'adBanner' | 'secondAdBanner' | 'sale' | 'product' | 'badge';
    minWidth?: number;
    minHeight?: number;
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
      } as unknown as Blob);
    }
  } else {
    // Native React Native mobile (iOS / Android)
    formData.append('file', {
      uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
      name: filename,
      type,
    } as unknown as Blob);
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
  if (options?.targetType) {
    formData.append('targetType', options.targetType);
  }
  if (options?.minWidth !== undefined) {
    formData.append('minWidth', options.minWidth.toString());
  }
  if (options?.minHeight !== undefined) {
    formData.append('minHeight', options.minHeight.toString());
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to upload image to server.';
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[deleteProductImageByUrl Error]:', errorMsg);
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
