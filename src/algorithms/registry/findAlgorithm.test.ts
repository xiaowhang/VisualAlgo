import { describe, it, expect, vi } from 'vitest';

vi.mock('@/algorithms/registry/algorithmRegistry', () => ({
  algorithmRegistry: [
    {
      id: 'bs',
      slug: 'bubble-sort',
      title: '冒泡排序',
      description: '',
      categories: ['sorting'],
      comparisonGroup: 'sorting',
      visualization: 'sorting',
      createSteps: () => [],
    },
    {
      id: 'is',
      slug: 'insertion-sort',
      title: '插入排序',
      description: '',
      categories: ['sorting'],
      comparisonGroup: 'sorting',
      visualization: 'sorting',
      createSteps: () => [],
    },
    {
      id: 'qs',
      slug: 'quick-sort',
      title: '快速排序',
      description: '',
      categories: ['sorting'],
      comparisonGroup: 'sorting',
      visualization: 'sorting',
      createSteps: () => [],
    },
    {
      id: 'bfs',
      slug: 'bfs',
      title: 'BFS',
      description: '',
      categories: ['graphs'],
      comparisonGroup: 'graph-traversal',
      visualization: 'graph',
      createSteps: () => [],
    },
    {
      id: 'dfs',
      slug: 'dfs',
      title: 'DFS',
      description: '',
      categories: ['graphs'],
      comparisonGroup: 'graph-traversal',
      visualization: 'graph',
      createSteps: () => [],
    },
    {
      id: 'ff',
      slug: 'ford-fulkerson',
      title: 'Ford-Fulkerson',
      description: '',
      categories: ['network-flow'],
      comparisonGroup: 'max-flow',
      visualization: 'network-flow',
      createSteps: () => [],
    },
    {
      id: 'ek',
      slug: 'edmonds-karp',
      title: 'Edmonds-Karp',
      description: '',
      categories: ['network-flow'],
      comparisonGroup: 'max-flow',
      visualization: 'network-flow',
      createSteps: () => [],
    },
    {
      id: 'multi',
      slug: 'multi-cat-algo',
      title: 'Multi Category',
      description: '',
      categories: ['sorting', 'graphs'],
      comparisonGroup: 'sorting',
      visualization: 'sorting',
      createSteps: () => [],
    },
  ],
}));

import { findAlgorithm } from './findAlgorithm';

describe('findAlgorithm', () => {
  it('finds algorithm by matching category and slug', () => {
    const result = findAlgorithm('sorting', 'bubble-sort');
    expect(result).toBeDefined();
    expect(result!.id).toBe('bs');
    expect(result!.title).toBe('冒泡排序');
  });

  it('returns undefined when category does not match', () => {
    const result = findAlgorithm('graphs', 'bubble-sort');
    expect(result).toBeUndefined();
  });

  it('returns undefined when slug does not match', () => {
    const result = findAlgorithm('sorting', 'nonexistent');
    expect(result).toBeUndefined();
  });

  it('finds algorithm in multiple categories via first category', () => {
    const result = findAlgorithm('sorting', 'multi-cat-algo');
    expect(result).toBeDefined();
    expect(result!.id).toBe('multi');
  });

  it('finds algorithm in multiple categories via second category', () => {
    const result = findAlgorithm('graphs', 'multi-cat-algo');
    expect(result).toBeDefined();
    expect(result!.id).toBe('multi');
  });

  it('returns undefined for unknown category', () => {
    const result = findAlgorithm('unknown-category', 'bubble-sort');
    expect(result).toBeUndefined();
  });

  it('returns undefined when both category and slug are wrong', () => {
    const result = findAlgorithm('wrong', 'wrong');
    expect(result).toBeUndefined();
  });
});
