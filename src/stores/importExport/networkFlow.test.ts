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

describe('networkFlow import/export (store)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // -------------------------------------------------------------------------
  // exportNetworkFlowAsJsonText
  // -------------------------------------------------------------------------

  describe('exportNetworkFlowAsJsonText', () => {
    it('returns JSON with nodes, edges, source, sink', () => {
      const store = useAlgorithmInputsStore();
      const json = store.exportNetworkFlowAsJsonText();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed.nodes)).toBe(true);
      expect(Array.isArray(parsed.edges)).toBe(true);
      expect(typeof parsed.source).toBe('string');
      expect(typeof parsed.sink).toBe('string');
    });
  });

  // -------------------------------------------------------------------------
  // importNetworkFlowFromJsonText — valid
  // -------------------------------------------------------------------------

  describe('importNetworkFlowFromJsonText (valid)', () => {
    it('imports valid network flow data', () => {
      const store = useAlgorithmInputsStore();
      const before = store.dataVersion;

      const input = JSON.stringify({
        nodes: [
          { id: 'S', x: 0, y: 100 },
          { id: 'A', x: 200, y: 50 },
          { id: 'T', x: 400, y: 100 },
        ],
        edges: [
          { source: 'S', target: 'A', capacity: 10 },
          { source: 'A', target: 'T', capacity: 5 },
        ],
        source: 'S',
        sink: 'T',
      });
      const result = store.importNetworkFlowFromJsonText(input);

      expect(result.ok).toBe(true);
      expect(store.networkFlowNodes).toHaveLength(3);
      expect(store.networkFlowEdges).toHaveLength(2);
      expect(store.networkFlowSource).toBe('S');
      expect(store.networkFlowSink).toBe('T');
      expect(store.dataVersion).toBe(before + 1);
    });

    it('imports without overwriting source/sink when omitted', () => {
      const store = useAlgorithmInputsStore();

      const input = JSON.stringify({
        nodes: [
          { id: 'X', x: 0, y: 0 },
          { id: 'Y', x: 100, y: 100 },
        ],
        edges: [{ source: 'X', target: 'Y', capacity: 7 }],
      });
      const result = store.importNetworkFlowFromJsonText(input);

      expect(result.ok).toBe(true);
      // source and sink retain default values
      expect(store.networkFlowSource).toBe('S');
      expect(store.networkFlowSink).toBe('T');
    });
  });

  // -------------------------------------------------------------------------
  // importNetworkFlowFromJsonText — invalid
  // -------------------------------------------------------------------------

  describe('importNetworkFlowFromJsonText (invalid)', () => {
    it('rejects malformed JSON', () => {
      const store = useAlgorithmInputsStore();
      const result = store.importNetworkFlowFromJsonText('{not valid json');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('JSON 解析失败');
      }
    });

    it('rejects missing nodes field', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        edges: [{ source: 'A', target: 'B', capacity: 5 }],
      });
      const result = store.importNetworkFlowFromJsonText(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('nodes');
      }
    });

    it('rejects missing edges field', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        nodes: [{ id: 'A', x: 0, y: 0 }],
      });
      const result = store.importNetworkFlowFromJsonText(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('edges');
      }
    });

    it('rejects empty nodes array', () => {
      const store = useAlgorithmInputsStore();
      const input = JSON.stringify({
        nodes: [],
        edges: [],
      });
      const result = store.importNetworkFlowFromJsonText(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('不能为空');
      }
    });
  });
});
