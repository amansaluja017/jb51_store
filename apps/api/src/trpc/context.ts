import * as trpcExpress from '@trpc/server/adapters/express';
import { authenticateToken, JwtPayload } from '@repo/auth';

export interface TRPCContext {
  user: JwtPayload | null;
  isStaff: boolean;
}

/**
 * Creates the tRPC context for incoming Express requests.
 * Extracts and verifies JWT bearer token from the Authorization header.
 */
export const createTRPCContext = async ({
  req,
}: trpcExpress.CreateExpressContextOptions): Promise<TRPCContext> => {
  const authHeader = req?.headers?.authorization;
  let user: JwtPayload | null = null;
  let isStaff = false;

  if (authHeader) {
    user = authenticateToken(authHeader);
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      isStaff = true;
    }
  }

  return {
    user,
    isStaff,
  };
};
