import crypto from 'crypto';
import { db, user, token as tokenTable } from '@repo/db';
import { eq, or, and } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../password';
import { generateAuthTokens, verifyRefreshToken } from '../jwt';
import type {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  ChangeUsernameInput,
  ChangeEmailInput,
} from './validations';

export const sanitizeUser = (rawUser: typeof user.$inferSelect, fallbackUserName?: string) => {
  const { password, ...sanitized } = rawUser;
  return {
    ...sanitized,
    userName: (sanitized as any).name || (sanitized as any).userName || fallbackUserName || sanitized.email.split('@')[0],
  };
};

export const registerUser = async (input: RegisterInput) => {
  const existingEmail = await db
    .select()
    .from(user)
    .where(eq(user.email, input.email.toLowerCase()));

  if (existingEmail.length > 0) {
    throw new Error('A user with this email address already exists');
  }

  const hashedPassword = await hashPassword(input.password);

  try {
    const [newUser] = await db
      .insert(user)
      .values({
        email: input.email.toLowerCase(),
        password: hashedPassword,
        role: 'customer',
      })
      .returning();

    const sanitized = sanitizeUser(newUser, input.userName);
    const tokens = await generateAuthTokens({
      id: sanitized.id,
      email: sanitized.email,
      userName: sanitized.userName,
      role: sanitized.role,
    });

    return {
      user: sanitized,
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  } catch (err: any) {
    if (err.code === '23505' || err.message?.includes('unique constraint') || err.message?.includes('UNIQUE')) {
      if (err.message?.includes('email') || err.detail?.includes('email')) {
        throw new Error('A user with this email address already exists');
      }
      if (err.message?.includes('user_name') || err.detail?.includes('user_name')) {
        throw new Error('A user with this username already exists');
      }
    }
    throw err;
  }
};

export const loginUser = async (input: LoginInput) => {
  const identifierLower = input.identifier.toLowerCase();

  const [foundUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, identifierLower));

  if (!foundUser) {
    throw new Error('Invalid email/username or password');
  }

  const isValidPassword = await verifyPassword(input.password, foundUser.password);
  if (!isValidPassword) {
    throw new Error('Invalid email/username or password');
  }

  const sanitized = sanitizeUser(foundUser);
  const tokens = await generateAuthTokens({
    id: sanitized.id,
    email: sanitized.email,
    userName: sanitized.userName,
    role: sanitized.role,
  });

  return {
    user: sanitized,
    token: tokens.accessToken,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

export const refreshAuthToken = async (refreshToken: string) => {
  let decoded: any;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new Error('Invalid or expired refresh token');
  }

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const [storedToken] = await db
    .select()
    .from(tokenTable)
    .where(
      and(
        eq(tokenTable.tokenHash, tokenHash),
        eq(tokenTable.isRevoked, false)
      )
    );

  if (!storedToken || new Date() > storedToken.expiresAt) {
    throw new Error('Invalid or revoked refresh token');
  }

  // Revoke stored refresh token (rotate)
  await db
    .update(tokenTable)
    .set({ isRevoked: true })
    .where(eq(tokenTable.id, storedToken.id));

  const [foundUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, decoded.sub));

  if (!foundUser) {
    throw new Error('User not found');
  }

  const sanitized = sanitizeUser(foundUser);
  const tokens = await generateAuthTokens({
    id: sanitized.id,
    email: sanitized.email,
    userName: sanitized.userName,
    role: sanitized.role,
  });

  return {
    user: sanitized,
    token: tokens.accessToken,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

export const changePassword = async (input: ChangePasswordInput) => {
  const [foundUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, input.userId!));

  if (!foundUser) {
    throw new Error('User not found');
  }

  const isValidPassword = await verifyPassword(input.currentPassword, foundUser.password);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }

  const newHashedPassword = await hashPassword(input.newPassword);

  const [updatedUser] = await db
    .update(user)
    .set({
      password: newHashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.userId!))
    .returning();

  return {
    success: true,
    user: sanitizeUser(updatedUser),
  };
};

export const changeUsername = async (input: ChangeUsernameInput) => {
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, input.userId!));

  if (!existingUser) {
    throw new Error('User not found');
  }

  const [updatedUser] = await db
    .update(user)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.userId!))
    .returning();

  return sanitizeUser(updatedUser);
};

export const changeEmail = async (input: ChangeEmailInput) => {
  const newEmailLower = input.newEmail.toLowerCase();

  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, newEmailLower));

  if (existingUser && existingUser.id !== input.userId) {
    throw new Error('Email address is already in use by another account');
  }

  try {
    const [updatedUser] = await db
      .update(user)
      .set({
        email: newEmailLower,
        updatedAt: new Date(),
      })
      .where(eq(user.id, input.userId!))
      .returning();

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return sanitizeUser(updatedUser);
  } catch (err: any) {
    if (err.code === '23505' || err.message?.includes('unique constraint') || err.message?.includes('UNIQUE')) {
      throw new Error('Email address is already in use by another account');
    }
    throw err;
  }
};

export const logoutUser = async (userId?: string, refreshToken?: string) => {
  if (!userId) {
    throw new Error('User ID is required for logout');
  }
  if (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await db
      .update(tokenTable)
      .set({ isRevoked: true })
      .where(and(eq(tokenTable.tokenHash, tokenHash), eq(tokenTable.userId, userId)));
  } else {
    await db
      .update(tokenTable)
      .set({ isRevoked: true })
      .where(eq(tokenTable.userId, userId));
  }
  return { success: true, message: 'Logged out successfully' };
};
