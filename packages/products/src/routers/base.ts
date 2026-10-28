import { initTRPC, TRPCError } from '@trpc/server';

export interface RouteMeta {
  description?: string;
}

export interface TRPCContext {
  user?: { id?: string; email?: string; userName?: string; role?: string } | null;
  isStaff?: boolean;
}

export const t = initTRPC.context<TRPCContext>().meta<RouteMeta>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (ctx.isStaff) return next();
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication token required',
    });
  }
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied: Admin role required',
    });
  }
  return next();
});
