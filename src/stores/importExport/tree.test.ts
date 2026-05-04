import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import { TREE_SNAPSHOT_FORMAT_VERSION } from '@/lib/validation/treeInput';

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

describe('tree import/export (store)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // -------------------------------------------------------------------------
  // exportTreeAsJsonText
  // -------------------------------------------------------------------------

  describe('exportTreeAsJsonText', () => {
    it('returns valid JSON with formatVersion, nodes, edges, treeTargetValue', () => {
      const store = useAlgorithmInputsStore();
      const json = store.exportTreeAsJsonText();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('formatVersion', TREE_SNAPSHOT_FORMAT_VERSION);
      expect(Array.isArray(parsed.nodes)).toBe(true);
      expect(Array.isArray(parsed.edges)).toBe(true);
      expect(parsed).toHaveProperty('treeTargetValue');
    });
  });

  // -------------------------------------------------------------------------
  // importTreeFromJsonText
  // -------------------------------------------------------------------------

  describe('importTreeFromJsonText', () => {
    it('imports valid tree data', () => {
      const store = useAlgorithmInputsStore();
      const before = store.dataVersion;

      const input = JSON.stringify({
        formatVersion: 2,
        nodes: ['5', '3', '8', '1', '4'],
        edges: [
          ['5', '3'],
          ['5', '8'],
          ['3', '1'],
          ['3', '4'],
        ],
        treeTargetValue: '4',
      });
      const result = store.importTreeFromJsonText(input);

      expect(result.ok).toBe(true);
      expect(store.treeNodes.length).toBe(5);
      expect(store.treeEdges.length).toBe(4);
      expect(store.treeTargetValue).toBe('4');
      expect(store.dataVersion).toBe(before + 1);
    });

    it('rejects a bare array', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify(['1', '2', '3']);
      const result = store.importTreeFromJsonText(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('格式已升级');
      }
    });

    it('rejects fewer than 3 nodes', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        formatVersion: 2,
        nodes: ['1', '2'],
        edges: [['1', '2']],
      });
      const result = store.importTreeFromJsonText(input);

      expect(result.ok).toBe(false);
    });

    it('defaults treeTargetValue to first node when omitted', () => {
      const store = useAlgorithmInputsStore();

      const input = JSON.stringify({
        formatVersion: 2,
        nodes: ['10', '5', '15'],
        edges: [
          ['10', '5'],
          ['10', '15'],
        ],
      });
      const result = store.importTreeFromJsonText(input);

      expect(result.ok).toBe(true);
      expect(store.treeTargetValue).toBe('10');
    });
  });
});
