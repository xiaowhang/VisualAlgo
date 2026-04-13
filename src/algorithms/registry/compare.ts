import type { AlgorithmCategory } from '@/types/algorithm';
import type { AlgorithmMenuItem } from '@/algorithms/registry/types';
import { algorithmMenuByCategory } from '@/algorithms/registry/algorithmMenu';
import { findAlgorithm } from '@/algorithms/registry/findAlgorithm';

export const COMPARE_DEFAULT_CATEGORY: AlgorithmCategory = 'sorting';

export function isAlgorithmCategory(value: string): value is AlgorithmCategory {
  return value === 'sorting' || value === 'graphs';
}

export function getCompareOptionsByCategory(category: AlgorithmCategory): AlgorithmMenuItem[] {
  return algorithmMenuByCategory[category];
}

export function resolveAlgorithmBySlug(slug: string) {
  if (!slug) {
    return null;
  }

  const sortingAlgorithm = findAlgorithm('sorting', slug);
  if (sortingAlgorithm) {
    return sortingAlgorithm;
  }

  return findAlgorithm('graphs', slug) ?? null;
}

function resolveFallbackCategory(preferredCategory?: AlgorithmCategory): AlgorithmCategory {
  if (preferredCategory && getCompareOptionsByCategory(preferredCategory).length > 0) {
    return preferredCategory;
  }

  if (getCompareOptionsByCategory(COMPARE_DEFAULT_CATEGORY).length > 0) {
    return COMPARE_DEFAULT_CATEGORY;
  }

  if (getCompareOptionsByCategory('graphs').length > 0) {
    return 'graphs';
  }

  return COMPARE_DEFAULT_CATEGORY;
}

function resolveFallbackPair(category: AlgorithmCategory) {
  const options = getCompareOptionsByCategory(category);
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
  preferredCategory?: AlgorithmCategory;
}) {
  const leftAlgorithm = resolveAlgorithmBySlug(input.leftSlug);
  const rightAlgorithm = resolveAlgorithmBySlug(input.rightSlug);

  let category = resolveFallbackCategory(input.preferredCategory);
  if (leftAlgorithm) {
    category = leftAlgorithm.category;
  } else if (rightAlgorithm) {
    category = rightAlgorithm.category;
  }

  const fallback = resolveFallbackPair(category);
  const options = getCompareOptionsByCategory(category);

  const normalizedLeft =
    leftAlgorithm && leftAlgorithm.category === category ? leftAlgorithm.slug : fallback.left;

  let normalizedRight =
    rightAlgorithm && rightAlgorithm.category === category ? rightAlgorithm.slug : fallback.right;

  if (normalizedRight === normalizedLeft && options.length > 1) {
    normalizedRight = options.find(item => item.slug !== normalizedLeft)?.slug ?? normalizedLeft;
  }

  return {
    category,
    left: normalizedLeft,
    right: normalizedRight,
  };
}
