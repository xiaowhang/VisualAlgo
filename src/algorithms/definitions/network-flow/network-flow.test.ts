import { describe, it, expect, vi } from 'vitest';

vi.mock('@/algorithms/shared/inputs', () => ({
  getNetworkFlowInput: vi.fn(() => ({
    nodes: [
      { id: 'S', x: 0, y: 100 },
      { id: 'A', x: 150, y: 0 },
      { id: 'B', x: 150, y: 200 },
      { id: 'T', x: 300, y: 100 },
    ],
    edges: [
      { source: 'S', target: 'A', capacity: 10 },
      { source: 'S', target: 'B', capacity: 10 },
      { source: 'A', target: 'B', capacity: 2 },
      { source: 'A', target: 'T', capacity: 10 },
      { source: 'B', target: 'T', capacity: 10 },
    ],
    source: 'S',
    sink: 'T',
  })),
}));

import { fordFulkersonRegistry } from './ford-fulkerson.registry';
import { edmondsKarpRegistry } from './edmonds-karp.registry';
import { minCutRegistry } from './min-cut.registry';
import type { NetworkFlowStep } from '@/types/algorithm';

describe('Ford-Fulkerson', () => {
  const steps = fordFulkersonRegistry.createSteps();

  it('produces non-empty steps', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind="network-flow"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('network-flow');
    }
  });

  it('every step has nodes, edges, source, and sink', () => {
    for (const step of steps) {
      const s = step as NetworkFlowStep;
      expect(Array.isArray(s.nodes)).toBe(true);
      expect(s.nodes.length).toBe(4);
      expect(Array.isArray(s.edges)).toBe(true);
      expect(s.edges.length).toBe(5);
      expect(s.source).toBe('S');
      expect(s.sink).toBe('T');
    }
  });

  it('every step has currentFlow as a number >= 0', () => {
    for (const step of steps) {
      const s = step as NetworkFlowStep;
      expect(typeof s.currentFlow).toBe('number');
      expect(s.currentFlow).toBeGreaterThanOrEqual(0);
    }
  });

  it('final step has maxFlow = 20', () => {
    const last = steps[steps.length - 1] as NetworkFlowStep;
    expect(last.maxFlow).toBe(20);
  });

  it('steps include augmenting path steps', () => {
    const stepsWithPath = steps.filter(s => (s as NetworkFlowStep).augmentingPath !== null);
    expect(stepsWithPath.length).toBeGreaterThan(0);
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('every step has a highlights object', () => {
    for (const step of steps) {
      expect(typeof (step as NetworkFlowStep).highlights).toBe('object');
    }
  });
});

describe('Edmonds-Karp', () => {
  const steps = edmondsKarpRegistry.createSteps();

  it('produces non-empty steps', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind="network-flow"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('network-flow');
    }
  });

  it('every step has nodes, edges, source, and sink', () => {
    for (const step of steps) {
      const s = step as NetworkFlowStep;
      expect(s.nodes.length).toBe(4);
      expect(s.edges.length).toBe(5);
      expect(s.source).toBe('S');
      expect(s.sink).toBe('T');
    }
  });

  it('every step has currentFlow as a number >= 0', () => {
    for (const step of steps) {
      const s = step as NetworkFlowStep;
      expect(typeof s.currentFlow).toBe('number');
      expect(s.currentFlow).toBeGreaterThanOrEqual(0);
    }
  });

  it('final step has maxFlow = 20', () => {
    const last = steps[steps.length - 1] as NetworkFlowStep;
    expect(last.maxFlow).toBe(20);
  });

  it('steps include augmenting path steps', () => {
    const stepsWithPath = steps.filter(s => (s as NetworkFlowStep).augmentingPath !== null);
    expect(stepsWithPath.length).toBeGreaterThan(0);
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('every step has a highlights object', () => {
    for (const step of steps) {
      expect(typeof (step as NetworkFlowStep).highlights).toBe('object');
    }
  });
});

describe('Min-Cut', () => {
  const steps = minCutRegistry.createSteps();

  it('produces non-empty steps', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind="network-flow"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('network-flow');
    }
  });

  it('every step has nodes, edges, source, and sink', () => {
    for (const step of steps) {
      const s = step as NetworkFlowStep;
      expect(s.nodes.length).toBe(4);
      expect(s.edges.length).toBe(5);
      expect(s.source).toBe('S');
      expect(s.sink).toBe('T');
    }
  });

  it('every step has currentFlow as a number >= 0', () => {
    for (const step of steps) {
      const s = step as NetworkFlowStep;
      expect(typeof s.currentFlow).toBe('number');
      expect(s.currentFlow).toBeGreaterThanOrEqual(0);
    }
  });

  it('final step shows currentFlow = 20 (max flow computed via min-cut)', () => {
    const last = steps[steps.length - 1] as NetworkFlowStep;
    expect(last.currentFlow).toBe(20);
  });

  it('final step identifies cut edges', () => {
    const last = steps[steps.length - 1] as NetworkFlowStep;
    expect(last.cutEdges).not.toBeNull();
    expect(last.cutEdges!.length).toBeGreaterThan(0);
  });

  it('final step identifies the S-side partition', () => {
    const last = steps[steps.length - 1] as NetworkFlowStep;
    expect(last.cutS).not.toBeNull();
    expect(last.cutS!.length).toBeGreaterThan(0);
    expect(last.cutS).toContain('S');
  });

  it('steps include augmenting path steps during max-flow computation', () => {
    const stepsWithPath = steps.filter(s => (s as NetworkFlowStep).augmentingPath !== null);
    expect(stepsWithPath.length).toBeGreaterThan(0);
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('every step has a highlights object', () => {
    for (const step of steps) {
      expect(typeof (step as NetworkFlowStep).highlights).toBe('object');
    }
  });
});
