import type { AlgorithmCategory, ComparisonGroup } from '@/types/algorithm';
import type { AlgorithmMenuItem } from '@/algorithms/registry/types';
import { algorithmRegistry } from '@/algorithms/registry/algorithmRegistry';

export const COMPARE_DEFAULT_GROUP: ComparisonGroup = 'sorting';

export function isComparisonGroup(value: string): value is ComparisonGroup {
  return value === 'sorting' || value === 'graph-traversal' || value === 'max-flow';
}

export function getCompareOptionsByGroup(group: ComparisonGroup): AlgorithmMenuItem[] {
  return algorithmRegistry
    .filter(algorithm => algorithm.comparisonGroup === group)
    .map(algorithm => ({
      title: algorithm.title,
      slug: algorithm.slug,
      category: algorithm.categories[0],
    }));
}

export function resolveAlgorithmBySlug(slug: string) {
  if (!slug) {
    return null;
  }

  for (const algorithm of algorithmRegistry) {
    if (algorithm.slug === slug) {
      return algorithm;
    }
  }

  return null;
}

function resolveFallbackGroup(preferredGroup?: ComparisonGroup): ComparisonGroup {
  if (preferredGroup && getCompareOptionsByGroup(preferredGroup).length > 0) {
    return preferredGroup;
  }

  return COMPARE_DEFAULT_GROUP;
}

function resolveFallbackPair(group: ComparisonGroup) {
  const options = getCompareOptionsByGroup(group);
  const first = options[0]?.slug ?? '';
  const second = options.find(item => item.slug !== first)?.slug ?? first;
  return {
    left: first,
    right: second,
  };
}

export function normalizeComparePair(input: {
  leftSlug: string;
  rightSlug: string;
  preferredGroup?: ComparisonGroup;
}) {
  const leftAlgorithm = resolveAlgorithmBySlug(input.leftSlug);
  const rightAlgorithm = resolveAlgorithmBySlug(input.rightSlug);

  let group = resolveFallbackGroup(input.preferredGroup);
  if (leftAlgorithm?.comparisonGroup) {
    group = leftAlgorithm.comparisonGroup;
  } else if (rightAlgorithm?.comparisonGroup) {
    group = rightAlgorithm.comparisonGroup;
  }

  const fallback = resolveFallbackPair(group);
  const options = getCompareOptionsByGroup(group);

  const normalizedLeft =
    leftAlgorithm && leftAlgorithm.comparisonGroup === group ? leftAlgorithm.slug : fallback.left;

  let normalizedRight =
    rightAlgorithm && rightAlgorithm.comparisonGroup === group
      ? rightAlgorithm.slug
      : fallback.right;

  if (normalizedRight === normalizedLeft && options.length > 1) {
    normalizedRight = options.find(item => item.slug !== normalizedLeft)?.slug ?? normalizedLeft;
  }

  return {
    group,
    left: normalizedLeft,
    right: normalizedRight,
  };
}

// 向后兼容：保留 isAlgorithmCategory 和 getCompareOptionsByCategory
export function isAlgorithmCategory(value: string): value is AlgorithmCategory {
  return (
    value === 'sorting' ||
    value === 'graphs' ||
    value === 'trees' ||
    value === 'divide-conquer' ||
    value === 'dynamic-programming' ||
    value === 'greedy' ||
    value === 'backtracking' ||
    value === 'network-flow' ||
    value === 'linear-programming' ||
    value === 'searching'
  );
}

export function getCompareOptionsByCategory(category: AlgorithmCategory): AlgorithmMenuItem[] {
  return algorithmRegistry
    .filter(algorithm => algorithm.categories.includes(category))
    .map(algorithm => ({
      title: algorithm.title,
      slug: algorithm.slug,
      category: algorithm.categories[0],
    }));
}
