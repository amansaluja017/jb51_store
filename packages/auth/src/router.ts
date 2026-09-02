import { initTRPC, TRPCError } from '@trpc/server';
import {
  RegisterInputSchema,
  LoginInputSchema,
  ChangePasswordInputSchema,
  ChangeUsernameInputSchema,
  ChangeEmailInputSchema,
  RefreshTokenInputSchema,
} from './services/validations';
import {
  registerUser,
  loginUser,
  changePassword,
  changeUsername,
  changeEmail,
  refreshAuthToken,
} from './services/auth.service';
import { AuthContext } from './middleware';

export interface RouteMeta {
  description?: string;
}

const t = initTRPC.context<AuthContext>().meta<RouteMeta>().create();

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

  changePassword: adminProcedure
    .meta({ description: 'Change user password (Admin protection)' })
    .input(ChangePasswordInputSchema)
    .mutation(async ({ input }) => {
      try {
        return await changePassword(input);
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Password change failed',
        });
      }
    }),

  changeUsername: adminProcedure
    .meta({ description: 'Change username (Admin protection)' })
    .input(ChangeUsernameInputSchema)
    .mutation(async ({ input }) => {
      try {
        return await changeUsername(input);
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Username change failed',
        });
      }
    }),

  changeEmail: adminProcedure
    .meta({ description: 'Change email address (Admin protection)' })
    .input(ChangeEmailInputSchema)
    .mutation(async ({ input }) => {
      try {
        return await changeEmail(input);
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Email change failed',
        });
      }
    }),
});
