import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  COMPARE_DEFAULT_GROUP,
  isComparisonGroup,
  normalizeComparePair,
} from '@/algorithms/registry';
import {
  resolveCompareQuerySlug,
  type CompareRouteQueryValue,
  type CompareSelectionChangeInput,
  type CompareSyncResult,
} from '@/features/compare/types';
import type { ComparisonGroup } from '@/types/algorithm';

const COMPARE_LAST_GROUP_KEY = 'algo-compare:last-group';

function readStoredCompareGroup(): ComparisonGroup | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const rawValue = window.localStorage.getItem(COMPARE_LAST_GROUP_KEY);
  if (!rawValue || !isComparisonGroup(rawValue)) {
    return undefined;
  }

  return rawValue;
}

function storeCompareGroup(group: ComparisonGroup) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(COMPARE_LAST_GROUP_KEY, group);
}

function normalizePair(rawLeft: string, rawRight: string, preferredGroup?: ComparisonGroup) {
  return normalizeComparePair({
    leftSlug: rawLeft,
    rightSlug: rawRight,
    preferredGroup,
  });
}

export const useAlgorithmComparisonStore = defineStore('algorithm-comparison', () => {
  const leftSlug = ref('');
  const rightSlug = ref('');
  const compareGroup = ref<ComparisonGroup>(readStoredCompareGroup() ?? COMPARE_DEFAULT_GROUP);

  function applyRouteQuery(
    queryLeft: CompareRouteQueryValue,
    queryRight: CompareRouteQueryValue
  ): CompareSyncResult {
    const rawLeft = resolveCompareQuerySlug(queryLeft);
    const rawRight = resolveCompareQuerySlug(queryRight);
    const normalized = normalizePair(rawLeft, rawRight, readStoredCompareGroup());

    compareGroup.value = normalized.group;
    leftSlug.value = normalized.left;
    rightSlug.value = normalized.right;
    storeCompareGroup(normalized.group);

    return {
      left: normalized.left,
      right: normalized.right,
      category: normalized.group,
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

    const normalized = normalizePair(candidateLeft, candidateRight, compareGroup.value);

    compareGroup.value = normalized.group;
    leftSlug.value = normalized.left;
    rightSlug.value = normalized.right;
    storeCompareGroup(normalized.group);

    const routeLeft = resolveCompareQuerySlug(input.queryLeft);
    const routeRight = resolveCompareQuerySlug(input.queryRight);

    return {
      left: normalized.left,
      right: normalized.right,
      category: normalized.group,
      needsRouteFix: routeLeft !== normalized.left || routeRight !== normalized.right,
    };
  }

  function setPreferredGroup(group: ComparisonGroup) {
    compareGroup.value = group;
    storeCompareGroup(group);
  }

  return {
    leftSlug,
    rightSlug,
    compareGroup,
    applyRouteQuery,
    applySelectionChange,
    setPreferredGroup,
  };
});
