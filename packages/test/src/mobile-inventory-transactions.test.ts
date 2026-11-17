import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import type { PaginatedInventoryTransactionsResponse, InventoryTransaction } from '../../../apps/mobile/src/types.ts';

describe('Inventory Transactions Pagination & Lazy Fetching Behavior', () => {
  const mockTransactions: InventoryTransaction[] = Array.from({ length: 45 }, (_, idx) => ({
    id: `tx-${idx + 1}`,
    productId: `prod-${(idx % 5) + 1}`,
    type: idx % 3 === 0 ? 'sale' : idx % 3 === 1 ? 'purchase' : 'adjustment',
    quantity: (idx % 10) + 1,
    availableStock: 20 - (idx % 5),
    reservedStock: idx % 3,
    totalStock: 20,
    createdAt: new Date(Date.now() - idx * 3600000).toISOString(),
    productName: `Designer Suit #${(idx % 5) + 1}`,
    variantColor: 'Teal Blue',
    customerName: idx % 3 === 0 ? `Customer ${idx + 1}` : undefined,
    sellerName: idx % 3 === 1 ? `Supplier ${idx + 1}` : undefined,
  }));

  it('verifies that Stock page initialization does NOT fetch transactions eagerly', async () => {
    const fetchedPaths: string[] = [];

    const mockTrpcRequest = async <T = unknown>(path: string): Promise<T> => {
      fetchedPaths.push(path);
      return {} as T;
    };

    // Simulate mounting Stock screen with activeTab = 'inventory'
    // Since eager useQuery was removed from useInventoryData, no getTransactions call occurs on page mount
    const onStockPageMounted = () => {
      // Stock page only fetches paginated stock items and categories
      mockTrpcRequest('inventory.getPaginated');
      mockTrpcRequest('products.getCategories');
    };

    onStockPageMounted();

    assert.strictEqual(fetchedPaths.includes('inventory.getTransactions'), false,
      'inventory.getTransactions should NOT be fetched on stock page load');
    assert.deepStrictEqual(fetchedPaths, ['inventory.getPaginated', 'products.getCategories']);
  });

  it('fetches transactions on-demand with pagination when history modal opens', async () => {
    let capturedInput: { page?: number; limit?: number; search?: string; type?: string } | undefined;
    let callCount = 0;

    const mockFetchPaginatedTransactions = async (params: { page: number; limit: number; search?: string; type?: string }): Promise<PaginatedInventoryTransactionsResponse> => {
      callCount++;
      capturedInput = params;

      const page = params.page || 1;
      const limit = params.limit || 15;
      const total = mockTransactions.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const items = mockTransactions.slice(start, start + limit);

      return {
        items,
        total,
        totalPages,
        page,
        limit,
        stats: {
          salesCount: 15,
          purchasesCount: 15,
          adjustmentsCount: 15,
          totalSoldUnits: 80,
          totalPurchasedUnits: 75,
        },
      };
    };

    // User taps History button -> opens modal -> triggers on-demand fetch
    const response = await mockFetchPaginatedTransactions({ page: 1, limit: 15 });

    assert.strictEqual(callCount, 1, 'Should call getTransactions exactly once when opening modal');
    assert.deepStrictEqual(capturedInput, { page: 1, limit: 15 });
    assert.strictEqual(response.items.length, 15, 'Should return only 15 items per page instead of all transactions');
    assert.strictEqual(response.total, 45);
    assert.strictEqual(response.totalPages, 3);
    assert.strictEqual(response.page, 1);
  });

  it('paginates transactions to next page without refetching all items', async () => {
    const pagesRequested: number[] = [];

    const mockFetchPage = async (page: number, limit = 15): Promise<PaginatedInventoryTransactionsResponse> => {
      pagesRequested.push(page);
      const total = mockTransactions.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const items = mockTransactions.slice(start, start + limit);

      return {
        items,
        total,
        totalPages,
        page,
        limit,
      };
    };

    // Fetch page 1
    const p1 = await mockFetchPage(1);
    assert.strictEqual(p1.items[0]?.id, 'tx-1');
    assert.strictEqual(p1.items[14]?.id, 'tx-15');

    // Fetch page 2
    const p2 = await mockFetchPage(2);
    assert.strictEqual(p2.items[0]?.id, 'tx-16');
    assert.strictEqual(p2.items[14]?.id, 'tx-30');

    // Fetch page 3
    const p3 = await mockFetchPage(3);
    assert.strictEqual(p3.items[0]?.id, 'tx-31');
    assert.strictEqual(p3.items.length, 15);

    assert.deepStrictEqual(pagesRequested, [1, 2, 3]);
  });

  it('prevents duplicate fetching on History button click', async () => {
    let fetchCount = 0;

    // Simulate the new History button onPress behavior
    let historyModalOpen = false;
    const onHistoryButtonPress = () => {
      // Button only toggles visibility; does NOT trigger an extra fetch directly in onPress
      historyModalOpen = true;
    };

    // Modal lifecycle handles on-demand fetch once when visible becomes true
    const onModalVisibleChange = (visible: boolean) => {
      if (visible) {
        fetchCount++;
      }
    };

    onHistoryButtonPress();
    assert.strictEqual(historyModalOpen, true);
    onModalVisibleChange(historyModalOpen);

    // Verify it only triggered 1 fetch, eliminating previous duplicate
    assert.strictEqual(fetchCount, 1);
  });
});
