import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import { DP_SNAPSHOT_FORMAT_VERSION } from '@/lib/validation/dpInput';

vi.mock('@/visualizers/graphLayout', () => ({
  computeStableForceLayout: vi.fn((nodeIds: string[]) =>
    nodeIds.map(id => ({ id, x: 100, y: 100 }))
  ),
}));

vi.mock('@/algorithms/shared/tree/fixtures', () => ({
  createRandomBSTData: vi.fn(() => ({
    nodes: [{ id: '1', x: 0, y: 0 }],
    edges: [],
  })),
  getDefaultBST: vi.fn(() => ({
    nodes: [{ id: '1', x: 0, y: 0 }],
    edges: [],
  })),
}));

describe('dp import/export (store)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // -------------------------------------------------------------------------
  // exportDpAsJsonText — LCS
  // -------------------------------------------------------------------------

  describe('exportDpAsJsonText (lcs)', () => {
    it('returns JSON with formatVersion, type, x, y', () => {
      const store = useAlgorithmInputsStore();
      const json = store.exportDpAsJsonText('lcs');
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('formatVersion', DP_SNAPSHOT_FORMAT_VERSION);
      expect(parsed).toHaveProperty('type', 'lcs');
      expect(typeof parsed.x).toBe('string');
      expect(typeof parsed.y).toBe('string');
    });
  });

  // -------------------------------------------------------------------------
  // exportDpAsJsonText — knapsack
  // -------------------------------------------------------------------------

  describe('exportDpAsJsonText (knapsack)', () => {
    it('returns JSON with formatVersion, type, capacity, items', () => {
      const store = useAlgorithmInputsStore();
      const json = store.exportDpAsJsonText('knapsack');
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('formatVersion', DP_SNAPSHOT_FORMAT_VERSION);
      expect(parsed).toHaveProperty('type', 'knapsack');
      expect(typeof parsed.capacity).toBe('number');
      expect(Array.isArray(parsed.items)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // exportDpAsJsonText — investment
  // -------------------------------------------------------------------------

  describe('exportDpAsJsonText (investment)', () => {
    it('returns JSON with formatVersion, type, investmentCount, resources, returns', () => {
      const store = useAlgorithmInputsStore();
      const json = store.exportDpAsJsonText('investment');
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('formatVersion', DP_SNAPSHOT_FORMAT_VERSION);
      expect(parsed).toHaveProperty('type', 'investment');
      expect(typeof parsed.investmentCount).toBe('number');
      expect(typeof parsed.resources).toBe('number');
      expect(Array.isArray(parsed.returns)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // importDpFromJsonText — valid imports
  // -------------------------------------------------------------------------

  describe('importDpFromJsonText (valid)', () => {
    it('imports LCS data and increments dataVersion', () => {
      const store = useAlgorithmInputsStore();
      const before = store.dataVersion;

      const input = JSON.stringify({
        formatVersion: 1,
        type: 'lcs',
        x: 'ABC',
        y: 'AC',
      });
      const result = store.importDpFromJsonText(input);

      expect(result.ok).toBe(true);
      expect(store.dpLcsStringX).toBe('ABC');
      expect(store.dpLcsStringY).toBe('AC');
      expect(store.dataVersion).toBe(before + 1);
    });

    it('imports knapsack data and increments dataVersion', () => {
      const store = useAlgorithmInputsStore();
      const before = store.dataVersion;

      const input = JSON.stringify({
        formatVersion: 1,
        type: 'knapsack',
        capacity: 10,
        items: [
          { weight: 2, value: 3 },
          { weight: 5, value: 8 },
        ],
      });
      const result = store.importDpFromJsonText(input);

      expect(result.ok).toBe(true);
      expect(store.dpKnapsackCapacity).toBe(10);
      expect(store.dpKnapsackItems).toHaveLength(2);
      expect(store.dataVersion).toBe(before + 1);
    });

    it('imports investment data and increments dataVersion', () => {
      const store = useAlgorithmInputsStore();
      const before = store.dataVersion;

      const input = JSON.stringify({
        formatVersion: 1,
        type: 'investment',
        investmentCount: 3,
        resources: 5,
        returns: [
          [0, 11, 12, 13, 14, 15],
          [0, 0, 5, 10, 15, 20],
          [0, 2, 4, 6, 8, 10],
        ],
      });
      const result = store.importDpFromJsonText(input);

      expect(result.ok).toBe(true);
      expect(store.dpInvestmentCount).toBe(3);
      expect(store.dpInvestmentResources).toBe(5);
      expect(store.dpInvestmentReturns).toHaveLength(3);
      expect(store.dataVersion).toBe(before + 1);
    });
  });

  // -------------------------------------------------------------------------
  // importDpFromJsonText — invalid imports
  // -------------------------------------------------------------------------

  describe('importDpFromJsonText (invalid)', () => {
    it('rejects malformed JSON', () => {
      const store = useAlgorithmInputsStore();
      const result = store.importDpFromJsonText('{not valid json');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('JSON 解析失败');
      }
    });

    it('rejects LCS with empty strings', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        formatVersion: 1,
        type: 'lcs',
        x: '',
        y: '',
      });
      const result = store.importDpFromJsonText(input);

      expect(result.ok).toBe(false);
    });

    it('rejects knapsack with zero capacity', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        formatVersion: 1,
        type: 'knapsack',
        capacity: 0,
        items: [{ weight: 1, value: 1 }],
      });
      const result = store.importDpFromJsonText(input);

      expect(result.ok).toBe(false);
    });

    it('rejects investment with investmentCount < 2', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        formatVersion: 1,
        type: 'investment',
        investmentCount: 1,
        resources: 5,
        returns: [[0, 1, 2, 3, 4, 5]],
      });
      const result = store.importDpFromJsonText(input);

      expect(result.ok).toBe(false);
    });
  });
});
