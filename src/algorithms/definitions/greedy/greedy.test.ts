import { describe, it, expect, vi } from 'vitest';

vi.mock('@/algorithms/shared/inputs', () => ({
  getDijkstraInput: vi.fn(() => ({
    graph: {
      nodes: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 100, y: 0 },
        { id: 'C', x: 50, y: 100 },
      ],
      edges: [
        { source: 'A', target: 'B', weight: 4 },
        { source: 'A', target: 'C', weight: 2 },
        { source: 'B', target: 'C', weight: 1 },
      ],
      adjacencyList: new Map([
        ['A', ['B', 'C']],
        ['B', ['A', 'C']],
        ['C', ['A', 'B']],
      ]),
    },
    startNode: 'A',
  })),
  getHuffmanInput: vi.fn(() => ({ text: 'aabbc' })),
  getActivityInput: vi.fn(() => ({
    intervals: [
      { start: 1, end: 4, label: 'A1' },
      { start: 3, end: 5, label: 'A2' },
      { start: 0, end: 6, label: 'A3' },
      { start: 5, end: 7, label: 'A4' },
      { start: 8, end: 9, label: 'A5' },
    ],
  })),
}));

import type { GraphStep, HuffmanStep, TimelineStep } from '@/types/algorithm';
import { dijkstraRegistry } from './dijkstra.registry';
import { huffmanRegistry } from './huffman.registry';
import { activitySelectionRegistry } from './activity-selection.registry';

describe('Dijkstra', () => {
  it('produces non-empty steps with kind=graph', () => {
    const steps = dijkstraRegistry.createSteps();
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.kind).toBe('graph');
    }
  });

  it('final step shows all nodes visited', () => {
    const steps = dijkstraRegistry.createSteps();
    const last = steps[steps.length - 1] as GraphStep;
    expect(last.visited).toContain('A');
    expect(last.visited).toContain('B');
    expect(last.visited).toContain('C');
  });

  it('final step has distance labels for all nodes', () => {
    const steps = dijkstraRegistry.createSteps();
    const last = steps[steps.length - 1] as GraphStep;
    expect(last.nodeLabels).toBeDefined();
    expect(last.nodeLabels!['A']).toBe('0');
    expect(last.nodeLabels!['B']).toBe('3');
    expect(last.nodeLabels!['C']).toBe('2');
  });
});

describe('Huffman', () => {
  it('produces non-empty steps with kind=huffman', () => {
    const steps = huffmanRegistry.createSteps();
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.kind).toBe('huffman');
    }
  });

  it('final step shows encoding table in description', () => {
    const steps = huffmanRegistry.createSteps();
    const last = steps[steps.length - 1] as HuffmanStep;
    expect(last.description).toContain('编码');
  });

  it('final step has all nodes highlighted as done', () => {
    const steps = huffmanRegistry.createSteps();
    const last = steps[steps.length - 1] as HuffmanStep;
    expect(last.queue).toHaveLength(0);
    for (const node of last.nodes) {
      expect(last.highlights[node.id]).toBe('done');
    }
  });
});

describe('Activity Selection', () => {
  it('produces non-empty steps with kind=timeline', () => {
    const steps = activitySelectionRegistry.createSteps();
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.kind).toBe('timeline');
    }
  });

  it('final step shows selected activities count', () => {
    const steps = activitySelectionRegistry.createSteps();
    const last = steps[steps.length - 1] as TimelineStep;
    expect(last.description).toContain('选择');
    expect(last.description).toMatch(/\d+/);
  });

  it('final step has correct interval states', () => {
    const steps = activitySelectionRegistry.createSteps();
    const last = steps[steps.length - 1] as TimelineStep;

    const selected = Object.values(last.highlights).filter(v => v === 'selected');
    const rejected = Object.values(last.highlights).filter(v => v === 'rejected');

    expect(selected.length).toBeGreaterThan(0);
    expect(selected.length + rejected.length).toBe(last.intervals.length);
  });
});
