import axios from 'axios';
import superjson from 'superjson';

export const getInitialApiHost = () => {
  return process.env.EXPO_PUBLIC_API_HOST || process.env.EXPO_PUBLIC_API_URL || 'http://10.199.36.189:3001';
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
