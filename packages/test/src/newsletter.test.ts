import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { appRouter } from '../../../apps/api/src/router.js';

describe('Newsletter Router Integration Suite', () => {
  const adminContext = {
    isStaff: true,
    user: { id: 'admin-1', sub: 'admin-1', role: 'admin', userName: 'admin', email: 'admin@jb51store.test' } as any,
  };

  const publicContext = {
    isStaff: false,
    user: null,
  };

  const publicCaller = appRouter.createCaller(publicContext);
  const adminCaller = appRouter.createCaller(adminContext);

  it('newsletter.subscribe: should subscribe a new email successfully', async () => {
    const testEmail = `subscriber-${Date.now()}@example.com`;
    const res = await publicCaller.newsletter.subscribe({
      email: testEmail,
      source: 'web_footer',
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.email, testEmail.toLowerCase());
    assert.strictEqual(res.alreadySubscribed, false);
    assert.ok(res.message);
  });

  it('newsletter.subscribe: should recognize existing active subscriber', async () => {
    const testEmail = `duplicate-${Date.now()}@example.com`;
    // First subscription
    await publicCaller.newsletter.subscribe({
      email: testEmail,
      source: 'web_footer',
    });

    // Second subscription with same email
    const duplicateRes = await publicCaller.newsletter.subscribe({
      email: testEmail,
      source: 'web_footer',
    });

    assert.strictEqual(duplicateRes.success, true);
    assert.strictEqual(duplicateRes.alreadySubscribed, true);
  });

  it('newsletter.subscribe: should reject invalid email format', async () => {
    await assert.rejects(
      async () => {
        await publicCaller.newsletter.subscribe({
          email: 'not-an-email',
          source: 'web_footer',
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('valid email') || err.code === 'BAD_REQUEST');
        return true;
      }
    );
  });

  it('newsletter.unsubscribe: should unsubscribe an existing subscriber', async () => {
    const testEmail = `unsub-${Date.now()}@example.com`;
    await publicCaller.newsletter.subscribe({ email: testEmail });

    const unsubRes = await publicCaller.newsletter.unsubscribe({ email: testEmail });
    assert.strictEqual(unsubRes.success, true);
  });

  it('newsletter.getSubscribers: should block unauthenticated users', async () => {
    await assert.rejects(
      async () => {
        await publicCaller.newsletter.getSubscribers();
      },
      (err: any) => {
        assert.strictEqual(err.code, 'UNAUTHORIZED');
        return true;
      }
    );
  });

  it('newsletter.getSubscribers: should allow admin to fetch paginated subscribers', async () => {
    const result = await adminCaller.newsletter.getSubscribers({ page: 1, limit: 10 });
    assert.ok(result);
    assert.strictEqual(Array.isArray(result.items), true);
    assert.strictEqual(typeof result.total, 'number');
    assert.strictEqual(typeof result.totalPages, 'number');
  });

  it('newsletter.deleteSubscriber: should allow admin to delete subscriber', async () => {
    const testEmail = `delete-${Date.now()}@example.com`;
    const sub = await publicCaller.newsletter.subscribe({ email: testEmail });

    const deleteRes = await adminCaller.newsletter.deleteSubscriber({
      idOrEmail: sub.id || testEmail,
    });
    assert.strictEqual(deleteRes.success, true);
  });
});

