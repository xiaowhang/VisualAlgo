import type { AlgorithmCategory } from '@/types/algorithm';
import { algorithmRegistry } from '@/algorithms/registry/algorithmRegistry';

export function findAlgorithm(category: string, slug: string) {
  return algorithmRegistry.find(
    algorithm =>
      algorithm.categories.includes(category as AlgorithmCategory) && algorithm.slug === slug
  );
}
