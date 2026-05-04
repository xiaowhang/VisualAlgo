import { describe, it, expect } from 'vitest';
import { allAlgorithmRegistries } from './index';

describe('allAlgorithmRegistries', () => {
  it('contains the expected total number of algorithms (25)', () => {
    expect(allAlgorithmRegistries).toHaveLength(25);
  });

  it('has no duplicate ids', () => {
    const ids = allAlgorithmRegistries.map(a => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('has no duplicate slugs', () => {
    const slugs = allAlgorithmRegistries.map(a => a.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('every entry has a createSteps function', () => {
    for (const algorithm of allAlgorithmRegistries) {
      expect(typeof algorithm.createSteps).toBe('function');
    }
  });

  it('every entry has required fields', () => {
    for (const algorithm of allAlgorithmRegistries) {
      expect(typeof algorithm.id).toBe('string');
      expect(algorithm.id.length).toBeGreaterThan(0);

      expect(typeof algorithm.slug).toBe('string');
      expect(algorithm.slug.length).toBeGreaterThan(0);

      expect(typeof algorithm.title).toBe('string');
      expect(algorithm.title.length).toBeGreaterThan(0);

      expect(typeof algorithm.description).toBe('string');

      expect(Array.isArray(algorithm.categories)).toBe(true);
      expect(algorithm.categories.length).toBeGreaterThan(0);

      expect(typeof algorithm.visualization).toBe('string');
    }
  });

  it('contains 6 sorting algorithms', () => {
    const sorting = allAlgorithmRegistries.filter(a => a.categories.includes('sorting'));
    expect(sorting).toHaveLength(6);
  });

  it('contains 3 graph algorithms', () => {
    const graphs = allAlgorithmRegistries.filter(a => a.categories.includes('graphs'));
    expect(graphs).toHaveLength(3);
  });

  it('contains 1 tree algorithm', () => {
    const trees = allAlgorithmRegistries.filter(a => a.categories.includes('trees'));
    expect(trees).toHaveLength(1);
  });

  it('contains 4 divide-conquer algorithms', () => {
    const dc = allAlgorithmRegistries.filter(a => a.categories.includes('divide-conquer'));
    expect(dc).toHaveLength(4);
  });

  it('contains 3 dynamic-programming algorithms', () => {
    const dp = allAlgorithmRegistries.filter(a => a.categories.includes('dynamic-programming'));
    expect(dp).toHaveLength(3);
  });

  it('contains 3 greedy algorithms', () => {
    const greedy = allAlgorithmRegistries.filter(a => a.categories.includes('greedy'));
    expect(greedy).toHaveLength(3);
  });

  it('contains 2 backtracking algorithms', () => {
    const bt = allAlgorithmRegistries.filter(a => a.categories.includes('backtracking'));
    expect(bt).toHaveLength(2);
  });

  it('contains 3 network-flow algorithms', () => {
    const nf = allAlgorithmRegistries.filter(a => a.categories.includes('network-flow'));
    expect(nf).toHaveLength(3);
  });

  it('contains 3 linear-programming algorithms', () => {
    const lp = allAlgorithmRegistries.filter(a => a.categories.includes('linear-programming'));
    expect(lp).toHaveLength(3);
  });
});
