import type { AlgorithmCategory } from '@/types/algorithm';
import { algorithmRegistry } from '@/algorithms/registry/algorithmRegistry';
import type { AlgorithmMenuItem } from '@/algorithms/registry/types';

export const algorithmMenuByCategory = algorithmRegistry.reduce<
  Record<AlgorithmCategory, AlgorithmMenuItem[]>
>(
  (accumulator, algorithm) => {
    for (const cat of algorithm.categories) {
      accumulator[cat].push({
        title: algorithm.title,
        slug: algorithm.slug,
        category: cat,
      });
    }
    return accumulator;
  },
  {
    sorting: [],
    graphs: [],
    trees: [],
    'divide-conquer': [],
    'dynamic-programming': [],
    greedy: [],
    backtracking: [],
    'network-flow': [],
    'linear-programming': [],
    searching: [],
  }
);
