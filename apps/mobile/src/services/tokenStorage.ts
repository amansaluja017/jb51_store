import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'jb51_jwt_access_token';
const REFRESH_TOKEN_KEY = 'jb51_jwt_refresh_token';
const USER_DATA_KEY = 'jb51_auth_user_data';

// Helper to determine if native SecureStore is supported in current runtime
const isSecureStoreAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

// Safe storage wrapper supporting mobile SecureStore with web/memory fallback
const setItem = async (key: string, value: string): Promise<void> => {
  try {
    const available = await isSecureStoreAvailable();
    if (available) {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
      return;
    }
  } catch (err) {
    console.warn(`[TokenStorage] SecureStore set error for ${key}:`, err);
  }

  // Web fallback: localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[TokenStorage] localStorage set error for ${key}:`, e);
    }
  }
};

const getItem = async (key: string): Promise<string | null> => {
  try {
    const available = await isSecureStoreAvailable();
    if (available) {
      const val = await SecureStore.getItemAsync(key);
      if (val !== null) return val;
    }
  } catch (err) {
    console.warn(`[TokenStorage] SecureStore get error for ${key}:`, err);
  }

  // Web fallback: localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  return null;
};

const deleteItem = async (key: string): Promise<void> => {
  try {
    const available = await isSecureStoreAvailable();
    if (available) {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (err) {
    console.warn(`[TokenStorage] SecureStore delete error for ${key}:`, err);
  }

  // Web fallback: localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
};

export const tokenStorage = {
  getAccessToken: async (): Promise<string | null> => {
    return await getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken: async (token: string): Promise<void> => {
    await setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken: async (): Promise<string | null> => {
    return await getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: async (token: string): Promise<void> => {
    await setItem(REFRESH_TOKEN_KEY, token);
  },

  getUser: async (): Promise<any | null> => {
    const raw = await getItem(USER_DATA_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser: async (user: any): Promise<void> => {
    if (!user) {
      await deleteItem(USER_DATA_KEY);
      return;
    }
    await setItem(USER_DATA_KEY, JSON.stringify(user));
  },

  saveAuthData: async (data: {
    accessToken: string;
    refreshToken?: string;
    user?: any;
  }): Promise<void> => {
    if (data.accessToken) {
      await setItem(ACCESS_TOKEN_KEY, data.accessToken);
    }
    if (data.refreshToken) {
      await setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    if (data.user) {
      await setItem(USER_DATA_KEY, JSON.stringify(data.user));
    }
  },

  clearAuthData: async (): Promise<void> => {
    await Promise.all([
      deleteItem(ACCESS_TOKEN_KEY),
      deleteItem(REFRESH_TOKEN_KEY),
      deleteItem(USER_DATA_KEY),
    ]);
  },
};
