import { algorithmRegistry } from '@/algorithms/registry/algorithmRegistry';

export function findAlgorithm(category: string, slug: string) {
  return algorithmRegistry.find(
    algorithm => algorithm.category === category && algorithm.slug === slug
  );
}
