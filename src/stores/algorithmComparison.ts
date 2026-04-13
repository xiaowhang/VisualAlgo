import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  COMPARE_DEFAULT_CATEGORY,
  isAlgorithmCategory,
  normalizeComparePair,
} from '@/algorithms/registry';
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

export interface CompareSyncResult {
  left: string;
  right: string;
  category: AlgorithmCategory;
  needsRouteFix: boolean;
}

export const useAlgorithmComparisonStore = defineStore('algorithm-comparison', () => {
  const leftSlug = ref('');
  const rightSlug = ref('');
  const compareCategory = ref<AlgorithmCategory>(
    readStoredCompareCategory() ?? COMPARE_DEFAULT_CATEGORY
  );

  function applyRouteQuery(queryLeft: unknown, queryRight: unknown): CompareSyncResult {
    const rawLeft = typeof queryLeft === 'string' ? queryLeft : '';
    const rawRight = typeof queryRight === 'string' ? queryRight : '';
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

  function applySelectionChange(input: {
    nextLeft: string;
    nextRight: string;
    prevLeft: string;
    prevRight: string;
    queryLeft: unknown;
    queryRight: unknown;
  }): CompareSyncResult {
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

    const routeLeft = typeof input.queryLeft === 'string' ? input.queryLeft : '';
    const routeRight = typeof input.queryRight === 'string' ? input.queryRight : '';

    return {
      left: normalized.left,
      right: normalized.right,
      category: normalized.category,
      needsRouteFix: routeLeft !== normalized.left || routeRight !== normalized.right,
    };
  }

  return {
    leftSlug,
    rightSlug,
    compareCategory,
    applyRouteQuery,
    applySelectionChange,
  };
});
