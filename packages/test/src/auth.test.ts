import test, { describe, it, after } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import { db, user as userTable, token as tokenTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { authRouter } from '@repo/auth/router';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  authenticateToken,
} from '@repo/auth/jwt';
import { hashPassword, verifyPassword } from '@repo/auth/password';
import { closeDatabaseConnection } from './helpers/test-context.js';

describe('Auth Router and Controller Suite', () => {
  const timestamp = Date.now();
  const testEmail1 = `auth_test_1_${timestamp}@example.com`;
  const testEmail2 = `auth_test_2_${timestamp}@example.com`;
  const username1 = `authtest1_${timestamp}`;
  const passwordInitial = 'StrongPassword123!';
  const passwordNew = 'NewStrongPassword456!';

  let createdUserId1: string | null = null;
  let createdUserId2: string | null = null;
  let activeAccessToken: string = '';
  let activeRefreshToken: string = '';

  after(async () => {
    try {
      if (createdUserId1) {
        await db.delete(tokenTable).where(eq(tokenTable.userId, createdUserId1));
        await db.delete(userTable).where(eq(userTable.id, createdUserId1));
      }
      if (createdUserId2) {
        await db.delete(tokenTable).where(eq(tokenTable.userId, createdUserId2));
        await db.delete(userTable).where(eq(userTable.id, createdUserId2));
      }
    } catch (_) {}
    await closeDatabaseConnection(true);
  });

  describe('JWT and Password Utilities', () => {
    it('should correctly hash and verify passwords', async () => {
      const hashed = await hashPassword('MySecret123');
      assert.notStrictEqual(hashed, 'MySecret123');
      const valid = await verifyPassword('MySecret123', hashed);
      assert.strictEqual(valid, true);
      const invalid = await verifyPassword('WrongPassword', hashed);
      assert.strictEqual(invalid, false);
    });

    it('should generate and verify access tokens', () => {
      const payload = {
        sub: '00000000-0000-0000-0000-000000000001',
        email: 'jwt@example.com',
        userName: 'jwtUser',
        role: 'customer' as const,
      };
      const token = generateAccessToken(payload);
      assert.ok(token);

      const decoded = verifyAccessToken(token);
      assert.strictEqual(decoded.sub, payload.sub);
      assert.strictEqual(decoded.email, payload.email);
    });

    it('should authenticate token from Authorization header', () => {
      const payload = {
        sub: '00000000-0000-0000-0000-000000000001',
        email: 'bearer@example.com',
        userName: 'bearerUser',
        role: 'admin' as const,
      };
      const token = generateAccessToken(payload);
      const authenticated = authenticateToken(`Bearer ${token}`);
      assert.ok(authenticated);
      assert.strictEqual(authenticated?.sub, payload.sub);

      // Null cases
      assert.strictEqual(authenticateToken(undefined), null);
      assert.strictEqual(authenticateToken('Basic 12345'), null);
      assert.strictEqual(authenticateToken('Bearer invalid.jwt.token'), null);
    });
  });

  describe('Registration and Login Procedures', () => {
    it('should register a new user and return JWT tokens', async () => {
      const caller = authRouter.createCaller({});
      const result = await caller.register({
        email: testEmail1,
        userName: username1,
        password: passwordInitial,
      });

      assert.ok(result.user.id);
      assert.strictEqual(result.user.email, testEmail1.toLowerCase());
      assert.strictEqual(result.user.role, 'customer');
      assert.strictEqual((result.user as any).password, undefined);
      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);

      createdUserId1 = result.user.id;
      activeAccessToken = result.accessToken;
      activeRefreshToken = result.refreshToken;
    });

    it('should reject registration with duplicate email', async () => {
      const caller = authRouter.createCaller({});
      await assert.rejects(
        async () => {
          await caller.register({
            email: testEmail1,
            userName: `unique_${Date.now()}`,
            password: passwordInitial,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'BAD_REQUEST');
          assert.match(err.message, /already exists/i);
          return true;
        }
      );
    });

    it('should login with correct email and password', async () => {
      const caller = authRouter.createCaller({});
      const result = await caller.login({
        identifier: testEmail1,
        password: passwordInitial,
      });

      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);
      assert.strictEqual(result.user.email, testEmail1.toLowerCase());
    });

    it('should fail login with incorrect password', async () => {
      const caller = authRouter.createCaller({});
      await assert.rejects(
        async () => {
          await caller.login({
            identifier: testEmail1,
            password: 'WrongPassword999!',
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'UNAUTHORIZED');
          return true;
        }
      );
    });

    it('should fail login with nonexistent identifier', async () => {
      const caller = authRouter.createCaller({});
      await assert.rejects(
        async () => {
          await caller.login({
            identifier: `nonexistent_${Date.now()}@example.com`,
            password: passwordInitial,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'UNAUTHORIZED');
          return true;
        }
      );
    });
  });

  describe('Refresh Token, Password Change and Logout Procedures', () => {
    it('should refresh access token using valid refresh token', async () => {
      const caller = authRouter.createCaller({});
      const result = await caller.refreshToken({
        refreshToken: activeRefreshToken,
      });

      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);
      // Update active refresh token because rotation occurs
      activeRefreshToken = result.refreshToken;
    });

    it('should reject invalid or expired refresh token', async () => {
      const caller = authRouter.createCaller({});
      await assert.rejects(
        async () => {
          await caller.refreshToken({
            refreshToken: 'invalid.jwt.refreshToken',
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'UNAUTHORIZED');
          return true;
        }
      );
    });

    it('should reject password change when unauthenticated', async () => {
      const unauthCaller = authRouter.createCaller({});
      await assert.rejects(
        async () => {
          await unauthCaller.changePassword({
            currentPassword: passwordInitial,
            newPassword: passwordNew,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'UNAUTHORIZED');
          return true;
        }
      );
    });

    it('should change password when authenticated with valid current password', async () => {
      const authedCaller = authRouter.createCaller({
        user: {
          sub: createdUserId1!,
          email: testEmail1,
          userName: username1,
          role: 'customer',
        },
      });

      const result = await authedCaller.changePassword({
        currentPassword: passwordInitial,
        newPassword: passwordNew,
      });

      assert.strictEqual(result.success, true);
    });

    it('should allow login with updated password', async () => {
      const caller = authRouter.createCaller({});
      const result = await caller.login({
        identifier: testEmail1,
        password: passwordNew,
      });
      assert.ok(result.accessToken);
    });

    it('should successfully logout user and revoke tokens', async () => {
      const authedCaller = authRouter.createCaller({
        user: {
          sub: createdUserId1!,
          email: testEmail1,
          userName: username1,
          role: 'customer',
        },
      });

      const result = await authedCaller.logout({
        refreshToken: activeRefreshToken,
      });

      assert.strictEqual(result.success, true);
    });
  });
});
