import { db, user } from '@repo/db';
import { eq, or } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../password';
import { generateAuthTokens, verifyRefreshToken } from '../jwt';
import type {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  ChangeUsernameInput,
  ChangeEmailInput,
} from './validations';

export const sanitizeUser = (rawUser: typeof user.$inferSelect) => {
  const { password, ...sanitized } = rawUser;
  return sanitized;
};

export const registerUser = async (input: RegisterInput) => {
  const existingEmail = await db
    .select()
    .from(user)
    .where(eq(user.email, input.email.toLowerCase()));

  if (existingEmail.length > 0) {
    throw new Error('A user with this email address already exists');
  }

  const existingUserName = await db
    .select()
    .from(user)
    .where(eq(user.userName, input.userName));

  if (existingUserName.length > 0) {
    throw new Error('A user with this username already exists');
  }

  const hashedPassword = await hashPassword(input.password);

  const [newUser] = await db
    .insert(user)
    .values({
      email: input.email.toLowerCase(),
      userName: input.userName,
      password: hashedPassword,
      role: 'customer',
    })
    .returning();

  const sanitized = sanitizeUser(newUser);
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

export const loginUser = async (input: LoginInput) => {
  const identifierLower = input.identifier.toLowerCase();
  console.log(identifierLower);

  const [foundUser] = await db
    .select()
    .from(user)
    .where(
      or(
        eq(user.email, identifierLower),
        eq(user.userName, input.identifier)
      )
    );

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
    .where(eq(user.id, input.userId));

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
    .where(eq(user.id, input.userId))
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
    .where(eq(user.userName, input.newUserName));

  if (existingUser && existingUser.id !== input.userId) {
    throw new Error('Username is already taken');
  }

  const [updatedUser] = await db
    .update(user)
    .set({
      userName: input.newUserName,
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.userId))
    .returning();

  if (!updatedUser) {
    throw new Error('User not found');
  }

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

  const [updatedUser] = await db
    .update(user)
    .set({
      email: newEmailLower,
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.userId))
    .returning();

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return sanitizeUser(updatedUser);
};
