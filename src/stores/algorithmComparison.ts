import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  COMPARE_DEFAULT_CATEGORY,
  isAlgorithmCategory,
  normalizeComparePair,
} from '@/algorithms/registry';
import {
  resolveCompareQuerySlug,
  type CompareRouteQueryValue,
  type CompareSelectionChangeInput,
  type CompareSyncResult,
} from '@/features/compare/types';
import type { AlgorithmCategory } from '@/types/algorithm';

const COMPARE_LAST_CATEGORY_KEY = 'algo-compare:last-category';

function readStoredCompareCategory(): AlgorithmCategory | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const rawValue = window.localStorage.getItem(COMPARE_LAST_CATEGORY_KEY);
  if (!rawValue || !isAlgorithmCategory(rawValue)) {
    return undefined;
  }

  return rawValue;
}

function storeCompareCategory(category: AlgorithmCategory) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(COMPARE_LAST_CATEGORY_KEY, category);
}

function normalizePair(rawLeft: string, rawRight: string, preferredCategory?: AlgorithmCategory) {
  return normalizeComparePair({
    leftSlug: rawLeft,
    rightSlug: rawRight,
    preferredCategory,
  });
}

export const useAlgorithmComparisonStore = defineStore('algorithm-comparison', () => {
  const leftSlug = ref('');
  const rightSlug = ref('');
  const compareCategory = ref<AlgorithmCategory>(
    readStoredCompareCategory() ?? COMPARE_DEFAULT_CATEGORY
  );

  function applyRouteQuery(
    queryLeft: CompareRouteQueryValue,
    queryRight: CompareRouteQueryValue
  ): CompareSyncResult {
    const rawLeft = resolveCompareQuerySlug(queryLeft);
    const rawRight = resolveCompareQuerySlug(queryRight);
    const normalized = normalizePair(rawLeft, rawRight, readStoredCompareCategory());

    compareCategory.value = normalized.category;
    leftSlug.value = normalized.left;
    rightSlug.value = normalized.right;
    storeCompareCategory(normalized.category);

    return {
      left: normalized.left,
      right: normalized.right,
      category: normalized.category,
      needsRouteFix: rawLeft !== normalized.left || rawRight !== normalized.right,
    };
  }

  function applySelectionChange(input: CompareSelectionChangeInput): CompareSyncResult {
    let candidateLeft = input.nextLeft;
    let candidateRight = input.nextRight;

    if (candidateLeft === candidateRight) {
      const leftChanged = candidateLeft !== input.prevLeft;
      const rightChanged = candidateRight !== input.prevRight;

      if (leftChanged && !rightChanged) {
        candidateRight = input.prevLeft;
      }

      if (rightChanged && !leftChanged) {
        candidateLeft = input.prevRight;
      }
    }

    const normalized = normalizePair(candidateLeft, candidateRight, compareCategory.value);

    compareCategory.value = normalized.category;
    leftSlug.value = normalized.left;
    rightSlug.value = normalized.right;
    storeCompareCategory(normalized.category);

    const routeLeft = resolveCompareQuerySlug(input.queryLeft);
    const routeRight = resolveCompareQuerySlug(input.queryRight);

    return {
      left: normalized.left,
      right: normalized.right,
      category: normalized.category,
      needsRouteFix: routeLeft !== normalized.left || routeRight !== normalized.right,
    };
  }

  function setPreferredCategory(category: AlgorithmCategory) {
    compareCategory.value = category;
    storeCompareCategory(category);
  }

  return {
    leftSlug,
    rightSlug,
    compareCategory,
    applyRouteQuery,
    applySelectionChange,
    setPreferredCategory,
  };
});
