import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthUser } from '../types';

const ACCESS_TOKEN_KEY = 'jb51_jwt_access_token';
const REFRESH_TOKEN_KEY = 'jb51_jwt_refresh_token';
const USER_DATA_KEY = 'jb51_auth_user_data';
const REVIEWS_MEDIA_ENABLED_KEY = 'jb51_reviews_media_enabled';

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

  hasRefreshToken: async (): Promise<boolean> => {
    const token = await getItem(REFRESH_TOKEN_KEY);
    return !!token && token.trim().length > 0;
  },

  setRefreshToken: async (token: string): Promise<void> => {
    await setItem(REFRESH_TOKEN_KEY, token);
  },

  getUser: async (): Promise<AuthUser | null> => {
    const raw = await getItem(USER_DATA_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  setUser: async (user: AuthUser | null): Promise<void> => {
    if (!user) {
      await deleteItem(USER_DATA_KEY);
      return;
    }
    await setItem(USER_DATA_KEY, JSON.stringify(user));
  },

  saveAuthData: async (data: {
    accessToken: string;
    refreshToken?: string;
    user?: AuthUser;
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

  getReviewsMediaEnabled: async (): Promise<boolean> => {
    try {
      const val = await getItem(REVIEWS_MEDIA_ENABLED_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },

  setReviewsMediaEnabled: async (enabled: boolean): Promise<void> => {
    try {
      await setItem(REVIEWS_MEDIA_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch (err) {
      console.warn('[TokenStorage] setReviewsMediaEnabled error:', err);
    }
  },

  isJwtExpired: (token: string): boolean => {
    try {
      if (!token) return true;
      const parts = token.split('.');
      if (parts.length < 2) return true;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      if (!decoded.exp) return false;
      // Expired if current time is within 30 seconds of exp
      return decoded.exp * 1000 < Date.now() + 30000;
    } catch {
      return false;
    }
  },
};
