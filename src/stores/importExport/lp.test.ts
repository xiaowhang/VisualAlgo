import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';

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

describe('lp import/export (store)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // -------------------------------------------------------------------------
  // exportLpAsJsonText
  // -------------------------------------------------------------------------

  describe('exportLpAsJsonText', () => {
    it('returns JSON with objective, constraints, constraintLabels', () => {
      const store = useAlgorithmInputsStore();
      const json = store.exportLpAsJsonText();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed.objective)).toBe(true);
      expect(parsed.objective.length).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(parsed.constraints)).toBe(true);
      expect(parsed.constraints.length).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(parsed.constraintLabels)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // importLpFromJsonText — valid
  // -------------------------------------------------------------------------

  describe('importLpFromJsonText (valid)', () => {
    it('imports valid LP data with constraintLabels', () => {
      const store = useAlgorithmInputsStore();
      const before = store.dataVersion;

      const input = JSON.stringify({
        objective: [2, 3],
        constraints: [
          [1, 1, 8],
          [2, 1, 14],
        ],
        constraintLabels: ['x1+x2 <= 8', '2x1+x2 <= 14'],
      });
      const result = store.importLpFromJsonText(input);

      expect(result.ok).toBe(true);
      expect(store.lpObjective).toEqual([2, 3]);
      expect(store.lpConstraints).toHaveLength(2);
      expect(store.lpConstraintLabels).toEqual(['x1+x2 <= 8', '2x1+x2 <= 14']);
      expect(store.dataVersion).toBe(before + 1);
    });

    it('imports valid LP data without constraintLabels (optional)', () => {
      const store = useAlgorithmInputsStore();

      const input = JSON.stringify({
        objective: [5, 4],
        constraints: [
          [6, 4, 24],
          [1, 2, 6],
        ],
      });
      const result = store.importLpFromJsonText(input);

      expect(result.ok).toBe(true);
      expect(store.lpObjective).toEqual([5, 4]);
      // constraintLabels should retain defaults since not provided
      expect(store.lpConstraintLabels.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // importLpFromJsonText — invalid
  // -------------------------------------------------------------------------

  describe('importLpFromJsonText (invalid)', () => {
    it('rejects malformed JSON', () => {
      const store = useAlgorithmInputsStore();
      const result = store.importLpFromJsonText('{not valid json');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('JSON 解析失败');
      }
    });

    it('rejects missing objective field', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        constraints: [[1, 1, 8]],
      });
      const result = store.importLpFromJsonText(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('objective');
      }
    });

    it('rejects missing constraints field', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        objective: [3, 5],
      });
      const result = store.importLpFromJsonText(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('constraints');
      }
    });

    it('rejects objective with fewer than 2 coefficients', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        objective: [3],
        constraints: [[1, 1, 8]],
      });
      const result = store.importLpFromJsonText(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('2');
      }
    });

    it('rejects empty constraints array', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        objective: [3, 5],
        constraints: [],
      });
      const result = store.importLpFromJsonText(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('至少');
      }
    });
  });
});
