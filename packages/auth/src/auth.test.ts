import test from 'node:test';
import assert from 'node:assert';
import * as dotenv from 'dotenv';
import { db, user, client } from '@repo/db';
import { eq } from 'drizzle-orm';
import { authRouter } from './router';
import { verifyAccessToken, authenticateToken } from './jwt';

dotenv.config();

test('Auth Router End-to-End Tests with JWT Tokens', async (t) => {
  const caller = authRouter.createCaller({});

  const timestamp = Date.now();
  const testEmail1 = `user1_${timestamp}@example.com`;
  const testEmail2 = `user2_${timestamp}@example.com`;
  const username1 = `auth_user1_${timestamp}`;
  const username2 = `auth_user2_${timestamp}`;
  const newUsername1 = `auth_user1_new_${timestamp}`;
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

  await t.test('1. Register procedure with JWT generation', async (st) => {
    await st.test('should successfully register a new user and return JWT tokens', async () => {
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

    await st.test('should fail registration with duplicate username', async () => {
      await assert.rejects(
        async () => {
          await caller.register({
            email: `unique_${Date.now()}@example.com`,
            userName: username1,
            password: passwordInitial,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'BAD_REQUEST');
          assert.match(err.message, /username already exists/i);
          return true;
        }
      );
    });
  });

  await t.test('2. Login procedure with JWT token verification', async (st) => {
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

    await st.test('should successfully login with username and return valid JWT', async () => {
      const result = await caller.login({
        identifier: username1,
        password: passwordInitial,
      });

      assert.strictEqual(result.user.id, createdUserId1);
      assert.strictEqual(result.user.userName, username1);
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

  await t.test('3. Refresh Token procedure', async (st) => {
    await st.test('should generate new access token using refresh token', async () => {
      const result = await caller.refreshToken({
        refreshToken: activeRefreshToken,
      });

      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);
      assert.strictEqual(result.user.id, createdUserId1);

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

  await t.test('4. Change Username procedure', async (st) => {
    await st.test('should fail if new username is already taken', async () => {
      const authCaller = authRouter.createCaller({
        user: verifyAccessToken(activeAccessToken),
        isStaff: false,
      });

      await assert.rejects(
        async () => {
          await authCaller.changeUsername({
            userId: createdUserId1,
            newUserName: username2,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'BAD_REQUEST');
          assert.match(err.message, /username is already taken/i);
          return true;
        }
      );
    });

    await st.test('should successfully update username', async () => {
      const authCaller = authRouter.createCaller({
        user: verifyAccessToken(activeAccessToken),
        isStaff: false,
      });

      const result = await authCaller.changeUsername({
        userId: createdUserId1,
        newUserName: newUsername1,
      });

      assert.strictEqual(result.id, createdUserId1);
      assert.strictEqual(result.userName, newUsername1);
    });
  });

  await t.test('5. Change Password procedure', async (st) => {
    await st.test('should fail password change if current password is wrong', async () => {
      const authCaller = authRouter.createCaller({
        user: verifyAccessToken(activeAccessToken),
        isStaff: false,
      });

      await assert.rejects(
        async () => {
          await authCaller.changePassword({
            userId: createdUserId1,
            currentPassword: 'invalid_current_password',
            newPassword: passwordNew,
          });
        },
        (err: any) => {
          assert.strictEqual(err.code, 'BAD_REQUEST');
          assert.match(err.message, /current password is incorrect/i);
          return true;
        }
      );
    });

    await st.test('should successfully change password', async () => {
      const authCaller = authRouter.createCaller({
        user: verifyAccessToken(activeAccessToken),
        isStaff: false,
      });

      const result = await authCaller.changePassword({
        userId: createdUserId1,
        currentPassword: passwordInitial,
        newPassword: passwordNew,
      });

      assert.strictEqual(result.success, true);
    });

    await st.test('should login with new password and new username returning new JWT', async () => {
      const result = await caller.login({
        identifier: newUsername1,
        password: passwordNew,
      });

      assert.strictEqual(result.user.id, createdUserId1);
      assert.strictEqual(result.user.userName, newUsername1);
      assert.ok(result.accessToken);

      const authCtx = authenticateToken(`Bearer ${result.accessToken}`);
      assert.ok(authCtx);
      assert.strictEqual(authCtx.userName, newUsername1);
    });
  });
});
