import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import { SORTING_SNAPSHOT_FORMAT_VERSION } from '@/lib/validation/sortingInput';

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

describe('sorting import/export (store)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // -------------------------------------------------------------------------
  // exportSortingAsJsonText
  // -------------------------------------------------------------------------

  describe('exportSortingAsJsonText', () => {
    it('returns valid JSON with formatVersion and sortingInput', () => {
      const store = useAlgorithmInputsStore();
      const json = store.exportSortingAsJsonText();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('formatVersion', SORTING_SNAPSHOT_FORMAT_VERSION);
      expect(parsed).toHaveProperty('sortingInput');
      expect(Array.isArray(parsed.sortingInput)).toBe(true);
    });

    it('produces a round-trip: export -> import -> export yields same result', () => {
      const store = useAlgorithmInputsStore();
      const firstExport = store.exportSortingAsJsonText();

      // Import the exported data
      const importResult = store.importSortingFromJsonText(firstExport);
      expect(importResult.ok).toBe(true);

      // Export again
      const secondExport = store.exportSortingAsJsonText();

      // Both should parse to the same structure (sortingInput values should match)
      const firstParsed = JSON.parse(firstExport);
      const secondParsed = JSON.parse(secondExport);
      expect(secondParsed.sortingInput).toEqual(firstParsed.sortingInput);
      expect(secondParsed.formatVersion).toBe(firstParsed.formatVersion);
    });
  });

  // -------------------------------------------------------------------------
  // importSortingFromJsonText
  // -------------------------------------------------------------------------

  describe('importSortingFromJsonText', () => {
    it('imports valid snapshot and increments dataVersion', () => {
      const store = useAlgorithmInputsStore();
      const before = store.dataVersion;

      const input = JSON.stringify({ formatVersion: 1, sortingInput: [3, 1, 4, 1, 5] });
      const result = store.importSortingFromJsonText(input);

      expect(result.ok).toBe(true);
      expect(store.sortingInput).toEqual([3, 1, 4, 1, 5]);
      expect(store.dataVersion).toBe(before + 1);
    });

    it('rejects a bare array with migration message', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify([1, 2, 3]);
      const result = store.importSortingFromJsonText(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('格式已升级');
      }
    });

    it('rejects malformed JSON', () => {
      const store = useAlgorithmInputsStore();
      const result = store.importSortingFromJsonText('{not valid json');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('JSON 解析失败');
      }
    });

    it('rejects too few elements', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({ formatVersion: 1, sortingInput: [1, 2] });
      const result = store.importSortingFromJsonText(input);

      expect(result.ok).toBe(false);
    });

    it('rejects extra keys (strict mode)', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        formatVersion: 1,
        sortingInput: [3, 1, 4, 1, 5],
        extra: 'not allowed',
      });
      const result = store.importSortingFromJsonText(input);

      expect(result.ok).toBe(false);
    });
  });
});
