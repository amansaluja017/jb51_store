import test from 'node:test';
import assert from 'node:assert';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { db, user, client } from '@repo/db';
import { eq } from 'drizzle-orm';
import { authRouter } from './router';
import { verifyAccessToken, authenticateToken } from './jwt';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_jwt_refresh_secret_key_12345';
dotenv.config();

test('Auth Router End-to-End Tests with JWT Tokens', async (t) => {
  const caller = authRouter.createCaller({});

  const timestamp = Date.now();
  const testEmail1 = `user1_${timestamp}@example.com`;
  const testEmail2 = `user2_${timestamp}@example.com`;
  const username1 = `auth_user1_${timestamp}`;
  const username2 = `auth_user2_${timestamp}`;
  const updatedEmail1 = `user1_updated_${timestamp}@example.com`;
  const passwordInitial = 'securePass123';
  const passwordNew = 'newSecurePass456';

  let createdUserId1: string = '';
  let createdUserId2: string = '';
  let activeAccessToken: string = '';
  let activeRefreshToken: string = '';

  t.after(async () => {
    // Cleanup test users from DB
    if (createdUserId1) {
      await db.delete(user).where(eq(user.id, createdUserId1));
    }
    if (createdUserId2) {
      await db.delete(user).where(eq(user.id, createdUserId2));
    }
    await client.end();
  });

  await t.test('1. Register route with JWT generation and expiration validation', async (st) => {
    await st.test('should successfully register a new user and return 15m access token & 7d refresh token', async () => {
      const result = await caller.register({
        email: testEmail1,
        userName: username1,
        password: passwordInitial,
      });

      assert.ok(result.user.id);
      assert.strictEqual(result.user.email, testEmail1.toLowerCase());
      assert.strictEqual(result.user.userName, username1);
      assert.strictEqual(result.user.role, 'customer');
      assert.strictEqual((result.user as any).password, undefined);

      assert.ok(result.accessToken, 'Access token should be defined');
      assert.ok(result.refreshToken, 'Refresh token should be defined');

      // Verify JWT payload
      const decodedPayload = verifyAccessToken(result.accessToken);
      assert.strictEqual(decodedPayload.sub, result.user.id);
      assert.strictEqual(decodedPayload.email, testEmail1.toLowerCase());

      // Verify expiration times: 15 minutes for access token, 7 days for refresh token
      const accessDecoded = jwt.decode(result.accessToken) as any;
      assert.strictEqual(
        accessDecoded.exp - accessDecoded.iat,
        15 * 60,
        'Access token expiration must be exactly 15 minutes (900s)'
      );

      const refreshDecoded = jwt.decode(result.refreshToken) as any;
      assert.strictEqual(
        refreshDecoded.exp - refreshDecoded.iat,
        7 * 24 * 60 * 60,
        'Refresh token expiration must be exactly 7 days (604800s)'
      );

      createdUserId1 = result.user.id;
      activeAccessToken = result.accessToken;
      activeRefreshToken = result.refreshToken;
    });

    await st.test('should register a second user for conflict testing', async () => {
      const result = await caller.register({
        email: testEmail2,
        userName: username2,
        password: passwordInitial,
      });

      assert.ok(result.user.id);
      createdUserId2 = result.user.id;
    });

    await st.test('should fail registration with duplicate email', async () => {
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
          assert.match(err.message, /email address already exists/i);
          return true;
        }
      );
    });
  });

  await t.test('2. Login route with email and username matching', async (st) => {
    await st.test('should successfully login with email and return valid JWT', async () => {
      const result = await caller.login({
        identifier: testEmail1,
        password: passwordInitial,
      });

      assert.strictEqual(result.user.id, createdUserId1);
      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);

      const authCtx = authenticateToken(`Bearer ${result.accessToken}`);
      assert.ok(authCtx);
      assert.strictEqual(authCtx.sub, createdUserId1);

      activeAccessToken = result.accessToken;
      activeRefreshToken = result.refreshToken;
    });

    await st.test('should successfully login with username prefix and return valid JWT', async () => {
      const result = await caller.login({
        identifier: `user1_${timestamp}`,
        password: passwordInitial,
      });

      assert.strictEqual(result.user.id, createdUserId1);
      assert.ok(result.accessToken);
    });

    await st.test('should fail login with incorrect password', async () => {
      await assert.rejects(
        async () => {
          await caller.login({
            identifier: testEmail1,
            password: 'wrong_password',
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'UNAUTHORIZED');
          assert.match(err.message, /invalid email\/username or password/i);
          return true;
        }
      );
    });
  });

  await t.test('3. Refresh Token route', async (st) => {
    await st.test('should generate new access token and refresh token using active refresh token', async () => {
      const result = await caller.refreshToken({
        refreshToken: activeRefreshToken,
      });

      activeAccessToken = result.accessToken;
      activeRefreshToken = result.refreshToken;
      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);
      assert.strictEqual(result.user.id, createdUserId1);

      // Verify expiration of new tokens
      const accessDecoded = jwt.decode(result.accessToken) as any;
      assert.strictEqual(accessDecoded.exp - accessDecoded.iat, 15 * 60);

      const refreshDecoded = jwt.decode(result.refreshToken) as any;
      assert.strictEqual(refreshDecoded.exp - refreshDecoded.iat, 7 * 24 * 60 * 60);

      const authCtx = authenticateToken(`Bearer ${result.accessToken}`);
      assert.ok(authCtx);
      assert.strictEqual(authCtx.sub, createdUserId1);
    });

    await st.test('should fail with invalid refresh token', async () => {
      await assert.rejects(
        async () => {
          await caller.refreshToken({
            refreshToken: 'invalid_token_string',
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'UNAUTHORIZED');
          return true;
        }
      );
    });
  });

  await t.test('4. Update route (update email, password, and profile)', async (st) => {
    await st.test('should fail update without authentication', async () => {
      const unauthCaller = authRouter.createCaller({});
      await assert.rejects(
        async () => {
          await unauthCaller.update({
            userId: createdUserId1,
            email: updatedEmail1,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'UNAUTHORIZED');
          return true;
        }
      );
    });

    await st.test('should successfully update user email and password', async () => {
      const authCaller = authRouter.createCaller({
        user: verifyAccessToken(activeAccessToken),
        isStaff: false,
      });

      const result = await authCaller.update({
        userId: createdUserId1,
        email: updatedEmail1,
        currentPassword: passwordInitial,
        password: passwordNew,
      });

      assert.strictEqual(result.user.id, createdUserId1);
      assert.strictEqual(result.user.email, updatedEmail1.toLowerCase());
      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);

      activeAccessToken = result.accessToken;
      activeRefreshToken = result.refreshToken;
    });

    await st.test('should login with updated email and new password', async () => {
      const result = await caller.login({
        identifier: updatedEmail1,
        password: passwordNew,
      });

      assert.strictEqual(result.user.id, createdUserId1);
      assert.ok(result.accessToken);
      activeAccessToken = result.accessToken;
      activeRefreshToken = result.refreshToken;
    });
  });

  await t.test('5. Logout route', async (st) => {
    await st.test('should successfully logout and revoke refresh token', async () => {
      const authCaller = authRouter.createCaller({
        user: verifyAccessToken(activeAccessToken),
        isStaff: false,
      });

      const result = await authCaller.logout({ refreshToken: activeRefreshToken });
      assert.strictEqual(result.success, true);

      // Now refresh token should be rejected
      await assert.rejects(
        async () => {
          await caller.refreshToken({
            refreshToken: activeRefreshToken,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'UNAUTHORIZED');
          return true;
        }
      );
    });
  });

  await t.test('6. Delete route', async (st) => {
    await st.test('should fail delete without authentication', async () => {
      const unauthCaller = authRouter.createCaller({});
      await assert.rejects(
        async () => {
          await unauthCaller.delete({
            userId: createdUserId2,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'UNAUTHORIZED');
          return true;
        }
      );
    });

    await st.test('should successfully delete user account with authentication', async () => {
      // Login as user2 to get their active access token
      const loginRes = await caller.login({
        identifier: testEmail2,
        password: passwordInitial,
      });

      const authCaller = authRouter.createCaller({
        user: verifyAccessToken(loginRes.accessToken),
        isStaff: false,
      });

      const result = await authCaller.delete({
        userId: createdUserId2,
        password: passwordInitial,
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.message, 'User deleted successfully');

      // Verify user2 cannot login anymore
      await assert.rejects(
        async () => {
          await caller.login({
            identifier: testEmail2,
            password: passwordInitial,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'UNAUTHORIZED');
          return true;
        }
      );

      // Nullify createdUserId2 so t.after doesn't fail
      createdUserId2 = '';
    });
  });
});
