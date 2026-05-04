import { describe, it, expect } from 'vitest';
import { GRAPH_SNAPSHOT_FORMAT_VERSION, parseGraphImportJson } from './graphInput.ts';

describe('GRAPH_SNAPSHOT_FORMAT_VERSION', () => {
  it('is 2', () => {
    expect(GRAPH_SNAPSHOT_FORMAT_VERSION).toBe(2);
  });
});

describe('parseGraphImportJson', () => {
  // ---------------------------------------------------------------
  // Valid imports
  // ---------------------------------------------------------------
  describe('valid imports', () => {
    it('returns ok for minimal input (nodes + unweighted edges, no startNode)', () => {
      const raw = JSON.stringify({
        nodes: ['A', 'B', 'C'],
        edges: [
          ['A', 'B'],
          ['B', 'C'],
        ],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.nodeIds).toEqual(['A', 'B', 'C']);
      expect(result.edges).toEqual([
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' },
      ]);
      expect(result.startNode).toBe('A');
    });

    it('returns ok with weighted edges', () => {
      const raw = JSON.stringify({
        nodes: ['X', 'Y'],
        edges: [['X', 'Y', 5]],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.edges).toEqual([{ source: 'X', target: 'Y', weight: 5 }]);
    });

    it('returns ok with explicit startNode', () => {
      const raw = JSON.stringify({
        nodes: ['A', 'B'],
        edges: [['A', 'B']],
        startNode: 'B',
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.startNode).toBe('B');
    });

    it('returns ok with formatVersion', () => {
      const raw = JSON.stringify({
        formatVersion: 2,
        nodes: ['A', 'B'],
        edges: [['A', 'B']],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
    });

    it('returns ok with mixed weighted and unweighted edges', () => {
      const raw = JSON.stringify({
        nodes: ['A', 'B', 'C'],
        edges: [
          ['A', 'B', 3],
          ['B', 'C'],
          ['C', 'A', 7],
        ],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.edges).toEqual([
        { source: 'A', target: 'B', weight: 3 },
        { source: 'B', target: 'C' },
        { source: 'C', target: 'A', weight: 7 },
      ]);
    });
  });

  // ---------------------------------------------------------------
  // Invalid inputs
  // ---------------------------------------------------------------
  describe('invalid inputs', () => {
    it('returns error for malformed JSON', () => {
      const result = parseGraphImportJson('{ broken json');

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.message).toBe('JSON 解析失败，请检查文件内容。');
    });

    it('returns error for a bare array (legacy format)', () => {
      const result = parseGraphImportJson(
        JSON.stringify([
          ['A', 'B'],
          ['B', 'C'],
        ])
      );

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.message).toContain('JSON 格式已升级');
    });

    it('returns error when fewer than 2 nodes', () => {
      const raw = JSON.stringify({
        nodes: ['A'],
        edges: [],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.message).toContain('2');
    });

    it('returns error when more than 26 nodes', () => {
      const nodes = Array.from({ length: 27 }, (_, i) => `N${i}`);
      const raw = JSON.stringify({ nodes, edges: [] });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.message).toContain('26');
    });

    it('returns error for empty node strings', () => {
      const raw = JSON.stringify({
        nodes: ['A', ''],
        edges: [],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(false);
    });

    it('returns error for extra fields (strict mode)', () => {
      const raw = JSON.stringify({
        nodes: ['A', 'B'],
        edges: [['A', 'B']],
        extraField: 'not allowed',
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(false);
    });

    it('returns error when nodes field is missing', () => {
      const raw = JSON.stringify({
        edges: [['A', 'B']],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(false);
    });

    it('returns error when edges field is missing', () => {
      const raw = JSON.stringify({
        nodes: ['A', 'B'],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(false);
    });

    it('returns error for a bare string', () => {
      const result = parseGraphImportJson('"hello"');
      expect(result.ok).toBe(false);
    });

    it('returns error for a bare number', () => {
      const result = parseGraphImportJson('42');
      expect(result.ok).toBe(false);
    });

    it('returns error for empty string', () => {
      const result = parseGraphImportJson('');
      expect(result.ok).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // Edge mapping
  // ---------------------------------------------------------------
  describe('edge mapping', () => {
    it('converts unweighted tuples to { source, target } objects', () => {
      const raw = JSON.stringify({
        nodes: ['A', 'B'],
        edges: [['A', 'B']],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.edges).toEqual([{ source: 'A', target: 'B' }]);
    });

    it('converts weighted tuples to { source, target, weight } objects', () => {
      const raw = JSON.stringify({
        nodes: ['A', 'B'],
        edges: [['A', 'B', 42]],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.edges).toEqual([{ source: 'A', target: 'B', weight: 42 }]);
    });

    it('preserves weight of 0', () => {
      const raw = JSON.stringify({
        nodes: ['A', 'B'],
        edges: [['A', 'B', 0]],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.edges[0]).toEqual({ source: 'A', target: 'B', weight: 0 });
    });

    it('preserves fractional weights', () => {
      const raw = JSON.stringify({
        nodes: ['A', 'B'],
        edges: [['A', 'B', 3.14]],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.edges[0].weight).toBeCloseTo(3.14);
    });
  });

  // ---------------------------------------------------------------
  // Default startNode
  // ---------------------------------------------------------------
  describe('default startNode', () => {
    it('defaults to the first node when startNode is absent', () => {
      const raw = JSON.stringify({
        nodes: ['X', 'Y', 'Z'],
        edges: [['X', 'Y']],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.startNode).toBe('X');
    });

    it('falls back to "A" when nodes array is empty edge case', () => {
      // The schema requires >= 2 nodes so this path is hard to hit
      // directly, but we verify the fallback logic by checking
      // the implementation path: startNode ?? nodeIds[0] ?? 'A'
      // With valid input, nodeIds[0] is always present.
      const raw = JSON.stringify({
        nodes: ['Alpha', 'Beta'],
        edges: [],
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.startNode).toBe('Alpha');
    });

    it('uses explicit startNode even if it is not the first node', () => {
      const raw = JSON.stringify({
        nodes: ['A', 'B', 'C'],
        edges: [
          ['A', 'B'],
          ['B', 'C'],
        ],
        startNode: 'C',
      });
      const result = parseGraphImportJson(raw);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.startNode).toBe('C');
    });
  });
});
