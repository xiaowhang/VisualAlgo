import { describe, it, expect, vi } from 'vitest';

vi.mock('@/algorithms/shared/inputs', () => ({
  getLpInput: vi.fn(() => ({
    objective: [3, 5],
    constraints: [
      [1, 0, 4],
      [0, 2, 12],
      [3, 5, 30],
    ],
    constraintLabels: ['x₁ ≤ 4', '2x₂ ≤ 12', '3x₁+5x₂ ≤ 30'],
  })),
}));

import { simplexRegistry } from './simplex.registry';
import { dualSimplexRegistry } from './dual-simplex.registry';
import { lpGraphicalRegistry } from './lp-graphical.registry';
import type { LpTableauStep, LpGraphicalStep } from '@/types/algorithm';

describe('Simplex', () => {
  const steps = simplexRegistry.createSteps();

  it('produces non-empty steps', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind="lp-tableau"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('lp-tableau');
    }
  });

  it('every step has tableau, variableNames, and rowLabels', () => {
    for (const step of steps) {
      const s = step as LpTableauStep;
      expect(Array.isArray(s.tableau)).toBe(true);
      expect(s.tableau.length).toBeGreaterThan(0);
      expect(Array.isArray(s.variableNames)).toBe(true);
      expect(Array.isArray(s.rowLabels)).toBe(true);
    }
  });

  it('final step has phase="optimal"', () => {
    const last = steps[steps.length - 1] as LpTableauStep;
    expect(last.phase).toBe('optimal');
  });

  it('final step has objectiveValue > 0', () => {
    const last = steps[steps.length - 1] as LpTableauStep;
    expect(last.objectiveValue).toBeGreaterThan(0);
  });

  it('objective value is approximately 30', () => {
    const last = steps[steps.length - 1] as LpTableauStep;
    // max 3x1 + 5x2, constraints: x1<=4, x2<=6, 3x1+5x2<=30
    // Optimal at x1=4, x2=3.6: obj = 3*4 + 5*3.6 = 30
    expect(last.objectiveValue).toBeCloseTo(30, 0);
  });

  it('first step has phase="init"', () => {
    const first = steps[0] as LpTableauStep;
    expect(first.phase).toBe('init');
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('every step has a highlights object', () => {
    for (const step of steps) {
      expect(typeof (step as LpTableauStep).highlights).toBe('object');
    }
  });
});

describe('Dual Simplex', () => {
  const steps = dualSimplexRegistry.createSteps();

  it('produces non-empty steps', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind="lp-tableau"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('lp-tableau');
    }
  });

  it('every step has tableau, variableNames, and rowLabels', () => {
    for (const step of steps) {
      const s = step as LpTableauStep;
      expect(Array.isArray(s.tableau)).toBe(true);
      expect(s.tableau.length).toBeGreaterThan(0);
      expect(Array.isArray(s.variableNames)).toBe(true);
      expect(Array.isArray(s.rowLabels)).toBe(true);
    }
  });

  it('final step has valid terminal phase', () => {
    const last = steps[steps.length - 1] as LpTableauStep;
    expect(['optimal', 'infeasible', 'unbounded']).toContain(last.phase);
  });

  it('final step has objectiveValue >= 0', () => {
    const last = steps[steps.length - 1] as LpTableauStep;
    expect(last.objectiveValue).toBeGreaterThanOrEqual(0);
  });

  it('first step has phase="init"', () => {
    const first = steps[0] as LpTableauStep;
    expect(first.phase).toBe('init');
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('every step has a highlights object', () => {
    for (const step of steps) {
      expect(typeof (step as LpTableauStep).highlights).toBe('object');
    }
  });
});

describe('LP Graphical', () => {
  const steps = lpGraphicalRegistry.createSteps();

  it('produces non-empty steps', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind="lp-graphical"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('lp-graphical');
    }
  });

  it('every step has constraints and feasibleRegion', () => {
    for (const step of steps) {
      const s = step as LpGraphicalStep;
      expect(Array.isArray(s.constraints)).toBe(true);
      expect(s.constraints.length).toBe(3);
      expect(Array.isArray(s.feasibleRegion)).toBe(true);
      expect(s.feasibleRegion.length).toBeGreaterThan(0);
    }
  });

  it('every step has objectiveA, objectiveB, and objectiveValue', () => {
    for (const step of steps) {
      const s = step as LpGraphicalStep;
      expect(typeof s.objectiveA).toBe('number');
      expect(typeof s.objectiveB).toBe('number');
      expect(typeof s.objectiveValue).toBe('number');
    }
  });

  it('every step has xRange and yRange', () => {
    for (const step of steps) {
      const s = step as LpGraphicalStep;
      expect(Array.isArray(s.xRange)).toBe(true);
      expect(s.xRange.length).toBe(2);
      expect(Array.isArray(s.yRange)).toBe(true);
      expect(s.yRange.length).toBe(2);
    }
  });

  it('final step has optimalPoint set', () => {
    const last = steps[steps.length - 1] as LpGraphicalStep;
    expect(last.optimalPoint).not.toBeNull();
  });

  it('final step has the maximum objective value', () => {
    const last = steps[steps.length - 1] as LpGraphicalStep;
    // max 3x1 + 5x2 with given constraints is 30 at (4, 3.6)
    expect(last.objectiveValue).toBeCloseTo(30, 0);
  });

  it('first step shows constraints without optimal point', () => {
    const first = steps[0] as LpGraphicalStep;
    expect(first.optimalPoint).toBeNull();
    expect(first.objectiveValue).toBe(0);
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('every step has a highlights object', () => {
    for (const step of steps) {
      expect(typeof (step as LpGraphicalStep).highlights).toBe('object');
    }
  });
});
