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
      categories: ['sorting', 'greedy'],
      comparisonGroup: 'sorting',
      visualization: 'sorting',
      createSteps: () => [],
    },
  ],
}));

import { algorithmMenuByCategory } from './algorithmMenu';

describe('algorithmMenuByCategory', () => {
  it('has all 10 AlgorithmCategory keys', () => {
    const expectedKeys = [
      'sorting',
      'graphs',
      'trees',
      'divide-conquer',
      'dynamic-programming',
      'greedy',
      'backtracking',
      'network-flow',
      'linear-programming',
      'searching',
    ];
    expect(Object.keys(algorithmMenuByCategory).sort()).toEqual(expectedKeys.sort());
  });

  it('sorting category has 4 items (3 sorting-only + 1 multi-category)', () => {
    const items = algorithmMenuByCategory['sorting'];
    expect(items).toHaveLength(4);
  });

  it('graphs category has 2 items', () => {
    const items = algorithmMenuByCategory['graphs'];
    expect(items).toHaveLength(2);
  });

  it('network-flow category has 2 items', () => {
    const items = algorithmMenuByCategory['network-flow'];
    expect(items).toHaveLength(2);
  });

  it('greedy category has 1 item (from multi-category algorithm)', () => {
    const items = algorithmMenuByCategory['greedy'];
    expect(items).toHaveLength(1);
    expect(items[0].slug).toBe('multi-cat-algo');
  });

  it('empty categories have 0 items', () => {
    const emptyCategories = [
      'trees',
      'divide-conquer',
      'dynamic-programming',
      'backtracking',
      'linear-programming',
      'searching',
    ] as const;
    for (const category of emptyCategories) {
      expect(algorithmMenuByCategory[category]).toHaveLength(0);
    }
  });

  it('each item has title, slug, and category', () => {
    for (const [category, items] of Object.entries(algorithmMenuByCategory)) {
      for (const item of items) {
        expect(item).toHaveProperty('title');
        expect(typeof item.title).toBe('string');
        expect(item.title.length).toBeGreaterThan(0);

        expect(item).toHaveProperty('slug');
        expect(typeof item.slug).toBe('string');
        expect(item.slug.length).toBeGreaterThan(0);

        expect(item).toHaveProperty('category');
        expect(item.category).toBe(category);
      }
    }
  });

  it('multi-category algorithm appears in each of its categories', () => {
    const sortingSlugs = algorithmMenuByCategory['sorting'].map(i => i.slug);
    const greedySlugs = algorithmMenuByCategory['greedy'].map(i => i.slug);
    expect(sortingSlugs).toContain('multi-cat-algo');
    expect(greedySlugs).toContain('multi-cat-algo');
  });
});
