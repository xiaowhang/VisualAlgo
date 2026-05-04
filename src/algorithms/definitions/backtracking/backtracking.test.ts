import { describe, it, expect, vi } from 'vitest';

vi.mock('@/algorithms/shared/inputs', () => ({
  getNQueensSize: vi.fn(() => 4),
  getSubsetSumInput: vi.fn(() => ({ nums: [3, 5, 6, 7], target: 15 })),
}));

import { nQueensRegistry } from './n-queens.registry';
import { subsetSumRegistry } from './subset-sum.registry';
import type { ChessboardStep, DecisionTreeStep } from '@/types/algorithm';

describe('N-Queens (n=4)', () => {
  const steps = nQueensRegistry.createSteps();

  it('produces non-empty steps', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind="chessboard"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('chessboard');
    }
  });

  it('every step has size=4', () => {
    for (const step of steps) {
      expect((step as ChessboardStep).size).toBe(4);
    }
  });

  it('final step has phase="done"', () => {
    const last = steps[steps.length - 1] as ChessboardStep;
    expect(last.phase).toBe('done');
  });

  it('final step has 4 queens placed (solution found)', () => {
    const last = steps[steps.length - 1] as ChessboardStep;
    expect(last.queens).toHaveLength(4);
  });

  it('every step has queens, current, conflicts, and highlights fields', () => {
    for (const step of steps) {
      const s = step as ChessboardStep;
      expect(Array.isArray(s.queens)).toBe(true);
      expect('current' in s).toBe(true);
      expect(Array.isArray(s.conflicts)).toBe(true);
      expect(typeof s.highlights).toBe('object');
    }
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(typeof step.description).toBe('string');
      expect(step.description.length).toBeGreaterThan(0);
    }
  });
});

describe('Subset Sum (nums=[3,5,6,7], target=15)', () => {
  const steps = subsetSumRegistry.createSteps();

  it('produces non-empty steps', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind="decision-tree"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('decision-tree');
    }
  });

  it('every step has nodes and edges arrays', () => {
    for (const step of steps) {
      const s = step as DecisionTreeStep;
      expect(Array.isArray(s.nodes)).toBe(true);
      expect(s.nodes.length).toBeGreaterThan(0);
      expect(Array.isArray(s.edges)).toBe(true);
    }
  });

  it('every step has current, solutionPaths, and highlights fields', () => {
    for (const step of steps) {
      const s = step as DecisionTreeStep;
      expect('current' in s).toBe(true);
      expect(Array.isArray(s.solutionPaths)).toBe(true);
      expect(typeof s.highlights).toBe('object');
    }
  });

  it('final step indicates a result was found (solutionPaths non-empty or description mentions completion)', () => {
    const last = steps[steps.length - 1] as DecisionTreeStep;
    // Either solutions were found, or the final description states none exist
    const hasSolutions = last.solutionPaths.length > 0;
    const descriptionMentionsCompletion =
      last.description.includes('搜索完成') || last.description.includes('未找到');
    expect(hasSolutions || descriptionMentionsCompletion).toBe(true);
  });

  it('finds at least one solution for target=15 with [3,5,6,7]', () => {
    const last = steps[steps.length - 1] as DecisionTreeStep;
    // 3+5+7=15 is a valid subset
    expect(last.solutionPaths.length).toBeGreaterThan(0);
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(typeof step.description).toBe('string');
      expect(step.description.length).toBeGreaterThan(0);
    }
  });
});
