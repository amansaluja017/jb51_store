import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { db, token as tokenTable } from '@repo/db';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'jb51-store-jwt-secret-key-super-secure';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jb51-store-jwt-refresh-secret-key-super-secure';

export interface JwtPayload {
  sub: string;
  email: string;
  userName: string;
  role: 'customer' | 'admin';
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
};

export const generateAuthTokens = async (userData: {
  id: string;
  email: string;
  userName: string;
  role: 'customer' | 'admin';
}) => {
  const payload: JwtPayload = {
    sub: userData.id,
    email: userData.email,
    userName: userData.userName,
    role: userData.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in DB for tracking/revocation
  await db.insert(tokenTable).values({
    userId: userData.id,
    tokenType: 'refreshToken',
    isRevoked: false,
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
