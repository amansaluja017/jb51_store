import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { db, token as tokenTable } from '@repo/db';

dotenv.config();

import crypto from 'crypto';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'test') return 'test-jwt-secret-key-12345678901234567890';
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  return secret;
};

const getJwtRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'test') return 'test-jwt-refresh-secret-key-12345678901234567890';
    throw new Error('JWT_REFRESH_SECRET environment variable is missing.');
  }
  return secret;
};

export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  userName: string;
  role: 'customer' | 'admin' | 'seller';
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtRefreshSecret(), { expiresIn: '30d' });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, getJwtRefreshSecret()) as JwtPayload;
};

export const generateAuthTokens = async (userData: {
  id: string;
  email: string;
  name?: string;
  userName?: string;
  role: 'customer' | 'admin' | 'seller';
}) => {
  const nameStr = userData.name || userData.userName || userData.email.split('@')[0];
  const payload: JwtPayload = {
    sub: userData.id,
    email: userData.email,
    name: nameStr,
    userName: nameStr,
    role: userData.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Store refresh token hash in DB for tracking/revocation
  await db.insert(tokenTable).values({
    userId: userData.id,
    tokenType: 'refreshToken',
    tokenHash,
    isRevoked: false,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const authenticateToken = (authHeader?: string): JwtPayload | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
};
