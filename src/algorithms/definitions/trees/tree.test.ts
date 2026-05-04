import { describe, it, expect, vi } from 'vitest';

vi.mock('@/algorithms/shared/inputs', () => ({
  getTreeSnapshot: vi.fn(() => ({
    nodes: [
      { id: '8', x: 200, y: 50 },
      { id: '3', x: 100, y: 150 },
      { id: '10', x: 300, y: 150 },
      { id: '1', x: 50, y: 250 },
      { id: '6', x: 150, y: 250 },
    ],
    edges: [
      { source: '8', target: '3' },
      { source: '8', target: '10' },
      { source: '3', target: '1' },
      { source: '3', target: '6' },
    ],
  })),
  getTreeTargetValue: vi.fn(() => '6'),
}));

import type { TreeStep } from '@/types/algorithm';
import { bstSearchRegistry } from './bst-search.registry';

describe('BST Search', () => {
  it('produces non-empty steps with kind=tree', () => {
    const steps = bstSearchRegistry.createSteps();
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.kind).toBe('tree');
    }
  });

  it('steps traverse from root (8) toward target (6)', () => {
    const steps = bstSearchRegistry.createSteps();
    const descriptions = steps.map(s => s.description);

    // Should mention the target value
    expect(descriptions[0]).toContain('6');

    // Should visit node 3 (left child of 8, since 6 < 8)
    expect(descriptions.some(d => d.includes('3'))).toBe(true);

    // Should reach node 6 (right child of 3, since 6 > 3)
    expect(descriptions.some(d => d.includes('6'))).toBe(true);
  });

  it('final step indicates the target was found', () => {
    const steps = bstSearchRegistry.createSteps();
    const last = steps[steps.length - 1] as TreeStep;

    // Description should indicate found
    expect(last.description).toContain('找到');

    // Node 6 should be highlighted as done
    expect(last.highlights['6']).toBe('done');
  });
});
