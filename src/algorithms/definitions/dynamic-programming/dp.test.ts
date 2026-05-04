import { describe, it, expect, vi } from 'vitest';

vi.mock('@/algorithms/shared/inputs', () => ({
  getDpLcsStrings: vi.fn(() => ({ x: 'ABCBDAB', y: 'BDCABA' })),
  getDpKnapsackInput: vi.fn(() => ({
    capacity: 10,
    items: [
      { weight: 2, value: 6 },
      { weight: 2, value: 10 },
      { weight: 3, value: 12 },
    ],
  })),
  getDpInvestmentInput: vi.fn(() => ({
    investmentCount: 2,
    resources: 4,
    returns: [
      [0, 5, 10, 12, 13],
      [0, 4, 8, 12, 14],
    ],
  })),
}));

import { lcsRegistry } from './lcs.registry';
import { knapsackRegistry } from './knapsack.registry';
import { investmentRegistry } from './investment.registry';
import type { DpTableStep } from '@/types/algorithm';

describe('LCS (X="ABCBDAB", Y="BDCABA")', () => {
  const steps = lcsRegistry.createSteps();

  it('produces non-empty steps', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind="dp-table"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('dp-table');
    }
  });

  it('phases include init, compute, backtrack, and done', () => {
    const phases = new Set(steps.map(s => (s as DpTableStep).phase));
    expect(phases.has('init')).toBe(true);
    expect(phases.has('compute')).toBe(true);
    expect(phases.has('backtrack')).toBe(true);
    expect(phases.has('done')).toBe(true);
  });

  it('first step has phase="init"', () => {
    expect((steps[0] as DpTableStep).phase).toBe('init');
  });

  it('final step has phase="done"', () => {
    const last = steps[steps.length - 1] as DpTableStep;
    expect(last.phase).toBe('done');
  });

  it('final step description contains LCS length = 4', () => {
    const last = steps[steps.length - 1] as DpTableStep;
    expect(last.description).toContain('4');
  });

  it('table has correct dimensions (8 rows x 7 cols)', () => {
    const first = steps[0] as DpTableStep;
    // m=7, n=6 => table is (m+1) x (n+1) = 8 x 7
    expect(first.table.length).toBe(8);
    expect(first.table[0].length).toBe(7);
  });

  it('rowLabels has 8 entries (empty + 7 chars of X)', () => {
    const first = steps[0] as DpTableStep;
    expect(first.rowLabels.length).toBe(8);
    expect(first.rowLabels[0]).toBe('');
    expect(first.rowLabels[1]).toBe('A');
  });

  it('colLabels has 7 entries (empty + 6 chars of Y)', () => {
    const first = steps[0] as DpTableStep;
    expect(first.colLabels.length).toBe(7);
    expect(first.colLabels[0]).toBe('');
    expect(first.colLabels[1]).toBe('B');
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('every step has table and highlights', () => {
    for (const step of steps) {
      const s = step as DpTableStep;
      expect(Array.isArray(s.table)).toBe(true);
      expect(typeof s.highlights).toBe('object');
    }
  });
});

describe('0/1 Knapsack (capacity=10, 3 items)', () => {
  const steps = knapsackRegistry.createSteps();

  it('produces non-empty steps', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind="dp-table"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('dp-table');
    }
  });

  it('first step has phase="init"', () => {
    expect((steps[0] as DpTableStep).phase).toBe('init');
  });

  it('final step has phase="done"', () => {
    const last = steps[steps.length - 1] as DpTableStep;
    expect(last.phase).toBe('done');
  });

  it('table has correct dimensions (4 rows x 11 cols)', () => {
    const first = steps[0] as DpTableStep;
    // n=3 items, capacity=10 => table is (n+1) x (capacity+1) = 4 x 11
    expect(first.table.length).toBe(4);
    expect(first.table[0].length).toBe(11);
  });

  it('final step description contains max value = 28', () => {
    const last = steps[steps.length - 1] as DpTableStep;
    // items 2+3: w=2+3=5, v=10+12=22; or items 1+2+3: w=2+2+3=7, v=6+10+12=28
    expect(last.description).toContain('28');
  });

  it('phases include init, compute, backtrack, and done', () => {
    const phases = new Set(steps.map(s => (s as DpTableStep).phase));
    expect(phases.has('init')).toBe(true);
    expect(phases.has('compute')).toBe(true);
    expect(phases.has('backtrack')).toBe(true);
    expect(phases.has('done')).toBe(true);
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('every step has table and highlights', () => {
    for (const step of steps) {
      const s = step as DpTableStep;
      expect(Array.isArray(s.table)).toBe(true);
      expect(typeof s.highlights).toBe('object');
    }
  });
});

describe('Investment (2 investments, 4 resources)', () => {
  const steps = investmentRegistry.createSteps();

  it('produces non-empty steps', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind="dp-table"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('dp-table');
    }
  });

  it('first step has phase="init"', () => {
    expect((steps[0] as DpTableStep).phase).toBe('init');
  });

  it('final step has phase="done"', () => {
    const last = steps[steps.length - 1] as DpTableStep;
    expect(last.phase).toBe('done');
  });

  it('table has correct dimensions (3 rows x 6 cols)', () => {
    const first = steps[0] as DpTableStep;
    // n=2, M=4 => table is (n+1) x (M+2) = 3 x 6
    expect(first.table.length).toBe(3);
    expect(first.table[0].length).toBe(6);
  });

  it('phases include init, compute, backtrack, and done', () => {
    const phases = new Set(steps.map(s => (s as DpTableStep).phase));
    expect(phases.has('init')).toBe(true);
    expect(phases.has('compute')).toBe(true);
    expect(phases.has('backtrack')).toBe(true);
    expect(phases.has('done')).toBe(true);
  });

  it('final step description contains total return value', () => {
    const last = steps[steps.length - 1] as DpTableStep;
    // Should mention the max total return
    expect(last.description).toMatch(/\d+/);
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('every step has table and highlights', () => {
    for (const step of steps) {
      const s = step as DpTableStep;
      expect(Array.isArray(s.table)).toBe(true);
      expect(typeof s.highlights).toBe('object');
    }
  });
});
