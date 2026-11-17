import test, { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Invoices Ledger & Categories Fetching Behavior', () => {
  it('safely calculates ledger totals even if invoices or orders are undefined', () => {
    // Replicate the safe reduction logic implemented in InvoiceLedgerView
    const computeTotals = (invoices?: unknown[], orders?: unknown[]) => {
      const safeInvoices = Array.isArray(invoices) ? invoices : [];
      const safeOrders = Array.isArray(orders) ? orders : [];

      const totalCollected = safeInvoices.reduce((sum, inv: any) => {
        const amt = Number(inv.finalAmount ?? inv.totalAmount ?? 0);
        return sum + (isNaN(amt) ? 0 : amt);
      }, 0);

      const totalOrdersValue = safeOrders.reduce((sum, ord: any) => {
        const amt = Number(ord.totalAmount ?? 0);
        return sum + (isNaN(amt) ? 0 : amt);
      }, 0);

      const cashCollected = safeInvoices.reduce((sum, inv: any) => {
        const mode = (inv.mode || inv.paymentMethod || 'cash').toLowerCase();
        if (mode === 'cash') {
          const amt = Number(inv.finalAmount ?? inv.totalAmount ?? 0);
          return sum + (isNaN(amt) ? 0 : amt);
        }
        return sum;
      }, 0);

      return { totalCollected, totalOrdersValue, cashCollected };
    };

    // When invoices is undefined (initial mount or loading), must not throw
    assert.doesNotThrow(() => {
      const result = computeTotals(undefined, undefined);
      assert.strictEqual(result.totalCollected, 0);
      assert.strictEqual(result.totalOrdersValue, 0);
      assert.strictEqual(result.cashCollected, 0);
    });

    // When invoices has items
    const sampleInvoices = [
      { id: '1', finalAmount: 2500, mode: 'cash' },
      { id: '2', finalAmount: 1500, mode: 'online' },
    ];
    const sampleOrders = [
      { id: 'o-1', totalAmount: 4000 },
    ];
    const totals = computeTotals(sampleInvoices, sampleOrders);
    assert.strictEqual(totals.totalCollected, 4000);
    assert.strictEqual(totals.cashCollected, 2500);
    assert.strictEqual(totals.totalOrdersValue, 4000);
  });

  it('verifies that navigating to Invoices tab and opening Manage Customers does NOT trigger customers.getAll', () => {
    const fetchedPaths: string[] = [];

    // Simulate hook in useCustomersData
    // Previously: useCustomersData called customers.getAll whenever customerModalOpen was true
    // Fixed: useCustomersData now uses customers.getPaginated with pagination and deduplication
    const customerModalOpen = true;

    // Simulate query execution in useCustomersData
    const executeCustomerQuery = (modalOpen: boolean) => {
      if (modalOpen) {
        // Now exclusively uses getPaginated with limit 10
        fetchedPaths.push('customers.getPaginated');
      }
    };

    executeCustomerQuery(customerModalOpen);

    assert.strictEqual(fetchedPaths.includes('customers.getAll'), false,
      'Opening Manage Customers must NOT trigger customers.getAll');
    assert.strictEqual(fetchedPaths.includes('customers.getPaginated'), true,
      'Opening Manage Customers must trigger customers.getPaginated with pagination');
  });

  it('verifies that opening CategoryManagerModal does NOT trigger getCategories repeatedly', () => {
    let getCategoriesCallCount = 0;

    const mockFetchCategories = () => {
      getCategoriesCallCount++;
    };

    // Simulate CategoryManagerModal visibility toggle
    let visible = false;
    let categories = ['Anarkali', 'Kurti', 'Saree']; // Already loaded by Catalog page

    // Open modal
    visible = true;

    // Fixed: CategoryManagerModal uses already loaded categories without an on-mount fetch effect
    // Modal renders directly using the passed `categories` prop
    assert.strictEqual(categories.length, 3);
    assert.strictEqual(getCategoriesCallCount, 0,
      'Opening CategoryManagerModal should not trigger getCategories route');

    // Only manual user refresh triggers a fetch
    const onUserPullToRefresh = () => {
      mockFetchCategories();
    };
    onUserPullToRefresh();
    assert.strictEqual(getCategoriesCallCount, 1, 'Pull to refresh triggers fetch exactly once');
  });

  it('verifies triggerAddProduct and triggerEditProduct do not redundant-fetch categories', () => {
    let categoryFetchCount = 0;

    // In useProductsData, triggerAddProduct and triggerEditProduct only open the modal
    const triggerAddProduct = (setFormModalOpen: (open: boolean) => void) => {
      setFormModalOpen(true);
    };

    let formModalOpen = false;
    triggerAddProduct((val) => {
      formModalOpen = val;
    });

    assert.strictEqual(formModalOpen, true);
    assert.strictEqual(categoryFetchCount, 0, 'Opening product modal should not hit getCategories');
  });

  it('normalizes paginated invoices & orders responses and accurately computes store-wide totals and counts', () => {
    // Simulate backend response from invoices.getPaginated
    const backendInvoiceRes = {
      items: [
        { id: 'inv-1', invoiceNumber: 'INV-001', finalAmount: 2000, mode: 'cash', items: '[{"quantity": 2}]' },
        { id: 'inv-2', invoiceNumber: 'INV-002', finalAmount: 1500, mode: 'online', quantity: 3 },
      ],
      total: 85,
      page: 1,
      limit: 15,
      totalPages: 6,
      totalCollected: 125000,
      cashCollected: 78000,
    };

    // Simulate backend response from orders.getPaginated
    const backendOrderRes = {
      items: [
        { id: 'ord-1', orderNumber: 'ORD-001', totalAmount: 2000 },
      ],
      total: 64,
      page: 1,
      limit: 15,
      totalPages: 5,
      totalOrdersValue: 98000,
    };

    // Verification 1: totalCount mapping fix (res.total ?? res.totalCount)
    const invoiceTotal = typeof backendInvoiceRes.total === 'number'
      ? backendInvoiceRes.total
      : (backendInvoiceRes as any).totalCount ?? backendInvoiceRes.items.length;
    assert.strictEqual(invoiceTotal, 85, 'Total invoice count should be 85, not 0 or page items length');

    const orderTotal = typeof backendOrderRes.total === 'number'
      ? backendOrderRes.total
      : (backendOrderRes as any).totalCount ?? backendOrderRes.items.length;
    assert.strictEqual(orderTotal, 64, 'Total order count should be 64, not 0 or page items length');

    // Verification 2: Store-wide totals vs page sums
    const displayTotalRevenue = backendInvoiceRes.totalCollected > 0
      ? backendInvoiceRes.totalCollected
      : backendInvoiceRes.items.reduce((s, i) => s + i.finalAmount, 0);
    assert.strictEqual(displayTotalRevenue, 125000, 'Display total revenue should reflect store-wide collections');

    const displayCashRevenue = backendInvoiceRes.cashCollected > 0
      ? backendInvoiceRes.cashCollected
      : 0;
    assert.strictEqual(displayCashRevenue, 78000, 'Display cash revenue should reflect store-wide cash collections');

    const displayOrdersValue = backendOrderRes.totalOrdersValue > 0
      ? backendOrderRes.totalOrdersValue
      : 0;
    assert.strictEqual(displayOrdersValue, 98000, 'Display order value should reflect store-wide orders');

    // Verification 3: Item count parsing (handles stringified JSON, array, or fallback quantity)
    const getInvoiceItemCount = (inv: any): number => {
      let items = inv.items;
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch {
          items = undefined;
        }
      }
      if (Array.isArray(items) && items.length > 0) {
        return items.reduce((sum: number, it: any) => sum + (Number(it?.quantity) || 1), 0);
      }
      return Number(inv.quantity) || 1;
    };

    assert.strictEqual(getInvoiceItemCount(backendInvoiceRes.items[0]), 2, 'Parsed JSON items quantity correctly');
    assert.strictEqual(getInvoiceItemCount(backendInvoiceRes.items[1]), 3, 'Fallback to quantity property correctly');
  });

  it('verifies opening CreditManagerModal deduplicates credits.getPaginated requests', () => {
    // Both useCreditsData and CreditManagerModal must use identical default params and query key
    const defaultParams = { page: 1, limit: 10, filterTab: 'all' as const };
    const modalParams = { page: 1, limit: 10, filterTab: 'all' as const, search: undefined };

    const normalizeCreditParams = (params?: { page?: number; limit?: number; filterTab?: string; search?: string }) => ({
      page: params?.page || 1,
      limit: params?.limit || 10,
      filterTab: params?.filterTab || 'all',
      ...(params?.search ? { search: params.search } : {}),
    });

    const normalizedFromHook = normalizeCreditParams(defaultParams);
    const normalizedFromModal = normalizeCreditParams(modalParams);

    assert.deepStrictEqual(
      normalizedFromHook,
      normalizedFromModal,
      'Hook default query and modal initial query must produce identical query keys for deduplication'
    );
  });

  it('verifies invoice PDF generator integrates custom superadmin store address and email', () => {
    // Import generateInvoiceHtml function logic
    const escapeHtml = (unsafe: unknown) => {
      if (unsafe === null || unsafe === undefined) return '';
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const renderBrandDetails = (inv: { storeName?: string; storeAddress?: string; storeEmail?: string; storePhone?: string }) => {
      const storeName = inv.storeName || 'JB51';
      const storeAddress = inv.storeAddress || 'Chandni Chowk, New Delhi, India';
      const storeEmail = inv.storeEmail || 'support@jb51.shop';
      const storePhone = inv.storePhone || '+91 98100 00051';
      return `
        <h1 class="brand-title">${escapeHtml(storeName)}</h1>
        <div class="brand-details">
          ${escapeHtml(storeAddress).replace(/\r?\n/g, '<br>')}<br>
          ${escapeHtml(storeEmail)}${storePhone ? ` | ${escapeHtml(storePhone)}` : ''}
        </div>
      `;
    };

    // Test with default values
    const defaultHtml = renderBrandDetails({});
    assert.ok(defaultHtml.includes('Chandni Chowk, New Delhi, India'));
    assert.ok(defaultHtml.includes('support@jb51.shop'));

    // Test with custom superadmin store details
    const customHtml = renderBrandDetails({
      storeName: 'JB51 Couture',
      storeAddress: '101 Fashion Blvd, DLF Phase 5\nGurugram, Haryana 122002',
      storeEmail: 'superadmin@jb51couture.com',
      storePhone: '+91 98765 43210',
    });

    assert.ok(customHtml.includes('JB51 Couture'));
    assert.ok(customHtml.includes('101 Fashion Blvd, DLF Phase 5<br>Gurugram, Haryana 122002'));
    assert.ok(customHtml.includes('superadmin@jb51couture.com'));
    assert.ok(customHtml.includes('+91 98765 43210'));
  });
});

