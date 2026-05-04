import { describe, it, expect, vi } from 'vitest';

vi.mock('@/algorithms/shared/inputs', () => ({
  getGraphSnapshot: vi.fn(() => ({
    nodes: [
      { id: 'A', x: 0, y: 0 },
      { id: 'B', x: 100, y: 0 },
      { id: 'C', x: 50, y: 100 },
    ],
    edges: [
      { source: 'A', target: 'B' },
      { source: 'A', target: 'C' },
      { source: 'B', target: 'C' },
    ],
    adjacencyList: new Map([
      ['A', ['B', 'C']],
      ['B', ['A', 'C']],
      ['C', ['A', 'B']],
    ]),
  })),
  getGraphStartNode: vi.fn(() => 'A'),
}));

import type { GraphStep } from '@/types/algorithm';
import { bfsRegistry } from './bfs.registry';
import { dfsRegistry } from './dfs.registry';

describe('BFS', () => {
  it('produces non-empty steps with kind=graph', () => {
    const steps = bfsRegistry.createSteps();
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.kind).toBe('graph');
    }
  });

  it('every step has nodes and edges', () => {
    const steps = bfsRegistry.createSteps();
    for (const step of steps) {
      const s = step as GraphStep;
      expect(s.nodes.length).toBeGreaterThan(0);
      expect(s.edges.length).toBeGreaterThan(0);
    }
  });

  it('final step has all 3 nodes in visited set', () => {
    const steps = bfsRegistry.createSteps();
    const last = steps[steps.length - 1] as GraphStep;
    expect(last.visited).toContain('A');
    expect(last.visited).toContain('B');
    expect(last.visited).toContain('C');
    expect(last.visited).toHaveLength(3);
  });

  it('order array in final step contains all nodes', () => {
    const steps = bfsRegistry.createSteps();
    const last = steps[steps.length - 1] as GraphStep;
    expect(last.order).toContain('A');
    expect(last.order).toContain('B');
    expect(last.order).toContain('C');
    expect(last.order).toHaveLength(3);
  });
});

describe('DFS', () => {
  it('produces non-empty steps with kind=graph', () => {
    const steps = dfsRegistry.createSteps();
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.kind).toBe('graph');
    }
  });

  it('final step has all 3 nodes visited', () => {
    const steps = dfsRegistry.createSteps();
    const last = steps[steps.length - 1] as GraphStep;
    expect(last.visited).toContain('A');
    expect(last.visited).toContain('B');
    expect(last.visited).toContain('C');
    expect(last.visited).toHaveLength(3);
  });

  it('DFS order is valid and covers all nodes', () => {
    const steps = dfsRegistry.createSteps();
    const last = steps[steps.length - 1] as GraphStep;
    expect(last.order).toHaveLength(3);
    expect(new Set(last.order)).toEqual(new Set(['A', 'B', 'C']));
  });
});
