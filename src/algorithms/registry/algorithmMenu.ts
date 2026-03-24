import type { AlgorithmCategory } from '@/types/algorithm';
import { algorithmRegistry } from '@/algorithms/registry/algorithmRegistry';
import type { AlgorithmMenuItem } from '@/algorithms/registry/types';

export const algorithmMenuByCategory = algorithmRegistry.reduce<
  Record<AlgorithmCategory, AlgorithmMenuItem[]>
>(
  (accumulator, algorithm) => {
    accumulator[algorithm.category].push({
      title: algorithm.title,
      slug: algorithm.slug,
      category: algorithm.category,
    });
    return accumulator;
  },
  {
    sorting: [],
    graphs: [],
  }
);
