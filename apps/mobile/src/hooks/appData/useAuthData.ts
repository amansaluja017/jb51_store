import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getInitialApiHost,
  trpcRequest as trpcRequestService,
  onAuthTokenChange,
  refreshAccessToken,
} from '../../services/api';
import { tokenStorage } from '../../services/tokenStorage';
import { AuthUser } from '../../types';

interface AuthResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  user?: AuthUser;
}

interface UseAuthDataProps {
  showAlert?: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
  onLogoutCleanup?: () => void;
}

export function useAuthData({ showAlert, onLogoutCleanup }: UseAuthDataProps = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authLoadingMessage, setAuthLoadingMessage] = useState('Verifying credentials...');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string; userName?: string; role?: string } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [apiHost, setApiHost] = useState(getInitialApiHost);
  const [showConfig, setShowConfig] = useState(false);

  const tokenRef = useRef(token);
  tokenRef.current = token;
  const apiHostRef = useRef(apiHost);
  apiHostRef.current = apiHost;

  // Stable helper function to invoke backend tRPC endpoints
  const trpcRequest = useCallback(
    <T = unknown>(
      path: string,
      options: { method?: 'GET' | 'POST'; body?: unknown; input?: unknown; signal?: AbortSignal } = {}
    ): Promise<T> => {
      return trpcRequestService<T>(path, { ...options, token: tokenRef.current, apiHost: apiHostRef.current });
    },
    []
  );

  useEffect(() => {
    let isMounted = true;
    const hydrateAuth = async () => {
      try {
        const storedRefreshToken = await tokenStorage.getRefreshToken();

        if (!storedRefreshToken) {
          console.log('[useAuthData] No refresh token found in secure storage. Showing login page.');
          if (isMounted) {
            setIsAuthenticated(false);
            setIsCheckingAuth(false);
          }
          return;
        }

        console.log('[useAuthData] Refresh token present. Showing loading page while restoring session...');
        if (isMounted) {
          setIsCheckingAuth(true);
          setAuthLoadingMessage('Restoring boutique session...');
        }

        let storedAccessToken = await tokenStorage.getAccessToken();
        let storedUser = await tokenStorage.getUser();

        const needsRefresh = !storedAccessToken || tokenStorage.isJwtExpired(storedAccessToken);

        if (needsRefresh) {
          if (isMounted) {
            setAuthLoadingMessage('Refreshing security credentials...');
          }
          try {
            const refreshedToken = await refreshAccessToken(apiHost);
            if (refreshedToken) {
              storedAccessToken = refreshedToken;
              storedUser = await tokenStorage.getUser();
            }
          } catch (refreshErr) {
            console.warn('[useAuthData] Token refresh failed during startup:', refreshErr);
          }
        }

        if (storedAccessToken && isMounted) {
          setToken(storedAccessToken);
          if (storedUser) {
            setCurrentUser(storedUser);
            if (storedUser.email) setEmail(storedUser.email);
            if (storedUser.userName) setUsername(storedUser.userName);
          }
          setIsAuthenticated(true);
        } else if (isMounted) {
          console.warn('[useAuthData] Could not restore valid session, showing login.');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.warn('[useAuthData] Error hydrating auth token from secure storage:', err);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    hydrateAuth();

    const unsubscribe = onAuthTokenChange((newToken) => {
      if (!isMounted) return;
      setToken(newToken);
      if (!newToken) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogin = async (formData?: { email?: string; username?: string; password?: string }) => {
    const inputIdentifier = formData?.email ?? formData?.username ?? email ?? username;
    const inputPassword = formData?.password ?? password;
    const identifier = inputIdentifier.trim();

    if (!identifier || !inputPassword) {
      showAlert?.('Validation Required', 'Please enter both email and password.', 'error');
      return;
    }

    setIsLoggingIn(true);
    try {
      const authResult = await trpcRequest<AuthResponse>('auth.login', {
        method: 'POST',
        body: { identifier, password: inputPassword },
      });

      const tokenValue = authResult?.accessToken || authResult?.token;
      const refreshTokenValue = authResult?.refreshToken;
      if (tokenValue) {
        if (authResult?.user?.role && authResult.user.role !== 'admin' && authResult.user.role !== 'superadmin') {
          throw new Error('Access denied: Admin or Superadmin privileges required.');
        }
        const userObj: AuthUser = authResult?.user || { userName: identifier, role: 'admin' };
        await tokenStorage.saveAuthData({
          accessToken: tokenValue,
          refreshToken: refreshTokenValue,
          user: userObj,
        });
        setToken(tokenValue);
        setCurrentUser(userObj);
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
        showAlert?.('Authentication Successful', `Welcome back ${authResult?.user?.name || authResult?.user?.userName || identifier}!`, 'success');
      } else {
        throw new Error('Invalid credentials or missing auth token');
      }
    } catch (err: unknown) {
      console.error('[handleLogin Error]:', err);
      const message = err instanceof Error ? err.message : 'Invalid admin credentials.';
      showAlert?.('Authentication Error', message, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    // 1. Instantly clear tokens and reset auth state so the user is logged out immediately
    const refreshToken = await tokenStorage.getRefreshToken();
    await tokenStorage.clearAuthData();
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsCheckingAuth(false);
    onLogoutCleanup?.();

    // 2. Notify backend of token revocation asynchronously without blocking the UI
    if (refreshToken) {
      trpcRequest('auth.logout', {
        method: 'POST',
        body: { refreshToken },
      }).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        console.log('[handleLogout] Background logout notice:', message);
      });
    }

    showAlert?.('Logged Out', 'Your admin session has ended.', 'info');
  };

  const handleChangeUsername = async (newUserName: string) => {
    await trpcRequest('auth.changeUsername', {
      method: 'POST',
      body: { newUserName },
    });
    setCurrentUser((prev: AuthUser | null) => {
      const updated: AuthUser = prev ? { ...prev, userName: newUserName } : { userName: newUserName };
      tokenStorage.setUser(updated);
      return updated;
    });
    setUsername(newUserName);
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    await trpcRequest('auth.changePassword', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
  };

  const handleChangeEmail = async (newEmail: string) => {
    await trpcRequest('auth.changeEmail', {
      method: 'POST',
      body: { newEmail },
    });
    setCurrentUser((prev: AuthUser | null) => {
      const updated: AuthUser = prev ? { ...prev, email: newEmail } : { email: newEmail };
      tokenStorage.setUser(updated);
      return updated;
    });
    setEmail(newEmail);
  };

  const handleUpdateUser = async (data: {
    email?: string;
    userName?: string;
    password?: string;
    currentPassword?: string;
  }) => {
    const res = await trpcRequest<AuthResponse>('auth.update', {
      method: 'POST',
      body: data,
    });
    if (res?.accessToken) {
      await tokenStorage.saveAuthData({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
      });
      setToken(res.accessToken);
    }
    if (res?.user) {
      setCurrentUser(res.user);
      if (res.user.email) setEmail(res.user.email);
      if (res.user.userName) setUsername(res.user.userName);
      await tokenStorage.setUser(res.user);
    }
    return res;
  };

  const handleDeleteAccount = async (passwordInput?: string) => {
    await trpcRequest('auth.delete', {
      method: 'POST',
      body: { password: passwordInput },
    });
    await handleLogout();
  };

  return {
    isAuthenticated,
    setIsAuthenticated,
    isCheckingAuth,
    setIsCheckingAuth,
    authLoadingMessage,
    setAuthLoadingMessage,
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    token,
    setToken,
    currentUser,
    setCurrentUser,
    isLoggingIn,
    apiHost,
    setApiHost,
    showConfig,
    setShowConfig,
    handleLogin,
    handleLogout,
    handleChangeUsername,
    handleChangePassword,
    handleChangeEmail,
    handleUpdateUser,
    handleDeleteAccount,
    trpcRequest,
  };
}

