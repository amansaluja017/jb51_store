import { initTRPC, TRPCError } from '@trpc/server';
import {
  RegisterInputSchema,
  LoginInputSchema,
  ChangePasswordInputSchema,
  ChangeUsernameInputSchema,
  ChangeEmailInputSchema,
  RefreshTokenInputSchema,
  LogoutInputSchema,
} from './services/validations';
import {
  registerUser,
  loginUser,
  changePassword,
  changeUsername,
  changeEmail,
  refreshAuthToken,
  logoutUser,
} from './services/auth.service';
import { AuthContext } from './middleware';

export interface RouteMeta {
  description?: string;
}

const t = initTRPC.context<AuthContext>().meta<RouteMeta>().create();

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (ctx.isStaff) return next();
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in to perform this action.',
    });
  }
  return next();
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (ctx.isStaff) return next();
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in to perform this action.',
    });
  }
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied: Admin role required.',
    });
  }
  return next();
});

export const authRouter = t.router({
  register: t.procedure
    .meta({ description: 'Register a new customer user account' })
    .input(RegisterInputSchema)
    .mutation(async ({ input }) => {
      try {
        return await registerUser(input);
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Registration failed',
        });
      }
    }),

  login: t.procedure
    .meta({ description: 'Authenticate user credentials and return JWT tokens' })
    .input(LoginInputSchema)
    .mutation(async ({ input }) => {
      try {
        return await loginUser(input);
      } catch (error: any) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message || 'Authentication failed',
        });
      }
    }),

  refreshToken: t.procedure
    .meta({ description: 'Refresh JWT access token using a refresh token' })
    .input(RefreshTokenInputSchema)
    .mutation(async ({ input }) => {
      try {
        return await refreshAuthToken(input.refreshToken);
      } catch (error: any) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message || 'Refresh token failed',
        });
      }
    }),

  changePassword: protectedProcedure
    .meta({ description: 'Change user password' })
    .input(ChangePasswordInputSchema)
    .mutation(async ({ ctx, input }) => {
      const targetUserId = input.userId || ctx.user?.sub;
      if (!targetUserId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User ID missing or not authenticated' });
      }
      if (ctx.user && targetUserId !== ctx.user.sub && ctx.user.role !== 'admin' && !ctx.isStaff) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }
      try {
        return await changePassword({ ...input, userId: targetUserId });
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Password change failed',
        });
      }
    }),

  changeUsername: protectedProcedure
    .meta({ description: 'Change username' })
    .input(ChangeUsernameInputSchema)
    .mutation(async ({ ctx, input }) => {
      const targetUserId = input.userId || ctx.user?.sub;
      if (!targetUserId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User ID missing or not authenticated' });
      }
      if (ctx.user && targetUserId !== ctx.user.sub && ctx.user.role !== 'admin' && !ctx.isStaff) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }
      try {
        return await changeUsername({ ...input, userId: targetUserId });
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Username change failed',
        });
      }
    }),

  changeEmail: protectedProcedure
    .meta({ description: 'Change email address' })
    .input(ChangeEmailInputSchema)
    .mutation(async ({ ctx, input }) => {
      const targetUserId = input.userId || ctx.user?.sub;
      if (!targetUserId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User ID missing or not authenticated' });
      }
      if (ctx.user && targetUserId !== ctx.user.sub && ctx.user.role !== 'admin' && !ctx.isStaff) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }
      try {
        return await changeEmail({ ...input, userId: targetUserId });
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Email change failed',
        });
      }
    }),

  logout: protectedProcedure
    .meta({ description: 'Logout user and revoke active tokens' })
    .input(LogoutInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await logoutUser(ctx.user?.sub, input?.refreshToken);
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Logout failed',
        });
      }
    }),
});
