import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAlgorithmInputsStore } from '@/stores/algorithmInputs';
import { GRAPH_SNAPSHOT_FORMAT_VERSION } from '@/lib/validation/graphInput';

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

describe('graph import/export (store)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // -------------------------------------------------------------------------
  // exportGraphAsJsonText
  // -------------------------------------------------------------------------

  describe('exportGraphAsJsonText', () => {
    it('returns valid JSON with formatVersion, nodes, edges, startNode', () => {
      const store = useAlgorithmInputsStore();
      const json = store.exportGraphAsJsonText();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('formatVersion', GRAPH_SNAPSHOT_FORMAT_VERSION);
      expect(Array.isArray(parsed.nodes)).toBe(true);
      expect(parsed.nodes.length).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(parsed.edges)).toBe(true);
      expect(parsed).toHaveProperty('startNode');
    });
  });

  // -------------------------------------------------------------------------
  // importGraphFromJsonText
  // -------------------------------------------------------------------------

  describe('importGraphFromJsonText', () => {
    it('imports valid graph with weights', () => {
      const store = useAlgorithmInputsStore();
      const before = store.dataVersion;

      const input = JSON.stringify({
        formatVersion: 2,
        nodes: ['A', 'B', 'C'],
        edges: [
          ['A', 'B', 5],
          ['B', 'C', 3],
        ],
        startNode: 'A',
      });
      const result = store.importGraphFromJsonText(input);

      expect(result.ok).toBe(true);
      expect(store.graphNodes.length).toBe(3);
      expect(store.graphEdges.length).toBe(2);
      expect(store.graphStartNode).toBe('A');
      expect(store.dataVersion).toBe(before + 1);
    });

    it('imports valid graph without weights', () => {
      const store = useAlgorithmInputsStore();

      const input = JSON.stringify({
        formatVersion: 2,
        nodes: ['A', 'B', 'C'],
        edges: [
          ['A', 'B'],
          ['B', 'C'],
        ],
      });
      const result = store.importGraphFromJsonText(input);

      expect(result.ok).toBe(true);
      expect(store.graphEdges[0]).not.toHaveProperty('weight');
    });

    it('rejects a bare array', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify(['A', 'B']);
      const result = store.importGraphFromJsonText(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('格式已升级');
      }
    });

    it('rejects malformed JSON', () => {
      const store = useAlgorithmInputsStore();
      const result = store.importGraphFromJsonText('{not valid json');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('JSON 解析失败');
      }
    });

    it('rejects fewer than 2 nodes', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        formatVersion: 2,
        nodes: ['A'],
        edges: [],
      });
      const result = store.importGraphFromJsonText(input);

      expect(result.ok).toBe(false);
    });

    it('increments dataVersion on success', () => {
      const store = useAlgorithmInputsStore();
      const before = store.dataVersion;

      const input = JSON.stringify({
        formatVersion: 2,
        nodes: ['X', 'Y'],
        edges: [['X', 'Y']],
      });
      store.importGraphFromJsonText(input);

      expect(store.dataVersion).toBe(before + 1);
    });
  });
});
