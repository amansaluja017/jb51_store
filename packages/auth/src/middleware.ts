import { TRPCError } from '@trpc/server';
import { authenticateToken, JwtPayload } from './jwt';

export interface AuthContext {
  user?: JwtPayload | null;
  isStaff?: boolean;
}

/**
 * Lightweight Express Request/Response interfaces for middleware compatibility
 */
export interface ExpressRequest {
  headers: {
    authorization?: string;
    [key: string]: any;
  };
  user?: JwtPayload;
  [key: string]: any;
}

export interface ExpressResponse {
  status: (code: number) => ExpressResponse;
  json: (body: any) => ExpressResponse;
  [key: string]: any;
}

export type ExpressNextFunction = (err?: any) => void;

/**
 * Check if the context contains a user with the required role
 */
export const checkRole = (
  ctx: AuthContext,
  requiredRole: 'admin' | 'customer' = 'admin'
): boolean => {
  if (ctx.isStaff) return true; // Support legacy staff token
  if (!ctx.user) return false;
  return ctx.user.role === requiredRole;
};

/**
 * Express Middleware for requiring authentication
 */
export const requireAuth = () => {
  return (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    const authHeader = req.headers.authorization;
    const user = authenticateToken(authHeader);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    req.user = user;
    next();
  };
};

/**
 * Express Middleware for enforcing role-based access control
 */
export const requireRole = (allowedRoles: Array<'admin' | 'customer' | 'seller'>) => {
  return (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    const authHeader = req.headers.authorization;
    const user = authenticateToken(authHeader);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    req.user = user;
    next();
  };
};

/**
 * Express Middleware shortcut for requiring admin role
 */
export const requireAdmin = requireRole(['admin']);

/**
 * tRPC Middleware helper to enforce role access on tRPC procedures
 */
export const createRoleMiddleware = (allowedRoles: Array<'admin' | 'customer' | 'seller'>) => {
  return async ({ ctx, next }: { ctx: AuthContext; next: () => Promise<any> }) => {
    if (ctx.isStaff && allowedRoles.includes('admin')) {
      return next();
    }
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required to access this resource',
      });
    }
    if (!allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Access denied: Requires one of [${allowedRoles.join(', ')}] role`,
      });
    }
    return next();
  };
};

export const adminMiddleware = createRoleMiddleware(['admin']);
export const customerMiddleware = createRoleMiddleware(['customer', 'admin']);
