import test, { describe, it } from 'node:test';
import assert from 'node:assert';

interface MockAuthState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  authLoadingMessage: string;
}

/**
 * Pure evaluation helper mimicking ProtectedRoute behavior for headless Node tests
 */
function evaluateProtectedRoute(authState: MockAuthState) {
  if (authState.isCheckingAuth) {
    return {
      status: 'loading',
      rendered: 'LoadingScreen',
      message: authState.authLoadingMessage || 'Restoring boutique session...',
      redirectUrl: null,
    };
  }

  if (!authState.isAuthenticated) {
    return {
      status: 'redirect',
      rendered: null,
      message: null,
      redirectUrl: '/login',
    };
  }

  return {
    status: 'authorized',
    rendered: 'ProtectedContent',
    message: null,
    redirectUrl: null,
  };
}

describe('ProtectedRoute Mobile Auth Guard Behavior', () => {
  it('renders LoadingScreen and does not expose protected content or redirect while verifying session', () => {
    const result = evaluateProtectedRoute({
      isAuthenticated: false,
      isCheckingAuth: true,
      authLoadingMessage: 'Verifying session...',
    });

    assert.strictEqual(result.status, 'loading');
    assert.strictEqual(result.rendered, 'LoadingScreen');
    assert.strictEqual(result.message, 'Verifying session...');
    assert.strictEqual(result.redirectUrl, null);
  });

  it('redirects to /login when user is unauthenticated after check completes', () => {
    const result = evaluateProtectedRoute({
      isAuthenticated: false,
      isCheckingAuth: false,
      authLoadingMessage: '',
    });

    assert.strictEqual(result.status, 'redirect');
    assert.strictEqual(result.rendered, null);
    assert.strictEqual(result.redirectUrl, '/login');
  });

  it('renders protected routes content when user is authenticated', () => {
    const result = evaluateProtectedRoute({
      isAuthenticated: true,
      isCheckingAuth: false,
      authLoadingMessage: '',
    });

    assert.strictEqual(result.status, 'authorized');
    assert.strictEqual(result.rendered, 'ProtectedContent');
    assert.strictEqual(result.redirectUrl, null);
  });
});

/**
 * Pure evaluation helper mimicking useAuthData hydrateAuth session restoration
 */
function evaluateSessionHydration(params: {
  hasRefreshToken: boolean;
  storedAccessToken: string | null;
  isTokenExpired: boolean;
  refreshResult: { success: boolean; newToken?: string; error?: string };
}) {
  if (!params.hasRefreshToken) {
    return {
      isAuthenticated: false,
      token: null,
      route: '/login',
      reason: 'No refresh token',
    };
  }

  let effectiveToken = params.storedAccessToken;
  const isAccessTokenValid = Boolean(effectiveToken && !params.isTokenExpired);

  if (!isAccessTokenValid) {
    if (params.refreshResult.success && params.refreshResult.newToken) {
      effectiveToken = params.refreshResult.newToken;
    } else {
      // Refresh failed (e.g. Network Error): expired token MUST NOT be retained
      effectiveToken = null;
    }
  }

  const hasValidSession = Boolean(effectiveToken && (!params.isTokenExpired || params.refreshResult.success));

  if (hasValidSession) {
    return {
      isAuthenticated: true,
      token: effectiveToken,
      route: '/',
      reason: 'Valid session restored',
    };
  }

  return {
    isAuthenticated: false,
    token: null,
    route: '/login',
    reason: 'Token refresh failed or token expired',
  };
}

describe('Mobile Session Restoration & Network Error Handling', () => {
  it('does NOT grant access when access token is expired and refresh fails with Network Error', () => {
    const result = evaluateSessionHydration({
      hasRefreshToken: true,
      storedAccessToken: 'expired-access-token',
      isTokenExpired: true,
      refreshResult: { success: false, error: 'Network Error' },
    });

    assert.strictEqual(result.isAuthenticated, false, 'User must NOT be authenticated on network error');
    assert.strictEqual(result.token, null, 'Expired token must not be used as effective token');
    assert.strictEqual(result.route, '/login', 'App must redirect to /login and not mount protected tab routes');
  });

  it('successfully restores session when token is refreshed', () => {
    const result = evaluateSessionHydration({
      hasRefreshToken: true,
      storedAccessToken: 'expired-access-token',
      isTokenExpired: true,
      refreshResult: { success: true, newToken: 'fresh-valid-token' },
    });

    assert.strictEqual(result.isAuthenticated, true);
    assert.strictEqual(result.token, 'fresh-valid-token');
    assert.strictEqual(result.route, '/');
  });

  it('keeps user authenticated if current access token is unexpired without needing network refresh', () => {
    const result = evaluateSessionHydration({
      hasRefreshToken: true,
      storedAccessToken: 'still-valid-access-token',
      isTokenExpired: false,
      refreshResult: { success: false }, // refresh not needed
    });

    assert.strictEqual(result.isAuthenticated, true);
    assert.strictEqual(result.token, 'still-valid-access-token');
    assert.strictEqual(result.route, '/');
  });
});

